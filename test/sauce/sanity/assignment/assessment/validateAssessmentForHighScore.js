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
var studentAssessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var casPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var studenGradebookPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/student/gradebookValidationpo");
var instructorGradebookNavigationPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/gradebookNavigationpo");
var instructorGradebookStudentDetailedPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/studentDetailedInfopo");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var mainGradebookView = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/mainGradebookView");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var assessmentData = require("../../../../../test_data/assignments/assessments.json");
var session = require("../../../support/setup/browser-session");
var testData = require("../../../../../test_data/data.json");
var courseHelper = require("../../../support/helpers/courseHelper");
var report = require("../../../support/reporting/reportgenerator");
var mathutil = require("../../../util/mathUtil");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'CCS/CAS/GRADEBOOK :: ASSIGNMENT WITH HIGH SCORE STRATEGY VALIDATION', function() {
	var browser;
	var allPassed = true;
	var userType;
	var setDate;
	var courseName;
	var studentAssignmentCompletionStatus = "failure";
	var assignmentCreationStatus = "failure";
	var product;
	var scoreFromStudentGradebook;
	var pointsFromStudentGradebook;
	var totalsudentcount;
	var questionsCorrect1stattemptFromCAS;
	var questionsCorrect2ndattemptFromCAS;
	var questionsCorrect3rdattemptFromCAS;
	var pageLoadingTime;
	var totalTime;
	var highestValueOfCorrectedQuestion;
	var serialNumber = 0;
	var highestscore;
	var totalAttempts;
	var remainingAttempts;

	var attemptBeforeAttempDelete;
	var attemptAfterAttempDelete;
	var correctQuestionArray;
	var correctQuestionOfDeletedAssignment;
	var beforeAttemptDeletePoints;
	var attemptInDropDownbeforeDelete;
	var attemptInDropDownAfterDelete
	var remainingAttemptsAfterAttemptDeleted;
	var totalAttemptsAfterAttemptDeleted;
	var getPoints;
	//var runningTarget;

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
		console.log(report.formatTestName("CCS/CAS/GRADEBOOK :: ASSIGNMENT WITH HIGHEST REPORTING STRATEGY VALIDATION"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***validateAssessmentForHighScore.js***"));

		//runningTarget = stringutil.removeBoundaryQuotes(process.env.RUN_ENV.toString());

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

	it(". Navigate on GradeBook page", function(done) {
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Retrieve count of registered student for the launched course", function(done) {
		mainGradebookView.getStudentCount(browser).then(function(studentCounts) {
			totalsudentcount = _.size(studentCounts);
			if (!mathutil.isEmpty(totalsudentcount)) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Number of student who will attempt the assignment ", totalsudentcount, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : No student appears on the Instructor GradeBook page that is", totalsudentcount, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Navigate to Assignments Page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Wait until page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
	});

	it(". Deleting  the created assignment", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		assessmentsPage.deleteAssignment(browser, done); //changed deleteAssignment(Automated using UI and API)
	});

	it(". Wait for page load", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
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

	it(". Select current date and open the Assessment Type assignment settings page", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.selectADateForAssignment(browser).then(function() {
			calendarNavigation.selectAssessmentTypeAssignment(browser).then(function() {
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assessment type assignment is selected");
			});
		});
	});

	it(". Complete CFM Assessment form for system created assignment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.enterName(browser).then(function() {
			assessmentsPage.enterRevealDate(browser).then(function() {
				assessmentsPage.selectChapter(browser, assessmentData.systemgenerated.scorestrategyhigh.chapter).then(function() {
					assessmentsPage.enterScore(browser, assessmentData.systemgenerated.scorestrategyhigh.score).then(function() {
						assessmentsPage.selectAttempts(browser, assessmentData.systemgenerated.scorestrategyhigh.scoreStrategyAttempt).then(function() {
							assessmentsPage.selectQuestionStrategy(browser, assessmentData.systemgenerated.QuestionStrategy.option[0]).then(function() {
								assessmentsPage.enterQuestionsPerStudent(browser, assessmentData.systemgenerated.scorestrategyhigh.questions).then(function() {
									console.log(report.reportHeader() +
										report.stepStatusWithData("Assessment form has been filled by chapter :" +
											assessmentData.systemgenerated.scorestrategyhigh.chapter + ", Score :" +
											assessmentData.systemgenerated.scorestrategyhigh.score + ", Number Of Attempts :" +
											assessmentData.systemgenerated.scorestrategyhigh.scoreStrategyAttempt + ", Question Strategy :" +
											assessmentData.systemgenerated.QuestionStrategy.option[0] + ", Score Strategy : High and Questions Per Student :",
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

	it(". Save the CFM assessment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});


	it(". Verify if CFM assessment type assignment gets saved successfully", function(done) {
		assessmentsPage.checkIfAssignmentSaved(browser).then(function(value) {
			if (value.toString() === "rgb(236, 41, 142)") {
				assignmentCreationStatus = "success";
				console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName(), "success") + report.reportFooter());
				done();
			} else {
				assignmentCreationStatus = "failure";
				console.log(report.reportHeader() +
					report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName() + " may not have received the assessmentCGI", "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Navigate on GradeBook page", function(done) {
		menuPage.selectGradebook("instructor", browser, done);
	});
	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Navigate to student's detailed GradeBook view", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
			console.log(loginPage.getUserName());
		}
		data = loginPage.setLoginData("student");
		//Reports
		console.log(report.printLoginDetails(data.userId, data.password));
		console.log(loginPage.getUserName());
		instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserName()).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Wait for page load", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});


	it(". Edit due date for current student to future date", function(done) {
		pageLoadingTime = 0;
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		console.log("assessmentsPage.getAssignmentName()" + assessmentsPage.getAssignmentName());
		var assignmentName = assessmentsPage.getAssignmentName();
		instructorGradebookStudentDetailedPage.dueDateValueBeforeTakeAnyAttempt(browser, assignmentName).then(function(dueDateBeforeEdit) {
			console.log(dueDateBeforeEdit);
			instructorGradebookStudentDetailedPage.editDueDateBeforeTakeAnyAttempt(browser, assignmentName).then(function() {
				instructorGradebookStudentDetailedPage.dueDateValueBeforeTakeAnyAttempt(browser, assignmentName).then(function(dueDateAfterEdit) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Assignment due date " + dueDateBeforeEdit + " updated by", dueDateAfterEdit, "success") +
						report.reportFooter());
					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Due date edited");
				});
			});
		});
	});

	it(". Wait for page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Edit due date again for current student from future to today's date", function(done) {
		pageLoadingTime = 0;
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.dueDateValueBeforeTakeAnyAttempt(browser, assessmentsPage.getAssignmentName()).then(function(dueDateBeforeEdit) {

			instructorGradebookStudentDetailedPage.editDueDateTOCurrentDate(browser, assessmentsPage.getAssignmentName()).then(function() {
				instructorGradebookStudentDetailedPage.dueDateValueBeforeTakeAnyAttempt(browser, assessmentsPage.getAssignmentName()).then(function(dueDateAfterEdit) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Assignment due date " + dueDateBeforeEdit + " updated by", dueDateAfterEdit, "success") +
						report.reportFooter());
					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Due date edited");
				});
			});
		});
	});


	it(". Log out as Instructor", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userSignOut.userSignOut(browser, done);
	});
	it(". Login as student", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userType = "student";
		data = loginPage.setLoginData(userType);
		//Reports
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Course and launch", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		loginPage.launchACourse(userType, courseName, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate to Assignments page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Wait until page load", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
	});

	it(". Click on the current date cell", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickOnCurrentDateCell(browser).then(function() {
			done();
		})
	});

	it(". Launch the CFM assessment type assignment for the first time which due date has been edited", function(done) {
		pageLoadingTime = 0;
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.launchAssignment(browser, assessmentsPage.getAssignmentName()).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is launched");
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

	it(". Complete the CFM assessment type assignment", function(done) {
		pageLoadingTime = 0;
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("quiz"));
			takeQuizpo.takeQuiz(browser, done);
		}

	});

	it(". Fetch correct questions from assessment results page", function(done) {
		casPage.getQuestionsCorrect(browser).then(function(questionsCorrect) {
			questionsCorrect1stattemptFromCAS = parseInt(questionsCorrect);
			console.log("Total Questions Correct " + questionsCorrect);
			console.log("Total Assignment Questions " + assessmentsPage.getMaxAssignmentQuestions());
			studentAssignmentCompletionStatus = "success";
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS : Student Completed the 1st attempt of assignment with questions " + assessmentsPage.getMaxAssignmentQuestions() + " and got a score of  ", questionsCorrect, "success") +
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


	it(". Wait until page load", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
			});
	});

	it(". Click on the current date cell", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickOnCurrentDateCell(browser).then(function() {
			done();
		})
	});

	it(". Launch the CFM assessment type assignment for the second attempt", function(done) {
		pageLoadingTime = 0;
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.launchAssignment(browser, assessmentsPage.getAssignmentName()).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is launched");
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

	it(". Complete the assignment", function(done) {
		pageLoadingTime = 0;
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("quiz"));
			//Call this function if you want a specific block to timeout after a specific time interval0);
			takeQuizpo.takeQuiz(browser, done);
		}
	});

	it(". Fetch correct questions from assessment results page for second time", function(done) {
		casPage.getQuestionsCorrect(browser).then(function(questionsCorrect) {
			questionsCorrect2ndattemptFromCAS = parseInt(questionsCorrect);
			console.log("Total Questions Correct " + questionsCorrect);
			console.log("Total Assignment Questions " + assessmentsPage.getMaxAssignmentQuestions());
			studentAssignmentCompletionStatus = "success";
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS : Student Completed the 2nd attempt of assignment with questions " + assessmentsPage.getMaxAssignmentQuestions() + " and got a score of  ", questionsCorrect, "success") +
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


	it(". Wait until page load", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
			});
	});

	it(". Click on the current date cell", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickOnCurrentDateCell(browser).then(function() {
			done();
		})
	});

	it(". Launch the CFM assessment type assignment for the third attempt", function(done) {
		pageLoadingTime = 0;
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.launchAssignment(browser, assessmentsPage.getAssignmentName()).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is launched");
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

	it(". Complete the CFM assessment type assignment", function(done) {
		pageLoadingTime = 0;
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("quiz"));
			takeQuizpo.takeQuiz(browser, done);
		}

	});


	it(". Fetch correct questions from assessment results page", function(done) {
		casPage.getQuestionsCorrect(browser).then(function(questionsCorrect) {
			questionsCorrect3rdattemptFromCAS = parseInt(questionsCorrect);
			console.log("Total Questions Correct " + questionsCorrect);
			console.log("Total Assignment Questions " + assessmentsPage.getMaxAssignmentQuestions());
			studentAssignmentCompletionStatus = "success";
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS : Student Completed the 3rd attempt of assignment with questions " + assessmentsPage.getMaxAssignmentQuestions() + " and got a score of  ", questionsCorrect, "success") +
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
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickOnCurrentDateCell(browser).then(function() {
			done();
		})
	});

	it("After completing the last assignment( third attempt of assessment ) fetching the number of remaining attempts and total attempts", function(done) {
		browser
			.elementByXPath("//div[@class='attempts ng-binding']/span")
			.then(function(ele) {
				browser
					.getLocationInView(ele)
					.elementByXPath("//div[@class='attempts ng-binding']/span").text()
					.then(function(data) {
						var temp = data.split("/");
						remainingAttempts = temp[0];
						totalAttempts = temp[1];
						//console.log("Remaining Attempts = "+remainingAttempts +" Total Attempts = "+totalAttempts);
						console.log(report.reportHeader() +
							report.stepStatusWithData("Remaining Attempts = " + remainingAttempts, " Total Attempts = " + totalAttempts, "success") +
							report.reportFooter());
						done();
					});
			});
	});

	it(". Click on the current date cell", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickOnCurrentDateCell(browser).then(function() {
			done();
		})
	});


	it(". Navigate to GradeBook page", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Wait for page load", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
	});

	it(". LTR-5162 Validate Assignment name on the student gradebook page should not be display as blue text when due date has not passed", function(done) {
		studentAssessmentsPage.verifyastIsClickable(browser, assessmentsPage.getAssignmentName()).then(function(astWithHyperlinkStatus) {
			var astStatus = astWithHyperlinkStatus;
			if (astStatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData(" Assesments are not clickable till the due date has passed ", "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData(" Assesments are clickable till the due date has passed", "failure") +
					report.reportFooter());
			}
		});
	});



	it(". LTR-5162:: [Student GradeBook]:: Validate the color of the assignment's name if due date has not passed at student end ", function(done) {
		studentAssessmentsPage.verifyAstcolorOnCurrentDate(browser, assessmentsPage.getAssignmentName()).then(function(color) {
			if (color === "rgb(102, 102, 102)" || color === "rgb(48, 48, 48)") {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment name is displaying with black text color and text is", color, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment name is displaying with sky blue color and text is", color, "failure") +
					report.reportFooter());

			}
		});
	});

	it(". Wait for page load", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
		});
	});

	it(". Retrieve highest score from student's attempts score", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		var numbers = [questionsCorrect1stattemptFromCAS, questionsCorrect2ndattemptFromCAS, questionsCorrect3rdattemptFromCAS];
		correctQuestionArray = numbers;
		highestValueOfCorrectedQuestion = mathutil.getMaximum(numbers);
		getPoints = assessmentsPage.getRoboPointScore(highestValueOfCorrectedQuestion);
		beforeAttemptDeletePoints = getPoints;
		console.log(report.reportHeader() +
			report.stepStatusWithData("Highest corrected question", highestValueOfCorrectedQuestion, "success") +
			report.reportFooter());
		done();
	});

	it(". Wait until page is loaded successfully", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". LTR-5162 [Student Gradebook]:: Validate the Points earned by the student", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		var roboPoints = assessmentsPage.getRoboPointScore(highestValueOfCorrectedQuestion);
		console.log("roboPoints = " + roboPoints);
		studenGradebookPage.getScoredPoints(browser, assessmentsPage.getAssignmentName()).then(function(valueScore) {
			if (!mathutil.isEmpty(valueScore)) {
				console.log("valueScore = " + valueScore);
				if (parseInt(valueScore) == parseInt(roboPoints)) {
					pointsFromStudentGradebook = valueScore;
					console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + assessmentsPage.getRoboPointScore(highestValueOfCorrectedQuestion) + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "success") + report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + assessmentsPage.getRoboPointScore(highestValueOfCorrectedQuestion) + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "failure") + report.reportFooter());
				}

			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : get point score from element is empty ", valueScore, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". LTR-5162 Validate the presence of Class average value on student gradebook", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		var astName = assessmentsPage.getAssignmentName();
		classAverageScoreAfterAllAttempts = assessmentsPage.getRoboPointScore(highestValueOfCorrectedQuestion) / parseInt(totalsudentcount);
		studenGradebookPage.validateAvgScoreOnStudentGradebook(browser, astName, classAverageScoreAfterAllAttempts, done);
	});

	it(". Log out as Student", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userSignOut.userSignOut(browser, done);
	});

	it(". Login as Instructor", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userType = "instructor";
		data = loginPage.setLoginData(userType);
		//Reports
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Product", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}

		brainPage.selectProduct(product, browser, done);
	});

	it(". Select a Course and launch", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		loginPage.launchACourse(userType, courseName, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate on GradeBook page", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectGradebook("instructor", browser, done);
	});

	it(". Wait until page load", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Gradebook page is loaded");
	});

	it(". Navigate to student's detailed GradeBook view", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
			console.log(loginPage.getUserName());
		}
		data = loginPage.setLoginData("student");
		//Reports
		console.log(report.printLoginDetails(data.userId, data.password));
		console.log(loginPage.getUserName());
		instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserName()).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Student detailed page is loaded");
		});
	});

	it(". Wait until page is loaded successfully", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
			console.log(loginPage.getUserName());
		}
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});



	it(". Validate presence of class average value on student detailed page on instructor GradeBook view ", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3);
		instructorGradebookStudentDetailedPage.validatePresenceOfAverageScore(browser, assessmentsPage.getAssignmentName()).then(function(classAvg) {
			if (parseInt(classAvg) === classAverageScoreAfterAllAttempts) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment on student detailed GradeBook view ::  " + classAvg, "is compared against the calculated class average ::" + classAverageScoreAfterAllAttempts, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment on student detailed GradeBook view ::  " + classAvg, "is compared against the calculated class average ::" + classAverageScoreAfterAllAttempts, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". [Gradebook] Verify whether the system generated student point score is updated on Instructor GradeBook on the Student Detailed Results Page", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3);
		instructorGradebookStudentDetailedPage.getScoredPoints(browser, assessmentsPage.getAssignmentName())
			.then(function(scoredPoints) {
				if (parseInt(scoredPoints) == assessmentsPage.getRoboPointScore(highestValueOfCorrectedQuestion)) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + assessmentsPage.getRoboPointScore(highestValueOfCorrectedQuestion) + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + assessmentsPage.getRoboPointScore(highestValueOfCorrectedQuestion) + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "failure") +
						report.reportFooter());
				}

			});
	});

	it(". Edit attempt from the instructor gradebook", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.editedAttemptsFromStudentDetaledView(browser, assessmentsPage.getAssignmentName()).then(function() {
			done();
		});
	});

	it(". Validate attempts edited successfully without any error message", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.editedAttemptOnStudentDetailPage(browser, assessmentsPage.getAssignmentName()).then(function(editedAttempt) {
			if (editedAttempt.indexOf("unlimited") > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment edited attempts with", "unlimited", "success") +
					report.reportFooter());
				instructorGradebookStudentDetailedPage.errorFlashHideStatus(browser).then(function(errorFlashHideStatus) {
					if (errorFlashHideStatus) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Error flash hide status on the page", errorFlashHideStatus, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Error flash hide status on the page", errorFlashHideStatus, "failure") +
							report.reportFooter());
					}
				});
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment edited attempts with", "unlimited", "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Wait until the assignment page is loaded successfully", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser
			.sleep(2000)
			.refresh()
			.then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
			});
	});

	it(". Re-validate edited attempts persist after refreshing the page without any error", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser.sleep(5000);
		instructorGradebookStudentDetailedPage.editedAttemptOnStudentDetailPage(browser, assessmentsPage.getAssignmentName()).then(function(editedAttempt) {
			// if (process.env.RUN_ENV.toString() === "\"integration\"") {
			if (editedAttempt.indexOf("unlimited") > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment edited attempts with", "unlimited", "success") +
					report.reportFooter());
				instructorGradebookStudentDetailedPage.errorFlashHideStatus(browser).then(function(errorFlashHideStatus) {
					if (errorFlashHideStatus) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Error flash hide status on the page", errorFlashHideStatus, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Error flash hide status on the page", errorFlashHideStatus, "failure") +
							report.reportFooter());
					}
				});
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment edited attempts with", "unlimited", "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Edit attempt from the instructor gradebook and limit attempts to 3", function(done) {
		instructorGradebookStudentDetailedPage.editedAttemptsFromStudentDetaledVieAndLimitTo3(browser, assessmentsPage.getAssignmentName()).then(function() {
			done();
		});
	});


	it(". Validate class average value on student detailed page remains same after attempt override ", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3);
		instructorGradebookStudentDetailedPage.validatePresenceOfAverageScore(browser, assessmentsPage.getAssignmentName()).then(function(classAvg) {
			if (parseInt(classAvg) == classAverageScoreAfterAllAttempts) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment on student detailed GradeBook view ::  " + classAvg, "is compared against the calculated class average after attempt override" + classAverageScoreAfterAllAttempts, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment on student detailed GradeBook view ::  " + classAvg, "is compared against the calculated class average after attempt override" + classAverageScoreAfterAllAttempts, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". [Gradebook] Verify system generated student scored point on Student Detailed Results Page remains same after attempt override", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3);
		instructorGradebookStudentDetailedPage.getScoredPoints(browser, assessmentsPage.getAssignmentName())
			.then(function(scoredPoints) {
				if (parseInt(scoredPoints) == assessmentsPage.getRoboPointScore(highestValueOfCorrectedQuestion)) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + assessmentsPage.getRoboPointScore(highestValueOfCorrectedQuestion) + " points, is compared against the student point score retrieved from Instructor GradeBook after attempt override", scoredPoints, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + assessmentsPage.getRoboPointScore(highestValueOfCorrectedQuestion) + " points, is compared against the student point score retrieved from Instructor GradeBook after attempt override", scoredPoints, "failure") +
						report.reportFooter());
				}

			});
	});

	it(". Wait until page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "updated attempts page is loaded");
	});


	it(".  Select the particular assignment = " + assessmentsPage.getAssignmentName(), function(done) {
		instructorGradebookStudentDetailedPage.selectParticularAssignment(browser, assessmentsPage.getAssignmentName()).then(function() {
			done();
		});
	});

	it(". [Assessment result page]::Fetching Attempts done by student before clearing the attempt", function(done) {
		instructorGradebookStudentDetailedPage.getAttempts(browser).text().then(function(attemptsValue) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Completed Attempts count before deleting" + attemptsValue, "success") +
				report.reportFooter());
			attemptBeforeAttempDelete = attemptsValue;
			done();
		});
	});

	it(". Getting the count of correct question of the attempt which is about to delete ", function(done) {
		instructorGradebookStudentDetailedPage.getCorrectQuestionBeforeAttemptToDelete(browser).text().then(function(correctQuestion) {
			correctQuestionOfDeletedAssignment = parseInt(correctQuestion);
			console.log(report.reportHeader() +
				report.stepStatusWithData(" Assignments to be deleted have correctQuestion =" + correctQuestion, "success") +
				report.reportFooter());
			done();
		});
	});
	// if(stringutil.removeBoundaryQuotes(process.env.RUN_ENV.toString()) == "integration" || stringutil.removeBoundaryQuotes(process.env.RUN_ENV.toString()) == "staging"){
	it(". Updating array of correct Question and also calculating max score", function() {
		console.log(report.reportHeader() +
			report.stepStatusWithData(" Initial array of correct Question = " + correctQuestionArray, "success") +
			report.reportFooter());

		var index = correctQuestionArray.indexOf(correctQuestionOfDeletedAssignment);
		if (index > -1) {
			correctQuestionArray.splice(index, 1);
		}
		console.log(report.reportHeader() +
			report.stepStatusWithData(" Updated array of correct Question = " + correctQuestionArray, "success") +
			report.reportFooter());
		highestValueOfCorrectedQuestion = mathutil.getMaximum(correctQuestionArray);
		getPoints = assessmentsPage.getRoboPointScore(highestValueOfCorrectedQuestion);
		console.log(report.reportHeader() +
			report.stepStatusWithData(" Highest points before delete = " + beforeAttemptDeletePoints, " Highest points after delete = " + getPoints, "success") +
			report.reportFooter());
	});


	it(". Fetching the number of ATTEMPT done by student from drop-down list before deleting the attempt ", function(done) {
		instructorGradebookStudentDetailedPage.getAttemptsFromDropDown(browser).then(function(ele) {
			attemptInDropDownbeforeDelete = _.size(ele);
			done();
		});
	});


	it(". Validating the presence of 'CLEAR ATTEMPT' button and click on it", function(done) {
		instructorGradebookStudentDetailedPage.checkForClearAttemptButtonAndClickClearAttempt(browser).then(function() {
			done();
		});
	});

	it(". Validate that when user clicks on 'No' button on attempt deleting confirmation box then Attempts remain as it is", function(done) { //in process
		instructorGradebookStudentDetailedPage.clickOnCancelButtonOnClearAttemptModel(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "updated attempts page is loaded");
		});
	});

	it(". Validate that when user clicks on 'No' button then attempt delete confirmation box should hidden from the page", function(done) { //in process
		instructorGradebookStudentDetailedPage.getStatusOfClearAttemptPopupWindow(browser).then(function(clearAttemptModelWindow) {
			if (!clearAttemptModelWindow) {
				console.log(report.reportHeader() +
					report.stepStatusWithData(" Clear Attempt:: Model Window non Presence Status on Page " + clearAttemptModelWindow, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData(" Clear Attempt:: Model Window non Presence Status on Page " + clearAttemptModelWindow, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate the presence of CLEAR ATTEMPT button and click on it", function(done) {
		instructorGradebookStudentDetailedPage.checkForClearAttemptButtonAndClickClearAttempt(browser).then(function() {
			done();
		});
	});


	it(". Validate pop-up box heading and warning message on opened popup window", function(done) {
		instructorGradebookStudentDetailedPage.checkForPopUpBoxHeadingAndWarning(browser, testData.attemptClear.popUpBoxHeading, testData.attemptClear.popUpBoxWarning).then(function() {
			done();
		});
	});


	it(". Delete the attempt by clicking on Yes button", function(done) {
		instructorGradebookStudentDetailedPage.confirmAttemptDelete(browser).then(function() {
			done();
		});
	});


	it(". Wait until page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "updated attempts page is loaded");
	});

	it(". Getting attempts values after clearing the attempt", function(done) {
		instructorGradebookStudentDetailedPage.getAttempts(browser).text().then(function(attemptsValue) {
			console.log(report.reportHeader() +
				report.stepStatusWithData(" Attempts count after deleting one Attempt = " + attemptsValue, "success") +
				report.reportFooter());

			attemptAfterAttempDelete = attemptsValue;
			done();
		});
	});

	it(". Fetching the number of ATTEMPT done by student from drop-down list after deleting the one attempt ", function(done) {
		instructorGradebookStudentDetailedPage.getAttemptsFromDropDown(browser).then(function(ele) {
			attemptInDropDownAfterDelete = _.size(ele);
			done();
		});
	});

	it(". Validating the number of attempts in drop-down list get reduce by 1 after deleting the assignments", function(done) {
		console.log(attemptInDropDownAfterDelete + "  ...............  ++  " + attemptInDropDownbeforeDelete);
		console.log(attemptInDropDownAfterDelete + "  ...............  ++  " + attemptInDropDownbeforeDelete);
		var beforeDelete = parseInt(attemptInDropDownbeforeDelete) - 1;
		var afterDelete = parseInt(attemptInDropDownAfterDelete);
		console.log("beforeDelete" + beforeDelete);
		console.log("afterDelete" + afterDelete);
		if (beforeDelete === afterDelete) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Instructor Assignment's Result page:: No of assignment count is 1 less then i.e. " + beforeDelete + ", is compared against the after clear attempts count ", afterDelete, "success") +
				report.reportFooter());
			done();
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Instructor Assignment's Result page:: No of assignment count is 1 less then i.e. " + beforeDelete + ", is compared against the after clear attempts count ", afterDelete, "failure") +
				report.reportFooter());
		}
	});

	it(". Validating that after deleting one attempt the attempts count decreased by one at student details assessment result page", function() {
		attemptAfterAttempDelete.should.contain(attemptBeforeAttempDelete - 1);
	});



	it(". Log out as Instructor", function(done) {

		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userSignOut.userSignOut(browser, done);

	});


	it(". Login as student", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userType = "student";
		data = loginPage.setLoginData(userType);
		//Reports
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Course and launch", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		loginPage.launchACourse(userType, courseName, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate to Assignments Page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Click on the current date cell", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickOnCurrentDateCell(browser).then(function() {
			done();
		})
	});

	it(". Fetching the Remaining attempts and total attempts at student side after deleting one Attempt by instructor", function(done) {
		studentAssessmentsPage.getAssignmentAttemptCount(browser, assessmentsPage.getAssignmentName()).then(function(data) {
			var temp = data.split("/");
			remainingAttemptsAfterAttemptDeleted = temp[0];
			totalAttemptsAfterAttemptDeleted = temp[1];
			done();
		});

	});


	it(". Validate that after deleting an Attempt the Remaining Attempt at student side get increased by one", function() {
		console.log(remainingAttempts + "  ==   " + remainingAttemptsAfterAttemptDeleted);
		remainingAttempts.should.contain(parseInt(remainingAttemptsAfterAttemptDeleted) - 1);
		console.log(remainingAttempts + "  ==   " + remainingAttemptsAfterAttemptDeleted);
	});

	it(". Navigate to GradeBook page", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectGradebook(userType, browser, done);
	});


	it(". LTR-5162:: [Student Gradebook]:: Validate the Points earned by the student get changed or not due to deleting the attempt  ", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		var roboPoints = assessmentsPage.getRoboPointScore(highestValueOfCorrectedQuestion);
		console.log("At Instructor side points = " + roboPoints);
		studenGradebookPage.getScoredPoints(browser, assessmentsPage.getAssignmentName()).then(function(valueScore) {
			if (!mathutil.isEmpty(valueScore)) {
				console.log("At Student side points = " + valueScore);
				if (parseInt(valueScore) == parseInt(roboPoints)) {
					pointsFromStudentGradebook = valueScore;
					console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + assessmentsPage.getRoboPointScore(highestValueOfCorrectedQuestion) + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "success") + report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + assessmentsPage.getRoboPointScore(highestValueOfCorrectedQuestion) + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "failure") + report.reportFooter());
				}

			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : get point score from element is empty ", valueScore, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Log out as Student", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userSignOut.userSignOut(browser, done);
	});
	// }

});
