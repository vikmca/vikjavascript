/**
 * Created by nbalasundaram on 10/1/15.
 */
var testData = require("../../../../../../test_data/data.json");
var wd = require('wd');
var asserters = wd.asserters;
var _ = require('underscore');
var report = require("../../../reporting/reportgenerator");
var stringutil = require("../../../../util/stringUtil");
var commonutil = require("../../../../util/commonUtility.js");
module.exports = {
    notesCreation: function (browser, done, description) {
      return  browser
            .waitForElementByXPath("//button[contains(@class,'sliding-menu-button my-notes-button')]", asserters.isDisplayed, 5000)
            .click()
            .waitForElementByXPath("//nav[contains(@class,'sliding-menu-content is-visible')]", asserters.isDisplayed, 5000)
            .sleep(1000)
            .waitForElementByCss("textarea",asserters.isDisplayed, 10000)
            .type(description).then(function(){
              return browser
              .sleep(1000)
              .waitForElementByXPath("//button[contains(text(),'Save')]",asserters.isDisplayed, 10000)
               .click()
               .sleep(2000)
               .waitForElementByCss(".sliding-menu-content.is-visible .icon-close-x-blue.close-sidebar",asserters.isDisplayed, 5000)
               .click()
               .nodeify(done);
            });
    },

    enterDescriptionOnNotesField : function (browser, description) {
      return  browser
      .waitForElementByXPath("//button[contains(@class,'sliding-menu-button my-notes-button')]", asserters.isDisplayed, 5000)
      .click()
      .waitForElementByXPath("//nav[contains(@class,'sliding-menu-content is-visible')]", asserters.isDisplayed, 5000)
      .sleep(1000)
      .waitForElementByCss("textarea",asserters.isDisplayed, 10000)
      .type(description);

    },
    fetchValueFromNotesFieldTextBox : function (browser) {
      return  browser
      .waitForElementByCss("textarea",asserters.isDisplayed, 10000);

    },
    fetchCharacterCountFromNotes : function(browser) {
      return browser
       .execute("return document.getElementsByTagName('textarea')[0].value.length");
    },

    checkSaveButtonDisabled : function(browser) {
      return browser
      .waitForElementByXPath("//button[contains(text(),'Save')]",asserters.isDisplayed, 10000)
    },

    closeNotesPanel : function(browser) {
      return browser
      .waitForElementByCss("#notes-nav .icon-close-x-blue.close-sidebar",asserters.isDisplayed, 10000)
      .click();
    },

    leftCountFromNotesTextBox: function (browser) {
      return browser
      .execute("return document.getElementsByClassName('remaining-characters ng-scope')[0].textContent");
    },

    verifyNoteOnStudyBoard: function (notesValidation, browser, done) {
        browser
            .waitForElementByXPath("//div[contains(@class,'studybit note')]//div[@class='content ng-binding ng-scope ng-isolate-scope']", asserters.isDisplayed, 90000)
            .text()
            .should.eventually.include(testData.notesTerms.noteText)
            .then(function (textPresentStatus) {
              console.log("textPresentStatus"+textPresentStatus);
                console.log(report.reportHeader() +
                    report.stepStatusWithData("User Added notes ", testData.notesTerms.noteText + " is successfully saved and displayed on Studyboard", "success") +
                    report.reportFooter());
                    done();

            });
    },

    verifyNoteCount: function(browser, notesCount){
      return browser
          .sleep(3000)
          .waitForElementByCss(".sliding-menu-button.my-notes-button .notes-counter", asserters.isDisplayed, 90000)
          .text()
          .should.eventually.include(notesCount)
          .then(function () {
              console.log(report.reportHeader() +
                  report.stepStatusWithData("User Added notes count ",notesCount, "success") +
                  report.reportFooter());

          });

    },
    verifyNotesAvailabilityOnStudyboard: function(browser,notesCount){
      return browser
          .waitForElementsByXPath("//div[contains(@class,'studybit note')]", asserters.isDisplayed, 90000).then(function(noteElement){
            if(_.size(noteElement)==notesCount){
              console.log(report.reportHeader() +
                  report.stepStatusWithData("User Added notes count on Studyboard",_.size(noteElement), "success") +
                  report.reportFooter());
            }else{
              console.log(report.reportHeader() +
                  report.stepStatusWithData("User Added notes count on Studyboard",_.size(noteElement), "failure") +
                  report.reportFooter());
            }
          })
    },

    editNoteText: function(browser,editedtext,done){
       browser
          .waitForElementByXPath("//button[contains(@class,'sliding-menu-button my-notes-button')]", asserters.isDisplayed, 50000)
          .click()
          .waitForElementByXPath("(//div[@class='icon-pencil-blue edit-note ng-scope'])[1]", asserters.isDisplayed, 50000)
          .click()
          .waitForElementByXPath("(//div[@class='edit-note']//textarea)[1]", asserters.isDisplayed, 50000)
          .clear()
          .waitForElementByXPath("(//div[@class='edit-note']//textarea)[1]", asserters.isDisplayed, 50000)
          .type(editedtext)
          .waitForElementByXPath("//div[@class='edit-note']//form//div//button[contains(text(),'Update')]", asserters.isDisplayed, 50000)
          .click()
          .waitForElementByCss(".sliding-menu-content.is-visible .icon-close-x-blue.close-sidebar",asserters.isDisplayed, 50000)
          .click()
          .nodeify(done);
    },

    validateEditedNote:function(browser, editedTextByTestData, done){
      browser
         .waitForElementByXPath("//button[contains(@class,'sliding-menu-button my-notes-button')]", asserters.isDisplayed, 50000)
         .click()
         .waitForElementByXPath("(//span[@class='note-text ng-binding'])[1]", asserters.isDisplayed, 50000)
         .text().then(function(editedText){
           if(editedText.indexOf(editedTextByTestData)>-1){
             console.log(report.reportHeader() +
                 report.stepStatusWithData("Edited text of notes panel "+editedText+" is compared with",editedTextByTestData, "success") +
                 report.reportFooter());
             done();
           }else {
             console.log(report.reportHeader() +
                 report.stepStatusWithData("Edited text of notes panel "+editedText+" is compared with",editedTextByTestData, "failure") +
                 report.reportFooter());
             done();
           }
         })
    },

    verifyEditedNoteOnStudyBoard: function (editedNoteText, browser, done) {
        browser
            .waitForElementByXPath("(//div[contains(@class,'studybit note')])[1]/div[contains(@class,'content')]", asserters.isDisplayed, 90000)
            .text().then(function(editedText){
              if(editedText.indexOf(editedNoteText)>-1){
                console.log(report.reportHeader() +
                    report.stepStatusWithData("User Added notes - "+ editedText + " - on Studyboard is compared with edited text",editedNoteText,"success") +
                    report.reportFooter());
                    done();
              }else{
                console.log(report.reportHeader() +
                    report.stepStatusWithData("User Added notes - "+ editedText + " - on Studyboard is compared with edited text",editedNoteText,"failure") +
                    report.reportFooter());
                    done();
              }
            });
    },

    changeNotesComprehension: function (browser, done) {
       browser
        .sleep(1000)
        .waitForElementByXPath("(//div[contains(@class,'studybit note')])[2]", asserters.isDisplayed, 90000)
        .click()
        .sleep(1000)
        .waitForElementByXPath("//div[contains(@class,'button-group')]/button[contains(text(),'STRONG')]", asserters.isDisplayed, 90000)
        .click()
        .sleep(2000)
        .waitForElementByCss(".save.ng-binding", asserters.isDisplayed, 90000)
        .click()
        .sleep(2000)
        .waitForElementByCss("button.icon-close-x-blue", asserters.isDisplayed, 25000)
        .click()
        .nodeify(done);
      },

       clickOnTopicOnExpandedView: function(browser){
        return browser
         .sleep(1000)
         .waitForElementByXPath("(//div[contains(@class,'studybit note')])[2]", asserters.isDisplayed, 90000)
         .click()
         .sleep(2000)
         .waitForElementByCss(".banner a.chapter-origin", asserters.isDisplayed, 90000)
      //    .execute("document.getElementsByClassName('banner')[0].getElementsByClassName('chapter-origin')[0].click()");
         .click();
       },

       deleteNotesFromNarrative: function(browser, notesText){
          commonutil.acceptAlertsOnGatewayIntergation(browser,true);
          return browser
               .waitForElementByXPath("//button[contains(@class,'sliding-menu-button my-notes-button')]", asserters.isDisplayed, 50000)
               .click()
               .waitForElementByXPath("//ul[contains(@class,'saved-notes')]//span[contains(text(),'"+notesText+"')]//parent::div//div[contains(@class,'icon-trash-gray')]", asserters.isDisplayed, 50000)
               .click();
      },

      validateNotesOnStudyboard: function(browser, notesText){
          return browser
              .sleep(4000)
              .hasElementByXPath("//div[contains(@class,'content') and contains(text(),'"+notesText+"')]");
      }
};
