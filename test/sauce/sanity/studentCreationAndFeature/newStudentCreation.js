require('colors');
var wd = require('wd');
var dataUtil = require("../../util/date-utility");
var stringutil = require("../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var session = require("../../support/setup/browser-session");
var createNewCoursepo = require("../../support/pageobject/" + pageobject + "/" + envName + "/createNewCoursepo");
var brainPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var testData = require("../../../../test_data/data.json");
var courseHelper = require("../../support/helpers/courseHelper");
var report = require("../../support/reporting/reportgenerator");
var asserters = wd.asserters;
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'STUDENT REGISTRATION', function() {
	var browser;
	var allPassed = true;
	var userType;
	var setDate;
	var courseName;
	var coursekey = "Empty";
	var product;
	var totalTime;
	var serialNumber = 0;

	before(function(done) {
		browser = session.create(done);
		setDate = testData.courseAccessInformation.DateBeforeToday;
		newCourseData = testData.instructorResourceCenter;

		userType = "instructor";

		product = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString()) || testData.existingCourseDetails.product;

		if (product === "default") {
			product = testData.existingCourseDetails.product;
		}
		// courseName = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_COURSE.toString()) || testData.existingCourseDetails.coursename;
		data = loginPage.setLoginData(userType);
		totalTime = 0;
		courseName = product + " " + "COURSE FOR NEW STUDENT";
		//Reports
		console.log(report.formatTestName("NEW STUDENT REGISTRATION"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***newStudentRegistration.js***"));
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
		this.timeout(courseHelper.getElevatedTimeout("newStudentRegistration"));
		var studentId = loginPage.generateStudentId();
		loginPage.generateStudentAccount(browser, studentId).then(function() {
			done();
		});
	});
});
