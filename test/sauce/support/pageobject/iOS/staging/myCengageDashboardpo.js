var wd = require('wd');
var asserters = wd.asserters;

var testData = require("../../../../../../test_data/data.json");

module.exports = {
    verifyMyCengageDashboard: function (browser) {
            return browser
                .hasElementByXPath("//a[contains(text(),'My Dashboard')]");
    },

    clickOnAddCourseLink: function(browser){
        return browser
            .sleep(4000)
            .waitForElementByCss(".addRegister a", asserters.isDisplayed, 60000)
            .click();
    },

    enterCourseKey : function(browser,courseKey){
    return browser
      .waitForElementByCss("#accessCode",asserters.isDisplayed,6000)
      .type(courseKey);
    },

    clickOnSubmitBtn : function(browser){
    return browser
      .waitForElementByCss(".ng-valid-parse .form-submit button",asserters.isDisplayed,6000)
      .click();
    },

    enterTheNewCourse : function(browser){
    return browser
      .waitForElementByCss(".btn.signInBtn",asserters.isDisplayed,6000)
      .click();
    },

    validateCourseName: function(userType, courseName, browser){
        if (userType === "instructor") {
            return browser
                .hasElementByXPath("//a[contains(@data-track-ext,'" + courseName + "')]");
        }
        else {
             return browser
                 .sleep(5000)
                 .hasElementByXPath("//p[contains(text(),'" + courseName + "')]");
        }
    },

    validateEditedCourseName: function(userType, courseName, browser){
        if (userType === "instructor") {
            return browser
                .hasElementByXPath("//a[contains(@data-track-ext,'" + courseName + "')]");
        }
        else {
             return browser
                 .sleep(5000)
                 .hasElementByXPath("//h2[contains(text(),'" + courseName + "')]");
        }
    },

    validateLogoutButtonStatusOnSSO: function(userType, browser){
        if (userType === "instructor") {
          return browser
          .hasElementByXPath("//a[contains(text(),'Sign Out')]");
        }else {
          return browser
          .waitForElementByXPath("//a[contains(@class,'dropdown-toggle')]", asserters.isDisplayed, 60000)
          .click()
          .hasElementByXPath("//a[contains(text(),'Sign out')]");
        }
    },

    signOutFromSSO: function(userType, browser){
        if (userType === "instructor") {
          return browser
          .waitForElementByXPath("//a[contains(text(),'Sign Out')]")
           .click();
        }else {
          return browser
          .waitForElementByXPath("//a[contains(text(),'Sign out')]", asserters.isDisplayed, 60000)
          .click();
        }
    },

    clcikOnCourse: function(browser, courseName){
        return browser
        .sleep(4000)
        .waitForElementByXPath("//h2[contains(text(),'"+courseName+"')]",asserters.isDisplayed, 40000)
        .click()
        .sleep(1000);
    }

};
