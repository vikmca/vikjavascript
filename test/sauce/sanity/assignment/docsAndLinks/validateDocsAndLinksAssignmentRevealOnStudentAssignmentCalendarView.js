require('colors');
var wd = require('wd');
var _ = require('underscore');
var asserters = wd.asserters;
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var menuPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var calendarNavigation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/navigationpo");
var assessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assessmentspo");
var studentassesmentspo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var documentAndLinksPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/documentAndLinkspo");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var documentsAndLinksData = require("../../../../../test_data/assignments/documentAndLinks.json");
var session = require("../../../support/setup/browser-session");
var testData = require("../../../../../test_data/data.json");
var courseHelper = require("../../../support/helpers/courseHelper");
var report = require("../../../support/reporting/reportgenerator");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var recursiveFnPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/recursiveFnPagepo");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'ASSIGNMENT :: REVEAL/HIDE STUDENT ASSIGNMENTS AND INSTRUCTOR LIST VIEW VALIDATION FOR DOCS AND LINK', function() {
	var browser;
	var allPassed = true;
	var userType;
	var setDate;
	var courseName;
	var assignmentCreationStatus = "failure";
	var product;
	var assignmentCount;
	var duedate;
	var revealdate;
	var pageLoadingTime;
	var totalTime;
	var assignmentName;
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
		totalTime = 0;
		console.log(report.formatTestName("ASSIGNMENT :: REVEAL/HIDE STUDENT ASSIGNMENTS AND INSTRUCTOR LIST VIEW VALIDATION"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***validateDocsAndLinksAssignmentRevealOnStudentAssignmentCalendarView.js***"));

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


	it(". Login to 4LTR Platform as Instructor", function(done) {
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

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Delete the assignments if its not already deleted", function(done) {
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

	it(". Click on '+' button and create Document and Link assignment", function(done) {
		this.timeout(120000);
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

	it(". Select D&L type assignment", function(done) {
		pageLoadingTime = 0;
		this.timeout(120000);
		calendarNavigation.selectDocumentsAndLinksTypeAssignment(browser, done);
	});

	it(". Complete the Document and Link form for system created assignment", function(done) {
		documentAndLinksPage.enterName(browser).then(function() {
			assessmentsPage.enterRevealDateNextMonth(browser)
				.then(function() {
					documentAndLinksPage.enterDescription(browser)
						.nodeify(done);
				});
		});
	});

	//Refer bug id LTR-4164 and LTR-4042 for more details
	it(". Click on add attachment button and validate 'Select' button presence status, back button should be functional and also validate the select button status should be changed after attaching the documents", function(done) {
		documentAndLinksPage.clickOnAddAttachment(browser).then(function() {
			documentAndLinksPage.selectButtonDisabledStatus(browser).then(function() {
				documentAndLinksPage.validateBackButtonFunctional(browser).text().then(function(addAnAttachmentsText) {
					documentAndLinksPage.selectButtonStatusAfterDocSelected(browser).then(function() {
						console.log(report.reportHeader() +
							report.stepStatusWithData("On clicking back button the page navigates to setting page and the text on add attachment button is displaying as :: ", addAnAttachmentsText, "success") +
							report.reportFooter());
						done();
					});
				});
			});
		});
	});

	it(". Add the attachments in the assignment", function(done) {
		documentAndLinksPage.clickOnAddAttachment(browser).then(function() {
			documentAndLinksPage.addTheAttachments(browser, done);
		});
	});

	it(". Save the Documents and Link type Assignment ", function(done) {
		this.timeout(260000);
		var assignmentCGITime = 0;
		documentAndLinksPage.saveAssignment(browser).then(function() {
			assignmentName = documentAndLinksPage.getAssignmentName();
			console.log(assignmentName);
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Verify Documents and Link type Assignment gets saved successfully", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		documentAndLinksPage.checkIfAssignmentSavedOnFuture(browser).then(function(value) {
			if (value.toString() === "rgb(255, 219, 238)") {
				assignmentCreationStatus = "success";
				console.log(report.reportHeader() +
					report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assignmentName, "success") +
					report.reportFooter());
				done();
			} else {
				assignmentCreationStatus = "failure";
				console.log(report.reportHeader() +
					report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assignmentName + " may not have received the assessmentCGI", "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Verify saved Documents and Link type Assignment contains added Attachment", function(done) {
		documentAndLinksPage.clickOnCreatedAssignment(browser).then(function() {
			documentAndLinksPage.verifyAddedAttachments(browser).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Saved assignment contains the added attachment", "success", "success") +
					report.reportFooter());
				done();
			});
		});
	});

	it(". Log out as Instructor", function(done) {
		userSignOut.userSignOut(browser, done);
	});

	it(". Login as student", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
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

	it(". Verify the none of the assignment is visible", function(done) {
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
		this.timeout(120000);
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
		calendarNavigation.clickOnAssignmentOnNextMonth(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Logged the reveal date and due date of the created assignment", function(done) {
		var LoadTime = 0;
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

	it(". Edit reveal date of the created assignment", function(done) {
		assessmentsPage.changeRevelAndDueDate(browser, 2, "Reveal in Student Calendar").then(function() {
			done();
		});
	});

	it(". Edit due date of the created assignment", function(done) {
		assessmentsPage.changeRevelAndDueDate(browser, 1, "Due Date").then(function() {
			done();
		});
	});

	it(". Save the Docs and Link assignment after edit due date", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		documentAndLinksPage.saveAssignment(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Reload the page and navigate to the current month", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Verify  edited assignment present on current date", function(done) {
		recursiveFnPage.verifyEditedAstPresentOnCurrentDate(browser, done);
	});

	it(". Open the created assignment", function(done) {
		pageLoadingTime = 0;
		this.timeout(courseHelper.getElevatedTimeout());
		assessmentsPage.clickOnAssignmentOnCurrentDate(browser, assignmentName).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is opened on edit panel");
		});
	});

	it(". Edit description of documents and link type assignment", function(done) {
		pageLoadingTime = 0;
		documentAndLinksPage.editDescriptionText(browser).then(function() {
			documentAndLinksPage.saveAssignment(browser).then(function() {
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved on edit panel");
			});
		});
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

	it(". Wait for page loading", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
	});

	it(". Click on the current date cell verify Document and Link assignment is present", function(done) {
		studentassesmentspo.clickOnCurrentDateCellAndValidateAssessment(browser).then(function() {
			done()
		});
	});

	it(". Verify Document and Link assignment present on current date", function(done) {
		var DNRast = documentAndLinksPage.getAssignmentName().toUpperCase();
		studentassesmentspo.validateDocsAndChapterContentAstOnCurrentDate(browser, DNRast).then(function() {
			console.log(report.reportHeader() +
				report.stepStatusWithData("DNL assignment is present on current date of student calendar:: ", "success") +
				report.reportFooter());
			done();
		});

	});

	//Refer bug id LTR-4136 for more details
	it(". Validate edited description field present on student assignment activity panel", function(done) {
		documentAndLinksPage.checkIfEditedDescriptionTextPresentOnStudent(browser).text().then(function(editedDescriptionText) {
			if (editedDescriptionText === documentsAndLinksData.editedDescriptionOnDocAndLinkAst.descriptionField) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("edited description is present on student assignment activity panel", editedDescriptionText, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("edited description is not present on student assignment activity panel", editedDescriptionText, "failure") +
					report.reportFooter());
			}
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
		this.timeout(120000);
		loginPage.launchACourse(userType, courseName, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate to Assignments page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Delete the created Documents and Link assignments", function(done) {
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

	it(". Log out as Instructor", function(done) {
		userSignOut.userSignOut(browser, done);
	});

	function polling(assignmentCGITime, browser, done, astType) {
		astType.checkIfAssignmentSavedOnFuture(browser).then(function(value) {
			 
			if (value.toString() === "rgb(0, 0, 0)") {
				browser.sleep(1000);
				assignmentCGITime = assignmentCGITime + 2000;
				polling(assignmentCGITime, browser, done, astType);
			} else {
				if (value.toString() === "rgb(255, 219, 238)" || value.toString() === "rgb(236, 41, 142)") {
					var timeTaken = assignmentCGITime / 1000;
					console.log(report.reportHeader() +
						report.stepStatusWithData("Instructor created an Document and Link type assignment called :: " + astType.getAssignmentName() + " takes time in CGI ", timeTaken + " seconds", "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Instructor created an Document and Link type assignment called :: ", astType.getAssignmentName() + " is not created successfully", "failure") +
						report.reportFooter());

				}
			}
		});
	}
});
