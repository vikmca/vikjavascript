var wd = require('wd');

var asserters = wd.asserters;
module.exports = {

    openSearchControl: function (browser) {
        return browser
            .waitForElementByCss("#search-form .label", asserters.isDisplayed, 60000).click();
    },

    enterTheSearchTerm: function (browser, keyword) {
        return browser
            .waitForElementByCss("#search-form .input input", asserters.isDisplayed, 3000)
            .type(keyword)
            .type(wd.SPECIAL_KEYS.Enter)
            .waitForElementByCss(".search-results.ng-scope header h1", asserters.isDisplayed, 60000)
            .sleep(10000);

    },

    getResultsCount: function (browser) {
        return browser.waitForElementByCss(".search-results.ng-scope header h1", asserters.isDisplayed, 60000)
    },

    selectAResult: function (browser, index) {
        return browser.waitForElementByCss("div.search-results div:nth-child(" + index + ") div div a", asserters.isDisplayed, 60000)
            .text();
    },

    scrollToSearchResultsBottom: function (browser) {
      return browser
        .waitForElementsByCss(".copyright-labels.ng-scope", asserters.isDisplayed, 30000).then(function(footer){
          return browser
            .getLocationInView(footer)
            .sleep(2000);
        });
    },
    getSearchTextOnConceptTracker : function(browser){
      return browser
           .waitForElementByXPath("(//div[contains(@class,'chart-container ng-scope')])[1]//div[contains(@class,'chartjs ng-scope')][1]//div[1]//h3[contains(@class,'chartjs-title ng-binding')]", asserters.isDisplayed, 10000);
    },
    getSearchResultText : function(browser){
      return browser
        .waitForElementByCss(".container.ng-scope header h1 span", asserters.isDisplayed, 10000);
    },
    clickOnSearchedTopic : function(browser){
      return browser
          .waitForElementByCss(".search-results.ng-scope div:nth-child(1) div a", asserters.isDisplayed, 10000)
          .click();
    },
    verifySearchResultWithInNarrative : function(browser){
      return browser
      .waitForElementByCss("section.chapter-hero h1", asserters.isDisplayed, 10000);
    },

    closeSearchPanel: function (browser) {
      return browser
        .waitForElementByCss(".input .close", asserters.isDisplayed, 10000)
        .click();
    },

    validateSearchPanelIsActive: function (browser) {
      return browser
        .waitForElementByCss(".search.active", asserters.isDisplayed, 10000);
    },

    getTextFromSearchBox: function (browser) {
      return browser
        .execute("return document.getElementById(\"search-field\").value")
    }


};
