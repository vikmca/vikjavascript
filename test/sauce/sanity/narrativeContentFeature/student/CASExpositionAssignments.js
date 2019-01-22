require('colors');
var wd = require('wd');
var testData = require("../../../../../test_data/data.json");
var session = require("../../../support/setup/browser-session");
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var tocPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/tocpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var casTestPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var studentAssessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var recursiveFnPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/recursiveFnPagepo");
var report = require("../../../support/reporting/reportgenerator");
var courseHelper = require("../../../support/helpers/courseHelper");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'CAS EXPOSITION ASSIGNMENTS VALIDATION', function() {
	var browser;
	var allPassed = true;
	var userType;
	var courseName;
	var product;
	var data;
	var productData;
	var totalTime;
	var serialNumber = 0;

	before(function(done) {
		browser = session.create(done);
		userType = "student";
		product = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString());
		if (product === "default") {
			product = testData.existingCourseDetails.product;
		}
		courseName = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_COURSE.toString());
		if (courseName === "default") {
			courseName = testData.existingCourseDetails.coursename;
		}
		data = loginPage.setLoginData(userType);
		productData = loginPage.getProductData();
		totalTime = 0;
		//Reports
		console.log(report.formatTestName("CAS EXPOSITION ASSIGNMENTS VALIDATION"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***CASExpositionAssignments.js***"));
	});

	beforeEach(function(done) {
		this.currentTest.title = ++serialNumber + this.currentTest.title;
		brainPage.closePopupWindowFromJavaScript(browser);
		done();
	});

	afterEach(function(done) {
		allPassed = allPassed && (this.currentTest.state === 'passed');
		console.log(report.reportHeader() +
			report.testStatus(scriptName, this.currentTest.title, this.currentTest.state, this.currentTest.duration) +
			report.reportFooter());
		totalTime = totalTime + this.currentTest.duration;
		done();
	});

	after(function(done) {
		console.log(report.formatTestTotalTime(totalTime, scriptName, allPassed));
		session.close(allPassed, done);
	});


	it(". Login to 4LTR platform as student", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		data = loginPage.setLoginData(userType);
		//Reports
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Course and launch", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		loginPage.launchACourse(userType, courseName, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Click on List view", function(done) {
		tocPage.selectListView(browser).then(function() {
			done();
		});
	});

	it(". Navigate to a Chapter", function(done) {
		var chapternavigation = productData.chapter.topic.casassignments.chapter;
		tocPage.navigateToAChapterByListView(productData.chapter.id, browser, chapternavigation);
		done();
	});

	it(". Navigate to a topic", function(done) {
		tocPage.navigateToATopicByListView(browser, done, productData.chapter.topic.casassignments.topic, 1);
	});

	it(". LTR-5399 :: LTR-5399 :: Verify error message should not be displayed in place of inline assessment", function(done) {
		pageLoadingTime = 0;
		studentAssessmentsPage.validateErrorStatusOnPage(browser).then(function(statusOfErrorPresence) {
			console.log("statusOfErrorPresence"+statusOfErrorPresence);
			if(statusOfErrorPresence){
				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5399 :: Error is displaying on the page",statusOfErrorPresence, "failure") +
					report.reportFooter());
					studentAssessmentsPage.getErrorMessage(browser).then(function(errorMessageText) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("LTR-5399:: Displayed error message test is ",errorMessageText, "failure") +
							report.reportFooter());
					});
			}else{
				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5399:: Error message is not displaying on the page on Practice Quiz launch",statusOfErrorPresence, "success") +
					report.reportFooter());
					studentAssessmentsPage.submitButtonPresenceStatus(browser).then(function(statusOfSubmitButtonPresence) {
						if(statusOfSubmitButtonPresence){
							console.log(report.reportHeader() +
								report.stepStatusWithData("LTR-5399:: Submit button presence status on the page ",statusOfSubmitButtonPresence, "success") +
								report.reportFooter());
							done();
						}else{
							console.log(report.reportHeader() +
								report.stepStatusWithData("Submit button presence status on the page ",statusOfSubmitButtonPresence, "success") +
								report.reportFooter());
						}
					});
			}
			});
	});
