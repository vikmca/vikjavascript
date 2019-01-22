var wd = require('wd');
var string = require('../../../../util/stringUtil');
var report = require("../../../../support/reporting/reportgenerator");
var _ = require('underscore');
var studentAssignmentPage = require("../../../../support/pagefactory/studentAssignment");
var practiceQuizPage = require("../../../../support/pagefactory/practicequiz.json");
var mathutil = require("../../../../util/mathUtil");
var asserters = wd.asserters;
var cas_activity_series;
var trueFalseQuestionRadio;
var cas_choice_radio_for_true_false;
var multipleChoiceQuestionRadio;
var cas_choice_radio_for_multiple_type_question;
var continueButton;
var dropDownBox;
var select_option_from_dropdown;
var exit_button = studentAssignmentPage.studentAssignmentSubmissionPage.exit_button;
var trueFalseRadioChoice;
var multipleChoiceRadioOption;
var optionOfSelectType;
var pastQuizButtonOnResultPage;
var retakeButtonOnResultPage;
var progressButtonOnResultPage;
var incorrectQuestionOnResultPage;
var disabled_continue_button;
var questioncount = 0;
var cas_multiple_choice_text;
var textcontain;
var cas_fill_in_question_text;
var countOfQuestions2ndattempts;
cas_activity_series = studentAssignmentPage.studentAssignmentSubmissionPage.cas_activity_series;
trueFalseQuestionRadio = studentAssignmentPage.studentAssignmentSubmissionPage.trueFalseQuestionRadio;
cas_choice_radio_for_true_false = studentAssignmentPage.studentAssignmentSubmissionPage.cas_choice_radio_for_true_false;
multipleChoiceQuestionRadio = studentAssignmentPage.studentAssignmentSubmissionPage.multipleChoiceQuestionRadio;
cas_choice_radio_for_multiple_type_question = studentAssignmentPage.studentAssignmentSubmissionPage.cas_choice_radio_for_multiple_type_question;
continueButton = studentAssignmentPage.studentAssignmentSubmissionPage.continueButton;
disabled_continue_button = studentAssignmentPage.studentAssignmentSubmissionPage.disabled_continue_button;
dropDownBox = studentAssignmentPage.studentAssignmentSubmissionPage.dropDownBox;
select_option_from_dropdown = studentAssignmentPage.studentAssignmentSubmissionPage.select_option_from_dropdown;
exit_button = studentAssignmentPage.studentAssignmentSubmissionPage.exit_button;
optionOfSelectType = string.returnreplacedstring(select_option_from_dropdown, "{{}}", +mathutil.getRandomInt(1, 4));
trueFalseRadioChoice = string.returnreplacedstring(cas_choice_radio_for_true_false, "{{}}", mathutil.getRandomInt(1, 3));
multipleChoiceRadioOption = string.returnreplacedstring(cas_choice_radio_for_multiple_type_question, "{{}}", mathutil.getRandomInt(1, 3));
pastQuizButtonOnResultPage = practiceQuizPage.praticeQuiz.pastQuizButtonOnResultPage;
retakeButtonOnResultPage = practiceQuizPage.praticeQuiz.retakeButtonOnResultPage;
progressButtonOnResultPage = practiceQuizPage.praticeQuiz.progressButtonOnResultPage;
incorrectQuestionOnResultPage = practiceQuizPage.praticeQuiz.incorrectQuestionOnResultPage;
cas_multiple_choice_text = studentAssignmentPage.studentAssignmentSubmissionPage.cas_multiple_choice_text;
cas_fill_in_question_text = studentAssignmentPage.studentAssignmentSubmissionPage.cas_fill_in_question_text;
cas_questions_text = studentAssignmentPage.studentAssignmentSubmissionPage.cas_questions_text;



