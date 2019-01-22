var wd = require('wd');
var asserters = wd.asserters;
module.exports = {
    clickOnAddAdditionalInstructorOrTA: function (browser) {
        return  browser
            // .waitForElementByCss(".linkAddInstructor",asserters.isDisplayed, 20000)
            // .click();
            .execute("return document.evaluate(\"//a[text()='Add Additional Instructor or TA']\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()");
    },
    getPrimaryInstructorName: function (browser) {
      return  browser
          .waitForElementByCss("#primaryInstructor>tbody>tr>td>span",asserters.isDisplayed, 20000)
          .text();
    },
    enterAdditionalInstructorName: function (browser, promaryuser) {
      return  browser
          .waitForElementByXPath("//input[@name='instructorEmail']",asserters.isDisplayed, 20000)
          .type(promaryuser);
    },
    clickOnAddButton: function (browser) {
      return  browser
          // .waitForElementByCss("//input[@id='AddButton']",asserters.isDisplayed, 20000)
          // .click()
            .execute("return document.evaluate(\"//input[@id='AddButton']\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()")
            .sleep(2000);
    },
    validateErrorMessageOnPage: function (browser) {
      return  browser
          .waitForElementByCss("#existingUser>span",asserters.isDisplayed, 20000)
          .text();
    },
    clearTheTextBox: function (browser) {
      return  browser
          .waitForElementByCss("#instructorEmail",asserters.isDisplayed, 20000)
          .clear();
    },
    deleteTAstudent: function (browser) {
      return  browser
          .waitForElementByCss(".linkDeleteInstructor",asserters.isDisplayed, 20000)
          .click();
    },
    verifyPresesnceOfTACourseOnManageMyCourse: function(browser, courseName){
      return  browser
        .hasElementByXPath("//td[contains(.,'" + courseName + "')]/following-sibling::td/a[contains(@title,'Delete Course')]",60000).then(function(coursePresenceStatus){
          return coursePresenceStatus;
        });
    },
    clickOnSaveButton: function (browser) {
      return  browser
          .execute("return document.evaluate(\"//div[@class='btns_lt']/a[@class='button']\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()");
    }

};
