require('colors');
var wd = require('wd');
var testData = require("../../../../../test_data/data.json");
var session = require("../../../support/setup/browser-session");
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var footerpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/footerpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var report = require("../../../support/reporting/reportgenerator");
var _ = require('underscore');
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var courseHelper = require("../../../support/helpers/courseHelper");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + '4LTR FEATURES ::FOOTER COPYRIGHT LABELS VALIDATION', function() {
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

		userType = "instructor";

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
		console.log(report.formatTestName("4LTR FEATURES ::FOOTER COPYRIGHT LABELS VALIDATION"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***validateFooterCopyrightLabels.js***"));
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


	it(". Login to 4LTR platform as instructor", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		data = loginPage.setLoginData(userType);
		//Reports
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Product", function(done) {
		brainPage.selectProduct(product, browser, done);
	});

	it(". Select a Course and launch", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		loginPage.launchACourse(userType, courseName, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Validate presence of footer copyright label", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		footerpo.getCopyrightCount(browser, done);
	});

	it(". Click on all the footer links and validate all links are opened in new tab with correct URL", function(done) {
		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString()) === "safari" || process.env.RUN_IN_BROWSER.toString() === "\"internet explorer\"" || stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) == "mobile" || stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) == "iOS") {
			this.skip();
		} else {
			this.timeout(courseHelper.getElevatedTimeout(50000));
			footerpo.openAllTabs(browser, 1, "#copyright").then(function() {
				footerpo.openAllTabs(browser, 2, "EULA").then(function() {
					footerpo.openAllTabs(browser, 3, "primarypage").then(function() {
						footerpo.openAllTabs(browser, 4, "accessibility").then(function() {
							footerpo.openAllTabs(browser, 5, "privacy").then(function() {
								console.log(report.reportHeader() +
									report.stepStatusWithData("All Copyright labels are opened in new tab and opened url is ", "correct", "success") +
									report.reportFooter());
								done();
							});
						});
					});
				});
			});
		}
	});

	it(". Log out as Student", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userSignOut.userSignOut(browser, done);
	});

});
