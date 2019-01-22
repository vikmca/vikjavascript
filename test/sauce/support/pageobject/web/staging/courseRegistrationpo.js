var wd = require('wd');
var asserters = wd.asserters;
var stringutil = require("../../../../util/stringUtil");

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
  clickOnContinueButton: function (browser, url) {
    if(stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString())==="safari"){
      return browser
        .sleep(2000)
        .waitForElementByCss("#apliaContinueForm .small_green_button",asserters.isDisplayed,60000)
        .click()
        .sleep(3000)
        .get(url);
    }else {
      return browser
        .waitForElementByCss("#apliaContinueForm .small_green_button",asserters.isDisplayed,60000)
        .click()
        .sleep(3000)
        .refresh();
    }
  }
};
