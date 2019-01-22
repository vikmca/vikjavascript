var wd = require('wd');
var asserters = wd.asserters;
var loginPage = require('./loginpo');
var stringutil = require("../../../../util/stringUtil");
var report = require("../../../../support/reporting/reportgenerator");
var browserName;
browserName = stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString())
module.exports = {

    userSignOut: function (browser, done) {
        if (browserName === 'internet explorer') {
            browser
                .sleep(2000)
                .waitForElementByCss(".dropdown-link>.user-name.ng-binding", asserters.isDisplayed, 60000)
                .sleep(5000)
                .click()
                .waitForElementByCss("#signout", asserters.isDisplayed, 60000).click()
                .nodeify(done);
        } else {
            browser
                .sleep(1000)
                .waitForElementByCss("nav.user-profile > .dropdown .dropdown-link", asserters.isDisplayed, 60000).then(function () {
                    browser
                        .waitForElementByCss("nav.user-profile > .dropdown .dropdown-link", asserters.isDisplayed, 60000)
                        .click()
                        .waitForElementByXPath("//div[contains(text(),'Sign Out')]", asserters.isDisplayed, 60000)
                        .click()
                        .waitForElementByCss("div.logo a[href*=cengagebrain]", asserters.isDisplayed, 60000)
                        .then(function () {

                            if (stringutil.removeBoundaryQuotes(process.env.RUN_FOR_STUDENT_USERID.toString()) != 'default') {

                                if (loginPage.getCurrentUsertype() === 'student') {


                                    browser.window("childWindow").close().then(function () {

                                        browser.sleep(10000)
                                            .window(loginPage.getCengageBrainHandle()).waitForElementByXPath("//div[contains(text(),'Log Out')]", asserters.isDisplayed, 60000)
                                            .click()
                                            .sleep(2000)
                                            .close()
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
        }

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
    }
};
