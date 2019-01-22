var wd = require('wd');
var asserters = wd.asserters;
var testData = require("../../../../../../../../test_data/gradebook/gradebook.json");
var stringutil = require("../../../../../../util/stringUtil");
var mathutil = require("../../../../../../util/mathUtil.js");
var report = require("../../../../../reporting/reportgenerator");
var totalValueOfScoresForAllStudents =0;
module.exports = {

    overrideTheScore: function (browser) {
      if(stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString())==="internet explorer"){
        console.log(stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString()));
        return browser
            .waitForElementByCss(".ui-grid-render-container.ng-isolate-scope.ui-grid-render-container-body .ui-grid-cell", asserters.isDisplayed, 60000)
            .click()
            .sleep(2000)
            .waitForElementByCss(".ui-grid-render-container.ng-isolate-scope.ui-grid-render-container-body .ui-grid-cell", asserters.isDisplayed, 60000)
            .type(testData.instructorgradebook.overriddenscore)
            .sleep(2000)
            .type(wd.SPECIAL_KEYS.Tab)
            .sleep(2000)
            .refresh();
          }
          else if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString())==="safari") {
            console.log(stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString()));
            return browser
                .sleep(2000)
                .waitForElementByCss(".ui-grid-render-container-body .ui-grid-viewport .ui-grid-cell-contents.ng-binding.ng-scope", asserters.isDisplayed, 60000)
                .click()
                .sleep(2000)
                .waitForElementByXPath("//form//input[contains(@class,'ng-pristine ng-untouched ng-valid ng-scope ng-valid-pattern')]", asserters.isDisplayed, 60000)
                  .type(testData.instructorgradebook.overriddenscore)
                  .type(wd.SPECIAL_KEYS.Tab)
                  .refresh();
          }
          else{
            return browser
                .waitForElementByXPath("(//div[contains(@class,'ui-grid-viewport')])[2]//div[contains(@class,'ui-grid-row')][1]//div[contains(@class,'ui-grid-cell ng-scope')]", asserters.isDisplayed, 60000)
                .click()
                .sleep(2000)
                .waitForElementByXPath("//form//input[contains(@class,'ng-pristine ng-untouched ng-valid ng-scope ng-valid-pattern')]", asserters.isDisplayed, 60000)
                .type(testData.instructorgradebook.overriddenscore)
                .type(wd.SPECIAL_KEYS.Tab)
                .refresh();
              }
          },
          overrideTheScoreDisableStatus: function (browser) {
            return browser
                .hasElementByCss("td[class='assignment']");
          },

          getNumberOfStudent : function(browser){
            return browser
                .waitForElementsByCss(".ui-grid-cell-contents.student-name *", asserters.isDisplayed, 60000)
                .waitForElementsByCssSelector(".container.ng-scope", asserters.isDisplayed, 60000).then(function (gradebook) {
                    gradebook[0].elementsByXPath("(//div[contains(@class,'ui-grid-canvas')])[1]//div[contains(@class,'ui-grid-row ng-scope')]");
                  });
          },
          getTotalScoreBoxOnGradebook : function(browser,registeredStudentName){
          return  browser
              // for stage .waitForElementsByXPath("(//div[@class='ui-grid-canvas'])[last()]/div[contains(@class,'ui-grid-row')]//div[contains(@class,'ui-grid-cell-contents')]", asserters.isDisplayed, 60000);
                .waitForElementsByXPath("//td[@class='assignment']/div", asserters.isDisplayed, 60000);

          },

          getTotalPoints : function(browser){
            return browser
              // for stage  .waitForElementByCss(".ui-grid-cell-contents.total-points .max-points.ng-binding", asserters.isDisplayed, 60000);
                .waitForElementByXPath("//th/div[@class='total-points ng-scope']/following-sibling::div");
          },

          verifyAssignmentTextBox : function(browser){
            return browser
                .hasElementByXPath("(//td[@class='assignment' and not(contains(@class,'input-box'))])");
          },

          getPointsGainedByStudent : function(browser, stuName){
            return  browser
              // for stag .waitForElementByXPath("//div[contains(@class,\"ui-grid-cell-contents\")and contains(.,\"" + astname + "\")]/parent::div/following-sibling::div//div[contains(@class,\"ui-grid-cell-contents ng-binding ng-scope\")]", asserters.isDisplayed, 60000);
                .waitForElementByXPath("//div[@class='student-name']/span[contains(text(),'"+stuName+"')]/parent::div/parent::td/following-sibling::td/div[@class='total-points ng-binding']", asserters.isDisplayed, 60000)
                .text();
          },

          getScoreOfSecondAssignment: function (browser, student){
            return  browser
                // .waitForElementByXPath("(//div[contains(@class,'ui-grid-viewport')]//div[contains(@class,'assignment')]//div)[2]", asserters.isDisplayed, 60000);
                   .waitForElementByXPath("(//div[@class='student-name']/span[contains(text(),'"+student+"')]/parent::div/parent::td/following-sibling::td[@class='assignment']//div)[1]", asserters.isDisplayed, 60000);
          },

          overrideScore: function (browser,scoreOveride) {
          if(stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString())==="internet explorer"){
            console.log(stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString()));
            return browser
                .waitForElementByCss(".ui-grid-render-container.ng-isolate-scope.ui-grid-render-container-body .ui-grid-cell", asserters.isDisplayed, 60000)
                .click()
                .sleep(2000)
                .waitForElementByCss(".ui-grid-render-container.ng-isolate-scope.ui-grid-render-container-body .ui-grid-cell", asserters.isDisplayed, 60000)
                .type(scoreOveride)
                .type(wd.SPECIAL_KEYS.Tab)
                .refresh();
              }
              else if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString())==="safari") {
                console.log(stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString()));
                return browser
                    .sleep(2000)
                    .waitForElementByCss(".ui-grid-render-container-body .ui-grid-viewport .ui-grid-cell-contents.ng-binding.ng-scope", asserters.isDisplayed, 60000)
                    .click()
                    .sleep(2000)
                    .waitForElementByXPath("//form//input[contains(@class,'ng-pristine ng-untouched ng-valid ng-scope ng-valid-pattern')]", asserters.isDisplayed, 60000)
                      .type(scoreOveride)
                      .type(wd.SPECIAL_KEYS.Tab)
                      .refresh();
              }
              else{
                return browser
                    .waitForElementByXPath("(//div[contains(@class,'ui-grid-viewport')])[2]//div[contains(@class,'ui-grid-row')][1]//div[contains(@class,'ui-grid-cell ng-scope')]", asserters.isDisplayed, 60000)
                    .click()
                    .sleep(2000)
                    .waitForElementByXPath("//form//input[contains(@class,'ng-pristine ng-untouched ng-valid ng-scope ng-valid-pattern')]", asserters.isDisplayed, 60000)
                    .type(scoreOveride)
                    .type(wd.SPECIAL_KEYS.Tab)
                    .refresh();
                  }
              },

      getOveridenScore: function(browser){
        return  browser
            .waitForElementByXPath("(//div[contains(@class,'ui-grid-viewport')])[2]//div[contains(@class,'ui-grid-row')][1]//div[contains(@class,'ui-grid-cell')]//div", asserters.isDisplayed, 60000);

      },
      overrideScoreAllAssignments: function (browser,scoreOveride, index) {
        if(stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString())==="internet explorer"){
          console.log(stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString()));
          return browser
              .waitForElementsByCss(".ui-grid-render-container.ng-isolate-scope.ui-grid-render-container-body .ui-grid-cell", asserters.isDisplayed, 60000)
              .then(function(element){
                element[index].click().then(function(){
                  return browser
                  .sleep(2000)
                  .waitForElementByCss(".ui-grid-render-container.ng-isolate-scope.ui-grid-render-container-body .ui-grid-cell", asserters.isDisplayed, 60000)
                  .type(scoreOveride)
                  .type(wd.SPECIAL_KEYS.Tab);
                });
              });

          }
          else if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString())==="safari") {
            console.log(stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString()));
            return browser
                .sleep(2000)
                .waitForElementsByCss(".ui-grid-render-container-body .ui-grid-viewport .ui-grid-cell-contents.ng-binding.ng-scope", asserters.isDisplayed, 60000)
                .then(function(element){
                  element[index].click().then(function(){
                    return browser
                  .sleep(2000)
                  .waitForElementByXPath("//form//input[contains(@class,'ng-pristine ng-untouched ng-valid ng-scope ng-valid-pattern')]", asserters.isDisplayed, 60000)
                  .type(scoreOveride)
                  .type(wd.SPECIAL_KEYS.Tab);
                });
              });
          }
          else{
            return browser
                .waitForElementByXPath("((//div[contains(@class,'ui-grid-viewport')])[2]//div[contains(@class,'ui-grid-row')][1]//div[contains(@class,'ui-grid-cell ng-scope')]//div)["+index+"]", asserters.isDisplayed, 60000)
                .click().then(function(){
                    return browser
                    .sleep(2000)
                    .waitForElementByXPath("//form//input[contains(@class,'ng-pristine ng-untouched ng-valid ng-scope ng-valid-pattern')]", asserters.isDisplayed, 60000)
                    .type(scoreOveride)
                    .type(wd.SPECIAL_KEYS.Tab)
                    .refresh();
                });
          }
      },
      getOveridenScoreForAllAssignment: function (browser, index) {
        return  browser
            .waitForElementByXPath("((//div[contains(@class,'ui-grid-viewport')])[2]//div[contains(@class,'ui-grid-row')][1]//div[contains(@class,'ui-grid-cell')]//div)["+index+"]", asserters.isDisplayed, 60000);

      },
      pointGainedByStudent: function (browser, userName) {
        return browser
            .waitForElementByXPath("//div[@class='student-name']/span[contains(text(),'"+userName+"')]/parent::div/parent::td/following-sibling::td/div[@class='total-points ng-binding']", asserters.isDisplayed, 60000);
        //   .waitForElementByXPath("//div[contains(@class,\"ui-grid-cell-contents student\")and contains(.,\"" + userName + "\")]/parent::div/following-sibling::div//div[contains(@class,\"ui-grid-cell-contents ng-binding ng-scope\")]", asserters.isDisplayed, 60000);
      },
      getStudentCount: function(browser) {
        return browser
            .waitForElementsByCssSelector(".container.ng-scope", asserters.isDisplayed, 60000)
            .waitForElementsByCss("tbody .student-name", asserters.isDisplayed, 60000);
      },

      assignmentTabbingOut: function (browser, index) {
        return browser
        .waitForElementsByXPath("(//div[contains(@class,'ui-grid-viewport')])[2]//div[contains(@class,'ui-grid-row')][1]//div[contains(@class,'ui-grid-cell ng-scope')]", asserters.isDisplayed, 60000)
        .then(function(element){
          element[index].click().then(function(){
            return browser
            .sleep(2000)
            .waitForElementByXPath("//form//input[contains(@class,'ng-pristine ng-untouched ng-valid ng-scope ng-valid-pattern')]", asserters.isDisplayed, 60000)
            .type(wd.SPECIAL_KEYS.Tab)
            .type(wd.SPECIAL_KEYS.Tab)
            .type(wd.SPECIAL_KEYS.Tab);
          });
        });
     },

     verifyAssignmentBoxHighlightedAfterOverriding: function (browser) {
       return  browser
           .execute("return (getComputedStyle(document.querySelector('.gradebook .assignment.override'),'::after').getPropertyValue('border-right-color'))");
     },

    getScoreText: function(browser, sizeOfColumn){
      return browser
        //  .waitForElementByXPath("((//div[@class='ui-grid-canvas'])[last()]/div[contains(@class,'ui-grid-row')]//div[contains(@class,'ui-grid-cell-contents')])[" + sizeOfColumn + "]", asserters.isDisplayed, 60000)
          .waitForElementByXPath("(//td[@class='assignment']/div)["+ sizeOfColumn +"]", asserters.isDisplayed, 60000)
          .text()
    },
    getErrorMessagePresenceStatus: function (browser) {
      return  browser
          .sleep(3000)
          .hasElementByXPath("//div[@class='flash-alert error-alert']//li[contains(text(),'We are unable to load grades. Please check back at a later time.')]");
    },

    studentFilterBoxPresenceStatus: function(browser){
        return  browser
               .hasElementByCss("input.student-name-filter-input");
            // .hasElementByCss("input.student-filter");
    },

    enterStudentNameInInputBox: function(browser, studentName){
        if(stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString())==="firefox"){
        console.log("in firefox "+studentName);
        var studentFirstName = studentName
        var studentFirstName = stringutil.returnValueAfterSplit(studentName, ",", 0);
        return  browser
            .sleep(2000)
            .waitForElementByCss("input.student-name-filter-input", asserters.isDisplayed, 60000)
            .type(studentFirstName)
            .type(",")
            .sleep(1000);
        }else{
          return  browser
              .waitForElementByCss("input.student-name-filter-input", asserters.isDisplayed, 60000)
              .type(studentName);
        }
    },

    getTotalStudentsCount: function(browser){
        return  browser
            .waitForElementsByCss("tbody .student-name", asserters.isDisplayed, 60000);
    },

    getStudentNameOnGradebook: function(browser){
        return  browser
            .waitForElementByCss("tbody .student-name span", asserters.isDisplayed, 60000).text();
    },

    clearStudentName: function(browser){
        return  browser
            .waitForElementByCss("input.student-name-filter-input", asserters.isDisplayed, 60000)
            .clear();
    },

    getCreatedAssignmentNameFromGradebook:function(browser, count){
      return browser
        .sleep(3000)
        .hasElementByXPath("(//div[@class='assignment-title'])["+count+"]").then(function(status){
            if(status){
                return browser
                    .waitForElementByXPath("(//div[@class='assignment-title'])["+count+"]//a", asserters.isDisplayed, 60000).text();
            }else{
                count = count-3;
                return browser
                .waitForElementByCss("#next-page", asserters.isDisplayed, 60000)
                .click()
                .waitForElementByXPath("(//div[@class='assignment-title'])["+count+"]//a", asserters.isDisplayed, 60000).text();
            }
        });
    },

    filterButtonPresenceStatus : function (browser){
      return browser
        .sleep(3000)
        .hasElementByCss(".filter-button");
    },

    clickOnFilterBtn : function(browser){
      return browser
        .sleep(2000)
        .waitForElementByCss(".filter-button", asserters.isDisplayed, 60000)
        .click();
    },

    getFilterBtnExpandedStatus : function (browser){
      return browser
        .sleep(2000)
        .hasElementByCss(".filter-menu.gradebook-filter-menu.filter-open");
    },

    studentNameResetButtonPresenceStatus : function (browser){
      return browser
        .sleep(2000)
        .hasElementByCss(".reset-student-name-filter");
    },

    clickOnStudentNameResetButton: function (browser){
      return browser
        .waitForElementByCss(".reset-student-name-filter", asserters.isDisplayed, 60000)
        .click();
    },

    getTextOfStudentNameInputBox: function (browser){
      return browser
        .waitForElementByCss("input.student-name-filter-input", asserters.isDisplayed, 60000)
        .text();
    },

    clickOnDueDateToOrFrom: function (browser, count){
      return browser
      .waitForElementByXPath("(//div[contains(@class,'datefield')])["+count+"]", asserters.isDisplayed, 60000)
      .click();
    },

    clickOnPreviousMonthBtn: function (browser, count){
      return browser
      .waitForElementByCss(".date-filter-to .previous", asserters.isDisplayed, 60000)
      .click();
    },

    clickOnTodayDate: function (browser, count){
      return browser
      .waitForElementByCss(".today", asserters.isDisplayed, 60000)
      .click();
    },

    dueDateFromValue: function (browser, count){
      return browser
      .waitForElementByCss(".date-filter-from .datefield", asserters.isDisplayed, 60000)
      .text();
    },

    dueDateToValue: function (browser, count){
       return browser
       .waitForElementByCss(".date-filter-to .datefield", asserters.isDisplayed, 60000)
       .text();
    },

    getStudentNameLabelText: function (browser, count){
       return browser
       .waitForElementByCss(".student-name-filter-label", asserters.isDisplayed, 60000)
       .text();
    },

    getDueDateRangeText: function (browser, count){
       return browser
       .waitForElementByCss(".date-filter-label", asserters.isDisplayed, 60000)
       .text();
    },

    getStudentNameIcon : function (browser, count){
       return browser
       .hasElementByCss(".student-name-filter-icon");
    },

     getDueDateRangeIcon : function (browser, count){
        return browser
        .hasElementByCss(".date-filter-label");
     },

     getAssessmentCountBelowExport : function (browser){
        return browser
        .waitForElementByCss("#total-assignment-counts", asserters.isDisplayed, 60000)
        .text();
     },

    getAssessmentCounts : function (browser){
       return browser
       .waitForElementsByCss(".assignment-title", asserters.isDisplayed, 60000);
    },

    getFilteredAssessmentText : function (browser){
       return browser
       .waitForElementByCss(".assignment-title a", asserters.isDisplayed, 60000)
       .text();
    },

    nextBtnDisableStatus : function (browser){
       return browser
       .waitForElementByCss("#next-page", asserters.isDisplayed, 60000)
       .getAttribute("aria-disabled");
    },

    resetDueDateRange : function (browser){
       return browser
       .waitForElementByCss(".reset-date-filter", asserters.isDisplayed, 60000)
       .click();
    },

    resetAllFiltersOnGradebook : function (browser){
       return browser
       .waitForElementByCss("reset-all-filters", asserters.isDisplayed, 60000)
       .click();
    }
};
