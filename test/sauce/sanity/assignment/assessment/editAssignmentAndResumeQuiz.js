require('colors');
var wd = require('wd');
var asserters = wd.asserters;
var _ = require('underscore');
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var menuPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var calendarNavigation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/navigationpo");
var assessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assessmentspo");
var casPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var studenGradebookPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/student/gradebookValidationpo");
var studentAssessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var assessmentData = require("../../../../../test_data/assignments/assessments.json");
var session = require("../../../support/setup/browser-session");
var testData = require("../../../../../test_data/data.json");
var courseHelper = require("../../../support/helpers/courseHelper");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var report = require("../../../support/reporting/reportgenerator");
var path = require('path');
var scriptName = path.basename(__filename);

describe(scriptName + 'CCS/CAS/ASSIGNMENT :: INSTRUCTOR ASSSIGNMENT EDIT ATTEMPTS, STUDENT RESUME ASSESSMENT VALIDATION', function() {
	var browser;
	var allPassed = true;
	var userType;
	var setDate;
	var courseName;
	var studentAssignmentCompletionStatus = "failure";
	var assignmentCreationStatus = "failure";
	var product;
	var pointsFromStudentGradebook;
	var questionsCorrectFromCAS;
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
		console.log(report.formatTestName("CCS/CAS/ASSIGNMENT :: INSTRUCTOR CREATE CHOOSE FOR ME TYPE ASSSIGNMENT, EDIT ATTEMPTS AND RESUME ASSESSMENT VALIDATION AT STUDENT END"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***editAssignmentAndResumeQuiz.js***"));
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
		this.retries(2);
		this.timeout(courseHelper.getElevatedTimeout());
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Product", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		brainPage.selectProduct(product, browser, done);
	});

	it.skip(" LTR-5041 :: Click on a Print Course link and validate user should be able to launch the course although print course window is opened", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userType = "instructor";
		loginPage.launchACoursePrintLink(userType, courseName, browser, done);
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

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Delete all past assignments", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
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

	it(". Select current date and open the Assessment Type assignment's settings page", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.selectADateForAssignment(browser).
		then(function() {
			calendarNavigation.selectAssessmentTypeAssignment(browser).then(function() {
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assessment type assignment is selected");
			});
		});
	});

	it(". Complete the CFM Assessment form for system created assignment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.enterName(browser).then(function() {
			assessmentsPage.enterRevealDate(browser).then(function() {
				assessmentsPage.selectChapter(browser, assessmentData.systemgenerated.scorestrategyhigh.chapter).then(function() {
					assessmentsPage.enterScore(browser, assessmentData.systemgenerated.scorestrategyhigh.score).then(function() {
						assessmentsPage.selectAttempts(browser, assessmentData.systemgenerated.scorestrategyhigh.attempts).then(function() {
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

	it(". Save the CFM type assessment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});

	it(". Verify if the CFM type assessment gets saved successfully and also validate the background color of the assessment which has relvealed today", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		assessmentsPage.checkIfAssignmentSaved(browser).then(function(value) {
			console.log(value.toString());
			if (value.toString() === "rgb(236, 41, 142)") {
				assignmentCreationStatus = "success";
				console.log(report.reportHeader() +
					report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName()+" and background color is "+value.toString(), "success") +
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

	it(". Open the created assessment(CFM type) on current date", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		assessmentsPage.clickOnAssignmentOnCurrentDate(browser, assessmentsPage.getAssignmentName()).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Click on delete button and validate the confirmation popup should be appear", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		assessmentsPage.deleteAssessmentFromUI(browser).then(function() {
			assessmentsPage.validateConfirmationBox(browser).then(function() {
				done();
			});
		});
	});

	it(". Validate the warning image on confirmation popup", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		assessmentsPage.getWarningImageUrl(browser).then(function(warningImage) {
			if (warningImage.indexOf("/images/warning-pink.25ec5274.svg") > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Correct warning image /images/warning-pink.25ec5274.svg is appearing on confirmation box, which is compared with ", warningImage, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Correct warning image /images/warning-pink.25ec5274.svg is appearing  on confirmation box, which is compared with ", warningImage, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate the 'Delete' text on confirmation box", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		assessmentsPage.headerTextOnDeletePopup(browser).then(function(deleteText) {
			if (deleteText.indexOf("Delete") > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Correct text 'Delete' is appearing on confirmation box, which is compared with ", deleteText, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Correct text 'Delete' is appearing on confirmation box, which is compared with ", deleteText, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate the warning text on confirmation box", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		assessmentsPage.getWarningText(browser).then(function(warningText) {
			if ("Are you sure you want to delete this assignment?".indexOf(warningText) > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Correct warning text is displaying on confirmation box, i.e. ", warningText, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Correct warning text is displaying on confirmation box, i.e. ", warningText, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate cancel and delete button should be appear on the confirmation box", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		assessmentsPage.validateCancelBtn(browser).then(function(cencelBtnTxt) {
			assessmentsPage.validateDeleteBtn(browser).then(function(deleteBtnTxt) {
				if (cencelBtnTxt.indexOf("CANCEL") > -1 && deleteBtnTxt.indexOf("DELETE") > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Delete and Cancel button is appearing with their respective text", cencelBtnTxt + " " + deleteBtnTxt, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Delete and Cancel button is appearing with their respective text", cencelBtnTxt + " " + deleteBtnTxt, "failure") +
						report.reportFooter());
				}
			});
		});
	});

	it(". Click on cancel button and validate assignment should not be deleted", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		assessmentsPage.clickOnCancelBtn(browser).then(function() {
			// assessmentsPage.validateAssignmentIsPresent(browser, "ROBO-Q-U-30 RANDOM NO 450").then(function(astStatus){
			assessmentsPage.validateAssignmentIsPresent(browser, assessmentsPage.getAssignmentName()).then(function(astStatus) {
				if (astStatus) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Assignment is not deleted", astStatus, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Assignment is not deleted", astStatus, "failure") +
						report.reportFooter());
				}
			});
		});
	});

	it(". Log out as Instructor", function(done) {
		this.retries(3);
		this.timeout(courseHelper.getElevatedTimeout());
		userSignOut.userSignOut(browser, done);
	});

	it(". Login as student", function(done) {
		this.retries(3);
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

	it(". Click on the current date cell", function(done) {
		pageLoadingTime = 0;
		studentAssessmentsPage.clickOnCurrentDateCell(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "page is loaded");
		});
	});

	it(". Validate assessment questions and button names on start of the quiz", function(done) {
		studentAssessmentsPage.clickOnAssignment(browser, assessmentsPage.getAssignmentName()).then(function() {
			studentAssessmentsPage.launchAssessmentPopup(browser).then(function() {
				studentAssessmentsPage.getTextOnLaunchAssessmentPopup(browser).text().then(function(textPoint) {
					if (textPoint.indexOf(assessmentData.systemgenerated.scorestrategyhigh.questions) > -1) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Question on start of the quiz popup is equal to the number of questions specified while creating the assignemnt which is ", assessmentData.systemgenerated.scorestrategyhigh.questions, "success") +
							report.reportFooter());
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Question on start of the quiz popup is NOT equal to the number of questions specified while creating the assignemnt which is ", assessmentData.systemgenerated.scorestrategyhigh.questions, "failure") +
							report.reportFooter());
					}
					assessmentsPage.setupPopUpButton(browser).then(function(btnName) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Button present in Start quiz popup is ", btnName, "success") +
							report.reportFooter());
						done();
					});
				});
			});
		});

	});

	it(". Launch the assignment", function(done) {
		pageLoadingTime = 0;
		studentAssessmentsPage.clickToBeginButton(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is launched");
		});
	});

	it(". Complete the assignment and exit", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("quiz"));
		takeQuizpo.takeQuiz(browser, done);
	});

	it(". Fetch correct questions from quiz results page", function(done) {
		casPage.getQuestionsCorrect(browser).then(function(questionsCorrect) {
			console.log("Total Questions Correct " + questionsCorrect);
			questionsCorrectFromCAS = questionsCorrect;
			console.log("Total Assignment Questions " + assessmentsPage.getMaxAssignmentQuestions());
			studentAssignmentCompletionStatus = "success";
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS : Student Completed the assignment with questions " + assessmentsPage.getMaxAssignmentQuestions() + " and got a score of  ", questionsCorrect, "success") +
				report.reportFooter());
			done();
		});
	});

	it(". Click on exit button", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.clickExitButtonOnResultsPage(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is attempted");
		});
	});

	it(". Navigate to GradeBook page", function(done) {
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". [Gradebook] Validate the Points earned by the student", function(done) {
		this.retries(3);
		studenGradebookPage.getScoredPoints(browser, assessmentsPage.getAssignmentName()).then(function(valueScore) {
			if (valueScore.toString() === assessmentsPage.getRoboPointScore(questionsCorrectFromCAS)) {
				pointsFromStudentGradebook = valueScore;
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + assessmentsPage.getRoboPointScore(questionsCorrectFromCAS) + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + assessmentsPage.getRoboPointScore(questionsCorrectFromCAS) + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "failure") +
					report.reportFooter());
			}
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
		this.timeout(courseHelper.getElevatedTimeout());
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
	it(". Select the assignment to Edit", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.selectAnExistingAssignmentInCurrentDate(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is launched");
		});
	});

	it(". Edit attempts of created assignments from edit assignment's setting panel", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.selectAttempts(browser, assessmentData.systemgenerated.scorestrategyhigh.editedAttempts).then(function() {
			assessmentsPage.clickOnQuestionTab(browser).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Edited attempt from  " + assessmentData.systemgenerated.scorestrategyhigh.attempts + " to :",
						assessmentData.systemgenerated.scorestrategyhigh.editedAttempts, "success") +
					report.reportFooter());
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment attempts is edited");
			});
		});
	});

	it(". Save the changes of assessment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
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

	it(". Click on the current date cell", function(done) {
		pageLoadingTime = 0;
		studentAssessmentsPage.clickOnCurrentDateCell(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "page is loaded");
		});
	});

	it(". Verify the count of attempts remaining of edited assessments", function(done) {
		studentAssessmentsPage.getQuestionText(browser).text().then(function(attemptsremain) {
			console.log("assessmentData.systemgenerated.scorestrategyhigh.attemptsremaining" + assessmentData.systemgenerated.scorestrategyhigh.attemptsremaining);
			if (attemptsremain.indexOf(assessmentData.systemgenerated.scorestrategyhigh.attemptsremaining) > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Attemts remaining on student assignment calendar " + attemptsremain + " is compared against the remaining attempts from test data ", assessmentData.systemgenerated.scorestrategyhigh.attemptsremaining, "success") +
					report.reportFooter());
				done();
			}
		});
	});

	it(". Launch the assignment", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		studentAssessmentsPage.launchAssignment(browser, assessmentsPage.getAssignmentName()).then(function() {
			done();
		});
	});

	it(". LTR-5399 :: Verify error message should not be displayed on assessment launch and also validate Continue button should be appear on launched assessment page", function(done) {
		pageLoadingTime = 0;
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


	it(". Attempt two questions, capture the 3rd Quiz question's text", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("quiz"));
		takeQuizpo.submitTwoQuesFromQuiz(browser, done);
	});

	it(". Click on Exit button", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.clickExitButtonOnResultsPage(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Click on the current date cell and verify assignment status should be Attempt in progress", function(done) {
		studentAssessmentsPage.clickOnCurrentDateCell(browser).then(function() {
			studentAssessmentsPage.getAttemptTextOfAssessmentNameOnToday(browser).text().then(function(attemptsprogressmsg) {
				console.log("::" + assessmentData.systemgenerated.scorestrategyhigh.attemptsprogressmsg + "::");
				if (attemptsprogressmsg.indexOf(assessmentData.systemgenerated.scorestrategyhigh.attemptsprogressmsg) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Attempt status on student end", attemptsprogressmsg, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Attempt status on student end", attemptsprogressmsg, "failure") +
						report.reportFooter());
				}
			});
		});
	});


	it(". Verify the assessment's remaining attempts", function(done) {
		studentAssessmentsPage.getQuestionText(browser).text().then(function(attemptsremain) {
			if (attemptsremain.indexOf(assessmentData.systemgenerated.scorestrategyhigh.attemptsremaining2) > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Remaining attempt status on student end", attemptsremain, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Remaining attempt status on student end", attemptsremain, "failure") +
					report.reportFooter());
			}
		});

	});

	it(". Launch the CFM assessment type assignment", function(done) {
		pageLoadingTime = 0;
		this.timeout(courseHelper.getElevatedTimeout());
		studentAssessmentsPage.launchAssignment(browser, assessmentsPage.getAssignmentName()).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is launched");
		});
	});

	it(". LTR-5399 :: Verify error message should not be displayed on assessment launching resumed assessment and also validate Continue button should be appear on launched assessment page", function(done) {
		pageLoadingTime = 0;
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
	// LTR-4124 [IE11]::Resuming an attempted assignment(Student) , Quiz resets to the first question instead of the last resumed question
	it(". LTR-4124 :: Validate 3rd question text appeared on page should be same as captured question's text ", function(done) {
		takeQuizpo.resumeQuizFromThirdQues(browser, done);
	});

	it(". Attempt all remaining Questions", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("quiz"));
		takeQuizpo.submitRemaningQUiz(browser, done);
	});

	it(". Fetch correct questions from quiz results page", function(done) {
		casPage.getQuestionsCorrect(browser).then(function(questionsCorrect) {
			console.log("Total Questions Correct " + questionsCorrect);
			questionsCorrectFromCAS = questionsCorrect;
			console.log("Total Assignment Questions " + assessmentsPage.getMaxAssignmentQuestions());
			studentAssignmentCompletionStatus = "success";
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS : Student Completed the assignment with questions " + assessmentsPage.getMaxAssignmentQuestions() + " and got a score of  ", questionsCorrect, "success") +
				report.reportFooter());
			done();
		});
	});

	it(". Click on exit button", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.clickExitButtonOnResultsPage(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is attempted");
		});
	});

	it(". Click on the current date cell", function(done) {
		pageLoadingTime = 0;
		studentAssessmentsPage.clickOnCurrentDateCell(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "page is loaded");
		});
	});

	it(". Verify assignment name is disabled ", function(done) {
		studentAssessmentsPage.verifyAssignmentNameDisabled(browser, assessmentsPage.getAssignmentName())
			.then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assessment is disabled once all attempts are consumed", "success", "success") +
					report.reportFooter());
				done();
			});
	});

	it(". Log out as Student", function(done) {
		this.retries(3);
		this.timeout(courseHelper.getElevatedTimeout());
		userSignOut.userSignOut(browser, done);
	});

	it(". Login as Instructor", function(done) {
		this.retries(3);
		this.timeout(courseHelper.getElevatedTimeout());
		userType = "instructor";
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Product", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
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

	it(". Open the created assessment for deleting", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		// assessmentsPage.clickOnAssignmentOnCurrentDate(browser, "ROBO-Q-U-30 RANDOM NO 450").then(function(){
		assessmentsPage.clickOnAssignmentOnCurrentDate(browser, assessmentsPage.getAssignmentName()).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Click on delete button and validate the confirmation popup should be appear", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		assessmentsPage.deleteAssessmentFromUI(browser).then(function() {
			assessmentsPage.validateConfirmationBox(browser).then(function() {
				done();
			});
		});
	});

	it(". Validate the warning image on confirmation popup", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		assessmentsPage.getWarningImageUrl(browser).then(function(warningImage) {
			if (warningImage.indexOf("/images/warning-pink.25ec5274.svg") > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Correct warning image /images/warning-pink.25ec5274.svg is appearing on confirmation box, which is compared with ", warningImage, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Correct warning image /images/warning-pink.25ec5274.svg is appearing  on confirmation box, which is compared with ", warningImage, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate the 'Delete' text on confirmation box", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		assessmentsPage.headerTextOnDeletePopup(browser).then(function(deleteText) {
			if (deleteText.indexOf("Delete") > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Correct text 'Delete' is appearing on confirmation box, which is compared with ", deleteText, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Correct text 'Delete' is appearing on confirmation box, which is compared with ", deleteText, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate the warning text on confirmation box", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		assessmentsPage.getWarningText(browser).then(function(warningText) {
			if ("WAIT! This assignment has student submissions. If you delete it, their work and scores will also be deleted!​".indexOf(warningText) > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Correct warning text is displaying on confirmation box, i.e. ", warningText, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Correct warning text is displaying on confirmation box, i.e. ", warningText, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate cancel and delete button should be appear on the confirmation box", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		assessmentsPage.validateCancelBtn(browser).then(function(cencelBtnTxt) {
			assessmentsPage.validateDeleteBtn(browser).then(function(deleteBtnTxt) {
				if (cencelBtnTxt.indexOf("CANCEL") > -1 && deleteBtnTxt.indexOf("DELETE") > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Delete and Cancel button is appearing with their respective text", cencelBtnTxt + " " + deleteBtnTxt, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Delete and Cancel button is appearing with their respective text", cencelBtnTxt + " " + deleteBtnTxt, "failure") +
						report.reportFooter());
				}
			});
		});
	});

	it(". Click on cancel button and validate assessment should not be deleted", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		assessmentsPage.clickOnCancelBtn(browser).then(function() {
			// assessmentsPage.validateAssignmentIsPresent(browser, "ROBO-Q-U-30 RANDOM NO 450").then(function(astStatus){
			assessmentsPage.validateAssignmentIsPresent(browser, assessmentsPage.getAssignmentName()).then(function(astStatus) {
				if (astStatus) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Assignment is not deleted", astStatus, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Assignment is not deleted", astStatus, "failure") +
						report.reportFooter());
				}
			});
		});
	});

	it(". Wait for page load", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser.refresh().sleep(3000).then(function(){
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(" Open the created assessment for deleting", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		// assessmentsPage.clickOnAssignmentOnCurrentDate(browser, "ROBO-Q-U-30 RANDOM NO 450").then(function(){
		assessmentsPage.clickOnAssignmentOnCurrentDate(browser, assessmentsPage.getAssignmentName()).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Click on delete button and validate the confirmation popup should be appear", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		assessmentsPage.deleteAssessmentFromUI(browser).then(function() {
			assessmentsPage.validateConfirmationBox(browser).then(function() {
				done();
			});
		});
	});

	it(". Click on 'Delete' button and validate assignment should be deleted", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		assessmentsPage.clickOnDeleteBtn(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Validate created CFM assessment type assignment should be deleted", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		// assessmentsPage.validateAssignmentIsPresent(browser, "ROBO-Q-U-30 RANDOM NO 450").then(function(astStatus){
		assessmentsPage.validateAssignmentIsPresent(browser, assessmentsPage.getAssignmentName()).then(function(astStatus) {
			if (!astStatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment is deleted", astStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment is not deleted", astStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Log out as Instructor", function(done) {
		this.retries(3);
		this.timeout(courseHelper.getElevatedTimeout());
		userSignOut.userSignOut(browser, done);
	});

});
