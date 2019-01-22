var wd = require('wd');
var asserters = wd.asserters;
var loginPage = require('./loginpo');
var stringutil = require("../../../../util/stringUtil");
var report = require("../../../../support/reporting/reportgenerator");
var browserName;
browserName = stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString())
module.exports = {

    userSignOut: function (browser, done) {
          return  browser
                .sleep(1000)
                .waitForElementByCss("nav.user-profile > .dropdown .dropdown-link", asserters.isDisplayed, 60000).then(function () {
                  return  browser
                        .waitForElementByCss("nav.user-profile > .dropdown .dropdown-link", asserters.isDisplayed, 60000)
                        .click()
                        .sleep(1000)
                        .waitForElementByXPath("//div[contains(text(),'Sign Out')]", asserters.isDisplayed, 60000)
                        .click()
                        .sleep(2000)
                        .waitForElementByCss("div.logo a[href*=cengagebrain]", asserters.isDisplayed, 60000)
                        .then(function () {

                            if (stringutil.removeBoundaryQuotes(process.env.RUN_FOR_STUDENT_USERID.toString()) != 'default') {

                                if (loginPage.getCurrentUsertype() === 'student') {


                                  return browser.window("childWindow").close().then(function () {

                                      return browser.sleep(10000)
                                            .window(loginPage.getCengageBrainHandle()).waitForElementByXPath("//div[contains(text(),'Log Out')]", asserters.isDisplayed, 60000)
                                            .click()
                                            .nodeify(done);
                                    })


                                } else {
                                    return done();
                                }

                            } else {
                                return done();
                            }
                        });
                });

    },
        signOutFromSSO: function(userType, browser){
           if(userType === "instructor"){
             return browser
               .sleep(5000)
               .execute("window.scrollTo(0,0)")
               .sleep(1000)
               .waitForElementByXPath("//a[contains(text(),'Sign Out')]", asserters.isDisplayed, 60000)
               .click()
               .hasElementByXPath("//*[@aria-labelledby='ui-dialog-title-loading'][contains(@style,'block')]").then(function(displaystatus){
                   if(displaystatus){
                       console.log(report.reportHeader()
                       + report.stepStatusWithData("Unwanted popup appears on logout page", displaystatus, "failure")
                       + report.reportFooter());
                       return browser
                        .refresh()
                        .sleep(6000)
                   }
                 });
           }else {
             return browser
                .sleep(5000)
                .execute("window.scrollTo(0,0)")
                .sleep(1000)
                .waitForElementByXPath("//div[@class='loggedInContainer']//a[contains(text(),'Log Out')]", asserters.isDisplayed, 60000)
                .click()
                .hasElementByXPath("//*[@aria-labelledby='ui-dialog-title-loading'][contains(@style,'block')]").then(function(displaystatus){
                    if(displaystatus){
                        console.log(report.reportHeader()
                        + report.stepStatusWithData("Unwanted popup appears on logout page", displaystatus, "failure")
                        + report.reportFooter());
                        return browser
                         .refresh()
                         .sleep(6000)
                    }
                });
           }
        },

      validateLogoutButtonStatusOnSSO: function(userType, browser){
        if (userType === "instructor") {
          return browser
          .hasElementByXPath("//a[contains(text(),'Sign Out')]");
        }else {
          return browser
          .hasElementByXPath("//div[@class='loggedInContainer']//a[contains(text(),'Log Out')]");
        }
      },

    clickOnUserProfile: function (browser, done) {
          if (process.env.RUN_IN_BROWSER.toString() === "\"internet explorer\"") {
            return  browser
                  .sleep(2000)
                  .waitForElementByCss("nav.user-profile > .dropdown .dropdown-link", asserters.isDisplayed, 60000).then(function () {
                    return  browser
                          .waitForElementByCss("nav.user-profile > .dropdown .dropdown-link", asserters.isDisplayed, 60000)
                          .click()
                          .sleep(2000);
                  });
        }else{
          return  browser
                .sleep(1000)
                .waitForElementByCss("nav.user-profile > .dropdown .dropdown-link", asserters.isDisplayed, 60000).then(function () {
                  return  browser
                        .waitForElementByCss("nav.user-profile > .dropdown .dropdown-link", asserters.isDisplayed, 60000)
                        .click();
                });
       }

    }
};
