var wd = require('wd');
var asserters = wd.asserters;
var fs = require('fs');
var report = require("../support/reporting/reportgenerator");
var stringutil = require("./stringUtil");
module.exports = {

acceptAlerts : function(browser,status){
    return browser
      .sleep(5000)
      .execute("window.oldConfirm = window.confirm;"+"window.confirm = function(){return "+status+";}");
    },

    acceptAlertsOnGatewayIntergation : function(browser,status){
        return browser
          .execute("window.oldConfirm = window.confirm;window.confirm = function(){return "+status+";}");
        },

    takeScreenshot :  function (browser, scriptName){
      if(stringutil.removeBoundaryQuotes(process.env.SCREENSHOT_STATUS.toString()) ==="yes"){
        return  browser.takeScreenshot(browser, scriptName).then(
          function(image) {
            var timestamp = Date.now();
            fs.writeFile('screenshot/' + scriptName + timestamp + '.png', image, 'base64');
            console.log(report.reportHeader()
              + report.stepStatusWithData("Refer screenshot under 'screenshot' folder and name of the screenshot is :: " + scriptName + timestamp + '.png', "success")
              + report.reportFooter());
          });
      }
    },

    handleFeedbackPopup : function(browser){
      return browser
      .hasElementByCss(".QSIPopOver.SI_efH9LFdAPEJTF8p_PopOverContainer").then(function(displaystatus){
           if(displaystatus){
              console.log(report.reportHeader()
              + report.stepStatusWithData("Feedback popup appears on assignment page", displaystatus, "success")
              + report.reportFooter());
               return browser
               //$('[src*=IM_3pUwl6ck8t3V8oI]').click() TRY THIS  WORKING
                  //.execute("$('[src*=IM_3pUwl6ck8t3V8oI]').click();")
                //    .waitForElementByXPath("div//img[contains(@src,'IM_3pUwl6ck8t3V8oI')]", asserters.isDisplayed, 30000)
                //    .click()
                   .execute("return document.querySelector('[src*=IM_3pUwl6ck8t3V8oI]').click()")
            //   .execute("return document.querySelector('[src*=IM_3pUwl6ck8t3V8oI]').click()")

                //   .waitForElementByXPath("div//img[contains(@src,'IM_3pUwl6ck8t3V8oI')]", asserters.isDisplayed, 30000)
                  // .click()
                   .sleep(1000)
                   .windowHandles().then(function (handles) {
                     var feedbackPopUp = handles[1];
                       return  browser
                           .then(function(){
                             return browser
                               .sleep(2000)
                               .window(handles[1])
                               .waitForElementByXPath("//span[contains(text(),'Decide if I want to purchase access to a course')]", asserters.isDisplayed, 60000)
                               .click()
                               .sleep(4000)
                               .waitForElementByXPath("//input[@id='NextButton']", asserters.isDisplayed, 60000)
                               .click()
                               .sleep(2000)
                               .window(handles[0])
                               .sleep(3000);
                           });
                     });
            }
       });
    }


};
