require('colors');

var wd = require('wd');
var dataUtil = require("../../util/date-utility");
var stringutil = require("../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var olr = require("../../support/pageobject/" + pageobject + "/" + envName + "/olr");
var gateway = require("../../support/pageobject/" + pageobject + "/" + envName + "/gateway");
var brainPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var userAccountAction = require("../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var session = require("../../support/setup/browser-session");
var testData = require("../../../../test_data/mindlinks/mindlinks.json");
var courseHelper = require("../../support/helpers/courseHelper");
var report = require("../../support/reporting/reportgenerator");
var asserters = wd.asserters;
var request = require('supertest')(gateway.getAssignmentURL());
var util = require('util');
var _ = require('underscore');
var path = require('path');
var scriptName = path.basename(__filename);

describe(scriptName + 'GATEWAY/MINDLINKS::OPENING 4LTR ASSIGNMENTS FROM EXTERNAL PLATORMS THROUGH CENGAGE GATEWAY', function() {
	var browser;
	var totalTime;
	var allPassed = true;
	var serialNumber = 0;

	before(function(done) {
		browser = session.create(done);
		totalTime = 0;
		//Reports
		console.log(report.formatTestName("GATEWAY/MINDLINKS::OPENING 4LTR ASSIGNMENTS FROM EXTERNAL PLATORMS THROUGH CENGAGE GATEWAY"));
		console.log(report.formatTestScriptFileName("***gatewayassignmentvalidation.js***"));

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


	it(". Open the 4LTR assignments from external application for a valid assignmentId", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		request.get('/' + gateway.getDetails().course.assignment.courseCgi)
			.expect(200)
			.then(function(res) {
				var assignment = res.body;
				assignmentCgi = _.result(_.find(assignment, function(chr) {
					return chr.name === gateway.getDetails().course.assignment.nameonhtml;
				}), 'activityId');

				//USING THE SOAP getToken to get the login token
				olr.getToken(gateway.getDetails().student.id).then(function(token) {
					//console.log("Resolved value"+token);
					gateway.constructURL(token, assignmentCgi).then(function(launchURL) {
						console.log(launchURL);
						browser.get(launchURL)
							.waitForElementByXPath("//a[contains(text(),'" + gateway.getDetails().course.assignment.nameonhtml + "')]", asserters.isDisplayed, 60000).waitForElementByXPath("//a[contains(text(),'" + gateway.getDetails().course.assignment.nameonhtml + "')]")
							.text().should.eventually.include("" + gateway.getDetails().course.assignment.name + "")
							.then(function(name) {
								console.log(report.reportHeader() +
									report.stepStatusWithData("MindLinks Validation using URL \"" + launchURL + "\" for a valid assignment\" ", name + " \"", "success") +
									report.reportFooter());
							})
							.nodeify(done);
					});

				});
			});
	});

	it(". Open the 4LTR assignments from external application for an invalid assignmentId", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		request.get('/' + gateway.getDetails().course.assignment.courseCgi)
			.expect(200)
			.then(function(res) {
				var assignment = res.body;
				assignmentCgi = _.result(_.find(assignment, function(chr) {
					return chr.name === gateway.getDetails().course.assignment.nameonhtml;
				}), 'activityId');
				//console.log("Asssignment id : "+assignmentCgi);
				//USING THE SOAP getToken to get the login token
				olr.getToken(gateway.getDetails().student.id).then(function(token) {

					gateway.constructURL(token, "Jumbojack").then(function(launchURL) {

						//console.log(launchURL);

						browser.get(launchURL)
							.waitForElementByCss("div.flash-alert ul li:nth-child(1)", asserters.isDisplayed, 60000).elementByCss("div.flash-alert ul li:nth-child(1)")
							.text().should.eventually.include(gateway.getGlobalOptions().assignment.message)
							.then(function(message) {
								console.log(report.reportHeader() +
									report.stepStatusWithData("MindLinks Validation using URL \"" + launchURL + "\" for an invalid assignment has displayed message \" ", message + " \"", "success") +
									report.reportFooter());
							})
							.nodeify(done);
					});
				});
				//done();
			});
	});
});
