var wd = require('wd');
var asserters = wd.asserters;

module.exports = {
  getReadingAstVideoElement: function(browser, assignmentName){
    return browser
      .sleep(1000)
      .waitForElementsByXPath("(//div[@class='details']//div[contains(@class,'title') and contains(.,'"+assignmentName+"')]//following-sibling::div//div[@ng-if='video.selected']//a)", asserters.isDisplayed, 60000);
  },
  verifyChapterReadingAssignmentPresentOnStudentEnd : function(browser, astname){
    return browser
        .waitForElementByXPath("//div[@class='details']//div[contains(@class,'title') and contains(.,'" + astname + "')]", asserters.isDisplayed, 60000);
  },
  verifyChapterReadingAssignmentTopicPresentOnStudentEnd : function(browser, topic){
        return browser
             .waitForElementByXPath("(//a[contains(@class,'assignment-link ng-scope')and contains(.,'" + topic + "')])[1]", asserters.isDisplayed, 60000);

  },

  verifyTopicsCountOnPresentOnStudentEnd : function(browser, topic){
        return browser
             .waitForElementsByXPath("(//a[contains(@class,'assignment-link ng-scope')and contains(.,'" + topic + "')])", asserters.isDisplayed, 60000);
  },

  verifyVideosCountPresentOnStudentEnd : function(browser, video){
        return browser
             .waitForElementsByXPath("(//a[contains(@class,'assignment-link ng-binding')and contains(.,'" + video + "')])", asserters.isDisplayed, 60000);

  }

};
