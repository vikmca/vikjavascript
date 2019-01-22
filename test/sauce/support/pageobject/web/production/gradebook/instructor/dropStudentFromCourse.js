var wd = require('wd');
var asserters = wd.asserters;
var stringutil = require("../../../../../../util/stringUtil");
var testData = require("../../../../../../../../test_data/data.json");
module.exports = {

  checkDropStudentButtonBackgroundColour: function (browser) {
      return browser
      .execute("return window.getComputedStyle(document.querySelector('.drop-student-button')).getPropertyValue('background-color')");
  },

  checkifButtonIsAvailable: function(browser) {
      return browser
      .waitForElementByCss(".drop-student-button", asserters.isDisplayed, 60000);
  },

  clickOnDropStudentButton: function(browser) {
    return browser
    .waitForElementByCss(".drop-student-button", asserters.isDisplayed, 60000)
    .click();
  },

  checkIfDialogueBoxappearsOnClickingDropButton: function(browser) {
    return browser
    .waitForElementByCss(".cg-modal.danger", asserters.isDisplayed, 60000)
    .click();
  },

  validateDialogueBox: function (browser) {
      return browser
      .waitForElementByCss(".cg-modal.danger section div", asserters.isDisplayed, 10000);

  },

  clickOnCancelOnDialogueBox: function(browser) {
    return browser
    .waitForElementByCss(".cancel", asserters.isDisplayed, 10000)
    .click()
    .waitForElementByCss(".student-detail.ng-scope",asserters.isDisplayed, 10000);
  },

  checkIfBackButtonIsPresent: function(browser) {
      return browser
      .waitForElementByCss(".back-button.ng-scope",asserters.isDisplayed, 10000);
  },

  clickOnYesUnderDialogueBox: function(browser) {
    return browser
      .waitForElementByCss("#drop-student .confirm.ng-binding",asserters.isDisplayed, 10000).click().sleep(2000)
        .waitForElementByXPath("//div[@class='gradebook ng-scope']//h1",asserters.isDisplayed, 10000);
  },

  checkIfExportButtonIsPresent: function(browser) {
    return browser
      .waitForElementByCss(".button-link",asserters.isDisplayed, 10000);
  },

  checkIfCourseIsPresentAfterDropedStudent: function(browser,coursename) {
    if(stringutil.removeBoundaryQuotes(process.env.RUN_FOR_REGION.toString()) == "ASI"){
       return browser
         .hasElementByXPath("//li[@class='dashboard_label']//span[contains(text(),'" + coursename + "')]",asserters.isDisplayed, 10000);
     }else{
       return browser
         .hasElementByCss(".dropdown.courseDisabled");
     }
  },

  getTextIfNoCourseIsPresent: function(browser) {
   if(stringutil.removeBoundaryQuotes(process.env.RUN_FOR_REGION.toString()) == "ASI"){
      return browser
        .waitForElementByCss(".h1-3.darkblue",asserters.isDisplayed, 10000)
        .text().should.eventually.include(testData.DropCourseStudent.dropCourseFromStudent.dashboardText);
    }else{
      return browser
        .waitForElementByCss(".dropdown.courseDisabled",asserters.isDisplayed, 10000);
    }

  },

  checkIfDropdownClassstatusIsHide: function(browser) {
     return browser
      .hasElementByXPath("//dialog[@class='cg-modal danger ng-hide']",asserters.isDisplayed, 10000);
  }
  };
