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

describe(scriptName + '4LTR (' + 'STUDENT' + ') :: TAKE PRACTICE QUIZ MULTIPLE TIMES FROM CHAPTERS', function() {
	var browser;
	var allPassed = true;
	var userType;
	var practiceQuizValidationStatus = "failure";
	var product;
	var courseName;
	var pageLoadingTime;
	var totalTime;
	var practiceQuizCount;

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
		practiceQuizCount = parseInt(process.env.PRACTICE_QUIZ_ATTEMPT_COUNT.toString());
		data = loginPage.setLoginData(userType);
		totalTime = 0;

		//Reports
		console.log(report.formatTestName("CAS INTEGRATION TEST :: STUDENT ::  TAKE PRACTICE QUIZ MULTIPLE TIMES FROM CHAPTERS"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***createPracticeQuizMultipleTimes.js***"));
		console.log("practiceQuizCount" + practiceQuizCount);
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

	for (var i = 0; i <= 5000; i++) {

		it(". Wait for page load", function(done) {
			console.log("i" + i)
			browser.sleep(3000).then(function() {
				done();
			})
		});

		it(". Launch a Practice quiz", function(done) {
			practiceQuizCreation.navigateToPracticeQuizFromChapters(browser).then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
		});

		it(". Take a Practice quiz from Chapter and exit", function(done) {
			//Call this function if you want a specific block to timeout after a specific time interval
			this.timeout(courseHelper.getElevatedTimeout("quiz"));
			takeQuizpo.takeQuiz(browser, done);

		});

		it(". Wait for page load", function(done) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});

		it(". Exit the page from quiz results page", function(done) {
			takeQuizpo.clickExitButtonOnResultsPage(browser).then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
		});

	}

	it(". Log out as Student", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userSignOut.userSignOut(browser, done);
	});

});

//total test case : 9
