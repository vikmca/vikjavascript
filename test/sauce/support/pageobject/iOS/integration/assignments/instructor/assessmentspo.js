var wd = require('wd');
var Q = wd.Q;
var asserters = wd.asserters;
var testData = require("../../../../../../../../test_data/assignments/assessments.json");
var servicepo = require("./servicepo");
var report = require("../../../../../reporting/reportgenerator");
var testData1 = require("../../../../../../../../test_data/data.json");
var request = require('supertest')(servicepo.getAssignmentURL());
var util = require('util');
var _ = require('underscore');
var olr = require("../../olr");
var loginPage = require("../../loginpo");
var stringutil = require("../../../../../../util/stringUtil");
var Q = require('q');
var assignmentpage = require("../../../../../../support/pagefactory/assignmentpage.json");
var commonutil = require("../../../../../../util/commonUtility.js");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var tocpo = require("../../../../../../support/pageobject/"+pageobject+"/"+envName+"/tocpo.js");
var takeQuizpo = require("../../takeQuizpo");
var data = {
    name: "Robo Assessment"
};

var temp1;
var temp2;
var temp3;

module.exports = {

    getAssignmentName: function () {

        return data.name;
    },
    getAssignmentPoints: function () {
        return testData.systemgenerated.scorestrategyhigh.score;
    },

    getMaxAssignmentQuestions: function () {
        return testData.systemgenerated.scorestrategyhigh.questions;
    },

    getMaxAssignmentQuestionsForAllScoreStrategy: function () {
        return testData.systemgenerated.scoreStrategyAll.questions;
    },
    verifyQuestionButton: function (browser) {
        return browser
            .waitForElementByCss("#select-questions .ng-binding.disabled", asserters.isDisplayed, 60000).isDisplayed();

    },

    verifyPreviewButtonStatus: function (browser) {
      return browser
          .hasElementByCss("#preview li[class='ng-binding disabled']");
    },

    getRoboClassAverage: function (pointsEarnedByStudentA, pointsEarnedByStudentB, studentCount) {
        var systemClassAverage = ((parseInt(pointsEarnedByStudentA) + parseInt(pointsEarnedByStudentB)) / parseInt(studentCount));
        return systemClassAverage.toString();
    },

    getRoboPointScore: function (correctanswers) {
        var systempoints = (correctanswers / this.getMaxAssignmentQuestions()) * this.getAssignmentPoints();
        return systempoints.toString();
    },

    getRoboPointScoreForMediaQuiz: function (correctanswers,totalQuestions) {
        var systempoints = Math.round(((correctanswers / totalQuestions) * this.getAssignmentPoints())*10)/10;
        return systempoints.toString();
    },

    getScorePercentageForMediaQuiz: function (correctanswers,totalQuestions) {
        var systempoints = Math.round(((correctanswers / totalQuestions) * 100)*10)/10;
        return systempoints.toString();
    },

    getRoboPointsForAllAssignmentScoreStrategy: function (correctanswers) {
        var systempoints = (correctanswers / this.getMaxAssignmentQuestionsForAllScoreStrategy()) * this.getAssignmentPoints();
        return systempoints.toString();
    },

    enterName: function (browser) {

        var attempts;

        if (testData.systemgenerated.scorestrategyhigh.attempts === "unlimited")
            attempts = "U";

        data.name = testData.systemgenerated.scorestrategyhigh.name +
            "-" +
            attempts +
            "-" +
            testData.systemgenerated.scorestrategyhigh.score + " RANDOM NO " + Math.floor((Math.random() * 1000) + 1);

        return browser
            .waitForElementsByCss(".full-width.number-input .text-input", asserters.isDisplayed, 10000)
            .waitForElementByXPath("//div[@class='text-input']//input[@id='assessment-name'and @type='text']", asserters.isDisplayed, 60000)
            .type(data.name)
            .hideKeyboard();
            // .execute("return document.getElementsByClassName('text-input')[0].getElementsByTagName('input')[0].value=('"+data.name+"')");



    },

    enterRevealDate: function (browser) {
        return browser
            .waitForElementByXPath("(//div[contains(@class,'datefield ng-binding')])[2]", asserters.isDisplayed, 60000)
            .click()
            .sleep(2000)
            .waitForElementByCss("div[class='datepicker cg-calendar ng-isolate-scope'] .day.ng-scope.today", asserters.isDisplayed, 60000)
            .click();

    },

    enterRevealDateNextMonth: function (browser) {
        return browser
            .waitForElementByXPath("(//div[contains(@class,'datefield ng-binding')])[2]", asserters.isDisplayed, 60000)
            .click()
            .waitForElementByXPath("//div[@class='span-half']//cg-date-picker[@label-text='Reveal in Student Calendar']//div[contains(@class,'next')]", asserters.isDisplayed, 10000)
            .click()
            .waitForElementByXPath("((//div[@class='span-half']//cg-date-picker[@label-text='Reveal in Student Calendar']//div[@class='week ng-scope'])[1]//div//span[contains(text(),'1')])[last()]", asserters.isDisplayed, 10000)
            .click();
    },

    enterRevealDateNextMonth2ndDate: function (browser) {
        return browser
            .waitForElementByXPath("(//div[contains(@class,'datefield ng-binding')])[2]", asserters.isDisplayed, 60000)
            .click()
            .waitForElementByXPath("//div[@class='span-half']//cg-date-picker[@label-text='Reveal in Student Calendar']//div[contains(@class,'next')]", asserters.isDisplayed, 10000)
            .click().then(function(){
              return browser
                .hasElementByXPath("((//div[@class='span-half']//cg-date-picker[@label-text='Reveal in Student Calendar']//div[@class='week ng-scope'])[1]//div//span[text()='2'])[last()]").then(function(secondDate){
                  if(secondDate){
                    return browser
                      .waitForElementByXPath("((//div[@class='span-half']//cg-date-picker[@label-text='Reveal in Student Calendar']//div[@class='week ng-scope'])[1]//div//span[text()='2'])[last()]", asserters.isDisplayed, 10000)
                      .click();
                  }else {
                    return browser
                      .waitForElementByXPath("((//div[@class='span-half']//cg-date-picker[@label-text='Reveal in Student Calendar']//div[@class='week ng-scope'])[2]//div//span[text()='2'])[last()]", asserters.isDisplayed, 10000)
                      .click();
                  }
                });
            });
    },

    selectChapter: function (browser, chapter) {
      chapter = chapter-1;
        return  browser
            .execute("return document.getElementsByClassName('full-width ng-scope')[0].getElementsByTagName('span')[0].scrollIntoView(true)")
            .sleep(2000)
            .waitForElementsByCss(".full-width.ng-scope", asserters.isDisplayed, 15000)
            .execute("return document.getElementsByClassName('full-width ng-scope')["+chapter+"].getElementsByTagName('span')[0].click()");
    },

    enterQuestionsPerStudent: function (browser, countOfQuestions) {
        return browser
            .waitForElementByCss(".assignment-nav-wrapper", asserters.isDisplayed, 10000)
            .waitForElementByXPath("//input[@id='ques-per-student']", asserters.isDisplayed, 60000)
            .clear()
            .type(countOfQuestions)
            .hideKeyboard()
            // .execute("return document.getElementById('ques-per-student').value=('"+countOfQuestions+"')")
            .sleep(1000);

    },

    enterScore: function (browser, score) {
        return browser
            .waitForElementByCss("#highest-possible", asserters.isDisplayed, 60000)
            .clear()
            .type(score)
            .hideKeyboard()
            .sleep(1000);
            // .execute("return document.getElementById('highest-possible').value=('"+score+"')");

    },

    selectAttempts: function (browser, attempts) {
        return browser
            .waitForElementByCss("select[name='attempts'] option[value='" + attempts + "']", asserters.isDisplayed, 60000)
            .click();
    },


    selectScoreStrategy: function (browser, scoreStrategy) {
        return browser
            .waitForElementByCss("div.score-type-radio label[for='" + scoreStrategy + "']", asserters.isDisplayed, 60000)
            .click();

    },

    selectDropLowestScore: function (browser) {
        return browser
            .waitForElementByXPath("//label[contains(.,'Drop Lowest Score')]", asserters.isDisplayed, 60000)
            .click();
    },

    saveAssignment: function (browser) {
        return browser
            .sleep(1000)
            .waitForElementByCss("#save-close", asserters.isDisplayed, 60000)
            .click();
    },
    saveButtonDisabled: function (browser) {
        return browser
            .sleep(1000)
            .waitForElementByXPath("//button[@id='save-close' and @disabled=\"disabled\"]", asserters.isDisplayed, 60000);
    },
    iWillChooseButtonDisabled: function (browser) {
        return browser
            .waitForElementByCss(".span-half.iwbi.ng-scope", asserters.isDisplayed, 60000);
    },
    checkifCheckboxesisClicked: function (browser) {
        return browser
            .waitForElementsByCss(".actions.ng-scope", asserters.isDisplayed, 15000)
            .execute("return getComputedStyle(document.querySelector('.full-width.ng-scope label'),'::before').getPropertyValue('background-color')");

    },

    checkifCheckboxesisClickedOnListView: function (browser) {
        return browser
            .execute("return getComputedStyle(document.querySelector('.full-width.ng-scope label'),'::before').getPropertyValue('background-color')");

    },

    checkIfAssignmentSaved: function (browser) {
        var ast = assignmentpage.assignment.assignmentSaveOnCurrentDate;
        console.log(ast);
        var res = stringutil.returnreplacedstring(ast, "{{}}", this.getAssignmentName());
        console.log(res);
        return browser
            .waitForElementByXPath(res, asserters.isDisplayed, 60000)
            .execute("return window.getComputedStyle(document.evaluate(\"" + res + "\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue.parentNode).getPropertyValue('background-color');");
    },

    checkIfAssignmentSavedOnCurrentDate: function (browser, assignmentName) {
      var ast = assignmentpage.assignment.assignmentSaveOnCurrentDate;
      var res = stringutil.returnreplacedstring(ast, "{{}}", assignmentName);
        return browser
            .waitForElementByXPath(res, asserters.isDisplayed, 60000)
            .execute("return window.getComputedStyle(document.evaluate(\"" + res + "\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue.parentNode).getPropertyValue('background-color');");
    },

    checkIfAssignmentSavedOnFuture2ndDate: function (browser, assignmentName) {
      var ast = assignmentpage.assignment.assignmentSaveOnFuture2ndDate;
      var res = stringutil.returnreplacedstring(ast, "{{}}", assignmentName);
        return browser
            .waitForElementByXPath(res, asserters.isDisplayed, 60000)
            .execute("return window.getComputedStyle(document.evaluate(\"" + res + "\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue.parentNode).getPropertyValue('background-color');");
    },

    checkIfAssignmentSavedOnFutureDate: function (browser) {
         //  var ast = assignmentpage.assignment.assignmentSaveOnFutureDate;
      var ast = "//div[@class='day ng-scope']/span/span[@class='number ng-binding' and (text()='1')]//parent::span//following-sibling::div[contains(@class,'event')]//span[contains(.,'{{}}')]";
      var res = stringutil.returnreplacedstring(ast, "{{}}", this.getAssignmentName());
      return browser
          .waitForElementByXPath(res, asserters.isDisplayed, 60000)
          // .execute("return window.getComputedStyle(document.evaluate(\"//div[@class='day ng-scope']/span[@class='number ng-binding' and (text()='1')]//following-sibling::button[contains(@class,'event')]//span[contains(.,'" + this.getAssignmentName() + "')]\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue.parentNode).getPropertyValue('background-color');");
          .execute("return window.getComputedStyle(document.evaluate(\"" + res + "\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue.parentNode).getPropertyValue('background-color');");
    },

    deleteAssignment: function (browser, done) {
        var token = olr.getToken(loginPage.getUserId(), loginPage.getUserPwd());

        browser.url().
            then(function (url) {

                var courseCGI = url.substring(url.toString().indexOf("products") + 9, url.toString().indexOf("assignment") - 1);
                console.log("CourseCGI " + courseCGI);
                console.log("UserId " + loginPage.getUserId());

                request.get('/assignments/?productId=' + courseCGI)
                    .set('Accept', 'application/json')
                    .set('cengage-sso-guid', token)
                    .set('cengage-sso-role', 'instructor')
                    .expect(200)
                    .then(function (res) {
                        var assignments = res.body;
                        console.log("assignments " + assignments);
                        var deferred = Q.defer();

                        var promises = [];
                        _.each(assignments, function (assignment) {
                            console.log("Asssignment id " + assignment.id);
                            var promise = request.delete('/assignments/' + assignment.id)
                                .set('cengage-sso-guid', token)
                                .expect(204);
                            promises.push(promise);

                        });

                        //Once all the promises are fetched then the deferred condition is resolved
                        Q.all(promises).then(
                            function () {
                                deferred.resolve();
                                console.log("Resolving after all the assignment deletion requests are honoured");
                                browser.refresh().sleep(5000).nodeify(done);
                            });


                    });

            });
    },

    deleteAssignmentFromBrowser: function (browser, done) {

        var currentdate = util.getCurrentDate();

        if (currentdate > 13) {
            browser
                .execute("window.scrollTo(0,1000)");
        }
        browser
            .execute("return document.getElementsByClassName('day ng-scope today selected')[0].getElementsByClassName('event ng-scope').length")
            .then(function (length) {
                //Deletion of assignments will only be attempted if there are any assignments to be deleted in current date
                if (length !== 0) {

                    browser.execute("return document.getElementsByClassName('day ng-scope today selected')[0].getElementsByClassName('toggle collapsed ng-scope').length").then(function (length) {
                        //If there are more than 2 assignments then all of the assignments will be expanded
                        if (length === 0) {

                            browser
                                .waitForElementByXPath("(//div[contains(@class,'day ng-scope today')]/div[contains(@class,'event ng-scope')])[last()]", asserters.isDisplayed, 3000)
                                .click()
                                .waitForElementByCss(".delete.ng-scope", asserters.isDisplayed, 60000)
                                .click()
                                .elementByXPathSelectorWhenReady("(//button[contains(@class,'save ng-binding')])[2]", 5000)
                                .click()
                                .then(function () {
                                    done();
                                });

                        } else {
                            browser
                                .elementByCssSelectorWhenReady(".day.ng-scope.today .toggle.collapsed.ng-scope", 3000)
                                .click()
                                .waitForElementByXPath("(//div[contains(@class,'day ng-scope today')]/div[contains(@class,'event ng-scope')])[last()]", asserters.isDisplayed, 3000)
                                .click()
                                .waitForElementByCss(".delete.ng-scope", asserters.isDisplayed, 60000)
                                .click()
                                .waitForElementByXPath("(//button[contains(@class,'save ng-binding')])[2]", asserters.isDisplayed, 60000)
                                .click()
                                .then(function () {
                                    done();
                                });

                        }
                    });
                } else {
                    console.log("There is nothing to delete");
                    done();
                }

            });


    },

    deleteAssignmentFromBrowserOnListView: function (browser, astName, done) {
        commonutil.acceptAlerts(browser, true).then(function () {
            return  browser
                .waitForElementByXPath("//div[contains(text(),'" + astName + "')]")
                .click()
                .sleep(3000)
                .waitForElementByCss(".delete.ng-scope", asserters.isDisplayed, 60000)
                .click()
                .nodeify(done);
        });
    },

    verifyAssignmentNotPresent: function (browser, astName) {
        return  browser
            .hasElementByXPath("//div[contains(text(),'" + astName + "')]");
    },

    openAssignmentOnListView: function (browser, astName) {
        return  browser
            .waitForElementByXPath("//td[contains(text(),'" + astName + "')]", asserters.isDisplayed, 60000)
            .click();
    },

    selectAnExistingAssignmentInCurrentDate: function (browser) {
      tocpo.selectTileView(browser);
        return browser
            .waitForElementByXPath("(//div[contains(@class,'day ng-scope today')]/div[contains(@class,'event ng-scope')])[last()]", asserters.isDisplayed, 9000)
            .click()
            .waitForElementsByCss(".actions.ng-scope", asserters.isDisplayed, 15000);
    },

    verifyAssessmentAttemptsAfterSort: function (browser) {
        return browser
            .waitForElementByXPath("(//span[@class='ui-grid-invisible ui-grid-icon-blank'])[5]", asserters.isDisplayed, 10000)
            .click()
            .then(function () {
                browser
                    .waitForElementByXPath("((//div[contains(@class,'ui-grid-viewport ng-isolate-scope')]//div[contains(@class,'ui-grid-row ng-scope')])[1]//div[contains(@class,'ui-grid-cell')]//div)[5]", asserters.isDisplayed, 10000)
                    .text.then(function (currentAttempt) {
                        console.log("first Attempt appears when order is ascending:" + currentAttempt);
                        console.log(report.reportHeader() +
                            report.stepStatusWithData("First Attempt appears when order is ascending :: ", currentAttempt, "success") +
                            report.reportFooter());
                    });
            });


    },

    selectQuestionStrategy: function (browser, QuestionStrategy) {
        return browser
            .waitForElementByXPath("//button[contains(@class,'span-half')and contains(.,'" + QuestionStrategy + "')]", asserters.isDisplayed, 10000)
            .click();
    },

    validateDueAndRevealDateText: function (browser, dueRevealDateValue) {
        return browser
            .waitForElementByXPath("//cg-date-picker[@label-text='Due Date']//div[contains(@class,'datefield')]", asserters.isDisplayed, 10000)
            .text().should.eventually.include(dueRevealDateValue).then(function () {
                browser
                    .waitForElementByXPath("(//cg-date-picker[contains(@label-text,'Reveal')])[1]//div[contains(@class,'datefield')]", asserters.isDisplayed, 10000)
                    .text().should.eventually.include(dueRevealDateValue);
            });
    },

    validateQuestionPerStudentDefaultSelection: function (browser) {
        return browser
            .elementByCssSelectorIfExists("#select-type").getAttribute('name').then(function (status) {
                if (status === "true") {
                    console.log(report.reportHeader() +
                        report.stepStatusWithData("\"All Selected Below\" option is selected by default", "", "success") +
                        report.reportFooter());
                }
                else {
                    console.log(report.reportHeader() +
                        report.stepStatusWithData("All Selected Below” option is selected by default", "", "failure") +
                        report.reportFooter());
                }
            });
    },

    expandTheFilterPanel: function (browser) {
        return browser
            .waitForElementByCss(".filter-section.full-width>.filter-questions", asserters.isDisplayed, 60000)
            .click();
    },

    filterOnIWCAssignment: function (browser, type, value) {
        return browser
            .hasElementByXPath("//div[contains(@class,'filter-column') and contains(.,'" + type + "')]//ul//li//label[contains(text(),'" + value + "')]").then(function (fillinType) {
                if (fillinType) {
                    return  browser
                        .waitForElementByXPath("(//div[contains(@class,'filter-column') and contains(.,'" + type + "')]//ul//li//label[contains(text(),'" + value + "')])[1]", asserters.isDisplayed, 60000)
                        .click();
                }
            });
    },
    getFilterOptions: function (browser, filterText) {
        return browser
            .elementsByXPath("//div[contains(@class,'filter-column') and contains(.,'" + filterText + "')]//ul//li//label")
            .then(function (parameters) {
                parameters[0].text().then(function (value) {
                    temp1 = value;
                });
                parameters[1].text().then(function (value) {
                    temp2 = value;
                });
                // parameters[2].text().then(function (value) {
                //     temp3 = value;
                //     console.log(report.reportHeader() +
                //         report.stepStatusWithData("Sub Filters under " + filterText + " are:: ", temp1 + ", " + temp2 + " and " + temp3, "success") +
                //         report.reportFooter());
                // });
            });
    },

    reportAllConcept: function (browser, chapter, done) {
        var counter = 0;
        return browser
            .elementsByCssSelector(".chapter-options .cg-checkbox label")
            .then(function (parameters) {
                function printConceptsText() {
                    if (counter < _.size(parameters)) {
                        console.log("1 Concept::" + parameters[counter].text());
                        counter++;
                        printConceptsText();
                    }
                    else {
                        done();
                    }
                }
            });
    },

    retrieveFilterType: function (browser) {
        return browser
            .waitForElementByXPath("(//div[@class='show-all-toggle ng-binding'])[1]", asserters.isDisplayed, 60000)
            .click()
            .waitForElementByXPath("(//div[contains(@class,'filter-column') and contains(.,'Type')]//ul//li//label)[1]", asserters.isDisplayed, 60000)
            .text();
    },

    retrieveBloomType: function (browser) {
        return browser
            .waitForElementByXPath("(//div[@class='show-all-toggle ng-binding'])[2]", asserters.isDisplayed, 60000)
            .click()
            .waitForElementByXPath("(//div[contains(@class,'filter-column') and contains(.,'Bloom')]//ul//li//label)[1]", asserters.isDisplayed, 60000)
            .text();
    },

    retrieveDifficultyType: function (browser) {
        return browser
            .waitForElementByXPath("(//div[@class='show-all-toggle ng-binding'])[3]", asserters.isDisplayed, 60000)
            .click()
            .waitForElementByXPath("(//div[contains(@class,'filter-column') and contains(.,'Difficulty')]//ul//li//label)[1]", asserters.isDisplayed, 60000)
            .text();
    },

    validatePresenceOfQuestionButton: function (browser) {
        return browser
            .waitForElementByCss(".questions-button", asserters.isDisplayed, 60000)
            .text();
    },

    validatePresenceOfCancelButton: function (browser) {
        return browser
            .waitForElementByCss(".cancel.dark-gray-button", asserters.isDisplayed, 60000)
            .text();
    },

    validatePresenceOfSaveOrCloseButton: function (browser) {
        return browser
            .waitForElementByCss("#save-close", asserters.isDisplayed, 60000)
            .text();
    },

    clickOnQuestionButtonUnderPreviewTab: function (browser) {
        return browser
            .waitForElementByCss(".questions-button", asserters.isDisplayed, 60000)
            .click();
    },

    validateTheNavigation: function (browser) {
        return browser
            .waitForElementByCss("#select-questions li", asserters.isDisplayed, 60000)
            .getAttribute('class')
            .should.eventually.include("active");
    },


    clickOnPreviewButtonUnderQuestionTab: function (browser) {
        return browser
            .waitForElementByCss(".tabs ul #preview li", asserters.isDisplayed, 60000)
            .isEnabled()
            .waitForElementByCss(".tabs ul #preview li", asserters.isDisplayed, 90000)
            .isDisplayed()
            .waitForElementByCss(".tabs ul #preview li", asserters.isDisplayed, 90000)
            .click();
    },

    validateIfPreviewQuestionIsCorrect: function (browser) {
        return browser
            .waitForElementByXPath("(//div[@class='cas-task']//span[@class='cas-text'])[1]", asserters.isDisplayed, 60000)
            .text();
    },

    validateIfPreviewQuestionIsPresent: function (browser) {
        return browser
            .waitForElementsByCss(".cas-task", asserters.isDisplayed, 120000);
    },

    clickOnQuestionTab: function (browser) {
        return browser
            .waitForElementByXPath("//div[@class='assignment-nav-wrapper ng-scope']//nav//cg-tab[@id='select-questions']//li", asserters.isDisplayed, 60000)
            .click();
    },

    clickOnSettingTab: function (browser) {
        return browser
            .waitForElementByXPath("//div[@class='assignment-nav-wrapper ng-scope']//nav//cg-tab[@id='settings']//li", asserters.isDisplayed, 60000).then(function (SettingsTab) {
                SettingsTab.click();
            })
    },
    setupPopUpButton: function (browser) {
        return browser
            .waitForElementByCss(".confirm.ng-binding", asserters.isDisplayed, 60000)
            .text();
    },
    selectFirstQuestion: function (browser) {
        return browser
            .waitForElementByXPath("(//div[@class='full-width']//ul//li//div//span[@class='question'])[1]", asserters.isDisplayed, 60000);
    },
    clickOnAssignmentOnCurrentDate: function (browser, astname) {
      tocpo.selectTileView(browser);
        return browser
            .sleep(2000)
            .waitForElementByXPath("(//div[contains(@class,'day ng-scope today')]//div[contains(@class,'event')])//span[contains(text(),'" + astname + "')]/ancestor::div[contains(@class,'event')]", asserters.isDisplayed, 60000)
            .click();
    },
    getDescriptionOfQuestion: function (browser) {
        return browser
            .waitForElementByCss(".description", asserters.isDisplayed, 60000);
    },
    getConceptOfQuestion: function (browser) {
        return browser
            .waitForElementByXPath("(//span[@class='description']//span[@class='concept'])[1]", asserters.isDisplayed, 60000);
    },

    addAssignmentOnListView: function (browser, done, addAssignmentName) {
        return browser
            // .waitForElementByXPath("//button[@class='add-assignment']", asserters.isDisplayed, 9000).then(function(createAnAssignment){
            //   return browser
            //     .getLocationInView(createAnAssignment)
                .waitForElementByXPath("//button[@class='add-assignment']", asserters.isDisplayed, 20000)
                // .execute("return document.getElementsByClassName('add-assignment')[0].scrollIntoView(true)")
                .execute("return window.scrollTo(0,0)")
                .sleep(1000)
                .waitForElementByXPath("//button[@class='add-assignment']", asserters.isDisplayed, 9000)
                .text()
                .should.eventually.include(addAssignmentName)
                .waitForElementByCss(".add-assignment", asserters.isDisplayed, 9000)
                .click().then(function () {
                    done();
                });
            // });
    },

    enterDueDate: function (browser) {
        return browser
            .waitForElementByXPath("(//div[contains(@class,'datefield ng-binding')])[1]", asserters.isDisplayed, 60000)
            .click()
            .sleep(1000)
            .waitForElementByCss("div[class='datepicker cg-calendar ng-isolate-scope'] .day.ng-scope.today", asserters.isDisplayed, 60000)
            .click();

    },
    assignmentCasStatusOnPage: function (browser) {
        return browser
            .hasElementByCss(".cas-activity-progress");
    },
    clickOnQuestionPerStudentTextBox: function (browser) {
        return browser
            // .waitForElementByCss(".textRadio label", asserters.isDisplayed, 60000)
            // .click()
            .sleep(3000)
            .execute("return document.getElementsByClassName('textRadio')[0].getElementsByTagName('label')[0].click()")
            .waitForElementByCss("#ques-per-student", asserters.isDisplayed, 60000)
            .clear()
            .waitForElementByCss("#ques-per-student", asserters.isDisplayed, 60000)
            .type("4")
            .hideKeyboard()
            .waitForElementByCss("#ques-per-student", asserters.isDisplayed, 60000);
    },
    clickOnAllSelectedBelowRadiButton: function (browser) {
        return browser
          .hideKeyboard()
          .execute("return document.getElementsByClassName('nudge-right-first ng-isolate-scope')[0].scrollIntoView(true)")
          .sleep(1000)
        //   .waitForElementByCss(".nudge-right-first.ng-isolate-scope", asserters.isDisplayed, 60000)
        //   .click();
          .execute("return document.getElementsByClassName('nudge-right-first ng-isolate-scope')[0].getElementsByTagName('label')[0].click()");
    },

    characterCountAssignmentName: function (browser) {
        return browser
            .execute("return document.getElementsByClassName('text-input')[0].getElementsByTagName('input')[0].value.length");
        // .waitForElementByCss(".text-input input", asserters.isDisplayed, 60000).value().length();
    },

    leftCountFromAssignmentTextBox: function (browser) {
        return browser
            .execute("return document.getElementsByClassName('title-char-count span-half')[0].getElementsByClassName('ng-binding')[0].textContent");
    },

    fetchAssignmentNameTextBox: function (browser) {
        return browser
            .waitForElementByXPath("//div[@class='text-input']//input[@id='assessment-name'and @type='text']", asserters.isDisplayed, 60000);
    },

    closeAssignmentPanel: function (browser) {
        return browser
            .waitForElementByCss(".icon-close-x-blue.close-sidebar", asserters.isDisplayed, 60000)
            .click();
    },

    enterNameIncludingSpaces: function (browser) {
        return browser
            .waitForElementByXPath("//div[@class='text-input']//input[@id='assessment-name'and @type='text']", asserters.isDisplayed, 60000)
            .type(wd.SPECIAL_KEYS.Space)
            .type(wd.SPECIAL_KEYS.Space)
            .type(wd.SPECIAL_KEYS.Space)
            .type(wd.SPECIAL_KEYS.Space)
            .type(testData1.assignmentDetails.assignmentTextBoxDtails.assignmentNameWithSpaces)
            .type(wd.SPECIAL_KEYS.Space)
            .type(wd.SPECIAL_KEYS.Space)
            .type(wd.SPECIAL_KEYS.Space)
            .type(testData1.assignmentDetails.assignmentTextBoxDtails.assignmentNameWithSpaces1)
            .hideKeyboard();
    },

    getTextRecentlyCreatedAssignment: function (browser) {
        return browser
            .waitForElementByXPath("(//div[contains(@class,'day ng-scope today')]/div[contains(@class,'event ng-scope')])[last()]//span", asserters.isDisplayed, 10000);
    },

    checkIfAssignmentGetSavedOnCurrentDate: function (browser) {
        return browser
            .hasElementByXPath("(//div[contains(@class,'day ng-scope today')]/div[contains(@class,'event ng-scope')])[last()]//span", asserters.isDisplayed, 10000);
    },

    verifySettingButton: function (browser) {
      return browser
          .waitForElementByCss("#back-to-settings", asserters.isDisplayed, 60000).isDisplayed();
    },
    verifyQuestionsButton: function (browser) {
      return browser
          .waitForElementByCss(".questions-button.ng-scope", asserters.isDisplayed, 60000).isDisplayed();
    },

    checkByDefaultSelectedAttempt: function (browser) {
        return browser
            .waitForElementByCss("select[name='attempts'] option[value='1']", asserters.isDisplayed, 60000);

    },

    averageScoreCheckboxdefaultStatus: function (browser) {
        return browser
            .waitForElementByCss(".score-type-radio.ng-isolate-scope.disabled-option", asserters.isDisplayed, 60000);
    },

    averageScroreButtonStatus: function (browser) {
        return browser
            .waitForElementByCss("div[value='AVERAGE_SCORE']", asserters.isDisplayed, 60000);

    },

    dropLowestScoreCheckboxdefaultStatus: function (browser) {
        return browser
            .waitForElementByCss(".drop-lowest.cg-checkbox.ng-isolate-scope.disabled", asserters.isDisplayed, 60000);
    },
    getAssignmentTextBelowExport: function (browser) {
        return browser
            .sleep(3000)
            .waitForElementByCss("#num-assignments-visible", asserters.isDisplayed, 60000);
            // .waitForElementByCss("#num-assignments", asserters.isDisplayed, 60000);
    },
    validateEditedAttempt: function (browser, astName, attempt) {
        return browser
            .waitForElementByXPath("(//div[contains(text(),'" + astName + "')]//parent::div//parent::div//div)[last()]", asserters.isDisplayed, 60000)
            .text()
            .should.eventually.include(attempt);
    },
    validatePresenceOfShowCorrectAnswersButton: function (browser) {
            return browser
                .sleep(1000)
                .waitForElementByCss(".answers-button", asserters.isDisplayed, 60000);

    },

    // checkIfShowCorrectAnswersButtonNameChanged: function (browser) {
    //     return browser
    //         .waitForElementByCss(".quiz-button-container button", asserters.isDisplayed, 60000);
    // },

    validatePresenceOfPrintButton: function (browser) {
        return browser
            .waitForElementByCss(".print-button.ng-scope", asserters.isDisplayed, 60000)
            .text();
    },
    validatePresenceOfFeedbackColoumn: function (browser) {
        return browser
            .waitForElementsByXPath("//div[@class='quiz-wrapper']//div[@class='cas-feedback']", asserters.isDisplayed, 60000);
    },

    vaildateFeedbackColoumnUnderCorrectAnswers: function (browser) {
        return browser
            .hasElementByXPath("//div[@class='quiz-wrapper']//div[@class='cas-feedback-hd']", asserters.isDisplayed, 60000);
    },

    checkIfCorrectIconIsPresentOnHideAnswersPanel: function (browser) {
        return browser
            .waitForElementsByXPath("//div[@class='quiz-wrapper']//span[@class='cas-correctness fa cas-correct fa-check']", asserters.isDisplayed, 60000);
    },

    checkIfCreditsIsPresentOnHideAnswersPanel: function (browser) {
        return browser
            .waitForElementsByXPath("//div[@class='quiz-wrapper']//div[@class='cas-credits']", asserters.isDisplayed, 60000);
    },
    questionBtnDisabled: function (browser) {
        return browser
            .hasElementByXPath("//button[@id='next-to-questions' and @disabled='disabled']");
    },
    checkIfDeleteButtonNotDisabled: function (browser) {
      return browser
          .hasElementByXPath("//button[@id='delete' and @disabled='disabled']");
    },
    clickOnQuestionTabOnBottom: function (browser) {
      return browser
          .waitForElementByCss("#next-to-questions", asserters.isDisplayed, 60000)
          .click();
    },
    changeRevelAndDueDate: function (browser, index, textOfChangeDate){
      return browser
          .waitForElementByXPath("(//div[contains(@class,'datefield ng-binding')])["+index+"]", asserters.isDisplayed, 10000)
            .click().then(function () {
            return  browser.hasElementByXPath("(//div[@class='datepicker cg-calendar ng-isolate-scope']//div[@class='week ng-scope'])[last()]//div[@class='day ng-scope different-month selected']").then (function (currentDatePresenceStatus){
                if (currentDatePresenceStatus) {
                  return  browser
                      .waitForElementByCss("div[class='datepicker cg-calendar ng-isolate-scope'] .day.ng-scope.today", asserters.isDisplayed, 10000)
                      .click();
               }
                else {
                return  browser
                    .waitForElementByXPath("//div[@class='span-half']//cg-date-picker[@label-text='"+textOfChangeDate+"']//div[@class='previous']|//div[@class='span-half']//cg-date-picker[@label-text='"+textOfChangeDate+"']//button[contains(@class,'previous')]", asserters.isDisplayed, 10000)
                    .click()
                    .waitForElementByCss("div[class='datepicker cg-calendar ng-isolate-scope'] .day.ng-scope.today", asserters.isDisplayed, 10000)
                    .click();
                }
              });
           });
    },
    revealInStudentPopup: function (browser) {
      return browser
          .hasElementByXPath("//cg-date-picker//parent::section");
    },
    getTextOnrevealInStudentPopup: function (browser) {
      return browser
          .waitForElementByXPath("//cg-date-picker//parent::section//p", asserters.isDisplayed, 60000);
    },
    getTextOnrevealInStudentCalendar: function (browser) {
      return browser
          .waitForElementByXPath("//cg-date-picker//parent::section//cg-date-picker//label", asserters.isDisplayed, 60000);
    },

    clickOnCalendar: function (browser) {
      return browser
          .waitForElementByXPath("//cg-date-picker//parent::section//cg-date-picker//div", asserters.isDisplayed, 60000)
          .click();
    },
    getTextOnrevealInStudentCalender: function (browser) {
      return browser
          .waitForElementByXPath("//cg-date-picker//parent::section//cg-date-picker//label", asserters.isDisplayed, 60000);
    },
    clickOnCalender: function (browser) {
      return browser
          .waitForElementByXPath("//cg-date-picker//parent::section//cg-date-picker//div", asserters.isDisplayed, 60000)
          .click();
    },
    selectRevealDate: function (browser) {
        return browser
            .waitForElementByCss("div[class='datepicker cg-calendar ng-isolate-scope'] .day.ng-scope.today", asserters.isDisplayed, 60000)
            .click();

    },

    doneButtonStatus: function (browser) {
      return browser
          .waitForElementByXPath("//cg-date-picker//parent::section//following-sibling::menu//button[contains(@class,'confirm')]", asserters.isDisplayed, 60000).getAttribute('aria-disabled');
    },
    clickOnDoneButton: function (browser) {
      return browser
          .waitForElementByXPath("//cg-date-picker//parent::section//following-sibling::menu//button[contains(@class,'confirm')]", asserters.isDisplayed, 60000)
          .click();
    },
    fetchDueDate: function (browser) {
      return browser
        .waitForElementByXPath("//cg-date-picker[contains(.,'Due Date')]//div[contains(@class,'datefield')]", asserters.isDisplayed, 10000);
    },

    getBackgroundColorOfCurrentDateIcon: function(browser) {
      return browser
          .execute("return getComputedStyle(document.querySelector('.today span.number')).getPropertyValue('background-color')");
    },
    fetchCountOfCreditsWithEachQuizResponse: function (browser) {
        return browser
            .waitForElementsByCss(".cas-credits", asserters.isDisplayed, 10000);
    },
    verifyRevealDateDisabled: function (browser) {
        return browser
            .waitForElementByCss(".cg-double-date-picker cg-date-picker[label-text='Reveal in Student Calendar']", asserters.isDisplayed, 60000);
    },

    verifyAssignmentNameTextboxDisabled: function (browser) {
        return browser
            .waitForElementByCss("#highest-possible", asserters.isDisplayed, 60000);
    },
    verifyScoreDisabled: function (browser) {
        return browser
            .waitForElementByXPath("//div[@class='text-input']//input[@id='assessment-name'and @type='text']", asserters.isDisplayed, 60000);
    },
    dragAssignmentOnCalenderView: function (browser, astOnFirstDate, astOnSecondDate, done){
      var pageLoadingTime = 0;
      Q.all([
         browser.waitForElementByXPath(astOnFirstDate, asserters.isDisplayed, 10000),
         browser.waitForElementByXPath(astOnSecondDate, asserters.isDisplayed, 10000)
      ]).then(function (els) {
       return browser
        .moveTo(els[0])
        .buttonDown()
        .moveTo(els[1])
        .buttonUp()
        // .waitForElementByXPath(astOnFirstDate, asserters.isDisplayed, 10000)
        //  .press()
        //  .mouseMove(els[1]).perform()
        .then(function(){
            takeQuizpo.pollingPageLoad(pageLoadingTime,browser,done,"Assignment is edited");
      });
    });
    },

    getCurrentDateNumber: function(browser){
      return browser
      .sleep(4000)
      .waitForElementByCss(".today.selected span[class='number ng-binding']", asserters.isDisplayed, 10000);
    },
    fetchCurrentDate: function(browser){
      return browser
    //  .waitForElementByXPath("//div[@class='day ng-scope today']//span[@class='number ng-binding']", asserters.isDisplayed, 10000);
    .execute("return document.getElementsByClassName('day ng-scope today')[1].getElementsByClassName('number ng-binding')[0].textContent")
  },
  getBackGrndColorOfBeforeCurrentDate: function(browser){
        return browser
          .sleep(3000)
          .execute("return getComputedStyle(document.querySelector('div.day.before-minimum-day:not(.name)')).getPropertyValue('background-image')");

  },
  highscoreCheckboxByDefaultSelected: function (browser) {
      return browser
          .waitForElementByXPath("//div[@class='score-type-radio radio-container ng-isolate-scope']", asserters.isDisplayed, 60000);
  },
  getBackGrndColorOfAfterDueDate: function(browser){
    return browser
    .sleep(1000)
  .execute("return getComputedStyle(document.querySelector('div.day.past-maximum-day:not(.name)  ')).getPropertyValue('background-image')");

},

clickOnRevealDatecalendar: function (browser) {
  return browser
  .waitForElementByXPath("//div[@class='cg-double-date-picker ng-isolate-scope']//div[2]//cg-date-picker//div[@class='datefield ng-binding']", asserters.isDisplayed, 10000)
  .click();
},
fetchDefaultTextOnDueDate: function (browser,count) {
  return browser
  .waitForElementByXPath("//div[@class='cg-double-date-picker ng-isolate-scope']//div["+ count +"]//div[@class='datefield ng-binding']", asserters.isDisplayed, 10000);
},
getBackGrndColorOfBeforeDueDate: function(browser){
  return browser
  .sleep(1000)
  .execute("return getComputedStyle(document.querySelector('div.day.before-today:not(.name):not(.selected)')).getPropertyValue('background-color')");
},
dropLowestScoreCheckboxstatus: function (browser) {
    return browser
        .waitForElementByCss(".drop-lowest.cg-checkbox.ng-isolate-scope", asserters.isDisplayed, 60000);
},
deleteAssessmentFromUI: function (browser) {
   return  browser
       .waitForElementByCss("#delete", asserters.isDisplayed, 60000)
       .click();
},

validateConfirmationBox: function(browser){
  return browser
  .waitForElementByCss("dialog[confirm-text='Delete']", asserters.isDisplayed, 10000);
},

getWarningImageUrl: function(browser){
  return browser
  .execute("return getComputedStyle(document.querySelector('.cg-modal.danger > div header')).getPropertyValue('background-image')");
},

getTextOnDeleteConfirmationPopUp: function(browser){
  return browser
  .execute("return getComputedStyle(document.querySelector('.cg-modal.danger > div header')).getPropertyValue('background-image')");
},

headerTextOnDeletePopup: function(browser){
   return browser
   .waitForElementByCss("dialog[confirm-text='Delete'] header h2", asserters.isDisplayed, 10000).text();
},

getWarningText: function(browser){
  return browser
  .waitForElementByCss("dialog[confirm-text='Delete'] .content div div", asserters.isDisplayed, 10000).text();
},

validateCancelBtn:function(browser){
  return browser
    .waitForElementByCss("dialog[confirm-text='Delete'] .buttons .cancel", asserters.isDisplayed, 10000).text();
},

validateDeleteBtn:function(browser){
  return browser
    .waitForElementByCss("dialog[confirm-text='Delete'] .buttons .confirm", asserters.isDisplayed, 10000).text();
},

clickOnCancelBtn:function(browser){
  return browser
    .waitForElementByCss("dialog[confirm-text='Delete'] .buttons .cancel", asserters.isDisplayed, 10000).click();
},

validateAssignmentIsPresent: function (browser, astname) {
    return browser
        // .waitForElementByXPath("(//div[contains(@class,'day ng-scope today')]//div[contains(@class,'event')])//span[contains(text(),'" + astname + "')]/ancestor::div[contains(@class,'event')]", asserters.isDisplayed, 60000)
        .hasElementByXPath("(//div[contains(@class,'day ng-scope today')]//div[contains(@class,'event')])//span[contains(text(),'" + astname + "')]/ancestor::div[contains(@class,'event')]");
},

clickOnDeleteBtn:function(browser){
  return browser
    .waitForElementByCss("dialog[confirm-text='Delete'] .buttons .confirm", asserters.isDisplayed, 10000).click();
},
getDueDateText: function(browser){
    return browser
      .waitForElementByXPath("(//div[@class='span-half']//div[@class='datefield ng-binding'])[1]", asserters.isDisplayed, 10000)
      .text();
},
getRevealDateText: function(browser){
    return browser
      .waitForElementByXPath("(//div[@class='span-half']//div[@class='datefield ng-binding'])[2]", asserters.isDisplayed, 10000)
      .text();
},
verifyErrorMessage: function (browser) {
  if(stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString())==="chrome"){
    return browser
      .sleep(5000)
      .hasElementByXPath("//div[@class='flash-alert tip-alert']");
    }
    else{
      return browser
        .sleep(5000)
        .hasElementByXPath("//div[@class='flash-alert error-alert']");
    }

},
getErrorMessage: function (browser) {
      return  browser
      .waitForElementByCss(".flash-alert.tip-alert ul li[class='ng-scope ng-binding']", asserters.isDisplayed, 60000).text().then(function(errorText){
        console.log(report.reportHeader() +
          report.stepStatusWithData("error message is displaying on dragging the assignment and error message is "+errorText, "failure") +
          report.reportFooter());
      });
},

