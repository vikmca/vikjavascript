var wd = require('wd');
var asserters = wd.asserters;
var session = require("../../support/setup/browser-session");
var stringutil = require("../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var gatewayPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/gatewayintegrationpo.js");
var brainPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var report = require("../../support/reporting/reportgenerator");
var _ = require('underscore');
var testData = require("../../../../test_data/gatewayintegration.json");
var courseHelper = require("../../support/helpers/courseHelper");
var lmsObj = require("../../support/pageobject/" + pageobject + "/" + envName + "/lms");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + '4LTR (' + 'Instructor/Student' + ') :: 4LTR/CCS - Gateway LMS Integration Test Results', function() {

	var browser;
	var allPassed;
	var totalTime;
	var productOfInterest;
	var serialNumber = 0;

	before(function(done) {
		browser = session.create(done);
		userType = "instructor";
		product = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString());
		courseName = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_COURSE.toString());
		data = loginPage.setLoginDataForGateway(userType);
		var courseList = testData.coursename[0] + " " + process.env.COURSE_INDEX.toString()
		productOfInterest = _.find(testData.lmsproduct, function(productInList) {
			return productInList.id === product;
		});
		courseName = product + "_" + new Date().toISOString();
		totalTime = 0;
		//Reports
		console.log(report.formatTestName("4LTR/CCS - Gateway LMS Integration Test Results"));
		console.log(report.printTestData("LMS URL ", data.urlForLogin));
		console.log(report.printTestData("LMS User ", data.userId));
		console.log(report.printTestData("LMS Password ", data.password));
		console.log(report.printTestData("LMS Product ", testData.lmsproduct.title));
		console.log(report.printTestData("LMS Product deploymentId ", testData.lmsproduct.deploymentId));
		console.log(report.printTestData("LMS Course", courseList));
		console.log(report.printTestData("4LTR Course Name ", courseName));
		console.log(report.formatTestScriptFileName("validateEndToEndGatewayCourseLaunch.js"));
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

	it(". Sever the previous courses if any before creating a new course", function(done) {
		//The below block of code will try to delete the Gateway course associated with mindlinks since multiple course
		//creations are not allowed before severing the connections
		lmsObj.getToken().then(function(token) {
			lmsObj.getCoursesForDeployment(product).then(function(courseData) {
				console.log("Course Array size : " + _.size(courseData));

				if (_.size(courseData) > 0) {
					console.log(productOfInterest.title);
					//Added additional logic to loop through the course ids and delete all of them if there are more than one course
					_.each(courseData, function(record) {
						console.log("CourseId for deletion : " + record[0]);
						if (_.indexOf(record, productOfInterest.deploymentId) != -1) {
							console.log("Found the deployment id , time to sever the course to create a new course " + record[0]);
							lmsObj.deleteCourse(record[0]).then(function(status) {
								console.log("Cleanup of " + record[0] + " " + status + " !!!");
							})
						}
					});
					done();
				} else {
					console.log("Nothing to cleanup :) ");
					done();
				}
			})
		});
	});

	it(". Login to the blackboard LMS as a Gateway Instructor user", function(done) {
		data = loginPage.setLoginDataForGateway(userType);
		loginPage.loginToApplicationThroughGateway(browser, done);
	});

	it(". Click on the course link under my courses", function(done) {
		gatewayPage.clickOnManageMyCourse(browser).then(function() {
			loginPage.clickOnCourse(browser, testData.coursename[0]).then(function() {
				done();
			});
		});
	});

	it(". Click on content link on left panel", function(done) {
		gatewayPage.clickOnContent(browser).then(function() {
			done();
		});
	});

	it(". Open Tools > MindLinks to select the Mindlinks course", function(done) {
		gatewayPage.selectMindLinksMenuItemFromTools(browser).then(function() {
			done();
		});
	});

	it(". Launch the content source which is used to create the course", function(done) {
		gatewayPage.selectContentSource(browser, productOfInterest.title).then(function() {
			done();
		});
	});

	it(". Select the create course option and fill the form and continue", function(done) {
		gatewayPage.selectCreateCourseOptionAndFillTheFormAndContinue(browser, courseName).then(function() {
			done();
		});
	});

	it(". Create a link to 4LTR course in Blackboard course and continue", function(done) {
		gatewayPage.link4LTRCourse(browser).then(function() {
			done();
		});
	});

	it(". Add the created 4LTR course to content folder and wait for 30 seconds before launching the course till the aggregation is completed", function(done) {
		gatewayPage.add4LTRCourseLinkToContentFolder(browser).then(function() {
			done();
		});
	});


	it(". Launch the course and verify if the 4LTR course is launched successfully through blackboard LMS", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		gatewayPage.clickOnContent(browser).then(function() {
			loginPage.launchTheCourseForGatewayIntegration(browser, courseName, product).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Course  " + courseName + " is launched", "successfully", "success") +
					report.reportFooter());
				done();
			});
		});
	});


	it(". Click on the course link under my courses to delete the added mindlink", function(done) {
		gatewayPage.clickOnManageMyCourse(browser).then(function() {
			loginPage.clickOnCourse(browser, testData.coursename[0]).then(function() {
				gatewayPage.clickOnContent(browser).then(function() {
					done();
				});
			});
		});
	});


	it(". Delete the existing mindlink", function(done) {
		gatewayPage.getExistingMindlinkId(browser, courseName).then(function(idValue) {
			console.log("Id value " + idValue);
			var extractedDeleteId = idValue.slice(7, idValue.length);
			console.log("extractedDeleteId value " + extractedDeleteId);
			gatewayPage.deleteExistingMindlink(browser, extractedDeleteId, courseName).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Course " + courseName + " is deleted", "successfully", "success") +
					report.reportFooter());
				done();
			})

		});
	});


});
