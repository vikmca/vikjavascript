require('colors');
var wd = require('wd');
var asserters = wd.asserters;
var _ = require('underscore');
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var menuPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var calendarNavigation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/navigationpo");
var assessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assessmentspo");
var chapterReadingAssignmentPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/chapterReadingpo");
var studentassesmentspo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var session = require("../../../support/setup/browser-session");
var testData = require("../../../../../test_data/data.json");
var courseHelper = require("../../../support/helpers/courseHelper");
var report = require("../../../support/reporting/reportgenerator");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var recursiveFnPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/recursiveFnPagepo");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'ASSIGNMENT :: REVEAL/HIDE STUDENT ASSIGNMENTS AND INSTRUCTOR LIST VIEW VALIDATION FOR CHAPTER CONTENT', function() {
	var browser;
	var allPassed = true;
	var userType;
	var setDate;
	var data;
	var productData;
	var courseName;
	var product;
	var assignmentCount;
	var duedate;
	var revealdate;
	var pageLoadingTime;
	var totalTime;
	var serialNumber = 0;

	before(function(done) {
		browser = session.create(done);
		setDate = testData.courseAccessInformation.DateBeforeToday;
		newCourseData = testData.instructorResourceCenter;
		userType = "instructor";
		product = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString());
		if (product === "default") {
			product = testData.existingCourseDetails.product;
		}
		courseName = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_COURSE.toString());
		if (courseName === "default") {
			courseName = product + " " + courseHelper.getUniqueCourseName();
		}
		data = loginPage.setLoginData(userType);
		productData = loginPage.getProductData();
		totalTime = 0;
		console.log(report.formatTestName("ASSIGNMENT :: REVEAL/HIDE STUDENT ASSIGNMENTS AND INSTRUCTOR LIST VIEW VALIDATION"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***validateChapterContentAssignmentRevealOnStudentAssignmentCalendarView.js***"));
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

	it(". Login to 4LTR Platform as instructor", function(done) {
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

	it(". Delete the past assignments if its not already deleted", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		assessmentsPage.deleteAssignment(browser, done);
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

	it(". Navigate to the next month on the assignment calendar view and Click on '+' button on assignment calendar", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.navigateToNextMonth(browser).then(function() {
			calendarNavigation.selectFirstDateFormNextMonth(browser).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Instructor has navigated to next month calendar view", "", "success") +
					report.reportFooter());
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Next month calendar is loaded");
			});
		});
	});

	it(". Create Chapter Content type assignment", function(done) {
		calendarNavigation.selectChapterReadingAssessment(browser, done);
	});

	it(". Complete the Chapter Content assignments form", function(done) {
		chapterReadingAssignmentPage.enterName(browser).then(function() {
			assessmentsPage.enterRevealDateNextMonth(browser).then(function() {
				chapterReadingAssignmentPage.selectAChapter(browser, productData.chapter.topic.documents.assignments[0].reading[0].chapter);
				console.log(report.reportHeader() +
					report.stepStatusWithData("Chapter Content assignment form has been filled by chapter :" +
						productData.chapter.topic.documents.assignments[0].reading[0].chapter,
						"Due and reveal date:  1st date of next month", "success") +
					report.reportFooter());
				done();
			});
		});
	});

	it(". Save the Chapter Content assignment and verify if it gets saved successfully", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		var assignmentCGITime = 0;
		chapterReadingAssignmentPage.saveAssignment(browser).then(function() {
			polling(assignmentCGITime, browser, done, chapterReadingAssignmentPage);
		});
	});

	it(". Login as student", function(done) {
		userType = "student";
		data = loginPage.setLoginData(userType);
		//Reports
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
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

	it(". Navigate to the next month on calendar view", function(done) {
		calendarNavigation.navigateToNextMonth(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Verify assignment should not be visible on student assignment calendar", function(done) {
		studentassesmentspo.assignmentVisibilityStatus(browser).then(function() {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Assignments with future date reveal date is hidden from student calendar :: ", "success") +
				report.reportFooter());
			done();
		});
	});

	it(". Log out as Student", function(done) {
		userSignOut.userSignOut(browser, done);
	});

	it(". Login as Instructor", function(done) {
		userType = "instructor";
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

	it(". Navigate to Assignments page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Navigate to the next month on the assignment calendar view", function(done) {
		calendarNavigation.navigateToNextMonth(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Open the created assignment", function(done) {
		var LoadTime = 0;
		this.timeout(courseHelper.getElevatedTimeout());
		browser
		calendarNavigation.clickOnAssignmentOnNextMonth(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Logged the reveal date and due date of the created Chapter Content assignment", function(done) {
		var LoadTime = 0;
		this.timeout(360000);
		assessmentsPage.getDueDateText(browser).then(function(duedateforassignment) {
			assessmentsPage.getRevealDateText(browser).then(function(revealdateforassignment) {
				duedate = duedateforassignment;
				revealdate = revealdateforassignment;
				console.log(duedate);
				console.log(revealdate);
				done();
			});
		});
	});

	it(". Edit reveal date of the created Chapter Content assignment with 2nd date of next month", function(done) {
		assessmentsPage.changeRevelAndDueDate(browser, 2, "Reveal in Student Calendar").then(function() {
			done();
		});
	});

	it(". Edit due date of the created assignment with 1st date of next month", function(done) {
		assessmentsPage.changeRevelAndDueDate(browser, 1, "Due Date").then(function() {
			done();
		});
	});

	it(". Save the chapter content assignment after edit due date", function(done) {
		chapterReadingAssignmentPage.saveAssignment(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Click on previous button for navigating to current month", function(done) {
		calendarNavigation.navigateCurrentMonthFromNextMonth(browser, done)
	});

	it(". Verify edited Chapter Content assignment is present on current date cell", function(done) {
		recursiveFnPage.verifyEditedAstPresentOnCurrentDate(browser, done);
	});

	it(". Log out as Instructor", function(done) {
		userSignOut.userSignOut(browser, done);
	});

	it(". Login as student", function(done) {
		userType = "student";
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
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

	it(". Click on the current date cell verify Chapter Content assignment is present", function(done) {
		studentassesmentspo.clickOnCurrentDateCellAndValidateAssessment(browser).then(function() {
			done()
		});
	});

	it(". Verify if Chapter Content assignment is present on current date", function(done) {
		var Chapterast = chapterReadingAssignmentPage.getAssignmentName().toUpperCase();
		console.log(Chapterast);
		studentassesmentspo.validateDocsAndChapterContentAstOnCurrentDate(browser, Chapterast).then(function() {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Chapter content assignment is present on current date of student calendar:: ", Chapterast, "success") +
				report.reportFooter());
			done();
		});
	});

	it(". Login as Instructor", function(done) {
		userType = "instructor";
		data = loginPage.setLoginData(userType);
		//Reports
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Product", function(done) {
		brainPage.selectProduct(product, browser, done);
	});

	it(". Select a Course and launch", function(done) {
		this.timeout(120000);
		loginPage.launchACourse(userType, courseName, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate to Assignments Page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Wait for page loading", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
	});

	it(". Delete the created Chapter Content assignments", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		assessmentsPage.deleteAssignment(browser, done);
	});

	it(". Wait for page loading", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
	});

	it(". Close flash on assignment page", function(done) {
		calendarNavigation.handleTheFlashAlert(browser).then(function() {
			done();
		});
	});

	it(". Log out as Instructor", function(done) {
		this.timeout(360000);
		userSignOut.userSignOut(browser, done);
	});

	function polling(assignmentCGITime, browser, done, astType) {
		astType.checkIfAssignmentSavedOnFuture(browser).then(function(value) {
			 
			if (value.toString() === "rgb(0, 0, 0)") {
				browser.sleep(1000);
				assignmentCGITime = assignmentCGITime + 2000;
				polling(assignmentCGITime, browser, done, astType);
			} else {
				if (value.toString() === "rgb(255, 219, 238)") {
					var timeTaken = assignmentCGITime / 1000;
					console.log(report.reportHeader() +
						report.stepStatusWithData("Instructor created an Chapter Reading type assignment called :: " + astType.getAssignmentName() + " takes time in CGI ", timeTaken + " seconds", "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Instructor created an Chapter Reading type assignment called :: ", astType.getAssignmentName() + " is not created successfully", "failure") +
						report.reportFooter());

				}
			}
		});
	}

});
