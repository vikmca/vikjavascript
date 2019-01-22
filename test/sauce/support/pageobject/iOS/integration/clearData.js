var wd = require('wd');
var commonutil = require("../../../../util/commonUtility.js");
var stringutil = require("../../../../util/stringUtil");
var asserters = wd.asserters;

module.exports = {

    clearStudyboard: function (browser, done) {
        commonutil.acceptAlerts(browser,true).then(function(){
            return  browser
              .execute("for(i=0;i<(document.getElementsByClassName('icon-trash-gray').length);i++){document.getElementsByClassName('icon-trash-gray')[i].click();window.scrollBy(0,5)}").then(function(){
                return  browser
                  .refresh()
                  .waitForElementsByCss(".view-select a", asserters.isDisplayed, 50000)
                  .sleep(1000)
                  .waitForElementByXPath("//div[contains(@class,'navigation-menu-button')]", asserters.isDisplayed, 120000)
                  .click()
                  .waitForElementByCss("ul li[class='ng-isolate-scope active']", asserters.isDisplayed, 90000)
                  .waitForElementByXPath("//div[contains(@class,'navigation-menu-button')]", asserters.isDisplayed, 120000)
                  .click()
                  .nodeify(done);
              });
        });

    },
    clearFlashcard: function (browser, done) {
        commonutil.acceptAlerts(browser,true).then(function(){
        return  browser
            // .waitForElementByCss("ul li[class='ng-isolate-scope active']", asserters.isDisplayed, 90000)
            .execute("for(i=0;i<(document.getElementsByClassName('icon-trash-gray').length);i++){document.getElementsByClassName('icon-trash-gray')[i].click();window.scrollBy(0,5)}").then(function(){
            //     return  browser
            //         .refresh()
            //         .sleep(3000)
            //         .waitForElementByXPath("//div[contains(@class,'navigation-menu-button')]", asserters.isDisplayed, 120000)
            //         .click()
            //         .waitForElementByCss("ul li[class='ng-isolate-scope active']", asserters.isDisplayed, 90000)
            //         .waitForElementByXPath("//div[contains(@class,'navigation-menu-button')]", asserters.isDisplayed, 120000)
            //         .click()
            //         .nodeify(done);
              done();
            });
          });
    },

    revertKeyTermFlashcard : function(browser,done){
      commonutil.acceptAlerts(browser,true).then(function(){
      browser
        .waitForElementByCss(".ng-scope.icon-revert-gray", asserters.isDisplayed, 90000)
        .click().nodeify(done);

      });
    },

    clearCreatedCourse : function (browser, done, courseName) {
        commonutil.acceptAlerts(browser,true).then(function(){
            return  browser
            .hasElementByXPath("//td[contains(.,'" + courseName + "')]/following-sibling::td/a[contains(@title,'Delete Course')]",60000).then(function(duplicateCopyCourseStatus){
              console.log("duplicateCopyCourseStatus"+duplicateCopyCourseStatus);
              if(duplicateCopyCourseStatus){
                return browser
                    .waitForElementByXPath("//td[contains(.,'" + courseName + "')]/following-sibling::td/a[contains(@title,'Delete Course')]", asserters.isDisplayed, 60000)
                    .click().then(function(){
                    done();
                  });
              }else {
                console.log("Copy course is not present");
                done();
              }
            })
          });
    },
    hedeCreatedCourse: function (browser, done, courseName) {
        commonutil.acceptAlerts(browser,true).then(function(){
            return  browser
            .hasElementByXPath("//td[contains(.,'" + courseName + "')]/following-sibling::td/a[contains(@title,'hide')]",60000).then(function(hideCorse){
              console.log("duplicateCopyCourseStatus"+hideCorse);
              if(hideCorse){
                return browser
                    .waitForElementByXPath("//td[contains(.,'" + courseName + "')]/following-sibling::td/a[contains(@title,'hide')]", asserters.isDisplayed, 60000)
                    .click().then(function(){
                    return  browser
                      .waitForElementByCss(".button", asserters.isDisplayed, 60000)
                      .click().then(function(){
                        done();
                    });
                  });
              }else {
                console.log("Copy course is not present");
                done();
              }
            })
          });
    },
    revertAllKeyTermFlashcard : function(browser,done){
      commonutil.acceptAlerts(browser,true).then(function(){
        browser
        //  .waitForElementByCss("ul li[class='ng-isolate-scope active']", asserters.isDisplayed, 90000)
          .execute("for(i=0;i<(document.getElementsByClassName('ng-scope icon-revert-gray').length);i++){document.getElementsByClassName('ng-scope icon-revert-gray')[i].click();window.scrollBy(0,5)}").then(function(){
            browser
            .refresh()
          //  .waitForElementByCss("ul li[class='ng-isolate-scope active']", asserters.isDisplayed, 90000)
            .nodeify(done);
          });
        });
    },
    clearAllAssignment: function (browser, done) {
        browser
            .execute("return document.getElementsByClassName('week ng-scope day-selection-disabled')[0].getElementsByClassName('day ng-scope')[0].getElementsByClassName('event ng-scope is-not-revealed-to-students').length").then(function (assignmentCount) {
                astcount = assignmentCount - 1;
                function deleteAssignment() {
                    if (astcount >= 0) {
                        browser
                            .execute("document.getElementsByClassName('week ng-scope day-selection-disabled')[0].getElementsByClassName('day ng-scope')[0].getElementsByClassName('event ng-scope is-not-revealed-to-students')[" + assignmentCount + "].click()").then(function () {
                                browser
                                    .execute("return document.getElementsByClassName('nudge-right ng-isolate-scope').length").then(function (assignmenttype) {
                                        if (assignmenttype === 2) {
                                            browser
                                                .sleep(2000)
                                                .waitForElementByCss(".delete.ng-scope", asserters.isDisplayed, 60000)
                                                .click()
                                                .sleep(5000)
                                                .elementByXPathSelectorWhenReady("(//button[contains(@class,'save ng-binding')])[2]", 5000)
                                                .click()
                                                .sleep(10000);
                                        }
                                        else {
                                            commonutil.acceptAlerts(browser,true).then(function(){
                                              browser
                                                .waitForElementByCss(".delete.ng-scope", asserters.isDisplayed, 60000)
                                                .click()
                                                .sleep(3000);
                                            });
                                        }

                                    });
                                assignmentCount--;
                                deleteAssignment();
                            });
                    }
                    else {
                        done();

                    }

                }
            });
    },
    editAllAssignment: function (browser, done) {
        browser
            .execute("return document.getElementsByClassName('week ng-scope day-selection-disabled')[0].getElementsByClassName('day ng-scope')[0].getElementsByClassName('event ng-scope is-not-revealed-to-students').length").then(function (assignmentCount) {
                astcount = assignmentCount - 1;
                function editAssignment() {
                    if (astcount >= 0) {
                        browser
                            .execute("document.getElementsByClassName('week ng-scope day-selection-disabled')[0].getElementsByClassName('day ng-scope')[0].getElementsByClassName('event ng-scope is-not-revealed-to-students')[" + assignmentCount + "].click()").then(function () {
                                browser
                                    .waitForElementByXPath("(//div[contains(@class,'datefield ng-binding')])[2]", asserters.isDisplayed, 60000)
                                    .click()
                                    .waitForElementByXPath("//div[@class='span-half']//cg-date-picker[@label-text='Reveal in Student Calendar']//div[@class='previous']", asserters.isDisplayed, 10000)
                                    .click()
                                    .sleep(5000)
                                    .waitForElementByCss("div[class='datepicker cg-calendar ng-isolate-scope'] .day.ng-scope.today", asserters.isDisplayed, 10000)
                                    .click()
                                    .execute("document.getElementsByClassName('done ng-scope')[0].click()");
                                assignmentCount--;
                                editAssignment();
                            });
                    }
                    else {
                        done();

                    }

                }
            });
    },
    clearStudybitsOnStudyboard: function (browser, done) {
        commonutil.acceptAlerts(browser,true).then(function(){
            return  browser
              .execute("for(i=0;i<(document.getElementsByClassName('icon-trash-gray').length);i++){document.getElementsByClassName('icon-trash-gray')[i].click();window.scrollBy(0,5)}").then(function(){
              return  browser
              .sleep(5000)
              .nodeify(done);
              });
            });

    }

};
