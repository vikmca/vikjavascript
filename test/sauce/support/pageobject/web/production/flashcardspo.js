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
var studyboardPage = require("../../../../support/pageobject/"+pageobject+"/"+envName+"/studyboardpo.js");
module.exports =  {

    SelectFlashcardTab: function (browser, done) {
        browser
            .waitForElementByXPath("//a[@class='ng-binding' and contains(.,'Flashcards')]", asserters.isDisplayed, 45000)
            .click()
            .elementByXPathSelectorWhenReady("//button[contains(@class,'add-flashcard')]", 30000)
            .isDisplayed()
            .should.become(true)
            .nodeify(done);
    },
    verifyKeyTermFlashcard: function (browser, done) {
    var totalFlashcards = 0;
    var currentChapterNumber = 1;
    return browser
        .waitForElementByCss(".icon-studyboard-blue", asserters.isDisplayed, 10000).then(function () {
            function countskeytermflashcard() {
                if (currentChapterNumber <= productData.chapter.topic.flashcards.publisher.chapters[0].totalchaptercount) {
                  return browser
                          .waitForElementsByXPath("(//div[@class='chapter ng-scope'])["+currentChapterNumber+"]//ul//li[contains(@class,'tile column')]").then(function (countofFlashcards) {
                          browser.getLocationInView(countofFlashcards);
                          console.log("No of Flashcard in "+currentChapterNumber+":"+_.size(countofFlashcards));
                          var countofFlashcard =_.size(countofFlashcards);
                            if (countofFlashcard) {
                                currentChapterNumber++;
                                console.log(report.reportHeader() +
                                    report.stepStatusWithData("Number of KeyTerm Flash Cards in Chapter ",currentChapterNumber + ": " + countofFlashcard, "success") +
                                    report.reportFooter());
                                totalFlashcards = totalFlashcards + countofFlashcard;
                                countskeytermflashcard();
                            }
                            else {
                                currentChapterNumber++;
                                console.log(report.reportHeader() +
                                    report.stepStatusWithData("Number of KeyTerm Flash Cards in Chapter ",currentChapterNumber + ": " + countofFlashcard, "failure") +
                                    report.reportFooter());
                                totalFlashcards = totalFlashcards + countofFlashcard;
                                countskeytermflashcard();
                            }
                        });
                }
                else {
                    console.log(report.reportHeader() +
                        report.stepStatus("Total number of keyterm Flashcards present :" + totalFlashcards, "success") +
                        report.reportFooter());
                    done();
                }
            }
            countskeytermflashcard();
        });
      },

    verifyTextFromSmartSearch: function (browser, done) {
      return browser
        .waitForElementsByXPath("//ul[@class='suggestion-list']//li[contains(@class,'suggestion-item')]").then(function(hintTextCount){
          var index=0;
          var searchResult = productData.chapter.topic.flashcards.publisher.chapters[0].searchresult;
          function verifySmartSearchText(){
            if(index<_.size(hintTextCount)){
                studyboardPage.getPublisherTagHintText(browser, index)
                .then(function(hintText){
                  if(hintText.indexOf(searchResult)>-1){
                    console.log(report.reportHeader() +
                      report.stepStatusWithData("Searched text "+productData.chapter.topic.flashcards.publisher.chapters[0].searchtag+" is compared with suggestion-list",hintText,"success") +
                      report.reportFooter());
                    index++;
                    verifySmartSearchText();
                  }
                });
                }else {
                    if(_.size(hintTextCount)===index){
                      console.log(report.reportHeader() +
                        report.stepStatusWithData("Searched text "+productData.chapter.topic.flashcards.publisher.chapters[0].searchtag+" is compared with suggestion-list",productData.chapter.topic.flashcards.publisher.chapters[0].searchresult,"success") +
                        report.reportFooter());
                      done();
                    }else {
                      console.log(report.reportHeader() +
                        report.stepStatusWithData("All suggestions are not matching with searched text","","failures") +
                        report.reportFooter());
                    }
                  }
              }verifySmartSearchText();
      });
    },

    verifyKeyTermPublisherConcepts: function (browser, done) {
    return browser
      .waitForElementByXPath("(//select)[2]//option[@value='0']", asserters.isDisplayed, 10000)
      .text().then(function(chaptername) {
              if (chaptername.indexOf(productData.chapter.topic.flashcards.publisher.chapters[0].name) > -1) {
                  browser
                  .waitForElementsByCss(".tag-item.ng-scope", asserters.isDisplayed, 10000).then(function (tags) {
                        var nooftags=_.size(tags);
                          if (nooftags > 0) {
                              var m1 = 1;
                              var tagsData=0;
                              function verifytextofconcept() {
                                  if (m1 < nooftags) {
                                      browser
                                      .waitForElementByXPath("((//tags-input)[3]//li//span)[" + m1 + "]", asserters.isDisplayed, 10000).text()
                                      .then(function (value) {
                                                  console.log(report.reportHeader() +
                                                      report.stepStatusWithData("Publisher tags present on the expanded flash card : ",value, "success") +
                                                      report.reportFooter());
                                                  m1++;
                                                  tagsData++;
                                                  verifytextofconcept();

                                          });
                                  }
                                  else {
                                      done();
                                  }
                              }

                              verifytextofconcept();
                          }
                      });
              }
          });
    },

    verifyFrontAndBackFlashCard: function (browser, done) {
      var cardnumber = 1;
      return browser
      .waitForElementByCss(".ng-scope.unassigned span", asserters.isDisplayed, 10000)
      .text()
      .then(function (flashcardcount) {
          GlobalCount = flashcardcount;
      function reviewallkeytermflshcard() {
          if (cardnumber <= GlobalCount) {
            if (cardnumber == 1) {
              browser
                  .waitForElementByCss("article div", asserters.isDisplayed, 5000).text().then(function (fronttext) {
                      console.log(report.reportHeader() +
                          report.stepStatusWithData("Reviewing Card " + cardnumber + " text present on the front of the card and printing it as", "\" " + fronttext + "\"", "success") +
                          report.reportFooter());
                      browser
                          .waitForElementByCss(".icon-arrow-flip.ng-binding", asserters.isDisplayed, 10000)
                          .click()
                          .sleep(1000)
                          .waitForElementByCss("article div", asserters.isDisplayed, 5000).text().then(function (backtext) {
                              console.log(report.reportHeader() +
                                  report.stepStatusWithData("Reviewing Card " + cardnumber + " text present on the back of the card and printing it as", "\" " + backtext + "\"", "success") +
                                  report.reportFooter());
                    browser
                        .waitForElementByXPath("//button[contains(@class,'ng-scope ng-binding') and contains(text(),'STRONG')]", asserters.isDisplayed, 10000)
                        .click()
                        .sleep(1000)
                        .waitForElementByCss(".next button", asserters.isDisplayed, 10000)
                        .click()
                        .waitForElementByCss(".previous button", asserters.isDisplayed, 10000).then(function () {
                            console.log(report.reportHeader() +
                                report.stepStatusWithData("Previous Button is Displayed: ","","success") +
                                report.reportFooter());
                            cardnumber++;
                            reviewallkeytermflshcard();
                        });
                  });
                });
            } else {
                browser
                    .waitForElementByCss(".next button", asserters.isDisplayed, 10000)
                    .click().then(function () {
                        console.log(report.reportHeader() +
                            report.stepStatusWithData("Flashcard "+cardnumber+" has been navigated","", "success") +
                            report.reportFooter());
                        cardnumber++;
                        reviewallkeytermflshcard();
                    });
            }
          }
          else {
              done();
          }
      }
      reviewallkeytermflshcard();
        });
    },

    createFlashcard: function (browser) {
        return browser
            // .sleep(3000)
            .elementByXPathSelectorWhenReady("//button[contains(@class,'add-flashcard')]", 30000)
            .click()
            // .sleep(1000)
            .elementByXPathSelectorWhenReady("(//textarea[@name='front'])[1]", 5000)
            .click()
            .type("Text on the Front of the Flashcard created by Automation  ")
            // .sleep(3000)
            .sleep(1000)
            .elementByXPathSelectorWhenReady("(//textarea[@name='back'])[1]", 5000)
            .click()
            .type("Text on the Back of the Flashcard created by Automation")
            .elementByXPathSelectorWhenReady("(//select[contains(@ng-model,'model.chapter')]//option[@value='0'])[1]", 10000)
            .click()
            // .sleep(1000)
            .elementByXPathSelectorWhenReady("//cg-flashcard-form//div[@class='actions']//button[contains(.,'Done')]", 10000)
            .click()
            // .sleep(1000)
            .execute('window.scrollTo(0,0)')
            .sleep(1000);
    },

    createFlashcardWithFullDetails: function (browser,done,frontText,backText,chapter,userTag,comprehension) {
            var chapterValue = chapter - 1;
        browser
            .waitForElementByXPath("//button[contains(@class,'add-flashcard')]", asserters.isDisplayed, 90000)
            .click()
            .waitForElementByXPath("(//textarea[@name='front'])[1]", asserters.isDisplayed, 90000)
            .click()
            .type(frontText)
            .waitForElementByXPath("(//textarea[@name='back'])[1]", asserters.isDisplayed, 90000)
            .click()
            .type(backText)
            .sleep(1000)
            // .waitForElementByXPath("//select", asserters.isDisplayed, 90000)
            // .click()
            .elementByXPathSelectorWhenReady("//select[contains(@ng-model,'model.chapter')]//option[@value='"+chapterValue+"']", 20000)
            // .waitForElementByXPath("//select[contains(@ng-model,'model.chapter')]//option[@value='"+chapterValue+"']", asserters.isDisplayed, 90000)
            // .waitForElementByXPath("(//select[contains(@ng-model,'model.chapter')]//option[contains(.,'"+chapter+"')])", asserters.isDisplayed, 90000)
            .click()
            .waitForElementByCss("#add-flashcard-form input", asserters.isDisplayed, 90000)
            .type(userTag)
            .sleep(1000)
            .type(wd.SPECIAL_KEYS.Tab)
            .type(wd.SPECIAL_KEYS.Enter)
            .waitForElementByCss(".tag-item.ng-scope button",asserters.isDisplayed, 60000)
            .waitForElementByXPath("//form[@id='add-flashcard-form']// div[@class='comprehension']//button[contains(.,'"+comprehension+"')]", asserters.isDisplayed, 90000)
            .click()
            .waitForElementByXPath("//cg-flashcard-form//div[@class='actions']//button[contains(.,'Done')]", asserters.isDisplayed, 90000)
            .click()
            .nodeify(done);
    },

    enterDescriptionOnFrontFlashcardField: function (browser,frontText) {
        return browser
            .waitForElementByXPath("//button[contains(@class,'add-flashcard')]", asserters.isDisplayed, 90000)
            .click()
            .waitForElementByXPath("(//textarea[@name='front'])[1]", asserters.isDisplayed, 90000)
            .click()
            .type(frontText);

    },

    fetchCharacterCountFromFlashcard : function(browser) {
      return browser
       .execute("return document.getElementsByTagName('input').front.value.length");
    },

    leftCountFromFrontFlashcardTextBox: function (browser) {
      return browser
      .execute("return document.getElementsByClassName('remaining-characters ng-scope')[0].textContent");
    },

    enterDescriptionOnBackFlashcardField: function (browser,backText) {
        return browser
            .waitForElementByXPath("(//textarea[@name='back'])[1]", asserters.isDisplayed, 90000)
            .click()
            .type(backText);

    },
    fetchValueFromBackFlashcardField: function (browser) {
        return browser
            .waitForElementByXPath("(//textarea[@name='back'])[1]", asserters.isDisplayed, 90000);
    },

    selectChapter: function (browser,chapter) {
      return browser
      .waitForElementByXPath("(//select[contains(@ng-model,'model.chapter')]//option[contains(.,'"+chapter+"')])", asserters.isDisplayed, 90000)
      .click();
    },

    fetchCharacterCountFromBackFlashcard : function(browser) {
      return browser
       .execute("return document.getElementsByTagName('input').back.value.length");
    },
    clickOnCancelButton: function (browser) {
        return browser
            .waitForElementByXPath("//div[@class='actions']//button[contains(@class,'cancel') and text()='Cancel']", asserters.isDisplayed, 90000)
            .click();

    },

    checkSaveButtonDisabled : function(browser) {
      return browser
      .waitForElementByXPath("//button[contains(text(),'Done')]",asserters.isDisplayed, 10000)
      .click();
    },

    leftCountFromBackFlashcardTextBox: function (browser) {
      return browser
      .execute("return document.getElementsByClassName('remaining-characters ng-scope')[1].textContent");
    },

    verfiychapterIsPresentByDefault : function(browser) {
      return browser
      .waitForElementByCss(".static-select.ng-scope",asserters.isDisplayed, 10000);
    },


    createFlashcardFromStudyBit: function (browser, done, backText) {
       return  browser
            .waitForElementByCss("#add-flashcard-form", asserters.isDisplayed, 90000)
            .waitForElementByXPath("(//textarea[@name='back'])[1]",asserters.isDisplayed, 90000)
            .type(backText).sleep(2000).then(function(){
            return  browser
              .waitForElementByXPath("//cg-flashcard-form//div[@class='actions']//button[contains(.,'Done')]", asserters.isDisplayed, 90000).sleep(2000)
              .click().then(function(){
                done();
              });
            });
    },
    selectUserFlashcardView: function (browser) {
         return browser
            .execute("window.scrollTo(0,0)").then(function(){
              if(process.env.RUN_IN_BROWSER.toString() === "\"internet explorer\"") {
                browser
                  .sleep(1000)
                  .waitForElementByXPath("//button[contains(.,'FILTER')]", asserters.isDisplayed, 90000)
                  .click().then(function(){
                    // if(process.env.RUN_ENV.toString() === "\"integration\""){
                    //   browser
                    //   .waitForElementByXPath("//a[contains(.,'FILTER')]", asserters.isDisplayed, 90000)
                    //   .click();
                    // }else {
                    browser
                      .waitForElementByXPath("//li[@class='ng-binding' and contains(text(),'My Flashcards')]", asserters.isDisplayed, 90000)
                      .click().then(function(){
                        browser
                        .waitForElementByXPath("//button[contains(.,'FILTER')]", asserters.isDisplayed, 90000)
                        .click();
                      });
                    // }
                  });
          }else {
            browser
              .sleep(1000)
              .waitForElementByCss("button.filter-button.ng-binding", asserters.isDisplayed, 90000)
              .click().then(function(){
                // if(process.env.RUN_ENV.toString() === "\"integration\""){
                //   browser
                //   .waitForElementByXPath("//a[contains(.,'FILTER')]", asserters.isDisplayed, 90000)
                //   .click();
                // }else {
                browser
                  .waitForElementByXPath("//li[@class='ng-binding' and contains(text(),'My Flashcards')]", asserters.isDisplayed, 90000)
                  .click().then(function(){
                    browser
                    .waitForElementByXPath("//button[contains(.,'FILTER')]", asserters.isDisplayed, 90000)
                    .click();
                  });
                // }
              });
          }
      });
    },

    selectUserFlashcardViewBeforeCreateFlashcard: function (browser) {
        return browser
            .sleep(2000)
            .execute("window.scrollTo(0,0)")
            .sleep(1000)
            .waitForElementByCss("ul li[class='ng-isolate-scope active']", asserters.isDisplayed, 90000)
            .waitForElementByCss("button.filter-button.ng-binding", asserters.isDisplayed, 90000)
            .click().then(function(){
            return  browser
                .waitForElementByXPath("//li[contains(@class,'ng-binding') and contains(text(),'My Flashcards')]", asserters.isDisplayed, 90000)
                .click()
                .waitForElementByXPath("//button[contains(.,'FILTER')]", asserters.isDisplayed, 90000)
                .click()
                .waitForElementByCss("ul li[class='ng-isolate-scope active']", asserters.isDisplayed, 90000);
            })
    },

    NavigateToStudyBoard: function (browser, done) {
        browser
            .waitForElementByXPath("//div[@class='icon-studyboard-blue']", asserters.isDisplayed, 120000)
            .click()
            .waitForElementByXPath("//h1[contains(.,'StudyBoard')]", asserters.isDisplayed, 120000)
            .nodeify(done);
    },

    Verifykeytermflashcardselected: function (browser, done) {
        browser
            // .sleep(5000)
            .waitForElementByCss("button.filter-button.ng-binding", asserters.isDisplayed, 90000)
            .isEnabled()
            .waitForElementByCss("button.filter-button.ng-binding", asserters.isDisplayed, 90000)
            .isDisplayed()
            .waitForElementByCss("button.filter-button.ng-binding", asserters.isDisplayed, 90000)
            .click()
            // .sleep(1000)
            .waitForElementByCss("#keyterm-flashcards li[class='ng-binding active']", asserters.isDisplayed, 90000).then(function () {
                console.log(report.reportHeader() +
                    report.stepStatusWithData("Key Term Flash Card tab is Active", "success") +
                    report.reportFooter());
                browser
                    // .sleep(2000)
                    .waitForElementByCss("button.filter-button.ng-binding", asserters.isDisplayed, 90000)
                    .click()
                    .nodeify(done);
            });

    },

    clearAllFilters: function(browser, done){
      return browser
        .waitForElementByCss("button.filter-button.ng-binding", asserters.isDisplayed, 90000)
          .click()
          .sleep(2000)
            .waitForElementByCss(".clear-all-filters", asserters.isDisplayed, 90000)
            .click()
            .nodeify(done);
    },

    validateTextForFlashcardPresent: function(browser){
      return browser
        .waitForElementByCss(".no-matches.ng-scope.ng-binding", asserters.isDisplayed, 90000);
    },

    validateChaptersUnderDropdownList: function(browser){
      return browser
        .waitForElementsByCss(".select-wrapper select option", asserters.isDisplayed, 90000);
    },

    validateFlashcardVisiblility: function(browser){
      return browser
        .waitForElementByCss(".flash-alert.tip-alert .ng-scope.ng-binding", asserters.isDisplayed, 90000);
    },

    validateText: function(browser){
      return browser
        .waitForElementByCss(".no-matches.ng-scope.ng-binding", asserters.isDisplayed, 90000);
    },
    validateFrontContentOnReviewDeck: function(browser){
      return browser
          .waitForElementByCss(".flashcard.front .content",asserters.isDisplayed, 90000)
          .text();
    },

    clickBackArrowOnReviewDeck: function(browser){
      return browser
      .waitForElementByXPath("//a[contains(text(),'Back')]", asserters.isDisplayed, 90000).sleep(2000)
       .click();
    },

    clickOnArrowIconOnReviewDeck: function(browser){
      return browser
      .waitForElementByCss(".icon-arrow-flip.ng-binding", asserters.isDisplayed, 90000).click();
    },

    validateBackContentOnReviewDeck: function(browser){
      return browser
          .waitForElementByCss(".flashcard.back .content",asserters.isDisplayed, 90000)
          .text();
    },

    validateUserFlashCardOnStudyBoard : function(browser){
      return browser
        .execute("window.scrollTo(0,400)")
         .sleep(1000)
        // .waitForElementByXPath("(//div[contains(@class,'studybit flashcard text')]//div[@class='overlay'])[1]",asserters.isDisplayed, 90000)
        .waitForElementByXPath("//li[not(contains(@class,'ng-hide'))]//div[contains(@class,'studybit flashcard text')]//div[@class='overlay']",asserters.isDisplayed, 90000)
        .click()
        .sleep(1000)
        .waitForElementByXPath("//li[@class='tag-item ng-scope']//span",asserters.isDisplayed, 90000)
        .text();
    },

    closeExpandedFlashcard : function(browser,done){
          browser
          .execute("window.scrollTo(0,100)")
          .sleep(1000)
          .waitForElementByXPath("//button[contains(@class,'icon-close-x-blue')]", asserters.isDisplayed, 60000).then(function(scrollToCloseIcon){
            return browser
            // .getLocationInView(scrollToCloseIcon)
            .waitForElementByXPath("//button[contains(@class,'icon-close-x-blue')]", asserters.isDisplayed, 60000)
            .click()
            .nodeify(done);
          });
    },
    verifyPresenceOfShuffle: function(browser,text){
      return browser
      .waitForElementByCss(".shuffle-checkbox.ng-scope", asserters.isDisplayed, 10000)
      .text()
      .should.eventually.include(text);
    },
    clickOnExitButton:function(browser,done){
      return browser
          .waitForElementByCss(".exit.ng-scope", asserters.isDisplayed, 10000)
          .click()
          .waitForElementByCss("ul li[class='ng-isolate-scope active']", asserters.isDisplayed, 90000)
          .nodeify(done);
    },

    validateCountForKeytermFlashCardOnPROD: function(browser){
      return browser
      .waitForElementByCss("div.indicator.strong div.numeral.ng-binding", asserters.isDisplayed, 60000)
      .text()
      .should.eventually.include("1")
      .waitForElementByCss("div.indicator.strong div.previous.ng-binding", asserters.isDisplayed, 60000)
      .text()
      .should.eventually.include("Was 0")
      },

    validateCountForKeytermFlashCard: function(browser,comprehensionlevelAfterTheChange,GlobalCount){
      return browser
      .waitForElementByCss("div.indicator.unassigned div.numeral.ng-binding", asserters.isDisplayed, 60000)
      .text()
      .should.eventually.include(comprehensionlevelAfterTheChange)
      .waitForElementByCss("div.indicator.unassigned div.previous.ng-binding", asserters.isDisplayed, 60000)
      .text()
      .should.eventually.include("Was " + GlobalCount)
      .waitForElementByCss("div.indicator.strong div.numeral.ng-binding", asserters.isDisplayed, 60000)
      .text()
      .should.eventually.include("1")
      .waitForElementByCss("div.indicator.strong div.previous.ng-binding", asserters.isDisplayed, 60000)
      .text()
      .should.eventually.include("Was 0")
    },

  navigateToPublisherFlashcardReview : function(browser){
    return browser
    .execute("window.scrollTo(0,0)")
    .sleep(2000)
    .waitForElementByCss("button.filter-button.ng-binding", asserters.isDisplayed, 90000)
    .click()
    .execute("window.scrollTo(0,0)")
    .sleep(1000)
    .waitForElementByCss(".review-deck", asserters.isDisplayed, 90000)
    .click();
  },

  expandTheFlashCard : function(browser){
    return browser
        .execute("window.scrollTo(0,500)")
        .waitForElementByCss(".studybits div[data-ordinal='1'] ul li:nth-child(4)", asserters.isDisplayed, 10000)
        .click();
  },
  getCardNoOnReviewDeck : function(browser){
    return browser
    .waitForElementByCss(".card-counter", asserters.isDisplayed, 90000);
  },
  clickOnNextButton : function(browser){
    return browser
        .waitForElementByXPath("//button[contains(.,'Next')]", asserters.isDisplayed, 90000).click();
  },
  flashCardCountOfComprehensionLevel : function(browser,comprehension){
    return browser
        .waitForElementByXPath("//div[contains(@class,'" + comprehension + "')]//div[contains(@class,'numeral')]");
  },
  diselectFlashComprehensionLavelIs : function(browser,comprehension){
    return browser
        .waitForElementByXPath("//button[contains(.,'REVIEW SELECTED')]", asserters.isDisplayed, 90000).click()
        .waitForElementByXPath("//button[contains(@class,'active')and contains(.,'" + comprehension + "')]", asserters.isDisplayed, 90000)
        .click();
  },
  clickOnCreateFlashcardFromSB : function(browser){
    return browser
    .waitForElementByCss(".create-flashcard.ng-scope", asserters.isDisplayed, 90000)
    .click();
  },

  checkForMathEquation: function(browser){
    return browser
    .sleep(3000)
    // .waitForElementByCss(".overlay", asserters.isDisplayed, 90000)
    .waitForElementByCss(".studybit.flashcard.text.unassigned", asserters.isDisplayed, 90000)
    .click()
    // .hasElementByCss(".MathJax_Display");
    .hasElementByCss(".content.mathjax-side.ng-binding");
  },
  checkForScroller: function(browser){
    return browser
      .sleep(1000)
      .waitForElementByCss(".content.mathjax-side").getComputedCss("overflow");
  },
  verifyIfFrontIsEditable: function (browser){
    return browser
    .waitForElementByCss("#add-flashcard-form .edit-front p").text();
  },
  validateUserFlashCardOnStudyBoardForCourseB : function(browser){
     return browser
       .sleep(4000)
       .execute("window.scrollTo(0,0)")
        .sleep(1000)
     //  .waitForElementByXPath("//p[contains(text(),'Behaviorism')]",asserters.isDisplayed, 90000)
       .waitForElementByXPath("((//section[@class='studybits flashcards']//ul)[1]//li[not(contains(@class,'ng-hide'))])[1]",asserters.isDisplayed, 90000)
       .click()
       .sleep(1000)
       .waitForElementByXPath("//li[@class='tag-item ng-scope']//span",asserters.isDisplayed, 90000)
       .text();
  },

  editKeyTermFlashcard : function(browser,usertag){
    return browser
      // .execute("window.scrollTo(0,400)")
        .sleep(2000)
        .execute("window.scrollTo(0,0)")
       .sleep(2000)
    //  .waitForElementByXPath("//p[contains(text(),'Behaviorism')]",asserters.isDisplayed, 90000)
      .waitForElementByCss(".studybits div[data-ordinal='1'] ul li:nth-child(3)",asserters.isDisplayed, 90000)
      .click()
      .sleep(1000)
      .waitForElementByCss(".banner .studybit-details .tags.is-expanded .tags #tags", asserters.isDisplayed, 90000)
      .type(usertag)
      .sleep(1000)
      .type(wd.SPECIAL_KEYS.Tab)
      .type(wd.SPECIAL_KEYS.Enter)
      .waitForElementByCss(".tag-item.ng-scope",asserters.isDisplayed, 60000)
      .sleep(1000).then(function(){
        if(process.env.RUN_IN_BROWSER.toString() === "\"internet explorer\"" || process.env.RUN_IN_BROWSER.toString() === "\"firefox\"") {
        return browser
        .execute("document.getElementsByClassName('save')[1].click()")
        .sleep(2000);
      }else {
        return browser
        .waitForElementByXPath("//button[contains(text(),'Save')]", asserters.isDisplayed, 90000)
        .click();
      }
      });
  },

    fetchTextOnKeytermFlashcard: function (browser) {
    return browser
    .sleep(2000)
    .execute("window.scrollTo(0,0)")
   .sleep(2000)
   .waitForElementByCss(".studybits div[data-ordinal='1'] ul li:nth-child(2) p",asserters.isDisplayed, 90000)
  },

  editChapterOfKeyTermFlashcard: function (browser, chapter) {
    return browser
    // .waitForElementByXPath("//select", asserters.isDisplayed, 90000)
    // .click()
    .waitForElementByXPath("(//select[contains(@ng-model,'model.chapter')]//option[contains(.,'"+chapter+"')])", asserters.isDisplayed, 90000)
    .click()
    .sleep(1000)
    .waitForElementByXPath("//button[contains(text(),'Save')]", asserters.isDisplayed, 90000)
    .click();
  },

  getFrontTextBeforeEdit: function (browser) {
    return browser
    .execute("return document.getElementsByClassName('edit-front')[1].getElementsByTagName('textarea')[0].value");
  },

  validateEditedFlashcardChapter: function (browser, chapter, frontText) {
    return browser
    .waitForElementsByXPath("//div[@data-ordinal='"+chapter+"']//div[@class='front']//p[contains(text(),'"+frontText+"')]", asserters.isDisplayed, 90000);
  },

  validateEditedFlashcardChapterPresent: function (browser, frontTextOfFlashcardBeforeEdit) {
    return browser
    .hasElementByXPath("//section[@class='studybits flashcards']//div//ul/li//p[text()='"+frontTextOfFlashcardBeforeEdit+"']");
  }

};
