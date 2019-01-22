var wd = require('wd');
var Q = wd.Q;
var asserters = wd.asserters;
var loginPage = require("../../loginpo");
var testData = require("../../../../../../../../test_data/assignments/chapterReading.json");
var stringutil = require("../../../../../../util/stringUtil");
var assignmentpage = require("../../../../../pagefactory/assignmentpage");
var report = require("../../../../../reporting/reportgenerator");

productData = loginPage.getProductData();
var data = {
    name: "Robo CNC assignment"
};

module.exports = {


    enterName: function (browser) {
        data.name = testData.assignment.name + " " + Math.floor((Math.random() * 1000) + 1);

        return browser
            .waitForElementByXPath("//div[@class='text-input']/input", asserters.isDisplayed, 60000)
            .type(data.name);
    },

    enterRevealDate: function (browser) {

        return browser
            .waitForElementByXPath("(//div[contains(@class,'datefield ng-binding')])[2]", asserters.isDisplayed, 60000)
            .click()
            .waitForElementByCss("div[class='datepicker cg-calendar ng-isolate-scope'] .day.ng-scope.today", asserters.isDisplayed, 60000)
            .click();

    },

    selectAChapter: function (browser, chapter) {
      if (process.env.RUN_IN_BROWSER.toString() === "\"internet explorer\"") {
        var chapterNumber = stringutil.returnValueAfterSplit(chapter, " ", 0);
        chapterNumber = chapterNumber - 1;
        return browser
          .execute("return document.getElementsByClassName('assignment-nav-content')[0].getElementsByClassName('accordion')[0].getElementsByClassName('topic')["+chapterNumber+"].getElementsByTagName('label')[0].click()")
          .sleep(1000)
          .waitForElementsByCss(".accordion p[class='video-reading selected']");
        }else {
          return browser
              .waitForElementByXPath("//div[contains(@class,'cg-checkbox ng-isolate-scope')and contains(.,'" + chapter + "')]/label/span", asserters.isDisplayed, 60000)
              .click()
              .sleep(1000)
              .waitForElementsByCss(".accordion p[class='video-reading selected']");
        }
    },

    getAssignmentName: function () {
        return data.name;
    },

    saveAssignment: function (browser) {
        return browser
            .waitForElementByCss(".save[aria-disabled='false']",asserters.isDisplayed,10000)
            .click()
    },

    checkIfAssignmentSaved: function (browser) {
      var ast = assignmentpage.assignment.assignmentSaveOnCurrentDate;
      var astname = this.getAssignmentName();
      console.log(this.getAssignmentName());
      var res = stringutil.returnreplacedstring(ast,"{{}}",this.getAssignmentName());
        return browser
            .waitForElementByXPath(res, asserters.isDisplayed, 60000)
            .execute("return window.getComputedStyle(document.evaluate(\""+res+"\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue.parentNode).getPropertyValue('background-color');");
    },

    checkIfAssignmentSavedOnFuture: function (browser) {
      //var ast = assignmentpage.assignment.assignmentSaveOnFutureDate;
      var ast = "//div[@class='day ng-scope']/span/span[@class='number ng-binding' and (text()='1')]//parent::span//following-sibling::div[contains(@class,'event')]//span[contains(.,'{{}}')]";
      var res = stringutil.returnreplacedstring(ast,"{{}}",this.getAssignmentName());
        return browser
            .waitForElementByXPath(res, asserters.isDisplayed, 60000)
            // .execute("return window.getComputedStyle(document.evaluate(\"//div[@class='day ng-scope']/span[@class='number ng-binding' and (text()='1')]//following-sibling::button[contains(@class,'event')]//span[contains(.,'" + this.getAssignmentName() + "')]\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue.parentNode).getPropertyValue('background-color');");
            .execute("return window.getComputedStyle(document.evaluate(\""+res+"\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue.parentNode).getPropertyValue('background-color');");
    },


    deleteNonAssessmentAssignment: function (browser) {
        return browser
            .execute("window.scrollTo(0,0)")
            .waitForElementByXPath("(//div[contains(@class,'cg-calendar ng-isolate-scope')]//div[contains(@class,'day ng-scope today')])[1]/button[contains(@class,'event')]/span[contains(.,'" + this.getAssignmentName() + "')]", asserters.isDisplayed, 60000)
            .click()
            .execute("window.scrollTo(0,0)")
            .execute("window.oldConfirm = window.confirm;"+"window.confirm = function(){return true;}")
            .waitForElementByCss(".delete.ng-scope", asserters.isDisplayed, 60000)
            .click()
        },

    getVideosElement: function(browser){
      return browser
        //.execute("document.getElementsByClassName('video-reading selected')[0].scrollIntoView(true)")
        .waitForElementsByCss(".expand-toggle", asserters.isDisplayed, 20000)
        .elementsByXPath("(//p[@class='video-reading selected'])//div//label//span");
        // .elementsByXPath("(//p[@class='video-reading selected'])//div", asserters.isDisplayed, 60000);
    },

    getTopicsElement: function(browser){
      return browser
        //.execute("document.getElementsByClassName('video-reading selected')[0].scrollIntoView(true)")
        .waitForElementsByCss(".expand-toggle", asserters.isDisplayed, 20000)
        .elementsByXPath("(//p[@class='selected'])//div//label//span");
        // .elementsByXPath("(//p[@class='video-reading selected'])//div", asserters.isDisplayed, 60000);
    },

    checkIfStarIsPresntBeforeChapterSeleted: function(browser){
      return browser
      .waitForElementByCss(".ng-binding .star", asserters.isDisplayed, 60000);

    },
    checkIfStarIsNotPresntAfterChapterSeleted: function(browser){
      return browser
      .hasElementByCss(".ng-binding .star.ng-hide", asserters.isDisplayed, 60000);

    },
    validateSelectedChapterBackgroundColor : function(browser){
      return browser
      .execute("return getComputedStyle(document.querySelector('input[type=\"checkbox\"]:checked +label'),'::before').getPropertyValue('background-color')");
    },
    clickOnToggle: function(browser){
      return browser
      .waitForElementByCss(".expand-toggle.is-expanded", asserters.isDisplayed, 60000)
      .click();
    },
    editChapter: function (browser, chapter) {
        return browser
            .sleep(3000)
            .waitForElementByXPath("//div[contains(@class,'cg-checkbox ng-isolate-scope')and contains(.,'" + chapter + "')]/label/span", asserters.isDisplayed, 60000)
            .click();
    },
    verifyEditedChapter: function(browser, chapter){
      return browser
      .hasElementByXPath("//div[contains(@class,'cg-checkbox ng-isolate-scope')and contains(.,'"+chapter+"')]/label/span//parent::label//parent::div//input[@checked='checked']", asserters.isDisplayed, 60000)
    },
    clickOnAssignmentOnCurrentDate: function(browser, astname) {
        return browser
            .waitForElementByXPath("(//div[contains(@class,'day ng-scope today')]/div[contains(@class,'event')])//span[contains(text(),'" + astname + "')]", asserters.isDisplayed, 60000)
            .click();
    },

    enterSpaceOnAssignmentNameTextBox: function(browser){
      return browser
      .waitForElementByXPath("//div[@class='text-input']/input", asserters.isDisplayed, 60000)
      .type(wd.SPECIAL_KEYS.Space)
      .type(wd.SPECIAL_KEYS.Space)
      .type(wd.SPECIAL_KEYS.Space)
      .type(wd.SPECIAL_KEYS.Space);
    },
    saveBtnDisabled: function (browser) {
      return browser
          .waitForElementByCss(".save.pull-right.ng-scope", asserters.isDisplayed, 60000);
    },

    clickOnCancel: function (browser) {
      return browser
          .waitForElementByCss(".cancel.dark-gray-button.pull-right.ng-scope", asserters.isDisplayed, 60000)
          .click();
    },
    verifyErrorMessageOnDraggingTheAssignment: function (browser, done) {
      browser.sleep(2000).hasElementByXPath("//div[@class='flash-alert tip-alert']").then(function(status){
        if (status) {
          return  browser
          .waitForElementByCss(".flash-alert.tip-alert ul li[class='ng-scope ng-binding']", asserters.isDisplayed, 60000).text().then(function(errorText){
            console.log(report.reportHeader() +
              report.stepStatusWithData("error message is displaying on dragging the assignment and error message is "+errorText, "failure") +
              report.reportFooter());
          });
        }
         else {
           console.log(report.reportHeader() +
             report.stepStatusWithData("No error message is displaying on dragging the assignmnet "+ status, "success") +
             report.reportFooter());
             done();
       }

      });
        }


};
