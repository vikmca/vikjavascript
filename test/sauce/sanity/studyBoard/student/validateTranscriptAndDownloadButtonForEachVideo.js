require('colors');
var wd = require('wd');
var asserters = wd.asserters;
var testData = require("../../../../../test_data/data.json");
var session = require("../../../support/setup/browser-session");
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var recursiveFnPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/recursiveFnPagepo");
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var tocPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/tocpo");
var chaptertile = require("../../../support/pageobject/" + pageobject + "/" + envName + "/chaptertileverificationpo.js");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var report = require("../../../support/reporting/reportgenerator");
var _ = require('underscore');
var mediaquizpage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/mediaQuizpo");
var courseHelper = require("../../../support/helpers/courseHelper");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'STUDENT :: CHAPTER LIST VIEW VALIDATION', function() {
	var browser;
	var allPassed = true;
	var userType;
	var courseName;
	var product;
	var data;
	var productData;
	var pageLoadingTime;
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
		console.log(report.formatTestName("STUDENT :: 4LTR FEATURES :: vALIDATE TRANSCRIPT AND DOWNLOAD TRANSCRIPT BUTTON SHOULD PRESENT FOR EACH VIDEOS"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***validateTranscriptAndDownloadButtonForEachVideo.js***"));
		console.log(report.printTestData("CHAPTER " + productData.chapter.id + " ", productData.chapter.title));
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

	after(function (done) {
	    console.log(report.formatTestTotalTime(totalTime, scriptName, allPassed));
	    session.close(allPassed, done);
	});


	it(". Login to 4LTR platform as Student", function(done) {
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

	it(". Click on List view and Verify", function(done) {
		tocPage.clickonlistview(browser, done);
	});

	it(". Navigate to a Chapter", function(done) {
		tocPage.getChapterTitleonListView(productData.chapter.id, browser, 1)
			.then(function(textChapter) {
				textChapter.should.contain(productData.chapter.title);
				tocPage.getChapterTitleonListView(productData.chapter.id, browser, 2)
					.then(function(textChapter2) {
						console.log(textChapter2);
						textChapter2.should.contain(productData.chapter.title2);
					})
					.then(function() {
						tocPage.navigateToAChapterByListView(productData.chapter.id, browser, 1);
						done();
					});
			});
	});

	it(". Navigate to a 2nd topic from Chapter List View", function(done) {
		tocPage.navigateToATopicByListView(browser, done, productData.chapter.topic.id, 4);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Count the video in topics and verify it for topics", function(done) {
		this.timeout(10000000);
		recursiveFnPage.verifyTranscriptAndDownloadForEachVideos(browser, done);
	});

	it(". Log out as Student", function (done) {
	  this.timeout(courseHelper.getElevatedTimeout());
	    userSignOut.userSignOut(browser, done);
	});

});
