/**
 * Created by nbalasundaram on 10/3/15.
 */
var wd = require('wd');
var testData = require("../../../../../../test_data/data.json");

module.exports = {

    selectProduct: function (product, browser, done) {
        if (product === "MKTG9") {
            browser
                .sleep(3000)
                .elementByCssSelectorWhenReady("#productISBN option[value='" + testData.products.isbn.MKTG9 + "']", 20000)
                .click()
                .nodeify(done);
        }
        else if(product === "PSYCH4"){
            browser
                .sleep(3000)
                .elementByCssSelectorWhenReady("#productISBN option[value='" + testData.products.isbn.PSYCH4 + "']", 20000)
                .click()
                .nodeify(done);

        }
        else if(product === "ORGB5"){
            browser
                .sleep(3000)
                .elementByCssSelectorWhenReady("#productISBN option[value='" + testData.products.isbn.ORGB5 + "']", 20000)
                .click()
                .nodeify(done);

        }
         else if(product === "COMM4"){
             browser
                 .sleep(3000)
                 .elementByCssSelectorWhenReady("#productISBN option[value='" + testData.products.isbn.COMM4 + "']", 20000)
                 .click()
                 .nodeify(done);

         }else if (product === "PFIN6") {
              browser
                  .sleep(3000)
                  .elementByCssSelectorWhenReady("#productISBN option[value='" + testData.products.isbn.PFIN6 + "']", 20000)
                  .click()
                  .nodeify(done);
         }else if(product === "MIS7"){
             browser
                 .sleep(3000)
                 .elementByCssSelectorWhenReady("#productISBN option[value='" + testData.products.isbn.MIS7 + "']", 20000)
                 .click()
                 .nodeify(done);

         }else {
               browser
                   .sleep(3000)
                   .elementByCssSelectorWhenReady("#productISBN option[value='" + testData.products.isbn.MKTG9 + "']", 20000)
                   .click()
                   .nodeify(done);
         }

    },

    registerCourse: function (browser, coursekey) {

        browser
            .elementByCssSelectorWhenReady("#registerAccessCode", 3000)
            .click()
            .type(coursekey)
            .elementByCssSelectorWhenReady(".viewDetailsBtn.register_button", 4000)
            .click()
            .sleep(4000)
            .elementByCssSelectorWhenReady(".small_green_button", 4000)
            .click()
            .sleep(10000)
            .nodeify(done);
    },

      closePopupWindowFromJavaScript: function(browser){
        // return browser
        //   .hasElementByCss(".QSIPopOver.SI_efH9LFdAPEJTF8p_PopOverContainer").then(function(popupWindowStatus){
        //   if(popupWindowStatus){
        //     console.log(report.reportHeader()
        //     + report.stepStatusWithData("Feedback popup appears on assignment page", popupWindowStatus, "failure")
        //     + report.reportFooter());
            return browser
                .execute("return document.querySelector('[src*=IM_d05IusDfiy9d6IY]').click()");
                //.waitForElementByXPath("//div[contains(@class,'QSIPopOver')]//img[contains(@src,'close')]", asserters.isDisplayed, 10000)
                // .execute("return document.getElementsByClassName('QSIPopOver SI_efH9LFdAPEJTF8p_PopOverContainer')[0].style.position=null");
        //   }
        // });
      }


};
