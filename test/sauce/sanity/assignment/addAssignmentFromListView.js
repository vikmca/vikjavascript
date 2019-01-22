require('colors');
var wd = require('wd');
var asserters = wd.asserters;
var _ = require('underscore');
var stringutil = require("../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var menuPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var tocPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/tocpo");
var calendarNavigation = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/navigationpo");
var assessmentsPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assessmentspo");
var userSignOut = require("../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var documentAndLinksPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/documentAndLinkspo");
var chapterReadingAssignmentPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/chapterReadingpo");
var assessmentData = require("../../../../test_data/assignments/assessments.json");
var session = require("../../support/setup/browser-session");
var basicpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var testData = require("../../../../test_data/data.json");
var courseHelper = require("../../support/helpers/courseHelper");
var report = require("../../support/reporting/reportgenerator");
var mathutil = require("../../util/mathUtil");
var takeQuizpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'VALIDATE ASSIGNMENT CREATION FROM CALENDAR LIST VIEW', function() {
	var browser;
	var allPassed = true;
	var userType;
	var setDate;
	var courseName;
	var product;
	var productData;
	var data;
	var pageLoadingTime;
	var totalTime;
	var assignmentCreationStatus = "failure";
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
		browserName = stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString());
		data = loginPage.setLoginData(userType);
		productData = loginPage.getProductData();
		totalTime = 0;
		//Reports
		console.log(report.formatTestName("VALIDATE ASSIGNMENT CREATION FROM CALENDAR LIST VIEW"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***addAssignmentFromListView.js***"));
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
		this.timeout(courseHelper.getElevatedTimeout());
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Product", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		brainPage.selectProduct(product, browser, done);
	});

	it(". Select a Course and launch", function(done) {
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

	it(". Click on assignment List view", function(done) {
		tocPage.selectListView(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Click on create new Assignment button and verify, button is present on list view", function(done) {
		assessmentsPage.addAssignmentOnListView(browser, done, assessmentData.systemgenerated.createAssignmentOnList.createAssignmentName);
	});

	it(". Select current date and open the CFM Assessment type assignment settings page", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.selectAssessmentTypeAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assessment type assignment is selected");
		});
	});

	it(". Complete the CFM Assessment type Assessment form for system created assignment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.enterDueDate(browser).then(function() {
			assessmentsPage.enterRevealDate(browser).then(function() {
				assessmentsPage.enterName(browser).then(function() {
					assessmentsPage.selectChapter(browser, assessmentData.systemgenerated.scorestrategyhigh.chapter).then(function() {
						assessmentsPage.enterScore(browser, assessmentData.systemgenerated.scorestrategyhigh.score).then(function() {
							assessmentsPage.selectAttempts(browser, assessmentData.systemgenerated.scorestrategyhigh.attempt).then(function() {
								assessmentsPage.selectScoreStrategy(browser, assessmentData.systemgenerated.scorestrategyhigh.scoreStrategy).then(function() {
									assessmentsPage.selectQuestionStrategy(browser, assessmentData.systemgenerated.QuestionStrategy.option[0]).then(function() {
										assessmentsPage.enterQuestionsPerStudent(browser, assessmentData.systemgenerated.scorestrategyhigh.questions).then(function() {
											console.log(report.reportHeader() +
												report.stepStatusWithData("Assessment form has been filled by chapter :" +
													assessmentData.systemgenerated.scorestrategyhigh.chapter + ", Score :" +
													assessmentData.systemgenerated.scorestrategyhigh.score + ", Number Of Attempts :" +
													assessmentData.systemgenerated.scorestrategyhigh.attempt + ", Question Strategy :" +
													assessmentData.systemgenerated.QuestionStrategy.option[0] + ", Score Strategy : High(" +
													assessmentData.systemgenerated.scorestrategyhigh.scoreStrategy + "), Question Per Student :",
													assessmentData.systemgenerated.scorestrategyhigh.questions, "success") +
												report.reportFooter());
											takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Completed the assignment form");
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});

	it(". Save the CFM Assessment type assignment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assessment gets saved");
		});
	});

	it(". Verify if CFM Assessment type assignment is displayed in the list view", function(done) {
		assessmentAssignmentName = assessmentsPage.getAssignmentName();
		calendarNavigation.verifyAssignmentsGetsSavedOnListView(browser, assessmentAssignmentName).then(function() {
			assignmentCreationStatus = "success";
			console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called ", assessmentsPage.getAssignmentName(), "success") + report.reportFooter());
			console.log("assessmentName::" + assessmentAssignmentName);
			done();
		});
	});

	it(". Edit the attempts and chapter of CFM Assessment type assignment", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		assessmentsPage.openAssignmentOnListView(browser, assessmentsPage.getAssignmentName()).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Question tab is loaded");
		});
	});


	it(". Edit the attempts and chapter of assessment type assignment", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		assessmentsPage.selectChapter(browser, assessmentData.systemgenerated.scorestrategyhigh.chapter).then(function() {
			assessmentsPage.selectChapter(browser, assessmentData.systemgenerated.scorestrategyhigh.editchapter).then(function() {
				assessmentsPage.selectAttempts(browser, assessmentData.systemgenerated.scorestrategyhigh.editedAttempts).then(function() {
					assessmentsPage.clickOnQuestionTab(browser).then(function() {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Edited chapter from  " + assessmentData.systemgenerated.scorestrategyhigh.chapter + " to :" +
								assessmentData.systemgenerated.scorestrategyhigh.editchapter + ", and edit attempt from " +
								assessmentData.systemgenerated.scorestrategyhigh.attempt + " to ",
								assessmentData.systemgenerated.scorestrategyhigh.editedAttempts, "success") +
							report.reportFooter());
						takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Question tab is loaded");
					});
				});
			});
		});

	});


	it(". Save the CFM Assessment type assignment", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});

		// it(". Refresh the page and wait for page load", function(done) {
		// 	browser.refresh().then(function(){
		// 		pageLoadingTime = 0;
		// 		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		// 	});
		// });
		//
		// it(". Click on assignment List view", function(done) {
		// 	tocPage.selectListView(browser).then(function() {
		// 		pageLoadingTime = 0;
		// 		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		// 	});
		// });

	it(". Open the recently created CFM assessment type assignment on list view", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		console.log(" assessmentsPage.getAssignmentName()"+ assessmentsPage.getAssignmentName());
		assessmentsPage.openAssignmentOnListView(browser, assessmentsPage.getAssignmentName()).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is loaded");
		});
	});

	it(". Validate CFM Assessment type assignment's chapter and attempts get edited successfully", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		calendarNavigation.navigateToSettingTab(browser).then(function() {
			assessmentsPage.validateEditedAttempt(browser, assessmentsPage.getAssignmentName(), assessmentData.systemgenerated.scorestrategyhigh.editedAttempts).then(function() {
				assessmentsPage.checkifCheckboxesisClickedOnListView(browser).then(function(value) {
					if (value === "rgb(50, 130, 133)" || value === "rgb(140, 208, 209)") {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Edited attempts is " + assessmentData.systemgenerated.scorestrategyhigh.editedAttempts + " and edited chapter checkbox background color of selected chapter is", value, "success") +
							report.reportFooter());
						assessmentsPage.clickOnQuestionTab(browser).then(function() {
							takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Question tab loaded");
						});
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Edited attempts is not reflected and edited chapter checkbox background color of selected chapter is", value, "failure") +
							report.reportFooter());
					}
				});
			});
		});

	});

	it(". Save the CFM Assessment type assignment", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});

	it(". Wait for page load", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Click on create new Assignment button on assignment list view", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		assessmentsPage.addAssignmentOnListView(browser, done, assessmentData.systemgenerated.createAssignmentOnList.createAssignmentName);
	});

	it(". Select 'Documents And Links' Type assignment", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		calendarNavigation.selectDocumentsAndLinksTypeAssignment(browser, done);
	});

	it(". Wait for page load", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Complete the Document and Link form for system created assignment", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		assessmentsPage.enterDueDate(browser).then(function() {
			documentAndLinksPage.enterName(browser).then(function() {
				documentAndLinksPage.enterRevealDate(browser).then(function() {
					documentAndLinksPage.enterDescription(browser).then(function() {
						done();
					});
				});
			});
		});
	});

	it(". Add the attachments", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		documentAndLinksPage.clickOnAddAttachment(browser).then(function() {
			documentAndLinksPage.addTheAttachments(browser, done);
		});
	});

	it(". Save the Documents and Link Assignment", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		documentAndLinksPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, " page is loaded");
		});
	});

	it(". Verify if DOC and Link type assignment saved successfully", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		docAndLinkAssignmentName = documentAndLinksPage.getAssignmentName();
		calendarNavigation.verifyAssignmentsGetsSavedOnListView(browser, docAndLinkAssignmentName).then(function() {
			console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created Documents and links type assignment called ", documentAndLinksPage.getAssignmentName(), "success") +
				report.reportFooter());
			done();
		});
	});

	it(". Click on create new Assignment button on assignment list view", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		assessmentsPage.addAssignmentOnListView(browser, done, assessmentData.systemgenerated.createAssignmentOnList.createAssignmentName);
	});

	it(". Select Chapter Content  Assignment", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		calendarNavigation.selectChapterReadingAssessment(browser, done);
	});

	it(". Wait for page load", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Complete the Chapter Content assignment form", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		assessmentsPage.enterDueDate(browser).then(function() {
			chapterReadingAssignmentPage.enterName(browser).then(function() {
				chapterReadingAssignmentPage.enterRevealDate(browser).then(function() {
					chapterReadingAssignmentPage.selectAChapter(browser, productData.chapter.topic.documents.assignments[0].reading[0].chapter);
					console.log(report.reportHeader() +
						report.stepStatusWithData("Chapter reading assignment with chapter ",
							productData.chapter.topic.documents.assignments[0].reading[0].chapter + " on current date and", "success") +
						report.reportFooter());
					done();
				});
			});
		});
	});

	it(". Save the Chapter Content assignment", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		chapterReadingAssignmentPage.saveAssignment(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment gets saved");
		});
	});

	it(". Verify if chapter reading assignment saved successfully", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		chapterReadingAssignmentName = chapterReadingAssignmentPage.getAssignmentName();
		calendarNavigation.verifyAssignmentsGetsSavedOnListView(browser, chapterReadingAssignmentName).then(function() {
			console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created Chapter Reading type assignment called ", chapterReadingAssignmentPage.getAssignmentName(), "success") + report.reportFooter());
			console.log("assessmentName::" + chapterReadingAssignmentName);
			done();
		});
	});

	it(". Wait for page load", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Delete the chapter content assignment using UI", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		assessmentsPage.deleteAssignmentFromBrowserOnListView(browser, chapterReadingAssignmentPage.getAssignmentName(), done);
	});

	it(". Wait for page load", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Verify chapter content assignment gets deleted successfully", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		assessmentsPage.verifyAssignmentNotPresent(browser, chapterReadingAssignmentPage.getAssignmentName()).then(function(statusOfDeletedAssignment) {
			if (statusOfDeletedAssignment) {
				console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created Chapter Content type assignment called " + chapterReadingAssignmentPage.getAssignmentName() + " is not deleted", "successfully", "failure") +
					report.reportFooter());
			} else {
				console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created Chapter Content type assignment called " + chapterReadingAssignmentPage.getAssignmentName() + " is deleted", "successfully", "success") +
					report.reportFooter());
				done();
			}
		});
	});

	it(". Refresh the page and wait for page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Delete the created assignment on assignment list view", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		}
		assessmentsPage.deleteAssignment(browser, done);
	});

	it(". Close flash on assignment page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		calendarNavigation.handleTheFlashAlert(browser).then(function() {
			done();
		});
	});

	it(". Log out as Instructor", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userSignOut.userSignOut(browser, done);
	});

});
