require('colors');
var wd = require('wd');
var asserters = wd.asserters;
var _ = require('underscore');
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var stringutil = require("../../../util/stringUtil");
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var session = require("../../../support/setup/browser-session");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var studybit = require("../../../support/pageobject/" + pageobject + "/" + envName + "/studybitpo");
var testData = require("../../../../../test_data/data.json");
var report = require("../../../support/reporting/reportgenerator");
var courseHelper = require("../../../support/helpers/courseHelper");
var practiceQuizCreation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var path = require('path');
var scriptName = path.basename(__filename);
//pagefactory


describe(scriptName + '4LTR (' + 'INSTRUCTOR' + ') :: TAKE PRACTICE QUIZ FROM CHAPTERS', function() {
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
		userType = "instructor";
		product = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString()) || testData.existingCourseDetails.product;
		if (product === "default") {
			product = testData.existingCourseDetails.product;
		}
		courseName = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_COURSE.toString()) || testData.existingCourseDetails.coursename;
		if (courseName === "default") {
			courseName = testData.existingCourseDetails.coursename;
		}
		data = loginPage.setLoginData(userType);
		totalTime = 0;
		//Reports
		console.log(report.formatTestName("CAS INTEGRATION TEST :: INSTRUCTOR ::  TAKE PRACTICE QUIZ FROM CHAPTERS"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***takeAPracticeQuizAsInstructor.js***"));
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

	it(". Login to 4LTR platform as instructor", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		data = loginPage.setLoginData(userType);
		//Reports
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Product", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		brainPage.selectProduct(product, browser, done);
	});

	it(". Select a Course and launch", function(done) {
		loginPage.launchACourse(userType, courseName, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate to StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
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

	it(". Exit the page from quiz results page", function(done) {
		takeQuizpo.clickExitButtonOnResultsPage(browser).then(function() {
			practiceQuizValidationStatus = "success";
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

});
