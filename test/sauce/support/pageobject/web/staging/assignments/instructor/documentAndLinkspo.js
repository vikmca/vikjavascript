var wd = require('wd');
var asserters = wd.asserters;
var loginPage = require("../../loginpo");
var testData = require("../../../../../../../../test_data/assignments/documentAndLinks.json");
var stringutil = require("../../../../../../util/stringUtil");
var assignmentpage = require("../../../../../pagefactory/assignmentpage");

productData = loginPage.getProductData();
var data = {
    name: "Robo DNC assignment"
};

module.exports = {
    enterName: function (browser) {
          data.name = testData.assignment.name + " " + Math.floor((Math.random() * 1000) + 1);
          return browser
            .waitForElementByXPath("//div[@class='text-input']//input[@id='assessmentName'and @type='text']", asserters.isDisplayed, 60000)
            .type(data.name);
    },

    enterDescription: function (browser) {
        return browser
            .waitForElementByXPath("//textarea[@id='assessmentDesc']", asserters.isDisplayed, 60000)
            .type(testData.assignment.description);
    },

    enterRevealDate: function (browser) {
        return browser
            .waitForElementByXPath("(//div[contains(@class,'datefield ng-binding')])[2]", asserters.isDisplayed, 60000)
            .click()
            .waitForElementByCss("div[class='datepicker cg-calendar ng-isolate-scope'] .day.ng-scope.today", asserters.isDisplayed, 60000)
            .click();
    },

    clickOnAddAttachment : function(browser){
      return browser
          .sleep(1000)
          .waitForElementByCss("button.attachment.ng-scope", asserters.isDisplayed, 60000)
          .click();
    },

    getAssignmentName: function () {
        return data.name;
    },

    saveAssignment: function (browser) {
        return browser
            .waitForElementByCss(".save.pull-right", asserters.isDisplayed, 60000)
            .click();
    },

    checkIfAssignmentSaved: function (browser) {
      var ast = assignmentpage.assignment.assignmentSaveOnCurrentDate;
      console.log("this.getAssignmentName()"+this.getAssignmentName());
      var res = stringutil.returnreplacedstring(ast,"{{}}",this.getAssignmentName());
        return browser
            .waitForElementByXPath(res, asserters.isDisplayed, 60000)
            .execute("return window.getComputedStyle(document.evaluate(\""+res+"\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue.parentNode).getPropertyValue('background-color');");
    },

    checkIfAssignmentSavedOnFuture: function (browser) {
      //var ast = assignmentpage.assignment.assignmentSaveOnFutureDate;
      var ast = "//div[@class='day ng-scope']/span/span[@class='number ng-binding' and (text()='1')]//parent::span//following-sibling::div[contains(@class,'event')]//span[contains(.,'{{}}')]"
      var res = stringutil.returnreplacedstring(ast,"{{}}",this.getAssignmentName());
        return browser
            .waitForElementByXPath(res, asserters.isDisplayed, 60000)
            .execute("return window.getComputedStyle(document.evaluate(\""+res+"\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue.parentNode).getPropertyValue('background-color');");
    },

    addTheAttachments: function (browser, done) {
      if (process.env.RUN_IN_BROWSER.toString() === "\"internet explorer\"" || process.env.RUN_IN_BROWSER.toString() === "\"firefox\"") {
        browser
          .sleep(2000)
          .execute("return document.getElementById('assignment-panel').getElementsByClassName('cg-document-selection-form')[0].getElementsByTagName('section')[0].getElementsByTagName('h2')[1].scrollIntoView(true);")
          .sleep(2000)
          .waitForElementByXPath("//label[contains(@class,'ng-scope ng-binding')]/span[contains(.,'" + loginPage.getProductData().chapter.topic.documents.assignments[0].documents[0].name + "')]", asserters.isDisplayed, 60000)
          .click()
          .sleep(2000)
          .waitForElementByXPath("//label[contains(@class,'ng-scope ng-binding')]/span[contains(.,'" + loginPage.getProductData().chapter.topic.documents.assignments[0].documents[1].name + "')]", asserters.isDisplayed, 60000)
          .click()
          .sleep(1000)
          .elementByCssSelectorWhenReady(".save.ng-scope", asserters.isDisplayed, 60000)
          .click()
          .nodeify(done);
        }else {
          browser
              .sleep(2000)
              .waitForElementByXPath("//label[contains(@class,'ng-scope ng-binding')]/span[contains(.,'" + loginPage.getProductData().chapter.topic.documents.assignments[0].documents[0].name + "')]", asserters.isDisplayed, 60000)
              .click()
              .sleep(1000)
              .waitForElementByXPath("//label[contains(@class,'ng-scope ng-binding')]/span[contains(.,'" + loginPage.getProductData().chapter.topic.documents.assignments[0].documents[1].name + "')]", asserters.isDisplayed, 60000)
              .click()
              .sleep(1000)
              .elementByCssSelectorWhenReady(".save.ng-scope", asserters.isDisplayed, 60000)
              .click()
              .nodeify(done);
        }
    },

    clickOnCreatedAssignment: function (browser) {
      return browser
      .waitForElementByCss(".event.ng-scope.is-not-revealed-to-students", asserters.isDisplayed, 60000)
      .click();
    },

verifyAddedAttachments : function (browser) {
  return browser
       .waitForElementByXPath("//div[@class='full-width attachments']//li[contains(text(),'" + loginPage.getProductData().chapter.topic.documents.assignments[0].documents[0].name + "')]", asserters.isDisplayed, 60000).then(function(){
         return browser
         .waitForElementByXPath("//div[@class='full-width attachments']//li[contains(text(),'" + loginPage.getProductData().chapter.topic.documents.assignments[0].documents[0].name + "')]", asserters.isDisplayed, 60000);
       });
},

    deleteNonAssessmentAssignment: function (browser) {
        return browser.
            waitForElementByXPath("(//div[contains(@class,'cg-calendar ng-isolate-scope')]//div[contains(@class,'day ng-scope today')])[1]/div[contains(@class,'event ng-scope')]/span[contains(.,'" + this.getAssignmentName() + "')]", asserters.isDisplayed, 60000)
            .click()
            .execute("window.oldConfirm = window.confirm;"+"window.confirm = function(){return true;}")
            .waitForElementByCss(".delete.ng-scope", asserters.isDisplayed, 60000)
            .click()
    },

    verifyDocsAndLinkAssignmentAtStudentCalendar : function(browser, docs, astName){
    return  browser
          .waitForElementByXPath("//div[@class='details']//div[contains(@class,'title') and contains(.,'" + astName + "')]", asserters.isDisplayed, 60000)
          .waitForElementByXPath("//a[contains(@class,'assignment-link ng-binding')and contains(.,'" + docs + "')]", asserters.isDisplayed, 60000);
    },

    VerifyDescriptionOfDocAndLinkAssignment : function(browser,desc){
        return  browser
          .waitForElementByCss(".instructions span",asserters.isDisplayed, 60000)
          .text().should.eventually.include(desc);
    },

  validateBackButtonFunctional : function(browser){
      return  browser
      .waitForElementByXPath("//label[contains(@class,'ng-scope ng-binding')]/span[contains(.,'" + loginPage.getProductData().chapter.topic.documents.assignments[0].documents[0].name + "')]", asserters.isDisplayed, 60000)
      .click()
      .waitForElementByXPath("//label[contains(@class,'ng-scope ng-binding')]/span[contains(.,'" + loginPage.getProductData().chapter.topic.documents.assignments[0].documents[1].name + "')]", asserters.isDisplayed, 60000)
      .click()
      .waitForElementByCss(".cancel.dark-gray-button.pull-right.ng-scope",asserters.isDisplayed, 60000)
      .click()
      .sleep(1000)
      .waitForElementByCss(".attachment.ng-scope",asserters.isDisplayed, 60000);
  },

  checkIfEditedDescriptionTextPresentOnStudent : function(browser){
    return browser
    .waitForElementByXPath("//div[@class='instructions']//span", asserters.isDisplayed, 10000);
  },

  editDescriptionText : function(browser){
       return browser
         .waitForElementByXPath("//textarea[@id='assessmentDesc']", asserters.isDisplayed, 60000)
          .clear().then(function(){
           return browser
           .sleep(1000)
           .waitForElementByXPath("//textarea[@id='assessmentDesc']", asserters.isDisplayed, 60000)
           .type(testData.editedDescriptionOnDocAndLinkAst.descriptionField)
           .sleep(2000);
         });
 },

 selectButtonDisabledStatus: function(browser){
   return browser
     .waitForElementByCss(".save.pull-right.ng-scope", asserters.isDisplayed, 60000)
     .getAttribute('aria-disabled').should.eventually.include("true");

 },

 selectButtonStatusAfterDocSelected: function(browser){
   return browser
     .waitForElementByCss(".save.pull-right.ng-scope", asserters.isDisplayed, 60000)
     .getAttribute('aria-disabled').should.eventually.include("false");

 }
};