validateAssignmentDetailsOnGradebook: function (browser) {
      return  browser
      .sleep(2000)
      .hasElementByCss(".assignment-col");
},
enterDueDateWithSevenDaysAhead: function (browser) {
    var dueDateOfNextMonth;
    return browser
        .waitForElementByXPath("(//div[contains(@class,'datefield ng-binding')])[1]", asserters.isDisplayed, 60000)
        .click()
        .hasElementByXPath("(//div[contains(@class,'assignment-nav-wrapper')]//div[contains(@class,'week ng-scope')]//parent::div//div[@class='day ng-scope'])[7]")
        .then(function (statusOfDayAfterSevenDays) {
          if(statusOfDayAfterSevenDays){
            return browser
               .waitForElementByXPath("(//div[contains(@class,'assignment-nav-wrapper')]//div[contains(@class,'week ng-scope')]//parent::div//div[@class='day ng-scope'])[7]", asserters.isDisplayed, 60000)
               .click();
          }else{
                return browser
                .hasElementByXPath("(//div[contains(@class,'assignment-nav-wrapper')]//div[contains(@class,'week ng-scope')]//parent::div//div[@class='day ng-scope'])[1]").then(function (statusOfDaysRemainingInThisMonth) {
                  console.log(statusOfDaysRemainingInThisMonth);
                  if(statusOfDaysRemainingInThisMonth == true){
                      return browser
                      .sleep(2000)
                      .waitForElementsByXPath("//div[contains(@class,'assignment-nav-wrapper')]//div[contains(@class,'week ng-scope')]//parent::div//div[@class='day ng-scope']", asserters.isDisplayed, 60000).then(function (countsOfRemainingDays) {
                      var countsOfRemainingDaysInCurrentMonth = _.size(countsOfRemainingDays);
                      if(countsOfRemainingDaysInCurrentMonth < 6){
                      dueDateOfNextMonth = 6-countsOfRemainingDaysInCurrentMonth;
                       return browser
                       .waitForElementByXPath("//div[@class='span-half']//cg-date-picker[@label-text='Due Date']//div[contains(@class,'next')]", asserters.isDisplayed, 10000)
                       .click()
                       .sleep(1000)
                       .waitForElementByXPath("(//div[@class='span-half']//cg-date-picker[@label-text='Due Date']//div[@class='week ng-scope']//div//span[text()='"+dueDateOfNextMonth+"'])[last()]", asserters.isDisplayed, 60000)
                       .click();
                      }else{
                        return browser
                        .waitForElementByXPath("//div[@class='span-half']//cg-date-picker[@label-text='Due Date']//div[contains(@class,'next')]", asserters.isDisplayed, 10000)
                        .click()
                        .sleep(1000)
                        .waitForElementByXPath("(//div[@class='span-half']//cg-date-picker[@label-text='Due Date']//div[@class='week ng-scope']//div//span[text()='1'])[last()]", asserters.isDisplayed, 60000)
                        .click();
                      }
                    });
                  }else{
                    dueDateOfNextMonth = 7;
                     return browser
                     .sleep(2000)
                     .waitForElementByXPath("//div[@class='span-half']//cg-date-picker[@label-text='Due Date']//div[contains(@class,'next')]", asserters.isDisplayed, 1000)
                     .click()
                     .sleep(2000)
                     .waitForElementByXPath("(//div[@class='span-half']//cg-date-picker[@label-text='Due Date']//div[@class='week ng-scope']//div//span[text()='"+dueDateOfNextMonth+"'])[last()]", asserters.isDisplayed, 60000)
                     .click();
                  }
        });
    }
  });
},
checkIfAssignmentSavedOnOneWeekAhead: function (browser, day) {
    var ast = assignmentpage.dragassignment.assignmentOnNextWeek;
    var res = stringutil.returnreplacedstring(ast, "{{}}", this.getAssignmentName());
    var resFinal =stringutil.returnreplacedstring(res, "[[]]", day);
    return browser
        .waitForElementByXPath(resFinal, asserters.isDisplayed, 60000)
        .execute("return window.getComputedStyle(document.evaluate(\"" + resFinal + "\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue.parentNode).getPropertyValue('background-color');");
},
clickOnAssessmentCreatedOnNextWeek: function (browser, day) {
    var ast = assignmentpage.dragassignment.assignmentOnNextWeek;
    var res = stringutil.returnreplacedstring(ast, "{{}}", this.getAssignmentName());
    var resFinal =stringutil.returnreplacedstring(res, "[[]]", day);
    return browser
        .waitForElementByXPath(resFinal, asserters.isDisplayed, 60000).click();
},

