var wd = require('wd');
var asserters = wd.asserters;
var mathutil = require("../../../../../../util/mathUtil.js");
var report = require("../../../../../../support/reporting/reportgenerator");

module.exports = {

    getStudentScore: function (browser, assignmentName) {
        return browser
            .sleep(3000)//assignment graded gets some time to update grades on gradebook
            .waitForElementsByXPath("//span[contains(text(),'" + assignmentName + "')]/parent::td/following-sibling::td", asserters.isDisplayed, 60000)
            .waitForElementByXPath("//span[contains(text(),'" + assignmentName + "')]/parent::td/following-sibling::td[@class='score-col']//div[@class='left-of-pipe']/span", asserters.isDisplayed, 60000)
            .text();

    },

    getStudentTotalScore: function (browser, assignmentName) {

        return browser.waitForElementByXPath("//span[contains(text(),'" + assignmentName + "')]/parent::td/following-sibling::td[@class='score-col']//div[@class='right-of-pipe']", asserters.isDisplayed, 60000)
            .text();
    },


    getScoredPoints: function (browser, assignmentName) {
        return browser
            .sleep(3000)//grades updated on gradebook takes time
            .waitForElementByXPath("//span[contains(text(),'" + assignmentName + "')]/parent::td/following-sibling::td[@class='points-col']//div[@class='left-of-pipe']", asserters.isDisplayed, 60000)
            .text();
    },

    getTotalPoints: function (browser, assignmentName) {
        return browser
            .waitForElementByXPath("//span[contains(text(),'" + assignmentName + "')]/parent::td/following-sibling::td[@class='points-col']//div[@class='right-of-pipe']", asserters.isDisplayed, 60000)
            .text();
    },

    validateAvgScoreOnStudentGradebook: function (browser, assignmentName, classAverage, done) {
        return browser
                .waitForElementsByXPath("//span[contains(text(),'" + assignmentName + "')]/parent::td[@class='assignment-col']/parent::tr", asserters.isDisplayed, 60000)
                .then(function (assignmentRows) {
                    assignmentRows[0].elementByCss("td.avg-col div.left-of-pipe span").text().then(function (valueofclassavg) {
                        if (!mathutil.isEmpty(valueofclassavg)) {
                            console.log("valueofclassavg from ui"+valueofclassavg);
                            console.log("valueofclassavg from ROBO"+classAverage);
                            if (parseInt(valueofclassavg) == classAverage) {
                                console.log(report.reportHeader() +
                                    report.stepStatusWithData("GRADEBOOK : Test Robo Class average "+classAverage+" is compared with", valueofclassavg, "success") +
                                    report.reportFooter());
                                done();
                            } else {
                                console.log(report.reportHeader() +
                                    report.stepStatusWithData("GRADEBOOK : Test Robo Class average "+classAverage+" is compared with", valueofclassavg, "failure") +
                                    report.reportFooter());
                            }
                        } else {
                            console.log(report.reportHeader() +
                                report.stepStatusWithData("GRADEBOOK : Class average score fetched from element is empty ", valueofclassavg, "failure")
                                + report.reportFooter());
                }
            });
        });
        // return browser
        //     .sleep(2000)
        //     .waitForElementsByXPath("//span[contains(text(),'" + assignmentName + "')]/parent::td[@class='assignment-col']/parent::tr", asserters.isDisplayed, 60000).then(function (assignmentRows) {
        //     assignmentRows[0].elementByCss("td.avg-col div.left-of-pipe span").text().then(function (averageInApp) {
        //           if(averageInApp.indexOf(classAverage)>-1){
        //             console.log(report.reportHeader() +
        //                 report.stepStatusWithData("GRADEBOOK : Class Average points ", averageInApp + " displayed successfully", "success") +
        //                 report.reportFooter());
        //             done();
        //         } else {
        //             console.log(report.reportHeader() +
        //                 report.stepStatusWithData("GRADEBOOK : Class Average points ", averageInApp + " is incorrect ", "failure") +
        //                 report.reportFooter());
        //         }
        //     });
        // });
    },

    getDueDate: function (browser,assignmentName) {
        return browser
            .waitForElementByXPath("//span[contains(text(),'"+assignmentName+"')]/parent::td[@class='assignment-col']/parent::tr//td[@class='due-col ng-binding']", asserters.isDisplayed, 60000)
            .text();
    },
    getSubmittedDate: function (browser,assignmentName) {
        return browser
            .waitForElementByXPath("//span[contains(text(),'"+assignmentName+"')]/parent::td[@class='assignment-col']/parent::tr//td[@class='submitted-col ng-binding']", asserters.isDisplayed, 60000)
            .text();
    },
    studentGradebookAst: function (browser , astName) {
      return browser
          .waitForElementsByXPath("//span[contains(text(),'" + astName + "')]/parent::td[@class='assignment-col']/parent::tr", asserters.isDisplayed, 60000);
    },
    classAverageTextValue: function(browser) {
      return browser
      .elementByCss("td.avg-col div.left-of-pipe span");
    },
    checkStudentScore: function (browser, assignmentName, score) {
        return browser
            .waitForElementByXPath("(//td//span[contains(text(),'"+assignmentName+"')]/parent::td//following-sibling::td[@class='score-col']//div[@class='left-of-pipe'])[1]/span[contains(text(),'"+score+"')]", asserters.isDisplayed, 60000);
    },
    verifyStudentScoreColoumn: function (browser, assignmentName) {
        return browser
            .hasElementByXPath("//td//span[contains(text(),'"+assignmentName+"')]/parent::td//following-sibling::td[@class='score-col']");
    },
    validateAssessmentPresentOnGradebook: function(browser, assignmentName){
      return browser
          .hasElementByXPath("//td//span[contains(text(),'"+assignmentName+"')]");
    }
};
