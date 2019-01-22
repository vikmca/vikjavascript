/**
 * Created by nbalasundaram on 10/3/15.
 */
var wd = require('wd');
var asserters = wd.asserters;
var basicpo = require("./basicpo.js")
var stringutil = require("../../../../util/stringUtil");
var testData = require("../../../../../../test_data/data.json");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var tocpo = require("../../../../support/pageobject/"+pageobject+"/"+envName+"/tocpo.js");
module.exports = {
    selectSubTabOnStudyBoard: function (browser, tabName, done) {
        if (tabName === "StudyBits") {
            browser.waitForElementByCss("nav a:nth-child(1)", asserters.isDisplayed, 90000).click().nodeify(done);
        }
        else if (tabName === "Flashcards") {
            browser.waitForElementByCss("nav a:nth-child(2)", asserters.isDisplayed, 90000).click().nodeify(done);
        } else {
            browser.waitForElementByCss("nav a:nth-child(3)", asserters.isDisplayed, 90000).click().nodeify(done);
        }
    },
    checkAssignmentText: function(browser){
      return browser
      .waitForElementByCss("#num-assignments-visible").getText().then(function(assignmentsCount){
        if(assignmentsCount === "1 Assignment" || assignmentsCount === "0 Assignment"){
          return false;
        }
        else{
          return true;
        }
      });
    },

    selectAssignments: function (role, browser, done) {
        if (role === "instructor") {
          basicpo.clickOnMenu(browser);
            browser
                .waitForElementByCss(".manage-dropdown>.dropdown>.dropdown-link.ng-binding", asserters.isDisplayed, 60000)
                .click()
                .waitForElementByXPath("//span[contains(.,'ASSIGNMENTS')]", asserters.isDisplayed, 60000)
                .click()
                .waitForElementByCss(".assignments-header h1", asserters.isDisplayed, 25000)
                .nodeify(done);
        }
        else {
          basicpo.clickOnMenu(browser);
            browser
                .waitForElementByCss(".icon-clock-blue", asserters.isDisplayed, 60000)
                .click()
                .waitForElementByXPath("//h1[contains(.,'Assignments')]", asserters.isDisplayed, 60000)
                .nodeify(done);

        }

    },

    selectGradebook: function (role, browser, done) {
        if (role === "instructor") {
          basicpo.clickOnMenu(browser);
            browser
                .waitForElementByCss(".manage-dropdown>.dropdown>.dropdown-link.ng-binding", asserters.isDisplayed, 60000)
                .click()
                .waitForElementByXPath("//span[contains(.,'GRADEBOOK')]", asserters.isDisplayed, 60000)
                .click()
                .waitForElementByXPath("//h1[contains(.,'Gradebook')]", asserters.isDisplayed, 60000)
                .execute("window.scrollTo(0, 300)")
                .nodeify(done);
        }

        else {
            browser
                .sleep(1000)
                .execute('window.scrollTo(0,0)')
                .sleep(3000)
                .elementByXPathSelectorWhenReady("//a[contains(text(),'Gradebook')]", 5000)
                .click()
                .nodeify(done);
        }
    },

    selectManagDocs: function (browser, done) {
      basicpo.clickOnMenu(browser);
        browser
            .waitForElementByCss(".manage-dropdown>.dropdown>.dropdown-link.ng-binding", asserters.isDisplayed, 60000)
            .click()
            .waitForElementByXPath("//span[contains(.,'DOCUMENTS')]", asserters.isDisplayed, 60000)
            .click()
            .waitForElementsByCss(".ng-scope.doc", asserters.isDisplayed, 7000)
            .nodeify(done);
    },

    selectConceptTracker: function (role, browser, done) {

        if (role === "instructor") {
          basicpo.clickOnMenu(browser);
            browser
                .waitForElementByCss(".manage-dropdown>.dropdown>.dropdown-link.ng-binding", asserters.isDisplayed, 60000)
                .click()
                .waitForElementByXPath("//span[contains(.,'CONCEPT TRACKER')]", asserters.isDisplayed, 60000)
                .click()
                .nodeify(done);
        }

        else {
            console.log("Other roles dont have a role specific concept tracker");
        }

    },

      clickOnManageMyCourse: function (browser) {
              basicpo.clickOnMenu(browser);
              return browser
                  .waitForElementByCss(".manage-dropdown>.dropdown>.dropdown-link.ng-binding", asserters.isDisplayed, 60000)
                  .click();
      },

      getlabelsCountUnderManageMyCourse: function (browser) {
              return browser
                  .waitForElementsByXPath("//div[@class='dropdown-menu']//ul//li//div[@class='ng-scope']//span", asserters.isDisplayed, 60000);

      },

      getIconsTotalCountUnderManageMyCourse: function (browser) {
              return browser
                  .waitForElementsByXPath("//div[@class='dropdown-menu']//ul//li//div[@class='ng-scope']//figure", asserters.isDisplayed, 60000);

      },

      verifyLabelsUnderManageMyCourse: function (browser, count,labelText) {
              return browser
                  .waitForElementByXPath("//div[@class='dropdown-menu']//ul//li["+count+"]//div[@class='ng-scope']//span", asserters.isDisplayed, 60000)
                  .text()
                  .should.eventually.include(labelText);
      },
      verifyChapterisPresent: function (browser) {
              return browser
                .hasElementByXPath("//div[@class='chart-container ng-scope']//h1[@translate-value-id='3']");
      }

};
