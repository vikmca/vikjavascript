var wd = require('wd');
var asserters = wd.asserters;
var report = require("../../../../../reporting/reportgenerator");
module.exports = {

    navigateToStudentDetailedPageOnGradebook: function (browser, username) {
      if (process.env.RUN_ENV.toString() === "\"integration\"") {
        return browser
            .waitForElementByXPath("//div[contains(text(),'"+username+"')]", asserters.isDisplayed, 60000)
            .click()
            .waitForElementByXPath("//span[contains(text(),'" + username + "')]", asserters.isDisplayed, 60000);
     } else{
       return browser
       .waitForElementByXPath("//div[contains(text(),'"+username+"')]", asserters.isDisplayed, 60000)
       .click()
      .waitForElementByXPath("//span[contains(text(),'" + username + "')]", asserters.isDisplayed, 60000);
     }

    },

    navigateToGradebookViewFromStudentDetailedPage: function(browser){
      return browser
          .waitForElementByCss(".back-button.ng-scope", asserters.isDisplayed, 60000)
          .click()
    },

    clickOnCreatedAssessment : function(browser, assessmentname){
      return browser
          .waitForElementByXPath("//div[contains(@class,'ui-grid-render-container-body')]//div[contains(@class,'ui-grid-header-canvas')]//div[contains(@class,'ui-grid-header-cell-wrapper')]//span[contains(text(),'"+assessmentname+"')]", asserters.isDisplayed, 60000)
          .click()
    },
    navigateToDetailsOfStudentsAttempts : function(browser, assessmentname){
      return browser
          .waitForElementByXPath("//a[contains(text(),'"+assessmentname+"')]", asserters.isDisplayed, 60000)
          .click();
    },
    defaultSelectedAttempt : function(browser){
      return browser
          .waitForElementByXPath("//select//option[@selected='selected']", asserters.isDisplayed, 60000);
    },
    getDropDownList: function(browser){
      return browser
      .waitForElementsByCss("select option", asserters.isDisplayed, 60000);
    },
    getTextOnDefaultSelected: function(browser, countOfAttempt){
      return browser
      .waitForElementByCss("option[selected='selected']", asserters.isDisplayed, 60000).text();
    },
    getAssignmentNameOnDetailedPage: function(browser){
      return browser
      .waitForElementByCss(".assignment-name", asserters.isDisplayed, 60000).text();
    },
    getStudentNameOnDetailedPage: function(browser){
      return browser
      .waitForElementByCss(".student-name", asserters.isDisplayed, 60000).text();
    },
    getLabels: function(browser,locator,labelText){
      return browser
      .waitForElementByCss(locator, asserters.isDisplayed, 60000)
      .text()
      .should.eventually.include(labelText);
    },
    getAnalyticsValues: function(browser, locator, analyticsValue){
      return browser
      .waitForElementByCss(locator, asserters.isDisplayed, 60000)
      .text()
      .should.eventually.include(analyticsValue);
    },
    getTextOnDropDown: function(browser,index){
      return browser
      .waitForElementByXPath("(//option)["+index+"]", asserters.isDisplayed, 60000).text();
    },
    clickOnGradebookBackButton: function(browser){
      return browser
      .waitForElementByCss(".back-button.ng-scope", asserters.isDisplayed, 60000)
      .click();
    },
    clickOnSelectBox: function(browser, index){
      return browser
      .waitForElementByCss("select", asserters.isDisplayed, 60000)
      .click()
      .waitForElementByXPath("//option[contains(text(),'Attempt 3')]", asserters.isDisplayed, 60000)
      .click();
    },

    countAttemptsForMediaQuiz: function(browser){
      return browser
      .waitForElementsByCss(".attempt-selection option", asserters.isDisplayed, 60000)
    },

    selectLastAttempt: function(browser, index){
      return browser
      .waitForElementByCss("select", asserters.isDisplayed, 60000)
      .click()
      .waitForElementByXPath("//option[contains(text(),'Attempt " + index + "')]", asserters.isDisplayed, 60000)
      .click();
    },

  validateExportButton: function(browser,done){
     if (process.env.RUN_IN_BROWSER.toString() === "\"internet explorer\"") {
      return browser
         .waitForElementByCss("#gradebook-buttons button", asserters.isDisplayed, 10000).getAttribute('aria-disabled')
         .then(function(exportButtonOnIe){
           if (exportButtonOnIe === "true") {
                 console.log(report.reportHeader() +
                 report.stepStatusWithData("Status of Export button on internet explorer browser", exportButtonOnIe,"success") +
                 report.reportFooter());
                 done();
           } else {
                 console.log(report.reportHeader() +
                 report.stepStatusWithData("Status of Export button on internet explorer browser", exportButtonOnIe,"failure") +
                 report.reportFooter());
           }
           });
          }else {
            return browser
           .waitForElementByCss("#download-grades-button", asserters.isDisplayed, 10000).getAttribute('aria-disabled').then(function(exportButton){
              if (exportButton === "false") {
                   console.log(report.reportHeader() +
                   report.stepStatusWithData("Status of Export button on other browsers is" + exportButton + " i.e button is enabled"," "," success") +
                   report.reportFooter());
                   done();
             } else {
               console.log(report.reportHeader() +
                   report.stepStatusWithData("Status of Export button on other browsers is" + exportButton + " i.e button is disabled"," "," failure") +
                   report.reportFooter());
             }
           });

        }

     },
     checkIfStudentIsPresent: function (browser, username) {
        return browser
        .hasElementByXPath("//div[@class='student-name']//a[contains(text(),'"+username+"')]");
      },

      validateAssessmentPresentStatue: function(browser, assignmentName){
          return browser
              .hasElementByXPath(" //div[contains(@class,'ui-grid-header')]//span[contains(text(),'"+assignmentName+"')]");
      },
      verifyErrorMessageOnClickingAssignmentName: function (browser) {
        return browser.sleep(5000).hasElementByXPath("//div[@class='flash-alert error-alert']");
     },
      checkAssignmentIsClickable : function(browser, assessmentname){
        return browser
            .hasElementByXPath("//span[contains(text(),'"+assessmentname+"')]");
      }


};
