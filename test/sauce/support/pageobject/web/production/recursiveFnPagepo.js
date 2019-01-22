var wd = require('wd');
var asserters = wd.asserters;
var testData = require("../../../../../../test_data/data.json");
var report = require("../../../../support/reporting/reportgenerator");
var _ = require('underscore');
var loginPage = require("./loginpo");
var stringutil = require("../../../../util/stringUtil");
var productData =loginPage.getProductData();
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var flashcardPage =  require("./flashcardspo");
var notespo =  require("./notespo");
var tocPage =  require("./tocpo");
var searchFeaturePage =  require("./searchFeaturepo");
var documentAndLinksPage = require("../../../../support/pageobject/"+pageobject+"/"+envName+"/assignments/instructor/documentAndLinkspo.js")
var studentchapterReadingAssignmentPage = require("../../../../support/pageobject/"+pageobject+"/"+envName+"/assignments/student/studentChapterReadingpo");
var assessmentsPage = require("../../../../support/pageobject/"+pageobject+"/"+envName+"/assignments/instructor/assessmentspo.js");
var mediaquizpage = require("../../../../support/pageobject/"+pageobject+"/"+envName+"/assignments/instructor/mediaQuizpo");
var initialLeftCount =300;
var initialLeftCountForAst =30;
var topicCount = 1;
var topiclengthchapter = 1;
var counterForChapterNavigation =1;
var counter = 1;
var counterForLoop = 0;
var videosCount;
var allVideoLinkText = [];
var topicsCount;
var alltopicElement = [];
var chapterReadingAssignmentPage =  require("./assignments/instructor/chapterReadingpo");
module.exports =  {


  validateLeftcountAtFrontTextFlashcard: function (browser, done) {
    flashcardPage.fetchValueFromBackFlashcardField(browser).getAttribute('value').then(function(text){
      textOnFlashcardField = text;
      flashcardPage.fetchCharacterCountFromBackFlashcard(browser).then(function (length) {
        browser.sleep(2000);
        characterCount = length;
        function verifyCount() {
          if(characterCount <= initialLeftCount) {
            textOnFlashcardField = textOnFlashcardField+'D';
            characterCount++;
            verifyCount();
          }else {
            flashcardPage.fetchValueFromBackFlashcardField(browser).clear().then(function(){
              flashcardPage.fetchValueFromBackFlashcardField(browser).type(textOnFlashcardField).then(function(){
                flashcardPage.leftCountFromBackFlashcardTextBox(browser).then(function (LeftCountBeyondAssignmentLimits) {
                  if(LeftCountBeyondAssignmentLimits == testData.assignmentDetails.assignmentTextBoxDtails.countLeftBeyondNotesLimits){
                    console.log(report.reportHeader()
                    + report.stepStatusWithData("Enters the character beyond limits then count goes to displaying with negative sign :: ", LeftCountBeyondAssignmentLimits, "success")
                    + report.reportFooter());
                    done();
                  }else {
                    console.log(report.reportHeader()
                    + report.stepStatusWithData("Enters the character beyond limits then count goes to displaying with negative sign  :: ", LeftCountBeyondAssignmentLimits, "failure")
                    + report.reportFooter());
                  }
                });
              });
            });
          }
        }
        verifyCount();
      });
    });
  },

    fetchAssignmentNameTextBox: function (browser) {
        return browser
            .sleep(2000)
            .waitForElementByXPath("//div[@class='text-input']//input[@id='assessment-name'and @type='text']", asserters.isDisplayed, 60000)
            .getAttribute('value');
    },

    validateLeftcountAtAstNameTextbox: function (browser, done) {
      var initialLeftCountForAst =30;
      return browser
          .sleep(2000)
          .waitForElementByXPath("//div[@class='text-input']//input[@id='assessment-name'and @type='text']", asserters.isDisplayed, 60000)
          .getAttribute('value').then(function(assignmentTextName) {
          var assignmentNameTextBoxText = assignmentTextName;
          console.log(assignmentNameTextBoxText);
          // assessmentsPage.characterCountAssignmentName(browser).then(function(lengths) {
              return browser
                  .sleep(2000)
                  .execute("return document.getElementsByClassName('text-input')[0].getElementsByTagName('input')[0].value.length").then(function(lengths) {
              console.log(lengths);
              var assignmentCharacterCount = lengths;
              function verifyCount() {
                  if (assignmentCharacterCount <= initialLeftCountForAst) {
                      assignmentNameTextBoxText = assignmentNameTextBoxText + 'D';
                      assignmentCharacterCount++;
                      verifyCount();
                  } else {
                      return browser
                          .sleep(2000)
                          .waitForElementByXPath("//div[@class='text-input']//input[@id='assessment-name'and @type='text']", asserters.isDisplayed, 60000)
                          .clear().then(function() {
                          return browser
                              .sleep(2000)
                              .waitForElementByXPath("//div[@class='text-input']//input[@id='assessment-name'and @type='text']", asserters.isDisplayed, 60000)
                              .type(assignmentNameTextBoxText).then(function() {
                                // assessmentsPage.leftCountFromAssignmentTextBox(browser).then(function(LeftCountBeyondAssignmentLimits) {
                                  return browser
                                      .sleep(2000)
                                      .execute("return document.getElementsByClassName('title-char-count span-half')[0].getElementsByClassName('ng-binding')[0].textContent").then(function(LeftCountBeyondAssignmentLimits) {
                                  if (LeftCountBeyondAssignmentLimits == testData.assignmentDetails.assignmentTextBoxDtails.countLeftBeyondAssignmentLimits) {
                                      console.log(report.reportHeader()
                                          + report.stepStatusWithData("Enters the character beyond limits then count becomes negative :: ", LeftCountBeyondAssignmentLimits, "success")
                                          + report.reportFooter());
                                      done();
                                  } else {
                                      console.log(report.reportHeader()
                                          + report.stepStatusWithData("Enters the character beyond limits then count becomes negative :: ", LeftCountBeyondAssignmentLimits, "failure")
                                          + report.reportFooter());
                                  }
                              });
                          });
                      });
                  }
              }

              verifyCount();
          });
      });
    },


  validateLeftcountAtNotesField: function (browser, done) {
    notespo.fetchValueFromNotesFieldTextBox(browser).getAttribute('value').then(function(textOnNotesField){
      var textOfNotesField = textOnNotesField;
      notespo.fetchCharacterCountFromNotes(browser).then(function (length) {
        notesCharacterCount = length;
        function verifyCount() {
          if(notesCharacterCount <= initialLeftCount) {
            textOfNotesField = textOfNotesField+'D';
            notesCharacterCount++;
            verifyCount();
          }else {
            notespo.fetchValueFromNotesFieldTextBox(browser).clear().then(function(){
              notespo.fetchValueFromNotesFieldTextBox(browser).type(textOfNotesField).then(function(){
                notespo.leftCountFromNotesTextBox(browser).then(function (LeftCountBeyondAssignmentLimits) {
                  if(LeftCountBeyondAssignmentLimits == testData.assignmentDetails.assignmentTextBoxDtails.countLeftBeyondNotesLimits){
                    console.log(report.reportHeader()
                      + report.stepStatusWithData("Enters the character beyond limits then count goes to displaying with negative sign :: ", LeftCountBeyondAssignmentLimits, "success")
                      + report.reportFooter());
                    done();
                  }else {
                    console.log(report.reportHeader()
                      + report.stepStatusWithData("Enters the character beyond limits then count goes to displaying with negative sign  :: ", LeftCountBeyondAssignmentLimits, "failure")
                      + report.reportFooter());
                  }
                });
              });
            });
          }
        }
        verifyCount();
      });
    });
  },

  verifyChaptersOnTopicPane: function (browser, done) {
    tocPage.navigateToSlidingToc(browser).text().then(function (text1) {
      tocPage.validateThePresenceOfVideoLinksOnTOC(browser).then(function (attributeVideo) {
        var videoAttribute = stringutil.returnValueAfterSplit(attributeVideo,"#",1);
        if(attributeVideo.indexOf("products")>-1){
          console.log(report.reportHeader() +
          report.stepStatusWithData("Video links are present on TOC", "success")
          + report.reportFooter());
          tocPage.clickOnVideoLink(browser).then(function(){
            browser
            .waitForElementByCss('#'+videoAttribute, asserters.isDisplayed, 60000).then(function () {
              console.log(report.reportHeader() +
              report.stepStatusWithData("Video is appearing on narrative content", "success")
              + report.reportFooter());
              tocPage.navigateToSlidingToc(browser).text().then(function (tocHeadingText) {
                if (tocHeadingText.indexOf(productData.chapter.topic.toc.heading) > -1) {
                  tocPage.getFirstChapterTitleUnderToc(browser).text().then(function (getFirstChapterNameUnderToc) {
                    console.log(report.reportHeader() + report.stepStatusWithData("Topic Page sliding panel shows ", productData.chapter.title, "success") + report.reportFooter());
                    if (getFirstChapterNameUnderToc.indexOf(productData.chapter.title) > -1) {
                      tocPage.getListFromToc(browser).then(function (list) {
                        list[0].elementsByXPath("(//nav[@class='sliding-menu-content is-visible']//ul//li)[1]//a[@class='menu-topic ng-scope']").then(function (topics) {
                          topiclengthchapter = _.size(topics);
                          topiclengthchapter1 = topiclengthchapter+1;
                          function validateTopic() {
                            topicCount++;
                            if (topicCount <= topiclengthchapter1) {
                              tocPage.validateTopicsOnChapterFirstUnderToc(browser,topicCount).text()
                              .should.eventually.include(productData.chapter.topic.toc.topic[topicCount]).then(function (title) {
                                console.log(report.reportHeader() + report.stepStatusWithData("Topic Page sliding panel shows ", title, "success") + report.reportFooter());
                                validateTopic();
                              });
                            }
                            else {
                              done();
                            }
                          }
                          validateTopic();
                        });
                      });
                    }
                  });
                }
              });
            });
          });
        }else {
          console.log(report.reportHeader() +
            report.stepStatusWithData("Video link is not present on TOC","","failure")
            + report.reportFooter());
        }
      });
    });
  },

    verifyChapterIntroductionAndClickNext: function (browser, done) {
      var loopcount=0;
      browser
      .waitForElementByCss(".topic-title span h1", asserters.isDisplayed, 60000).text()
      .should.eventually.include(productData.chapter.topic.toc.chapterintro)
      .then(function (title) {
        console.log(report.reportHeader() + report.stepStatusWithData("Traversing to subsequent topics using arrow button on blue navigation panel ", title, "success") + report.reportFooter());
        function clickOnNextButton() {
          loopcount++
          if (counterForChapterNavigation < topiclengthchapter) {
            browser
            .execute("window.scrollTo(0,0)")
            .waitForElementsByCssSelector('.icon-right-arrow-white', asserters.isDisplayed, 60000).then(function (arrowElements) {
              arrowElements[0].elementByCssSelector(".ng-isolate-scope").then(function (subElement) {
                subElement.elementByCssSelector("a[rel='next']").then(function (arrowLinkElement) {
                  arrowLinkElement.click().then(function () {
                    browser
                    .sleep(15000)
                    .execute("window.scrollTo(0,0)")
                    .waitForElementByCss(".topic-title span h1", asserters.isDisplayed, 60000)
                    .text().then(function(topics){
                      console.log(report.reportHeader() +
                        report.stepStatusWithData("Topic already viewed and the title is:: ", topics, "success")
                        + report.reportFooter());
                    }).then(function(){
                      counterForChapterNavigation++;
                      clickOnNextButton();
                    })
                  })
                })
              });
            });
          }
          else {
            if(counterForChapterNavigation == topiclengthchapter){
              browser
              .execute("window.scrollTo(0,0)")
              .waitForElementByCss(".topic-title span", asserters.isDisplayed, 60000)
              .text().then(function(topics){
                console.log(report.reportHeader() +
                  report.stepStatusWithData("Number of views which is "+counterForChapterNavigation+" is equal to number of topics in chapter ", topiclengthchapter,"success")
                  + report.reportFooter());
                done();
              });
            }else {
              console.log(report.reportHeader() +
                report.stepStatusWithData("Number of views which is "+counterForChapterNavigation+"is not equal to number of topics in chapter ", topiclengthchapter,"failure")
                + report.reportFooter());
            }
          }
        }
        clickOnNextButton();
      });
    },

    getFootNotesCount: function(browser, done){
      return browser
      .waitForElementsByCssSelector(".reader.ng-isolate-scope", asserters.isDisplayed, 60000).then(function (container) {
        container[0].elementsByXPath("//a[@class='footnoteref']").then(function (footnote) {
          function footNoteCount(){
            if(_.size(footnote)>=counter){
              browser
              .waitForElementByXPath("(//a[@class='footnoteref'])["+counter+"]", asserters.isDisplayed, 90000).then(function(footnotes){
                browser
                .getLocationInView(footnotes)
                .execute("window.scrollBy(0,-140)")
                .waitForElementByXPath("(//a[@class='footnoteref'])["+counter+"]", asserters.isDisplayed, 90000)
                .click()
                .waitForElementByCss(".footnote-content.is-visible", asserters.isDisplayed, 90000)
                .text().then(function(footnotetext){
                  console.log(report.reportHeader() +
                  report.stepStatusWithData("The content of footnote "+counter+" is : ",footnotetext, "success") +
                  report.reportFooter());
                }).then(function(){
                  browser
                  .waitForElementByXPath("(//a[@class='footnoteref'])["+counter+"]", asserters.isDisplayed, 90000)
                  .click().then(function(){
                    counterForLoop++;
                    counter++;
                    footNoteCount();
                  });
                });
              });
            }else{
              if(counterForLoop==_.size(footnote)){
                console.log(report.reportHeader() +
                report.stepStatusWithData("Footnote count on  this topic is ", counterForLoop, "success") +
                report.reportFooter());
                done();
              }else {
                console.log(report.reportHeader() +
                report.stepStatusWithData("No Footnote were available on this topic Count came out to be ", counterForLoop,"failure") +
                report.reportFooter());
              }
            }
          }
          footNoteCount();
        });
      });
    },
    verfiySearchedResults: function(browser, done){
      searchFeaturePage.openSearchControl(browser).then(function () {
        searchFeaturePage.enterTheSearchTerm(browser, productData.search_keyword).then(function () {
          searchFeaturePage.getResultsCount(browser)
          .text().should.eventually.include(productData.search_result_count)
          .then(function () {
            console.log(report.reportHeader() +
            report.stepStatusWithData("SEARCH :: Keyword \"" + productData.search_keyword + "\" fetched a total of   ", productData.search_result_count + " matches") +
            report.reportFooter());
            counter = 0;
            (function scrollTillFooterVisible() {
              searchFeaturePage.scrollToSearchResultsBottom(browser).then(function(){
              if (counter < 10) {
                setTimeout(scrollTillFooterVisible, 3000);
                counter++;
              } else {
                searchFeaturePage.selectAResult(browser, productData.search_result_count).then(function (result) {
                    if (result != undefined) {
                      console.log(report.reportHeader() +
                      report.stepStatusWithData("SEARCH :: Keyword", "\"" + productData.search_keyword + "\" has the " + productData.search_result_count + "th result with title", result) +
                      report.reportFooter());
                      done();
                    } else {
                      console.log(report.reportHeader() +
                      report.stepStatus("SEARCH :: Not able to retrieve the " + productData.search_result_count + "th result for Keyword \"",productData.search_keyword + "\"", "failure") +
                      report.reportFooter());
                    }
                  });
                }
              });
            })();
          });
        });
      });
    },
    validateAssignmentGetsSaved: function(browser, done){
      var assignmentCGITime =0;
      function polling() {
          documentAndLinksPage.checkIfAssignmentSaved(browser).then(function (value) {
              if (value.toString() === "rgb(0, 0, 0)") {
                console.log(value.toString());
                  browser.sleep(2000);
                  assignmentCGITime = assignmentCGITime + 2000;
                  polling();
              }
              else {
                  if (value.toString() === "rgb(236, 41, 142)") {
                    console.log(value.toString());
                      var timeTaken = assignmentCGITime / 1000;
                      console.log(report.reportHeader() +
                          report.stepStatusWithData("Instructor created Documents and links type assignment called :: ", documentAndLinksPage.getAssignmentName() + " is saved successfully", "success") +
                          report.reportFooter());
                      done();
                  } else {
                      console.log(report.reportHeader() +
                          report.stepStatusWithData("Instructor created Documents and links type assignment called :: ", documentAndLinksPage.getAssignmentName() + " is not created successfully", "failure") +
                          report.reportFooter());
                  }
              }
          });
      }
      polling();
    },

    verifyVideosElementAtChapterContent: function(browser, done){
     var countVideo = 0;
      chapterReadingAssignmentPage.getVideosElement(browser).then(function (videoElement) {
        videosCount = _.size(videoElement);
        if (_.size(videoElement) > 0) {
          function videoLinkText() {
            if (countVideo < _.size(videoElement)) {
              videoElement[countVideo].text().then(function (textVideoLink) {
                allVideoLinkText[countVideo] = textVideoLink;
                countVideo++;
                videoLinkText();
              });
            } else {
              console.log(report.reportHeader() +
              report.stepStatusWithData("Instructor :: Chapter Content assignment from specified chapter has " + _.size(videoElement) + "", "success") +
              report.reportFooter());
              done();
            }
          }
          videoLinkText();
        } else {
          console.log(report.reportHeader() +
          report.stepStatusWithData("Instructor :: Video links are not present in specified chapter", "", "failure") +
          report.reportFooter());
        }
      });
    },

    validateTopicsPresentOnChapterReading: function(browser, done){

      var countTopic = 0;
      chapterReadingAssignmentPage.getTopicsElement(browser).then(function (topicElement) {
        topicsCount =  _.size(topicElement);
        if (_.size(topicElement) > 0) {
          function topicLinkText() {
            if (countTopic < _.size(topicElement)) {
              topicElement[countTopic].text().then(function (textTopicLink) {
                alltopicElement[countTopic] = textTopicLink;
                countTopic++;
                topicLinkText();
              });
            } else {
              console.log(report.reportHeader() +
              report.stepStatusWithData("Instructor :: Chapter Content assignment from specified chapter has " + _.size(topicElement) + "topics present", "success") +
              report.reportFooter());
              done();
            }
          }
          topicLinkText();
        } else {
          console.log(report.reportHeader() +
          report.stepStatusWithData("Instructor :: Topic links are not present in specified chapter", "", "failure") +
          report.reportFooter());
        }
      });
    },

      validateVideosPresentOnStudentAssignmentExpendedView: function(browser, done){
        var countVideo = 0;
        studentchapterReadingAssignmentPage.getReadingAstVideoElement(browser, chapterReadingAssignmentPage.getAssignmentName())
        .then(function (videoElement) {
          if (_.size(videoElement) > 0) {
            function videoLinkText() {
              if (countVideo < _.size(videoElement)) {
                videoElement[countVideo].text()
                .should.eventually.include(allVideoLinkText[countVideo]);
                countVideo++;
                videoLinkText();
              } else {
                if (countVideo == _.size(videoElement)) {
                  console.log(report.reportHeader() +
                  report.stepStatusWithData("Student :: Chapter Content assignment from specified chapter has " + _.size(videoElement) + " video links, named ", allVideoLinkText, "success") +
                  report.reportFooter());
                  done();
                }
              }
            }
            videoLinkText();
          } else {
            console.log(report.reportHeader() +
            report.stepStatusWithData("Video links are not present for specified chapter ", "", "failure") +
            report.reportFooter());
          }
        });
   },

     verifyEditedAstPresentOnCurrentDate: function(browser, done){
      return browser
           .waitForElementsByCssSelector(".container.ng-scope .day.ng-scope.today.selected", asserters.isDisplayed, 60000).then(function (currentdatecell) {
               currentdatecell[0].elementsByXPath("(//div[@class='day ng-scope today selected'])[1]//div[contains(@class,'event')]").then(function (assignmentcountoncurrentdate) {
                   var astcount = 1;
                   function verifyAssignmentbackgroundcolor() {
                       if (astcount === _.size(assignmentcountoncurrentdate)) {
                           browser
                               .execute("return window.getComputedStyle(document.evaluate(\"(//div[contains(@class,'cg-calendar ng-isolate-scope')]//div[contains(@class,'day ng-scope today')])[1]/div[contains(@class,'event ng-scope')][" + astcount + "]//span\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue.parentNode).getPropertyValue('background-color');").then(function (value) {
                                   if (value.toString() === "rgb(236, 41, 142)") {
                                       astcount++;
                                       verifyAssignmentbackgroundcolor();
                                   }
                               });
                       }
                       else {
                           countassignment = astcount - 1;
                           if (countassignment === _.size(assignmentcountoncurrentdate)) {
                               console.log(report.reportHeader() +
                                   report.stepStatusWithData("All edited Assignments on current date are visible", "", "success") +
                                   report.reportFooter());
                               done();
                           }
                           else {
                               console.log(report.reportHeader() +
                                   report.stepStatusWithData("All edited Assignments on current date are visible", "", "failure") +
                                   report.reportFooter());
                           }
                       }
                   }
                   verifyAssignmentbackgroundcolor();
               });
           });
     },

     takeMediaQuiz: function(browser, done){
       var countOfQuestion = 1;
       mediaquizpage.getQuestionsCount(browser).then(function (questionCount) {
         var questionCountOnCue = _.size(questionCount);
       function mediaQuizQuestionsOnPreview() {
           if (countOfQuestion <= questionCountOnCue) {
               browser
               .waitForElementByXPath("//div[@class='cas-mediaquiz-question'][1]//div[@class='cas-task'][" + countOfQuestion + "]//div[@class='cas-choice'][1]//label", asserters.isDisplayed, 60000)
                .then(function(getLocation){
                 browser
                 .getLocationInView(getLocation)
                 .execute("window.scrollBy(0,-100)")
                 .waitForElementByXPath("//div[@class='cas-mediaquiz-question'][1]//div[@class='cas-task'][" + countOfQuestion + "]//div[@class='cas-choice'][1]//label", asserters.isDisplayed, 60000)
                 .click();
                 countOfQuestion++;
                 mediaQuizQuestionsOnPreview();
               });

           }
           else {
               browser
                   .waitForElementByXPath("//div[@class='cas-mediaquiz-question']//div[@class='cas-mediaquiz-question-control']//button[text()='Score']", asserters.isDisplayed, 60000).then(function (scoreButton) {
                       browser
                           .getLocationInView(scoreButton)
                           .sleep(1000)
                           .waitForElementByXPath("//div[@class='cas-mediaquiz-question']//div[@class='cas-mediaquiz-question-control']//button[text()='Score']", asserters.isDisplayed, 60000)
                           .click().sleep(2000).then(function () {
                               browser
                                   .waitForElementByXPath("//div[@class='cas-mediaquiz-question']//div[@class='cas-mediaquiz-question-control']//button[text()='Continue Video']", asserters.isDisplayed, 60000)
                                   .then(function (continueButton) {
                                       browser
                                           .getLocationInView(continueButton)
                                           .sleep(1000)
                                           .waitForElementByXPath("//div[@class='cas-mediaquiz-question']//div[@class='cas-mediaquiz-question-control']//button[text()='Continue Video']", asserters.isDisplayed, 60000)
                                           .click().sleep(2000).then(function () {
                                               console.log(report.reportHeader() +
                                                   report.stepStatusWithData(" All questions are attempted out of ", questionCountOnCue, "Success")
                                                   + report.reportFooter());
                                               done();
                                           });
                                   });
                           });
                   });
           }
       }mediaQuizQuestionsOnPreview();
     });
   },
   takeMediaQuizAtStudent: function(browser, done){
     var countOfQuestion = 1;
     mediaquizpage.getQuestionsCount(browser).then(function (questionCount) {
       var questionCountOnCue = _.size(questionCount);
     function mediaQuizQuestionsOnPreview() {
         if (countOfQuestion <= questionCountOnCue) {
             browser
             .sleep(1000)
             .waitForElementByXPath("//div[@class='cas-mediaquiz-question'][1]//div[@class='cas-task'][" + countOfQuestion + "]//div[@class='cas-choice'][1]//label", asserters.isDisplayed, 60000)
              .then(function(getLocation){
               browser
               .getLocationInView(getLocation)
               .sleep(1000)
               .execute("window.scrollBy(0,-110)")
               .sleep(1000)
               .waitForElementByXPath("//div[@class='cas-mediaquiz-question'][1]//div[@class='cas-task'][" + countOfQuestion + "]//div[@class='cas-choice'][1]//label", asserters.isDisplayed, 60000)
               .click().then(function(){
                  countOfQuestion++;
                  mediaQuizQuestionsOnPreview();
              });
             });

         }
         else {
             browser
                 .waitForElementByXPath("//div[@class='cas-mediaquiz-question']//div[@class='cas-mediaquiz-question-control']//button[text()='Score']", asserters.isDisplayed, 60000).then(function (scoreButton) {
                     browser
                         .getLocationInView(scoreButton)
                         .sleep(1000)
                         .waitForElementByXPath("//div[@class='cas-mediaquiz-question']//div[@class='cas-mediaquiz-question-control']//button[text()='Score']", asserters.isDisplayed, 60000)
                         .click().sleep(2000).then(function () {
                             browser
                                 .waitForElementByXPath("//div[@class='cas-mediaquiz-question']//div[@class='cas-mediaquiz-question-control']//button[text()='Continue Video']", asserters.isDisplayed, 60000)
                                 .then(function (continueButton) {
                                     browser
                                         .getLocationInView(continueButton)
                                         .sleep(1000)
                                         .waitForElementByXPath("//div[@class='cas-mediaquiz-question']//div[@class='cas-mediaquiz-question-control']//button[text()='Continue Video']", asserters.isDisplayed, 60000)
                                         .click().sleep(2000).then(function () {
                                             console.log(report.reportHeader() +
                                                 report.stepStatusWithData(" All questions are attempted out of ", questionCountOnCue, "Success")
                                                 + report.reportFooter());
                                             done();
                                         });
                                 });
                         });
                 });
         }
     }mediaQuizQuestionsOnPreview();
   });
  },

  verifyTranscriptAndDownloadForEachVideos : function(browser, done){
    return browser
      .waitForElementByCss(".sliding-menu-button.ng-scope", asserters.isDisplayed, 5000)
      .click()
      .sleep(2000)
      .waitForElementsByXPath("//nav[@class='sliding-menu-content is-visible']//li", asserters.isDisplayed, 60000).then(function(chaptersCount) {
      var chaptersCountsForTitle = _.size(chaptersCount);
      var counterValueForChapter =1;
      function validateForEveryChapter(){
      var counterValueForTopics =1;
        if(counterValueForChapter<=chaptersCountsForTitle){
           return browser
              .sleep(2000)
              .waitForElementsByXPath("((//nav[@class='sliding-menu-content is-visible']//li)["+counterValueForChapter+"])//div[contains(@ng-repeat,'topic')]//a[contains(@class,'menu-video')]//parent::div", asserters.isDisplayed, 60000).then(function(topicsCount) {
                var topicsCountForVideos = _.size(topicsCount);
                console.log("topics under chapter "+counterValueForChapter+" : "+topicsCountForVideos);
                  function validateForEveryTopic(){
                      if(counterValueForTopics<=topicsCountForVideos){
                      return browser
                        .sleep(2000)
                         .waitForElementsByXPath("(((//nav[@class='sliding-menu-content is-visible']//li)["+counterValueForChapter+"])//div[contains(@ng-repeat,'topic')]//a[contains(@class,'menu-video')]//parent::div)["+counterValueForTopics+"]//a[contains(@class,'menu-video')]", asserters.isDisplayed, 60000).then(function(videosCounts) {
                            var videosCountUnderEachTopic = _.size(videosCounts);
                            // return  browser
                            //     .waitForElementByXPath("((((//nav[@class='sliding-menu-content is-visible']//li)["+counterValueForChapter+"])//div[contains(@ng-repeat,'topic')]//a[contains(@class,'menu-video')]//parent::div)["+counterValueForTopics+"]//a[contains(@class,'menu-video')])[1]", asserters.isDisplayed, 60000).then(function(topicsLocation){
                                return  browser
                                    // .getLocationInView(topicsLocation)
                                    .sleep(1000)
                                    .execute(" return (document.evaluate(\"((((//nav[@class='sliding-menu-content is-visible']//li)["+counterValueForChapter+"])//div[contains(@ng-repeat,'topic')]//a[contains(@class,'menu-video')]//parent::div)["+counterValueForTopics+"]//a[contains(@class,'menu-video')])[1]\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue).scrollIntoView()")
                                    .sleep(1000)
                                    .waitForElementByXPath("((((//nav[@class='sliding-menu-content is-visible']//li)["+counterValueForChapter+"])//div[contains(@ng-repeat,'topic')]//a[contains(@class,'menu-video')]//parent::div)["+counterValueForTopics+"]//a[contains(@class,'menu-video')])[1]", asserters.isDisplayed, 60000)
                                    .click().then(function(){
                                     return browser
                                        .sleep(5000)
                                        .waitForElementsByCss(".transcript-download-link", asserters.isDisplayed, 60000).then(function(downloadTranscript) {
                                           var downloadTranscriptButtonCount = _.size(downloadTranscript);
                                            if(downloadTranscriptButtonCount == videosCountUnderEachTopic){
                                              console.log(report.reportHeader() +
                                                  report.stepStatusWithData(" Chapter "+counterValueForChapter+" and topic "+counterValueForTopics+" has download transcript button count "+downloadTranscriptButtonCount+" is compared to",videosCountUnderEachTopic , "Success")
                                                  + report.reportFooter());
                                              return browser
                                              .waitForElementsByXPath("//button[contains(@class,'transcript-button') and not(contains(@class,'ng-hide'))]", asserters.isDisplayed, 60000).then(function(transcriptButtons) {
                                              var transcriptButtonscount = _.size(transcriptButtons);
                                              if(transcriptButtonscount == videosCountUnderEachTopic){
                                                 console.log(report.reportHeader() +
                                                     report.stepStatusWithData(" Chapter "+counterValueForChapter+" and topic "+counterValueForTopics+" has transcript button count "+transcriptButtonscount+" is compared to",videosCountUnderEachTopic , "Success")
                                                     + report.reportFooter());
                                                   return browser
                                                    .sleep(3000)
                                                    .waitForElementByCss(".sliding-menu-button.ng-scope", asserters.isDisplayed, 5000)
                                                    .click()
                                                    .sleep(2000).then(function(){
                                                      counterValueForTopics++;
                                                      validateForEveryTopic();
                                                    });
                                              }else{
                                                console.log(report.reportHeader() +
                                                    report.stepStatusWithData(" Chapter "+counterValueForChapter+" and topic "+counterValueForTopics+" has transcript button count "+transcriptButtonscount+" is compared to",videosCountUnderEachTopic , "failure")
                                                    + report.reportFooter());
                                                 return browser
                                                 .sleep(3000)
                                                 .waitForElementByCss(".sliding-menu-button.ng-scope", asserters.isDisplayed, 5000)
                                                 .click()
                                                 .sleep(2000)
                                                  .then(function(){
                                                   counterValueForTopics++;
                                                   validateForEveryTopic();
                                                 });
                                        }
                                      });
                                        }else{
                                          console.log(report.reportHeader() +
                                              report.stepStatusWithData(" Chapter "+counterValueForChapter+" and topic "+counterValueForTopics+" has download transcript button count "+downloadTranscriptButtonCount+" is compared to",videosCountUnderEachTopic , "failure")
                                              + report.reportFooter());
                                               return browser
                                               .sleep(3000)
                                               .waitForElementByCss(".sliding-menu-button.ng-scope", asserters.isDisplayed, 5000)
                                               .click()
                                               .sleep(2000)
                                                .then(function(){
                                                 counterValueForTopics++;
                                                 validateForEveryTopic();
                                               });
                                        }
                                      });
                                    });
                                // });
                        });
                      }else{
                         counterValueForChapter++;
                        validateForEveryChapter();

                      }
                  }
                 validateForEveryTopic();

          });
        }else{
          done();
        }
      }validateForEveryChapter();
    });
  },

  attemptInlineAssessment: function(browser, done){
      var counter =1;
      return browser
        .sleep(1000)
        .waitForElementByXPath("(//div[@class='selected-item-label'])[1]", asserters.isDisplayed, 60000)
        .execute(" return (document.evaluate(\"(//div[@class='selected-item-label'])[1]\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue).scrollIntoView()")
        .sleep(1000)
        .waitForElementsByXPath("//div[@class='selected-item-label']", asserters.isDisplayed, 60000)
        .then(function(noOFQuestions){
          var noOfInlineQuestions = _.size(noOFQuestions);
            function attemptQuestion(){
              if(counter<=noOfInlineQuestions){
                return browser
                .waitForElementByXPath("(//div[@class='selected-item-label'])["+counter+"]//following-sibling::div//span", asserters.isDisplayed, 60000)
                .click().sleep(1000).then(function(){
                   return browser
                    .waitForElementByXPath("((//div[@class='selected-item'])["+counter+"]//following-sibling::div[contains(@class,'cas-selection-list-container')]//ul//li)[1]//a", asserters.isDisplayed, 60000)
                    .click().sleep(1000).then(function(){
                    counter++;
                    attemptQuestion();
                  });
                });
              }else{
                if(counter == _.size(noOFQuestions)+1){
                  console.log(report.reportHeader() +
                      report.stepStatusWithData("All questions have attempted i.e.", _.size(noOFQuestions), "success")
                      + report.reportFooter());
                      done();
                }else{
                  console.log(report.reportHeader() +
                      report.stepStatusWithData("All questions have attempted i.e.", _.size(noOFQuestions), "failure")
                      + report.reportFooter());
                }
              }
            } attemptQuestion();
        });
  }
};
