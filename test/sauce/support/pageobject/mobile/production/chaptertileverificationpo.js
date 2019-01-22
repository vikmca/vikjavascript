var wd = require('wd');
var asserters = wd.asserters;
var report = require("../../../../support/reporting/reportgenerator");
var _ = require('underscore');
var loginPage = require("./loginpo");
var basicpo = require("./basicpo.js")
var createNewCoursepo = require("./createNewCoursepo");
var productData = loginPage.getProductData();
module.exports = {


    verifychaptertileimage: function (browser, done, urlfirstimg) {
        browser
            .waitForElementByXPath("(//div[contains(@class,'featured') and contains(@ng-style,'background-image')])[1]", 2000).getAttribute("style").then(function (style) {
                if ((style.indexOf(urlfirstimg)) > -1) {
                    console.log(report.reportHeader() +
                        report.stepStatusWithData("Correct Image Display On Chapter Tiles", "success") +
                        report.reportFooter());
                    done();
                } else {
                    console.log(report.reportHeader() +
                        report.stepStatusWithData("Incorrect Image Display On Chapter Tiles", "failure") +
                        report.reportFooter());
                    done();
                }
            });

    },

    verifycarouselview: function (browser, done, idofheading, heading, idofsecondimage) {
      return browser
        .execute("return document.getElementsByClassName('banner ng-scope')[1].getElementsByClassName('featured-items')[0].getElementsByTagName('li').length").then(function(feature){
            if (feature == 6) {
                console.log(report.reportHeader() +
                    report.stepStatusWithData("Verify the presence of 6 Chapter highlight boxes on Carousel View", "success") +
                    report.reportFooter());
                 browser
                 .execute('window.scrollTo(0,300)')
                 .sleep(2000)
                    .waitForElementByXPath("(//li[@class='chapter ng-scope selected']//ul[@class='featured-items']//li)[1]/a/div/img", 3000).getAttribute('src').then(function (href) {
                        browser.waitForElementByXPath("(//li[@class='chapter ng-scope selected']//ul[@class='featured-items']//li)[1]/a/div/img", 3000).click()
                            .sleep(1000).waitForElementByCss(idofheading, asserters.isDisplayed,30000).text().then(function (text) {
                                if (text.indexOf(heading) > -1) {
                                    console.log(report.reportHeader() + report.stepStatusWithData("Verify the Carousel is loaded with the","correct asset "+text+"","success") + report.reportFooter());
                                } else {
                                    console.log(report.reportHeader() + report.stepStatusWithData("Verify the Carousel is loaded with the","correct asset "+text+"","failure") + report.reportFooter());
                                }
                                browser.waitForElementByCss('.owl-next', asserters.isDisplayed, 10000).click()
                                    .waitForElementByCss('#' + idofsecondimage, asserters.isDisplayed, 10000)
                                    .isDisplayed()
                                    .should.become(true)
                                    .waitForElementByXPath("(//a[@class='icon-close-x'])[last()]", asserters.isDisplayed, 10000).then(function (close) {
                                        close.click();
                                        console.log(report.reportHeader() + report.stepStatusWithData("Verify the Presence of Close Button on Carousel Loaded View","","success") + report.reportFooter());
                                        done();
                                    });
                            });
                    });
            }
            else {
                console.log(report.reportHeader() + report.stepStatusWithData("Verify the presence of 6 Chapter highlight boxes on Carousel View","","failure") + report.reportFooter());
                // done();
            }
          });
    },

    verifyIconsWithEachFeaturedItem: function (browser, done){
      return browser
      .waitForElementsByCssSelector("li[class='chapter ng-scope selected']", asserters.isDisplayed, 60000)
      .then(function (banner) {
        //banner[0].elementsByXPath("//li[@class='banner ng-scope']//ul[@class='featured-items']//li").then(function (elements) {
        browser.execute("return document.getElementsByClassName('banner ng-scope')[1].getElementsByClassName('featured-items')[0].getElementsByTagName('li').length").then(function(elements){
          var countcarousel = 1;
          function verifyicon() {
            if (countcarousel <= elements) {
              return browser
              .waitForElementByXPath("(//li[@class='chapter ng-scope selected']//ul[@class='featured-items']//li)[" + countcarousel + "]//a/span", asserters.isDisplayed, 10000)
              .getAttribute('class').then(function (attributeicon) {
                if (attributeicon.indexOf("video-featured-icon") > -1) {
                  browser
                  .waitForElementByXPath("(//li[@class='chapter ng-scope selected']//ul[@class='featured-items']//li)[" + countcarousel + "]//a/span", asserters.isDisplayed, 10000)
                  .then(function(element){
                    browser
                    .getComputedCss(element, 'background-Image')
                    .then(function(property){
                      browser
                      .waitForElementByXPath("(//li[@class='chapter ng-scope selected']//ul[@class='featured-items']//li)[" + countcarousel + "]//img").getAttribute('alt').then(function(ele){
                        if (ele === null) {
                          console.log("No Alternate Text Found For Video Items");
                        } else {
                          console.log("Alternate Text Found For Video Items : " +ele );
                        }
                      });
                      if(property.indexOf("content-type-video")>-1){
                        console.log(report.reportHeader() +
                        report.stepStatusWithData("At position " + countcarousel + " featured item has a video icon",property,"success") +
                        report.reportFooter());
                        countcarousel++;
                        verifyicon();
                      }
                      else
                      {
                        console.log(report.reportHeader() +
                        report.stepStatusWithData("At position " + countcarousel + " featured item has no video icon",property,"failure") +
                        report.reportFooter());
                        countcarousel++;
                        verifyicon();
                      }
                    });
                  });
                }
                else if (attributeicon.indexOf("narrative-featured-icon") > -1) {
                  browser
                  .waitForElementByXPath("(//li[@class='chapter ng-scope selected']//ul[@class='featured-items']//li)[" + countcarousel + "]//a/span", asserters.isDisplayed, 10000).then(function(element){
                    browser
                    .getComputedCss(element, 'background-Image').then(function(property){
                      browser
                      .waitForElementByXPath("(//li[@class='chapter ng-scope selected']//ul[@class='featured-items']//li)[" + countcarousel + "]//img").getAttribute('alt').then(function(ele){
                        if (ele === null) {
                          console.log("No Alternate Text Found For Image Items");
                        } else {
                          console.log("Alternate Text Found For Image Items : " +ele );
                        }
                      });
                      if(property.indexOf("content-type-text")>-1){
                        console.log(report.reportHeader() +
                        report.stepStatusWithData("At position " + countcarousel + " featured item has a image icon",property,"success") +
                        report.reportFooter());
                        countcarousel++;
                        verifyicon();
                      }
                      else{
                        console.log(report.reportHeader() +
                        report.stepStatusWithData("At position " + countcarousel + " featured item has no image icon",property,"failure") +
                        report.reportFooter());
                        countcarousel++;
                        verifyicon();
                      }
                    });
                  });
                }
                else if (attributeicon.indexOf("assessment-featured-icon") > -1) {
                  browser
                  .waitForElementByXPath("(//li[@class='chapter ng-scope selected']//ul[@class='featured-items']//li)[" + countcarousel + "]//a/span", asserters.isDisplayed, 10000).then(function(element){
                    browser
                    .getComputedCss(element, 'background-Image').then(function(property){
                      if(property.indexOf("content-type-assessment")>-1){
                        console.log(report.reportHeader() +
                        report.stepStatusWithData("At position " + countcarousel + " featured item has a assessment icon",property,"success") +
                        report.reportFooter());
                        countcarousel++;
                        verifyicon();
                      }
                      else{
                        console.log(report.reportHeader() +
                        report.stepStatusWithData("At position " + countcarousel + " featured item has no assessment icon",property,"failure") +
                        report.reportFooter());
                        countcarousel++;
                        verifyicon();
                      }
                    });
                  });
                }
                else {
                  console.log(report.reportHeader() +
                  report.stepStatusWithData("At position " + countcarousel + " featured item has no video/image/assessment icon",property,"success") +
                  report.reportFooter());
                  countcarousel++;
                  verifyicon();
                }
              });
            } else
            { if ((countcarousel - 1) === elements) {
              console.log(report.reportHeader() +
              report.stepStatusWithData("All "+ elements +" featured items icons traced", "success") +
              report.reportFooter());
              done();
            } else {
              console.log(report.reportHeader() +
              report.stepStatusWithData("All featured items icons could not be traced","","failure") +
              report.reportFooter());
              done();
            }
          }
        }
        verifyicon();
      });
    });
  },
    clickOnNextButtonBottomOfPage : function(browser,done,chapter){
      browser
         .sleep(5000)
          //.execute("document.getElementsByClassName('ng-scope ng-binding')[5].scrollIntoView(true)")
          .waitForElementsByCss(".footer-container.ng-scope", asserters.isDisplayed, 30000).then(function(Bottomfooter){
            return browser
              .getLocationInView(Bottomfooter)
         .sleep(2000)
          .waitForElementByXPath("(//a[contains(.,'Topic 2-CI')])[2]", asserters.isDisplayed, 60000)
          .click()
          .sleep(15000)
          .waitForElementByCss(".topic-title span", asserters.isDisplayed, 60000)
          .text()
          .should.eventually.include(chapter)
          .sleep(15000)
          .nodeify(done);
        });
    },

    verifyItemSequenceAtCarousel: function (browser, done){
    return browser
        .waitForElementsByXPath("//li[@class='chapter ng-scope selected']//ul[@class='featured-items']/li", asserters.isDisplayed, 10000).then(function(feature){
          if (_.size(feature) == 6) {
            var featuredItemCount =0;
              console.log(report.reportHeader() +
                  report.stepStatusWithData("Verify the presence of 6 Chapter highlight boxes on Carousel View", "success") +
                  report.reportFooter());
                 browser
                    .execute('window.scrollTo(0,300)')
                     .sleep(2000)
                    .waitForElementByXPath("(//li[@class='chapter ng-scope selected']//ul[@class='featured-items']//li)[1]/a/div/img", asserters.isDisplayed, 10000).getAttribute('src').then(function (href) {
                     browser.waitForElementByXPath("(//li[@class='chapter ng-scope selected']//ul[@class='featured-items']//li)[1]/a/div/img", asserters.isDisplayed, 10000).click()
                          .sleep(1000).waitForElementByCss(productData.chapter.topic.carousel.idofheading, asserters.isDisplayed,30000).text().then(function (text) {
                              if (text.indexOf(productData.chapter.topic.carousel.heading) > -1) {
                                  console.log(report.reportHeader() + report.stepStatusWithData("Verify the Carousel is loaded with the","correct asset","success") + report.reportFooter());
                              } else {
                                  console.log(report.reportHeader() + report.stepStatusWithData("Verify the Carousel is loaded with the","correct asset","failure") + report.reportFooter());
                              }
                              function clickOnNext(){
                                if(featuredItemCount < _.size(feature)){
                                return browser.waitForElementByCss('.owl-next', asserters.isDisplayed, 10000).click().then(function(){
                                    featuredItemCount++;
                                    clickOnNext();
                                  });
                                }else {
                                  if(featuredItemCount == _.size(feature)){
                                    browser
                                    .waitForElementByCss(productData.chapter.topic.carousel.idofheading, asserters.isDisplayed,30000).text().then(function (text) {
                                        if (text.indexOf(productData.chapter.topic.carousel.heading) > -1) {
                                            console.log(report.reportHeader() + report.stepStatusWithData("Verify the Carousel is loaded with the","fist asset after navigating all items using next button","success") + report.reportFooter());
                                            done();
                                        } else {
                                            console.log(report.reportHeader() + report.stepStatusWithData("Verify the Carousel is loaded with the","fist asset after navigating all items using next button","failure") + report.reportFooter());
                                        }
                                      });
                                  }else {
                                    console.log(report.reportHeader() + report.stepStatusWithData("icons count for thumbnails "+_.size(feature)+" is compared against the items on carousel","featuredItemCount","failure") + report.reportFooter());
                                  }
                                }

                              }clickOnNext();
                          });
                  });
                }
                else {
                    console.log(report.reportHeader() + report.stepStatusWithData("Verify the presence of 6 Chapter highlight boxes on Carousel View","","failure") + report.reportFooter());
                }
          });
    },

    verifyAlternativeTextForFeaturedItems: function (browser, done){
      var countcarousel =1;
      var statusOfAllElementAltText=0;
      return browser
      .waitForElementsByXPath("(//li[@class='banner ng-scope']//ul[@class='featured-items']//li)//img").then(function(featured_items){
        function verifyText() {
          if(countcarousel <= _.size(featured_items)) {
            browser
            .waitForElementByXPath("(//li[@class='banner ng-scope']//ul[@class='featured-items']//li)[" + countcarousel + "]//img")
            .getAttribute('alt').then(function(alternateText){
              if (alternateText === "") {
                console.log(report.reportHeader() +
                report.stepStatusWithData("Featured item " + countcarousel + " has no alternate text"," "," success") +
                report.reportFooter());
              } else {
                statusOfAllElementAltText++;
                console.log(report.reportHeader() +
                report.stepStatusWithData("Featured item " + countcarousel + " has alternate text: ",alternateText," failure") +
                report.reportFooter());
              }
              countcarousel++;
              verifyText();
            });
          }else {
            var countOfItems= _.size(featured_items);
            if(statusOfAllElementAltText === countOfItems){
              console.log(report.reportHeader() +
              report.stepStatusWithData("All thumbnail images have an alternative text","true","success") +
              report.reportFooter());
              done();
            }else {
              console.log(report.reportHeader() +
              report.stepStatusWithData("No thumbnail images have an alternative text","","failure") +
              report.reportFooter());
            }
          }
        }
        verifyText();
      });
    },
    verifyKeyTermOnChapterReview: function(browser, done, cssofkeyterm, value, idofkeyterm, keyterm){
      return browser
      .execute("window.scrollTo(0,0)")
      .waitForElementByCss("#" + cssofkeyterm, asserters.isDisplayed, 60000)
      .text()
      .should.eventually.include(value)
      .waitForElementByCss("#" + idofkeyterm, asserters.isDisplayed, 60000)
      .text()
      .should.eventually.include(keyterm)
      .waitForElementsByCssSelector(".rs_preserve.reader.ng-isolate-scope", asserters.isDisplayed, 60000).then(function (readerContents) {
        readerContents[0].elementsByXPath("//iframe").then(function (elements) {
          if (_.size(elements) === 2) {
            console.log(report.reportHeader() +
              report.stepStatus("Chapter Review Page displays ",_.size(elements) + " games", "success") +
              report.reportFooter());
            done();
          } else {
            console.log(report.reportHeader() +
              report.stepStatus("Chapter Review Page has not displayed ",_.size(elements) + " games", "failure") +
              report.reportFooter());
          }
        });
      });
    },

    verifyImagesPresent: function (browser){
    return browser
      .hasElementByXPath("(//li[@class='chapter ng-scope selected']//ul[@class='featured-items']//li)[1]//a/div/img");
    },

    navigateToMenuPage: function (browser,done) {
    basicpo.clickOnMenu(browser);
    return browser
    .waitForElementByCss(".icon-home-blue", asserters.isDisplayed, 10000)
    .click()
    .nodeify(done);

    },

    verifyFlashcardTotalCounterLabel: function (browser) {
    return browser
      .waitForElementByCss(".flashcards-and-controls span.card-counter.ng-scope", asserters.isDisplayed, 10000).getAttribute('translate-value-total')
      .should.eventually.include(productData.chapter.topic.flashcard.flashcardontoc.totalcards);

    },

    verifyFrontAndBackFlashCardOnTOC: function (browser, done, cardnumber) {
    return browser
    .waitForElementByCss(".card-counter.ng-scope", asserters.isDisplayed, 10000)
    .getAttribute('translate-value-total')
    .then(function (flashcardcount) {
        GlobalCount = flashcardcount;
    function reviewallkeytermflshcard() {
        if (cardnumber <= GlobalCount) {
        //   if (cardnumber == 1) {
        //     browser
        //         .waitForElementByCss("article div", asserters.isDisplayed, 5000).text().then(function (fronttext) {
        //             console.log(report.reportHeader() +
        //                 report.stepStatusWithData("Reviewing Card " + cardnumber + " text present on the front of the card and printing it as", "\" " + fronttext + "\"", "success") +
        //                 report.reportFooter());
        //             browser
        //                 .waitForElementByCss(".icon-arrow-flip.ng-binding", asserters.isDisplayed, 10000)
        //                 .click()
        //                 .sleep(1000)
        //                 .waitForElementByCss("article div", asserters.isDisplayed, 5000).text().then(function (backtext) {
        //                     console.log(report.reportHeader() +
        //                         report.stepStatusWithData("Reviewing Card " + cardnumber + " text present on the back of the card and printing it as", "\" " + backtext + "\"", "success") +
        //                         report.reportFooter());
        //           browser
        //               .waitForElementByXPath("//button[contains(@class,'ng-scope ng-binding') and contains(text(),'STRONG')]", asserters.isDisplayed, 10000)
        //               .click()
        //               .sleep(1000)
        //               .waitForElementByCss(".next button", asserters.isDisplayed, 10000)
        //               .click()
        //               .waitForElementByCss(".previous button", asserters.isDisplayed, 10000).then(function () {
        //                   console.log(report.reportHeader() +
        //                       report.stepStatusWithData("Previous Button is Displayed: ","","success") +
        //                       report.reportFooter());
        //                   cardnumber++;
        //                   reviewallkeytermflshcard();
        //               });
        //         });
        //       });
        //   } else {
              browser
                  .waitForElementByCss(".next button", asserters.isDisplayed, 10000)
                  .click().then(function () {
                      console.log(report.reportHeader() +
                          report.stepStatusWithData("Flashcard "+cardnumber+" has been navigated","", "success") +
                          report.reportFooter());
                      cardnumber++;
                      reviewallkeytermflshcard();
                  });
        //   }
        }
        else {
            done();
        }
    }
    reviewallkeytermflshcard();
      });
  },


    validateCountFlashCard: function(browser, comprehension, count, totalCount){
      return browser
      .waitForElementByCss("div.indicator."+comprehension+" div.numeral.ng-binding", asserters.isDisplayed, 60000)
      .text()
      .should.eventually.include(count)
      .waitForElementByCss("div.indicator."+comprehension+" div.previous.ng-binding", asserters.isDisplayed, 60000)
      .text()
      .should.eventually.include("Was "+totalCount)
    },

    validatePresenceOfResults: function(browser){
      return browser
      .waitForElementByCss(".flashcard-review-start h6", asserters.isDisplayed, 60000)
      .text()
      .should.eventually.include("Your Results");
    },
    verifyPresenceOfReviewSelected: function(browser){
      return browser
      .waitForElementByXPath("//label[@class='shuffle-checkbox ng-scope']//following-sibling::button", asserters.isDisplayed, 60000)
      .text()
      .should.eventually.include("REVIEW SELECTED");
    },
    clickOnShowMore: function(browser){
      return browser
      .waitForElementByCss(".show-more.ng-scope", asserters.isDisplayed, 60000)
      .click();
    },
    validateFlashcardIsActive: function(browser){
      return browser
      .waitForElementByCss(".view-select a[class='active ng-binding']", asserters.isDisplayed, 60000);

    },

    clickOnReviewSelectedOption: function(browser, done){
      return browser
      .waitForElementByXPath("//label[@class='shuffle-checkbox ng-scope']//following-sibling::button", asserters.isDisplayed, 60000)
      .click()
      .nodeify(done);

    },

    verifyPageNavigateToFlashcardDeck: function(browser){
      return browser
      .waitForElementByCss(".card-counter.ng-scope", asserters.isDisplayed, 60000);

    },

    verifyFlashcardReviewLabel: function (browser) {
    return browser
      .waitForElementByCss(".flashcard-review.chapter-flashcard.ng-scope header h6", asserters.isDisplayed, 10000).text().should.eventually.include("Flashcard Review");

    },

  changeComprehensionLevel: function(browser, cardnumber, comprehensionValue){
     return browser
             .waitForElementByCss("article div", asserters.isDisplayed, 10000).text().then(function (fronttext) {
                 console.log(report.reportHeader() +
                     report.stepStatusWithData("Reviewing Card " + cardnumber + " text present on the front of the card and printing it as", "\" " + fronttext + "\"", "success") +
                     report.reportFooter());
                 return browser
                     .waitForElementByCss(".icon-arrow-flip.ng-binding", asserters.isDisplayed, 10000)
                     .click()
                     .sleep(1000)
                     .waitForElementByCss("article div", asserters.isDisplayed, 10000).text().then(function (backtext) {
                         console.log(report.reportHeader() +
                             report.stepStatusWithData("Reviewing Card " + cardnumber + " text present on the back of the card and printing it as", "\" " + backtext + "\"", "success") +
                             report.reportFooter());
               return browser
                   .waitForElementByXPath("//button[contains(@class,'ng-scope ng-binding') and contains(text(),'"+comprehensionValue+"')]", asserters.isDisplayed, 10000)
                   .click()
                   .sleep(1000)
                   .waitForElementByCss(".icon-arrow-flip.ng-binding", asserters.isDisplayed, 10000)
                   .click()
                   .sleep(1000)
                   .waitForElementByCss("article div", asserters.isDisplayed, 10000).text();
             });
           });
  },

  clickOnNext: function(browser){
    return browser
        .waitForElementByCss(".next button", asserters.isDisplayed, 10000)
        .click();
    },

    getFrontTextBasedOnComprehension : function(browser, chapter, comprehensionLevel){
        return browser
            .waitForElementByXPath("//section[@class='studybits flashcards']//h2[contains(text(),'"+chapter+"')]//parent::div//ul//li//div[@class='studybit flashcard keyterm "+comprehensionLevel+"']//p", asserters.isDisplayed, 90000)
            .text();
    },

    clickOnFront: function(browser){
        return browser
            // .waitForElementByCss(".icon-arrow-flip.ng-binding", asserters.isDisplayed, 10000)
             .waitForElementByXPath("//a[contains(@class,'icon-arrow-flip') and contains(text(),'Front')]", asserters.isDisplayed, 30000)
            .click();
    },

       clickOnFlashcardReview: function(browser){
            return browser
            .waitForElementByCss(".flashcard-review-start-action button", asserters.isDisplayed, 90000)
            .click();
       },

      reviewAllFlashcardAndChangeComprehension: function (browser, done, cardnumber, comprehensionLevel) {
        return browser
        .waitForElementByCss(".card-counter.ng-scope", asserters.isDisplayed, 10000)
        .getAttribute('translate-value-total')
        .then(function (flashcardcount) {
            var GlobalCount = flashcardcount;
        function reviewallkeytermflshcard() {
            if (cardnumber <= GlobalCount) {
                   return browser
                  .sleep(1000)
                  .hasElementByCss(".comprehension button[aria-checked='true']").then(function(changedStatus){
                      if(changedStatus){
                         return browser
                              .waitForElementByCss(".comprehension button[id='"+comprehensionLevel+"-button']", asserters.isDisplayed, 10000)
                              .click()
                              .waitForElementByCss(".next button", asserters.isDisplayed, 10000)
                              .click().then(function () {
                                  console.log(report.reportHeader() +
                                      report.stepStatusWithData("Flashcard "+cardnumber+" has been navigated","", "success") +
                                      report.reportFooter());
                                  cardnumber++;
                                  reviewallkeytermflshcard();
                              });
                      }else{
                          return browser
                               .waitForElementByCss(".next button", asserters.isDisplayed, 10000)
                               .click().then(function () {
                                   console.log(report.reportHeader() +
                                       report.stepStatusWithData("Flashcard "+cardnumber+" has been navigated","", "success") +
                                       report.reportFooter());
                                   cardnumber++;
                                   reviewallkeytermflshcard();
                               });
                      }
                  });
            }
            else {
                done();
            }
        }
        reviewallkeytermflshcard();
          });
      },

      validateFlashcardByFrontText: function(browser, chapter, comprehensionLevel, frontText){
          return browser
               .waitForElementByXPath("//section[@class='studybits flashcards']//h2[contains(text(),'"+chapter+"')]//parent::div//ul//li//div[@class='studybit flashcard keyterm "+comprehensionLevel+"']//p[contains(text(),'"+frontText+"')]", asserters.isDisplayed, 90000);
    },

    findFlashcardCount: function(browser){
               return browser
               .waitForElementByCss(".card-counter.ng-scope", asserters.isDisplayed, 10000)
               .getAttribute('translate-value-total');
    },

     getFlashcardCountsOnFlashcardPage: function(browser, chapter){
         return browser
             .waitForElementsByXPath("//section[@class='studybits flashcards']//h2[contains(text(),'"+chapter+"')]//parent::div//ul//li", asserters.isDisplayed, 90000);
     }


};
