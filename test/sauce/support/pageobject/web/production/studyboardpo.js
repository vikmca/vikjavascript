var wd = require('wd');
var asserters = wd.asserters;
var report = require("../../../../support/reporting/reportgenerator");
var dataUtil = require("../../../../util/date-utility.js");
var _ = require('underscore');
module.exports = {

    clickAndVerifyFilterPanel: function (browser) {
        return browser
            .waitForElementByCss(".filter-button.ng-binding", asserters.isDisplayed, 9000)
            .click()
            .waitForElementByCss(".filters", asserters.isDisplayed, 9000);
    },
    clickAndOnFilerPanel:function (browser) {
        return browser
            .waitForElementByCss(".filter-button.ng-binding", asserters.isDisplayed, 9000)
            .click();

    },

    enterTagValueOnFilterPanel: function (browser, userTagValue) {
        return browser
            .waitForElementByXPath("(//input[@type='text'])[1]", asserters.isDisplayed, 90000)
            .type(userTagValue)
            .sleep(1000)
            .waitForElementByXPath("(//input[@type='text'])[1]", asserters.isDisplayed, 90000)
            .click()
            .sleep(1000)
            .then(function(){
            return browser
                  .waitForElementByXPath("(//ul[@class='suggestion-list']//li)[1]", asserters.isDisplayed, 90000)
                   .click()
                   .waitForElementByCss(".tag-item.ng-scope span",asserters.isDisplayed, 60000);

         });

    },

    // enterTagValueOnFilterPanelFlashcard: function (browser, userTagValue) {
    //     return browser
    //         .waitForElementByXPath("(//input[@type='text'])[1]", asserters.isDisplayed, 90000)
    //         .click()
    //         .sleep(2000)
    //         .waitForElementByXPath("(//input[@type='text'])[1]", asserters.isDisplayed, 90000)
    //         .type(userTagValue)
    //         .sleep(2000)
    //         .then(function(){
    //         return browser
    //               .waitForElementByXPath("(//ul[@class='suggestion-list']//li)[1]", asserters.isDisplayed, 90000)
    //                .click()
    //                .waitForElementByCss(".tag-item.ng-scope span",asserters.isDisplayed, 60000);
    //
    //      });
    //
    // },

        enterTagValueOnFilterPanelFlashcard: function (browser, userTagValue) {
            return browser
                .sleep(10000)
                .hasElementByXPath("//button[@aria-expanded='false']").then(function(filterbuttonStatus){
                 if(!filterbuttonStatus){
                    console.log(filterbuttonStatus);
                    return browser
                   .sleep(2000)
                   .waitForElementByXPath("(//input[@type='text'])[1]", asserters.isDisplayed, 90000)
                   .click().sleep(2000).then(function(){
                    return browser
                       .hasElementByXPath("//button[@aria-expanded='false']").then(function(filterbuttonStatus1){
                        if(!filterbuttonStatus1){
                             console.log(filterbuttonStatus1);
                            return browser
                                .waitForElementByXPath("(//input[@type='text'])[1]", asserters.isDisplayed, 90000)
                                .type(userTagValue).sleep(2000).then(function(){
                               return browser
                                  .hasElementByXPath("//button[@aria-expanded='false']").then(function(filterbuttonStatus2){
                                if(!filterbuttonStatus2){
                                     console.log(filterbuttonStatus2);
                                     return browser
                                    .waitForElementByXPath("(//ul[@class='suggestion-list']//li)[1]", asserters.isDisplayed, 90000)
                                   .click()
                                   .waitForElementByCss(".tag-item.ng-scope span",asserters.isDisplayed, 60000);
                                }else{
                                     console.log(filterbuttonStatus2);
                                    return browser
                                        .execute("return document.getElementsByClassName('filter-button')[0].click()").then(function(){
                                     return browser
                                    .sleep(2000)
                                    .waitForElementByXPath("(//ul[@class='suggestion-list']//li)[1]", asserters.isDisplayed, 90000)
                                   .click()
                                   .waitForElementByCss(".tag-item.ng-scope span",asserters.isDisplayed, 60000);
                                  });
                                }
                                });
                              });
                        }else{
                                return browser
                                    .execute("return document.getElementsByClassName('filter-button')[0].click()").then(function(){
                                return browser
                                   .sleep(2000)
                                   .waitForElementByXPath("(//input[@type='text'])[1]", asserters.isDisplayed, 90000)
                                   .type(userTagValue).sleep(2000).then(function(){
                                    return browser
                                       .hasElementByXPath("//button[@aria-expanded='false']").then(function(filterbuttonStatus1){
                                        if(!filterbuttonStatus){
                                             return browser
                                            .waitForElementByXPath("(//ul[@class='suggestion-list']//li)[1]", asserters.isDisplayed, 90000)
                                           .click()
                                           .waitForElementByCss(".tag-item.ng-scope span",asserters.isDisplayed, 60000);
                                        }else{
                                            return browser
                                                .execute("return document.getElementsByClassName('filter-button')[0].click()").then(function(){
                                             return browser
                                            .sleep(2000)
                                            .waitForElementByXPath("(//ul[@class='suggestion-list']//li)[1]", asserters.isDisplayed, 90000)
                                           .click()
                                           .waitForElementByCss(".tag-item.ng-scope span",asserters.isDisplayed, 60000);
                                          });
                                        }
                                       });
                                    });
                                });
                        }
                       });
                    });
                }else{
                    console.log("in else"+filterbuttonStatus);
                    return browser
                        .execute("return document.getElementsByClassName('filter-button')[0].click()").then(function(){
                    return browser
                    .sleep(2000)
                       .waitForElementByXPath("(//input[@type='text'])[1]", asserters.isDisplayed, 90000)
                       .click().sleep(2000).then(function(){
                           return browser
                              .hasElementByXPath("//button[@aria-expanded='false']").then(function(filterbuttonStatus1){
                                if(!filterbuttonStatus1){
                                return browser
                                    .waitForElementByXPath("(//input[@type='text'])[1]", asserters.isDisplayed, 90000)
                                    .type(userTagValue).sleep(2000).then(function(){
                                        return browser
                                           .hasElementByXPath("//button[@aria-expanded='false']").then(function(filterbuttonStatus2){
                                            if(!filterbuttonStatus2){
                                                 return browser
                                                .waitForElementByXPath("(//ul[@class='suggestion-list']//li)[1]", asserters.isDisplayed, 90000)
                                               .click()
                                               .waitForElementByCss(".tag-item.ng-scope span",asserters.isDisplayed, 60000);
                                            }else{
                                                return browser
                                                    .execute("return document.getElementsByClassName('filter-button')[0].click()").then(function(){
                                                 return browser
                                                .sleep(2000)
                                                .waitForElementByXPath("(//ul[@class='suggestion-list']//li)[1]", asserters.isDisplayed, 90000)
                                               .click()
                                               .waitForElementByCss(".tag-item.ng-scope span",asserters.isDisplayed, 60000);
                                              });
                                            }
                                        });
                                     });
                            }else{
                                return browser
                                    .execute("return document.getElementsByClassName('filter-button')[0].click()").then(function(){
                                  return browser
                                   .sleep(2000)
                                   .waitForElementByXPath("(//input[@type='text'])[1]", asserters.isDisplayed, 90000)
                                   .type(userTagValue).sleep(2000).then(function(){
                                        return browser
                                           .hasElementByXPath("//button[@aria-expanded='false']").then(function(filterbuttonStatus3){
                                        if(!filterbuttonStatus3){
                                             return browser
                                            .waitForElementByXPath("(//ul[@class='suggestion-list']//li)[1]", asserters.isDisplayed, 90000)
                                           .click()
                                           .waitForElementByCss(".tag-item.ng-scope span",asserters.isDisplayed, 60000);
                                        }else{
                                            return browser
                                                .execute("return document.getElementsByClassName('filter-button')[0].click()").then(function(){
                                             return browser
                                            .sleep(2000)
                                            .waitForElementByXPath("(//ul[@class='suggestion-list']//li)[1]", asserters.isDisplayed, 90000)
                                           .click()
                                           .waitForElementByCss(".tag-item.ng-scope span",asserters.isDisplayed, 60000);
                                          });
                                        }
                                        });
                                    });
                                });
                            }
                           });
                        });
                    });
                }
            });
                // .sleep(2000)
                // .waitForElementByCss(".filter.by-tags .tags input", asserters.isDisplayed, 90000)
                // // .waitForElementByXPath("(//input[@type='text'])[1]", asserters.isDisplayed, 90000)
                // .click()
                // .sleep(2000)
                // // .waitForElementByXPath("(//input[@type='text'])[1]", asserters.isDisplayed, 90000)
                // .waitForElementByCss(".filter.by-tags .tags input", asserters.isDisplayed, 90000)
                // .type(userTagValue)
                // .sleep(2000)
                // .then(function(){
                // return browser
                    //     .sleep(2000)
                    //     .waitForElementByXPath("(//ul[@class='suggestion-list']//li)[1]", asserters.isDisplayed, 90000)
                    //    .click()
                    //    .sleep(2000)
                    //    .waitForElementByCss(".tag-item.ng-scope span",asserters.isDisplayed, 60000);

            //  });

    },


    verifyFilteredStudybit: function (browser, done, type, valueToBeTested, topicToBeTested, environment) {
        console.log("type::"+type);
        return browser
            .waitForElementByCss(".ng-isolate-scope.active", asserters.isDisplayed, 9000).then(function(){
            if (type === "userTag") {
                    return  browser
                      .waitForElementByCss(".studybit", asserters.isDisplayed, 25000)
                       .click()
                        .waitForElementByXPath("//li[contains(@class,'banner ng-scope')]//button[@id='tags']", asserters.isDisplayed, 25000)
                        // .waitForElementByXPath("//li[contains(@class,'banner ng-scope')]//li[contains(@class,'tags')]//a", asserters.isDisplayed, 25000)
                       .click().then(function(){
                      return  browser
                        .waitForElementByCss(".banner .chapter-origin.ng-scope", asserters.isDisplayed, 25000)
                        .text()
                        .should.eventually.include(topicToBeTested).then(function(){
                        return  browser
                          .waitForElementByXPath("//li[contains(@class,'banner ng-scope')]//li[@class='tag-item ng-scope']/span", asserters.isDisplayed, 90000)
                          .text()
                          .should.eventually.include(valueToBeTested).then(function(){
                            return browser
                            .waitForElementByCss(".studybit .icon-close-x-blue", asserters.isDisplayed, 25000)
                            .then(function(){
                            return  browser
                              .execute("window.scrollTo(0,0)")
                              .sleep(1000)
                              .waitForElementByCss(".studybit .icon-close-x-blue", asserters.isDisplayed, 25000)
                              .click()
                              .execute("window.scrollTo(0,0)")
                              .waitForElementByCss(".remove-button.ng-binding.ng-scope", asserters.isDisplayed, 25000)
                              .click().then(function(){
                                done();
                              });
                            });
                          });
                        });
                      });

            } else if (type === "chapter") {
              return  browser
                    .waitForElementByXPath("(//div[contains(@class,'cg-checkbox ng-isolate-scope')])[1] /label", asserters.isDisplayed, 90000)
                    .click()
                    .waitForElementsByCssSelector(".studybits.flashcards", asserters.isDisplayed, 60000).then(function (chapter) {
                        chapter[0].elementsByXPath("//div[@class='chapter ng-scope']").then(function (chapterCount) {
                          if(_.size(chapterCount)===1){
                          return  browser
                                .waitForElementByCss(".chapter h2", asserters.isDisplayed, 10000)
                                .text()
                                .should.eventually.include(valueToBeTested)
                                .waitForElementByCss(".studybit", asserters.isDisplayed, 9000)
                                .click()
                                .waitForElementByCss(".banner .chapter-origin.ng-scope", asserters.isDisplayed, 9000)
                                .text()
                                .should.eventually.include(topicToBeTested)
                                .waitForElementByCss("button.icon-close-x-blue", asserters.isDisplayed, 9000)
                                .click()
                                .sleep(1000)
                                .execute("window.scrollTo(0,1000)")
                                .waitForElementByCss(".keyterm .overlay", asserters.isDisplayed, 9000)
                                .click()
                                .waitForElementByCss(".banner .chapter-origin.ng-scope", asserters.isDisplayed, 9000)
                                .text()
                                .should.eventually.include(topicToBeTested)
                                .waitForElementByCss("button.icon-close-x-blue", asserters.isDisplayed, 9000)
                                .click()
                                .sleep(1000)
                                .execute("window.scrollTo(0,0)")
                                .waitForElementByCss(".by-chapter .show-all-toggle.ng-scope", asserters.isDisplayed, 9000)
                                .click()
                                .nodeify(done);
                        }
                      });
                    });

            } else if (type === "comprehension") {
              return  browser
                    .execute("window.scrollTo(0,0)")
                    .sleep(1000)
                    .waitForElementByCss(".by-comprehension .show-all-toggle.ng-scope", asserters.isDisplayed, 9000)
                    .click()
                    .waitForElementByCss(".by-comprehension ul li div[value='strong']", asserters.isDisplayed, 9000)
                    .click()
                    .execute("window.scrollTo(0,400)")
                    .waitForElementByCss(".studybit", asserters.isDisplayed, 9000)
                    .click()
                    .waitForElementByCss(".ng-scope.ng-binding.active", asserters.isDisplayed, 9000)
                    .text()
                    .should.eventually.include("STRONG")
                    .execute("window.scrollTo(0,0)")
                    .waitForElementByCss(".by-comprehension .show-all-toggle.ng-scope", asserters.isDisplayed, 9000)
                    .click()
                    .nodeify(done);
            }

      });
    },

    clearAllFilters: function (browser, done) {
        browser
            .waitForElementByCss(".clear-all-filters.ng-scope", asserters.isDisplayed, 90000)
            .click()
            .nodeify(done);
    },

    clearAllChapterFilters: function (browser, done) {
     browser
         .waitForElementByXPath("(//div[contains(@class,'show-all-toggle')])[1]", asserters.isDisplayed, 90000).then(function(scrollToToggle){
           return browser
           .getLocationInView(scrollToToggle)
           .execute("window.scrollTo(0,-140)")
           .waitForElementByXPath("(//div[contains(@class,'show-all-toggle')])[1]", asserters.isDisplayed, 90000)
           .click()
           .nodeify(done);
         });
   },
    changeComprehensionOfStudybit: function (browser, done) {
     browser
      .sleep(1000)
      .waitForElementByCss(".studybit.keyterm", asserters.isDisplayed, 90000)
      .click()
      .sleep(1000)
      .waitForElementByXPath("//div[contains(@class,'button-group')]/button[contains(text(),'STRONG')]", asserters.isDisplayed, 90000)
      .click()
      .sleep(2000)
      .waitForElementByCss(".save.ng-binding", asserters.isDisplayed, 90000)
      .click()
      .execute("scrollTo(0,0)")
      .sleep(2000)
      .waitForElementByCss(".chapter button.icon-close-x-blue", asserters.isDisplayed, 50000)
      .click()
      .nodeify(done);
    },
    clearAllComprehensionFilter: function(browser){
    return  browser
      .waitForElementByXPath("//div[contains(@class,'by-comprehension')]/div[contains(@class,'show-all-toggle')]", asserters.isDisplayed, 90000)
      .click();
    },
    clickOnClearFilterThenSelectOne:function(browser,filterType,filterVal){
      return  browser
          .waitForElementByXPath("//div[contains(@class,'"+filterType+"')]/div[contains(@class,'show-all-toggle')]",asserters.isDisplayed, 90000)
          .click()
          .waitForElementByXPath("//div[contains(@class,'"+filterType+"')]//ul//li//label[contains(text(),'"+filterVal+"')]",asserters.isDisplayed, 90000)
          .click();


    },
    selectAllFilters:function(browser){
      return  browser
        .waitForElementByCss(".select-all-filters.ng-scope",asserters.isDisplayed, 90000)
        .click();

    },
    deleteUserTagFromFilter: function(browser){
      return  browser
        .waitForElementByCss(".remove-button.ng-binding.ng-scope",asserters.isDisplayed, 90000)
        .click();

    },
    closeExpandedStudybit: function(browser){
      return browser
          .waitForElementByCss(".icon-close-x-blue", asserters.isDisplayed, 60000)
          .click()

    },
    clickOnFilter: function(browser){
       return browser
          .waitForElementByCss("button.filter-button.ng-binding", asserters.isDisplayed, 10000)
          .then(function (filter) {
              return browser
                    .execute("window.scrollTo(0,0)")
                   .waitForElementByCss("button.filter-button", asserters.isDisplayed, 10000)
                   .click();
                 });

    },

    clickFilterAndSelectMyFlashcardView: function (browser) {
         return browser
            .execute("window.scrollTo(0,0)").then(function(){
              if(process.env.RUN_IN_BROWSER.toString() === "\"internet explorer\"") {
                browser
                  .sleep(1000)
                  .waitForElementByXPath("//button[contains(.,'FILTER')]", asserters.isDisplayed, 90000)
                  .click().then(function(){
                    browser
                      .waitForElementByXPath("//li[@class='ng-binding' and contains(text(),'My Flashcards')]", asserters.isDisplayed, 90000)
                      .click()
                      .sleep(2000);
                  });
          }else {
            browser
              .sleep(3000)
              .waitForElementByCss("button.filter-button.ng-binding", asserters.isDisplayed, 90000)
              .click().then(function(){
                browser
                  .waitForElementByXPath("//li[@class='ng-binding' and contains(text(),'My Flashcards')]", asserters.isDisplayed, 90000)
                  .click()
                  .sleep(2000);
              });
          }
      });
    },

   clickOnFilteredStudyBitAndExpandTag: function(browser){
     return browser
      .waitForElementByCss(".text .overlay", asserters.isDisplayed, 9000)
      .click()
      .waitForElementByCss(".tags .accordion-header.ng-binding", asserters.isDisplayed, 9000)
      .click();
   },
   veryfyStudyBoardItemPresent : function(browser){
    return browser
         .elementByCssSelectorWhenReady(".overlay", asserters.isDisplayed, 90000);
   },
   selectChapterForFilter : function(browser, chapter){
     return browser
     .waitForElementByXPath("(//div[contains(@class,'cg-checkbox ng-isolate-scope')])["+chapter+"] /label", asserters.isDisplayed, 5000)
     .click();
   },
   getCountOfFilteredOverlay : function(browser, chapter){
     return browser
     .waitForElementsByXPath("(//div[@class='chapter ng-scope'])[1]//li[contains(@class,'tile column')]", asserters.isDisplayed,10000);
   },
   getUserTag : function(browser){
     return browser
     .waitForElementByXPath("//li[contains(@class,'banner')]//section//div[@class='tags']//span", asserters.isDisplayed, 90000);
   },
   clickOnFilteredFlashcard: function(browser){
     return browser
      .waitForElementByCss(".overlay", asserters.isDisplayed, 9000)
      .click();
   },
   typeSearchText: function (browser,searchText){
     return browser
      .waitForElementByXPath("(//input[@type='text'])[1]", asserters.isDisplayed, 90000)
      .type(searchText)
      .sleep(1000)
   },
   getPublisherTagHintText: function(browser,index){
     return browser
         .execute("return document.getElementsByClassName('suggestion-list')[0].getElementsByClassName('suggestion-item')["+index+"].textContent");
   },
   getStudybitCount: function (browser) {
     return browser
      .waitForElementsByCss(".overlay", asserters.isDisplayed, 90000)
   },

   validateFilteredChapterIsSelected: function(browser, chapter){
        return browser
        .waitForElementsByXPath("(//div[contains(@class,'cg-checkbox ng-isolate-scope')])["+chapter+"]/label/parent::div/input[@checked='checked']//following-sibling::label", asserters.isDisplayed, 15000)
        .execute("return getComputedStyle(document.querySelector(\"input[type='checkbox']:checked + label\"),\"::before\").getPropertyValue('background-color')");
    },

     validateRemaingChapterUnselected: function(browser){
          return browser
          .sleep(3000)
          .waitForElementsByXPath("//div[contains(@class,'filter by-chapter')]//div[contains(@class,'show-all-toggle')]", asserters.isDisplayed, 15000)
          .execute("return getComputedStyle(document.querySelector(\"input[type='checkbox'] + label\"),\"::before\").getPropertyValue('background-color')");
      },

    clickOnStudyBitLink: function(browser, chapter, concept){
        return browser
                .waitForElementsByXPath("//h1[contains(.,'"+chapter+"')]//parent::div//div[@concept='concept']//h3[contains(text(),'"+concept+"')]//following-sibling::div[@class='studybits']/div[contains(@class,'link-studybits')]", asserters.isDisplayed, 15000).then(function(chapterStudyBit){
              return browser
                .getLocationInView(chapterStudyBit)
                .sleep(2000)
                .waitForElementByXPath("//h1[contains(.,'"+chapter+"')]//parent::div//div[@concept='concept']//h3[contains(text(),'"+concept+"')]//following-sibling::div[@class='studybits']/div[contains(@class,'link-studybits')]//p", asserters.isDisplayed, 15000)
                .click();
              });
    },

    validatePublisherTagIsPresent: function(browser, publishertag){
       return browser
        .waitForElementByXPath("//div[@class='filter by-tags']//ul[contains(@class,'tag-list')]//span", asserters.isDisplayed, 15000).text();
    },

    getFilterButtonStatus : function(browser, publishertag){
       return browser
        .sleep(3000)
        .waitForElementByCss(".filter-button", asserters.isDisplayed, 35000).getAttribute('aria-disabled');
    }
};
