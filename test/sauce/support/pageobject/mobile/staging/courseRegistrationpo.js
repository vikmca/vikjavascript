var wd = require('wd');
var asserters = wd.asserters;

module.exports = {

  enterCourseKey : function(browser,courseKey){
    return browser
      .waitForElementByCss("#registerAccessCode",asserters.isDisplayed,6000)
      .type(courseKey);
  },
  clickOnRegistration: function (browser) {
    return browser
      .waitForElementByCss(".viewDetailsBtn.register_button",asserters.isDisplayed,6000)
      .click();
  },
  getEditCourseKeyText: function(browser) {
    return browser
      .waitForElementByCss(".minwidth>tbody>tr>td>a",asserters.isDisplayed,6000)
      .text();
  },
  clickOnContinueButton: function (browser) {
    return browser
      .waitForElementByCss("#apliaContinueForm .small_green_button",asserters.isDisplayed,6000)
      .click();
  }
};
