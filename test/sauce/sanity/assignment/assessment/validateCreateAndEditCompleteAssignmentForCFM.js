require('colors');
var wd = require('wd');
var asserters = wd.asserters;
var dataUtil = require("../../../util/date-utility");
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var menuPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo");
var calendarNavigation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/navigationpo");
var assessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assessmentspo");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var assessmentData = require("../../../../../test_data/assignments/assessments.json");
var session = require("../../../support/setup/browser-session");
var testData = require("../../../../../test_data/data.json");
var courseHelper = require("../../../support/helpers/courseHelper");
var casPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var report = require("../../../support/reporting/reportgenerator");
var _ = require('underscore');
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var path = require('path');
var scriptName = path.basename(__filename);

describe(scriptName + 'CCS/CAS/ASSIGNMENT :: EDIT CHOOSE FOR ME ASSESSMENT, ADD REMOVE CHAPTERS DURING EDIT,PREVIEW QUESTIONS BEFORE SAVE AND VALIDATE EDITED ASSESSMENT ON STUDENT', function() {
	var browser;
	var allPassed = true;
	var userType;
	var setDate;
	var courseName;
	var assignmentCreationStatus = "failure";
	var product;
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
		totalTime = 0;
		//Reports
		console.log(report.formatTestName("CCS/CAS/ASSIGNMENT :: EDIT IWILLCHOOSE ASSESSMENT, ADD REMOVE CHAPTERS DURING EDIT,PREVIEW QUESTIONS BEFORE SAVE AND VALIDATE EDITED ASSESSMENT ON STUDENT"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("validateCreateAndEditCompleteAssignmentForCFM.js"));
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

	it(". Delete all past assignments", function(done) {
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

	it(". Select current date and open the Assessment Type assignment settings page", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.selectADateForAssignment(browser).then(function() {
			calendarNavigation.selectAssessmentTypeAssignment(browser).then(function() {
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assessment type assignment is selected");
			});
		});
	});

	it(". Complete the CFM Assessment type assignment form for system created assignment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.enterName(browser).then(function() {
			assessmentsPage.enterRevealDate(browser).then(function() {
				assessmentsPage.selectChapter(browser, assessmentData.systemgenerated.scorestrategyhigh.chapter).then(function() {
					assessmentsPage.enterScore(browser, assessmentData.systemgenerated.scorestrategyhigh.score).then(function() {
						assessmentsPage.selectScoreStrategy(browser, assessmentData.systemgenerated.scorestrategyhigh.scoreStrategy).then(function() {
							assessmentsPage.selectQuestionStrategy(browser, assessmentData.systemgenerated.QuestionStrategy.option[0]).then(function() {
								assessmentsPage.enterQuestionsPerStudent(browser, assessmentData.systemgenerated.scorestrategyhigh.questions).then(function() {
									console.log(report.reportHeader() +
										report.stepStatusWithData("Assessment form has been filled by chapter :" +
											assessmentData.systemgenerated.scorestrategyhigh.chapter + ", Score :" +
											assessmentData.systemgenerated.scorestrategyhigh.score + ", Number Of Attempts :" +
											assessmentData.systemgenerated.scorestrategyhigh.attempts + ", Question Strategy :" +
											assessmentData.systemgenerated.QuestionStrategy.option[0] + ", Score Strategy : High(" +
											assessmentData.systemgenerated.scorestrategyhigh.scoreStrategy + "), Question Per Student :",
											assessmentData.systemgenerated.scorestrategyhigh.questions, "success") +
										report.reportFooter());
									takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment form filled");
								});
							});
						});
					});
				});
			});
		});
	});

	it(". LTR-5262 Click on preview tab and verify the assignment questions get loaded successfully", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.clickOnPreviewButtonUnderQuestionTab(browser).then(function() {
			assessmentsPage.validateIfPreviewQuestionIsPresent(browser).then(function() {
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Preview Tab Loaded");
			});
		});
	});

	it(". Click on Question tab", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.clickOnQuestionButtonUnderPreviewTab(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Clicked on question tab");
		});
	});

	it(". Save the CFM Assessment type assignment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});

	it(". Verify if CFM Assessment type assignment gets saved successfully", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		assessmentsPage.checkIfAssignmentSaved(browser).then(function(value) {
			if (value.toString() === "rgb(236, 41, 142)") {
				assignmentCreationStatus = "success";
				console.log(report.reportHeader() +
					report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName(), "success") +
					report.reportFooter());
				done();
			} else {
				assignmentCreationStatus = "failure";
				console.log(report.reportHeader() +
					report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName() + " may not have received the assessmentCGI", "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Refresh the page", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Open the created CFM Assessment type assignment", function(done) {
		if (process.env.RUN_IN_PLATFORM.toString() === "\"iOS\"") {
			browser.sleep(10000);
		}
		pageLoadingTime = 0;
		this.timeout(courseHelper.getElevatedTimeout());
		assessmentsPage.clickOnAssignmentOnCurrentDate(browser, assessmentsPage.getAssignmentName()).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is opened on edit panel");
		});
	});
	// Automated issue LTR-4753
	it(". Validate delete button enabled status on edit assessment page", function(done) {
		this.retries(3);
		assessmentsPage.checkIfDeleteButtonNotDisabled(browser).then(function(deleteButtonStatus) {
			console.log("deleteButtonStatus" + deleteButtonStatus);
			if (!deleteButtonStatus) {
				console.log(report.reportHeader() +
					report.printTestData("Delete button enabled status", !deleteButtonStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.printTestData("Delete button is not enabled now", deleteButtonStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Navigate to question tab", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		pageLoadingTime = 0;
		assessmentsPage.selectAttempts(browser, assessmentData.systemgenerated.scorestrategyhigh.editedAttempts).then(function() {
			assessmentsPage.clickOnQuestionTab(browser).then(function() {
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Question tab is loaded");
			});
		});
	});


	it(". Save the CFM Assessment type assignment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});
	it(". Refresh the page", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});
	it(". Click on the current assignment", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		assessmentsPage.clickOnAssignmentOnCurrentDate(browser, assessmentsPage.getAssignmentName()).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Navigate to preview tab", function(done) {
		assessmentsPage.clickOnPreviewButtonUnderQuestionTab(browser).then(function() {
			assessmentsPage.validateIfPreviewQuestionIsPresent(browser).then(function() {
				console.log(report.reportHeader() +
					report.printTestData("Question content is appearing successfully on assignment::", assessmentsPage.getAssignmentName(), "success") +
					report.reportFooter());
				done();
			});
		});
	});

	it(". Save the CFM Assessment type assignment", function(done) {
		pageLoadingTime = 0;
		console.log(assessmentsPage.getAssignmentName());
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});

	it(". Refresh the page", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Select CFM Assessment type assignment for editing ", function(done) {
		pageLoadingTime = 0;
		this.timeout(courseHelper.getElevatedTimeout());
		assessmentsPage.clickOnAssignmentOnCurrentDate(browser, assessmentsPage.getAssignmentName()).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});


	it(". Remove existing chapter and add another chapter", function(done) {
		pageLoadingTime = 0;
		this.timeout(courseHelper.getElevatedTimeout());
		assessmentsPage.selectChapter(browser, assessmentData.systemgenerated.scorestrategyhigh.chapter).then(function() {
			assessmentsPage.selectChapter(browser, assessmentData.systemgenerated.scorestrategyhigh.editchapter).then(function() {
				assessmentsPage.clickOnQuestionTab(browser).then(function() {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Edited chapter from " + assessmentData.systemgenerated.scorestrategyhigh.chapter + " to ", assessmentData.systemgenerated.scorestrategyhigh.editchapter, "success") +
						report.reportFooter());
					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
				});
			});
		});
	});

	it(". Save the CFM Assessment type assignment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});

	it(". Refresh the page", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Select the edited CFM Assessment type assignment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.clickOnAssignmentOnCurrentDate(browser, assessmentsPage.getAssignmentName()).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Question tab loaded");
		});
	});

	it(". Verify the newly added chapter is present for CFM Assessment type assignment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.checkifCheckboxesisClicked(browser).then(function(value) {
			if (value === "rgb(140, 208, 209)" || value === "rgb(50, 130, 133)") {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Checkbox background color of selected chapter is", value, "success") +
					report.reportFooter());
				assessmentsPage.clickOnQuestionTab(browser).then(function() {
					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Question tab loaded");
				});
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Checkbox background color of selected chapter is", value, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Save the CFM Assessment type assignment", function(done) {
		pageLoadingTime = 0;
		this.timeout(courseHelper.getElevatedTimeout());
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});

	it(". Refresh the page", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Delete the created assignment", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		assessmentsPage.deleteAssignment(browser, done);
	});

	it(". Close flash on assignment page", function(done) {
		calendarNavigation.handleTheFlashAlert(browser).then(function() {
			done();
		});
	});

	it(". Log out as Instructor", function(done) {
		userSignOut.userSignOut(browser, done);
	});

});
