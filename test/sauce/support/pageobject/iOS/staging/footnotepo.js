var wd = require('wd');
var asserters = wd.asserters;
var report = require("../../../../support/reporting/reportgenerator");
module.exports = {
    validateLinkOnFootNote: function (browser, urlContent){
      return browser
        .waitForElementByXPath("(//div[contains(@class,'footnote-content is-visible')])[1]//a", asserters.isDisplayed, 90000)
        .click()
        .sleep(3000)
        .windowHandles()
        .then(
        function (handle) {
            cengageBrain = handle[1];
            return  browser
                .window(cengageBrain)
                .url().then(function(currentUrl){
                  if(currentUrl.indexOf(urlContent)>-1){
                    return  browser
                    .sleep(3000)
                    .close()
                    .window(handle[0]);
                  }
                });
              });
    }
};
