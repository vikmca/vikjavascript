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
    checkEula: function(browser) {
      return browser
        .hasElementByCss(".read-terms-start-modal.ng-scope");
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
        // .waitForElementByCss("#breadcrumbs>a[href='mydashboard.htm']", asserters.isDisplayed, 40000)
        // .click();
          .execute("return document.evaluate(\"//a[contains(@data-track,'Instructor Resource Center - Instructor SSO')]\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()");
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
          .waitForElementByXPath("//div[contains(@class,'navigation-menu-button')]", asserters.isDisplayed, 120000)
          .click()
          .sleep(2000)
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
    CheckActiveLocatorOnWeb: function(browser){
      return browser
      .waitForElementByCss("ul li[class='ng-isolate-scope active']", asserters.isDisplayed, 90000);
    },
    clickOnMenu: function(browser){
      return browser
      .sleep(1000)
      .waitForElementByXPath("//div[contains(@class,'navigation-menu-button')]", asserters.isDisplayed, 120000)
      .click();
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
    }
};
