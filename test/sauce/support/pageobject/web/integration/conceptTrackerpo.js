var wd = require('wd');
var asserters = wd.asserters;
var report = require("../../../reporting/reportgenerator");

module.exports = {

    conceptTackerValidation: function (studybitcount, browser, done) {
        browser
            .waitForElementByXPath("(//div[contains(@class,'studybit-count')])[1]", asserters.isDisplayed, 90000)
            .text()
            .should.eventually.include(studybitcount + '\nStudyBits').then(function () {
                conceptTrackerValidation = "success";
                console.log(report.reportHeader() +
                    report.stepStatus("ConceptTracker Validation status on ConceptTracker page", conceptTrackerValidation) +
                    report.reportFooter());
            })
            .sleep(1000)
            .nodeify(done);
    },

    isConceptTrackerLoaded: function (browser) {
        return browser
            .waitForElementByCss(".concept-tracker.ng-scope header", asserters.isDisplayed, 90000)
            .elementByCssSelector(".concept-tracker.ng-scope header");
    },

    isConceptTrackerLoadedOnStudentEnd: function (browser) {

        return browser
            .waitForElementByCss(".active.ng-binding", asserters.isDisplayed, 90000);
    },
    isTabStateIsNotActive: function (browser, tabText) {
      if(process.env.RUN_IN_BROWSER.toString() === "\"internet explorer\""){
         return browser
            .execute("window.scrollTo(0,0)")
            .sleep(2000)
            .hasElementByXPath("//a[@class='ng-binding' and contains(text(),'"+tabText+"')]");
      }else{
        return browser
            .hasElementByXPath("//a[@class='ng-binding' and contains(text(),'"+tabText+"')]");
      }
    },
    isTabStateIsActive: function (browser, tabText) {
      return browser
          .hasElementByXPath("//a[contains(@class,'active') and contains(text(),'"+tabText+"')]");
    },

    getChapterPresenceStatusOnCT: function(browser, chapter){
       if(process.env.RUN_IN_BROWSER.toString() === "\"internet explorer\""){
            return browser
                .sleep(2000)
                .execute("window.scrollBy(0,0)")
                .sleep(2000)
                .execute("return document.evaluate(\"count(//div[contains(@class,'chart-container ng-scope')]/h1[contains(.,'" + chapter + "')])\", document, null, XPathResult. NUMBER_TYPE, null ).numberValue");
         }else{
           return browser
               .execute("window.scrollBy(0,0)")
               .execute("return document.evaluate(\"count(//div[contains(@class,'chart-container ng-scope')]/h1[contains(.,'" + chapter + "')])\", document, null, XPathResult. NUMBER_TYPE, null ).numberValue");
         }
    },

};
