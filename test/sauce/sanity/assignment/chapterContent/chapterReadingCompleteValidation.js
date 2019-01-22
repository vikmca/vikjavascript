require('colors');
var wd = require('wd');
var testData = require("../../../../../test_data/data.json");
var session = require("../../../support/setup/browser-session");
var stringutil = require("../../../util/stringUtil");
var pageobject;
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var recursiveFnPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/recursiveFnPagepo");
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var menuPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var calendarNavigation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/navigationpo");
var chapterReadingAssignmentPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/chapterReadingpo");
var studentchapterReadingAssignmentPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentChapterReadingpo");
var assessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assessmentspo");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var courseHelper = require("../../../support/helpers/courseHelper");
var report = require("../../../support/reporting/reportgenerator");
var _ = require('underscore');
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'INSTRUCTOR/STUDENT :: READING ASSIGNMENTS SAVE AND DISPLAY ON STUDENT ASSIGNMENT CALENDAR', function() {

	var browser;
	var allPassed = true;
	var userType;
	var courseName;
	var product;
	var productData;
	var pageLoadingTime;
	var data;
	var totalTime;
	var videosCount;
	var topicsCount;
	var serialNumber = 0;

	before(function(done) {
		browser = session.create(done);
		userType = "instructor";
		product = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString());
		courseName = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_COURSE.toString());
		if (product === "default") {
			product = testData.existingCourseDetails.product;
		}
		if (courseName === "default") {
			courseName = product + " " + courseHelper.getUniqueCourseName();
		}
		data = loginPage.setLoginData(userType);
		productData = loginPage.getProductData();
		totalTime = 0;
		//Reports
		console.log(report.formatTestName("INSTRUCTOR/STUDENT :: READING ASSIGNMENTS SAVE AND DISPLAY ON STUDENT ASSIGNMENT CALENDAR"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***chapterReadingCompleteValidation.js***"));
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

	it(". Login to 4LTR Platform", function(done) {
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

	it(". Navigate to Assignments Page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Delete the created assignment", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		assessmentsPage.deleteAssignment(browser, done);
	});

	it(". Refresh the assignment result page", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment result page is loaded");
			});
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Close flash on assignment page", function(done) {
		calendarNavigation.handleTheFlashAlert(browser).then(function() {
			done();
		});
	});

	it(". Select current date and open Chapter Content Assignments page", function(done) {
		calendarNavigation.selectADateForAssignment(browser)
			.then(function() {
				calendarNavigation.selectChapterReadingAssessment(browser, done);
			});
	});

	it(". Complete the Chapter Content assignments form and verify video links are present", function(done) {
		this.timeout(120000);
		var countVideo = 0;
		chapterReadingAssignmentPage.enterName(browser).then(function() {
			chapterReadingAssignmentPage.enterRevealDate(browser).then(function() {
				chapterReadingAssignmentPage.selectAChapter(browser, loginPage.getProductData().chapter.topic.documents.assignments[0].reading[0].chapter).then(function() {
					chapterReadingAssignmentPage.getVideosElement(browser).then(function(videoElement) {
						videosCount = _.size(videoElement);
						console.log(report.reportHeader() +
							report.stepStatusWithData("Chapter reading assignment with chapter ",
								loginPage.getProductData().chapter.topic.documents.assignments[0].reading[0].chapter + " on current date and", "success") +
							report.reportFooter());
						recursiveFnPage.verifyVideosElementAtChapterContent(browser, done);
					});
				});
			});
		});
	});

	it(". Validate topic links are present under Chapter Content assignments form", function(done) {
		this.timeout(120000);
		chapterReadingAssignmentPage.getTopicsElement(browser).then(function(topicElement) {
			topicsCount = _.size(topicElement);
			recursiveFnPage.validateTopicsPresentOnChapterReading(browser, done);
		});
	});

	it(". Save the Chapter Content assignment", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		chapterReadingAssignmentPage.saveAssignment(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	// https://jira.cengage.com/browse/LTR-5311
	it(". LTR-5311 :: Validate Page don't keep in loading state for a long after saving the Chapter Content assignment", function(done) {
		takeQuizpo.pageLoadingStateValue(browser).then(function(loadingState) {
			console.log(loadingState);
			if (!loadingState) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Page gets loaded successfully", loadingState, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Page gets loaded successfully", !loadingState, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Verify Chapter Content assignment gets saved", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		var assignmentCGITime = 0;
		polling(assignmentCGITime, browser, done, chapterReadingAssignmentPage, "Chapter Content");
	});

	it(". Log out as Instructor", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userSignOut.userSignOut(browser, done);
	});

	it(". Login as student", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userType = "student";
		data = loginPage.setLoginData(userType);
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

	it(". Navigate to Assignments page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Click on the current date cell on student assignment calendar", function(done) {
		basicpo.clickOnCurrentDate(browser).then(function() {
			done();
		});
	});

	it(". Validate if video link is present on Chapter Content assignment topic list on student assignment expanded view", function(done) {
		this.timeout(120000);
		recursiveFnPage.validateVideosPresentOnStudentAssignmentExpendedView(browser, done);
	});

	it(". Verify the chapter reading assignment and its attachment on Student's assignment view'", function(done) {
		studentchapterReadingAssignmentPage.verifyChapterReadingAssignmentPresentOnStudentEnd(browser, chapterReadingAssignmentPage.getAssignmentName()).then(function() {
			console.log(report.reportHeader() +
				report.stepStatusWithData(" STUDENT ASSIGNMENT :: Chapter reading link  ", productData.chapter.topic.documents.assignments[0].reading[0].chapter + " is Displayed to Student") +
				report.reportFooter());
			studentchapterReadingAssignmentPage.verifyChapterReadingAssignmentTopicPresentOnStudentEnd(browser, productData.chapter.topic.documents.assignments[0].reading[0].topic).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData(" STUDENT ASSIGNMENT :: Chapter/Topic reading link  ", productData.chapter.topic.documents.assignments[0].reading[0].topic + " is Displayed to Student") +
					report.reportFooter());
				done();
			});
		});
	});

	it(". Validate topics and videos count on Student's assignment view'", function(done) {
		studentchapterReadingAssignmentPage.verifyVideosCountPresentOnStudentEnd(browser, productData.chapter.topic.documents.assignments[0].reading[0].video).then(function(videosCountOnStudentEnd) {
			studentchapterReadingAssignmentPage.verifyTopicsCountOnPresentOnStudentEnd(browser, productData.chapter.topic.documents.assignments[0].reading[0].topic).then(function(topicsCountOnStudentEnd) {
				if (_.size(topicsCountOnStudentEnd) == topicsCount && _.size(videosCountOnStudentEnd) == videosCount) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Student :: Chapter Content assignment from specified chapter has same topics count as in instructor end" + _.size(topicsCountOnStudentEnd) + " video links, count " + _.size(videosCountOnStudentEnd) + "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Student :: Chapter Content assignment from specified chapter has same topics count as in instructor end" + _.size(topicsCountOnStudentEnd) + " video links, count " + _.size(videosCountOnStudentEnd) + "success") +
						report.reportFooter());
				}
			});
		});
	});

	it(". Log out as Student", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userSignOut.userSignOut(browser, done);
	});

	it(". Login as Instructor", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userType = "instructor";
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Product", function(done) {
		brainPage.selectProduct(product, browser, done);
	});

	it(". Select a Course and launch", function(done) {
		loginPage.launchACourse(userType, courseName, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate to Assignments page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Delete the created Reading assignment for cleanup", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		assessmentsPage.deleteAssignment(browser, done);
	});

	it(". Close flash on assignment page", function(done) {
		calendarNavigation.handleTheFlashAlert(browser).then(function() {
			done();
		});
	});

	it(". Log out as Instructor", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userSignOut.userSignOut(browser, done);
	});

	function polling(assignmentCGITime, browser, done, astType, assignmentType) {
		astType.checkIfAssignmentSaved(browser).then(function(value) {
			if (value.toString() === "rgb(0, 0, 0)") {
				browser.sleep(1000);
				assignmentCGITime = assignmentCGITime + 1000;
				polling(assignmentCGITime, browser, done, astType);
			} else {
				if (value.toString() === "rgb(236, 41, 142)") {
					var timeTaken = assignmentCGITime / 1000;
					console.log(report.reportHeader() +
						report.stepStatusWithData("Instructor created an " + assignmentType + " type assignment called :: " + astType.getAssignmentName() + " takes time in CGI ", timeTaken + " seconds", "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Instructor created an " + assignmentType + " type assignment called :: ", astType.getAssignmentName() + " is not created successfully", "failure") +
						report.reportFooter());
					// done();

				}
			}
		});
	}

});

//total test case : 18