module.exports = {

   clickExitButtonOnResultsPage: function(browser){
     return browser
        .waitForElementByCss(exit_button, asserters.isDisplayed, 30000)
        .then(function (el) {
            practiceQuizValidationStatus = "success";
            // el.click();
            return browser
              .execute("return document.getElementsByClassName('exit')[0].click()");
        });
     },

    takeQuiz: function(browser, done) {

    return browser
          .waitForElementsByCss(cas_activity_series, asserters.isDisplayed, 60000).then(function (progresslist) {

              countOfQuestions = _.size(progresslist);
              console.log("Count of incomplete Questions : " + countOfQuestions);
              completedQuestions = 0;

              function selectAnAnswerAndProceed() {
                  if (countOfQuestions > 0) {
                      countOfQuestions--;
                      completedQuestions++;
                      browser
                          .sleep(1000)
                          .waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
                          .hasElementByCss(trueFalseQuestionRadio).then(function (flag) {
                              if (!flag) {
                                return browser.sleep(1000).waitForElementByCss(multipleChoiceQuestionRadio, asserters.isDisplayed, 5000).getTagName().then(function (tag) {
                                      if (tag === "div") {
                                          browser
                                              .waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
                                              .waitForElementByXPath(multipleChoiceRadioOption, asserters.isDisplayed, 3000).click()
                                              .sleep(1000)
                                              .execute("return window.scrollTo(500,500)")
                                              .sleep(1000)
                                              .elementByCssSelectorWhenReady(continueButton, 3000).click();
                                          console.log("Answered a Question with Radio Button " + completedQuestions + " and remaining Questions " + countOfQuestions);
                                      }

                                      else {
                                          browser
                                              .waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
                                              .waitForElementByCss(dropDownBox, asserters.isDisplayed, 7000)
                                              .click()
                                              .waitForElementByCss(optionOfSelectType, asserters.isDisplayed, 10000)
                                              .click()
                                              .sleep(1000)
                                              .execute("return window.scrollTo(500,500)")
                                              .sleep(1000)
                                              .elementByCssSelectorWhenReady(continueButton, 3000)
                                              .click();
                                          console.log("Answered a Question with a Drop down " + completedQuestions + " and remaining Questions " + countOfQuestions);
                                      }
                                      setTimeout(selectAnAnswerAndProceed, 7000);
                                  });
                              }
                              else {
                                  return browser.waitForElementByCss(trueFalseQuestionRadio, asserters.isDisplayed, 5000).getTagName().then(function (tag) {
                                      if (tag === "div") {
                                          browser
                                              .waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
                                              .waitForElementByXPath(trueFalseRadioChoice, asserters.isDisplayed, 3000).click()
                                              .sleep(1000)
                                              .execute("return window.scrollTo(500,500)")
                                              .sleep(1000)
                                              .elementByCssSelectorWhenReady(continueButton, 5000).click();
                                          console.log("Answered a True or False Question " + completedQuestions + " and remaining Questions " + countOfQuestions);
                                      } else {
                                          console.log("Problem in answering T/F");
                                      }
                                      setTimeout(selectAnAnswerAndProceed, 5000);
                                  });
                              }
                          });

                  } else {

                      if (completedQuestions == _.size(progresslist)) {
                          console.log("All Questions successfully attempted");
                           browser.waitForElementByCss(pastQuizButtonOnResultPage, asserters.isDisplayed, 5000)
                              .waitForElementByCss(retakeButtonOnResultPage, asserters.isDisplayed, 10000)
                              .waitForElementByCss(progressButtonOnResultPage, asserters.isDisplayed, 10000)
                              //.waitForElementByXPath(incorrectQuestionOnResultPage, asserters.isDisplayed, 10000);
                          done();
                      }
                      else {
                          console.log("failure");
                          practiceQuizValidationStatus = "failure";
                          done();
                      }
                  }
              }
              //Function to answer all the Questions
              selectAnAnswerAndProceed();
          });
    },
   pageLoadingStateValue: function(browser){
      return browser.hasElementByCss("cg-loading");
   },

  //studentAccessVerification : function(browser, validationURL, current){
  pollingPageLoad :  function(LoadTime, browser, done, message) {
    function pageLoading() {
        return browser.hasElementByCss("cg-loading").then(function (LoadingState) {
            if (LoadingState) {
                 browser.sleep(2000);
                LoadTime = LoadTime + 2000;
                pageLoading();
            }
            else {
                if (!LoadingState) {
                    var timeTaken = LoadTime / 1000;
                    console.log(report.reportHeader() +
                        report.stepStatusWithData(message, "Successfully", "success") +
                        report.reportFooter());
                    done();

                } else {
                    console.log(report.reportHeader() +
                        report.stepStatusWithData("Page is loaded in time", timeTaken, "failure") +
                        report.reportFooter());
                }
            }
        });
      }
      pageLoading();
    },

    submitTwoQuesFromQuiz: function(browser, done){
      return browser
          .waitForElementsByCss(cas_activity_series, asserters.isDisplayed, 60000).then(function (len) {
              countOfQuestions2ndattempts = _.size(len);
              function selectAnAnswerAndProceed() {
                  if (countOfQuestions2ndattempts > 3) {
                      countOfQuestions2ndattempts--;
                      questioncount++;
                      browser
                          .sleep(1000)
                          .waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
                          .hasElementByCss(trueFalseQuestionRadio).then(function (flag) {
                              if (!flag) {
                                  browser.sleep(1000).waitForElementByCss(multipleChoiceQuestionRadio, asserters.isDisplayed, 7000).getTagName().then(function (tag) {
                                      if (tag === "div") {
                                          browser
                                              .waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
                                              .waitForElementByXPath(multipleChoiceRadioOption, asserters.isDisplayed, 3000).click()
                                              .sleep(1000)
                                              .execute("return window.scrollTo(500,500)")
                                              .sleep(1000)
                                              .elementByCssSelectorWhenReady(continueButton, 3000).click();
                                              console.log("Answered a Question with Radio Button " + questioncount + " and remaining Questions " + countOfQuestions2ndattempts);
                                      } else {
                                          browser
                                              .waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
                                              .waitForElementByCss(dropDownBox, asserters.isDisplayed, 7000)
                                              .click()
                                              .waitForElementByCss(optionOfSelectType, asserters.isDisplayed, 10000)
                                              .click()
                                              .sleep(1000)
                                              .execute("return window.scrollTo(500,500)")
                                              .sleep(1000)
                                              .elementByCssSelectorWhenReady(continueButton, 3000).click();
                                              console.log("Answered a Question with a Drop down " + questioncount + " and remaining Questions " + countOfQuestions2ndattempts);
                                      }
                                      setTimeout(selectAnAnswerAndProceed, 7000);
                                  });
                              }
                              else {
                                  browser.waitForElementByCss(trueFalseQuestionRadio, asserters.isDisplayed, 5000).getTagName().then(function (tag) {
                                      if (tag === "div") {
                                          browser
                                              .waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
                                              .waitForElementByXPath(trueFalseRadioChoice, asserters.isDisplayed, 5000)
                                              .click()
                                              .sleep(1000)
                                              .execute("return window.scrollTo(500,500)")
                                              .sleep(1000)
                                              .elementByCssSelectorWhenReady(continueButton, 3000)
                                              .click();
                                          console.log("Answered a True or False Question " + questioncount + " and remaining Questions " + countOfQuestions2ndattempts);
                                      } else {
                                          console.log("Problem in answering T/F");
                                      }
                                      setTimeout(selectAnAnswerAndProceed, 5000);
                                  });
                              }
                          });
                  } else {
                      console.log("questioncount " + questioncount);
                      if (questioncount === 2) {
                          browser
                              .sleep(1000)
                              .waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
                              .hasElementByCss(trueFalseQuestionRadio).then(function (flag) {
                                  if (!flag) {
                                      browser.sleep(1000).waitForElementByCss(multipleChoiceQuestionRadio, asserters.isDisplayed, 5000).getTagName().then(function (tag) {
                                          if (tag === "div") {
                                              browser
                                                  .waitForElementByCss(cas_multiple_choice_text, asserters.isDisplayed, 30000).text().then(function (textofresumedquestion) {
                                                      textcontain = textofresumedquestion;
                                                      console.log("textcontain ::" + textcontain);
                                                      console.log(report.reportHeader() +
                                                          report.stepStatusWithData("Capture the Quiz question text for the 3rd question  ", textcontain, "success") +
                                                          report.reportFooter());
                                                      browser
                                                          .waitForElementByCss(exit_button, asserters.isDisplayed, 5000)
                                                          .then(function (el) {
                                                              // el.click().then(function () {
                                                                  done();
                                                              // });
                                                          });
                                                  });
                                          }
                                          else {
                                              browser
                                                  .waitForElementByXPath(cas_fill_in_question_text, asserters.isDisplayed, 5000).text().then(function (textofresumedquestion) {
                                                      textcontain = textofresumedquestion;
                                                      console.log("textcontain ::" + textcontain);
                                                      browser
                                                          .waitForElementByCss(exit_button, asserters.isDisplayed, 3000)
                                                          .then(function (el) {
                                                              // el.click().then(function () {
                                                                  done();
                                                              // });
                                                          });
                                                  });
                                          }
                                      });
                                  }
                                  else {
                                      browser.waitForElementByCss(trueFalseQuestionRadio, asserters.isDisplayed, 5000).getTagName().then(function (tag) {
                                          if (tag === "div") {
                                              browser
                                                .waitForElementByCss(cas_multiple_choice_text, asserters.isDisplayed, 30000).text().then(function (textofresumedquestion) {
                                                    textcontain = textofresumedquestion;
                                                    console.log("textcontain ::" + textcontain);
                                                    console.log("Capture the Quiz question text for the 3rd question: " + textcontain);
                                                    browser
                                                      .waitForElementByCss(exit_button, asserters.isDisplayed, 3000)
                                                      .then(function (el) {
                                                      //     el.click().then(function () {
                                                              done();
                                                      //     });
                                                      });
                                                });
                                          }
                                      });
                                  }
                              });
                      }
                      else {
                          studentAssignmentCompletionStatus = "failure";
                          console.log(report.reportHeader() +
                              report.stepStatusWithData("Student Assignment completion status ", studentAssignmentCompletionStatus, "failure") +
                              report.reportFooter());
                      }
                  }
              }
              //Function to answer all the Questions
              selectAnAnswerAndProceed();
          });
    },
    resumeQuizFromThirdQues: function(browser, done){
      browser
          .elementByCssSelectorWhenReady(cas_questions_text, 10000)
          .isDisplayed()
          .then(function () {
              browser
                  .sleep(1000)
                  .waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
                  .hasElementByCss(trueFalseQuestionRadio).then(function (flag) {
                      if (!flag) {
                          browser.sleep(1000).waitForElementByCss(multipleChoiceQuestionRadio, asserters.isDisplayed, 5000).getTagName().then(function (tag) {
                              if (tag === "div") {
                                  browser
                                      .waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
                                      .waitForElementByCss(cas_multiple_choice_text, asserters.isDisplayed, 5000).text().then(function (verifyquestiontext) {
                                          console.log(verifyquestiontext);
                                          if (verifyquestiontext.indexOf(textcontain) > -1) {
                                              console.log(report.reportHeader() +
                                                  report.stepStatusWithData(" Verify presence of question text captured  ", verifyquestiontext, "success") +
                                                  report.reportFooter());
                                              done();
                                          } else {
                                              console.log(report.reportHeader() +
                                                  report.stepStatusWithData(" Verify presence of question text captured  ", verifyquestiontext, "failure") +
                                                  report.reportFooter());
                                          }
                                      });
                              }
                              else {
                                  browser
                                      .waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
                                      .waitForElementByXPath(cas_fill_in_question_text, asserters.isDisplayed, 5000).text().then(function (verifyquestiontext) {
                                          if (verifyquestiontext.indexOf(textcontain) > -1) {
                                              console.log(report.reportHeader() +
                                                  report.stepStatusWithData(" Verify presence of question text captured  ", verifyquestiontext, "success") +
                                                  report.reportFooter());
                                              done();
                                          } else {
                                              console.log(report.reportHeader() +
                                                  report.stepStatusWithData(" Verify presence of question text captured  ", verifyquestiontext, "failure") +
                                                  report.reportFooter());
                                          }
                                      });
                              }
                          });
                      }
                      else {
                          browser.waitForElementByCss(trueFalseQuestionRadio, asserters.isDisplayed, 10000).getTagName().then(function (tag) {
                              if (tag === "div") {
                                  browser
                                      .waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
                                      .waitForElementByCss(cas_multiple_choice_text, asserters.isDisplayed, 10000).text().then(function (verifyquestiontext) {
                                          if (verifyquestiontext.indexOf(textcontain) > -1) {
                                              console.log(report.reportHeader() +
                                                  report.stepStatusWithData(" Verify presence of question text captured  ", verifyquestiontext, "success") +
                                                  report.reportFooter());
                                              done();
                                          } else {
                                              console.log(report.reportHeader() +
                                                  report.stepStatusWithData(" Verify presence of question text captured  ", verifyquestiontext, "failure") +
                                                  report.reportFooter());
                                          }
                                      });
                              }
                          });
                      }
                  });
          });

    },

    submitRemaningQUiz: function(browser, done){
    return  browser
          .waitForElementsByCss(cas_activity_series, asserters.isDisplayed, 60000).then(function (len) {
              countOfQuestions2ndattempts = _.size(len) - questioncount;
              console.log("len after attempts" + countOfQuestions2ndattempts);
              function selectAnAnswerAndProceed() {
                  if (countOfQuestions2ndattempts > 0) {
                      countOfQuestions2ndattempts--;
                      questioncount++;
                      browser
                          .sleep(1000)
                          .waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
                          .hasElementByCss(trueFalseQuestionRadio).then(function (flag) {
                              if (!flag) {
                                  browser.sleep(1000).waitForElementByCss(multipleChoiceQuestionRadio, asserters.isDisplayed, 7000).getTagName().then(function (tag) {
                                      if (tag === "div") {
                                          browser
                                              .waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
                                              .waitForElementByXPath(multipleChoiceRadioOption, asserters.isDisplayed, 3000).click()
                                              .sleep(1000)
                                              .execute("return window.scrollTo(500,500)")
                                              .sleep(1000)
                                              .elementByCssSelectorWhenReady(continueButton, 3000).click();
                                          console.log("Answered a Question with Radio Button " + questioncount + " and remaining Questions " + countOfQuestions2ndattempts);
                                      } else {
                                          browser
                                              .waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
                                              .waitForElementByCss(dropDownBox, asserters.isDisplayed, 7000)
                                              .click()
                                              .waitForElementByCss(optionOfSelectType, asserters.isDisplayed, 10000)
                                              .click()
                                              .sleep(1000)
                                              .execute("return window.scrollTo(500,500)")
                                              .sleep(1000)
                                              .elementByCssSelectorWhenReady(continueButton, 3000).click();
                                              console.log("Answered a Question with a Drop down " + questioncount + " and remaining Questions " + countOfQuestions2ndattempts);
                                      }
                                      setTimeout(selectAnAnswerAndProceed, 7000);
                                  });
                              }
                              else {
                                  browser.waitForElementByCss(trueFalseQuestionRadio, asserters.isDisplayed, 5000).getTagName().then(function (tag) {
                                      if (tag === "div") {
                                          browser
                                              .waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
                                              .waitForElementByXPath(trueFalseRadioChoice, asserters.isDisplayed, 5000).click()
                                              .sleep(1000)
                                              .execute("return window.scrollTo(500,500)")
                                              .sleep(1000)
                                              .elementByCssSelectorWhenReady(continueButton, 3000).click();
                                          console.log("Answered a True or False Question " + questioncount + " and remaining Questions " + countOfQuestions2ndattempts);
                                      } else {
                                          console.log("Problem in answering T/F");
                                      }
                                      setTimeout(selectAnAnswerAndProceed, 5000);
                                  });
                              }
                          });
                  } else {
                      if (questioncount == _.size(len)) {
                          console.log("All Questions successfully attempted");
                          browser
                              .waitForElementByCss(exit_button, asserters.isDisplayed, 3000);
                               done();
                      }
                      else {
                          studentAssignmentCompletionStatus = "failure";
                          console.log(report.reportHeader() +
                              report.stepStatusWithData("Student Assignment completion status ", studentAssignmentCompletionStatus, "failure") +
                              report.reportFooter());
                      }
                  }
              }
              //Function to answer all the Questions
              selectAnAnswerAndProceed();
          });
    },
    submitTwoQuesFromPracticeQuiz: function(browser, done){
      return browser
      .waitForElementsByCss(cas_activity_series, asserters.isDisplayed, 10000).then(function (progresslist) {
         countOfQuestions = 3;
         console.log("Count of incomplete Questions : " + countOfQuestions);
         completedQuestions = 0;
         function selectAnAnswerAndProceed() {
           if (countOfQuestions > 0) {
             countOfQuestions--;
             completedQuestions++;
             browser
             .sleep(1000)
             .waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
             .hasElementByCss(trueFalseQuestionRadio).then(function (flag) {
               if (!flag) {
                 browser.sleep(1000).waitForElementByCss(multipleChoiceQuestionRadio, asserters.isDisplayed, 7000).getTagName().then(function (tag) {
                   if (tag === "div") {
                     browser
                     .waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
                     .waitForElementByXPath(multipleChoiceRadioOption, asserters.isDisplayed, 3000).click()
                     .sleep(1000)
                     .execute("return window.scrollTo(500,500)")
                     .sleep(1000)
                     .waitForElementByCss(continueButton, asserters.isDisplayed, 7000).click();
                     console.log("Answered a Question with Radio Button " + completedQuestions + " and remaining Questions " + countOfQuestions);
                   }

                   else {
                     browser
                     .waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
                     .waitForElementByCss(dropDownBox, asserters.isDisplayed, 7000)
                     .click()
                     .waitForElementByCss(optionOfSelectType, asserters.isDisplayed, 10000)
                     .click()
                     .sleep(1000)
                     .execute("return window.scrollTo(500,500)")
                     .sleep(1000)
                     .waitForElementByCss(continueButton, asserters.isDisplayed, 7000)
                     .click();
                     console.log("Answered a Question with a Drop down " + completedQuestions + " and remaining Questions " + countOfQuestions);

                   }
                   setTimeout(selectAnAnswerAndProceed, 7000);
                 });
               }
               else {
                 browser.waitForElementByCss(trueFalseQuestionRadio, asserters.isDisplayed, 5000).getTagName().then(function (tag) {
                   if (tag === "div") {
                     browser
                     .waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
                     .waitForElementByXPath(trueFalseRadioChoice, asserters.isDisplayed, 3000).click()
                     .sleep(1000)
                     .execute("return window.scrollTo(500,500)")
                     .sleep(1000)
                     .waitForElementByCss(continueButton, asserters.isDisplayed, 5000).click();
                     console.log("Answered a True or False Question " + completedQuestions + " and remaining Questions " + countOfQuestions);
                   } else {
                     console.log("Problem in answering T/F");
                   }
                   setTimeout(selectAnAnswerAndProceed, 5000);
                 });
               }
             });
           } else {
             if (completedQuestions == _.size(progresslist)) {
               console.log("All Questions successfully attempted");
               browser.waitForElementByCss(pastQuizButtonOnResultPage, asserters.isDisplayed, 5000)
               .waitForElementByCss(retakeButtonOnResultPage, asserters.isDisplayed, 1000)
               .waitForElementByCss(progressButtonOnResultPage, asserters.isDisplayed, 1000)
               .waitForElementByXPath(incorrectQuestionOnResultPage, asserters.isDisplayed, 1000)
               .waitForElementByCss(exit_button, asserters.isDisplayed, 3000)
               .then(function (el) {
                 practiceQuizValidationStatus = "success";
                 done();
               });
             }
             else {
               console.log("failure");
               practiceQuizValidationStatus = "failure";
               done();
             }
           }
         }
         //Function to answer all the Questions
         selectAnAnswerAndProceed();
       });

    },

     errorOnQuizLaunch : function(browser){
       return browser
         .sleep(3000)
         .hasElementByCss(".alert.alert-danger");
     },

     getErrorText : function(browser){
       return browser
         .waitForElementByCss(".alert.alert-danger strong", asserters.isDisplayed, 60000)
         .text();
     },

     getQuestionCounts: function(browser){
        return browser
        .waitForElementsByCss(cas_activity_series, asserters.isDisplayed, 30000);
     },

    deleteAssignmentsFromBrowser: function(browser, assignmentCount, done) {
  		function deleteAssignmentsFromListView() {
  			return browser
  				.sleep(5000)
  				.elementByXPath("((//div[@class='ui-grid-canvas']/div)[1]/div//div)[7]/div").text()
  				.then(function(text) {
  					var flag = parseInt(text);
  					return browser
  						.sleep(1000)
  						.elementByXPath("((//div[@class='ui-grid-canvas']/div)[1]/div//div)[1]").click()
  						.sleep(1000)
  						.elementByXPath("//button[contains(text(),'DELETE')]").click()
  						.then(function() {
  							if (flag >= 0 && flag <= 1000) {
  								return browser
  									.elementByXPath("//button[@class='confirm ng-binding'][text()='Delete']").click()
  									.sleep(2000)
  									.then(function() {
  										assignmentCount--;
  										if (assignmentCount > 0) {
  											deleteAssignmentsFromListView();
  										} else {
  											return browser
  												.refresh()
  												.sleep(3000)
  												.then(function() {
  													return browser
  														.refresh()
  														.nodeify(done);
  												});
  										}
  									});
  							} else {
  								return browser
  									.acceptAlert()
  									.sleep(2000)
  									.then(function() {
  										assignmentCount--;
  										if (assignmentCount > 0) {
  											deleteAssignmentsFromListView();
  										} else {
  											return browser
  												.refresh()
  												.sleep(3000)
  												.then(function() {
  													return browser
  														.refresh()
  														.nodeify(done);
  												});
  										}
  									});
  							}
  						});
  				});
  		}
  		deleteAssignmentsFromListView();
  	}

};
