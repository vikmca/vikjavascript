var wd = require('wd');
var asserters = wd.asserters;
var testData = require("../../../../../../../../test_data/gradebook/gradebook.json");
var stringutil = require("../../../../../../util/stringUtil");

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
                .sleep(5000)
                // .waitForElementByXPath("(//div[contains(@class,'ui-grid-viewport')])[2]//div[contains(@class,'ui-grid-row')][1]//div[contains(@class,'ui-grid-cell ng-scope')]", asserters.isDisplayed, 60000)
                // .click()
                .execute("return document.evaluate(\"(//div[contains(@class,'ui-grid-viewport')])[2]//div[contains(@class,'ui-grid-row')][1]//div[contains(@class,'ui-grid-cell ng-scope')]//div\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()")
                .sleep(2000)
                .waitForElementByXPath("//form//input[contains(@class,'ng-pristine ng-untouched ng-valid ng-scope ng-valid-pattern')]", asserters.isDisplayed, 60000)
                .type(testData.instructorgradebook.overriddenscore)
                .type(wd.SPECIAL_KEYS.Tab)
                .refresh();
              }
          },

          overrideTheScoreDisableStatus: function (browser) {
            return browser
                .hasElementByCss(".ui-grid-render-container.ng-isolate-scope.ui-grid-render-container-body .ui-grid-cell.edit-disabled");
          },

          getNumberOfStudent : function(browser){
            return browser
                .waitForElementsByCss(".ui-grid-cell-contents.student-name *", asserters.isDisplayed, 60000)
                .waitForElementsByCssSelector(".container.ng-scope", asserters.isDisplayed, 60000).then(function (gradebook) {
                    gradebook[0].elementsByXPath("(//div[contains(@class,'ui-grid-canvas')])[1]//div[contains(@class,'ui-grid-row ng-scope')]");
                  });
          },

          verifyAssignmentTextBox : function(browser){
            return browser
                .hasElementByCss(".edit-disabled");
          },

          getTotalScoreBoxOnGradebook : function(browser){
          return  browser
                .waitForElementsByXPath("(//div[@class='ui-grid-canvas'])[last()]/div[contains(@class,'ui-grid-row')]//div[contains(@class,'ui-grid-cell-contents')]", asserters.isDisplayed, 60000);
          },

          getScoreOfSecondAssignment: function (browser, student){
            return  browser
                .waitForElementByXPath("(//div[contains(@class,'ui-grid-viewport')]//div[contains(@class,'assignment')]//div)[2]", asserters.isDisplayed, 60000);
          },

          verifyAssignmentTextBox : function(browser){
            return browser
                .hasElementByCss(".edit-disabled");
          },

          getTotalPoints : function(browser){
            return browser
                .waitForElementByCss(".ui-grid-cell-contents.total-points .max-points.ng-binding", asserters.isDisplayed, 60000);
          },

          getPointsGainedByStudent : function(browser, astname){
            return  browser
                .waitForElementByXPath("//div[contains(@class,\"ui-grid-cell-contents\")and contains(.,\"" + astname + "\")]/parent::div/following-sibling::div//div[contains(@class,\"ui-grid-cell-contents ng-binding ng-scope\")]", asserters.isDisplayed, 60000)
                .text();
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
                    .sleep(5000)
                    .execute("return document.evaluate(\"(//div[contains(@class,'ui-grid-viewport')])[2]//div[contains(@class,'ui-grid-row')][1]//div[contains(@class,'ui-grid-cell ng-scope')]//div\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()")
                    // .waitForElementByXPath("(//div[contains(@class,'ui-grid-viewport')])[2]//div[contains(@class,'ui-grid-row')][1]//div[contains(@class,'ui-grid-cell ng-scope')]", asserters.isDisplayed, 60000)
                    // .click()
                    // .hideKeyboard()
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
          .waitForElementByXPath("//div[contains(@class,\"ui-grid-cell-contents student\")and contains(.,\"" + userName + "\")]/parent::div/following-sibling::div//div[contains(@class,\"ui-grid-cell-contents ng-binding ng-scope\")]", asserters.isDisplayed, 60000);
      },
      getStudentCount: function(browser) {
        return browser
            .waitForElementsByCssSelector(".container.ng-scope", asserters.isDisplayed, 60000);
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
     }


};
