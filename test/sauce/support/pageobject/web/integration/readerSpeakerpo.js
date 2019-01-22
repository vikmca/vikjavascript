var productData = require("../../../../../../test_data/products.json");
var stringutil = require("../../../../util/stringUtil");

var wd = require('wd');
var asserters = wd.asserters;
module.exports = {
    clickOnReaderSpeakerButton: function(browser){
        return browser
            .sleep(5000)
            .waitForElementByCss("#readspeaker", asserters.isDisplayed, 90000)
            .click();
    },

    validateReaderSpeakerTrayExpanded: function(browser){
        return browser
            // .sleep(4000)
            .hasElementByCss(".rsexpanded");
    },

    verifyLabelsOnReadingPanel: function(browser,count,label){
        return browser
            // .sleep(4000)
            .waitForElementByXPath("//div[@id='rscontrol_hlspeed']/fieldset/label["+count+"]", asserters.isDisplayed, 90000)
            .text().should.eventually.include(label);
    },

    verifyLabelsOnRestoreSettingPanel: function(browser,labelOnRestore){
        return browser
            // .sleep(4000)
            .waitForElementByXPath("//div[@id='rscontrol_hlrestore']//div", asserters.isDisplayed, 90000)
            .text().should.eventually.include(labelOnRestore);
    },

    verifyButtonOnRestoreSettingPanel: function(browser){
        return browser
            // .sleep(4000)
            .waitForElementByXPath("//div[@id='rscontrol_hlrestore']//input", asserters.isDisplayed, 90000);

    },

    verifyLabelsOnGeneralPanel: function(browser,count,labelOnGeneral){
        return browser
            // .sleep(4000)
            .waitForElementByXPath("//div[@id='rscontrol_hlicon']/fieldset/label["+count+"]", asserters.isDisplayed, 90000)
           .text().should.eventually.include(labelOnGeneral);
    },

    verifyCheckedStatus: function(browser){
        return browser
          //.waitForElementByXPath("//div[@id='rscontrol_hlspeed']/fieldset/input[1]", asserters.isDisplayed, 90000);
          .execute("return document.getElementById('rscontrol_hlspeed').getElementsByTagName('fieldset')[0].getElementsByTagName('input')[0].getAttribute('data-rsform-prev')");
    },
    clickOnslowcheckbox: function(browser){
        return browser
          .waitForElementByXPath("//div[@id='rscontrol_hlspeed']/fieldset/label[1]", asserters.isDisplayed, 90000).click();
    },

    validatePlayButtonPresentOnReaderSpeakerTray: function(browser){
        return browser
            .hasElementByCss(".rsexpanded.rsplaying");
    },

    validateStopButtonPresentOnReaderSpeakerTray: function(browser){
        return browser
            .sleep(3000)
            .hasElementByCss(".rsexpanded.rsplaying.rsexpanded.rsplaying .rsbtn_stop");
    },

    validateReadSpeakerMode: function(browser, readSpeakerMode){
        return browser
            .hasElementByXPath("//*[@title='"+readSpeakerMode+"']");
    },

    clickOnPauseButton: function(browser){
        return browser
            .execute("return document.getElementsByClassName('rsexpanded rsplaying')[0].getElementsByClassName('rsbtn_pause')[0].click()");
    },

    validateProgressBar: function(browser){
        return browser
            .waitForElementByCss(".rsexpanded .rsbtn_player.rsimg.rspart .rsbtn_progress_container",asserters.isDisplayed, 60000)
            .hasElementByCss(".rsexpanded .rsbtn_player.rsimg.rspart .rsbtn_progress_container .rsbtn_progress_handle");
    },

    validateVolumeButton: function(browser){
        return browser
            .waitForElementByCss(".rsexpanded .rsbtn_player.rsimg.rspart .rsbtn_volume.rsimg.rsplaypart",asserters.isDisplayed, 60000)
            .hasElementByCss(".rsexpanded .rsbtn_player.rsimg.rspart .rsbtn_volume.rsimg.rsplaypart span");
    },

    statusOfIncreseOrDecreaseVolumeButton: function(browser){
        return browser
            .hasElementByXPath("//span[contains(@class,'rsbtn_volume_container rsimg') and contains(@style,'display: block')]");
    },

    clickOnVolumeButton: function(browser){
        return browser
            .waitForElementByCss(".rsexpanded .rsbtn_player.rsimg.rspart .rsbtn_volume.rsimg.rsplaypart",asserters.isDisplayed, 60000)
            .click();
    },

    validateVolumeSlider: function(browser){
        return browser
            .hasElementByXPath("//span[contains(@class,'rsbtn_volume_container rsimg') and contains(@style,'display: block')]//span[contains(@class,'rsbtn_volume_slider')]");
    },

    validateSettingButtonPresenceStatus: function(browser){
        return browser
            .hasElementByCss(".rsexpanded .rsbtn_settings.rsimg.rsplaypart");
    },

    settingWindowDisplayedStatus: function(browser){
        return browser
            // .hasElementByXPath("//div[@id='rslightbox_contentcontainer' and contains(@style,'display: "+display+"')]");
             .hasElementByXPath("//div[@id='rslightbox_contentcontainer' and contains(@style,'display: block')]");
    },

    clickOnSetting: function(browser){
        return browser
            .waitForElementByCss(".rsexpanded .rsbtn_settings.rsimg.rsplaypart",asserters.isDisplayed, 60000)
            .click();
    },

    validateReaderSpeakerLogo: function(browser){
        return browser
            .hasElementByXPath("//div[@id='rslightbox_contentcontainer' and contains(@style,'display: block')]//*[@id='rslightbox_logo']");
    },

    validateReaderSpeakerListenOnSettingWindow:function(browser){
        return browser
            .waitForElementByXPath("//div[@id='rslightbox_contentcontainer' and contains(@style,'display: block')]//div[@id='readspeaker_button_settings']",asserters.isDisplayed, 60000);
    },

    getHeadingTextOfSettingWindow: function(browser){
        return browser
            .waitForElementByXPath("//div[@id='rslightbox_contentcontainer' and contains(@style,'display: block')]//div[@id='rslightbox_content']//h1[contains(@class,'rs_preserve')]",asserters.isDisplayed, 60000);

    },

    validateSpeedFieldPresent: function(browser){
        return browser
            .waitForElementByXPath("//div[@id='rslightbox_contentcontainer' and contains(@style,'display: block')]//*[@id='rscontrol_hlspeed']",asserters.isDisplayed, 60000);
    },

    validatePopUpButtonPresent: function(browser){
        return browser
            .waitForElementByXPath("//div[@id='rslightbox_contentcontainer' and contains(@style,'display: block')]//*[@id='rscontrol_hlicon']",asserters.isDisplayed, 60000);
    },

    validateReStoreButtonPresent: function(browser){
        return browser
            .waitForElementByXPath("//div[@id='rslightbox_contentcontainer' and contains(@style,'display: block')]//*[@id='rscontrol_hlrestore']",asserters.isDisplayed, 60000);
    },

    closeButtonOnSettingPopUp: function(browser){
        return browser
            .waitForElementByXPath("//div[@id='rslightbox_contentcontainer' and contains(@style,'display: block')]//*[@id='rslightbox_buttons']//a",asserters.isDisplayed, 60000);

    },

    clickOnCloseButton: function(browser){
        return browser
            .waitForElementByXPath("//div[@id='rslightbox_contentcontainer' and contains(@style,'display: block')]//*[@id='rslightbox_buttons']//a",asserters.isDisplayed, 60000)
            .click();

    },

    validateCrossButtonPresent: function(browser,textOnBtn){
        return browser
            .waitForElementByXPath("//div[@id='rslightbox_contentcontainer' and contains(@style,'display: block')]//*[@id='rslightbox_toolbar']//a[@title='"+textOnBtn+"']",asserters.isDisplayed, 60000);

    },

    closePlayer: function(browser, closePlayerText){
         return browser
             .waitForElementByXPath("//div[contains(@class,'rsexpanded')]//*[contains(@class,'rsbtn_closer') and @title='"+closePlayerText+"']",asserters.isDisplayed, 60000);
    },

    clickOnClosePlayer: function(browser){
         return browser
             .waitForElementByCss(".rsexpanded .rsbtn_closer.rsimg.rspart",asserters.isDisplayed, 60000)
             .click();
    }


};
