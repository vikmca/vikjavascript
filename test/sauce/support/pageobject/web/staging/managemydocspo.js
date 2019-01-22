var wd = require('wd');
var asserters = wd.asserters;


module.exports = {

    validateManageMyDocuments: function(browser, docsname) {
      return browser
          .waitForElementByCss(".docs.ng-scope", asserters.isDisplayed, 60000)
          .waitForElementByXPath("//li[contains(@class,'ng-scope') and contains(.,'" + docsname +"')]", asserters.isDisplayed, 60000);
    },
    downloadDocs: function(browser, docsname){
      return browser
          .waitForElementByCss(".docs.ng-scope", asserters.isDisplayed, 60000)
          .waitForElementByXPath("//li[contains(@class,'ng-scope') and contains(.,'" + docsname +"')]//a", asserters.isDisplayed, 60000)
          .click()
          .sleep(5000);
    },

    allChaptersPresentOnManageMyDocsPage: function(browser, docsname) {
      return browser
          .waitForElementsByCss("section[ng-repeat='chapter in chapters'] h1", asserters.isDisplayed, 60000);
    },

    validatePublisherProvidedDocuments: function(browser){
         return browser
           .waitForElementByCss(".container header h1", asserters.isDisplayed, 60000).text();
       },

       validateDocumentsDivision: function(browser){
         return browser
           .waitForElementByCss("#all-docs", asserters.isDisplayed, 60000).then(function (){
           	return browser
           		.waitForElementByCss("#student-accessible-docs", asserters.isDisplayed, 60000)
               .nodeify(done);
           });
       },

       checkActiveTabForAllDocs: function(browser){
       	return browser
       	.waitForElementByCss("#all-docs .active", asserters.isDisplayed, 60000).text();
       },

       checkActiveTabForStudentAccessibleDocs: function(browser){
       	return browser
       	.waitForElementByCss("#student-accessible-docs", asserters.isDisplayed, 60000)
       	.click().then(function (){
       		return browser
       		.waitForElementByCss("#student-accessible-docs .active", asserters.isDisplayed, 60000).text();
       	});
       },

       navigateToDocumentsTab: function(browser){
         return browser
         .waitForElementByXPath("//a[text()='DOCUMENTS']", asserters.isDisplayed, 60000)
         .click();
       },

      validateDocumentsTabPrasentOnStudentEnd: function(browser){
        return browser
        .hasElementByXPath("//a[text()='DOCUMENTS']");
      },

       validateDocuments: function(browser){
         return browser
         .waitForElementByCss("header h1", asserters.isDisplayed, 60000).text();
       },

       checkAllDocsPresentOnStudentDocsPage:function(browser){
         return browser
         .waitForElementsByCss(".docs section", asserters.isDisplayed, 60000);
       }

};
