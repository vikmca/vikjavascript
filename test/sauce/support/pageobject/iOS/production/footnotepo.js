var wd = require('wd');
var asserters = wd.asserters;
var report = require("../../../../support/reporting/reportgenerator");
var _ = require('underscore');
module.exports = {

    clickonFirstFootNote: function(browser,done){
       return browser
               .waitForElementsByXPath("//div[contains(@class,'reader')]//a[@class='footnoteref']").then(function (footnote) {
               console.log(_.size(footnote));
               if(_.size(footnote)){
                 return browser
                 .waitForElementByXPath("(//a[@class='footnoteref'])[1]", asserters.isDisplayed, 90000).then(function(footnotes){
                   return browser
                   .getLocationInView(footnotes)
                   .execute("window.scrollBy(0,-140)")
                   .sleep(1000)
                   .execute("return document.getElementsByClassName('footnoteref')[0].click()")
                   .sleep(1000)
                   .waitForElementByCss(".footnote-content.is-visible p", asserters.isDisplayed, 90000)
                   .text()
                    .then(function(footnotetext){
                    console.log(footnotetext);
                     if(footnotetext != "undefined"){
                       return browser
                         .hasElementByXPath("(//div[contains(@class,'footnote-content is-visible')])[1]//a").then(function(footnoteStatus){
                           if(footnoteStatus){
                            console.log(footnoteStatus);
                               console.log(report.reportHeader() +
                               report.stepStatusWithData("Link is available on fisrt footnote and able to open with next tab","","success") +
                               report.reportFooter());
                               done();
                           }else {
                             console.log(report.reportHeader() +
                             report.stepStatusWithData("No link is available on fisrt footnote ","","success") +
                             report.reportFooter());
                             done();
                           }
                         });
                       }
                     });
                   });
               }else{
                   console.log(report.reportHeader() +
                   report.stepStatusWithData("No Footnote were available on this topic Count came out to be ",0,"failure") +
                   report.reportFooter());
                 }
           });
    }
};
