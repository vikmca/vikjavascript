var wd = require('wd');
var asserters = wd.asserters;
module.exports = {

    getStudentScore: function (browser, assignmentName) {
        return browser
            .sleep(10000)//student grades takes few time to update
            .waitForElementByXPath("(//td//a[contains(text(),'" + assignmentName + "')]/../parent::td//following-sibling::td[@class='score-col']//div[@class='left-of-pipe'])[1]/span", asserters.isDisplayed, 60000)
            .text();
    },

    checkStudentScore: function (browser, assignmentName,score) {
        return browser
            .waitForElementByXPath("(//td//a[contains(text(),'" + assignmentName + "')]/../parent::td//following-sibling::td[@class='score-col']//div[@class='left-of-pipe'])[1]/span[contains(text(),'"+score+"')]", asserters.isDisplayed, 60000);
    },

    editedAttemptsFromStudentDetaledViewBeforeTakeAnyAttempt : function(browser, assignmentName){
        return browser
              .sleep(4000)
              .waitForElementByXPath("//td//span[contains(text(),'" + assignmentName + "')]/../parent::td//following-sibling::td[@class='attempts-col']/div[@class='attempts-inner']/div[@class='right-of-pipe attempts']/div[@class='select-style-sm']/select/option[@value='unlimited']", asserters.isDisplayed, 60000)
              .click()
              .sleep(1000);
    },

    editedAttemptOnStudentDetailPageBeforeTakeAnyAttempt: function (browser, assignmentName) {
      return browser
      .waitForElementByXPath("//td//span[contains(text(),'"+assignmentName+"')]/../parent::td//following-sibling::td[@class='attempts-col']/div[@class='attempts-inner']/div[@class='right-of-pipe attempts']/div[@class='select-style-sm']/select", asserters.isDisplayed, 60000).getAttribute('value');
    },

    editedAttemptOnStudentDetailPage: function (browser, assignmentName) {
      return browser
      .waitForElementByXPath("//td//a[contains(text(),'"+assignmentName+"')]/../parent::td//following-sibling::td[@class='attempts-col']/div[@class='attempts-inner']/div[@class='right-of-pipe attempts']/div[@class='select-style-sm']/select", asserters.isDisplayed, 60000).getAttribute('value');
    },

    getStudentTotalScore: function (browser, assignmentName) {
        return browser
            .waitForElementByXPath("(//td//a[contains(text(),'" + assignmentName + "')]/../parent::td//following-sibling::td[@class='score-col']//div[@class='right-of-pipe'])[1]/span", asserters.isDisplayed, 60000)
            .text();
    },

    getScoredPoints: function (browser, assignmentName) {
        return browser
            .waitForElementByXPath("(//td//a[contains(text(),'" + assignmentName + "')]/../parent::td//following-sibling::td[@class='points-col']//div[@class='left-of-pipe'])[1]/span", asserters.isDisplayed, 60000)
            .text();
    },

    getTotalPoints: function (browser, assignmentName) {
        return browser
            .waitForElementByXPath("(//td//a[contains(text(),'" + assignmentName + "')]/../parent::td//following-sibling::td[@class='points-col']//div[@class='right-of-pipe'])[1]/span", asserters.isDisplayed, 60000)
            .text();
    },

    editedAttemptsFromStudentDetaledView : function(browser, assignmentName){
      return browser
        .waitForElementByXPath("//td//a[contains(text(),'" + assignmentName + "')]/../parent::td//following-sibling::td[@class='attempts-col']/div[@class='attempts-inner']/div[@class='right-of-pipe attempts']/div[@class='select-style-sm']/select/option[@value='unlimited']", asserters.isDisplayed, 60000).then(function(dueAttempt){
          return browser
          .getLocationInView(dueAttempt)
          .sleep(4000)
          .waitForElementByXPath("//td//a[contains(text(),'" + assignmentName + "')]/../parent::td//following-sibling::td[@class='attempts-col']/div[@class='attempts-inner']/div[@class='right-of-pipe attempts']/div[@class='select-style-sm']/select/option[@value='unlimited']", asserters.isDisplayed, 60000)
          .click()
          .sleep(1000);
        });
    },

    getTotalPointsEarnedOnGraph: function (browser) {
        return browser
            .waitForElementByCss("div.progress-bar-indication p", asserters.isDisplayed, 60000)
            .text();
    },

    getTotalPointsPossibleOnGraph: function (browser) {
        return browser
            .waitForElementByXPath("//div[@class='chart-container']//footer//span", asserters.isDisplayed, 60000)
            .text();
    },

    validatePresenceOfAverageScore: function(browser, assignmentName){
        return browser
            .waitForElementByXPath("(//td//a[text()='" + assignmentName + "']/../parent::td//following-sibling::td[@class='avg-col']//div[@class='left-of-pipe'])[1]/span", asserters.isDisplayed, 60000)
            .text();
    },

    getSubmittedDate: function (browser,assignmentName) {
        return browser
            .sleep(3000)//Gragebook details takes some time to update
            .waitForElementByXPath("//td//a[contains(text(),'"+assignmentName+"')]/../parent::td//following-sibling::td[@class='submitted-col']/div[@class='submitted-inner']/div[@class='left-of-pipe ng-binding']", asserters.isDisplayed, 60000)
            .text();
    },
    checkSubmittedDate: function (browser,assignmentName,submittedDate) {
        return browser
                .waitForElementByXPath("//td//a[contains(text(),'"+assignmentName+"')]/../parent::td//following-sibling::td[@class='submitted-col']/div[@class='left-of-pipe ng-binding'][contains(text(),'"+submittedDate+"')]", asserters.isDisplayed, 60000);
            // .waitForElementByXPath("//td//a[contains(text(),'"+assignmentName+"')]/../parent::td//following-sibling::td[@class='submitted-col']/div[@class='submitted-inner']/div[@class='left-of-pipe ng-binding'][contains(text(),'"+submittedDate+"')]", asserters.isDisplayed, 60000)
;
    },

    getDueDate: function (browser, assignmentName) {
      return browser
          // .waitForElementByXPath("//td//a[contains(text(),'"+assignmentName+"')]/../parent::td//following-sibling::td[@class='submitted-col']/div[@class='submitted-inner']/div[@class='right-of-pipe due-col']", asserters.isDisplayed, 60000)
          // .text();
             .waitForElementByXPath("//td//a[contains(text(),'"+assignmentName+"')]/../parent::td//following-sibling::td[@class='submitted-col']//div[@class='right-of-pipe due-col']//div[@class='datefield ng-binding simple']", asserters.isDisplayed, 60000)
             .text();
    },

    editDueDate: function(browser, assignmentName){
    //   return browser
        //    .waitForElementByXPath("//table//tr//td//a[contains(text(),'" +assignmentName+ "')]//parent::div//parent::td//following-sibling::td[@class='submitted-col']//div[@class='right-of-pipe due-col']//div[@class='datefield ng-binding simple']", asserters.isDisplayed, 60000).then(function(dueDate){
        // .waitForElementByXPath("//table//tr//td//a[contains(text(),'" +assignmentName+ "')]/../parent::td//following-sibling::td[@class='submitted-col']//div[@class='submitted-inner']//div[@class='datefield ng-binding simple']", asserters.isDisplayed, 60000).then(function(dueDate){
          return browser
        //   .getLocationInView(dueDate)
          .sleep(1000)
          .waitForElementByXPath("//table//tr//td//a[contains(text(),'" +assignmentName+ "')]//parent::div//parent::td//following-sibling::td[@class='submitted-col']//div[@class='right-of-pipe due-col']//div[@class='datefield ng-binding simple']", asserters.isDisplayed, 60000)
          .click()
          .sleep(1000)
          .waitForElementByXPath("//table//tr//td//a[contains(text(),'" +assignmentName+ "')]//parent::div//parent::td//following-sibling::td[@class='submitted-col']//div[@class='right-of-pipe due-col']//div[@class='next']", asserters.isDisplayed, 60000)
          .click()
          .sleep(1000)
        //   .waitForElementByXPath("((//table//tr//td//a[contains(text(),'" +assignmentName+ "')]/../parent::td//following-sibling::td[@class='submitted-col']//div[@class='submitted-inner']//div[@class='week ng-scope'])[1]//div//span[contains(text(),'1')])[last()]", asserters.isDisplayed, 60000)
           .waitForElementByXPath("((//table//tr//td//a[contains(text(),'" +assignmentName+ "')]//parent::div//parent::td//following-sibling::td[@class='submitted-col']//div[@class='right-of-pipe due-col']//div[@class='week ng-scope'])[1]//div//span[contains(text(),'1')])[last()]", asserters.isDisplayed, 60000)
          .click();
        // });
    },

    dueDateValue: function(browser,assignmentName){
         return browser
         .sleep(5000)
       //  .waitForElementByXPath("//table//tr//td//a[contains(text(),'" +assignmentName+ "')]/../parent::td//following-sibling::td[@class='submitted-col']//div[@class='submitted-inner']//div[@class='datefield ng-binding simple']", asserters.isDisplayed, 60000)
         .waitForElementByXPath("//table//tr//td//a[contains(text(),'" +assignmentName+ "')]/../parent::td//following-sibling::td[contains(@class,'submitted-col')]//div[@class='right-of-pipe due-col']//div[@class='datefield ng-binding simple']", asserters.isDisplayed, 60000).then(function(dateValue){
            return browser
                .getLocationInView(dateValue)
                .sleep(2000)
                .waitForElementByXPath("//table//tr//td//a[contains(text(),'" +assignmentName+ "')]/../parent::td//following-sibling::td[contains(@class,'submitted-col')]//div[@class='right-of-pipe due-col']//div[@class='datefield ng-binding simple']", asserters.isDisplayed, 60000)
                .text();
         });

    //   return browser
    //   .sleep(4000)
    //   .waitForElementByXPath("//table//tr//td//a[contains(text(),'" +assignmentName+ "')]/../parent::td//following-sibling::td[contains(@class,'submitted-col')]//div[@class='right-of-pipe due-col']//div[@class='datefield ng-binding simple']", asserters.isDisplayed, 60000)
    //   .text();
    //   .waitForElementByXPath("//table//tr//td//a[contains(text(),'" +assignmentName+ "')]/../parent::td//following-sibling::td[@class='submitted-col']//div[@class='submitted-inner']//div[@class='datefield ng-binding simple']", asserters.isDisplayed, 60000)
    //   .text();
    },

    dueDateValueBeforeTakeAnyAttempt: function(browser,assignmentName){
    return browser
    .sleep(5000)
    .waitForElementByXPath("//table//tr//td//span[contains(text(),'" +assignmentName+ "')]/../parent::td//following-sibling::td[contains(@class,'submitted-col')]//div[@class='right-of-pipe due-col']//div[@class='datefield ng-binding simple']", asserters.isDisplayed, 60000).then(function(dateValue){
    return browser
        .getLocationInView(dateValue)
        .sleep(2000)
    //.waitForElementByXPath("//table//tr//td//span[contains(text(),'" +assignmentName+ "')]/../parent::td//following-sibling::td[@class='submitted-col']//div[@class='right-of-pipe due-col']//div[@class='datefield ng-binding simple']", asserters.isDisplayed, 60000)
      .waitForElementByXPath("//table//tr//td//span[contains(text(),'" +assignmentName+ "')]/../parent::td//following-sibling::td[contains(@class,'submitted-col')]//div[@class='right-of-pipe due-col']//div[@class='datefield ng-binding simple']", asserters.isDisplayed, 60000)
      .text();
      });
    //   return browser
    //   .sleep(5000)
    //   //.waitForElementByXPath("//table//tr//td//span[contains(text(),'" +assignmentName+ "')]/../parent::td//following-sibling::td[@class='submitted-col']//div[@class='right-of-pipe due-col']//div[@class='datefield ng-binding simple']", asserters.isDisplayed, 60000)
    //   .waitForElementByXPath("//table//tr//td//span[contains(text(),'" +assignmentName+ "')]/../parent::td//following-sibling::td[contains(@class,'submitted-col')]//div[@class='right-of-pipe due-col']//div[@class='datefield ng-binding simple']", asserters.isDisplayed, 60000)
    //   .text();
    },

    getStudentName : function(browser,name){
      return browser
          .waitForElementByCss(".student-name.ng-binding", asserters.isDisplayed, 60000)
          .text().should.eventually.include(name);
    },
    errorFlashHideStatus: function (browser){
      return browser
        .hasElementByCss(".flash-alert.error-alert.ng-hide");
    },

    editDueDateBeforeTakeAnyAttempt: function(browser, assignmentName){
         return browser
           //.waitForElementByXPath("//table//tr//td//a[contains(text(),'" +assignmentName+ "')]/../parent::td//following-sibling::td[@class='submitted-col']//div[@class='submitted-inner']//div[@class='datefield ng-binding simple']", asserters.isDisplayed, 60000)
           .waitForElementByXPath("//table//tr//td//span[contains(text(),'" +assignmentName+ "')]/../parent::td//following-sibling::td[@class='submitted-col']//div[@class='datefield ng-binding simple']", asserters.isDisplayed, 60000)
           .click()
           .sleep(1000)
           .waitForElementByXPath("//table//tr//td//span[contains(text(),'" +assignmentName+ "')]/../parent::td//following-sibling::td[@class='submitted-col']//div[@class='next']", asserters.isDisplayed, 60000)
           .click()
           .sleep(1000)
           //.waitForElementByXPath("((//table//tr//td//a[contains(text(),'" +assignmentName+ "')]/../parent::td//following-sibling::td[@class='submitted-col']//div[@class='submitted-inner']//div[@class='week ng-scope'])[1]//div//span[contains(text(),'1')])[last()]", asserters.isDisplayed, 60000)
             .waitForElementByXPath("((//table//tr//td//span[contains(text(),'" +assignmentName+ "')]/../parent::td//following-sibling::td[@class='submitted-col']//div[@class='week ng-scope'])[1]//div//span[contains(text(),'1')])[last()]", asserters.isDisplayed, 60000)
           .click();
    //   return browser
    //     //.waitForElementByXPath("//table//tr//td//a[contains(text(),'" +assignmentName+ "')]/../parent::td//following-sibling::td[@class='submitted-col']//div[@class='submitted-inner']//div[@class='datefield ng-binding simple']", asserters.isDisplayed, 60000)
    //     .waitForElementByXPath("//table//tr//td//a[contains(text(),'" +assignmentName+ "')]/../parent::td//following-sibling::td[@class='submitted-col']//div[@class='right-of-pipe due-col']//div[@class='datefield ng-binding simple']", asserters.isDisplayed, 60000)
    //     .click()
    //     .sleep(1000)
    //     .waitForElementByXPath("//table//tr//td//a[contains(text(),'" +assignmentName+ "')]/../parent::td//following-sibling::td[@class='submitted-col']//div[@class='right-of-pipe due-col']//div[@class='next']", asserters.isDisplayed, 60000)
    //     .click()
    //     .sleep(1000)
    //     //.waitForElementByXPath("((//table//tr//td//a[contains(text(),'" +assignmentName+ "')]/../parent::td//following-sibling::td[@class='submitted-col']//div[@class='submitted-inner']//div[@class='week ng-scope'])[1]//div//span[contains(text(),'1')])[last()]", asserters.isDisplayed, 60000)
    //       .waitForElementByXPath("((//table//tr//td//a[contains(text(),'" +assignmentName+ "')]/../parent::td//following-sibling::td[@class='submitted-col']//div[@class='right-of-pipe due-col']//div[@class='week ng-scope'])[1]//div//span[contains(text(),'1')])[last()]", asserters.isDisplayed, 60000)
    //     .click();
    },

    verifyToolTipPresentAtStudentGradebook: function (browser) {
         return browser
             .execute("return getComputedStyle(document.querySelector('.student-gradebook table td.overridden-by-instructor'),'::after').getPropertyValue('border-right-color')");
     },
     verifyTilteOnToolTip: function(browser){
       return browser
       .sleep(1000)
       .waitForElementByCss(".submitted-col.overridden-by-instructor", asserters.isDisplayed, 60000);
     },

    verifyToolTipPresent: function (browser) {
         return browser
             .execute("return   getComputedStyle(document.querySelector('.student-detail table td.overridden-by-instructor'),'::after').getPropertyValue('border-right-color')");
     },

    editDueDateTOCurrentDate: function(browser, assignmentName){
        return browser
          .waitForElementByXPath("//table//tr//td//span[contains(text(),'" +assignmentName+ "')]/../parent::td//following-sibling::td[contains(@class,'submitted-col')]//div[@class='right-of-pipe due-col']//div[@class='datefield ng-binding simple']", asserters.isDisplayed, 60000)
          .click()
          .sleep(1000)
          .waitForElementByXPath("//table//tr//td//span[contains(text(),'" +assignmentName+ "')]/../parent::td//following-sibling::td[contains(@class,'submitted-col')]//div[@class='right-of-pipe due-col']//div[@class='previous']", asserters.isDisplayed, 60000)
          .click()
          .sleep(1000)
          .waitForElementByXPath("//div[@class='day ng-scope today']", asserters.isDisplayed, 60000)
          .click();
      },

       assignmentNameClickableStatus: function(browser, assignmentName){
         return browser
             .sleep(2000)
             .hasElementByXPath("//td//a[contains(text(),'"+assignmentName+"')]");
       }
};
