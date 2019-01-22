var wd = require('wd');
var asserters = wd.asserters;
var report = require("../../../../support/reporting/reportgenerator");
var dataUtil = require("../../../../util/date-utility.js");
var loginPage = require("./loginpo");
var _ = require('underscore');
var publisherTagValue;
var imagePublisherTagValue;
var stringutil = require("../../../../util/stringUtil");
var commonutil = require("../../../../util/commonUtility.js");
module.exports = {

    createTextStudyBit: function (browser, done, studybitId, publishertag, usertag, notes, comprehension, windowScrollY) {
         if (process.env.RUN_IN_BROWSER.toString() === "\"internet explorer\""){
        return browser
            .waitForElementByCss("#" + studybitId, asserters.isDisplayed, 30000)
            .then(function (studybit) {
              return browser
                .execute("document.getElementById('"+studybitId+"').scrollIntoView(true);")
               .sleep(1000)
               // .execute("window.scrollBy(0,-150)")
                // .getLocationInView(studybit)
                .execute("window.scrollBy(0,-140)")
                .sleep(2000)
                .waitForElementByCss("#" + studybitId + " span:nth-child(1)", asserters.isDisplayed, 90000)
                .click().then(function () {
                  return browser
                        .waitForElementByCss("textarea", asserters.isDisplayed, 90000).then(function (scrollToNotes) {
                          browser
                          // .getLocationInView(scrollToNotes)
                          .execute("return document.getElementsByTagName('textarea')[0].scrollIntoView(true);")
                          .sleep(2000)
                          .execute("window.scrollBy(0,-100)")
                          .waitForElementByCss(".studybit-menu.text.unassigned.editing", asserters.isDisplayed, 90000).then(function () {
                            browser
                                .waitForElementByCss(".tag-list li:first-child span", asserters.isDisplayed, 90000).text().then(function (text) {
                                  var x = text;
                                    console.log("text::" + text);
                                    if (publishertag.indexOf(text) > -1) {
                                        console.log(report.reportHeader() +
                                            report.stepStatusWithData("STUDYBIT POPUP BEFORE SAVE :: Successful Validation of the retrieval of Publisher Concept Tag ", publishertag, "success") +
                                            report.reportFooter());
                                      return browser
                                            .waitForElementByXPath("(//textarea[contains(@class,'notes')])", asserters.isDisplayed, 60000)
                                            .click()
                                            .type(notes)
                                            .sleep(1000)
                                            .waitForElementByCss("div.tags input", asserters.isDisplayed, 90000)
                                            .type(usertag)
                                            .sleep(1000)
                                            .type(wd.SPECIAL_KEYS.Tab)
                                            .type(wd.SPECIAL_KEYS.Enter)
                                            .sleep(1000)
                                            .waitForElementByCss(".tag-item.ng-scope span", asserters.isDisplayed, 60000)
                                            .waitForElementByCss(".save.create", asserters.isDisplayed, 60000)
                                            .click().then(function () {
                                                browser
                                                    .waitForElementByXPath("(//div[contains(@class,'studybit-icon text unassigned saved')])[1]", asserters.isDisplayed, 60000)
                                                    .isDisplayed()
                                                    .should.become(true)
                                                    .nodeify(done);
                                            });
                                    } else {
                                        console.log(report.reportHeader() +
                                            report.stepStatusWithData(" Failure in retrieval of Publisher Concept Tag ", publishertag, "failure") +
                                            report.reportFooter());
                                    }
                                });
                        });
                });
              });
            });
          }
          else{
            return browser
                .waitForElementByCss("#" + studybitId, asserters.isDisplayed, 30000)
                .then(function (studybit) {
                  return browser.getLocationInView(studybit)
                    .execute("window.scrollBy(0,-140)")
                    .waitForElementByCss("#" + studybitId + " span:nth-child(1)", asserters.isDisplayed, 90000)
                    .click().then(function () {
                      return browser
                            .waitForElementByCss("textarea", asserters.isDisplayed, 90000).then(function (scrollToNotes) {
                              browser
                              .getLocationInView(scrollToNotes)
                              .execute("window.scrollBy(0,-100)")
                              .getLocationInView(scrollToNotes)
                              .waitForElementByCss(".studybit-menu.text.unassigned.editing", asserters.isDisplayed, 90000).then(function () {
                                browser
                                    .waitForElementByCss(".tag-list li:first-child span", asserters.isDisplayed, 90000).text().then(function (text) {
                                      var x = text;
                                        console.log("text::" + text);
                                        if (publishertag.indexOf(text) > -1) {
                                            console.log(report.reportHeader() +
                                                report.stepStatusWithData("STUDYBIT POPUP BEFORE SAVE :: Successful Validation of the retrieval of Publisher Concept Tag ", publishertag, "success") +
                                                report.reportFooter());
                                          return browser
                                                .waitForElementByXPath("(//textarea[contains(@class,'notes')])", asserters.isDisplayed, 60000)
                                                .click()
                                                .type(notes)
                                                .sleep(1000)
                                                .waitForElementByCss("div.tags input", asserters.isDisplayed, 90000)
                                                .type(usertag)
                                                .sleep(1000)
                                                .type(wd.SPECIAL_KEYS.Tab)
                                                .type(wd.SPECIAL_KEYS.Enter)
                                                .sleep(1000)
                                                .waitForElementByCss(".tag-item.ng-scope span", asserters.isDisplayed, 60000)
                                                .waitForElementByCss(".save.create", asserters.isDisplayed, 60000)
                                                .click().then(function () {
                                                    browser
                                                        .waitForElementByXPath("(//div[contains(@class,'studybit-icon text unassigned saved')])[1]", asserters.isDisplayed, 60000)
                                                        .isDisplayed()
                                                        .should.become(true)
                                                        .nodeify(done);
                                                });
                                        } else {
                                            console.log(report.reportHeader() +
                                                report.stepStatusWithData(" Failure in retrieval of Publisher Concept Tag ", publishertag, "failure") +
                                                report.reportFooter());
                                        }
                                    });
                            });
                    });
                  });
                });
          }
    },

    expandStudyBit: function(browser){
      return  browser
            .elementByCssSelectorWhenReady(".studybit.text", asserters.isDisplayed, 2000).click();
    },
    verifyMathEqtnError: function(browser){
      return  browser
            .hasElementByCss(".MathJax_Error");
    },

    validateTextOnLogo: function(browser){
      return  browser
            .waitForElementByCss(".studybits-help-modal figcaption h3", asserters.isDisplayed, 2000);
    },

    editTextStudyBit: function (browser, done, studybitId, publishertag, usertag, notes, comprehension, windowScrollY) {
         return browser
             .waitForElementByCss("#" + studybitId, asserters.isDisplayed, 30000)
             .then(function (studybit) {
               return browser.getLocationInView(studybit)
                 .execute("window.scrollBy(0,-140)")
                 .waitForElementByCss("#" + studybitId + " span:nth-child(1)", asserters.isDisplayed, 90000)
                 .click().then(function () {
                   return browser
                         .waitForElementByCss("textarea", asserters.isDisplayed, 90000).then(function (scrollToNotes) {
                          return browser
                           .getLocationInView(scrollToNotes)
                           .execute("window.scrollBy(0,140)")
                           .waitForElementByCss(".studybit-menu.text.unassigned.editing", asserters.isDisplayed, 90000).then(function () {
                            return browser
                                 .waitForElementByCss(".tag-list li:first-child span", asserters.isDisplayed, 90000).text().then(function (text) {
                                   var x = text;
                                     if (publishertag.indexOf(text) > -1) {
                                         console.log(report.reportHeader() +
                                             report.stepStatusWithData("STUDYBIT POPUP BEFORE SAVE :: Successful Validation of the retrieval of Publisher Concept Tag ", publishertag, "success") +
                                             report.reportFooter());
                                       return browser
                                             .waitForElementByXPath("(//textarea[contains(@class,'notes')])", asserters.isDisplayed, 60000)
                                             .clear()
                                             .waitForElementByXPath("(//textarea[contains(@class,'notes')])", asserters.isDisplayed, 60000)
                                             .click()
                                             .type(notes)
                                             .waitForElementByXPath("//button[@id='FAIR-button']", asserters.isDisplayed, 90000).then(function(fairButton){
                                            return  browser
                                               .getLocationInView(fairButton)
                                               //.execute("window.scrollBy(0,-140)")
                                               .waitForElementByXPath("//button[@id='FAIR-button']", asserters.isDisplayed, 90000)
                                               .click()
                                               .waitForElementByCss(".remove-button.ng-binding.ng-scope", asserters.isDisplayed, 90000)
                                               .click()
                                               .waitForElementByCss("div.tags input", asserters.isDisplayed, 90000)
                                               .type(usertag)
                                               .sleep(1000)
                                               .type(wd.SPECIAL_KEYS.Tab)
                                               .type(wd.SPECIAL_KEYS.Enter)
                                               .sleep(1000)
                                               .waitForElementByCss(".tag-item.ng-scope span", asserters.isDisplayed, 60000)
                                               .waitForElementByXPath("//div[contains(@class,'menu studybit-details ng-scope')]//div[@class='actions']/button[contains(@class,'save')]", asserters.isDisplayed, 60000).text()
                                               .then(function (studyBitSaveButton) {
                                                console.log("studyBitSaveButton"+studyBitSaveButton);
                                                if(studyBitSaveButton.indexOf("SAVE")>-1){
                                                  console.log(report.reportHeader() +
                                                  report.stepStatusWithData(" Studybit popup does not contains" ,"Save button","success") +
                                                  report.reportFooter());
                                                   }
                                                   else{
                                                     console.log(report.reportHeader() +
                                                     report.stepStatusWithData(" Studybit popup does not contains" ,"Save button","failures") +
                                                     report.reportFooter());
                                                   }
                                                 })
                                                .waitForElementByXPath("//div[contains(@class,'menu studybit-details ng-scope')]//div[@class='actions']/button[contains(@class,'save')]", asserters.isDisplayed, 60000)
                                               .click().then(function () {
                                              return browser
                                               .sleep(2000)
                                               .waitForElementByXPath("//div[contains(@class,'studybit-icon text saved fair')]", asserters.isDisplayed, 60000)
                                               .nodeify(done);
                                               });
                                             });


                                     } else {
                                         console.log(report.reportHeader() +
                                             report.stepStatusWithData(" Failure in retrieval of Publisher Concept Tag ", publishertag, "failure") +
                                             report.reportFooter());
                                     }
                                 });
                         });
                 });
               });
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

    validateRefreshStatus: function(browser){
      return browser
      .refresh().then(function(){
        return browser
        .waitForElementsByCss(".cas-activity-series.cas-activity-series-unvisited", asserters.isDisplayed,80000).then(function(elements){
          var unvisited= _.size(elements);
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
            .sleep(3000)
            .execute("window.scrollBy(0,-140)")
            .elementByCssSelectorWhenReady(".studybit-icon.text.saved", asserters.isDisplayed, 90000)
            .click()
            .then(function () {
                browser.waitForElementByCss("ul.tag-list li.not-removable:nth-child(1) span", asserters.isDisplayed, 90000)
                    .text()
                    .then(
                    function (text) {
                        if (publishertag.indexOf(text) > -1) {
                            console.log(report.reportHeader() +
                                report.stepStatusWithData("STUDYBIT POPUP AFTER SAVE:: Saved Text StudyBit has the Publisher Concept ", publishertag, "success") +
                                report.reportFooter());
                                browser.waitForElementByXPath("//li[@class='tag-item ng-scope']/span[text()='" + usertag + "']", asserters.isDisplayed, 90000)
                                .then(function () {
                                    console.log(report.reportHeader() +
                                        report.stepStatusWithData("STUDYBIT POPUP AFTER SAVE ::Saved Text StudyBit has the user concept ", usertag, "success") +
                                        report.reportFooter());
                                        browser.execute("return document.getElementsByTagName(\"textarea\")[0].value").then(
                                        function (notesSaved) {
                                            if (notesSaved.indexOf(notes) > -1) {
                                                console.log(report.reportHeader() +
                                                    report.stepStatusWithData("STUDYBIT POPUP AFTER SAVE :: Saved Text StudyBit has the user notes saved ", notes, "success") +
                                                    report.reportFooter());
                                                done();
                                            }
                                            else {
                                                console.log(report.reportHeader() +
                                                    report.stepStatusWithData("STUDYBIT POPUP AFTER SAVE :: Saved Text StudyBit does not have the user notes saved ", usertag, "failure") +
                                                    report.reportFooter());
                                            }
                                        }
                                    );
                                });
                        }
                        else {
                            console.log(report.reportHeader() +
                                report.stepStatusWithData(" Saved Text StudyBit has the Publisher Concept ", publishertag, "failure") +
                                report.reportFooter());
                        }
                    });
            });
    },

    createKeyTermStudyBit: function (browser, done, keytermSBId, definition, comprehension, publishertag, notes, usertag, windowScrollY) {
      if (process.env.RUN_IN_BROWSER.toString() === "\"internet explorer\""){
        console.log("in IE");
        return browser
            .sleep(3000)
            .waitForElementByCss("#" + keytermSBId + "", asserters.isDisplayed, 90000).then(function(keytermSBLocation){
            return  browser
              .getLocationInView(keytermSBLocation)
              .sleep(1000)
              .execute("window.scrollBy(0,-140)")
              .sleep(1000)
              .waitForElementByCss("#" + keytermSBId + "", asserters.isDisplayed, 90000)
              .click()
              .elementByCssSelectorWhenReady(".studybit-menu.keyterm.unassigned.editing", 10000)
              .isDisplayed()
              .should.become(true)
              .waitForElementByCss("ul.tag-list li.not-removable:nth-child(1) span", asserters.isDisplayed, 90000)
              .text()
              .then(
              function (text) {
                  if (publishertag.indexOf(text) > -1) {
                      console.log(report.reportHeader() +
                          report.stepStatusWithData("STUDYBIT POPUP BEFORE SAVE ::Successful Validation of the retrieval of Publisher Concept Tag ", publishertag, "success") +
                          report.reportFooter());
                          return  browser
                          .elementByCssSelectorWhenReady(".content.ng-binding", 10000)
                          .text()
                          .should.eventually.include(definition)
                          .waitForElementByCss("textarea", asserters.isDisplayed, 90000).then(function (scrollToNotes) {
                            browser.getLocationInView(scrollToNotes)
                            .elementByXPathSelectorWhenReady("(//textarea[contains(@class,'notes')])", 10000)
                            .click()
                            .sleep(1000)
                            .type(notes)
                            .sleep(1000)
                            .waitForElementByXPath("//button[contains(@class,'ng-scope ng-binding')and contains(.,'" + comprehension + "')]", asserters.isDisplayed, 90000)
                             .then(function(comprehensionLocation){
                            return browser
                             // .getLocationInView(comprehensionLocation)
                             .execute("return (document.evaluate(\"//button[contains(@class,'ng-scope ng-binding')and contains(.,'" + comprehension + "')]\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue).scrollIntoView()")
                             .sleep(1000)
                             .execute("window.scrollBy(0,-100)")
                              .sleep(1000)
                              .waitForElementByXPath("//button[contains(@class,'ng-scope ng-binding')and contains(.,'" + comprehension + "')]", asserters.isDisplayed, 90000)
                              .click()
                              // .sleep(1000)
                              // .execute("window.scrollBy(0,50)")
                              // .sleep(1000)
                              .waitForElementByCss("div.tags input", asserters.isDisplayed, 90000)
                              .type(usertag)
                              .sleep(1000)
                              .type(wd.SPECIAL_KEYS.Tab)
                              .type(wd.SPECIAL_KEYS.Enter)
                              .sleep(1000)
                              .waitForElementByCss(".save.create", asserters.isDisplayed, 60000).then(function(DoneBottonLocation){
                              // return  browser
                                // .execute("window.scrollBy(0,100)")
                                // .waitForElementByCss(".save.ng-scope", asserters.isDisplayed, 60000)
                                // .then(function(){
                                    return browser
                                      .sleep(1000)
                                      .waitForElementByCss(".save.create", asserters.isDisplayed, 60000)
                                      .click()
                                      // .elementByCssSelectorWhenReady(".studybit-icon.keyterm.fair.saved", 10000)
                                      // .isDisplayed()
                                      // .should.become(true)
                                      .nodeify(done);
                              //  });
                        //  })
                        });
                        });
                    });
                  }
                  else {
                      console.log(report.reportHeader() +
                          report.stepStatusWithData(" Failure in retrieval of Publisher Concept Tag of key term StudyBit", publishertag, "failure") +
                          report.reportFooter());
                  }
              });
            });
      }else {
        return browser
            .waitForElementByCss("#" + keytermSBId + "", asserters.isDisplayed, 90000).then(function(keytermSBLocation){
            return  browser
              .getLocationInView(keytermSBLocation)
              .execute("window.scrollBy(0,-140)")
              .sleep(1000)
              .waitForElementByCss("#" + keytermSBId + "", asserters.isDisplayed, 90000)
              .click()
              .elementByCssSelectorWhenReady(".studybit-menu.keyterm.unassigned.editing", 10000)
              .isDisplayed()
              .should.become(true)
              .waitForElementByCss("ul.tag-list li.not-removable:nth-child(1) span", asserters.isDisplayed, 90000)
              .text()
              .then(
              function (text) {
                  if (publishertag.indexOf(text) > -1) {
                      console.log(report.reportHeader() +
                          report.stepStatusWithData("STUDYBIT POPUP BEFORE SAVE ::Successful Validation of the retrieval of Publisher Concept Tag ", publishertag, "success") +
                          report.reportFooter());
                          return  browser
                          .elementByCssSelectorWhenReady(".content.ng-binding", 10000)
                          .text()
                          .should.eventually.include(definition)
                          .waitForElementByCss("textarea", asserters.isDisplayed, 90000).then(function (scrollToNotes) {
                            browser.getLocationInView(scrollToNotes)
                            .elementByXPathSelectorWhenReady("(//textarea[contains(@class,'notes')])", 10000)
                            .click()
                            .sleep(1000)
                            .type(notes)
                            .sleep(1000)
                           //  .waitForElementByXPath("//button[contains(@class,'ng-scope ng-binding')and contains(.,'" + comprehension + "')]", asserters.isDisplayed, 90000)
                            //  .then(function(comprehensionLocation){
                            //return browser
                            //  .getLocationInView(comprehensionLocation)
                            //  .execute("window.scrollBy(0,-50)")
                              .sleep(1000)
                              .waitForElementByXPath("//button[contains(@class,'ng-scope ng-binding')and contains(.,'" + comprehension + "')]", asserters.isDisplayed, 90000)
                              .click()
                              .sleep(1000)
                              .execute("window.scrollBy(0,100)")
                              .sleep(1000)
                              .waitForElementByCss("div.tags input", asserters.isDisplayed, 90000)
                              .type(usertag)
                              .sleep(1000)
                              .type(wd.SPECIAL_KEYS.Tab)
                              .type(wd.SPECIAL_KEYS.Enter)
                              .sleep(1000)
                              .waitForElementByCss(".save.create", asserters.isDisplayed, 60000).then(function(DoneBottonLocation){
                              return  browser
                                .execute("window.scrollBy(0,100)")
                                // .waitForElementByCss(".save.ng-scope", asserters.isDisplayed, 60000)
                                // //.then(function(){
                                //     return browser
                                      .sleep(1000)
                                      .waitForElementByCss(".save.create", asserters.isDisplayed, 60000)
                                      .click()
                                      .elementByCssSelectorWhenReady(".studybit-icon.keyterm.fair.saved", 10000)
                                      .isDisplayed()
                                      .should.become(true)
                                      .nodeify(done);
                              //  });
                        //  })
                        });
                        });
                  }
                  else {
                      console.log(report.reportHeader() +
                          report.stepStatusWithData(" Failure in retrieval of Publisher Concept Tag of key term StudyBit", publishertag, "failure") +
                          report.reportFooter());
                  }
              });
            });
      }
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
              .waitForElementByCss(".delete", asserters.isDisplayed, 90000).then(function(deleteSB){
                  return browser
                  .getLocationInView(deleteSB)
                  .execute("window.scrollBy(0,-140)")
                  .sleep(1000)
                  .waitForElementByCss(".delete", asserters.isDisplayed, 90000)
                  .click()
                  .nodeify(done);
                });
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

    validateKeyTermStudyBitSave: function (browser, done, keytermSBId, publishertag, usertag, notes, comprehension, windowScrollY, keytermDef) {
        if (process.env.RUN_IN_BROWSER.toString() === "\"internet explorer\""){
        return browser
            .sleep(4000)
          // .waitForElementByCss("#" + keytermSBId, asserters.isDisplayed, 30000)
            .execute("document.getElementById('"+keytermSBId+"').scrollIntoView(true);")
            .sleep(1000)
            // .execute("window.scrollBy(0,-150)")
             // .getLocationInView(studybit)
             .execute("window.scrollBy(0,-240)")
             .sleep(2000)
          // .then(function (keytermSBIdOnNarrative) {
          //   return browser.getLocationInView(keytermSBIdOnNarrative)
          //     .execute("window.scrollBy(0,-140)")
                  .elementByCssSelectorWhenReady(".studybit-icon.keyterm.fair.saved", asserters.isDisplayed, 90000)
                  .click()
                  .then(function () {
                    return  browser
                    .waitForElementByXPath("//div[contains(@class,'studybit-menu keyterm')]//span[@class='keytermdef']", asserters.isDisplayed, 90000)
                    .text().should.eventually.include(keytermDef)
                    .waitForElementByCss("ul.tag-list li.not-removable:nth-child(1) span", asserters.isDisplayed, 90000)
                    .text()
                    .then(
                    function (text) {
                        if (text.indexOf(publishertag) > -1) {
                            console.log(report.reportHeader() +
                                report.stepStatusWithData("STUDYBIT POPUP AFTER SAVE : Saved KeyTerm StudyBit has the Publisher Concept ", publishertag, "success") +
                                report.reportFooter());
                          return  browser
                                .waitForElementByXPath("//li[@class='tag-item ng-scope']/span[text()='" + usertag + "']", asserters.isDisplayed, 90000)
                                .then(function () {
                                    console.log(report.reportHeader() +
                                        report.stepStatusWithData("STUDYBIT POPUP AFTER SAVE : Saved KeyTerm StudyBit has the user concept ", usertag, "success") +
                                        report.reportFooter());
                                    done();
                                });
                        }
                        else {
                            console.log(report.reportHeader() +
                                report.stepStatusWithData("STUDYBIT POPUP AFTER SAVE :  Saved Key Term StudyBit has the Publisher Concept ", publishertag, "failure") +
                                report.reportFooter());
                        }
                    });
            });
          // });
        }else{
            return browser
              .waitForElementByCss("#" + keytermSBId, asserters.isDisplayed, 30000)
              .then(function (keytermSBIdOnNarrative) {
                return browser.getLocationInView(keytermSBIdOnNarrative)
                  .execute("window.scrollBy(0,-140)")
                      .elementByCssSelectorWhenReady(".studybit-icon.keyterm.fair.saved", asserters.isDisplayed, 90000)
                      .click()
                      .then(function () {
                        return  browser
                        .waitForElementByXPath("//div[contains(@class,'studybit-menu keyterm')]//span[@class='keytermdef']", asserters.isDisplayed, 90000)
                        .text().should.eventually.include(keytermDef)
                        .waitForElementByCss("ul.tag-list li.not-removable:nth-child(1) span", asserters.isDisplayed, 90000)
                        .text()
                        .then(
                        function (textOfKeyTerm) {
                            console.log("textOfKeyTerm"+textOfKeyTerm);
                            if (publishertag.indexOf(textOfKeyTerm) > -1) {
                                console.log(report.reportHeader() +
                                    report.stepStatusWithData("STUDYBIT POPUP AFTER SAVE : Saved KeyTerm StudyBit has the Publisher Concept ", publishertag, "success") +
                                    report.reportFooter());
                              return  browser
                                    .waitForElementByXPath("//li[@class='tag-item ng-scope']/span[text()='" + usertag + "']", asserters.isDisplayed, 90000)
                                    .then(function () {
                                        console.log(report.reportHeader() +
                                            report.stepStatusWithData("STUDYBIT POPUP AFTER SAVE : Saved KeyTerm StudyBit has the user concept ", usertag, "success") +
                                            report.reportFooter());
                                        done();
                                    });
                            }
                            else {
                                console.log(report.reportHeader() +
                                    report.stepStatusWithData("STUDYBIT POPUP AFTER SAVE :  Saved Key Term StudyBit has the Publisher Concept ", publishertag, "failure") +
                                    report.reportFooter());
                            }
                        });
                });
              });
        }
    },

    navigateToStudyBoard: function (browser, done) {
        browser
            .waitForElementByXPath("//div[contains(@class,'icon-studyboard-blue')]", asserters.isDisplayed, 120000)
            .click().then(function () {
                browser
                    .sleep(3000)
                    .waitForElementByXPath("//h1[contains(.,'StudyBoard')]", asserters.isDisplayed, 220000)
                    .nodeify(done);
            });
    },

    navigateToStudyBitTab: function (browser, done) {
        browser
            .waitForElementByXPath("//div[@class='icon-studyboard-blue']", asserters.isDisplayed, 120000)
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
            .waitForElementByXPath("(//li[contains(@class,'tile')]//div[contains(@class,'studybit text')])[1]", asserters.isDisplayed, 30000)
            .elementByCssSelectorWhenReady(".studybit.text.unassigned time", 12000)
            .text()
            .should.eventually.include(dataUtil.getDateFormatForStudyBoard())
            .sleep(1000)
            .waitForElementByCss(".cl-atom.highlight.unassigned.persisted", asserters.isDisplayed, 30000)
            .execute("return getComputedStyle(document.querySelector('.studybit.text .tile-icon')).backgroundImage"); // Changed for Stage
    },

    validateTextStudyBitOnStudyBoard: function (browser, done, chaptername, notes, concepts, usertag) {
        return browser
            .sleep(3000)
            .waitForElementByXPath("(//li[contains(@class,'tile')]//div[contains(@class,'studybit text')])[1]", asserters.isDisplayed, 30000)
            .elementByCssSelectorWhenReady(".studybit.text.unassigned time", 12000)
            .text()
            .should.eventually.include(dataUtil.getDateFormatForStudyBoard())
            .sleep(1000)
            .waitForElementByCss(".cl-atom.highlight.unassigned.persisted", asserters.isDisplayed, 30000)
            .execute("return getComputedStyle(document.querySelector('.studybit.text .tile-icon')).backgroundImage")
            .then(function(contenturl) {
                if (contenturl.indexOf("studybit-text-default") > -1) {
                    console.log(report.reportHeader() +
                        report.stepStatusWithData("STUDYBOARD :: Saved Text StudyBit has the studybit icon displayed correctly", "success") +
                        report.reportFooter());
                        return  browser
                          .elementByCssSelectorWhenReady(".studybit.text", asserters.isDisplayed, 2000).click().then(function () {
                          return  browser
                                .elementByCssSelectorWhenReady(".banner .studybit .chapter-origin", 2000)
                                .text()
                                .should.eventually.include(chaptername)
                                .execute("return document.getElementsByTagName(\"textarea\")[0].value")
                                .then(function (notestext) {
                                    if (notestext.indexOf(notes) > -1) {
                                        console.log(report.reportHeader() +
                                            report.stepStatusWithData("STUDYBOARD :: EXPANDED STUDYBIT TILE :: Saved Text StudyBit has the notes \"", notestext + "\" displayed correctly on the expanded StudyBit tile of Studyboard", "success") +
                                            report.reportFooter());
                                            return  browser
                                            .elementByCssSelectorWhenReady(".tags .accordion-header.ng-binding", 2000)
                                            .click()
                                            .elementByCssSelectorWhenReady(".tags.is-expanded .not-removable span", 2000)
                                            .text().then(function (publisherTag) {
                                                if (concepts.indexOf(publisherTag) > -1) {
                                                  return  browser
                                                        .elementByXPathSelectorWhenReady("//li[@class='tag-item ng-scope']", 2000)
                                                        .text()
                                                        .should.eventually.include(usertag)
                                                        .elementByCssSelectorWhenReady(".more .accordion-header.ng-binding", asserters.isDisplayed, 5000).click().then(function () {
                                                          return  browser.execute("return document.evaluate(\"count(//li[@ng-class='item.itemType'])\", document, null, XPathResult. NUMBER_TYPE, null ).numberValue").then(
                                                                function (countOfRelatedItems) {
                                                                  console.log("countOfRelatedItems"+countOfRelatedItems);
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
                                                                            report.stepStatusWithData("STUDYBOARD :: EXPANDED STUDYBIT TILE :: Related items are not displayed on the Studybit", "", "failure") +
                                                                            report.reportFooter());
                                                                    }
                                                                });
                                                        });
                                                } else {
                                                    console.log(report.reportHeader() +
                                                        report.stepStatusWithData("STUDYBOARD :: EXPANDED STUDYBIT TILE :: Publisher tags are not matched the expected publisertag", "", "failure") +
                                                        report.reportFooter());
                                                }
                                            });
                                    } else {
                                        console.log(report.reportHeader() +
                                            report.stepStatusWithData("STUDYBOARD :: EXPANDED STUDYBIT TILE :: Problems on notes save on studybit display on studyboard", "", "failure") +
                                            report.reportFooter());
                                    }
                                });
                        });
                } else {
                    console.log(report.reportHeader() +
                        report.stepStatusWithData("STUDYBOARD :: EXPANDED STUDYBIT TILE :: Problems on studybit display", "", "failure") +
                        report.reportFooter());
                }
            });
    },

    validateTextStudyBitOnNarrativeView: function (browser, done, studybitId, comprehension, notes, concepts, usertag) {
      return browser
      .waitForElementByCss("#" + studybitId, asserters.isDisplayed, 30000)
      .then(function (studybit) {
        return browser.getLocationInView(studybit)
        .execute("window.scrollBy(0,-140)")
        .waitForElementByCss("#" + studybitId + " span:nth-child(1)", asserters.isDisplayed, 90000)
        .click().then(function () {
          return  browser
          .waitForElementByXPath("//button[contains(@class,'ng-scope ng-binding active')]", asserters.isDisplayed, 90000)
          .text()
          .should.eventually.include(comprehension)
          .execute("return document.getElementsByTagName(\"textarea\")[0].value")
          .then(function (notestext) {
            if (notestext.indexOf(notes) > -1) {
              console.log(report.reportHeader() +
              report.stepStatusWithData("EXPANDED STUDYBIT TILE :: Saved Text StudyBit has the notes \"", notestext + "\" displayed correctly on the narrative page", "success") +
              report.reportFooter());
              return  browser
              .waitForElementByXPath("//li[@class='tag-item ng-scope']//span[@class='tag ng-binding']", asserters.isDisplayed, 90000)
              .text().then(function (editedUserTag) {
                if (editedUserTag.indexOf(usertag) > -1) {
                  console.log(report.reportHeader() +
                  report.stepStatusWithData("EXPANDED STUDYBIT TILE :: Saved Text StudyBit has the userTag \"", editedUserTag + "\" displayed correctly on the narrative page", "Success") +
                  report.reportFooter());
                return  browser
                  .waitForElementByCss(".icon-close-x-blue", asserters.isDisplayed, 90000).then(function(){
                  return browser
                  .waitForElementByCss(".icon-close-x-blue", asserters.isDisplayed, 90000)
                  .click()
                  .nodeify(done);
                });

                }
                else {
                  console.log(report.reportHeader() +
                  report.stepStatusWithData("EXPANDED STUDYBIT TILE :: Saved Text StudyBit has the notes \"", editedUserTag + "\" displayed correctly on the narrative page", "Failure") +
                  report.reportFooter());
                }
              });
            }
            else {
              console.log(report.reportHeader() +
              report.stepStatusWithData("EXPANDED STUDYBIT TILE :: Notes are not matched the expected notes", "", "failure") +
              report.reportFooter());
            }

          });
        });
      });
    },

    validateMathEquationStudyBitOnStudyBoard: function (browser, done, chaptername, notes, concepts, usertag) {
        console.log(dataUtil.getDateFormatForStudyBoard());
        // this.validateTheUnExpandedStudyBitTile(browser)
           return browser
               .sleep(3000)
               .waitForElementByXPath("(//li[contains(@class,'tile')]//div[contains(@class,'studybit text')])[1]", asserters.isDisplayed, 30000)
               .sleep(1000)
               .elementByCssSelectorWhenReady(".studybit.text.unassigned time", 12000)
               .text()
               .should.eventually.include(dataUtil.getDateFormatForStudyBoard())
               .sleep(1000)
               .waitForElementByCss(".cl-atom.highlight.unassigned.persisted", asserters.isDisplayed, 30000)
               .execute("return getComputedStyle(document.querySelector('.studybit.text .tile-icon')).backgroundImage")
               .then(function (contenturl) {
                console.log("contenturl"+contenturl);
                if (contenturl.indexOf("studybit-text-default") > -1) {
                    console.log(report.reportHeader() +
                        report.stepStatusWithData("STUDYBOARD :: Saved Text StudyBit has the studybit icon displayed correctly", "success") +
                        report.reportFooter());
                        return  browser
                            .waitForElementByCss(".studybit.text", asserters.isDisplayed, 30000)
                          // .elementByCssSelectorWhenReady(".studybit.text", asserters.isDisplayed, 20000)
                            .click().then(function () {
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
                .waitForElementByCss(".studybit-menu.table.unassigned.editing", asserters.isDisplayed, 90000)
                .isDisplayed()
                .should.become(true)
                .waitForElementByCss("ul.tag-list li.not-removable:nth-child(1) span", asserters.isDisplayed, 90000)
                .text()
                .then(
                function (textOfPubliserTag) {
                    if (publishertags.indexOf(textOfPubliserTag) > -1) {
                        console.log(report.reportHeader() +
                            report.stepStatusWithData("STUDYBIT POPUP BEFORE SAVE :: Successful Validation of the retrieval of one of the Publisher Concept Tags ", textOfPubliserTag, "success") +
                            report.reportFooter());
                            return  browser
                                  .waitForElementByXPath("(//textarea[contains(@class,'notes')])", asserters.isDisplayed, 60000)
                                  .click()
                                  .type(notes)
                                  .sleep(1000)
                                  .waitForElementByCss("div.tags input", asserters.isDisplayed, asserters.isDisplayed, 90000)
                                  .sleep(1000)
                                  .type(usertag)
                                  .sleep(1000)
                                  .type(wd.SPECIAL_KEYS.Tab)
                                  .type(wd.SPECIAL_KEYS.Enter)
                                  .sleep(1000)
                                  .waitForElementByCss(".tag-item.ng-scope span", asserters.isDisplayed, 60000)
                                  .waitForElementByXPath("//div[contains(@class,'studybit-menu table unassigned editing')]//div[@class='actions']/button[contains(@class,'save')]", asserters.isDisplayed, 60000).then(function(saveButton){
                                    return browser
                                    .getLocationInView(saveButton)
                                    .execute("window.scrollBy(0,-140)")
                                    .sleep(1000)
                                    .waitForElementByXPath("//div[contains(@class,'studybit-menu table unassigned editing')]//div[@class='actions']/button[contains(@class,'save')]", asserters.isDisplayed, 60000)
                                    .click()
                                    .sleep(1000)
                                    .getLocationInView(studybit)
                                    .waitForElementByXPath("(//div[contains(@class,'studybit-icon table unassigned saved')])[1]", asserters.isDisplayed, 60000)
                                    .isDisplayed()
                                    .should.become(true)
                                    .nodeify(done);
                                  });
                          } else {
                              console.log(report.reportHeader() +
                                  report.stepStatusWithData(" Failure in retrieval of Publisher Concept Tag ", textOfPubliserTag, "failure") +
                                  report.reportFooter());
                          }
                });
              });
    },

    validateExhibitStudyBitSave: function (browser, done, studybitId, publishertags, usertag, notes, windowScrollY) {
        browser
            .sleep(4000)
            .waitForElementByCss("#" + studybitId, asserters.isDisplayed, 30000)
            .then(function (studybit) {
                browser.getLocationInView(studybit)
                    .sleep(1000)
                    .execute("window.scrollBy(0,-140)")
                    .sleep(1000)
                    .waitForElementByCss(".studybit-icon.table.unassigned.saved", asserters.isDisplayed, 90000)
                    .click()
                    .then(function () {
                        browser.waitForElementByCss("ul.tag-list li.not-removable:nth-child(1) span", asserters.isDisplayed, 90000)
                            .text()
                            .then(function (textOfPublisherTag) {
                                console.log("textOfPublisherTag"+textOfPublisherTag);
                                if (publishertags.indexOf(textOfPublisherTag) > -1) {
                                    console.log(report.reportHeader() +
                                        report.stepStatusWithData("STUDYBIT POPUP AFTER SAVE :: Successful Validation of the retrieval of one of the Publisher Concept Tags ", textOfPublisherTag, "success") +
                                        report.reportFooter());

                                    browser.waitForElementByXPath("//li[@class='tag-item ng-scope']/span[text()='" + usertag + "']", asserters.isDisplayed, 90000)
                                        .then(function () {
                                            console.log(report.reportHeader() +
                                                report.stepStatusWithData("STUDYBIT POPUP AFTER SAVE ::Saved Exhibit StudyBit has the user concept ", usertag, "success") +
                                                report.reportFooter());

                                            browser.execute("return document.getElementsByTagName(\"textarea\")[0].value").then(
                                                function (notesSaved) {
                                                    if (notesSaved.indexOf(notes) > -1) {
                                                        console.log(report.reportHeader() +
                                                            report.stepStatusWithData("STUDYBIT POPUP AFTER SAVE :: Saved Exhibit StudyBit has the user notes saved ", notes, "success") +
                                                            report.reportFooter());
                                                        done();
                                                    }
                                                    else {
                                                        console.log(report.reportHeader() +
                                                            report.stepStatusWithData("STUDYBIT POPUP AFTER SAVE :: Saved Exhibit StudyBit does not have the user notes saved ", usertag, "failure") +
                                                            report.reportFooter());
                                                    }
                                                }
                                            );

                                        });
                                }
                                else {
                                    console.log(report.reportHeader() +
                                        report.stepStatusWithData(" Saved Exhibit StudyBit has the Publisher Concept ", textOfPublisherTag, "failure") +
                                        report.reportFooter());
                                }
                            });
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
                    .waitForElementByCss(".studybit-menu.image.unassigned.editing", asserters.isDisplayed, 90000)
                    .isDisplayed()
                    .should.become(true)
                    .waitForElementByCss("ul.tag-list li.not-removable:nth-child(1) span", asserters.isDisplayed, 90000)
                    .text()
                    .then(function (text1) {
                        var imagePublisherTagValue = text1;
                        if (text1) {
                            console.log(report.reportHeader() +
                                report.stepStatusWithData("STUDYBIT POPUP BEFORE SAVE :: Successful Validation of the retrieval of one of the Publisher Concept Tags ", text1, "success") +
                                report.reportFooter());
                            browser
                                .waitForElementByXPath("(//textarea[contains(@class,'notes')])", asserters.isDisplayed, 60000)
                                .type(notes)
                                .sleep(1000)
                                .waitForElementByCss("div.tags input", asserters.isDisplayed, asserters.isDisplayed, 90000)
                                .sleep(1000)
                                .type(usertag)
                                .sleep(1000)
                                .type(wd.SPECIAL_KEYS.Tab)
                                .type(wd.SPECIAL_KEYS.Enter)
                                .sleep(1000)
                                .waitForElementByCss(".tag-item.ng-scope span", asserters.isDisplayed, 60000)
                                .waitForElementByXPath("//div[contains(@class,'studybit-menu image unassigned editing')]//div[@class='actions']/button[contains(@class,'save')]", asserters.isDisplayed, 60000)
                                .click()
                                .waitForElementByXPath("(//div[contains(@class,'studybit-icon image unassigned saved')])[1]", asserters.isDisplayed, 60000)
                                .isDisplayed()
                                .should.become(true)
                                .nodeify(done);

                        } else {
                            console.log(report.reportHeader() +
                                report.stepStatusWithData(" Failure in retrieval of Publisher Concept Tag ", publishertag, "failure") +
                                report.reportFooter());
                        }
                    });
            });
    },

    validateImageStudyBitSave: function (browser, done, studybitId, publishertags, usertag, notes, windowScrollY) {
        browser
            .sleep(4000)
            .waitForElementByCss("#" + studybitId, asserters.isDisplayed, 30000)
            .then(function (studybit) {
                browser.getLocationInView(studybit)
                    .sleep(1000)
                    .execute("window.scrollBy(0,-140)")
                    .sleep(1000)
                    .waitForElementByCss(".studybit-icon.image.unassigned.saved", asserters.isDisplayed, 90000)
                    .click()
                    .then(function () {
                        browser.waitForElementByCss("ul.tag-list li.not-removable:nth-child(1) span", asserters.isDisplayed, 90000)
                            .text()
                            .then(
                            function (text) {
                                if (text) {
                                    console.log(report.reportHeader() +
                                        report.stepStatusWithData("STUDYBIT POPUP AFTER SAVE :: Successful Validation of the retrieval of one of the Publisher Concept Tags ", text, "success") +
                                        report.reportFooter());

                                    browser.waitForElementByXPath("//li[@class='tag-item ng-scope']/span[text()='" + usertag + "']", asserters.isDisplayed, 90000)
                                        .then(function () {
                                            console.log(report.reportHeader() +
                                                report.stepStatusWithData("STUDYBIT POPUP AFTER SAVE ::Saved Image StudyBit has the user concept ", usertag, "success") +
                                                report.reportFooter());

                                            browser.execute("return document.getElementsByTagName(\"textarea\")[0].value").then(
                                                function (notesSaved) {
                                                    if (notesSaved.indexOf(notes) > -1) {
                                                        console.log(report.reportHeader() +
                                                            report.stepStatusWithData("STUDYBIT POPUP AFTER SAVE :: Saved Image StudyBit has the user notes saved ", notes, "success") +
                                                            report.reportFooter());
                                                        done();
                                                    }
                                                    else {
                                                        console.log(report.reportHeader() +
                                                            report.stepStatusWithData("STUDYBIT POPUP AFTER SAVE :: Saved Image StudyBit does not have the user notes saved ", usertag, "failure") +
                                                            report.reportFooter());
                                                    }
                                                }
                                            );

                                        });
                                }
                                else {
                                    console.log(report.reportHeader() +
                                        report.stepStatusWithData(" Saved Image StudyBit has the Publisher Concept ", publishertag, "failure") +
                                        report.reportFooter());
                                }
                            });
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
            .sleep(2000)
            .waitForElementByCss(".studybit.table", asserters.isDisplayed, 20000)
            .elementByCssSelectorWhenReady(".studybit.table", asserters.isDisplayed, 2000)
            .click().then(function () {
                browser
                    .elementByCssSelectorWhenReady(".banner .studybit .chapter-origin", 2000)
                    .text()
                    .should.eventually.include(chaptername)
                    .execute("return document.getElementsByTagName(\"textarea\")[0].value")
                    .then(function (notestext) {
                      console.log(notestext);
                        if (notestext.indexOf(notes) > -1) {
                            console.log(report.reportHeader() + report.stepStatusWithData("STUDYBOARD :: EXPANDED STUDYBIT TILE :: Saved Exhibit StudyBit has the notes \"", notestext + "\" displayed correctly on the expanded StudyBit tile of Studyboard", "success") + report.reportFooter());
                            browser
                                .elementByCssSelectorWhenReady(".tags .accordion-header.ng-binding", 2000)
                                .click()
                                .elementByXPathSelectorWhenReady("//ul[@class='tag-list ']/li/span[contains(text(),'" + concepts + "')]")
                                .elementByXPathSelectorWhenReady("//li[@class='tag-item ng-scope']", 2000)
                                .text().should.eventually.include(usertag)
                                .elementByCssSelectorWhenReady(".more .accordion-header.ng-binding", asserters.isDisplayed, 5000)
                                .click().then(function () {
                                    browser
                                        .execute("return document.evaluate(\"count(//li[@ng-class='item.itemType'])\", document, null, XPathResult. NUMBER_TYPE, null ).numberValue")
                                        .then(function (countOfRelatedItems) {
                                            if (countOfRelatedItems > 2) {
                                                browser
                                                    .waitForElementByXPath("(//li[@ng-class='item.itemType'])[2]/a", asserters.isDisplayed, 10000)
                                                    .text().then(function (relateditem1) {
                                                        console.log(report.reportHeader() + report.stepStatusWithData("STUDYBOARD :: EXPANDED STUDYBIT TILE :: The First Related item displayed on the StudyBit ", relateditem1, "success") + report.reportFooter());
                                                        browser
                                                            .waitForElementByXPath("(//li[@ng-class='item.itemType'])[3]/a", asserters.isDisplayed, 10000)
                                                            .text().then(function (relateditem2) {
                                                                console.log(report.reportHeader() + report.stepStatusWithData("STUDYBOARD :: EXPANDED STUDYBIT TILE :: The Second Related item displayed on the StudyBit ", relateditem2, "success") + report.reportFooter());
                                                                done();
                                                            });
                                                    });
                                            } else {
                                                console.log(report.reportHeader()
                                                    + report.stepStatusWithData("STUDYBOARD :: EXPANDED STUDYBIT TILE :: Related items are not displayed on the Studybit", "failure")
                                                    + report.reportFooter());
                                            }
                                        });
                                });

                        } else {
                            console.log(report.reportHeader()
                                + report.stepStatusWithData("STUDYBOARD :: EXPANDED STUDYBIT TILE :: Problems on notes save on studybit display on studyboard", "failure")
                                + report.reportFooter());
                        }
                    });
            });

    },

    validateImageStudyBitOnStudyBoard: function (browser, done, chaptername, notes, concepts, usertag) {
        browser
            .sleep(5000)
            .waitForElementByCss(".studybit.image", asserters.isDisplayed, 2000)
            .click().then(function () {
                browser
                    .waitForElementByCss(".banner .studybit .chapter-origin", 2000)
                    .text()
                    .should.eventually.include(chaptername).execute("return document.getElementsByTagName(\"textarea\")[0].value")
                    .then(function (notestext) {

                        if (notestext.indexOf(notes) > -1) {
                            console.log(report.reportHeader() + report.stepStatusWithData("STUDYBOARD :: EXPANDED STUDYBIT TILE :: Saved Image StudyBit has the notes \"", notestext + "\" displayed correctly on the expanded StudyBit tile of Studyboard", "success") + report.reportFooter());
                            browser
                                .waitForElementByCss(".tags .accordion-header.ng-binding", 2000)
                                .click()
                                .sleep(2000)
                                .waitForElementByXPath("//ul[@class='tag-list ']/li/span[contains(text(),'" + concepts + "')]")
                                .waitForElementByXPath("//li[@class='tag-item ng-scope']", 2000)
                                .text().should.eventually.include(usertag)
                                .waitForElementByCss(".more .accordion-header.ng-binding", asserters.isDisplayed, 5000)
                                .click().then(function () {
                                    browser
                                        .execute("return document.evaluate(\"count(//li[@ng-class='item.itemType'])\", document, null, XPathResult. NUMBER_TYPE, null ).numberValue")
                                        .then(function (countOfRelatedItems) {
                                            if (countOfRelatedItems > 2) {
                                                browser
                                                    .waitForElementByXPath("(//li[@ng-class='item.itemType'])[2]/a", asserters.isDisplayed, 10000)
                                                    .text().then(function (relateditem1) {
                                                        console.log(report.reportHeader() + report.stepStatusWithData("STUDYBOARD :: EXPANDED STUDYBIT TILE :: The First Related item displayed on the StudyBit ", relateditem1, "success") + report.reportFooter());
                                                        browser
                                                            .waitForElementByXPath("(//li[@ng-class='item.itemType'])[3]/a", asserters.isDisplayed, 10000)
                                                            .text().then(function (relateditem2) {
                                                                console.log(report.reportHeader() +
                                                                    report.stepStatusWithData("STUDYBOARD :: EXPANDED STUDYBIT TILE :: The Second Related item displayed on the StudyBit :", relateditem2, "success")
                                                                    + report.reportFooter());
                                                                done();
                                                            });
                                                    });
                                            } else {
                                                console.log(report.reportHeader()
                                                    + report.stepStatusWithData("STUDYBOARD :: EXPANDED STUDYBIT TILE :: Related items are not displayed on the Studybit", "", "failure")
                                                    + report.reportFooter());
                                            }
                                        });
                                });

                        } else {
                            console.log(report.reportHeader()
                                + report.stepStatusWithData("STUDYBOARD :: EXPANDED STUDYBIT TILE :: Problems on notes save on studybit display on studyboard", "", "failure")
                                + report.reportFooter());
                        }
                    });
            });
    },

    changeComprehensionOfStudybit: function (browser, comprehensionVal) {
        return browser
            .waitForElementByCss("#more", asserters.isDisplayed, 90000).then(function(more){
                return browser
                   .getLocationInView(more)
                   .sleep(1000)
                   .waitForElementByXPath("//form//section//div[@class='comprehension']//button[contains(text(),'" + comprehensionVal + "')]", asserters.isDisplayed, 90000)
                   .click();
        });
    },

    closeExpandedStudybit: function (browser) {
        return browser
            .waitForElementByCss(".icon-close-x-blue", asserters.isDisplayed, 5000).then(function (close) {
                close.click();
            });
    },

    clickOnSaveButton: function (browser) {
        return browser
            .waitForElementByCss(".save.ng-binding", asserters.isDisplayed, 5000)
            .click();
    },

    validateEditedTextStudybit: function (browser, comprehensionText) {
        return browser
            .waitForElementByXPath("(//li[contains(@class,'tile')]//div[contains(@class,'studybit text')])[1]", asserters.isDisplayed, 5000)
            .click()
            .waitForElementByXPath("//button[@class='ng-scope ng-binding active']", asserters.isDisplayed, 5000)
            .text().then(function (comprehensionTextValue) {
                if (comprehensionTextValue.indexOf(comprehensionText) > -1) {
                    console.log(report.reportHeader()
                        + report.stepStatusWithData("STUDYBOARD :: EXPANDED STUDYBIT COMPREHENSION LEVEL TEXT " + comprehensionTextValue + " compared with text ", comprehensionText, "success")
                        + report.reportFooter());
                } else {
                    console.log(report.reportHeader()
                        + report.stepStatusWithData("STUDYBOARD :: EXPANDED STUDYBIT COMPREHENSION LEVEL TEXT " + comprehensionTextValue + " compared with text ", comprehensionText, "failure")
                        + report.reportFooter());
                }
            });
    },

    VerifyKeytermStudybit: function (browser, keyTermSBValidationStatusOnSBrd) {
        return browser
            .waitForElementByCss("div.icon-studyboard-blue", asserters.isDisplayed, 30000).then(function () {
                browser.waitForElementByXPath("(//li[contains(@class,'tile')]//div[contains(@class,'studybit keyterm')])[1]", asserters.isDisplayed, 30000)
                    .then(function () {
                        keyTermSBValidationStatusOnSBrd = "success";
                        console.log(report.reportHeader() +
                            report.stepStatus("KeyTerm Validation status on StudyBoard ", keyTermSBValidationStatusOnSBrd) +
                            report.reportFooter());
                    });
            });
    },

    editUserTagOfKeytermStudybit: function (browser, editedUserTagText) {
        return browser
            .waitForElementByXPath("(//li[contains(@class,'tile')]//div[contains(@class,'studybit keyterm')])[1]", asserters.isDisplayed, 30000)
            .click()
            .waitForElementByXPath("//li[contains(@class,'banner ng-scope')]//button[@id='tags']", asserters.isDisplayed, 25000)
            // .waitForElementByXPath("//section[@class='studybit-details']//ul//li//a[contains(text(),'TAGS')]", asserters.isDisplayed, 30000)
            .click()
            .waitForElementByXPath("//section[@class='studybit-details']//ul//li[@class='tags is-expanded']//li[@class='tag-item ng-scope']//button", asserters.isDisplayed, 30000)
            .click()
            .waitForElementByCss(".tags.is-expanded div.tags input", asserters.isDisplayed, 90000)
            .type(editedUserTagText)
            .type(wd.SPECIAL_KEYS.Tab)
            .type(wd.SPECIAL_KEYS.Enter)
            .waitForElementByCss(".tag-item.ng-scope span", asserters.isDisplayed, 60000)
    },

    fetchRelatedTopics: function (browser) {
        return browser
        // .waitForElementByXPath("//li[@class='more ng-scope']//a", asserters.isDisplayed, 30000)
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



    verifyEditedUserTagOfKeytermStudybit: function (browser, editedUserTagText) {
        return browser
            .waitForElementByXPath("(//li[contains(@class,'tile')]//div[contains(@class,'studybit keyterm')])[1]", asserters.isDisplayed, 30000)
            .click()
            .sleep(1000)
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
            .click();
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
      // if (process.env.RUN_ENV.toString() === "\"integration\"" || "\"staging\""){
        return browser
             .sleep(3000)
             .waitForElementByCss("#" + keytermSBId + "", asserters.isDisplayed, 90000).then(function(studybitKey){
                 return browser
                 .getLocationInView(studybitKey)
                 .execute("window.scrollBy(0,-140)")
                 .waitForElementByCss("#" + keytermSBId + "", asserters.isDisplayed, 90000)
                 .click().then(function(){
                   return browser
                         .elementByCssSelectorWhenReady(".studybit-menu.keyterm.unassigned.editing", 10000)
                         .isDisplayed()
                         .should.become(true).then(function () {
                           return  browser
                                 .execute("window.scrollBy(0,140)")
                                 .sleep(2000)
                                 .waitForElementByCss("ul.tag-list li.not-removable:nth-child(1) span", asserters.isDisplayed, 90000)
                                 .isDisplayed()
                                 .should.become(true)
                                 .elementByCssSelectorWhenReady(".save.create", 10000)
                                 .click()
                                 .sleep(1000)
                                 .elementByCssSelectorWhenReady(".studybit-icon.keyterm.unassigned.saved", 10000)
                                 .isDisplayed()
                                 .should.become(true)
                                 .nodeify(done);
               });
           });
       });
      // }else {
      //   return browser
      //        .waitForElementByCss("#" + keytermSBId + "", asserters.isDisplayed, 90000).then(function(studybitKey){
      //            return browser
      //            .getLocationInView(studybitKey)
      //            .execute("window.scrollBy(0,-140)")
      //            .waitForElementByCss("#" + keytermSBId + "", asserters.isDisplayed, 90000)
      //            .click().then(function(){
      //              return browser
      //                    .elementByCssSelectorWhenReady(".studybit-menu.keyterm.unassigned.editing", 10000)
      //                    .isDisplayed()
      //                    .should.become(true).then(function () {
      //                      return  browser
      //                            .execute("window.scrollBy(0,140)")
      //                            .sleep(2000)
      //                            .waitForElementByCss("ul.tag-list li.not-removable:nth-child(1) span", asserters.isDisplayed, 90000)
      //                            .isDisplayed()
      //                            .should.become(true)
      //                            .elementByCssSelectorWhenReady(".save.ng-scope", 10000)
      //                            .click()
      //                            .elementByCssSelectorWhenReady(".studybit-icon.keyterm.unassigned.saved", 10000)
      //                            .isDisplayed()
      //                            .should.become(true)
      //                            .nodeify(done);
      //          });
      //      });
      //  });
      // }
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
    //  if(process.env.RUN_ENV.toString() === "\"integration\"" || "\"staging\"" ) {
        return browser
            .waitForElementByCss("#" + studybitId, asserters.isDisplayed, 30000).then(function(studybitText){
                return browser
                  .getLocationInView(studybitText)
                  .execute("window.scrollBy(0,-140)")
                  .waitForElementByCss("#" + studybitId + " span:nth-child(1)", asserters.isDisplayed, 90000)
                  .click()
                  .waitForElementByCss("textarea", asserters.isDisplayed, 90000).then(function(studybitTextArea){
                      return browser
                       .getLocationInView(studybitTextArea)
                         .execute("window.scrollBy(0,-100)")
                        .waitForElementByCss(".studybit-menu.text.unassigned.editing", asserters.isDisplayed, 10000)
                        .isDisplayed()
                        .should.become(true).then(function () {
                          return  browser
                                .waitForElementByCss(".tag-list li:first-child span", asserters.isDisplayed, 90000)
                                .isDisplayed()
                                .should.become(true)
                                .waitForElementByCss(".save.create", asserters.isDisplayed, 60000)
                                .click()
                                .waitForElementByXPath("(//div[contains(@class,'studybit-icon text unassigned saved')])[1]", asserters.isDisplayed, 60000)
                                .isDisplayed()
                                .should.become(true)
                                .nodeify(done);
                });

            });
          });
        // }else{
        //   return browser
        //       .waitForElementByCss("#" + studybitId, asserters.isDisplayed, 30000).then(function(studybitText){
        //           return browser
        //             .getLocationInView(studybitText)
        //             .execute("window.scrollBy(0,-140)")
        //             .waitForElementByCss("#" + studybitId + " span:nth-child(1)", asserters.isDisplayed, 90000)
        //             .click()
        //             .waitForElementByCss("textarea", asserters.isDisplayed, 90000).then(function(studybitTextArea){
        //                 return browser
        //                  .getLocationInView(studybitTextArea)
        //                    .execute("window.scrollBy(0,-100)")
        //                   .waitForElementByCss(".studybit-menu.text.unassigned.editing", asserters.isDisplayed, 10000)
        //                   .isDisplayed()
        //                   .should.become(true).then(function () {
        //                     return  browser
        //                           .waitForElementByCss(".tag-list li:first-child span", asserters.isDisplayed, 90000)
        //                           .isDisplayed()
        //                           .should.become(true)
        //                           .waitForElementByXPath("//div[contains(@class,'studybit-menu text unassigned editing')]//div[@class='actions']/button[contains(@class,'save')]", asserters.isDisplayed, 60000)
        //                           .click()
        //                           .waitForElementByXPath("(//div[contains(@class,'studybit-icon text unassigned saved')])[1]", asserters.isDisplayed, 60000)
        //                           .isDisplayed()
        //                           .should.become(true)
        //                           .nodeify(done);
        //           });
        //
        //       });
        //     });
        //
        // }


    },
    openCreatedSB : function(browser, studybitId){
      return browser
      .waitForElementByCss("#" + studybitId, asserters.isDisplayed, 30000)
      .then(function (studybitLocation) {
        return browser.getLocationInView(studybitLocation)
          .execute("window.scrollBy(0,-140)")
          .elementByCssSelectorWhenReady(".studybit-icon.text.saved", asserters.isDisplayed, 90000)
          .click();
        });
    },
    verifyTheCreatedSBOnStudyBoard : function(browser,SBtype){
      return browser
          .waitForElementByCss("div.icon-studyboard-blue", asserters.isDisplayed, 30000).then(function () {
            return  browser.waitForElementByXPath("(//li[contains(@class,'tile')]//div[contains(@class,'studybit "+SBtype+"')])[1]", asserters.isDisplayed, 30000);
        });
    },

    verifyAnotherExhibitPresent : function(browser, exhibitid, name){
      return browser
          .waitForElementByCss("#" + exhibitid + " .ordinal", asserters.isDisplayed, 60000)
          .text().should.eventually.include(name);
    },

    clickOnInlineLink : function(browser, id, text){
      return browser
      .waitForElementByXPath("//p[@id='" + id + "']//span//a[contains(.,'" + text + "')]", asserters.isDisplayed, 60000)
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
            //   .click()
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
        .sleep(2000)
        .hasElementByCss(".cas-activity-initial .cas-activity-series.cas-activity-series-current");
    },

   validateTextAfterDeletingAllStudybits: function(browser){
     return browser
       .waitForElementByCss(".no-matches.ng-scope.ng-binding", asserters.isDisplayed, 60000);
   },

   checkOnMyFilteredButtonDisabledIfNoStudybitsPresent: function(browser){
     return browser
       .waitForElementByCss(".sliding-menu-button.ng-scope", asserters.isDisplayed, 2000)
       .click()
       .sleep(1000)
       .waitForElementByXPath("//section[contains(@class,'select-chapter')]//div[1]", asserters.isDisplayed, 60000);
   },

   getIconsOnExpandedStudybit: function (browser, iconName) {
     return browser
     .execute("return getComputedStyle(document.querySelector('."+iconName+" .accordion-header'),'::before').getPropertyValue('content')");
   },

   getComprehensionicon: function (browser) {
     return browser
     .execute("return getComputedStyle(document.querySelector('.studyboard-accordion .comprehension .button-group'),'::before').getPropertyValue('content')");
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

   notificationSymbolOnNewlyCreatedStudyBit: function(browser){
     return browser
               .sleep(3000)
               .hasElementByCss(".icon-studyboard-blue.studyboard-badge");
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
            .sleep(2000)
            .waitForElementByCss("#"+keyTermId, asserters.isDisplayed, 90000).then(function(keytermSBLocation){
              return browser
              .getLocationInView(keytermSBLocation)
              .execute("window.scrollBy(0,-140)")
              .sleep(2000)
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
