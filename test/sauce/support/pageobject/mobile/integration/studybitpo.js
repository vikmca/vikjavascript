var wd = require('wd');
var asserters = wd.asserters;
var report = require("../../../../support/reporting/reportgenerator");
var dataUtil = require("../../../../util/date-utility.js");
var basicpo =  require("./basicpo");
var loginPage = require("./loginpo");
var _ = require('underscore');
var stringutil = require("../../../../util/stringUtil");
var commonutil = require("../../../../util/commonUtility.js");
var publisherTagValue;
var imagePublisherTagValue;
module.exports = {

  createTextStudyBit: function (browser, done, studybitId, publishertag, usertag, notes, comprehension, windowScrollY) {
      return browser
          .sleep(4000)
          .waitForElementByCss("#" + studybitId, asserters.isDisplayed, 30000)
          .then(function (studybit) {
            return browser
              // .getLocationInView(studybit)
              .execute("document.getElementById('"+studybitId+"').scrollIntoView(true);")
              .sleep(1000)
              .execute("window.scrollBy(0,-150)")
              .sleep(2000)
              .waitForElementByCss("#" + studybitId + " span:nth-child(1)", asserters.isDisplayed, 90000)
              .click().sleep(5000).then(function () {
                return browser
                // .waitForElementByXPath("//button[contains(@class,'save create')]", asserters.isDisplayed, 60000)
                // .click()
                .execute("return document.getElementsByClassName('save create')[0].click()")
                .sleep(2000)
                .nodeify(done);
            });
        });
  },

  reopenKeyTermStudyBit: function (browser, done, keytermSBId) {
    // if (process.env.RUN_ENV.toString() === "\"integration\"" || "\"staging\""){
      commonutil.acceptAlerts(browser,true).then(function(){
      return browser
          .waitForElementByCss("#" + keytermSBId + "", asserters.isDisplayed, 90000).then(function(keytermSBLocation){
          return  browser
            .getLocationInView(keytermSBLocation)
            .execute("window.scrollBy(0,-140)")
            .sleep(1000)
            .waitForElementByCss("#" + keytermSBId + "", asserters.isDisplayed, 90000)
            .click()
            .sleep(2000)
            .waitForElementByCss(".delete", asserters.isDisplayed, 90000)
            .click()
            .nodeify(done);
          });
        });
        },
        verifydeletedkeytermStudyBit: function (browser, keytermSBId) {
            return browser
                .waitForElementByCss("#" + keytermSBId + "", asserters.isDisplayed, 90000).then(function(keytermSBLocation){
                return  browser
                  .getLocationInView(keytermSBLocation)
                  .execute("window.scrollBy(0,-140)")
                  .sleep(1000)
                  .hasElementByCss(".studybit-icon.keyterm.saved.fair");
              });
              },
    getIconsOnExpandedStudybit: function (browser, iconName) {
      return browser
      .execute("return getComputedStyle(document.querySelector('."+iconName+" .accordion-header'),'::before').getPropertyValue('content')");
    },

    getComprehensionicon: function (browser) {
      return browser
      .execute("return getComputedStyle(document.querySelector('.studyboard-accordion .comprehension .button-group'),'::before').getPropertyValue('content')");
    },

    validateRefreshStatus: function(browser){
      return browser
      .refresh().then(function(){
        return browser
        .waitForElementsByCss(".cas-activity-series.cas-activity-series-unvisited", asserters.isDisplayed,80000).then(function(elements){
          var unvisited= _.size(elements);
          console.log(unvisited);
          if (unvisited == 9) {
            return false;
          } else {
            return true;
          }
        });
      });
    },

    validateTextStudyBitSave: function (browser, done, studybitId, publishertag, usertag, notes, comprehension, windowScrollY) {
        browser
            .execute("window.scrollBy(0,-140)")
            .waitForElementsByCss(".cl-atom.highlight.unassigned.persisted", asserters.isDisplayed, 90000)
            .nodeify(done);
    },
    createKeyTermStudyBit: function (browser, done, keytermSBId, definition, comprehension, publishertag, notes, usertag, windowScrollY) {
        return browser
            .sleep(4000)
            .waitForElementByCss("#" + keytermSBId, asserters.isDisplayed, 30000)
            .then(function (keytermSBLocation) {
              return browser
                .execute("document.getElementById('"+keytermSBId+"').scrollIntoView(true);")
                .sleep(1000)
                // .getLocationInView(keytermSBLocation)
                .execute("window.scrollBy(0,-140)")
                .sleep(1000)
                .waitForElementByCss("#" + keytermSBId +"", asserters.isDisplayed, 90000)
                .click()
                .sleep(1000)
                .elementByXPathSelectorWhenReady("//button[contains(@class,'ng-scope ng-binding')and contains(.,'" + comprehension + "')]")
                .click().then(function () {
                  return browser
                  .sleep(1000)
                  .waitForElementByCss(".save.create", asserters.isDisplayed, 60000)
                  .click()
                  .nodeify(done);
                });
              });
    },
    validateKeyTermStudyBitSave: function (browser, done, keytermSBId, publishertag, usertag, notes, comprehension, windowScrollY, keytermDef) {
      browser
          .execute("window.scrollBy(0,-140)")
          .waitForElementsByCss(".cl-atom.highlight.unassigned.persisted", asserters.isDisplayed, 90000)
          .nodeify(done);
    },

    navigateToStudyBoard: function (browser, done) {
        return browser
        .sleep(10000)
            .waitForElementByXPath("//div[contains(@class,'navigation-menu-button')]", asserters.isDisplayed, 120000)
            .click()
            .sleep(4000)
            .waitForElementByXPath("//div[contains(@class,'icon-studyboard-blue')]//parent::a", asserters.isDisplayed, 120000)
            .click()
            .sleep(1000).then(function () {
                browser
                    .waitForElementByXPath("//h1[contains(.,'StudyBoard')]", asserters.isDisplayed, 220000)
                    .nodeify(done);
            });
    },

    navigateToStudyBitTab: function (browser, done) {
        browser
            .waitForElementByXPath("//div[contains(@class,'icon-studyboard-blue')]", asserters.isDisplayed, 120000)
            .click()
            .nodeify(done);
    },

    validateOrderOfStudybit: function (browser) {
        return browser
          .waitForElementByXPath("//div[contains(@class,'chapter')]/ul/li[contains(@class,'tile')][1]//cg-studyboard-tile/div", asserters.isDisplayed, 60000);
    },

    validateTheUnExpandedStudyBitTile: function (browser) {

        return browser
            .sleep(3000)
            .waitForElementByXPath("(//li[contains(@class,'tile')]//div[contains(@class,'studybit text')])[1]", asserters.isDisplayed, 10000)
            .elementByCssSelectorWhenReady(".studybit.text.unassigned time", 1200)
            .text()
            .should.eventually.include(dataUtil.getDateFormatForStudyBoard())
            .sleep(1000)
            .waitForElementByCss(".cl-atom.highlight.unassigned.persisted", asserters.isDisplayed, 10000)
            .execute("return getComputedStyle(document.querySelector('.studybit.text .tile-icon')).backgroundImage"); // Changed for Stage


    },

    validateTextStudyBitOnStudyBoard: function (browser, done, chaptername, notes, concepts, usertag) {
        return browser
            .sleep(3000)
            .waitForElementByXPath("(//li[contains(@class,'tile')]//div[contains(@class,'studybit text')])[1]", asserters.isDisplayed, 30000)
            .sleep(1000)
            .execute("return document.getElementsByClassName('studybit text unassigned')[0].getElementsByTagName('time')[0].scrollIntoView()")
            .execute("window.scrollBy(0,-140)")
            .elementByCssSelectorWhenReady(".studybit.text.unassigned time", 12000)
            .text()
            .should.eventually.include(dataUtil.getDateFormatForStudyBoard())
            .sleep(1000)
            .waitForElementByCss(".cl-atom.highlight.unassigned.persisted", asserters.isDisplayed, 30000)
            .sleep(2000)
            .execute("return getComputedStyle(document.querySelector('.studybit.text .tile-icon')).backgroundImage")
            .then(function (contenturl) {
                if (contenturl.indexOf("studybit-text-default") > -1) {
                    console.log(report.reportHeader() +
                        report.stepStatusWithData("STUDYBOARD :: Saved Text StudyBit has the studybit icon displayed correctly", "success") +
                        report.reportFooter());
                  return  browser
                        .elementByCssSelectorWhenReady(".studybit.text", asserters.isDisplayed, 2000).click().then(function () {
                        return    browser
                              .elementByCssSelectorWhenReady(".banner .studybit .chapter-origin", 2000)
                                .text()
                                .should.eventually.include(chaptername)
                                .nodeify(done);
                              });
                  }
              });
    },
    validateMathEquationStudyBitOnStudyBoard: function (browser, done, chaptername, notes, concepts, usertag) {
        this.validateTheUnExpandedStudyBitTile(browser)
            .then(function (contenturl) {
                if (contenturl.indexOf("studybit-text-default") > -1) {
                    console.log(report.reportHeader() +
                        report.stepStatusWithData("STUDYBOARD :: Saved Text StudyBit has the studybit icon displayed correctly", "success") +
                        report.reportFooter());
                  return  browser
                        .elementByCssSelectorWhenReady(".studybit.text", asserters.isDisplayed, 20000).click().then(function () {

                          return  browser.elementByCssSelectorWhenReady(".banner .studybit .chapter-origin", 2000)
                                .text()
                                .should.eventually.include(chaptername)
                                .execute("return document.getElementsByTagName(\"textarea\")[0].value")
                                .then(function (notestext) {
                                    if (notestext.indexOf(notes) > -1) {
                                        console.log(report.reportHeader() +
                                            report.stepStatusWithData("STUDYBOARD :: EXPANDED STUDYBIT TILE :: Saved Math Equation StudyBit has the notes \"", notestext + "\" displayed correctly on the expanded StudyBit tile of Studyboard", "success") +
                                            report.reportFooter());
                                      return  browser
                                            .elementByCssSelectorWhenReady(".tags .accordion-header.ng-binding", 2000)
                                            .click()
                                            .elementByCssSelectorWhenReady(".tags.is-expanded .not-removable span", 2000)
                                            .text().then(function (textPublisher) {
                                                if (concepts.indexOf(textPublisher) > -1) {
                                                  return  browser
                                                        .elementByXPathSelectorWhenReady("//li[@class='tag-item ng-scope']", 2000)
                                                        .text()
                                                        .should.eventually.include(usertag)
                                                        .elementByCssSelectorWhenReady(".more .accordion-header.ng-binding", asserters.isDisplayed, 5000).click().then(function () {

                                                          return  browser.execute("return document.evaluate(\"count(//li[@ng-class='item.itemType'])\", document, null, XPathResult. NUMBER_TYPE, null ).numberValue").then(
                                                                function (countOfRelatedItems) {
                                                                    if (countOfRelatedItems > 2) {
                                                                      return  browser.waitForElementByXPath("(//li[@ng-class='item.itemType'])[2]/a", asserters.isDisplayed, 10000).text().then(function (relateditem1) {
                                                                            console.log(report.reportHeader() +
                                                                                report.stepStatusWithData("STUDYBOARD :: EXPANDED STUDYBIT TILE :: The First Related item displayed on the StudyBit ", relateditem1, "success") +
                                                                                report.reportFooter());
                                                                          return  browser.waitForElementByXPath("(//li[@ng-class='item.itemType'])[3]/a", asserters.isDisplayed, 10000).text().then(function (relateditem2) {
                                                                                console.log(report.reportHeader() +
                                                                                    report.stepStatusWithData("STUDYBOARD :: EXPANDED STUDYBIT TILE :: The Second Related item displayed on the StudyBit ", relateditem2, "success") +
                                                                                    report.reportFooter());

                                                                                done();
                                                                            });
                                                                        });
                                                                    } else {
                                                                        console.log(report.reportHeader() +
                                                                            report.stepStatusWithData("STUDYBOARD :: EXPANDED STUDYBIT TILE :: Related items are not displayed on the Studybit", "failure") +
                                                                            report.reportFooter());
                                                                    }
                                                                });


                                                        });
                                                }
                                            });

                                    } else {
                                        console.log(report.reportHeader() +
                                            report.stepStatusWithData("STUDYBOARD :: EXPANDED STUDYBIT TILE :: Problems on notes save on studybit display on studyboard", "failure") +
                                            report.reportFooter());
                                    }
                                });

                        });
                } else {
                    console.log(report.reportHeader() +
                        report.stepStatusWithData("STUDYBOARD :: EXPANDED STUDYBIT TILE :: Problems on studybit display", "failure") +
                        report.reportFooter());
                }
            });


    },

    createExhibitStudyBit: function (browser, done, studybitId, publishertags, usertag, notes, windowScrollY) {
        return browser
            .waitForElementByCss("#" + studybitId, asserters.isDisplayed, 30000)
            .then(function (studybit) {
             return  browser.getLocationInView(studybit)
                .sleep(1000)
                .waitForElementByCss("#" + studybitId + " button", asserters.isDisplayed, 60000)
                .click()
                .then(function () {

                      return  browser
                              .waitForElementByXPath("//div[contains(@class,'studybit-menu table unassigned editing')]//div[@class='actions']/button[contains(@class,'save')]", asserters.isDisplayed, 60000)
                              .click()
                              .sleep(1000)
                              .nodeify(done);
                            });
              });
    },

    validateExhibitStudyBitSave: function (browser, done, studybitId, publishertags, usertag, notes, windowScrollY) {
        browser
            .waitForElementByCss("#" + studybitId, asserters.isDisplayed, 30000)
            .then(function (studybit) {
                browser.getLocationInView(studybit)
                    .execute("window.scrollBy(0,-140)")
                    .waitForElementByCss("#SFPKGG582680939", asserters.isDisplayed, 90000)
                    .click()
                    .sleep(2000)
                    .then(function () {
                        browser.waitForElementByCss(".studybit-icon.table.unassigned.saved", asserters.isDisplayed, 90000)
                                    console.log(report.reportHeader() +
                                        report.stepStatusWithData("STUDYBIT POPUP AFTER SAVE :: Successful Validation of the retrieval of unassignmend understanding level ", "success") +
                                        report.reportFooter());
                                        done();

          });
        });
    },

    createImageStudyBit: function (browser, done, studybitId, publishertags, usertag, notes, windowScrollY) {
        return browser
            .waitForElementByCss("#" + studybitId, asserters.isDisplayed, 30000)
            .then(function (studybit) {
                browser.getLocationInView(studybit)
                    .waitForElementByCss("#" + studybitId + " button", asserters.isDisplayed, 60000)
                    .click()
                    .then(function () {
                          return  browser
                                .waitForElementByXPath("//div[contains(@class,'studybit-menu image unassigned editing')]//div[@class='actions']/button[contains(@class,'save')]", asserters.isDisplayed, 60000)
                                .click()
                                .nodeify(done);
            });
          });
    },

    validateImageStudyBitSave: function (browser, done, studybitId, publishertags, usertag, notes, windowScrollY) {
        browser
            .waitForElementByCss("#" + studybitId, asserters.isDisplayed, 30000)
            .then(function (studybit) {
                browser.getLocationInView(studybit)
                    .execute("window.scrollBy(0,-140)")
                    .waitForElementByCss("#GCMXUE760917127", asserters.isDisplayed, 90000)
                    .click()
                    .sleep(2000)
                    .then(function () {
                      browser.waitForElementByCss(".studybit-icon.image.unassigned.saved", asserters.isDisplayed, 90000)
                                    console.log(report.reportHeader() +
                                        report.stepStatusWithData("STUDYBIT POPUP AFTER SAVE :: Successful Validation of the retrieval of unassignmend understanding level ", "success") +
                                        report.reportFooter());
                                        done();
            });
          });
    },

    scrollOnlocation: function (browser, bottomMostexhibitId) {
      return browser
          .waitForElementByCss("#" + bottomMostexhibitId, asserters.isDisplayed, 30000)
          .then(function (studybit) {
            return  browser.getLocationInView(studybit);
          });
    },

    validateAndNavigateToInlineLink: function (browser) {
        return browser
            .waitForElementByXPath("//h1[contains(.,'" + loginPage.getProductData().inline_links.chapter.title + "')]", asserters.isDisplayed, 90000)
            .waitForElementByCss(".chapter-ordinal.ng-scope", asserters.isDisplayed, 90000)
            .text().should.eventually.include(loginPage.getProductData().inline_links.chapter.ordinal)

    },


    validateExhibitStudyBitOnStudyBoard: function (browser, done, chaptername, notes, concepts, usertag) {
        browser
            .elementByCssSelectorWhenReady(".studybit.table", asserters.isDisplayed, 2000)
            .click().then(function () {
                browser
                    .elementByCssSelectorWhenReady(".banner .studybit .chapter-origin", 2000)
                    .text()
                    .should.eventually.include(chaptername)
                    .nodeify(done);

            });

    },

    validateImageStudyBitOnStudyBoard: function (browser, done, chaptername, notes, concepts, usertag) {
        return browser
            .sleep(5000)
            .waitForElementByCss(".studybit.image", asserters.isDisplayed, 2000)
            .click().then(function () {
                browser
                    .waitForElementByCss(".banner .studybit .chapter-origin", 2000)
                    .text()
                    .should.eventually.include(chaptername)
                    .nodeify(done);
            });
    },

    changeComprehensionOfStudybit: function (browser, comprehensionVal) {
        return browser
            .waitForElementByXPath("//form//section//div[@class='comprehension']//button[contains(text(),'" + comprehensionVal + "')]", asserters.isDisplayed, 90000)
            .click();

    },

    closeExpandedStudybit: function (browser) {
        return browser
            .execute("document.getElementsByClassName('icon-close-x-blue')[1].click()");
    },

    clickOnSaveButton: function (browser) {
        return browser
            .sleep(1000)
            .execute("return document.getElementsByClassName('studybit-details')[0].getElementsByClassName('comprehension')[0].scrollIntoView()")
            .waitForElementByXPath("//button[contains(text(),'Save')]", asserters.isDisplayed, 5000)
            .click();
    },

    validateEditedTextStudybit: function (browser, comprehensionText) {
        return browser
            .waitForElementByXPath("(//li[contains(@class,'tile')]//div[contains(@class,'studybit text')])[1]", asserters.isDisplayed, 5000)
            .click()
            .waitForElementByXPath("//button[@class='ng-scope ng-binding active']", asserters.isDisplayed, 5000)
            .text().then(function (comprehensionTextValue) {
                console.log("comprehensionTextValue:" + comprehensionTextValue);
                console.log("comprehensionTextValue1 test data:" + comprehensionText);
                if (comprehensionTextValue.indexOf(comprehensionText) > -1) {
                    console.log(report.reportHeader()
                        + report.stepStatusWithData("STUDYBOARD :: EXPANDED STUDYBIT COMPREHENSION LAVEL TEXT " + comprehensionTextValue + " compared with text ", comprehensionText, "success")
                        + report.reportFooter());
                } else {
                    console.log(report.reportHeader()
                        + report.stepStatusWithData("STUDYBOARD :: EXPANDED STUDYBIT COMPREHENSION LAVEL TEXT " + comprehensionTextValue + " compared with text ", comprehensionText, "failure")
                        + report.reportFooter());
                }
            });

    },

    VerifyKeytermStudybit: function (browser, keyTermSBValidationStatusOnSBrd) {
        // return browser
        //     .waitForElementByCss("div.icon-studyboard-blue", asserters.isDisplayed, 30000).then(function () {
              return browser
              .waitForElementByXPath("(//li[contains(@class,'tile')]//div[contains(@class,'studybit keyterm')])[1]", asserters.isDisplayed, 30000)
                    .then(function () {
                        keyTermSBValidationStatusOnSBrd = "success";
                        console.log(report.reportHeader() +
                            report.stepStatus("KeyTerm Validation status on StudyBoard ", keyTermSBValidationStatusOnSBrd) +
                            report.reportFooter());
                    });
          //  });
    },

    editUserTagOfKeytermStudybit: function (browser, editedUserTagText) {
        return browser
            .waitForElementByXPath("(//li[contains(@class,'tile')]//div[contains(@class,'studybit keyterm')])[1]", asserters.isDisplayed, 30000)
            .click()
            .waitForElementByXPath("//li[contains(@class,'banner ng-scope')]//button[@id='tags']", asserters.isDisplayed, 25000)
            // .waitForElementByXPath("//section[@class='studybit-details']//ul//li//a[contains(text(),'TAGS')]", asserters.isDisplayed, 30000)
            .click()
             .waitForElementByCss(".tags.is-expanded div.tags input", asserters.isDisplayed, 30000)
             .click()
            .waitForElementByCss(".tags.is-expanded div.tags input", asserters.isDisplayed, 90000)
            .type(editedUserTagText)
            .type(wd.SPECIAL_KEYS.Tab)
            .type(wd.SPECIAL_KEYS.Enter)
            .waitForElementByCss(".tag-item.ng-scope span", asserters.isDisplayed, 60000)

    },

    verifyEditedUserTagOfKeytermStudybit: function (browser, editedUserTagText) {
        return browser
            .waitForElementByXPath("(//li[contains(@class,'tile')]//div[contains(@class,'studybit keyterm')])[1]", asserters.isDisplayed, 30000)
            .click()
            .waitForElementByXPath("//li[contains(@class,'banner ng-scope')]//button[@id='tags']", asserters.isDisplayed, 25000)
            // .waitForElementByXPath("//section[@class='studybit-details']//ul//li//a[contains(text(),'TAGS')]", asserters.isDisplayed, 30000)
            .click()
            .waitForElementByXPath("//li[@class='tag-item ng-scope']//span", asserters.isDisplayed, 30000)
            .text().then(function (editedText) {
                if (editedText.indexOf(editedUserTagText) > -1) {
                    console.log(report.reportHeader()
                        + report.stepStatusWithData("STUDYBOARD :: EXPANDED KEY TERM STUDYBIT USER TAG " + editedText + " compared with text ", editedUserTagText, "success")
                        + report.reportFooter());
                } else {
                    console.log(report.reportHeader()
                        + report.stepStatusWithData("STUDYBOARD :: EXPANDED KEY TERM STUDYBIT USER TAG " + editedText + " compared with text ", editedUserTagText, "failure")
                        + report.reportFooter());
                }
            });
    },

    verifyFilteredStudybit: function (browser, element) {
        return browser
            .waitForElementByCss(element, asserters.isDisplayed, 30000)
            .isDisplayed()
            .should.become(true)
            .waitForElementByCss(element, asserters.isDisplayed, 30000)
            .text();
    },

    openKeyTermStudybit: function (browser) {
        return browser
            .waitForElementByXPath("(//li[contains(@class,'tile')]//div[contains(@class,'studybit keyterm')])[1]", asserters.isDisplayed, 30000)
            .click();
    },

    clickOnTag: function (browser) {
        return browser
            .waitForElementByXPath("//li[contains(@class,'banner ng-scope')]//button[@id='tags']", asserters.isDisplayed, 30000)
            // .waitForElementByXPath("//section[@class='studybit-details']//ul//li//a[contains(text(),'TAGS')]", asserters.isDisplayed, 30000)
            .click();
    },

    deleteUserTag: function (browser) {
        return browser
            .waitForElementByXPath("//section[@class='studybit-details']//ul//li[@class='tags is-expanded']//li[@class='tag-item ng-scope']//button", asserters.isDisplayed, 30000)
            .click()
            .hideKeyboard();
    },
    refreshFunction: function (browser) {
        return browser
            .refresh();
    },

    verifyTagDeleted: function (browser) {
        return browser
            .waitForElementsByCssSelector(".studybit-details ul li.tags.is-expanded", asserters.isDisplayed, 60000).then(function (tag) {
                tag[0].elementsByXPath("//li[@class='tag-item ng-scope']").then(function (userTagCount) {
                    if (_.size(userTagCount) == 0) {
                        console.log(report.reportHeader() +
                            report.stepStatus("KeyTerm user tag count after deleted", _.size(userTagCount), "success") +
                            report.reportFooter());
                    } else {
                        console.log(report.reportHeader() +
                            report.stepStatus("KeyTerm user tag count after deleted", _.size(userTagCount), "failure") +
                            report.reportFooter());
                    }
                });
            });
    },

    selectTextFromAHead: function (browser, studybitId, windowScrollY) {
        return  browser
            .waitForElementByCss("#" + studybitId, asserters.isDisplayed, 90000).then(function(textForABCHead){
            return  browser
              .sleep(2000)
              .getLocationInView(textForABCHead)
              .sleep(2000)
              .execute("window.scrollBy(0,-140)")
              .sleep(2000)
              .waitForElementByCss("#" + studybitId + " span:nth-child(1)", asserters.isDisplayed, 90000)
              .click()
              .sleep(2000)
              .elementByCssSelectorWhenReady(".studybit-menu.text.unassigned.editing", 10000)
              .isDisplayed()
              .should.become(true);
            });

    },

    fetchTheNumberOfPublisherTag: function (browser) {
        return browser
            .elementByCssSelectorWhenReady(".studybit-menu.text.unassigned.editing", 10000).then(function(editPanel){
            return  browser
              .getLocationInView(editPanel)
              .sleep(1000)
              .waitForElementsByCss("ul.tag-list li.not-removable span", asserters.isDisplayed, 90000);
            });
    },

    verifyMathEquation: function (browser, id) {
        return browser
            .waitForElementByCss("#" + id, asserters.isDisplayed, 90000).getAttribute('class');
    },

    openMathEquationStudybit: function (browser) {
        return browser
            .waitForElementByXPath("(//li[contains(@class,'tile')]//div[contains(@class,'studybit text')])[1]", asserters.isDisplayed, 30000)
            .click();
    },

    createKeyTermStudyBitForNewCourse: function (browser, done, keytermSBId, definition, notes, windowScrollY) {
        return browser
            .waitForElementByCss("#" + keytermSBId + "", asserters.isDisplayed, 90000).then(function(studybitKey){
                return browser
                .getLocationInView(studybitKey)
                .execute("window.scrollBy(0,-140)")
                .sleep(1000)
                .waitForElementByCss("#" + keytermSBId + "", asserters.isDisplayed, 90000)
                .click()
                .sleep(1000)
                .execute("window.scrollBy(0,140)").then(function () {
                  return  browser
                        .elementByCssSelectorWhenReady(".studybit-menu.keyterm.unassigned.editing", 10000)
                        .isDisplayed()
                        .should.become(true).then(function () {
                          return browser
                           .sleep(1000)
                           .waitForElementByXPath("//button[contains(text(),'ADD TO STUDYBOARD')]", asserters.isDisplayed, 60000)
                           .click()
                           .nodeify(done);
              });
          });
      });
    },
    closeStudyBitPanelOnNarrative : function(browser,id){
      return browser
      .waitForElementByCss("#"+id, asserters.isDisplayed, 60000).then(function (closebutton) {
      return  browser
        .getLocationInView(closebutton)
        .execute("window.scrollBy(0,-140)")
        .elementByCssSelectorWhenReady(".studybit-menu .icon-close-x-blue", 5000)
        .click();
      });
    },

    createTextStudyBitForNewCourse: function (browser, done, studybitId, notes, comprehension, windowScrollY) {
        return browser
            .waitForElementByCss("#" + studybitId, asserters.isDisplayed, 30000).then(function(studybitText){
                return browser
                  .getLocationInView(studybitText)
                  .execute("window.scrollBy(0,-140)")
                  .waitForElementByCss("#" + studybitId + " span:nth-child(1)", asserters.isDisplayed, 90000)
                  .click().then(function () {
                          return  browser
                          .waitForElementByXPath("//div[contains(@class,'studybit-menu text unassigned editing')]//div[@class='actions']/button[contains(@class,'save')]", asserters.isDisplayed, 60000)
                           .click()
                           .nodeify(done);
                });
            });


    },
    openCreatedSB : function(browser, editStudybit){
      return browser
          .sleep(3000)
          .waitForElementByCss("#"+ editStudybit, asserters.isDisplayed, 30000)
          .click().then(function(){
                return browser
                    .sleep(2000)
                    .waitForElementByXPath("//button[contains(text(),'SAVE')]", asserters.isDisplayed, 30000)
                    .text().should.eventually.include("SAVE");
              });
    },
    verifyTheCreatedSBOnStudyBoard : function(browser,SBtype){
        basicpo.clickOnMenu(browser);
          return browser
              .sleep(1000)
              .waitForElementByCss("div.icon-studyboard-blue", asserters.isDisplayed, 30000).click().then(function () {
                return  browser
                  .waitForElementByXPath("(//li[contains(@class,'tile')]//div[contains(@class,'studybit "+SBtype+"')])[1]", asserters.isDisplayed, 30000);
            });
    },
    verifyAnotherExhibitPresent : function(browser, exhibitid, name){
      return browser
          .waitForElementByCss("#" + exhibitid + " .ordinal", asserters.isDisplayed, 60000)
          .text().should.eventually.include(name);
    },
    clickOnInlineLink : function(browser, id, text){
      return browser
      .waitForElementByXPath("//p[@id='" + id + "']//span[contains(.,'" + text + "')]", asserters.isDisplayed, 60000)
      .click();
    },
    closePacticeQuizPanel: function(browser,done){
      return browser
      .waitForElementByCss(".icon-close-x-blue.close-sidebar")
      .click()
      .nodeify(done);
    },



    validateOnMyFilteredStudybitsEnabled: function (browser) {
        return browser
        .waitForElementByXPath("//label[contains(text(),'On my filtered StudyBits')]", asserters.isDisplayed, 10000)
        .click()
        .sleep(5000)
        .waitForElementByCss("#filtered-studybits-label").getAttribute('aria-checked');
    },
    navigateToCreateStudybitPanel : function(browser){
      return browser
      .waitForElementByCss(".sliding-menu-button.ng-scope", asserters.isDisplayed, 2000)
      .click()
      .waitForElementByCss("nav.sliding-menu-content", asserters.isDisplayed, 5000)
      .sleep(2000);

    },
    validateOnMyFilteredStudybitsDisabled : function(browser){
      return browser
         .waitForElementByCss("#filtered-studybits-label").getAttribute('aria-disabled');
    },

    createKeyTermStudyBitOnChapterReview : function(browser,keyTermId,done){
       return browser
       .waitForElementByCss("#"+keyTermId, asserters.isDisplayed, 90000).then(function(keytermSBLocation){
         return browser
         .getLocationInView(keytermSBLocation)
         .execute("window.scrollBy(0,-140)")
         .waitForElementByCss("#"+keyTermId, asserters.isDisplayed, 90000)
        //  .click()
         .elementByCssSelectorWhenReady(".studybit-menu.keyterm.unassigned.editing", 10000)
         .isDisplayed()
         .should.become(true)
         .waitForElementByCss(".save.create", asserters.isDisplayed, 60000).then(function(saveButton){
           return browser
           .getLocationInView(saveButton)
           .execute("window.scrollBy(0,-140)")
           .waitForElementByCss(".save.create", asserters.isDisplayed, 60000)
           .click()
           .nodeify(done);
       });
     });
    },
    getStatusOfPublisherTag: function(browser){
      return browser
        .hasElementByCss(".tag-item.not-removable span");
    },
    getCountOfPublisherTag: function(browser){
      return browser
        .waitForElementByCss(".tag-item.not-removable span", asserters.isDisplayed, 60000);
    },
    openKeyTermStudybitOnReviewPage: function(browser) {
      return browser
      .waitForElementByCss(".studybit-icon.keyterm.unassigned.saved", asserters.isDisplayed, 60000).then(function(keyIcon){
        return browser
        .getLocationInView(keyIcon)
        .execute("window.scrollBy(0,-140)")
        .waitForElementByCss(".studybit-icon.keyterm.unassigned.saved", asserters.isDisplayed, 60000)
        .click();
      });
    },

    validateAttemptOnRefreshing: function(browser){
        return browser
        .hasElementByCss(".cas-task");
    },

   validateTextAfterDeletingAllStudybits: function(browser){
     return browser
       .waitForElementByCss(".no-matches.ng-scope.ng-binding", asserters.isDisplayed, 60000);
   },

   checkOnMyFilteredButtonDisabledIfNoStudybitsPresent: function(browser){
     return browser
       .waitForElementByCss(".sliding-menu-button.ng-scope", asserters.isDisplayed, 2000)
       .click()
       .waitForElementByXPath("//section[contains(@class,'select-chapter')]//div[1]", asserters.isDisplayed, 60000);
   },
   expandStudyBit: function(browser){
     return  browser
           .elementByCssSelectorWhenReady(".studybit.text", asserters.isDisplayed, 2000).click();
   },
   editStudybitWithTag: function(browser, usertag){
         return browser
             .waitForElementByXPath("(//li[contains(@class,'tile')]//div[contains(@class,'studybit text')])[1]", asserters.isDisplayed, 30000).then(function(textStudybit){
               return browser
                .getLocationInView(textStudybit)
                .waitForElementByXPath("(//li[contains(@class,'tile')]//div[contains(@class,'studybit text')])[1]", asserters.isDisplayed, 30000)
                .click()
                .sleep(2000)
                .waitForElementByXPath("//section[@class='studybit-details']//ul//li//button[contains(text(),'TAGS')]", asserters.isDisplayed, 30000).then(function(tagsOnSB){
                 return browser
                  // .getLocationInView(textStudybit)
                  .execute("return document.getElementsByClassName('studybit-details')[0].getElementsByClassName('notes')[0].scrollIntoView()")
                  .waitForElementByXPath("//section[@class='studybit-details']//ul//li//button[contains(text(),'TAGS')]", asserters.isDisplayed, 30000)
                  .click()
                  .waitForElementByXPath("//section[@class='studybit-details']//ul//li[@class='tags is-expanded']//ul//input", asserters.isDisplayed, 30000)
                  .click()
                  .waitForElementByCss(".tags.is-expanded div.tags input", asserters.isDisplayed, 90000)
                  .type(usertag)
                  .type(wd.SPECIAL_KEYS.Tab)
                  .type(wd.SPECIAL_KEYS.Enter)
                  .waitForElementByCss(".tag-item.ng-scope button", asserters.isDisplayed, 60000);
                });
             });
   },
   editKeyTermStudybitWithTag: function(browser, usertag){
         return browser
             .waitForElementByXPath("(//li[contains(@class,'tile')]//div[contains(@class,'studybit keyterm')])", asserters.isDisplayed, 30000).then(function(keyTermStudybit){
               return browser
                .getLocationInView(keyTermStudybit)
                .waitForElementByXPath("(//li[contains(@class,'tile')]//div[contains(@class,'studybit keyterm')])", asserters.isDisplayed, 30000)
                .click()
                .sleep(2000)
                .waitForElementByXPath("//section[@class='studybit-details']//ul//li//button[contains(text(),'TAGS')]", asserters.isDisplayed, 30000)
                .click()
                .waitForElementByXPath("//section[@class='studybit-details']//ul//li[@class='tags is-expanded']//ul//input", asserters.isDisplayed, 30000)
                .click()
                .waitForElementByCss(".tags.is-expanded div.tags input", asserters.isDisplayed, 90000)
                .type(usertag)
                .type(wd.SPECIAL_KEYS.Tab)
                .type(wd.SPECIAL_KEYS.Enter)
                .hideKeyboard()
                .waitForElementByCss(".tag-item.ng-scope button", asserters.isDisplayed, 60000);
             });
   },
validateSaveButtonOneditTextStudyBit: function (browser, done, studybitId) {
       return browser
           .waitForElementByCss("#" + studybitId, asserters.isDisplayed, 30000)
           .then(function (studybit) {
             return browser.getLocationInView(studybit)
               .execute("window.scrollBy(0,-140)")
               .waitForElementByCss("#" + studybitId + " span:nth-child(1)", asserters.isDisplayed, 90000)
               .click().then(function () {
                 return browser
                 .waitForElementByXPath("//div[contains(@class,'menu studybit-details ng-scope')]//div[@class='actions']/button[contains(@class,'save')]", asserters.isDisplayed, 60000).text()
                 .then(function (studyBitSaveButton) {
                 console.log("studyBitSaveButton"+studyBitSaveButton);
                  if(studyBitSaveButton.indexOf("SAVE")>-1){
                         console.log(report.reportHeader() +
                         report.stepStatusWithData(" Studybit popup does not contains", studyBitSaveButton ,"success") +
                         report.reportFooter());
                         done();
                     }
                     else{
                       console.log(report.reportHeader() +
                       report.stepStatusWithData(" Studybit popup does not contains", studyBitSaveButton ,"failure") +
                       report.reportFooter());
                     }
             });
         });
     });
 },
 validateTextOnLogo: function(browser){
   return  browser
         .waitForElementByCss(".studybits-help-modal figcaption h3", asserters.isDisplayed, 2000);
 },
 fetchRelatedTopics: function (browser) {
     return browser
    //  .waitForElementByXPath("//li[@class='more ng-scope']//button", asserters.isDisplayed, 30000)
     .waitForElementByCss("#more", asserters.isDisplayed, 30000)
     .click()
     .sleep(2000)
     .waitForElementByCss(".more.ng-scope.is-expanded .submenu li ul li:nth-child(1) a", asserters.isDisplayed, 30000);

 },

fetchTopicsOnMore: function (browser, linkText) {
     return browser
    //  .waitForElementByXPath("//li[@class='more ng-scope']//button", asserters.isDisplayed, 30000)
     .sleep(2000)
     .hasElementByXPath("//li[contains(@class,'more') and contains(@class,'is-expanded')]//ul//li//a[contains(text(),'"+linkText+"')]");

 },

 verifyRelatedTopicsafterEdit: function (browser) {
     return browser
     .waitForElementByXPath("//li[@class='more ng-scope']//button", asserters.isDisplayed, 30000)
     .click()
     .sleep(2000)
    .hasElementByCss(".more.ng-scope.is-expanded .submenu li ul li:nth-child(1) a");

 },
getTextOfChapter: function(browser, chapterName){
    return browser
    .waitForElementByXPath("//div[contains(@class,'chart-container ng-scope')]/h1[contains(.,'"+chapterName+"')]",asserters.isDisplayed, 10000)
    .then(function(scrollToLocation){
      return browser
      .getLocationInView(scrollToLocation)
      .execute("window.scrollBy(0,-140)")
      .waitForElementByXPath("//h1[contains(.,'"+chapterName+"')]/following-sibling::div[contains(@class,'chartjs overview')]//div[@class='studybits']//div[contains(@class,'studybit-count')]", asserters.isDisplayed, 90000).text()
      });
   },

   expandFilterToggleButton: function(browser){
     return browser
                .sleep(3000)
                .waitForElementByXPath("//button[@class='filter-button ng-binding'][@aria-disabled='false']").click()
                .sleep(1000)
                .hasElementByXPath("//button[@class='filter-button ng-binding open'][@aria-expanded='true']");
   },

   collapseFilterToggleButton: function(browser){
     return browser
                .waitForElementByXPath("//button[@class='filter-button ng-binding open'][@aria-expanded='true']").click()
                .sleep(1000)
                .hasElementByXPath("//button[@class='filter-button ng-binding'][@aria-disabled='false']");
   },

   clearAllChapterToggleButton: function(browser){
     return browser
               .waitForElementByXPath("//h6[contains(text(),'Chapter')]/parent::div//div[@class='show-all-toggle ng-binding ng-scope'][text()='CLEAR ALL']").click()
               .sleep(1000)
               .hasElementByXPath("//h6[contains(text(),'Chapter')]/parent::div//div[@class='show-all-toggle ng-binding ng-scope'][text()='SHOW ALL']");
   },
   showAllChapterToggleButton: function(browser){
     return browser
               .waitForElementByXPath("//h6[contains(text(),'Chapter')]/parent::div//div[@class='show-all-toggle ng-binding ng-scope'][text()='SHOW ALL']").click()
                .sleep(1000)
               .hasElementByXPath("//h6[contains(text(),'Chapter')]/parent::div//div[@class='show-all-toggle ng-binding ng-scope'][text()='CLEAR ALL']");
   },
   clearAllTypesToggleButton: function(browser){
     return browser
               .waitForElementByXPath("//h6[contains(text(),'Type')]/parent::div//div[@class='show-all-toggle ng-binding ng-scope'][text()='CLEAR ALL']").click()
               .sleep(1000)
               .hasElementByXPath("//h6[contains(text(),'Type')]/parent::div//div[@class='show-all-toggle ng-binding ng-scope'][text()='SHOW ALL']");

   },
   showAllTypesToggleButton: function(browser){
     return browser
               .waitForElementByXPath("//h6[contains(text(),'Type')]/parent::div//div[@class='show-all-toggle ng-binding ng-scope'][text()='SHOW ALL']").click()
                .sleep(1000)
               .hasElementByXPath("//h6[contains(text(),'Type')]/parent::div//div[@class='show-all-toggle ng-binding ng-scope'][text()='CLEAR ALL']");
   },
   clearAllMyUnderstandingToggleButton: function(browser){
     return browser
               .waitForElementByXPath("//h6[contains(text(),'My Understanding')]/parent::div//div[@class='show-all-toggle ng-binding ng-scope'][text()='CLEAR ALL']").click()
               .sleep(1000)
               .hasElementByXPath("//h6[contains(text(),'My Understanding')]/parent::div//div[@class='show-all-toggle ng-binding ng-scope'][text()='SHOW ALL']");

   },
   showAllMyUnderstandingToggleButton: function(browser){
     return browser
               .waitForElementByXPath("//h6[contains(text(),'My Understanding')]/parent::div//div[@class='show-all-toggle ng-binding ng-scope'][text()='SHOW ALL']").click()
                .sleep(1000)
               .hasElementByXPath("//h6[contains(text(),'My Understanding')]/parent::div//div[@class='show-all-toggle ng-binding ng-scope'][text()='CLEAR ALL']");
   },

     clickOnKeyTerm: function(browser,keyTermId){
        if (process.env.RUN_IN_BROWSER.toString() === "\"firefox\""){
         return browser
         .sleep(8000)
         .waitForElementByCss("#"+keyTermId, asserters.isDisplayed, 90000).then(function(keytermSBLocation){
           return browser
           .getLocationInView(keytermSBLocation)
           .execute("window.scrollBy(0,-140)")
           .sleep(1000)
           .waitForElementByCss("#"+keyTermId, asserters.isDisplayed, 90000)
           .click();
         });
         }else{
             return browser
             .waitForElementByCss("#"+keyTermId, asserters.isDisplayed, 90000).then(function(keytermSBLocation){
               return browser
               .getLocationInView(keytermSBLocation)
               .execute("window.scrollBy(0,-140)")
               .waitForElementByCss("#"+keyTermId, asserters.isDisplayed, 90000)
               .click();
             });
         }
     },

     publisherTagPresentStatus: function(browser){
         return browser
         .sleep(1000)
         .hasElementByCss(".tag-list li span");
     },

     getStudyBitCountTextOnCT: function(browser, chapterName){
         return browser
         .sleep(3000)
         .execute("return (document.evaluate(\"//h1[contains(.,'"+chapterName+"')]/following-sibling::div[contains(@class,'chartjs overview')]//div[@class='studybits']//div[contains(@class,'studybit-count')]\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue).scrollIntoView()")
         .sleep(1000)
         .execute("return window.scrollBy(0,-340)")
         .sleep(1000)
         .waitForElementByXPath("//h1[contains(.,'" + chapterName + "')]/following-sibling::div[contains(@class,'chartjs overview')]//div[@class='studybits']//div[contains(@class,'studybit-count')]", asserters.isDisplayed, 90000)
         .text();
         // productData.chapter.topic.studybit.keytermOnChapterReview.name
     },

     validateUnassignedTagPresenceStatus: function(browser, chapterName, tagValue){
         return browser
         .hasElementByXPath("//h1[contains(.,'"+chapterName+"')]/following-sibling::div[contains(@class,'chartjs')]//div//h3[contains(text(),'"+tagValue+"')]")
     },

     getStudyBitCountsUnderUnassigned:function(browser, chapterName, tagValue){
         return browser
         .waitForElementByXPath("//h1[contains(.,'"+chapterName+"')]/following-sibling::div[contains(@class,'chartjs')]//div//h3[contains(text(),'"+tagValue+"')]//parent::div//div[@class='studybits']//div[contains(@class,'studybit-count')]", asserters.isDisplayed, 90000)
         .text();
     },

     clickOnStudyBitCountOnCT : function(browser, chapterName){
         return browser
         .sleep(3000)
         .waitForElementByXPath("//h1[contains(.,'" + chapterName + "')]/following-sibling::div[contains(@class,'chartjs overview')]//div[@class='studybits']//div[contains(@class,'studybit-count')]", asserters.isDisplayed, 90000)
         .click();
         // productData.chapter.topic.studybit.keytermOnChapterReview.name
     },
    scrollToChapterLocation: function(browser, chapterName){
        if (process.env.RUN_IN_BROWSER.toString() === "\"internet explorer\""){
        return browser
        .sleep(2000)
        .execute("return (document.evaluate(\"//h1[contains(.,'" + chapterName + "')]/following-sibling::div[contains(@class,'chartjs overview')]//div[@class='studybits']//div[contains(@class,'studybit-count')]\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue).scrollIntoView()")
        .sleep(2000)
        .execute("window.scrollBy(0,-400)");
        // productData.chapter.topic.studybit.keytermOnChapterReview.name
        }else{
             return browser
             .sleep(3000)
             .waitForElementByXPath("//h1[contains(.,'" + chapterName + "')]/following-sibling::div[contains(@class,'chartjs overview')]//div[@class='studybits']//div[contains(@class,'studybit-count')]", asserters.isDisplayed, 90000).then(function(scrollToStudybitCount){
             return browser
               .getLocationInView(scrollToStudybitCount);
        });

        }
    }


};
