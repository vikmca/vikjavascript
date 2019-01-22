require('colors');
var wd = require('wd');
var asserters = wd.asserters;
var dataUtil = require("../../util/date-utility");
var stringutil = require("../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var userAccountAction = require("../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var session = require("../../support/setup/browser-session");
var studyBitCreation = require("../../support/pageobject/" + pageobject + "/" + envName + "/createStudyBit");
var brainPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var testData = require("../../../../test_data/data.json");
var clearAllSavedContent = require("../../support/pageobject/" + pageobject + "/" + envName + "/clearData");
var courseHelper = require("../../support/helpers/courseHelper");
var tocPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/tocpo");
var report = require("../../support/reporting/reportgenerator");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'CREATE A STUDENT ON ANY ENVIRONMENT AND REGISTER A COURSE', function() {
	var browser;
	var allPassed = true;
	var productData;
	var totalTime;
	var serialNumber = 0;

	before(function(done) {
		browser = session.create(done);
		productData = loginPage.getProductData();
		totalTime = 0;
		console.log(report.formatTestName("TEST :: CREATE A STUDENT ON ANY ENVIRONMENT AND REGISTER A COURSE"));
		console.log(report.formatTestScriptFileName("***studentCreation.js***"));
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


	it(". Create a 4LTR Student", function(done) {
		if (stringutil.removeBoundaryQuotes(process.env.CREATE_STUDENT.toString()) == "yes") {
			studentId = loginPage.generateStudentId();
			loginPage.setLoginData("student");
			loginPage.generateStudentAccount(browser, studentId).then(function() {
				process.env.RUN_FOR_STUDENT_USERID = "\"" + studentId + "\"";
				data = loginPage.setLoginData("student");
				console.log(report.formatTestName("NEW STUDENT DETAILS"));
				console.log(report.printTestData("STUDENT LOGINID ", data.userId));
				done();
			});
		} else {
			done();
			console.log("No Student Created")
		}
	});

	it(". Login as student", function(done) {
		data = loginPage.setLoginData("student");
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Register the Product", function(done) {
		if (stringutil.removeBoundaryQuotes(process.env.REGISTER_COURSE.toString()) == "yes") {
			browser
				.waitForElementById("registerAccessCode", asserters.isDisplayed, 60000).elementById("registerAccessCode")
				.type(stringutil.removeBoundaryQuotes(process.env.RUN_FOR_COURSEKEY.toString()))
				.waitForElementByCss("a.viewDetailsBtn.register_button", asserters.isDisplayed, 60000).elementByCss("a.viewDetailsBtn.register_button")
				.click()
				.waitForElementByCss("#apliaContinueForm a.small_green_button", asserters.isDisplayed, 60000).elementByCss("#apliaContinueForm a.small_green_button")
				.click()
				.then(function() {
					console.log(report.printTestData("COURSEKEY REGISTERED ", stringutil.removeBoundaryQuotes(process.env.RUN_FOR_COURSEKEY.toString())));
					done();
				})
		} else {
			done();
			console.log("No course registered for student")
		}
	});

	it(". Launch the Product", function(done) {
		browser
			.waitForElementByXPath("//span[contains(text(),'" + stringutil.removeBoundaryQuotes(process.env.RUN_FOR_COURSE.toString()) + "')]/..//following-sibling::li/a[contains(text(),'Open')]", asserters.isDisplayed, 60000)
			.click()
			.sleep(1000)
			.nodeify(done);
	});


	it(". Take the user to the course in grace period", function(done) {
		browser.windowHandle()
			.then(
				function(handle) {
					browser
						.waitForElementByCss(".gracePeriodBtn", asserters.isDisplayed, 60000)
						.click()
						.windowHandles().should.eventually.have.length(2)
						.window("childWindow")
						.sleep(10000)
						.nodeify(done);
				}
			)
	});


	it(". Handle EULA", function(done) {
		browser
			.elementByCssSelectorWhenReady(".read-terms-start-modal.ng-scope", 2000)
			.isDisplayed()
			.then(function(isDisplayed) {
				if (isDisplayed) {
					browser.
					elementByCssSelectorWhenReady("button[class='welcome-button']", 3000)
						.click()
						.elementByCssSelectorWhenReady(".welcome-accept-terms.ng-scope", 3000)
						.click()
						.sleep(1000)
						.elementByCssSelectorWhenReady("button[class='welcome-button']", 3000)
						.click()
						.sleep(1000)
						.elementByCssSelectorWhenReady(".welcome-modal.ng-scope>button", 3000)
						.click()
						.nodeify(done);
				} else {
					console.log("No Welcome model to dispose");
					done();
				}
			});
	});

	it(". Navigate to TOC ", function(done) {
		tocPage.navigateToToc(browser).nodeify(done);
	});

	it(". Navigate to a Chapter", function(done) {
		tocPage.getChapterTitle(productData.chapter.id, browser)
			.then(function(text) {
				text.should.contain(productData.chapter.title);
			})
			.then(function() {
				tocPage.navigateToAChapter(productData.chapter.id, browser)
					.nodeify(done);
			});
	});

	it(". Navigate to a topic", function(done) {
		tocPage.navigateToATopic(productData.chapter.id, productData.chapter.topic.id, browser)
			.then(function() {
				tocPage.disposeFirstVisitTopicModalIfVisible(browser).then(function() {
					tocPage.getTopicTitleHero(browser).then(function(text) {
						text.should.contain(productData.chapter.topic.titlehero)
					}).nodeify(done);
				});
			});
	});

	it(". Log out as Student", function(done) {
		userAccountAction.userSignOut(browser, done);
	});

});
