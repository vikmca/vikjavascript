var wd = require('wd');
var asserters = wd.asserters;
var report = require("../../../../support/reporting/reportgenerator");
var util = require("../../../../util/date-utility.js");
var _ = require('underscore');
var Q = require('q');
var practiceQuizPage =  require("../../../pagefactory/practicequiz.json");
module.exports = {


    navigateToPracticeQuizFromChapters: function (browser) {

        return browser
            .waitForElementByCss(".sliding-menu-button.ng-scope", asserters.isDisplayed, 2000)
            .click()
            .waitForElementByCss("nav.sliding-menu-content", asserters.isDisplayed, 5000)
            .sleep(5000)
            .waitForElementByCss("section.actions button:nth-child(1)", asserters.isDisplayed, 10000)
            .click();

    },


    navigateToPracticeQuizFromStudyBits: function (browser) {

        return browser
            .waitForElementByCss(".sliding-menu-button.ng-scope", asserters.isDisplayed, 2000)
            .click()
            .waitForElementByCss("nav.sliding-menu-content", asserters.isDisplayed, 5000)
            .sleep(3000)
            .waitForElementByXPath("//label[contains(text(),'On my filtered StudyBits')]", asserters.isDisplayed, 10000)
            .click()
            .sleep(5000)
            .waitForElementByCss("section.actions button:nth-child(1)", asserters.isDisplayed, 10000)
            .click();

    },
    navigateToRetakeQuizFromStudyBoard: function (browser) {
        return browser
            .waitForElementByCss(".sliding-menu-button.ng-scope", asserters.isDisplayed, 2000)
            .click()
            .waitForElementByCss("nav.sliding-menu-content", asserters.isDisplayed, 5000)
            .sleep(5000)
            .waitForElementByCss("button.view-quizzes", asserters.isDisplayed, 10000)
            .click()
            // .execute("window.scrollTo(1000000,1000000)")
            .waitForElementByXPath("(//div[@class='practice-quizzes ng-scope']//h2[contains(text(),'" + util.getCurrentYear() + "')]/following-sibling::*//div)[1]//a", asserters.isDisplayed, 60000)
            .click()
            .waitForElementByCss("button.sliding-menu-button.retake-quiz.ng-scope", asserters.isDisplayed, 20000)
            .click();
    },

    navigateToAPastQuizFromStudyBoard: function (browser) {

        return browser
            .waitForElementByCss(".sliding-menu-button.ng-scope", asserters.isDisplayed, 2000)
            .click()
            .waitForElementByCss("nav.sliding-menu-content", asserters.isDisplayed, 5000)
            .sleep(5000)
            .waitForElementByCss("button.view-quizzes", asserters.isDisplayed, 10000)
            .click()
            .waitForElementByXPath("(//div[contains(@class,'quiz ng-scope')]//a)[1]", asserters.isDisplayed, 60000)
            .click();
    },

    navigateToStudyBoard: function (browser) {
        return browser
        .waitForElementByCss("div.icon-studyboard-blue", asserters.isDisplayed, 40000)
        .click();
    },

    navigateToStudybits: function (browser) {
        return browser
        .waitForElementByXPath("//a[contains(.,'StudyBits')]", asserters.isDisplayed, 50000)
        .click();
    },

    getQuestionsCorrect: function (browser) {
        var deferred = Q.defer();
        browser
            .waitForElementByCss("div.progress-count", asserters.isDisplayed, 60000)
            .text().then(function(value){
                console.log("Label : " + value);
                var score = value.substring(0,value.lastIndexOf('/'));
                console.log("Correct questions score " + score);
                deferred.resolve(score);
            }, function (error) {

                deferred.reject('Score not found');
            });
        return deferred.promise;

    },

    getTotalQuestions: function (browser) {
        var deferred = Q.defer();
        browser
            .waitForElementByCss("div.progress-count", asserters.isDisplayed, 60000)
            .text().then(function (value) {
                console.log("Label : " + value);
                var questions = value.substring(value.lastIndexOf('/') + 1, value.lastIndexOf(' correct answers'));
                console.log("Total questions " + questions);
                deferred.resolve(questions);
            }, function (error) {
                deferred.reject('Question count not found');
            });
        return deferred.promise;
    },

    verifyPracticeQuizResultPage: function (browser) {
        return browser
            .waitForElementByCss(".sliding-menu-button.ng-scope", asserters.isDisplayed, 2000);
    },

    getQuestionsIncorrect: function (browser) {
        return browser
            .waitForElementByXPath("//a[contains(.,'INCORRECT')]//following-sibling::span", asserters.isDisplayed, 60000)
            .text();
    },

    navigateToPracticeQuizFromDesiredChapter: function (browser, desiredChapter) {
        return browser
            .waitForElementByCss(".sliding-menu-button.ng-scope", asserters.isDisplayed, 2000)
            .click()
            .waitForElementByCss("nav.sliding-menu-content", asserters.isDisplayed, 5000)
            .sleep(2000)
            // .waitForElementByXPath("//div[@class='select-style']/select", asserters.isDisplayed, 5000)
            // .click()
            // .sleep(2000)
            .waitForElementByXPath("//div[@class='select-style']/select//option[contains(.,'" + desiredChapter + "')]", asserters.isDisplayed, 5000)
            .click()
            .waitForElementByCss("section.actions button:nth-child(1)", asserters.isDisplayed, 10000)
            .click();
    },

    validateViewPastQuizButton: function (browser) {
        return browser
            .waitForElementByCss(".sliding-menu-button.past-quizzes", asserters.isDisplayed, 2000)
            .text();
    },

    validateRetakeButton: function (browser) {
        return browser
            .waitForElementByCss(".sliding-menu-button.retake-quiz", asserters.isDisplayed, 2000)
            .text();
    },

    validateExitButton: function (browser) {
        return browser
            .waitForElementByCss(".exit", asserters.isDisplayed, 2000)
            .text();
    },

    fetchTheCountOfIncorrectAnswerFromTab: function (browser) {
        return browser
            .waitForElementByXPath("//li[@class='tab-pane active']//a[contains(.,'INCORRECT')]//following-sibling::span", asserters.isDisplayed, 2000)
            .text();
    },

    checkAllQuestionCorrectStatus: function(browser){
      return browser
        .hasElementByCss(".tab-pane.active.correct");
    },

    fetchTheCountOfIncorrectAnswerFromList: function (browser) {
        return browser
            .waitForElementsByCss(".review-item-content");
    },

    fetchTheCreditsCountOfIncorrectAnswerFromList: function (browser) {
        return browser
            .waitForElementsByCss(".cas-credits");
    },

    navigateToCorrectAnswersViewOfQuizResult: function (browser) {
        return browser
            .waitForElementByXPath("//li[@class='tab-pane']//a[contains(.,'CORRECT')]", asserters.isDisplayed, 2000)
            .click();
    },

    fetchTheCountOfCorrectAnswerFromTab: function (browser) {
        return browser
            .waitForElementByXPath("//li[@class='tab-pane active']//a[contains(.,'CORRECT')]//following-sibling::span", asserters.isDisplayed, 2000)
            .text();
    },

    fetchTheCountOfCorrectAnswerFromList: function (browser) {
      //  if (process.env.RUN_ENV.toString() === "\"integration\"") {
         return browser
             .waitForElementsByCss(".review-item-content");
      // } else{
      //   return browser
      //   .waitForElementsByCss("#correct .review-item-content", asserters.isDisplayed, 20000);
      // }
    },

    attemptInlineAssessment: function (browser, done, scrollY, imgsrc) {
      if(process.env.RUN_IN_BROWSER.toString() === "\"internet explorer\""){
         return browser
             .waitForElementByCss(".cas-4ltr-activity", asserters.isDisplayed, 20000)
                     .execute("document.getElementsByClassName('cas-activity-actionBar')[0].scrollIntoView(true)")
                     .sleep(3000)
                     .execute("window.scrollBy(0,-500)")
                     .sleep(5000)
                     .waitForElementByXPath("//img[contains(@src,'" +  imgsrc  + "')]", asserters.isDisplayed, 10000)
                     .click()
                     .sleep(1000)
                     .waitForElementByXPath("(//div[@class='cas-hotSpotMatcher-image'])[1]/div[1]/div[3]//img", asserters.isDisplayed, 10000)
                     .click()
                     .waitForElementByXPath("(//div[@class='cas-hotSpotMatcher-image'])[1]/div[1]/div[3]//img", asserters.isDisplayed, 10000)
                     .getAttribute("src").then(function (val) {
                         if (val.indexOf(imgsrc) > -1) {
                             console.log("submitting the assignment");
                             return browser
                                 .waitForElementByXPath("(//button[contains(@class,'btn btn-default cas-activity-action')])[1]", asserters.isDisplayed, 10000)
                                 .click()
                                 .nodeify(done);
                         }
                     });
          } else if(process.env.RUN_FOR_PRODUCT.toString() === "\"COMM4\""){
                 return browser
                     .waitForElementByCss(".cas-4ltr-activity", asserters.isDisplayed, 20000)
                     // .waitForElementByCss("div.cas-activity-actionBar",asserters.isDisplayed,20000)
                     // .then(function (casSubmit) {
                     //     console.log("Scrolling the inline assessment into the view");
                     //   return  browser
                     //         .sleep(2000)
                     //         .getLocationInView(casSubmit)
                             .execute("document.getElementsByClassName('cas-activity-actionBar')[0].scrollIntoView(true)")
                             .sleep(3000)
                             .execute("window.scrollBy(0,-500)")
                             .sleep(2000)
                             .waitForElementByXPath("//img[contains(@src,'" + imgsrc + "')]", asserters.isDisplayed, 10000)
                             .click()
                             .sleep(1000)
                             .waitForElementByXPath("(//div[@class='cas-hotSpotMatcher-image'])[1]/div[1]/div[2]//img", asserters.isDisplayed, 10000)
                             .click()
                             .waitForElementByXPath("(//div[@class='cas-hotSpotMatcher-image'])[1]/div[1]/div[2]//img", asserters.isDisplayed, 10000)
                             .getAttribute("src").then(function (val) {
                                 if (val.indexOf(imgsrc) > -1) {
                                     console.log("submitting the assignment");
                                     return browser
                                         .waitForElementByXPath("(//button[contains(@class,'btn btn-default cas-activity-action')])[1]", asserters.isDisplayed, 10000)
                                         .click()
                                         .nodeify(done);
                                 }
                             });
          }
            else{
               return browser
                   .waitForElementByCss(".cas-4ltr-activity", asserters.isDisplayed, 20000)
                   // .waitForElementByCss("div.cas-activity-actionBar",asserters.isDisplayed,20000)
                   // .then(function (casSubmit) {
                   //     console.log("Scrolling the inline assessment into the view");
                   //   return  browser
                   //         .sleep(2000)
                   //         .getLocationInView(casSubmit)
                           .execute("document.getElementsByClassName('cas-activity-actionBar')[0].scrollIntoView(true)")
                           .sleep(3000)
                           .execute("window.scrollBy(0,-500)")
                           .sleep(2000)
                           .waitForElementByXPath("//img[contains(@src,'" + imgsrc + "')]", asserters.isDisplayed, 10000)
                           .click()
                           .sleep(1000)
                           .waitForElementByXPath("(//div[@class='cas-hotSpotMatcher-image'])[1]/div[1]/div[3]//img", asserters.isDisplayed, 10000)
                           .click()
                           .waitForElementByXPath("(//div[@class='cas-hotSpotMatcher-image'])[1]/div[1]/div[3]//img", asserters.isDisplayed, 10000)
                           .getAttribute("src").then(function (val) {
                               if (val.indexOf(imgsrc) > -1) {
                                   console.log("submitting the assignment");
                                   return browser
                                       .waitForElementByXPath("(//button[contains(@class,'btn btn-default cas-activity-action')])[1]", asserters.isDisplayed, 10000)
                                       .click()
                                       .nodeify(done);
                               }
                           });
          }

    },
    verifySolutionIsDisplayed: function (browser, done, imgsrc) {
        return browser
            .sleep(5000)
            .waitForElementByCss(".cas-correct-solution", asserters.isDisplayed, 5000)
            .waitForElementByXPath("//div[@class='cas-correct-solution']//div[@class='cas-hotSpotMatcher-image']//img[contains(@src,'" + imgsrc + "')]", asserters.isDisplayed, 5000);
    },

    fetchCorrectCount: function (browser) {
         return browser
         .waitForElementByCss(".value #correct", asserters.isDisplayed, 5000);

    },



    fetchCountOfCGIDWithEachQuizResponse: function (browser, response) {
      //  if (process.env.RUN_ENV.toString() === "\"integration\"") {
         return browser
             .waitForElementsByXPath("//div[@class='cas-question-cgid']", asserters.isDisplayed, 20000);
      // } else{
      //   return browser
      //   .waitForElementsByXPath("//div[@id='"+response+"']//div[@class='cas-question-cgid']", asserters.isDisplayed, 20000);
      // }
    },
    fetchCorrectIncorrectCount: function (browser, index) {
        var deferred = Q.defer();
        if(index === '1'){
            browser
                .waitForElementByCss("div.progress-count", asserters.isDisplayed, 60000)
                .text().then(function(value){
                    console.log("Label : " + value);
                    var score = value.substring(0,value.lastIndexOf('/'));
                    console.log("Correct questions score " + score);
                    deferred.resolve(score);
                }, function (error) {

                    deferred.reject('Score not found');
                });
            return deferred.promise;
        }else {
            browser
                .waitForElementByCss("div.progress-count", asserters.isDisplayed, 60000)
                .text().then(function (value) {
                    console.log("Label : " + value);
                    var questions = value.substring(value.lastIndexOf('/') + 1, value.lastIndexOf(' correct answers'));
                    console.log("Total questions " + questions);
                    deferred.resolve(questions);


                }, function (error) {

                    deferred.reject('Question count not found');
                });
            return deferred.promise;
        }

    },

    clickOnPastQuizButton: function (browser){
      var pastQuizButtonOnResultPage=practiceQuizPage.praticeQuiz.pastQuizButtonOnResultPage;
      return browser
        .waitForElementByCss(pastQuizButtonOnResultPage, asserters.isDisplayed, 5000)
        .click();
    },
    navigateToPastQuiz: function (browser) {
          return browser
              .waitForElementByCss(".sliding-menu-button.ng-scope", asserters.isDisplayed, 2000)
              .click()
              .waitForElementByCss("nav.sliding-menu-content", asserters.isDisplayed, 5000)
              .sleep(1000)
              .waitForElementByCss("button.view-quizzes", asserters.isDisplayed, 10000)
              .click();
    },
    getStatusOfPastQuizPresentForCurrentDate: function (browser, currentDate){
      return browser
          .sleep(5000)
          .hasElementByXPath("//div[contains(@class,'quiz')]//p[contains(text(),'"+currentDate+"')]//a[contains(text(),'Chapter 1 Quiz')]");
    },
    validatePastQuizPresentForCurrentDate: function (browser, currentDate){
      return browser
          .waitForElementsByXPath("//div[contains(@class,'quiz')]//p[contains(text(),'"+currentDate+"')]//a[contains(text(),'Chapter 1 Quiz')]",asserters.isDisplayed, 10000);
    },
    clickOnBackButton: function (browser) {
      return browser
          .waitForElementByCss(".practice-quiz-back.ng-scope", asserters.isDisplayed, 2000)
          .click();
    },
    verifyErrorOnLaunchingQuiz: function (browser) {
        return browser
          .sleep(5000).hasElementByXPath("//div[@class='flash-alert error-alert']");

    },
    verifyErrorMessageOnLaunchingQuiz: function (browser) {
          return  browser
          .waitForElementByCss(".flash-alert.error-alert ul li[class='ng-scope ng-binding']", asserters.isDisplayed, 60000).text().then(function(errorText){
            console.log(report.reportHeader() +
              report.stepStatusWithData("error message is displaying on dragging the assignment and error message is "+errorText, "failure") +
              report.reportFooter());
          });
    },

    getQuizText: function(browser, chapterName){
        return browser
        .waitForElementByXPath("//h1[contains(.,'" + chapterName + "')]/following-sibling::div[@class='chartjs overview']//div[@class='question-count']//p", asserters.isDisplayed, 90000).text();
    },

disabledSubmitInlineButtonStatus:function(browser){
    return browser
    .sleep(3000)
    .hasElementByXPath('//span[@class="cas-multiple-choice"]//parent::div//parent::div//button[@disabled=""]');
},

clickOnSubmitInlineAssessmentButton:function(browser){
    return browser
    .waitForElementByXPath("//span[@class='cas-multiple-choice']//parent::div//parent::div//button", asserters.isDisplayed, 60000)
    .click();
},

submitButtonStatusOnPage:function(browser){
    return browser
    .hasElementByXPath("//span[@class='cas-multiple-choice']//parent::div//parent::div//button");
},

validateCreditPresentForInlineAssessment: function(browser){
    return browser
    .waitForElementByCss(".cas-credits>strong", asserters.isDisplayed, 60000)
    .text();
},

getChapterPresenceStatusOnCTPage: function(browser, chapter){
  return browser
    .execute("return document.evaluate(\"count(//div[contains(@class,'chart-container ng-scope')]/h1[contains(.,'" + chapter + "')])\", document, null, XPathResult. NUMBER_TYPE, null ).numberValue");
}



};
