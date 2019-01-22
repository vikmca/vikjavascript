var wd = require('wd');
var asserters = wd.asserters;

module.exports = {
    countPreexistingStudyBitCounts: function (browser, chapter) {
        browser.execute("return document.evaluate(\"count(//div[@chapters='chapters']//div/h1[contains(text(),'Chapter 1: ')]//following-sibling::div[1]/div[2]//div[@class='studybits']/div[@class='studybit-count '])\", document, null, XPathResult.ANY_TYPE, null ).numberValue")
            .text();
    },

    verifyIfPreexistingStudyBitCountsExistsAndRetrieveIt: function (browser, chapter) {
        return  browser.execute("return document.evaluate(\"count(//div[@chapters='chapters']//div/h1[contains(text(),'Chapter 1: ')]//following-sibling::div[1]/div[2]//div[@class='studybits']/div[@class='studybit-count '])\", document, null, XPathResult.ANY_TYPE, null ).numberValue");
    },

    isConceptTrackerLoaded: function (browser) {
        return browser.waitForElementByCss(".concept-tracker.ng-scope header", asserters.isDisplayed, 60000).elementByCssSelector(".concept-tracker.ng-scope header h1");
    },

    getChapterName: function (browser, chapter) {
        return browser.waitForElementByXPath("(//div[@class='chart-container ng-scope'])//h1[contains(text(),'"+chapter+"')]", asserters.isDisplayed, 60000).text();
    },

    verifyVideoLabelsForSpecificChapter: function (browser, chapter) {
        return  browser
        .waitForElementByCss("div[class='concept-tracker ng-scope']", asserters.isDisplayed, 60000).then(function () {
          return  browser
          .hasElementByXPath("(//div[@class='chart-container ng-scope'])[1]//h1[contains(text(),'Chapter "+chapter+"')]//parent::div//div[@class='videos']");
      });
    },

    verifyMediaLabelVideo: function (browser, chapter , mediaLabel1, mediaLabel2, mediaLabel3, mediaLabel4){
      return browser
        .waitForElementByXPath("((//div[@class='chart-container ng-scope'])//h1[contains(text(),'"+chapter+"')])/parent::div//div[@class='overview-columns']//div[contains(@class,'overview-media')]//div//p", asserters.isDisplayed, 60000)
        .text()
        .should.eventually.include(mediaLabel1)
        .waitForElementByXPath("((((//div[@class='chart-container ng-scope'])//h1[contains(text(),'"+chapter+"')])/parent::div//div[@class='overview-columns']//div[contains(@class,'overview-media')]//div//div[@class='summary'])[1]//span)[2]", asserters.isDisplayed, 60000)
        .text()
        .should.eventually.include(mediaLabel2)
        .waitForElementByXPath("((((//div[@class='chart-container ng-scope'])//h1[contains(text(),'"+chapter+"')])/parent::div//div[@class='overview-columns']//div[contains(@class,'overview-media')]//div//div[@class='summary'])[2]//span)[2]", asserters.isDisplayed, 60000)
        .text()
        .should.eventually.include(mediaLabel2)
        .waitForElementByXPath("((((//div[@class='chart-container ng-scope'])//h1[contains(text(),'"+chapter+"')])/parent::div//div[@class='overview-columns']//div[contains(@class,'overview-media')]//div//div[@class='summary'])[3]//span)[2]", asserters.isDisplayed, 60000)
        .text()
        .should.eventually.include(mediaLabel4);
    },

    getValueVideoViewed: function (browser, chapter, index) {
        return browser
        .waitForElementByXPath("((((//div[@class='chart-container ng-scope'])//h1[contains(text(),'"+chapter+"')])/parent::div//div[@class='overview-columns']//div[contains(@class,'overview-media')]//div//div[@class='summary'])["+index+"]//span)[1]", asserters.isDisplayed, 60000).text();
    }
};
