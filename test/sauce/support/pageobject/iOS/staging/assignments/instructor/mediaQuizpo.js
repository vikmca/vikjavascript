var wd = require('wd');
var asserters = wd.asserters;

module.exports = {
    selectChapterForMediaQuiz: function (browser, chapter) {
     return  browser
         .waitForElementsByCss(".full-width>ul",asserters.isDisplayed, 15000)
         .waitForElementByXPath("//div[contains(@class,'full-width')]/ul/li[" + chapter + "]//div/label", asserters.isDisplayed, 60000)
         .click();
      },

    selectPreviewTab: function (browser) {
      return  browser
      .waitForElementByXPath("//li[@tab-id='preview']", asserters.isDisplayed, 60000)
      .click();
    },

    getQuestionsCount: function (browser) {
      return  browser
      .waitForElementsByXPath("//div[@class='cas-mediaquiz-question'][1]//div[@class='cas-task']//div[@class='cas-choice'][1]//label", asserters.isDisplayed, 60000);
    },

    selectMediaQuizTypeAssignment: function (browser) {
        return browser
            .waitForElementByCss("#media-quiz-assignment-button", asserters.isEnabled, 60000)
            .isEnabled()
            .then(function (flag) {
                if (flag) {
                    browser.waitForElementByCss("#media-quiz-assignment-button", asserters.isEnabled, 60000).click();
                } else {
                    browser.sleep(3000)
                        .elementByCss("#media-quiz-assignment-button").click();
                }
            });
    },

    validateMediaQuizActivitySelection: function (browser) {
        return browser
              .waitForElementByCss(".topic li .radio-container.ng-isolate-scope input").getAttribute('aria-checked');
    },

    getChapterNameDefaultSelected: function(browser) {
      return browser
      .sleep(2000)
      .waitForElementByCss(".topic h3", asserters.isEnabled, 60000)
      .text();
    },

    clickOnCancelButton: function(browser) {
      return browser
      .waitForElementByCss("#cancel", asserters.isEnabled, 60000)
      .click();
    },

    getTextOfSelectedActivity : function(browser, activityListPosition) {
       return  browser
           .waitForElementsByCss(".full-width>ul",asserters.isDisplayed, 15000)
           .waitForElementByXPath("//div[contains(@class,'full-width')]/ul/li[" + activityListPosition + "]//div/label", asserters.isDisplayed, 60000)
           .text();
     },

     validateIfPreviewVideoIsPresent : function(browser) {
       return browser
       .sleep(5000)
       .hasElementByCss(".cas-mediaquiz>div>video");
     },

     clickOnQuestionMark : function(browser,countOfQuestionMark) {
       return browser
       .waitForElementByXPath("//div[contains(@class,'cas-mediaquiz-progressbar-section')][" + countOfQuestionMark + "]//span",asserters.isDisplayed, 15000)
       .then(function(scrollIntoCue){
         return browser
         .getLocationInView(scrollIntoCue)
         .sleep(2000)
         .waitForElementByXPath("//div[contains(@class,'cas-mediaquiz-progressbar-section')][" + countOfQuestionMark + "]//span",asserters.isDisplayed, 15000)
         .click();
       });

     },

     validateIfPreviewQuestionsIsPresent : function(browser) {
       return browser
       .waitForElementsByXPath("//div[@class='cas-mediaquiz-question']",asserters.isDisplayed, 15000);
     },

     attemptMultipleChoiceQuestions : function(browser) {
       return browser
       .waitForElementByXPath("//div[@class='cas-mediaquiz-question'][1]//div[@class='cas-choice'][1]//label",asserters.isDisplayed, 15000)
       .click()
       .waitForElementByXPath("//div[@class='cas-mediaquiz-question'][1]//button",asserters.isDisplayed, 15000)
       .click();
      },

     validateButtonName : function(browser) {
       return browser
       .sleep(1000)
       .waitForElementByXPath("//div[@class='cas-mediaquiz-question'][1]//button",asserters.isDisplayed, 15000);
     },

     clickOnSettingsTab : function(browser) {
       return browser
       .waitForElementByCss(".ng-binding.active", asserters.isDisplayed, 60000)
       .click();
     },

     validateQuestionOnPreviewTab : function(browser) {
       return browser
       .waitForElementByXPath("//div[@class='cas-mediaquiz-question'][1]//div[@class='cas-paragraph']//span", asserters.isDisplayed, 60000);

     },

     playVideoOnPreview : function(browser) {
       return browser
          .execute("document.getElementsByTagName('video')[0].play()")
          .sleep(5000)
          .execute("document.getElementsByTagName('video')[0].pause()");
     },

     clickOnContinueButton : function(browser) {
       return browser
       .waitForElementByXPath("//div[@class='cas-mediaquiz-question']//div[@class='cas-mediaquiz-question-control']//button[@class='btn btn-default']", asserters.isDisplayed, 60000)
       .click();
     },

     clickOnBlackQuestionMarkButton: function(browser, index){
       return browser
       .waitForElementByXPath("(//span[contains(@class,'cas-mediaquiz-progressbar-question-incorrect')])["+index+"]", asserters.isDisplayed, 60000)
       .click();
     },

     getSelectedRadioButtonBackground: function(browser){
       return browser
           .waitForElementsByCss("input[type='radio']:checked ~ label",asserters.isDisplayed, 15000)
           .execute("return getComputedStyle(document.querySelector('input[type=\"radio\"]:checked ~ label'),'::before').getPropertyValue('background-color')");
     },

     validateScoreButtonPresnceStatus: function(browser){
       return browser
        .hasElementByXPath("//div[@class='cas-mediaquiz-question']//div[@class='cas-mediaquiz-question-control']//button[text()='Score']");
     },

     checkIfSubmitButtonIsPresent: function(browser){
       return browser
         .waitForElementByCss("button.cas-mediaquiz-action.btn.btn-default",asserters.isDisplayed, 15000)
     },

     clickOnSubmitButton: function(browser){
       return browser
         .waitForElementByCss("button.cas-mediaquiz-action.btn.btn-default",asserters.isDisplayed, 15000)
         .click();
     },

     getMaxPointsFromListView: function(browser){
       return browser
       .sleep(1000)
         .waitForElementByCss(".ui-grid-cell.ng-scope.ui-grid-coluiGrid-006 .ui-grid-cell-contents.ng-binding.ng-scope",asserters.isDisplayed, 30000);
     },

     getAttemptsFromListView: function(browser){
       return browser
         .waitForElementByCss(".ui-grid-cell.ng-scope.ui-grid-coluiGrid-007 .ui-grid-cell-contents.ng-binding.ng-scope",asserters.isDisplayed, 30000);
     },

     selectListView: function(browser){
       return browser
           .sleep(2000)
           .waitForElementByCss(".icon-list-gray", asserters.isDisplayed, 60000)
           .then(function (listView) {
             return browser
             .getLocationInView(listView)
             .execute("window.scrollBy(0,-140)")
             .waitForElementByCss(".icon-list-gray", asserters.isDisplayed, 60000)
             .click();
        });
     },

     clickOnExitButton : function(browser){
       return browser
           .waitForElementByCss(".exit.ng-scope", asserters.isDisplayed, 60000)
           .then(function(extButton){
              
               return browser.getLocationInView(extButton)
               .execute("window.scrollBy(0,-140)")
               .waitForElementByCss(".exit.ng-scope", asserters.isDisplayed, 60000)
               .click();
        });
     },

     scrollIntoShowTranscriptButton : function(browser){
       return browser
           .waitForElementByCss(".btn-default.show-transcript-button", asserters.isDisplayed, 60000)
           .then(function(transcript){
             return browser
             .getLocationInView(transcript);
        });
     },

     verifyPreviewButtonStatus: function (browser) {
       return browser
           .waitForElementByCss("li[tab-id='preview']", asserters.isDisplayed, 60000).getAttribute('class').should.eventually.include("ng-binding disabled");;
     },

     verifySaveButtonStatus: function (browser) {
       return  browser
       .waitForElementByCss("#save-close", asserters.isDisplayed, 60000).getAttribute('aria-disabled');
     },
     showTranscriptButton: function (browser) {
       return browser
           .waitForElementByCss(".btn-default.show-transcript-button", asserters.isDisplayed, 60000);
     },
  verifyErrorMessageOnPreview: function (browser) {
      return browser
        .sleep(4000)
        .hasElementByCss(".alert.alert-danger");

  },
  getErrorMessageOnPreview: function (browser) {
        return  browser
        .waitForElementByXPath("//div[@class='alert alert-danger']", asserters.isDisplayed, 60000);
  }
  };
