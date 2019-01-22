/**
 * Created by nbalasundaram on 10/1/15.
 */

var productData = require("../../../../../../test_data/products.json");
var stringutil = require("../../../../util/stringUtil");

var wd = require('wd');
var asserters = wd.asserters;


module.exports = {

  scrollToAChapter: function (chapter, browser) {
      return browser
          .waitForElementByCss(this.constructChapterTileCss(chapter), asserters.isDisplayed, 90000).then(function(scroll){
            return browser
            .getLocationInView(scroll)
            .execute("window.scrollBy(0,-140)");
          });
  },

    navigateToAChapter: function (chapter, browser) {
        return browser
            .waitForElementByCss(this.constructChapterTileCss(chapter), asserters.isDisplayed, 90000)
            .click();


    },

    navigateToAChapterThroughListView: function (chapter, browser) {
        return browser
            .waitForElementByCss(this.constructChapterListCss(chapter), asserters.isDisplayed, 90000)
            .click();

    },

    navigateToSlidingToc: function (browser) {
        return browser
        .waitForElementByCss(".sliding-menu-button.ng-scope", asserters.isDisplayed, 5000)
        .click()
        .sleep(2000)
        .waitForElementByCss(".sliding-menu-content.is-visible", asserters.isDisplayed, 5000)
        .waitForElementByCss(".sliding-menu-content.is-visible h2", asserters.isDisplayed, 5000);

    },

    getFirstChapterTitleUnderToc: function (browser) {
        return browser
        .waitForElementByCss(".sliding-menu-content ul li:nth-child(1)", asserters.isDisplayed, 5000)
        .waitForElementByCss(".sliding-menu-content ul li:nth-child(1) a[class='menu-chapter']", asserters.isDisplayed, 5000);

    },

    validateTopicsOnChapterFirstUnderToc: function (browser,count) {
        return browser
      .waitForElementByCss(".sliding-menu-content ul li:nth-child(1) div:nth-child("+count+") a:nth-child(1)", asserters.isDisplayed, 5000);

    },

    getListFromToc: function (browser) {
        return browser
      .waitForElementsByCssSelector(".sliding-menu-content.is-visible", asserters.isDisplayed, 60000);

    },

    clickOnFirstTopicUnderToc: function (browser) {
        return browser
        .waitForElementByCss(".sliding-menu-content ul li:nth-child(1) div:nth-child(2) a:nth-child(1)", asserters.isDisplayed, 5000)
        .click();

    },

    fetchTextFromChapterIntroduction: function (browser) {
        return browser
          .waitForElementByCss(".topic-title span h1", asserters.isDisplayed, 60000);

    },


    getChapterTitle: function (chapter, browser) {
        return browser
            .waitForElementByCss(this.constructChapterTileCss(chapter), asserters.isDisplayed, 120000)
            .text();

    },

    navigateToATopic: function (chapter, topic, browser) {
        return browser
            .waitForElementByCss(this.constructTopicLinkCss(chapter, topic), asserters.isDisplayed, 90000)
            .click();
    },

    tocImageIcon: function (browser) {
        return browser
        .execute("return getComputedStyle(document.querySelector('.nav-background button:first-child')).getPropertyValue('background-image')");
    },

    readerSpeakerImageIcon: function (browser) {
        return browser
        .execute("return getComputedStyle(document.querySelector('#readspeaker')).getPropertyValue('background-image')");
    },

    navigateToToc: function (browser) {
        return browser
            .waitForElementByCss("li[cg-activates-with='reader'] a[ng-if='currentProduct']", asserters.isDisplayed, 90000)
            .click();
    },


    getTopicTitleHero: function (browser) {
        return browser
          .waitForElementByCss("span.chapter-title h1", asserters.isDisplayed, 90000).text();
    },

    constructChapterTileCss: function (chapterid) {
        var id = chapterid + 1;
        return "ul.chapters.tile li.chapter:nth-child(" + id + ") section h3 a";
    },

    constructChapterListCss: function (chapterid) {
        var id = chapterid + 1;
        return "ul.chapters.list li.chapter:nth-child(" + id + ") section h3 a";
    },

    constructTopicLinkCss: function (chapterid, topicid) {
        topicid = topicid + 1;
        return "ul.chapters.tile li.banner:nth-child(1) ul.topics-list li:nth-child(" + topicid + ") a";

    },

    disposeFirstVisitTopicModalIfVisible: function (browser) {
        return browser
            .execute("setTimeout(function(){if(document.getElementById('highlight-help-modal').getAttribute('class').indexOf('ng-hide') == -1)document.getElementsByClassName('icon-close-x-pink')[0].click();},3000)");

    },
    getChapterTitleonListView: function (chapter, browser, chapterno) {
        return browser
            .waitForElementByXPath(this.constructChapterTileCssonListView(chapter, chapterno), asserters.isDisplayed, 120000)
            .text();
    },
    constructChapterTileCssonListView: function (chapterid, chapterno) {
        return "(//li[@class='chapter ng-scope'])["+chapterno+"]//a[@class='chapter-title ng-binding']";
    },
    navigateToAChapterByListView: function (chapter, browser, chapterno) {
      var id = chapterno;
        return browser
                .waitForElementByXPath(this.constructChapterTileCssonListView(chapter, chapterno), asserters.isDisplayed, 90000).then(function(chapter){
                  return browser
                  .getLocationInView(chapter)
                  .execute("window.scrollBy(0,-140)")
                  .then(function(){
                    chapter.click();
                  });

                });
    },

    selectListView: function(browser){
      return browser
          .execute("window.scrollTo(0,0)")
          .sleep(1000)
          .waitForElementByCss(".icon-list-gray", asserters.isDisplayed, 60000)
          .click();
    },

    navigateToATopicByListView: function (browser, done, topic, topicno) {
        return browser
            .waitForElementByCss(this.constructTopicLinkCssForListView(topic, topicno), asserters.isDisplayed, 90000).then(function(topic){
              return browser
              .getLocationInView(topic)
              .execute("window.scrollBy(0,-140)")
              .then(function(){
                topic.click().then(function(){
                    done();
                });
              });
            });
    },
    constructTopicLinkCssForListView: function (topicid, topicno) {
        topicid = topicid + topicno;
        return ".chapter.ng-scope.selected ul[class='topics-list'] li:nth-child(" + topicid + ") a";

    },
    clickonlistview: function (browser, done) {
        return browser
            .waitForElementByCss('.icon-list-gray', asserters.isDisplayed, 3000).then(function (listview) {
              return browser
              .getLocationInView(listview)
              .execute("window.scrollBy(0,-140)").then(function(){
                return browser
                .waitForElementByCss('.icon-list-gray', asserters.isDisplayed, 3000)
                .click()
                .nodeify(done);
              });
            });
    },

    validateThePresenceOfVideoLinksOnTOC: function(browser) {
      return browser
      .elementByXPathIfExists("(//a[contains(@class,'menu-topic menu-video')])[1]")
      .getAttribute('href');
    },
    clickOnVideoLink : function(browser){
      return browser
      .elementByXPathIfExists("(//a[contains(@class,'menu-topic menu-video')])[1]")
      .click();
    },
    selectAFeaturedItem : function(browser,featureitem,done){
      if(stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString())==="safari"){
       browser
        .waitForElementByXPath("((//ul[@class='featured-items']//li)/a//span[contains(@class,'video-featured-icon')])[1]",asserters.isDisplayed, 30000).click()
        .nodeify(done);
      }else {
        browser
          .waitForElementsByCssSelector("li[class='banner ng-scope'] .featured-items .ng-scope.video",asserters.isDisplayed, 3000).then(function(elements){
            elements[0].click().nodeify(done);
          });
      }
    },
    clickOnChapterTileCssGrid: function (browser, chapterno, done) {
        return browser
         .waitForElementsByCssSelector("(//li[@class='chapter ng-scope'])["+chapterno+"]//a[@class='chapter-title ng-binding']",asserters.isDisplayed, 3000)
         .click()
         .nodeify(done);
    },
    navigateToNextTopic : function(browser,done){
      return browser
      .execute("window.scrollTo(0,0)")
      .waitForElementsByCssSelector('.icon-right-arrow-white', asserters.isDisplayed, 60000).then(function (arrowElements) {
          arrowElements[0].elementByCssSelector(".ng-isolate-scope").then(function (subElement) {
              subElement.elementByCssSelector("a[rel='next']").then(function (arrowLinkElement) {
                  arrowLinkElement.click();
                  return  browser
                    .waitForElementByCss(".topic-title span", asserters.isDisplayed, 60000)
                    .nodeify(done);
                });
              });
            });
    },
    navigateToChapterReview : function(browser,place,done){
      return browser
      .waitForElementByCss("ul.chapters.tile li.banner:nth-child(1) ul.topics-list li:nth-child("+place+") a span")
      .click()
      .nodeify(done);
    },

    getChaptersCountOnGridView : function(browser){
      return browser
      .waitForElementsByCss(".chapter.ng-scope", asserters.isDisplayed, 5000);

    },
    clickOnTOC : function(browser){
      return browser
      .waitForElementByCss(".sliding-menu-button.ng-scope", asserters.isDisplayed, 5000)
      .click()
      .sleep(1000);
    },

    clickVideoOnTOC : function(browser,videoId){
      if(stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString()) === "ORGB5"){
           return browser
           .waitForElementByCss(".sliding-menu-content ul li:nth-child(1) div:nth-child(8) a:nth-child(2)", asserters.isDisplayed, 5000)
           .click()
           .sleep(2000)
           .waitForElementByCss(videoId, asserters.isDisplayed, 5000);
        }else if(stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString()) === "COMM4"){
             return browser
             .waitForElementByCss(".sliding-menu-content ul li:nth-child(3) div:nth-child(5) a:nth-child(2)", asserters.isDisplayed, 5000)
             .click()
             .sleep(2000)
             .waitForElementByCss(videoId, asserters.isDisplayed, 5000);
          }else{
          return browser
          .waitForElementByCss(".sliding-menu-content ul li:nth-child(1) div:nth-child(5) a:nth-child(2)", asserters.isDisplayed, 5000)
          .click()
          .sleep(2000)
          .waitForElementByCss(videoId, asserters.isDisplayed, 5000);
        }
    },
    getChapterName: function(browser){
      return browser
      .waitForElementByXPath("(//li[@class='banner ng-scope'])[1]//a[@class='chapter-title ng-binding']", asserters.isDisplayed, 10000);
    },

    getChapterNumber: function(browser){
      return browser
      .waitForElementByXPath("//li[@class='banner ng-scope']//figure//span", asserters.isDisplayed, 10000);
    },

    verifyChapterExpanded: function(browser){
      return browser
        .hasElementByCss(".chapter.selected");
    },

    clickOnTilesView: function(browser){
      return browser
      .waitForElementByCss(".icon-tile-gray", asserters.isDisplayed, 10000)
      .click();
    },

    previousArrowButtonOnFirstTopic: function (browser) {
      return browser
      .hasElementByCss(".icon-left-arrow-white.ng-hide");
    },

    nextArrowButtonOnLastTopic: function (browser) {
    if(stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString())==="PFIN6"){
      return browser
        .hasElementByCss(".icon-right-arrow-white");
      }else{
        return browser
        .hasElementByCss(".icon-right-arrow-white.ng-hide");
      }
    },

    previousButtonOnFirstTopic: function (browser) {
      return browser
      .hasElementByCss(".ng-isolate-scope.ng-hide");
    },

    nextButtonOnLastTopic: function (browser) {
      if(stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString())==="PFIN6"){
        return browser
        .hasElementByCss(".ng-isolate-scope");
        }else{
          return browser
          .hasElementByCss(".ng-isolate-scope.ng-hide");
        }
    },

    clickOnLastTopicUnderToc: function (browser) {
      if(stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString())==="PFIN6"){
        return browser
          .waitForElementByXPath("((//a[contains(@class,'menu-chapter')])[15]//parent::li//a[contains(@class,'menu-topic')])[last()]", asserters.isDisplayed, 10000).then(function(lastTopcUnderToc){
            return browser
              .getLocationInView(lastTopcUnderToc)
              .sleep(2000)
              .waitForElementByXPath("((//a[contains(@class,'menu-chapter')])[15]//parent::li//a[contains(@class,'menu-topic')])[last()]", asserters.isDisplayed, 10000)
              .click();
          });
      }else{
        return browser
          .waitForElementByXPath("(//a[contains(@class,'menu-topic')])[last()]", asserters.isDisplayed, 10000).then(function(lastTopcUnderToc){
            return browser
              .getLocationInView(lastTopcUnderToc)
              .sleep(2000)
              .waitForElementByXPath("(//a[contains(@class,'menu-topic')])[last()]", asserters.isDisplayed, 10000)
              .click();
          });
      }
    },

    navigateToMenu: function (browser, done){
      return browser
        .waitForElementByXPath("//ul[@id='navigation-menu']/li[1]/a", asserters.isDisplayed, 30000)
        .click()
        .nodeify(done);
    },

    // clickOnListView: function (browser, done){
    //   return browser
    //     .waitForElementByCss(".icon-list-gray", asserters.isDisplayed, 30000).click()
    //     .nodeify(done);
    // },
    clickOn1stFeaturedItem: function (browser, done){
      return browser
        .waitForElementByXPath("(//li[@class='chapter ng-scope selected']//ul[@class='featured-items']//li)[1]//a/div//img", asserters.isDisplayed, 30000)
        .click()
        .sleep(2000)
        .waitForElementByCss("a.icon-close-x", asserters.isDisplayed, 30000)
        .click()
        .nodeify(done);
    },

    getTextOfTopcName: function (browser) {
        return browser
          .waitForElementByCss(".topic-title span h1", asserters.isDisplayed, 60000).text();
    },

    navigateToTopic : function(browser, chapter, topic){
      var topics = topic+1;
      return browser
        .sleep(1000)
        .execute("return (document.evaluate(\"(((//nav[@class='sliding-menu-content is-visible']//li)["+chapter+"]//div[contains(@ng-repeat,'topic')]//a[contains(@class,'menu-topic')]//parent::div)["+topics+"]//a[contains(@class,'menu-topic')])[1]\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue).scrollIntoView()")
        .sleep(2000)
        .waitForElementByXPath("(((//nav[@class='sliding-menu-content is-visible']//li)["+chapter+"]//div[contains(@ng-repeat,'topic')]//a[contains(@class,'menu-topic')]//parent::div)["+topics+"]//a[contains(@class,'menu-topic')])[1]", asserters.isDisplayed, 60000)
        .click();
    }

};
