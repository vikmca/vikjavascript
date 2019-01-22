var wd = require('wd');
var asserters = wd.asserters;

module.exports = {
    navigateToNextMonth: function (browser) {
        return browser
            .execute('window.scrollTo(0,0)')
            .sleep(1000)
            .waitForElementByCss(".container .cg-calendar .next", asserters.isDisplayed, 10000)
            .click();
    },
    validateAssignmentIsPresentOnStudentCalendar: function(browser, assignmentName) {
      return browser
        .waitForElementByXPath("//span[contains(@class,'assessment-title')]/div[contains(text(),'"+assignmentName+"')][1]", asserters.isDisplayed, 30000);
    },

    validateDetailedPanelClass: function(browser) {
      return browser
        .waitForElementByXPath("//div[contains(@class,'assignment-details')]", asserters.isDisplayed, 10000).getAttribute("class");
    },

    clickOnCloseButton: function(browser) {
      return browser
        .waitForElementByCss(".assignment-details .close", asserters.isDisplayed, 10000).then(function(scrollToCloseIcon){
          return browser
          .getLocationInView(scrollToCloseIcon)
          .waitForElementByCss(".assignment-details .close", asserters.isDisplayed, 10000)
          .click();
        });

    },

    validateDetailedPanelClosed: function(browser) {
      return browser
        .sleep(5000)
        .hasElementByXPath("//div[@class='assignment-details ng-hide']");
    },

    clickOnCurrentDateCellFromNextMonth: function (browser) {
        return browser
            .waitForElementByXPath("(//div[contains(@class,'week ng-scope')]//div[contains(@class,'day ng-scope')])//a[@class='assignment-due']//parent::div", asserters.isDisplayed, 60000)
            .click();
    },

    verifyAssignmentNotPresentOnCurrentDate: function (browser, astcount) {
      return browser
        .hasElementByXPath("//div[contains(@class,'today') and contains(@class,'selected')]//a//span[contains(text(),'"+astcount+"')]");
    },

    getTextOfAttempt: function (browser) {
      return browser
        .waitForElementByCss(".attempts span", asserters.isDisplayed, 30000);
    },

    clickOnNextMonthFirstDate: function (browser) {
        return browser
            .waitForElementByXPath("//div[@class='day ng-scope']/span[contains(@class,'number') and (text()='1')]//following-sibling::a[@class='assignment-due']", asserters.isDisplayed, 10000)
            .isDisplayed()
            .waitForElementByXPath("//div[@class='day ng-scope']/span[contains(@class,'number') and (text()='1')]//following-sibling::a[@class='assignment-due']", asserters.isDisplayed, 10000)
            .click();
    },

    launchAssignment: function (browser, assignmentName) {
          return browser
          .waitForElementByCss(".assignment-details", asserters.isDisplayed, 15000)
          .waitForElementByXPath("//span[contains(@class,'assessment-title')]/div[contains(text(),'"+assignmentName+"')][1]", asserters.isDisplayed, 30000)
          .sleep(1000)
          .click()
          .waitForElementByCss(".confirm.ng-binding", asserters.isDisplayed, 10000)
          .click();
    },

    clickOnCurrentDateCell: function (browser) {
        return browser
            .sleep(2000)
            .waitForElementByCss(".day.ng-scope.today", asserters.isDisplayed, 10000)
            .elementByCssSelectorWhenReady(".day.ng-scope.today", 30000)
            .click();
    },

    getAttemptTextOfAssessment: function (browser, assignmentName) {
        return browser
            .waitForElementByXPath("//span[contains(@class,'assessment-title')]/div[contains(text(),'" + assignmentName + "')][1]/parent::span//following-sibling::div[@class='attempts ng-binding']//span", asserters.isDisplayed, 60000)
            .text();
    },

    verifyAssignmentTabDisabled: function (browser) {
        return browser
            .waitForElementByXPath("//div[@class='menu-wrapper']//div[@class='nav']//ul[@id='navigation-menu']//li//span[contains(text(),'ASSIGNMENTS')]//parent::a//parent::li", asserters.isDisplayed, 60000);
    },

    clickCurrentDateCell: function (browser, done) {
        browser
            .execute("document.getElementsByClassName('today selected')[0].scrollIntoView()")
            .sleep(1000)
            .waitForElementByCss(".day.ng-scope.today",asserters.isDisplayed, 60000)
            .elementByCssSelectorWhenReady(".day.ng-scope.today", 30000)
            .click()
            .nodeify(done);
    },

    getTextOfAssignmentChapter: function(browser, assessmentname){
      return browser
          .waitForElementByXPath("//span[contains(@class,'assessment-title')]/div[contains(text(),'"+assessmentname+"')]/parent::span//following-sibling::div[@class='topic']//span", asserters.isDisplayed, 60000)
          .text();
    },

    getQuestionTextFromStudentActivityPanel: function(browser){
      return browser
          .waitForElementByCss(".cas-prompt .cas-text", asserters.isDisplayed, 60000)
          .text();
    },

    clickToBeginButton : function(browser){
      return browser
          .waitForElementByCss(".confirm.ng-binding", asserters.isDisplayed, 60000)
          .click();
    },

    getAttemptTextOfAssessmentNameOnToday : function(browser){
      return browser
      .sleep(2000)
      .waitForElementByCss(".assessment-title span", asserters.isDisplayed, 30000);
    },

    getQuestionText : function(browser){
      return browser
          .sleep(1000)
          .waitForElementByCss(".attempts.ng-binding", asserters.isDisplayed, 10000);
    },

    verifyAssignmentNameDisabled : function(browser, astname){
      return browser
        .waitForElementByXPath("//div[@class='ng-binding disabled-assessment'][contains(text(),'" + astname + "')]", asserters.isDisplayed, 60000);
    },

    clickOnAssignment : function(browser, astname){
      return browser
          .sleep(1000)
          .waitForElementByXPath("//span[contains(@class,'assessment-title')]//div[contains(.,'" + astname + "')]", asserters.isDisplayed, 60000)
          .click();
    },

    launchAssessmentPopup : function(browser){
      return browser
      .waitForElementByXPath("//section[@class='content']/parent::div", asserters.isDisplayed, 60000);
    },

    checkAccessControl : function (browser,tabName) {
      return browser
        .hasElementByXPath("//a[contains(@class,'active') and contains(text(),'"+tabName+"')]");
    },

    getTextOnLaunchAssessmentPopup : function(browser){
      return browser
          .waitForElementByCss(".bulleted-list li:nth-child(3)", asserters.isDisplayed, 60000);
    },

    assignmentVisibilityStatus: function(browser) {
      return browser
        .sleep(1000)
        .waitForElementByXPath("//div[@class='day ng-scope']//span[@class='number ng-binding' and text()='1']/following-sibling::a[@class='assignment-due ng-hide']/parent::div", asserters.isDisplayed, 10000)
        .isDisplayed()
        .should.become(true);
    },

    assignmentVisibilityStatusOnFutureDate: function(browser) {
      return browser
        .sleep(1000)
        .waitForElementByXPath("//div[@class='day ng-scope']//span[@class='number ng-binding' and text()='1']/following-sibling::a[@class='assignment-due']/parent::div", asserters.isDisplayed, 10000)
        .isDisplayed()
        .should.become(true);
    },

    assignmentVisibilityTrueStatusOnFutureDate: function(browser) {
      return browser
        .sleep(1000)
        .hasElementByXPath("//div[@class='day ng-scope']//span[@class='number ng-binding' and text()='1']/following-sibling::a[@class='assignment-due ng-hide']/parent::div");
    },

      validateAssignmentOnFutureDate: function(browser, dateValue){
          return browser
            .sleep(1000)
            .hasElementByXPath("//div[@class='day ng-scope']/span[contains(@class,'number') and (text()='"+dateValue+"')]");
      },

      validateAssignmentOnPastDate: function(browser, dateValue){
          return browser
            .sleep(1000)
            .hasElementByXPath("//div[contains(@class,'before-today')]/span[contains(@class,'number') and (text()='"+dateValue+"')]");
      },
      validateAssessmentpresentOnCurrentDate: function(browser, astName){
         return browser
              .execute("window.scrollTo(0,0)")
              .sleep(1000)
              .waitForElementByCss(".ng-binding.assessment-title-link", asserters.isDisplayed, 10000)
              .text()
              .should.eventually.include(astName);
      }

};
