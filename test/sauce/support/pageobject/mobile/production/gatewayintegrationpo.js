var wd = require('wd');
var Q = require('q');
var asserters = wd.asserters;
module.exports = {
    clickOnManageMyCourse: function (browser) {
        return browser
            .waitForElementByXPath("//table[@id='appTabList']//td[@id='Courses.label']/a", asserters.isDisplayed, 45000)
            .click();
    },
    clickOnContent: function (browser) {
        return browser
            .waitForElementByXPath("//li//span[contains(text(),'Content')]//parent::a", asserters.isDisplayed, 45000)
            .click();
    },

    selectMindLinksMenuItemFromTools: function (browser) {
        return browser
            .sleep(2000)
            .waitForElementByCss("#aitMenu_actionButton", asserters.isDisplayed, 60000)
            .click()
            .sleep(2000)
            .waitForElementByXPath("//a[@id='content-handler-resource/x-cengage-mindlinks']", asserters.isDisplayed, 60000)
            .click();
    },

    selectContentSource: function (browser, data) {

        //Note we need to switch to a frame before trying to search for elements inside iframe
        return browser
            .frame("myframe")
            .waitForElementByXPath("//a[text()='" + data + "']", asserters.isDisplayed, 60000)
            .click()
            .waitForElementByCss(".resultactionheading", asserters.isDisplayed, 60000);
    },
    selectProduct: function (browser, data) {

        //Note we need to switch to a frame before trying to search for elements inside iframe
        return browser
            .frame("myframe")
            .waitForElementByXPath("//a[text()='" + data + "']", asserters.isDisplayed, 60000)
            .click();
    },
    selectCreateCourseOptionAndFillTheFormAndContinue: function (browser, courseName) {

        return browser
            .waitForElementByXPath("//div[@id='createnew']/input", asserters.isDisplayed, 60000)
            .click()
            .sleep(3000)
            .waitForElementByCss("#startDateAsString", asserters.isDisplayed, 60000)
            .type((new Date()).toLocaleDateString("en-US"))
            .type(wd.SPECIAL_KEYS.Enter)
            .waitForElementByCss("#courseName", asserters.isDisplayed, 60000)
            .type(courseName)
            .waitForElementByCss("#endDateAsString", asserters.isDisplayed, 60000)
            .type("01/01/2018")
            .type(wd.SPECIAL_KEYS.Enter)
            .waitForElementByCss("#timezoneId option:nth-child(12)", asserters.isDisplayed, 10000)
            .click()
            .waitForElementByCss("#continuebutton", asserters.isDisplayed, 10000)
            .click();

    },

    link4LTRCourse: function (browser) {

        return browser
            .waitForElementByCss(".resultactionmessage", asserters.isDisplayed, 10000)
            .waitForElementByCss("#continuebutton", asserters.isDisplayed, 10000)
            .click();

    },

    add4LTRCourseLinkToContentFolder: function (browser) {

        return browser
            .waitForElementByCss("#pageTitleText", asserters.isDisplayed, 10000)
            .waitForElementByCss("div.submitStepTop .submit.button-1", asserters.isDisplayed, 10000)
            .click()
            .sleep(30000);

    },


    getExistingMindlinkId: function (browser, courseName) {

        return browser
            .waitForElementByXPath("//a[@title='" + courseName + " item options']", asserters.isDisplayed, 20000)
            .getAttribute("id");


    },

    deleteExistingMindlink: function (browser, extractedDeleteId, courseName) {

        return browser
            .execute("window.oldConfirm = window.confirm;" + "window.confirm = function(){return true;}")
            .waitForElementByXPath("//a[@title='" + courseName + " item options']", asserters.isDisplayed, 20000)
            .click()
            .waitForElementByXPath("//a[@id='remove_" + extractedDeleteId + "']", asserters.isDisplayed, 20000)
            .click();

    },

    validateSYncToLmsSTatus: function (browser) {
      return browser
      .waitForElementByCss("#resync-grades-button", asserters.isDisplayed, 60000);
    },

    clickSYncToLmsButton: function (browser) {
      return browser
      .waitForElementByCss("#resync-grades-button", asserters.isDisplayed, 60000)
      .click();
    },

    getLMSButtonText: function (browser) {
      return browser
      .waitForElementByCss("#resync-grades-button", asserters.isDisplayed, 60000)
      .text().should.eventually.include("SYNC TO LMS");
    },

    checkIfAssignmentAdded: function(browser,assignmentName) {
      return browser
      .waitForElementByXPath("//a[text()='" + assignmentName + "']//i[1]", asserters.isDisplayed, 60000)
      .click()
      .waitForElementByXPath("//div[@class='buttons'][2]//a[contains(text(),'Confirm Selections')]", asserters.isDisplayed, 60000)
      .click();
    },

    saveTheSelection: function(browser) {
      return browser
      .waitForElementByXPath("//div[@id='confirmBox']/div[contains(@class,buttons)]/a[contains(text(),'Save')]", asserters.isDisplayed, 60000)
      .click()
      .waitForElementByXPath(".//*[@id='top_submitButtonRow']/input[contains(text(),submit)][2]", asserters.isDisplayed, 60000)
      .click();
    },
    clickOnGradeCenter: function(browser) {
      return browser
      .sleep(2000)
      .waitForElementByXPath("//a[text()='Grade Center']", asserters.isDisplayed, 60000)
      .click()
      .waitForElementByXPath("//a[text()='Full Grade Center']", asserters.isDisplayed, 60000)
      .click()
      .waitForElementByXPath("//a[text()='Assignments']", asserters.isDisplayed, 60000)
      .click();
    },

    verifyIfAssignmentAdded: function(browser,assignmentName) {
      return browser
      .hasElementByXPath("//div[text()='" + assignmentName + "']");
    }
};
