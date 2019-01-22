var wd = require('wd');
var asserters = wd.asserters;
var testData = require("../../../../../../test_data/data.json");
module.exports = {

  clickOnProfileDropdownList: function(browser){
    return browser
   .waitForElementByCss(".dropdown-link", asserters.isDisplayed, 60000)
   .click();

 },
 checkIfDropCourseOptionIsAvailable: function(browser){
   return browser
   .waitForElementByCss("#drop-course", asserters.isDisplayed, 60000);
 },
 clickOnDropCourseOption: function(browser){
   return browser
   .waitForElementByCss("#drop-course", asserters.isDisplayed, 60000)
   .click();

 },
  checkIfdialogueBoxContainsText: function(browser){
    return browser
    .waitForElementByCss(".cg-modal.danger .content div", asserters.isDisplayed, 60000);
  },

  checkIfCancelButtonIsPresentOnDialogueBox: function(browser){
    return browser
    .waitForElementByCss("#confirm-drop-course .cancel.ng-binding", asserters.isDisplayed, 60000)
    .text()
    .should.eventually.include(testData.DropStudent.dropStudentFromCourse.cancelTextOndialogue);
  },

  checkIfYesButtonIsPresentOnDialogueBox: function(browser){
    return browser
    .waitForElementByCss("#confirm-drop-course .confirm.ng-binding", asserters.isDisplayed, 60000)
    .text()
    .should.eventually.include(testData.DropStudent.dropStudentFromCourse.confirmTextOndialogue);
  },

  checkIfcourseIsDroppedanddialogueBoxAppears: function(browser){
    return browser
    .waitForElementByCss("#confirm-drop-course .confirm.ng-binding", asserters.isDisplayed, 60000)
    .click()
    .waitForElementByCss("#confirm-logout header h2", asserters.isDisplayed, 60000)
    .text().should.eventually.include(testData.DropStudent.dropStudentFromCourse.afterCoursedroppedTextOnDialogueBox)
    .waitForElementByCss("#confirm-logout section div", asserters.isDisplayed, 60000);
  },

    checkIfOkButtonIsPresentOnDialogueBoxAfterCourseDropped: function(browser){
      return browser
      .waitForElementByCss("#confirm-logout .confirm.ng-binding", asserters.isDisplayed, 60000)
      .text().should.eventually.include(testData.DropStudent.dropStudentFromCourse.okTextOndialogueBox);
    },
     clickOnOkPresentOndialogueBox: function(browser){
       return browser
       .waitForElementByCss("#confirm-logout .confirm.ng-binding", asserters.isDisplayed, 60000)
       .click();
     },
    checkIfStudentLoggedOut: function(browser){
        return browser
          .waitForElementByCss("#createNew>h2", asserters.isDisplayed, 60000);

    }


  };