clickOnTodayDate: function (browser) {
    return browser
        .waitForElementByCss("div[class='datepicker cg-calendar ng-isolate-scope'] .day.today", asserters.isDisplayed, 60000)
        .click();

},
selectQuestion : function(browser, count){
  return browser
   .waitForElementByXPath("(//div[@class='full-width']//ul//li//div//span[@class='question'])["+count+"]", asserters.isDisplayed, 60000).click();
},

getAssignmentCountsOnListView : function(browser){
return browser
  .waitForElementsByXPath("//div[@class='assignment-list-container']//tbody//tr//td[contains(@data-heading,'Assignments')]", asserters.isDisplayed, 60000)
    // .then(function(readerContents) {
    // readerContents[0].elementsByXPath("//div[contains(@class,'ui-grid-viewport ng-isolate-scope')]//div[@class='ui-grid-row ng-scope']")
  //   readerContents[0].elementsByXPath("//tbody//tr//td[contains(@data-heading,'Assignments')]");
  // });
},
getAssignmentNameUsingPosition : function(browser, countassignmentonlistview){
return browser
  // .waitForElementByXPath("((//div[contains(@class,'ui-grid-viewport ng-isolate-scope')]//div[contains(@class,'ui-grid-row ng-scope')])[" + countassignmentonlistview + "]//div[contains(@class,'ui-grid-cell')]//div)[1]")
   .waitForElementByXPath("(//tbody//tr//td[contains(@data-heading,'Assignments')])[" + countassignmentonlistview + "]")
  .text();
}
};
