var wd = require('wd');
var string = require('../../../../util/stringUtil');
var report = require("../../../../support/reporting/reportgenerator");
var asserters = wd.asserters;
module.exports = {
    clickOnCurrentDate: function (browser) {
        return  browser
            .elementByCssSelectorWhenReady(".day.ng-scope.today",asserters.isDisplayed, 20000)
            .click();
    },
    waitElementByCSS: function(browser, element){
      return  browser
          .waitForElementByCss(element,asserters.isDisplayed, 20000)
    },


    waitElementByXpath: function(browser, element){
      return  browser
          .waitForElementByXPath(element, asserters.isDisplayed, 20000)
    },
    returnElementTextByXPath: function(browser, element){
      return  browser
          .waitForElementByXPath(element, asserters.isDisplayed, 20000)
          .text();
    },
    returnElementTextByCss: function(browser, element){
      return  browser
          .waitForElementByCss(element,asserters.isDisplayed, 20000)
          .text();
    },

    clickOnElementByXPath: function(browser, element){
      return browser
        .waitForElementByXPath(element, asserters.isDisplayed, 20000)
        .click();
    },
    documentState :function(browser){
      return browser
        .hasElementByCss("cg-loading");
    },
    navigateToInstructorDashboard : function(browser){
      return browser
        .waitForElementByCss("#breadcrumbs>a[href='mydashboard.htm']", asserters.isDisplayed, 40000)
        .click()
        .sleep(1000);
    },
    deleteFlashOnLoginPage : function(browser){
      return browser
          .hasElementByCss(".scroller", 30000).then(function (scrollelement) {
              console.log("scrollbox present " + scrollelement);
              if (scrollelement) {
                  return browser
                      .waitForElementByCss(".closeBtn", asserters.isDisplayed, 20000)
                      .click();
              }
          });
    },
    validatePresenceOfInstructorMenuItem: function(browser){
      return browser
          .waitForElementByCss(".manage-dropdown .dropdown-link", asserters.isDisplayed, 20000)
          .text();
    },
    studentAccessVerification : function(browser, validationURL, current){
      return  browser
        .url().then(function(webpage){
            var endPoint= string.returnStringIndex(webpage,current);
            var urlwithoutextension = string.returnSubstring(webpage,0,endPoint);
            return browser
              .get(urlwithoutextension+validationURL);

      });
    },

    checkEula: function(browser) {
      return browser
        .hasElementByCss(".read-terms-start-modal.ng-scope");
    },

    getTitleOfPage: function(browser){
      return browser
           .sleep(2000)
           .title();
    },
    getSectionName: function(browser){
        return browser
            .waitForElementByCss("li #course-name div", asserters.isDisplayed, 20000);
    },

    getUrl:function(browser){
        return browser.url();
    },

    getUrl:function(browser){
        return browser.url();
    }
};
