var wd = require('wd');
var asserters = wd.asserters;

module.exports = {

  validateAssignments: function (browser, assignmentName) {
    console.log("assignmentName::"+assignmentName);
    return browser
      .sleep(1000)
      .waitForElementByXPath("(//div[contains(@class,'cg-calendar ng-isolate-scope')]//div[contains(@class,'day ng-scope today')])[1]//div[contains(@class,'event')]//span[contains(.,'"+assignmentName+"')]", asserters.isDisplayed, 60000);
  },

  validateAssignmentsNextMonth: function (browser, assignmentName) {
    console.log("assignmentName::"+assignmentName);
      return browser
        .sleep(1000)
        .waitForElementByXPath("(//div[contains(@class,'cg-calendar ng-isolate-scope')])[1]//div[contains(@class,'event')]//span[contains(.,'"+assignmentName+"')]", asserters.isDisplayed, 60000);
  },
  clickOnEditIcon: function (browser, courseName) {
             return browser
                  .waitForElementByXPath("//td[contains(.,'  "+courseName+"')]/following-sibling::td/a[contains(@title,'Edit Course')]", asserters.isDisplayed, 60000).then(function(editCourse){
                    return browser
                    .getLocationInView(editCourse)
                    .waitForElementByXPath("//td[contains(.,'   "+courseName+"')]/following-sibling::td/a[contains(@title,'Edit Course')]", asserters.isDisplayed, 60000)
                    .click();
          });
  },
  getCourseKey : function(browser){
    return browser
      .waitForElementByXPath("(//form[@id='createCourseForm']//label[@for='courseKey'])[2]",asserters.isDisplayed, 30000).text();
  }


};
