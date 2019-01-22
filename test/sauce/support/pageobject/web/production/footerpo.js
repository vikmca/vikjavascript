var wd = require('wd');
var asserters = wd.asserters;
var report = require("../../../../support/reporting/reportgenerator");
var _ = require('underscore');
var testData = require("../../../../../../test_data/data.json");
var stringutil = require("../../../../util/stringUtil");
module.exports = {

    findCopyrightElementCount: function (browser) {
        return browser
          //.execute("document.getElementsByTagName('footer')[0].scrollIntoView()")
          .waitForElementsByCss(".copyright-labels.ng-scope", asserters.isDisplayed, 30000).then(function(footer){
            return browser
            .getLocationInView(footer)
            .waitForElementsByCss("footer>ul>li>a",asserters.isDisplayed,20000);
          });
    },
    openAllTabs: function (browser,linkNumber, urlContent){
      if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString()) === "safari" || stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString()) === "firefox") {
         return browser
           .waitForElementByXPath("(//footer//ul//li//a)["+linkNumber+"]",asserters.isDisplayed,20000)
           .click()
           .sleep(5000)
           .windowHandles()
           .then(
           function (handle) {
               cengageBrain = handle[1];
               return  browser
                   .sleep(3000)
                   .window(cengageBrain)
                    .sleep(3000)
                    .execute("return window.location.href")
                  //  .url()
                    .then(function(currentUrl){
                     console.log("currentUrl"+currentUrl);
                     if(currentUrl.indexOf(urlContent)>-1){
                       return  browser
                       .sleep(4000)
                       .close()
                       .window(handle[0]);
                     }
                   });
                 });
     }else{
      return browser
        .waitForElementByXPath("(//footer//ul//li//a)["+linkNumber+"]",asserters.isDisplayed,20000)
        .click()
        .sleep(3000)
        .windowHandles()
        .then(
        function (handle) {
            cengageBrain = handle[1];
            return  browser
                .window(cengageBrain)
                .url().then(function(currentUrl){
                  if(currentUrl.indexOf(urlContent)>-1){
                    return  browser
                    .sleep(3000)
                    .close()
                    .window(handle[0]);
                  }
                });
              });
        }
    },
  getCopyrightCount: function (browser, done){
      var i=0;
    this.findCopyrightElementCount(browser)
    .then(function(copyrightElement){
      if(_.size(copyrightElement) === 5){
        verifyCopyright();
        function verifyCopyright(){
          if(i<_.size(copyrightElement)){
            copyrightElement[i].text().then(function(copyrightText){
              copyrightElement[i].getAttribute("href").then(function(targetAttribute){
                if(copyrightText === testData.copyrightTerms.textLabel[i]){
                  if(targetAttribute === testData.copyrightTerms.targetAttribute[i]){
                    console.log(report.reportHeader() +
                    report.stepStatusWithData("Copyright label at position "+i+" is "+copyrightText+"  and target is",targetAttribute,"success") +
                    report.reportFooter());
                    i++;
                    verifyCopyright();
                  }
                }
              });
            })
          }else {
            if(i===5){
              console.log(report.reportHeader() +
              report.stepStatusWithData("Count of Copyright labels are",_.size(copyrightElement),"success") +
              report.reportFooter());
              done();
            }else {
              console.log(report.reportHeader() +
              report.stepStatusWithData("All Copyright labels are not","present","failure") +
              report.reportFooter());
            }
          }
        }
      }else {
        console.log(report.reportHeader() +
        report.stepStatusWithData("All Copyright labels are not","present","failure") +
        report.reportFooter());
      }
    });
  }
};