//LTR-2259 inline assessment is not desplaying
	it(". LTR-2259 : Navigate CAS Assignment and attempt one question and click on submit button", function(done) {
		casTestPage.attemptInlineAssessment(browser, done, productData.chapter.topic.casassignments.scrollY,
			productData.chapter.topic.casassignments.imgsrc);
	});

	it(". LTR-2259: Verify the Solution is displayed", function(done) {
		casTestPage.verifySolutionIsDisplayed(browser, done, productData.chapter.topic.casassignments.imgsrc).then(function() {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Selected term appears in the solution panel after submitting it", "", "success") +
				report.reportFooter());
			done();
		});
	});

	//     it(". Refresh the page and wait for page loading", function (done) {
	//       browser.refresh().sleep(5000).then(function(){
	//        pageLoadingTime = 0;
	//        takeQuizpo.pollingPageLoad(pageLoadingTime,browser,done,"Page is loaded");
	//      });
	//     });
	//
	//     it(". Click on the sliding topic pane again on the Topic page and verify the play and pause video on narrative view port", function (done) {
	//         tocPage.clickOnTOC(browser).then(function () {
	//           tocPage.navigateToTopic(browser, 3, 4).then(function(){
	//            pageLoadingTime = 0;
	//            takeQuizpo.pollingPageLoad(pageLoadingTime,browser,done,"Page is loaded");
	//          });
	//         });
	//   });
	//
	//    it(". Validate submit button should be disabled", function (done) {
	//        casTestPage.disabledSubmitInlineButtonStatus(browser).then(function(statusOfSubmitButton){
	//           if(statusOfSubmitButton){
	//               console.log(report.reportHeader() +
	//               report.stepStatusWithData("Submit button is disaabled before attempt all drop down questions", statusOfSubmitButton, "success")
	//               + report.reportFooter());
	//               done();
	//           }else{
	//               console.log(report.reportHeader() +
	//               report.stepStatusWithData("Submit button is disaabled before attempt all drop down questions", statusOfSubmitButton, "failure")
	//               + report.reportFooter());
	//           }
	//       });
	//   });
	//
	//    it(". Attempt all questions", function (done) {
	//        this.timeout(courseHelper.getElevatedTimeout("quiz"));
	//        recursiveFnPage.attemptInlineAssessment(browser,done);
	//  });
	//
	//  it(". Validate submit button should be enabled", function (done) {
	//      casTestPage.disabledSubmitInlineButtonStatus(browser).then(function(statusOfSubmitButton){
	//         if(!statusOfSubmitButton){
	//             console.log(report.reportHeader() +
	//             report.stepStatusWithData("Submit button is enabled", !statusOfSubmitButton, "success")
	//             + report.reportFooter());
	//             done();
	//         }else{
	//             console.log(report.reportHeader() +
	//             report.stepStatusWithData("Submit button is enabled", !statusOfSubmitButton, "failure")
	//             + report.reportFooter());
	//         }
	//     });
	// });
	//
	// it(". Submit the inline assessment", function (done) {
	//     casTestPage.clickOnSubmitInlineAssessmentButton(browser).then(function(){
	//            done();
	//    });
	// });
	//
	// it(". Validate Submit button should be hidden from the page", function (done) {
	//     casTestPage.submitButtonStatusOnPage(browser).then(function(statusOfSubmitButton){
	//        if(statusOfSubmitButton){
	//            console.log(report.reportHeader() +
	//            report.stepStatusWithData("Submit button should be hidden from the page", statusOfSubmitButton, "success")
	//            + report.reportFooter());
	//            done();
	//        }else{
	//            console.log(report.reportHeader() +
	//            report.stepStatusWithData("Submit button should be hidden from the page", statusOfSubmitButton, "failure")
	//            + report.reportFooter());
	//        }
	//    });
	//
	// });
	//
	//     it(". Validate credit should present after assessment submit", function (done) {
	//         casTestPage.validateCreditPresentForInlineAssessment(browser).then(function(textOfCredit){
	//            if(textOfCredit.indexOf("Credits:")>-1){
	//                console.log(report.reportHeader() +
	//                report.stepStatusWithData("Credit should be appear on the page", textOfCredit, "success")
	//                + report.reportFooter());
	//                done();
	//            }else{
	//                console.log(report.reportHeader() +
	//                report.stepStatusWithData("Credit should be appear on the page", textOfCredit, "failure")
	//                + report.reportFooter());
	//            }
	//     });
	// });


});
//total test case : 4
