/**
 * Created by nbalasundaram on 10/1/15.
 */
require('colors');

var wd = require('wd');
var dataUtil = require("../../../util/date-utility");
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var session = require("../../../support/setup/browser-session");
var testData = require("../../../../../test_data/data.json");
var report = require("../../../support/reporting/reportgenerator");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var studybit = require("../../../support/pageobject/" + pageobject + "/" + envName + "/studybitpo");
var practiceQuizCreation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var _ = require('underscore');
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var courseHelper = require("../../../support/helpers/courseHelper");
var path = require('path');
var scriptName = path.basename(__filename);

describe(scriptName + '4LTR (' + 'STUDENT' + ') :: TAKE PRACTICE QUIZ FROM CHAPTERS', function() {
	var browser;
	var allPassed = true;
	var userType;
	var practiceQuizValidationStatus = "failure";
	var product;
	var courseName;
	var pageLoadingTime;
	var totalTime;
	var serialNumber = 0;

	before(function(done) {

		browser = session.create(done);

		userType = "student";

		product = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString()) || testData.existingCourseDetails.product;

		if (product === "default") {
			product = testData.existingCourseDetails.product;
		}
		courseName = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_COURSE.toString()) || testData.existingCourseDetails.coursename;
		if (courseName === "default") {

			courseName = testData.existingCourseDetails.coursename;
		}
		browserName = stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString());
		data = loginPage.setLoginData(userType);
		totalTime = 0;

		//Reports
		console.log(report.formatTestName("CAS INTEGRATION TEST :: STUDENT ::  TAKE PRACTICE QUIZ FROM CHAPTERS"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***takeAPracticeQuizAsStudent.js***"));
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
		console.log(report.reportHeader() +
			report.stepStatus("Take Practice Quiz from chapter - Validation status ", practiceQuizValidationStatus) +
			report.reportFooter());
		console.log(report.formatTestTotalTime(totalTime, scriptName, allPassed));
		session.close(allPassed, done);
	});

	// for(var i=0;i<1000;i++){
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

	it(". Navigate to StudyBoard ", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Navigate to Past Quiz", function(done) {
		practiceQuizCreation.navigateToPastQuiz(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Log the count of past quizzes at present date", function(done) {
		countOfPastQuiz = 0;
		practiceQuizCreation.getStatusOfPastQuizPresentForCurrentDate(browser, dataUtil.getDateFormatForPastQuiz()).then(function(statusOfPastQuiz) {
			if (statusOfPastQuiz) {
				practiceQuizCreation.validatePastQuizPresentForCurrentDate(browser, dataUtil.getDateFormatForPastQuiz()).then(function(pastQuiz) {
					countOfPastQuiz = _.size(pastQuiz);
					console.log(report.reportHeader() +
						report.stepStatusWithData("Count of past quizzes on current date", countOfPastQuiz, "success") +
						report.reportFooter());
					done();
				});
			} else {
				countOfPastQuiz = 0;
				console.log(report.reportHeader() +
					report.stepStatusWithData("Count of past quizzes on current date", countOfPastQuiz, "success") +
					report.reportFooter());
				done();
			}
		});
	});

	it(". Click on back button on view past quiz page", function(done) {
		practiceQuizCreation.clickOnBackButton(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});


	it(". Launch a Practice quiz", function(done) {
		practiceQuizCreation.navigateToPracticeQuizFromChapters(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	//LTR-5399
	it(". LTR-5399 :: Validate that CAS error should not be aapear on launching the practice quiz", function(done) {
		takeQuizpo.errorOnQuizLaunch(browser).then(function(presenceStatus) {
			if (!presenceStatus) {
				takeQuizpo.getQuestionCounts(browser).then(function(questionCounts) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Practice Quiz is launched without any error and questions count is", _.size(questionCounts), "success") +
						report.reportFooter());
					done();
				});
			} else {
				takeQuizpo.getErrorText(browser).then(function(errorText) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Error message is appearing on the Practice Quiz launch i.e.", errorText, "failure") +
						report.reportFooter());
				});
			}
		});
	});

	it(". Take a Practice quiz from Chapter and exit", function(done) {
		//Call this function if you want a specific block to timeout after a specific time interval
		this.timeout(courseHelper.getElevatedTimeout("quiz"));
		takeQuizpo.takeQuiz(browser, done);

	});

	it(" Refresh the page and wait for page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	//Refer bug id LTR-4348 for more details
	it(" Validate on clicking refresh button on results page should not restart an attempt", function(done) {
		studybit.validateAttemptOnRefreshing(browser).then(function(casStatus) {
			if (!casStatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Quiz does not start after refreshing the page on results page", casStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Quiz does not start after refreshing the page on results page", casStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Navigate to Past practice Quiz button", function(done) {
		practiceQuizCreation.clickOnPastQuizButton(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Validate the attempted practice quiz is present on past quiz", function(done) {
		practiceQuizCreation.validatePastQuizPresentForCurrentDate(browser, dataUtil.getDateFormatForPastQuiz()).then(function(pastQuiz) {
			var countOfPastQuizAfterAttempt = _.size(pastQuiz);
			var countOfOldPracticeQuizPlusOne = countOfPastQuiz + 1;
			if (countOfPastQuizAfterAttempt === countOfOldPracticeQuizPlusOne) {
				practiceQuizValidationStatus = "success";
				console.log(report.reportHeader() +
					report.stepStatusWithData("Count of past quizzes on current date " + countOfOldPracticeQuizPlusOne + " is compared with", countOfPastQuizAfterAttempt, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Count of past quizzes on current date " + countOfOldPracticeQuizPlusOne + " is compared with", countOfPastQuizAfterAttempt, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Log out as Student", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userSignOut.userSignOut(browser, done);
	});

	// }
});

//total test case : 9
