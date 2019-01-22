/**
 * Created by nbalasundaram on 10/3/15.
 */
var wd = require('wd');
var asserters = wd.asserters;
var courseHelper = require("../../../../../../support/helpers/courseHelper");
var testData = require("../../../../../../../../test_data/data.json");
var productData = require("../../../../../../../../test_data/products.json");
var assignmentpage = require("../../../../../pagefactory/assignmentpage");
var stringutil = require("../../../../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var tocpo = require("../../../../../../support/pageobject/"+pageobject+"/"+envName+"/tocpo.js");
module.exports = {

    selectADateForAssignment: function (browser) {
      tocpo.selectTileView(browser);
        return browser
            .waitForElementByXPath("(//div[contains(@class,'cg-calendar ng-isolate-scope')])[1]", asserters.isDisplayed, 60000)
            .sleep(2000)
            .waitForElementByCss(".day.ng-scope.today>.actions.ng-scope", asserters.isDisplayed, 60000)
            .click()
            // .execute("return document.getElementsByClassName('day ng-scope today')[0].getElementsByClassName('actions ng-scope')[0].click()")
            .waitForElementByCss(".sliding-menu-content", asserters.isDisplayed, 60000);
            // .sleep(2000);
    },

    selectADateForAssignmentIfMultipleAssignment: function (browser) {
      tocpo.selectTileView(browser);
        return browser
            .waitForElementByXPath("(//div[contains(@class,'cg-calendar ng-isolate-scope')])[1]", asserters.isDisplayed, 60000)
            .sleep(2000)
            // .waitForElementByCss(".day.ng-scope.today>.actions.ng-scope", asserters.isDisplayed, 60000)
            // .click()
            .execute("return document.getElementsByClassName('day ng-scope today')[0].getElementsByClassName('actions ng-scope')[0].click()")
            .waitForElementByCss(".sliding-menu-content", asserters.isDisplayed, 60000);
            // .sleep(2000);
    },
    selectAssessmentTypeAssignment: function (browser) {
        return browser
            .waitForElementByCss("#assessment-assignment-button", asserters.isEnabled, 60000)
            .isEnabled()
            .waitForElementByCss("#assessment-assignment-button", asserters.isEnabled, 60000)
            .isVisible()
            .then(function (flag) {
                if (flag) {
                  return browser.elementByCss("#assessment-assignment-button").click();

                } else {
                  return browser.sleep(3000)
                        .elementByCss("#assessment-assignment-button").click();
                }
            });

    },

    navigateAssignmentCalendarView: function (browser, done) {
        browser
            .waitForElementByCss(".icon-calendar-gray", asserters.isDisplayed, 10000)
            .click()
            .sleep(2000)
            .nodeify(done);
    },

    selectDocumentsAndLinksTypeAssignment: function (browser, done) {
        return browser
            .sleep(2000)
            .waitForElementByCss("#document-assignment-button", asserters.isDisplayed, 60000)
            .click()
            .nodeify(done);
    },

    selectChapterReadingAssessment: function (browser, done) {
      return  browser
            .sleep(2000)
            .waitForElementByCss("#reading-assignment-button", asserters.isDisplayed, 60000)
            .click()
            .nodeify(done);
    },

    verifyAssessmentOnListView: function (browser, done, assignment1position, assessmentname1, currentdate, assignment2position, assessmentname2) {
        browser
            .waitForElementByXPath("((//div[contains(@class,'ui-grid-viewport ng-isolate-scope')]//div[contains(@class,'ui-grid-row ng-scope')])[" + assignment1position + "]//div[contains(@class,'ui-grid-cell')]//div)[1]", asserters.isDisplayed, 10000)
            .text()
            .should.eventually.include(assessmentname1)
            .waitForElementByXPath("((//div[contains(@class,'ui-grid-viewport ng-isolate-scope')]//div[contains(@class,'ui-grid-row ng-scope')])[" + assignment1position + "]//div[contains(@class,'ui-grid-cell')]//div)[2]", asserters.isDisplayed, 10000)
            .text()
            .should.eventually.include(currentdate)
            .waitForElementByXPath("((//div[contains(@class,'ui-grid-viewport ng-isolate-scope')]//div[contains(@class,'ui-grid-row ng-scope')])[" + assignment1position + "]//div[contains(@class,'ui-grid-cell')]//div)[3]", asserters.isDisplayed, 10000)
            .text()
            .should.eventually.include(currentdate)
            .waitForElementByXPath("((//div[contains(@class,'ui-grid-viewport ng-isolate-scope')]//div[contains(@class,'ui-grid-row ng-scope')])[" + assignment2position + "]//div[contains(@class,'ui-grid-cell')]//div)[1]", asserters.isDisplayed, 10000)
            .text()
            .should.eventually.include(assessmentname2)
            .waitForElementByXPath("((//div[contains(@class,'ui-grid-viewport ng-isolate-scope')]//div[contains(@class,'ui-grid-row ng-scope')])[" + assignment2position + "]//div[contains(@class,'ui-grid-cell')]//div)[2]", asserters.isDisplayed, 10000)
            .text()
            .should.eventually.include(currentdate)
            .waitForElementByXPath("((//div[contains(@class,'ui-grid-viewport ng-isolate-scope')]//div[contains(@class,'ui-grid-row ng-scope')])[" + assignment2position + "]//div[contains(@class,'ui-grid-cell')]//div)[3]", asserters.isDisplayed, 10000)
            .text()
            .should.eventually.include(currentdate)
            .nodeify(done);
    },
    navigateAssignmentListView: function (browser, done) {
        browser
            .execute("window.scrollTo(0,0)")
            .waitForElementByCss(".icon-list-gray", asserters.isDisplayed, 10000)
            .click()
            .sleep(2000)
            .nodeify(done);
    },
    navigateAssignmentCalenderView: function (browser, done) {
        browser
            .waitForElementByCss(".icon-calendar-gray", asserters.isDisplayed, 10000)
            .click()
            .sleep(2000)
            .nodeify(done);
    },

    navigateCurrentMonthFromNextMonth: function (browser, done) {
        browser
            .sleep(1000)
            .waitForElementByCss(".container .cg-calendar .previous", asserters.isDisplayed, 20000)
            .click()
            .nodeify(done);
    },

    navigateToNextMonth: function (browser) {
      tocpo.selectTileView(browser);
        return browser
            .execute("window.scrollTo(0,0)")
            .sleep(1000)
            .waitForElementByCss(".container .cg-calendar .next", asserters.isDisplayed, 10000).then(function(firstDateOfNextMonth){
              return browser
                .getLocationInView(firstDateOfNextMonth)
                .waitForElementByCss(".container .cg-calendar .next", asserters.isDisplayed, 10000)
                .click();
            });
    },

    selectFirstDateFormNextMonth: function (browser) {
      tocpo.selectTileView(browser);
        return browser
            .sleep(3000)
            .waitForElementByXPath("//div[@class='day ng-scope']/span/span[contains(@class,'number') and (text()='1')]//parent::span//following-sibling::div[contains(@class,'actions')]", asserters.isDisplayed, 10000)
            .click();
    },

    selectSecondDateFormNextMonth: function (browser) {
      tocpo.selectTileView(browser);
        return browser
            //  .waitForElementByXPath("//div[@class='day ng-scope']/span[@class='number ng-binding' and (text()='2')]//following-sibling::div[contains(@class,'actions')]", asserters.isDisplayed, 10000)
                .waitForElementByXPath("//div[@class='day ng-scope']/span/span[@class='number ng-binding' and (text()='2')]//parent::span//following-sibling::div[contains(@class,'actions')]", asserters.isDisplayed, 10000)
                .click();
            // .waitForElementByXPath("//div[@class='day ng-scope']/span[@class='number ng-binding' and (text()='2')]//following-sibling::div[contains(@class,'actions')]", asserters.isDisplayed, 10000)
            // .click();
    },

    reloadPage: function (browser) {
        return browser
            .refresh()
            .sleep(3000);
    },

    verifyAllAssignmentsGetsDeleted: function (browser) {
        return browser
            .waitForElementByCss(".icon-close-x");
    },

    handleTheFlashAlert: function (browser) {
        return browser
            .hasElementByCss(".icon-close-x",asserters.isDisplayed, 20000).then(function (status) {
                if (status) {
                  return  browser
                        .sleep(8000)
                        .waitForElementByCss(".icon-close-x",asserters.isDisplayed, 20000).click();
                }
            });
    },

    clickOnAssignmentOnNextMonth: function (browser) {
      tocpo.selectTileView(browser);
        return browser
            .waitForElementByXPath(assignmentpage.assignment.assignmentOnNextMonth, asserters.isDisplayed, 10000)
            .click();
    },
    clickTheToggle : function(browser){
      tocpo.selectTileView(browser);
      return browser
        .sleep(2000)
        .waitForElementByXPath("//div[contains(@class,'toggle')]",asserters.isDisplayed,6000)
        .click();
    },
    verifyAssignmentsGetsSavedOnListView : function(browser, assignmentName){
      return browser
      .waitForElementByXPath("//div[contains(@class,'ui-grid-row')]//div[contains(text(),'"+assignmentName+"')]", asserters.isDisplayed, 20000)
      .isDisplayed()
      .should.become(true);
    },
    navigateToSettingTab: function(browser){
      return browser
        .waitForElementByCss("#settings li",asserters.isDisplayed,6000)
        .click();
    },
    editRevealDateFromNextMonthSecondDateToCurrentDate: function(browser){
      tocpo.selectTileView(browser);
      browser
          .waitForElementByXPath("(//div[contains(@class,'datefield ng-binding')])[2]", asserters.isDisplayed, 10000)
          .click().then(function () {
                  browser
                      .waitForElementByXPath("//div[@class='span-half']//cg-date-picker[@label-text='Reveal in Student Calendar']//div[@class='previous']|//div[@class='span-half']//cg-date-picker[@label-text='Reveal in Student Calendar']//button[contains(@class,'previous')]", asserters.isDisplayed, 10000)
                      .click()
                      .waitForElementByCss("div[class='datepicker cg-calendar ng-isolate-scope'] .day.ng-scope.today", asserters.isDisplayed, 10000)
                      .click().then(function () {
                          done();
                      });
          });
    },

    clickTheToggleOnCurrentMonth : function(browser){
      tocpo.selectTileView(browser);
      return browser
        .waitForElementByXPath("(//div[contains(@class,'toggle')])[1]",asserters.isDisplayed,6000)
        .click();
    },

    clickTheToggleOnNextMonth : function(browser){
      tocpo.selectTileView(browser);
      return browser
        .waitForElementByXPath("(//div[contains(@class,'toggle')])[last()]",asserters.isDisplayed,6000)
        .click();
    },
      verifyBackGrndColorOfCurrentDate: function (browser) {
        return browser
        .waitForElementByXPath("//div[@class='cg-double-date-picker ng-isolate-scope']//div[1]//cg-date-picker//div[@class='datefield ng-binding']", asserters.isDisplayed, 10000)
        .click()
        .sleep(3000)
        .execute("return getComputedStyle(document.querySelector('div.day.today:not(.name) .number')).getPropertyValue('background-color')");
      },

    selectFutureDateForAssignment: function (browser, dateForFutureDate) {
        if(dateForFutureDate == 1){
            this.navigateToNextMonth(browser).then(function(){
                return browser
                 .sleep(3000)
                 .waitForElementByXPath("//div[@class='day ng-scope']/span/span[contains(@class,'number') and (text()='"+dateForFutureDate+"')]//parent::span//following-sibling::div[contains(@class,'actions')]", asserters.isDisplayed, 10000)
                 .click()
                 .waitForElementByCss(".sliding-menu-content", asserters.isDisplayed, 60000);
            });
        }else{
            return browser
               .sleep(3000)
               .waitForElementByXPath("//div[@class='day ng-scope']/span/span[contains(@class,'number') and (text()='"+dateForFutureDate+"')]//parent::span//following-sibling::div[contains(@class,'actions')]", asserters.isDisplayed, 10000)
               .click()
               .waitForElementByCss(".sliding-menu-content", asserters.isDisplayed, 60000);
        }


    }

};
