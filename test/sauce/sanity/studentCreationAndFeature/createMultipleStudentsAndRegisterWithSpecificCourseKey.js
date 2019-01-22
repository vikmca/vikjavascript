require('colors');
var dataUtil = require("../../util/date-utility");
var stringutil = require("../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var userAccountAction = require("../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var studyBitCreation = require("../../support/pageobject/" + pageobject + "/" + envName + "/createStudyBit");
var tocPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/tocpo");
var wd = require('wd');
var asserters = wd.asserters;
var _ = require('underscore');
var dataUtil = require("../../util/date-utility");
var loginPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var basicpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var session = require("../../support/setup/browser-session");
var testData = require("../../../../test_data/data.json");
var createNewCoursepo = require("../..//support/pageobject/" + pageobject + "/" + envName + "/createNewCoursepo");
var clearAllSavedContent = require("../../support/pageobject/" + pageobject + "/" + envName + "/clearData");
var tocPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/tocpo");
var courseHelper = require("../../support/helpers/courseHelper");
var report = require("../../support/reporting/reportgenerator");
var chaptertile = require("../../support/pageobject/" + pageobject + "/" + envName + "/chaptertileverificationpo.js");
var userSignOut = require("../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var copyCoursePage = require("../../support/pageobject/" + pageobject + "/" + envName + "/copyCoursepo.js");
var dropCourseFromStudent = require("../../support/pageobject/" + pageobject + "/" + envName + "/dropCoursepo");
var path = require('path');
var scriptName = path.basename(__filename);
var courseKey1;
const editJsonFile = require("edit-json-file");
var saveNoOfstudentCreated = editJsonFile("test_data/noOfStudentCreatedWith_CreateMultiStudentScript.json");
var createdStudentNo;

describe(scriptName + 'CREATE MULTIPLE STUDENTS AND REGISTER WITH SINGLE COURSE', function() {
	var alreadyExistStudent;
	var browser;
	var allPassed = true;
	var userType;
	var setDate;
	var courseName;
	var coursekey = "Empty";
	var coursekeystatus = "failure";
	var courseCGI = "undefined";
	var aggregationCompletionTime = "Never Completed or took more time than expected";
	var aggregationStatus = "failure";
	var courseCreationStatus = "failure";
	var productData;
	var pageLoadingTime;
	var totalTime;
	var product;
	var serialNumber = 0;
	var newCourseName;
	var editedCourseName;
	var newId;
	var startIndex = parseInt(process.env.RUN_IN_KEYWORDFORID.toString());
	var noOfStudent = parseInt(process.env.RUN_IN_NOOFSTUDENT.toString());
	before(function(done) {

		createdStudentNo = saveNoOfstudentCreated.get("StudentCreatedOn_" + stringutil.removeBoundaryQuotes(process.env.RUN_ENV.toString()));

		browser = session.create(done);
		setDate = testData.courseAccessInformation.DateBeforeToday;
		newCourseData = testData.instructorResourceCenter;
		userType = "instructor";
		product = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString()) || testData.existingCourseDetails.product;
		if (product === "default") {
			product = testData.existingCourseDetails.product;
		}
		courseName = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_COURSE.toString()) || testData.existingCourseDetails.coursename;
		newCourseName = product + " " + courseHelper.getUniqueCourseName();
		editedCourseName = "Edit" + product + " " + courseHelper.getUniqueCourseName();
		newCourseName = process.env.RUN_FOR_PRODUCT.toString() + "QATESTING_FOR_NEW_STUDENT";
		editedCourseName = newCourseName;
		data = loginPage.setLoginData(userType);
		productData = loginPage.getProductData();
		totalTime = 0;
		//Reports
		console.log(report.formatTestName("CENGAGE MULTIPLE STUDENT CREATION"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("createMultipleStudentsAndRegisterWithSpecificCourseKey.js"));
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
			report.stepStatusWithData("CourseCGI and AssessmentCGI Generation, MAX Timeout set as ", dataUtil.millisecondsToStr(courseHelper.getCourseTimeOut())) +
			report.stepStatusWithData("Course Aggregation MAX Timeout set as ", dataUtil.millisecondsToStr(courseHelper.getCourseAggregationTimeOut())) +
			report.stepStatusWithData("Course Key Generated ", coursekey, coursekeystatus) +
			report.stepStatusWithData("Course CGI Generated ", courseCGI, courseCreationStatus) +
			report.stepStatus("Aggregation Status ", aggregationStatus) +
			report.stepStatusWithData("Aggregation process took ", aggregationCompletionTime, aggregationStatus) +
			report.reportFooter());
		console.log(report.formatTestTotalTime(totalTime, scriptName, allPassed));
		session.close(allPassed, done);
	});

	for (i = 0; i < noOfStudent; i++) {

		it(". Create a 4LTR Student. ", function(done) {
			if (stringutil.removeBoundaryQuotes(process.env.CREATE_STUDENT.toString()) == "yes") {
				studentId = loginPage.generateStudentId();
				newId = "qa.student." + stringutil.removeBoundaryQuotes(process.env.RUN_ENV.toString()) + "." + createdStudentNo + "@cengage.com";
				studentId = newId;
				console.log("STUDENT_ID ==  " + studentId);
				loginPage.setLoginData("student");
				loginPage.generateStudentAccount(browser, studentId, createdStudentNo).then(function() {
					process.env.RUN_FOR_STUDENT_USERID = "\"" + studentId + "\"";
					data = loginPage.setLoginData("student");
					createdStudentNo++;
					saveNoOfstudentCreated.set("StudentCreatedOn_" + stringutil.removeBoundaryQuotes(process.env.RUN_ENV.toString()), createdStudentNo);
					saveNoOfstudentCreated.save();
					done();
				});
			} else {
				done();
				console.log("No Student Created")
			}
		});

		it(". Register the Product", function(done) {
			this.timeout(courseHelper.getElevatedTimeout(360000));
			browser.sleep(4000)
				.hasElementByCss(".input-group.error").then(function(alreadyExist) {
					alreadyExistStudent = alreadyExist;
					if (stringutil.removeBoundaryQuotes(process.env.REGISTER_COURSE.toString()) == "yes" && alreadyExistStudent == false) {
						browser
							.waitForElementById("registerAccessCode", asserters.isDisplayed, 60000).elementById("registerAccessCode").click()
							.type(stringutil.removeBoundaryQuotes(process.env.RUN_FOR_COURSEKEY.toString()))
							.waitForElementByCss("a.viewDetailsBtn.register_button", asserters.isDisplayed, 60000).elementByCss("a.viewDetailsBtn.register_button")
							.click()
							.waitForElementByXPath("((//div[contains(@class,'form_container drop')]//tr)[2]//td)[2]", asserters.isDisplayed, 60000).text().then(function(instructorNameOnRegisterCourseWindow) {
								var instructorName = instructorNameOnRegisterCourseWindow;
								browser
									.waitForElementByCss("#apliaContinueForm a.small_green_button", asserters.isDisplayed, 60000).elementByCss("#apliaContinueForm a.small_green_button")
									.click()
									.then(function() {
										browser
											.sleep(3000)
											.waitForElementByCss(".dashboard_label span", asserters.isDisplayed, 60000).text().then(function(courseNameOnStudent) {
												var courseNameOnStydentDashboard = courseNameOnStudent;
												console.log(report.printTestData("COURSEKEY REGISTERED ", stringutil.removeBoundaryQuotes(process.env.RUN_FOR_COURSEKEY.toString())));
												console.log(report.printTestData("STUDENT LOGINID ", newId));
												console.log(report.printTestData("AND PASSWORD ", "T3sting"));
												console.log(report.printTestData("INSTRUCTOR NAME ", instructorName));
												console.log(report.printTestData("COURSE NAME ", courseNameOnStydentDashboard));
												done();
											});
									});
							});
					} else {
						done();
						console.log("No course registered for student")
					}
				});

		});

		it(". Log out as Student. ", function(done) {
			if (alreadyExistStudent == false) {
				userAccountAction.signOutFromSSO("student", browser).then(function() {
					done();
				});
			} else {
				done();
			}
		});


	}


});
