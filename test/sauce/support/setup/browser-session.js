var wd = require('wd');
var sauceData = require("../../../../test_data/sauce.json");
var gridconfig = require("../../../../config.json");
var stringutil = require("../../util/stringUtil");
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();
chaiAsPromised.transferPromiseness = wd.transferPromiseness;
//desired = JSON.parse(process.env.DESIRED);
var browser;
// adding custom promise chain method
wd.addPromiseChainMethod('elementByCssSelectorWhenReady', function (selector, timeout) {
    return this.waitForElementByCssSelector(selector, timeout).elementByCssSelector(selector);
});

wd.addPromiseChainMethod('elementByXPathSelectorWhenReady', function (selector, timeout) {
    return this.waitForElementByXPath(selector, timeout).elementByXPath(selector);
});

// http configuration, not needed for simple runs
wd.configureHttp({
    timeout: 100000,
    retryDelay: 15000,
    retries: 5
});

function SauceSession() {
}

SauceSession.create = function (done) {
    if (process.env.RUNNER.toString() === "\"remote\"") {

        var username = sauceData.username;
        var accessKey = sauceData.accessKey;
        browser = wd.promiseChainRemote("ondemand.saucelabs.com", 80, username, accessKey);
        if (process.env.VERBOSE) {

            browser.on('status', function (info) {
                console.log(info.cyan);
            });
            browser.on('command', function (meth, path, data) {
                console.log(' > ' + meth.yellow, path.grey, data || '');
            });
        }
        var desired = {
            browserName: 'chrome'
        };
        browser.init(desired).nodeify(done);

    } else {

        //MindTap Selenium node gridconfig.server

        if(stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString())=="mobile"){
            desired = {
                browserName: stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString()),
                platformName: stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORMNAME.toString()),
                platformVersion: process.env.RUN_FOR_PLATFORMVERSION.toString(),
                udid: stringutil.removeBoundaryQuotes(process.env.RUN_IN_UDID.toString()),
                deviceName: stringutil.removeBoundaryQuotes(process.env.RUN_IN_DEVICENAME.toString()),
                clearSystemFiles: true,
                newCommandTimeout: '3000'

                //for example
                  // browserName : "chrome",
                  // platformName : "Android",
                  // platformVersion : "7.0",
                  // udid : "d655b4c3",
                  // deviceName : "Redmi",
                  // clearSystemFiles: true,
                  // newCommandTimeout: '3000'
            };
          }else if(stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString())=="iOS") {
             desired = {
                 browserName: stringutil.removeBoundaryQuotes(process.env.RUN_IN_IOS_BROWSER.toString()),
                 platformName: stringutil.removeBoundaryQuotes(process.env.RUN_IN_IOS_PLATFORMNAME.toString()),
                 platformVersion: process.env.RUN_FOR_IOS_PLATFORMVERSION.toString(),
                 deviceName: stringutil.removeBoundaryQuotes(process.env.RUN_IN_IOS_DEVICENAME.toString()),
                 bundleId: stringutil.removeBoundaryQuotes(process.env.RUN_IN_BUNDLEID.toString()),
                 automationName: stringutil.removeBoundaryQuotes(process.env.RUN_FOR_AUTOMATIONNAME.toString()),
                 noReset: "true"

                //for exemple
                 // platformName: 'iOS',
                 // browserName: 'safari',
                 // deviceName: 'iPhone 6',
                 // platformVersion: '10.2',
                 // bundleId: 'com.qait.activekids',
                 // automationName: "XCUITest",
                 // noReset: "true"
             };
          }else {
            desired = {
                browserName: stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString())
            };
          }
        try {
            browser = wd.promiseChainRemote(stringutil.removeBoundaryQuotes(process.env.RUN_IN_GRID.toString()));
            browser.init(desired).then(function(){
            if(stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString())=="iOS") {
                browser.sleep(1000).contexts().then(function (contexts) {
                console.log(contexts);
                return browser.sleep(2000).context(contexts[1])
                    .nodeify(done);
                });
              }else {
                  done();
              }
            });
        } catch (ex) {
            console.log(ex);
        }
    }
    return browser;
};

SauceSession.close = function (allPassed, done) {
    if (process.env.RUNNER.toString() === "\"remote\"") {
        browser.quit().sauceJobStatus(allPassed).nodeify(done);
    } else {
        browser.quit().nodeify(done);
    }

};

module.exports = SauceSession;
