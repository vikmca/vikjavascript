require('colors');
var wd = require('wd');
var asserters = wd.asserters;
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var menuPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var calendarNavigation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/navigationpo");
var assessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assessmentspo");
var studentAssessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var assessmentData = require("../../../../../test_data/assignments/assessments.json");
var session = require("../../../support/setup/browser-session");
var testData = require("../../../../../test_data/data.json");
var courseHelper = require("../../../support/helpers/courseHelper");
var report = require("../../../support/reporting/reportgenerator");
var _ = require('underscore');
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'CCS/CAS/IWC/ASSIGNMENT :: EDIT I WILL CHOOSE ASSESSMENT, ADD REMOVE CHAPTERS DURING EDIT,PREVIEW QUESTIONS BEFORE SAVE AND VALIDATE EDITED ASSESSMENT ON STUDENT', function() {
	var browser;
	var allPassed = true;
	var userType;
	var setDate;
	var courseName;
	var assignmentCreationStatus = "failure";
	var firstSelectedQuestions;
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
		console.log(report.formatTestName("CCS/CAS/ASSIGNMENT :: EDIT CHOOSE FOR ME , I WILL CHOOSE ASSESSMENT, ADD REMOVE CHAPTERS DURING EDIT,PREVIEW QUESTIONS BEFORE SAVE AND VALIDATE EDITED ASSESSMENT ON STUDENT"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***validateCreateAndEditCompleteAssignmentForIWC.js***"));
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

	it(". Wait for page loading", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
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

	it(". [IWC] Validate preview while creating I Will Choose Assessment type", function(done) {
		pageLoadingTime = 0;
		this.timeout(courseHelper.getElevatedTimeout());
		assessmentsPage.enterName(browser).then(function() {
			assessmentsPage.selectChapter(browser, assessmentData.systemgenerated.iwillchoose.chapter).then(function() {
				assessmentsPage.enterScore(browser, assessmentData.systemgenerated.scorestrategyhigh.score).then(function() {
					assessmentsPage.selectAttempts(browser, assessmentData.systemgenerated.scorestrategyAverage.attempts).then(function() {
						assessmentsPage.selectQuestionStrategy(browser, assessmentData.systemgenerated.QuestionStrategy.option[1]).then(function() {
							assessmentsPage.validateQuestionPerStudentDefaultSelection(browser).then(function() {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Assessment form has been filled by chapter :" +
										assessmentData.systemgenerated.scorestrategyhigh.chapter + ", Score :" +
										assessmentData.systemgenerated.scorestrategyhigh.score + ", Number Of Attempts :" +
										assessmentData.systemgenerated.scorestrategyhigh.attempts + ", Question Strategy :" +
										assessmentData.systemgenerated.QuestionStrategy.option[1], "success") +
									report.reportFooter());
								takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Question tab is loaded");
							});
						});
					});
				});
			});
		});
	});

	it(". [IWC] Validate filter while creating I Will Choose Assessment type", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.expandTheFilterPanel(browser).then(function() {
			assessmentsPage.filterOnIWCAssignment(browser, "Type", "fill-in").then(function() {
				assessmentsPage.expandTheFilterPanel(browser).then(function() {
					assessmentsPage.selectFirstQuestion(browser).then(function(elementForQuestion) {
						elementForQuestion.click().then(function() {
							elementForQuestion.text().then(function(question) {
								firstSelectedQuestions = question;
								assessmentsPage.clickOnPreviewButtonUnderQuestionTab(browser).then(function() {
									assessmentsPage.validateIfPreviewQuestionIsCorrect(browser).then(function(Questiontext) {
										if (Questiontext.indexOf(firstSelectedQuestions) > -1) {
											console.log(report.reportHeader() +
												report.stepStatusWithData("[IWC] Selected question text " + firstSelectedQuestions + " is same as question comes under preview panel", Questiontext, "success") +
												report.reportFooter());
											takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Preview tab is loaded");
										} else {
											console.log(report.reportHeader() +
												report.stepStatusWithData("[IWC] Selected question text " + firstSelectedQuestions + " is same as question comes under preview panel", Questiontext, "failure") +
												report.reportFooter());
										}
									});
								});
							});
						});
					});
				});
			});
		});
	});

	it(". Validate the save button and textbox is disabled when user enters the value greater than question pool", function(done) {
		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) === "mobile" || stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) === "iOS") {
			assessmentsPage.clickOnQuestionTab(browser).then(function() {
				assessmentsPage.clickOnQuestionPerStudentTextBox(browser).then(function() {
					done();
				});
			});
		} else {
			assessmentsPage.clickOnQuestionTab(browser).then(function() {
				assessmentsPage.clickOnQuestionPerStudentTextBox(browser)
					.then(function(statusOfTextBoxWhenDisable) {
						console.log(statusOfTextBoxWhenDisable);
						assessmentsPage.saveButtonDisabled(browser).getAttribute('aria-disabled')
							.then(function(saveButtonStatusInDisabelState) {
								console.log(saveButtonStatusInDisabelState);
								if (statusOfTextBoxWhenDisable === "true" && saveButtonStatusInDisabelState === "true") {
									console.log(report.reportHeader() +
										report.stepStatusWithData("Question per Student Textbox status  " + statusOfTextBoxWhenDisable + " and staus of save button", saveButtonStatusInDisabelState, "success") +
										report.reportFooter());
									done();
								} else {
									console.log(report.reportHeader() +
										report.stepStatusWithData("Question per Student Textbox status  " + statusOfTextBoxWhenDisable + " and staus of save button", saveButtonStatusInDisabelState, "failure") +
										report.reportFooter());
								}
							});
					});
			});
		}
	});


	it(". Click all selected below radio box and save the assignment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.clickOnAllSelectedBelowRadiButton(browser).then(function() {
			assessmentsPage.saveAssignment(browser).then(function() {
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
			});
		});
	});

	it(". [IWC] Verify if assignment saved successfully", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		assessmentsPage.checkIfAssignmentSaved(browser).then(function(value) {
			console.log(value.toString());
			if (value.toString() === "rgb(236, 41, 142)") {
				assignmentCreationStatus = "success";
				console.log(report.reportHeader() +
					report.stepStatusWithData("[IWC] : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName(), "success") +
					report.reportFooter());
				done();
			} else {
				assignmentCreationStatus = "failure";
				console.log(report.reportHeader() +
					report.stepStatusWithData("[IWC] : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName() + " may not have received the assessmentCGI", "failure") +
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

	it(". Open creates IWC assignment", function(done) {
		pageLoadingTime = 0;
		this.timeout(courseHelper.getElevatedTimeout());
		console.log(assessmentsPage.getAssignmentName());
		assessmentsPage.clickOnAssignmentOnCurrentDate(browser, assessmentsPage.getAssignmentName()).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	// Automated issue LTR-4753
	it(". Validate delete button enabled status", function(done) {
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

	it(". [IWC] Edit chapter of created assignment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.selectChapter(browser, assessmentData.systemgenerated.iwillchoose.chapter).then(function() {
			assessmentsPage.selectChapter(browser, assessmentData.systemgenerated.iwillchoose.editedChapter).then(function() {
				assessmentsPage.clickOnQuestionTab(browser).then(function() {
					console.log(report.reportHeader() +
						report.stepStatusWithData("IWC type assessment edited chapter from " + assessmentData.systemgenerated.iwillchoose.chapter + " to ", assessmentData.systemgenerated.iwillchoose.editedChapter, "success") +
						report.reportFooter());
					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Question tab is loaded");
				});
			});
		});
	});

	it(". [IWC] Select the questions from edited chapter", function(done) {
		pageLoadingTime = 0;
		this.timeout(courseHelper.getElevatedTimeout());
		assessmentsPage.expandTheFilterPanel(browser).then(function() {
			assessmentsPage.filterOnIWCAssignment(browser, "Type", "fill-in").then(function() {
				assessmentsPage.filterOnIWCAssignment(browser, "Type", "true-false").then(function() {
					assessmentsPage.expandTheFilterPanel(browser).then(function() {
						assessmentsPage.selectFirstQuestion(browser).then(function(elementForQuestion) {
							elementForQuestion.click().then(function() {
								elementForQuestion.text().then(function(question) {
									firstSelectedQuestions = question;
									assessmentsPage.clickOnPreviewButtonUnderQuestionTab(browser).then(function() {
										assessmentsPage.validateIfPreviewQuestionIsCorrect(browser).then(function(Questiontext) {
											if (Questiontext.indexOf(firstSelectedQuestions) > -1) {
												console.log(report.reportHeader() +
													report.stepStatusWithData("Selected question text " + firstSelectedQuestions + " is same as question comes under preview panel", Questiontext, "success") +
													report.reportFooter());
												takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
											} else {
												console.log(report.reportHeader() +
													report.stepStatusWithData("Selected question text " + firstSelectedQuestions + " is same as question comes under preview panel", Questiontext, "failure") +
													report.reportFooter());
											}
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

	it(". Verify if IWC Assessment type assignment gets saved successfully", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});

	it(". Log out as Instructor", function(done) {
		userSignOut.userSignOut(browser, done);
	});

	it(". Login as student", function(done) {
		userType = "student";
		data = loginPage.setLoginData(userType);
		//Reports
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
		this.timeout(courseHelper.getElevatedTimeout());
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Click on the current date cell", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		studentAssessmentsPage.clickOnCurrentDateCell(browser).then(function() {
			done();
		});
	});

	it(". Launch the IWC Assessment type assignment for the first time", function(done) {
		studentAssessmentsPage.getTextOfAssignmentChapter(browser, assessmentsPage.getAssignmentName()).then(function(chaptername) {
			studentAssessmentsPage.launchAssignment(browser, assessmentsPage.getAssignmentName()).then(function() {
				if (chaptername.indexOf(assessmentData.systemgenerated.iwillchoose.editedChapter) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Edited assignment chapter name is present", chaptername, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Edited assignment chapter name is present", chaptername, "failure") +
						report.reportFooter());
				}
			});
		});
	});

	it(". LTR-5399 :: Verify error message should not be displayed on assessment launch and also validate Continue button should be appear on launched assessment page", function(done) {
		pageLoadingTime = 0;
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		studentAssessmentsPage.validateErrorStatusOnPage(browser).then(function(statusOfErrorPresence) {
			console.log("statusOfErrorPresence"+statusOfErrorPresence);
			if(statusOfErrorPresence){
				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5399 :: Error is displaying on the page",statusOfErrorPresence, "failure") +
					report.reportFooter());
					studentAssessmentsPage.getErrorMessage(browser).then(function(errorMessageText) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("LTR-5399:: Displayed error message test is ",errorMessageText, "failure") +
							report.reportFooter());
					});
			}else{
				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5399:: Error message is not displaying on the page on assessment launch",statusOfErrorPresence, "success") +
					report.reportFooter());
					studentAssessmentsPage.submitButtonPresenceStatus(browser).then(function(statusOfSubmitButtonPresence) {
						if(statusOfSubmitButtonPresence){
							console.log(report.reportHeader() +
								report.stepStatusWithData("LTR-5399:: Submit button presence status on the page ",statusOfSubmitButtonPresence, "success") +
								report.reportFooter());
							done();
						}else{
							console.log(report.reportHeader() +
								report.stepStatusWithData("Submit button presence status on the page ",statusOfSubmitButtonPresence, "success") +
								report.reportFooter());
						}
					});
			}
			});
	});

	it(". Verify the edited assignment question is present on student assignment activity panel", function(done) {
		studentAssessmentsPage.getQuestionTextFromStudentActivityPanel(browser).then(function(questionFromStudentActivityPanel) {
			if (questionFromStudentActivityPanel.indexOf(firstSelectedQuestions) > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Selected question text " + firstSelectedQuestions + " is same as question comes under student assignment activity panel", questionFromStudentActivityPanel, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Selected question text " + firstSelectedQuestions + " is same as question comes under student assignment activity panel", questionFromStudentActivityPanel, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Log out as Student", function(done) {
		userSignOut.userSignOut(browser, done);
	});

	it(". Wait for page loading", function(done) {
		browser.sleep(10000).refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
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

	it(". Close flash on assignment page", function(done) {
		calendarNavigation.handleTheFlashAlert(browser).then(function() {
			done();
		});
	});

	it(". Log out as Instructor", function(done) {
		userSignOut.userSignOut(browser, done);
	});

});
