var wd = require('wd');
var asserters = wd.asserters;
var report = require("../../../../support/reporting/reportgenerator");
module.exports = {


    playVideoOnCarousel: function (browser) {
        return browser
            // .waitForElementsByCss(".fourltr-video.figure.fixed video", asserters.isDisplayed, 20000)
            // .getLocationInView()
            .sleep(5000)
            .execute("document.getElementsByClassName('active')[0].getElementsByTagName('video')[0].play()")
            .sleep(10000)
            .execute("document.getElementsByClassName('active')[0].getElementsByTagName('video')[0].pause()");
    },
    playVideo: function (browser, id) {
        console.log("id"+id);
        return browser
        .sleep(5000)
        .waitForElementByCss("#" + id, asserters.isDisplayed, 20000)
        .then(function(videoLoc){
          return browser
          .getLocationInView(videoLoc)
          .sleep(8000)
          .waitForElementByXPath("return document.getElementsByTagName('video')[0].play()", asserters.isDisplayed, 20000)
          .click()
          .sleep(5000)
          .execute("return document.getElementsByTagName('video')[0].pause()");
        });
    },

    fetchVideoTitle: function(browser){
      return browser
          .waitForElementByCss(".active", asserters.isDisplayed, 60000)
          .hasElementByCssSelector(".active h2").then(function(element){
            console.log("element"+element);
            if(element){
              return browser
                .waitForElementByCss(".active h2", asserters.isDisplayed, 60000)
                .text();
            }
            else{
              console.log(report.reportHeader() +
                report.stepStatusWithData("Video Title is not associated with the video","","failure") +
                report.reportFooter())
            }
          })
  },

    fetchMediaCredit: function(browser){
      return browser
            .hasElementByCssSelector(".active .credit").then(function(element){
                console.log("element"+element);
              if(element){
              return  browser
                  .waitForElementByCss(".active .credit", asserters.isDisplayed, 60000)
                  .text();
              }
              else{
                console.log(report.reportHeader() +
                  report.stepStatusWithData("Media credits are not associated with the video","","failure") +
                  report.reportFooter());
              }
            })

    },

    fetchVideoCaption: function(browser){
      return browser
          .hasElementByCssSelector(".active .caption").then(function(element){
              console.log("element"+element);
            if(element){
            return  browser
                .waitForElementByCss(".active .caption", asserters.isDisplayed, 60000)
                .text();
            }
            else{
              console.log(report.reportHeader() +
                report.stepStatusWithData("Video caption is not associated with the video","","failure") +
                report.reportFooter());
            }
          })
    },

    verifyShowTranscriptButtonIsDisplayed: function (browser){
      return browser
          .hasElementByCss("button[id*='topTranscriptButton']", asserters.isDisplayed, 90000);
    },

    getTextOnShowTranscriptButton: function (browser){
      return browser
          .waitForElementByCss("button[id*='topTranscriptButton']", asserters.isDisplayed, 90000);
    },

   clickOnOnTranscriptButton: function (browser){
     return browser
         .waitForElementByCss("button[id*='topTranscriptButton']", asserters.isDisplayed, 90000)
         .click();
   },

   verifyDownloadVideoButtonIsDisplayed: function (browser){
     return browser
         .hasElementByCss(".transcript-download-link.ng-scope");
   },

   getTextOfDownloadVideoButton: function (browser){
     return browser
         .waitForElementByCss(".transcript-download-link.ng-scope", asserters.isDisplayed, 90000);
   },

   verifyTopHideTrancriptBtn: function (browser){
     return browser
         .hasElementByCss("button[id*='topTranscriptButton']");
   },

   verifyBottomHideTrancriptBtn: function (browser){
     return browser
         .hasElementByCss("button[id*='bottomTranscriptButton']");
   },

   getTextTopHideTrancriptBtn: function (browser){
     return browser
         .waitForElementByCss("button[id*='topTranscriptButton']", asserters.isDisplayed, 90000);
   },

   getTextBottomHideTrancriptBtn: function (browser){
     return browser
         .waitForElementByCss("button[id*='bottomTranscriptButton']", asserters.isDisplayed, 90000);
   },

   validateTrancriptHideOnNarrtive: function(browser){
     return browser
         .hasElementByCss(".transcript-text.ng-hide");
   },

   validateTrancript: function(browser){
     return browser
         .hasElementByCss("pre[class='transcript-text']");
   },

   validateYouTobeVideo: function(browser, done, videoTitle){
     return browser
         .sleep(10000).waitForElementByCss('iframe',asserters.isDisplayed, 3000).then(function(ele){
         return browser
          .getLocationInView(ele)
         .sleep(3000).then(function(){
              return browser.url().then(function(urlofPage){
                 console.log(urlofPage);
              return browser.waitForElementByCss('iframe').getAttribute('src').then(function(el) {
                  return browser.get(el).sleep(3000);
             }).then(function() {
                  return browser.waitForElementByCss('.ytp-large-play-button.ytp-button').click().sleep(10000);
             }).then(function(){
                 return browser
                     .execute("document.getElementsByClassName('ytp-youtube-button ytp-button yt-uix-sessionlink')[0].click()")
                      .sleep(1000)
                         .windowHandles().then(function (handles) {
                         var cengageBrain = handles[1];
                         return  browser
                             .window(handles[0])
                             .sleep(3000)
                             .then(function(){
                               return browser
                                 .sleep(2000)
                                 .window(handles[1])
                                 .waitForElementByCss(".logo", asserters.isDisplayed, 90000)
                                 .waitForElementByCss(".ytp-play-button.ytp-button", asserters.isDisplayed, 90000)
                                 .click()
                                 .waitForElementByCss("#eow-title", asserters.isDisplayed, 90000).text().then(function(title){
                                     console.log(title);
                                     if(title.indexOf(videoTitle)>-1){
                                         return browser
                                             .window(handles[1]).close()
                                             .sleep(1000)
                                             .window(handles[0])
                                             .get(urlofPage)
                                             .sleep(4000).then(function(){
                                              console.log(report.reportHeader() +
                                              report.stepStatusWithData("Video is playable under YouTube page ","and user is able to pause","success") +
                                              report.reportFooter());
                                              done();
                                        });
                                     }else {
                                         console.log(report.reportHeader() +
                                         report.stepStatusWithData("Video is playable under YouTube page ","and user is able to pause","failure") +
                                         report.reportFooter());
                                     }
                                 });
                                 });
                         });
                     });
                 });

             });
         });
   }
};
