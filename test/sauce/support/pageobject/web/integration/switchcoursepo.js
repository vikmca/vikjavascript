var wd = require('wd');
var string = require('../../../../util/stringUtil');
var report = require("../../../../support/reporting/reportgenerator");
var asserters = wd.asserters;
module.exports = {
    clickOnSwitchCourseLink: function(browser){
        return browser
            .waitForElementByCss("#switch-courses", asserters.isDisplayed, 60000)
            .click()
            .sleep(4000);
    },
    hiddenStatusOfSwitchCourseWindow: function(browser){
        return browser
            .hasElementByCss("#switch-courses-modal.ng-hide");
    },

    presentStatusOfSwitchCourseLink: function(browser){
        return browser
            .hasElementByCss("#switch-courses");
    },

    presentStatusOfSwitchCourseWindow: function(browser){
        return browser
            .hasElementByXPath("//dialog[contains(@id,'switch-courses-modal') and not(contains(@class,'ng-hide'))]");
    },

    getHeaderTextOfSwitchCourseWindow: function(browser){
        return browser
            .waitForElementByCss("#switch-courses-modal header h2", asserters.isDisplayed, 60000).text();
    },

    getHeaderImage: function(browser){
        return browser
            .execute("return getComputedStyle(document.querySelector(\".cg-modal.basic > div header\")).getPropertyValue('background-image')");
    },

    getCourseCountOnSwitchWindow:  function(browser){
        return browser
        .waitForElementsByCss(".basicListItem a", asserters.isDisplayed, 60000);
    },
    clickOnFirstCourseLink:  function(browser){
        return browser
        .waitForElementByXPath("(//div[@class='basicListItem']//a)[1]", asserters.isDisplayed, 60000)
        .click();
    },
    courseSwichButtonHidden: function(browser){
        return browser
            .sleep(3000)
            .hasElementByCss(".course-switcher-menuitem.hidden #switch-courses");
    },

    validateCloseButtonPresenceStatus: function(browser){
        return browser
            .hasElementByCss(".basic button.cancel");
    },

    clickOnCloseButton: function(browser){
        return browser
            .waitForElementByCss(".basic button.cancel", asserters.isDisplayed, 60000)
            .click();
    }

};
