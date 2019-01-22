var wd = require('wd');
var asserters = wd.asserters;
var loginPage = require("./loginpo");
var studyboardPage = require("./studyboardpo");
var productData =loginPage.getProductData();
var testData = require("../../../../../../test_data/data.json");
var basicpo =  require("./basicpo");
var stringutil = require("../../../../util/stringUtil");
var report = require("../../../../support/reporting/reportgenerator");
var productData =loginPage.getProductData();
var _ = require('underscore');

module.exports = {

    SelectFlashcardTab: function (browser, done) {
        return browser
            .sleep(4000)
            .waitForElementByXPath("//a[@class='ng-binding' and contains(.,'Flashcards')]", asserters.isDisplayed, 45000)
            .click()
            .elementByXPathSelectorWhenReady("//button[contains(@class,'add-flashcard')]", 10000)
            .isDisplayed()
            .should.become(true)
            .nodeify(done);
    },

    verfiychapterIsPresentByDefault : function(browser) {
      return browser
      .waitForElementByCss(".static-select.ng-scope",asserters.isDisplayed, 10000);
    },

    createFlashcard: function (browser) {
        return browser
            // .sleep(3000)
            .elementByXPathSelectorWhenReady("//button[contains(@class,'add-flashcard')]", 10000)
            .click()
            // .sleep(1000)
            .elementByXPathSelectorWhenReady("(//textarea[@name='front'])[1]", 5000)
            .click()
            .type("Text on the Front of the Flashcard created by Automation  ")
            // .sleep(3000)
            .sleep(3000)
            // .hideKeyboard()
            .elementByXPathSelectorWhenReady("(//textarea[@name='back'])[1]", 5000)
            .click()
            .type("Text on the Back of the Flashcard created by Automation")
            // .hideKeyboard()
            .sleep(1000)
            .elementByXPathSelectorWhenReady("(//select[contains(@ng-model,'model.chapter')]//option[@value='0'])[1]", 10000)
            .click()
            .sleep(1000)
            .elementByXPathSelectorWhenReady("//cg-flashcard-form//div[@class='actions']//button[contains(.,'Done')]", 10000)
            .click()
            // .sleep(1000)
            .execute('window.scrollTo(0,0)')
            .sleep(1000);
    },

    enterDescriptionOnFrontFlashcardField: function (browser,frontText) {
        return browser
            .sleep(3000)
            .waitForElementByXPath("//button[contains(@class,'add-flashcard')]", asserters.isDisplayed, 90000)
            .click()
            .waitForElementByXPath("(//textarea[@name='front'])[1]", asserters.isDisplayed, 90000).then(function(frontSide){
              return browser
                .getLocationInView(frontSide)
                .execute("window.scrollTo(0,-150)")
                .sleep(2000)
                .waitForElementByXPath("(//textarea[@name='front'])[1]", asserters.isDisplayed, 90000)
                .click()
                .type(frontText);
                // .hideKeyboard();
            });
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

    selectChapter: function (browser,chapter) {
      return browser
      .waitForElementByXPath("(//select[contains(@ng-model,'model.chapter')]//option[contains(.,'"+chapter+"')])", asserters.isDisplayed, 90000)
      .click();
    },

    leftCountFromBackFlashcardTextBox: function (browser) {
      return browser
      .execute("return document.getElementsByClassName('remaining-characters ng-scope')[1].textContent");
    },

    fetchCharacterCountFromBackFlashcard : function(browser) {
      return browser
       .execute("return document.getElementsByTagName('input').back.value.length");
    },
    fetchValueFromBackFlashcardField: function (browser) {
        return browser
            .waitForElementByXPath("(//textarea[@name='back'])[1]", asserters.isDisplayed, 90000);
    },

    createFlashcardWithFullDetails: function (browser,done,frontText,backText,chapter,userTag,comprehension) {
        var chapterValue= chapter-1;
        browser
            .sleep(6000)
            // .waitForElementByXPath("//button[contains(@class,'add-flashcard')]", asserters.isDisplayed, 90000)
            // .click()
            .execute("return document.evaluate(\"//button[contains(@class,'add-flashcard')]\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()")
            .sleep(1000)
            .waitForElementByXPath("(//textarea[@name='front'])[1]", asserters.isDisplayed, 90000)
            .click()
            .type(frontText)
            .hideKeyboard()
            .waitForElementByXPath("(//textarea[@name='back'])[1]", asserters.isDisplayed, 90000)
            .click()
            .type(backText)
            .sleep(1000)
            .hideKeyboard()
            // .waitForElementByXPath("//select", asserters.isDisplayed, 90000)
            // .click()
            // .waitForElementByXPath("//select[contains(@ng-model,'model.chapter')]//option[@value='"+chapter+"']", asserters.isDisplayed, 90000)
            // .waitForElementByXPath("(//select[contains(@ng-model,'model.chapter')]//option[contains(.,'"+chapter+"')])", asserters.isDisplayed, 90000)
            .elementByXPathSelectorWhenReady("//select[contains(@ng-model,'model.chapter')]//option[@value='"+chapterValue+"']", 20000)
            .click()
            .waitForElementByCss("#add-flashcard-form input", asserters.isDisplayed, 90000)
            .type(userTag)
            .sleep(1000)
            .type(wd.SPECIAL_KEYS.Enter)
            .hideKeyboard()
            .waitForElementByCss(".tag-item.ng-scope button",asserters.isDisplayed, 60000)
            .waitForElementByXPath("//form[@id='add-flashcard-form']// div[@class='comprehension']//button[contains(.,'"+comprehension+"')]", asserters.isDisplayed, 90000)
            .click()
            .waitForElementByXPath("//cg-flashcard-form//div[@class='actions']//button[contains(.,'Done')]", asserters.isDisplayed, 90000)
            .click()
            // .sleep(1000)
            .nodeify(done);
    },
    flashCardCountOfComprehensionLevel : function(browser,comprehension){
      return browser
          .waitForElementByXPath("//div[contains(@class,'" + comprehension + "')]//div[contains(@class,'numeral')]");
    },

    createFlashcardFromStudyBit: function (browser, done, backText) {
       return  browser
            .waitForElementByCss("#add-flashcard-form", asserters.isDisplayed, 90000)
            .waitForElementByXPath("(//textarea[@name='back'])[1]",asserters.isDisplayed, 90000)
            .type(backText)
            .hideKeyboard()
            .sleep(2000).then(function(){
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
              browser
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
                      .waitForElementByCss("button.filter-button.ng-binding", asserters.isDisplayed, 90000)
                      .click();
                    });
                  // }
                });

          });
    },

    selectUserFlashcardViewBeforeCreateFlashcard: function (browser) {
        return browser
            .execute("window.scrollTo(0,0)")
            .sleep(1000).then(function(){
                return browser
                .sleep(2000)
                .waitForElementByCss("button.filter-button.ng-binding", asserters.isDisplayed, 90000)
                .click().then(function(){
                  return  browser
                      .sleep(2000)
                      .waitForElementByXPath("//li[contains(@class,'ng-binding') and contains(text(),'My Flashcards')]", asserters.isDisplayed, 90000)
                      .click()
                      .sleep(2000)
                      .waitForElementByXPath("//button[contains(.,'FILTER')]", asserters.isDisplayed, 90000)
                      .click()
                        .sleep(2000).then(function(){
                          basicpo.clickOnMenu(browser).then(function(){
                            basicpo.CheckActiveLocatorOnWeb(browser).then(function(){
                              basicpo.clickOnMenu(browser);
                          });
                      });
                  });
                })
              });
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

    validateFrontContentOnReviewDeck: function(browser){
      return browser
          .waitForElementByCss(".flashcard.front .content",asserters.isDisplayed, 90000)
          .text();
    },

     verifyKeyTermFlashcard: function (browser, done) {
      var totalFlashcards = 0;
      var currentChapterNumber = 1;
          function countskeytermflashcard() {
              if (currentChapterNumber <= productData.chapter.topic.flashcards.publisher.chapters[0].totalchaptercount) {
                return browser
                        .sleep(6000).waitForElementByXPath("(//div[@class='chapter ng-scope'])["+currentChapterNumber+"]//h2").then(function (chapterofFlashcards) {
                        return browser.waitForElementsByXPath("(//div[@class='chapter ng-scope'])["+currentChapterNumber+"]//ul//li[contains(@class,'tile column')]").then(function (countofFlashcards) {
                        console.log("No of Flashcard in "+currentChapterNumber+":"+_.size(countofFlashcards));
                        var countofFlashcard =_.size(countofFlashcards);
                          if (countofFlashcard) {
                              currentChapterNumber++;
                              console.log(report.reportHeader() +
                                  report.stepStatusWithData("Number of KeyTerm Flash Cards in Chapter ",currentChapterNumber + ": " + countofFlashcard, "success") +
                                  report.reportFooter());
                              totalFlashcards = totalFlashcards + countofFlashcard;
                                return browser.getLocationInView(chapterofFlashcards).then(function(){
                                    countskeytermflashcard();
                                });
                          }
                          else {
                              currentChapterNumber++;
                              console.log(report.reportHeader() +
                                  report.stepStatusWithData("Number of KeyTerm Flash Cards in Chapter ",currentChapterNumber + ": " + countofFlashcard, "failure") +
                                  report.reportFooter());
                              totalFlashcards = totalFlashcards + countofFlashcard;
                              countskeytermflashcard();
                          }
                        // });
                      });
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
      //});
    },

    clickBackArrowOnReviewDeck: function(browser){
      return browser
      .waitForElementByXPath("//a[contains(text(),'Back')]", asserters.isDisplayed, 90000).sleep(2000)
       .click();
    },

    validateEditedFlashcardChapter: function (browser, chapter, frontText) {
      return browser
      .waitForElementsByXPath("//div[@data-ordinal='"+chapter+"']//div[@class='front']//p[contains(text(),'"+frontText+"')]", asserters.isDisplayed, 90000);
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
        // .waitForElementByXPath("(//div[contains(@class,'studybit flashcard text')]//div[@class='overlay'])[1]",asserters.isDisplayed, 90000)
        // .click()
        .sleep(3000)
        .execute("return document.evaluate(\"(//div[contains(@class,'studybit flashcard text')]//div[@class='overlay'])[1]\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()")
        .sleep(3000)
        .waitForElementByXPath("(//li[contains(@class,'banner')])[1]//li[@class='tag-item ng-scope']//span",asserters.isDisplayed, 90000).then(function(tags){
            return browser
                .getLocationInView(tags)
                .waitForElementByXPath("(//li[contains(@class,'banner')])[1]//li[@class='tag-item ng-scope']//span",asserters.isDisplayed, 90000)
                .text();
        })
        // .waitForElementByCss(".banner .tag-item span",asserters.isDisplayed, 90000)
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
    clickOnExitButton:function(browser,done){
      return browser
          .waitForElementByCss(".exit.ng-scope", asserters.isDisplayed, 10000)
          .click()
        //  .waitForElementByCss("ul li[class='ng-isolate-scope active']", asserters.isDisplayed, 90000)
          .nodeify(done);
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

    validateCountForKeytermFlashCardOnPROD: function(browser){
      return browser
      .waitForElementByCss("div.indicator.strong div.numeral.ng-binding", asserters.isDisplayed, 60000)
      .text()
      .should.eventually.include("1")
      .waitForElementByCss("div.indicator.strong div.previous.ng-binding", asserters.isDisplayed, 60000)
      .text()
      .should.eventually.include("Was 0")
      },

      getFrontTextBeforeEdit: function (browser) {
        return browser
        .execute("return document.getElementsByClassName('edit-front')[1].getElementsByTagName('textarea')[0].value");
      },

      editChapterOfKeyTermFlashcard: function (browser, chapter) {
        return browser
        .waitForElementByXPath("//select", asserters.isDisplayed, 90000)
        .click()
        .waitForElementByXPath("(//select[contains(@ng-model,'model.chapter')]//option[contains(.,'"+chapter+"')])", asserters.isDisplayed, 90000)
        .click()
        .sleep(1000)
        .waitForElementByXPath("//button[contains(text(),'Save')]", asserters.isDisplayed, 90000)
        .click();
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
        .sleep(3000)
        .execute("return window.scrollTo(0,500)")
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
  flashCardCountOfComprehensionLavel : function(browser,comprehension){
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
    .sleep(1000)
    .waitForElementByCss(".overlay", asserters.isDisplayed, 90000)
    .click()
    // .hasElementByCss(".MathJax_Display");
    .hasElementByCss(".math");
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
       .sleep(8000)
    //    .execute("window.scrollTo(0,400)")
    //    .sleep(2000)
    //  .waitForElementByXPath("//p[contains(text(),'Behaviorism')]",asserters.isDisplayed, 90000)
    //   .waitForElementByCss(".studybits div[data-ordinal='1'] ul li:nth-child(3)",asserters.isDisplayed, 90000)
      .waitForElementByXPath("(//section[contains(@class,'studybits')]//div[contains(@class,'content')])[3]",asserters.isDisplayed, 90000).then(function(flashcard){
        return browser
            .getLocationInView(flashcard)
            .execute("return window.scrollBy(0,-140)")
            .sleep(1000)
            // .waitForElementByXPath("(//section[contains(@class,'studybits')]//div[contains(@class,'content')])[3]",asserters.isDisplayed, 90000)
            // .click()
            .execute("return document.getElementsByClassName('studybits')[0].getElementsByClassName('content')[2].click();")
            .sleep(1000)
            .waitForElementByCss(".banner .studybit-details .tags.is-expanded .tags #tags", asserters.isDisplayed, 90000)
            .type(usertag)
            .type(wd.SPECIAL_KEYS.Tab)
            .type(wd.SPECIAL_KEYS.Enter)
            .hideKeyboard()
            .waitForElementByCss(".tag-item.ng-scope",asserters.isDisplayed, 60000)
            .sleep(1000)
            .execute("return document.getElementsByClassName('save')[1].click()");
            // .waitForElementByXPath("//button[contains(text(),'Save')]", asserters.isDisplayed, 90000)
            // .click();
      });

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
  validateChaptersUnderDropdownList: function(browser){
    return browser
    .sleep(2000)
    .waitForElementByXPath("//button[contains(@class,'add-flashcard')]", asserters.isDisplayed, 90000)
    .click()
    .sleep(2000)
    .waitForElementsByCss(".select-wrapper select option", asserters.isDisplayed, 90000);
  },

  validateFlashcardVisiblility: function(browser){
    return browser
      .waitForElementByCss(".flash-alert.tip-alert .ng-scope.ng-binding", asserters.isDisplayed, 90000);
  },
  validateTextForFlashcardPresent: function(browser){
    return browser
      .waitForElementByCss(".no-matches.ng-scope.ng-binding", asserters.isDisplayed, 90000);
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
//   fetchTextOnKeytermFlashcard: function (browser) {
//   return browser
//         .sleep(5000)
//         .execute("return window.scrollTo(0,0)")
//         .sleep(2000)
//         .waitForElementByXPath("(//section[contains(@class,'studybits')]//div[@class='front'])[1]",asserters.isDisplayed, 90000)
//         // .waitForElementByCss(".studybits div[data-ordinal='1'] ul li:nth-child(2) p",asserters.isDisplayed, 90000)
// }
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
