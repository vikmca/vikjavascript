/**
 * Created by nbalasundaram on 10/1/15.
 */

var productData = require("../../../../../../test_data/products.json");
var stringutil = require("../../../../util/stringUtil");
var basicpo =  require("./basicpo");
var wd = require('wd');
var asserters = wd.asserters;


module.exports = {


    navigateToAChapter: function (chapter, browser) {
        return browser
            .waitForElementByCss(this.constructChapterTileCss(chapter), asserters.isDisplayed, 90000)
            .click();

    },
    tocImageIcon: function (browser) {
        return browser
        .execute("return getComputedStyle(document.querySelector('.nav-background button:first-child')).getPropertyValue('background-image')");
    },

    scrollToAChapter: function (chapter, browser) {
        return browser
            .waitForElementByCss(this.constructChapterTileCss(chapter), asserters.isDisplayed, 90000).then(function(scroll){
              return browser
              .getLocationInView(scroll)
              .execute("window.scrollBy(0,-140)");
            });
    },
    previousArrowButtonOnFirstTopic: function (browser) {
      return browser
      .hasElementByCss(".icon-left-arrow-white.ng-hide");
    },

    previousButtonOnFirstTopic: function (browser) {
      return browser
      .hasElementByCss(".ng-isolate-scope.ng-hide");
    },

    clickOnLastTopicUnderToc: function (browser) {
      return browser
        .waitForElementByXPath("(//a[contains(@class,'menu-topic')])[last()]", asserters.isDisplayed, 10000).then(function(lastTopcUnderToc){
          return browser
            .getLocationInView(lastTopcUnderToc)
            .sleep(2000)
            .waitForElementByXPath("(//a[contains(@class,'menu-topic')])[last()]", asserters.isDisplayed, 10000)
            .click();
        });
    },

    nextArrowButtonOnLastTopic: function (browser) {
      return browser
      .hasElementByCss(".icon-right-arrow-white.ng-hide");
    },

    nextButtonOnLastTopic: function (browser) {
      return browser
      .hasElementByCss(".ng-isolate-scope.ng-hide");
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

    navigateToToc: function (browser) {
        basicpo.clickOnMenu(browser);
          return browser
              .sleep(2000)
              .waitForElementByCss("li[cg-activates-with='reader'] a[ng-if='currentProduct']", asserters.isDisplayed, 90000)
              .click();
    },


    getTopicTitleHero: function (browser) {
        return browser
          .waitForElementByCss("span.chapter-title", asserters.isDisplayed, 90000).text();
    },

    constructChapterTileCss: function (chapterid) {
        var id = chapterid + 1;
      //  return "ul.chapters.tile li.chapter:nth-child(" + id + ") section h3 a";
          return      "ul.chapters li.chapter:nth-child(" + id + ") section h3 a";
    },

    constructTopicLinkCss: function (chapterid, topicid) {
        topicid = topicid + 1;
          return ".chapter.ng-scope.selected ul.topics-list li:nth-child(" + topicid + ") a";
    },

    disposeFirstVisitTopicModalIfVisible: function (browser) {
        return browser
            .execute("setTimeout(function(){if(document.getElementById('highlight-help-modal').getAttribute('class').indexOf('ng-hide') == -1)document.getElementsByClassName('icon-close-x-pink')[0].click();},3000)");

    },
    getChapterTitleonListView: function (chapter, browser, chapterno) {
        console.log(chapterno);
        var chapternos= chapterno-1;
        console.log(chapternos);
        return browser
                .sleep(3000)
            // .waitForElementByXPath("(//li[@class='chapter ng-scope'])["+chapterno+"]//a[@class='chapter-title ng-binding']", asserters.isDisplayed, 120000)
            // .text();
            .execute("return document.getElementsByClassName('chapter')["+chapternos+"].getElementsByClassName('chapter-title')[0].textContent");
    },
    constructChapterTileCssonListView: function (chapterid, chapterno) {
        return "(//li[@class='chapter ng-scope'])["+chapterno+"]//a[@class='chapter-title ng-binding']";
    },
    navigateToAChapterByListView: function (chapter, browser, chapterno) {
      var id = chapterno-1;
        return browser
                .waitForElementByXPath("(//li[@class='chapter ng-scope'])["+chapterno+"]//a[@class='chapter-title ng-binding']", asserters.isDisplayed, 90000).then(function(chapters){
                  return browser
                  .getLocationInView(chapters)
                  .execute("window.scrollBy(0,-140)")
                  .then(function(){
                    return browser
                        .execute("return document.getElementsByClassName('chapter')["+id+"].getElementsByClassName('chapter-title')[0].click()");
                        // .waitForElementByXPath("(//li[@class='chapter ng-scope'])["+chapterno+"]//a[@class='chapter-title ng-binding']", asserters.isDisplayed, 90000).click();
                  });

                });
    },

    selectListView: function(browser){
      return browser
        .sleep(1000)
        .execute("window.scrollTo(0,0)")
        .sleep(1000)
        .hasElementByCss(".list.selected").then(function(listViewStatus){
          console.log("calendarViewStatus"+listViewStatus);
          if(!listViewStatus){
            return browser
                .waitForElementByCss(".icon-list-gray", asserters.isDisplayed, 60000)
                .click();
          }else {
            return browser
                .waitForElementByCss(".icon-list-white", asserters.isDisplayed, 60000);
          }
        });
    },

    tileView: function(browser){
      return browser
        .waitForElementByCss(".icon-list-gray", asserters.isDisplayed, 60000)
        .click();
    },
    selectTileView: function(browser){
      return browser
        .execute("window.scrollTo(0,0)")
        .sleep(3000)
        .hasElementByCss(".calendar.selected").then(function(calendarViewStatus){
          if(!calendarViewStatus){
            return browser
                .waitForElementByCss(".icon-calendar-gray", asserters.isDisplayed, 60000)
                .click();
          }else {
            return browser
                .waitForElementByCss(".icon-calendar-white", asserters.isDisplayed, 60000);
          }
        });
          // .execute("return document.getElementsByClassName('icon-calendar-gray')[0].click()");
    },

    navigateToATopicByListView: function (browser, done, topic, topicno) {
        var topicid = topic + topicno;
        return browser
            .sleep(2000)
            .waitForElementByCss(".chapter.ng-scope.selected ul[class='topics-list'] li:nth-child(" + topicid + ") a", asserters.isDisplayed, 90000).then(function(topic){
              return browser
              .getLocationInView(topic)
              .execute("window.scrollBy(0,-140)")
              .then(function(){
                return browser.waitForElementByCss(".chapter.ng-scope.selected ul[class='topics-list'] li:nth-child(" + topicid + ") a", asserters.isDisplayed, 90000).click().then(function(){
                    done();
                });
              });
            });
    },
    constructTopicLinkCssForListView: function (topicid, topicno) {
        var topicid = topicid + topicno;
        return ".chapter.ng-scope.selected ul[class='topics-list'] li:nth-child(" + topicid + ") a";

    },
    clickonlistview: function (browser, done) {
        browser
            .sleep(2000)
            .waitForElementByCss('.icon-list-gray', asserters.isDisplayed, 3000).then(function (listview) {
                browser.waitForElementByCss('.icon-list-gray', asserters.isDisplayed, 3000).click();
                done();
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
    selectAFeaturedItem : function(browser,featuredItem,done){
      return browser
        .execute('window.scrollTo(0,300)')
        .sleep(2000)
        .waitForElementsByCssSelector("li[class='chapter ng-scope selected'] .featured-items .ng-scope.video",asserters.isDisplayed, 3000).then(function(elements){
          elements[0].click().nodeify(done);
        })
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
      //.waitForElementByCss("ul.chapters.tile li.banner:nth-child(1) ul.topics-list li:nth-child("+place+") a span")

      .waitForElementByCss("ul.chapters.tile li.chapter.ng-scope.selected ul.topics-list li:nth-child("+place+") a span")
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
      return browser
      .waitForElementByCss(".sliding-menu-content ul li:nth-child(1) div:nth-child(5) a:nth-child(2)", asserters.isDisplayed, 5000)
      .click()
      .sleep(2000)
      .waitForElementByCss(videoId, asserters.isDisplayed, 5000);
    },
    getChapterName: function(browser){
      return browser
      .sleep(5000)
      .waitForElementByXPath("(//section[@class='title-content'])[1]//a[@class='chapter-title ng-binding']", asserters.isDisplayed, 10000);
    },

    getChapterNumber: function(browser){
      return browser
      .waitForElementByXPath("//li[@class='banner ng-scope']//figure//span", asserters.isDisplayed, 10000);
    },
    readerSpeakerImageIcon: function (browser) {
        return browser
        .execute("return getComputedStyle(document.querySelector('#readspeaker')).getPropertyValue('background-image')");
    },

        navigateToMenu: function (browser, done){
          return browser
            .waitForElementByXPath("//ul[@id='navigation-menu']/li[1]/a", asserters.isDisplayed, 30000)
            .click()
            .nodeify(done);
        },

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
        }


};
