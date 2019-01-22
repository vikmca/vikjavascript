require('colors');
var wd = require('wd');
var dataUtil = require("../../../util/date-utility");
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
var instructorMainGradebookView = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/mainGradebookView");
var instructorGradebookStudentDetailedPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/studentDetailedInfopo");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var assessmentData = require("../../../../../test_data/assignments/assessments.json");
var session = require("../../../support/setup/browser-session");
var tocpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/tocpo.js");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var testData = require("../../../../../test_data/data.json");
var courseHelper = require("../../../support/helpers/courseHelper");
var report = require("../../../support/reporting/reportgenerator");
var mathutil = require("../../../util/mathUtil");
var asserters = wd.asserters;
var _ = require('underscore');
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var path = require('path');
var scriptName = path.basename(__filename);
var totalpoints = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/mainGradebookView").totalValueOfScoresForAllStudents;
describe(scriptName + 'CCS/CAS/GRADEBOOK :: INSTRUCTOR ASSIGNMENT CREATION WITH UNLIMITED ATTEMPTS, STUDENT SUBMISSION AT LEAST 20 TIMES, STUDENT GradeBook VALIDATION, INSTRUCTOR GradeBook VALIDATION', function() {
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
	var totalsudentcount;
	var totalValueOfScoresForAllStudents = 0;
	var pageLoadingTime;
	var totalTime;
	var serialNumber = 0;
	var assignmentNameClickableStatusAfterAttempt = false;
	var ScoresInAllAttempts = [];
	var totalPointsGainedByStudent;
	var averageScoreForAllStudents;
	var totalPointsGainedByStudentBeforeDueDatePassed;



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
		console.log("browserName::" + browserName);
		var data = loginPage.setLoginData(userType);
		totalTime = 0;
		//Reports
		console.log(report.formatTestName("CAS::CREATE ASSIGNMENT WITH UNLIMITED ATTEMPT AND VALIDATE STUDENT CAN TAKE UNLIMITED TIMES"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***validateStudentCanTakeMoreThanSixAttemptForUnlimitedAttempts.js***"));
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

	it(". Navigate to assignment list view", function(done) {
		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) === "mobile" || stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) === "iOS") {
			tocpo.selectTileView(browser).then(function() {
				done();
			});
		} else {
			console.log("for mobile specific");
			done();
		}
	});

	it(". Verify the current date background color", function(done) {
		assessmentsPage.getBackgroundColorOfCurrentDateIcon(browser).then(function(value) {
			if (value.toString() === "rgb(140, 208, 209)" || value.toString() === "rgb(50, 130, 133)") {

				assignmentCreationStatus = "success";
				console.log(report.reportHeader() + report.stepStatusWithData("Current date cell on instructor assignment calendar rgb(140, 208, 209) is compared with ", value.toString(), "success") + report.reportFooter());
				done();
			} else {
				assignmentCreationStatus = "failure";
				console.log(report.reportHeader() + report.stepStatusWithData("Current date cell on instructor assignment calendar rgb(140, 208, 209) is compared with ", value.toString(), "failure") + report.reportFooter());

			}
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

	it(". Complete the Assessment form for 'Choose For Me' type with high score strategy", function(done) {
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

	it(". Save the 'Choose For Me' type assessment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});

	// https://jira.cengage.com/browse/LTR-5311
	it(". LTR-5311 :: Validate Page don't keep in loading state for a long after saving the Assessment type assignment", function(done) {
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

	it(". Verify if the 'Choose For Me' type assignment is saved successfully", function(done) {
		assessmentsPage.checkIfAssignmentSaved(browser).then(function(value) {
			console.log(value.toString());
			console.log("rgb(236, 41, 142)");
			if (value.toString() === "rgb(236, 41, 142)") {
				assignmentCreationStatus = "success";
				console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName(), "success") + report.reportFooter());
				done();
			} else {
				assignmentCreationStatus = "failure";
				console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName() + " may not have received the assessmentCGI", "failure") + report.reportFooter());

			}
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
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		userType = "student";
		data = loginPage.setLoginData(userType);
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

	for (var i = 0; i < 20; i++) {

		it(". Wait for page load", function(done) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});

		it(". Click on the current date cell", function(done) {
			if (assignmentCreationStatus === "failure") {
				this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
			}
			studentAssessmentsPage.clickCurrentDateCell(browser, done);
		});

		it(". Launch the assignment at first time", function(done) {
			pageLoadingTime = 0;
			if (assignmentCreationStatus === "failure") {
				this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
			} else {
				this.timeout(courseHelper.getElevatedTimeout());
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

		it(". Complete the 'Choose For Me' type assignment for the first time", function(done) {
			pageLoadingTime = 0;
			//Call this function if you want a specific block to timeout after a specific time interval
			if (assignmentCreationStatus === "failure") {
				this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
			} else {
				this.timeout(courseHelper.getElevatedTimeout("quiz"));
				takeQuizpo.takeQuiz(browser, done);
			}

		});


		it(". Fetch correct questions from quiz results page", function(done) {
			casPage.getQuestionsCorrect(browser).then(function(questionsCorrect) {
				console.log("Total Questions Correct " + questionsCorrect);
				questionsCorrectFromCAS = parseInt(questionsCorrect);
				ScoresInAllAttempts.push(questionsCorrectFromCAS);
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
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
		});
	}

	it(". Validate student should take 20 attempts", function(done) {
		if (i === 21) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Student is able to take 20 attempts", i - 1, "success") +
				report.reportFooter());
			done();
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Student is able to take 20 attempts", i - 1, "failure") +
				report.reportFooter());
		}
	});

	it(". Find the greatest value for correct answer and calculate the highest marks", function(done) {
		var maxCorrectAnswerCount = _.max(ScoresInAllAttempts);
		totalPointsGainedByStudent = assessmentsPage.getRoboPointScore(maxCorrectAnswerCount);
		console.log(report.reportHeader() +
			report.stepStatusWithData("All attempt's correct question is " + ScoresInAllAttempts + " and max is " + maxCorrectAnswerCount + " and highest score is ", totalPointsGainedByStudent, "success") +
			report.reportFooter());
		done();
	});


	it(". Navigate to Gradebook page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});
	//https://jira.cengage.com/browse/LTR-5329
	it(". LTR-5329 :: Validate assignment coulum shoud not disappear from the Student gradebook page", function(done) {
		assessmentsPage.validateAssignmentDetailsOnGradebook(browser).then(function(astDetailsStatus) {
			if (astDetailsStatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Created assessment details are appeared on student gradebook page", astDetailsStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Created assessment details are appeared on student gradebook page", astDetailsStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Refresh the page and wait until page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". [Gradebook]Validate the Points earned by the student", function(done) {
		this.retries(3);
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.getScoredPoints(browser, assessmentsPage.getAssignmentName()).then(function(valueScore) {
			if (valueScore.toString() === totalPointsGainedByStudent) {
				pointsFromStudentGradebook = valueScore;
				console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + totalPointsGainedByStudent + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "success") + report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + totalPointsGainedByStudent + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "failure") + report.reportFooter());
			}
		});
	});

	it(". [Gradebook]Validate the Score(Questions Correct) is not present from Student Gradebook table", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.verifyStudentScoreColoumn(browser, assessmentsPage.getAssignmentName()).then(function(status) {
			if (!status) {
				console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : Score(Questions Correct) is not avaibale on stuent gradebook table at student end and status of score coloumn is " + status, "success") + report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : Score(Questions Correct) is not avaibale on stuent gradebook table at student end and status of score coloumn is " + status, "failure") + report.reportFooter());
			}
		});
	});

	it(". Validate the presence of Class average value on student GradeBook", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.validateAvgScoreOnStudentGradebook(browser, assessmentsPage.getAssignmentName(), totalPointsGainedByStudent, done);
	});


	it(". Validate the presence of submission date on student Gradebook page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.getSubmittedDate(browser, assessmentsPage.getAssignmentName())
			.then(function(dateOnStudentDetailedPage) {
				if (dateOnStudentDetailedPage.indexOf(dataUtil.getCurrentDateOnhyphenatedMMDDYYformatOnStudent()) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Submission date of assignment " + dateOnStudentDetailedPage + " is compared against current date of assignment submission", dataUtil.getCurrentDateOnhyphenatedMMDDYYformatOnStudent(), "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Submission date of assignment " + dateOnStudentDetailedPage + " is compared against current date of assignment submission", dataUtil.getCurrentDateOnhyphenatedMMDDYYformatOnStudent(), "failure") +
						report.reportFooter());
				}
			});
	});

	it(". Validate the presence of due date on student GradeBbook page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.getDueDate(browser, assessmentsPage.getAssignmentName()).then(function(dateOnStudentGradebookPage) {
			if (dateOnStudentGradebookPage.indexOf(dataUtil.getCurrentDateOnhyphenatedMMDDYYformatOnStudent()) > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : due date of assignment " + dateOnStudentGradebookPage + " is compared against current date of assignment submission", dataUtil.getCurrentDateOnhyphenatedMMDDYYformatOnStudent(), "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Submission date of assignment " + dateOnStudentGradebookPage + " is compared against current date of assignment submission", dataUtil.getCurrentDateOnhyphenatedMMDDYYformatOnStudent(), "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Log out as Student", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userSignOut.userSignOut(browser, done);
	});

	it(". Login as Instructor", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userType = "instructor";
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Product", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		brainPage.selectProduct(product, browser, done);
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

	it(". Navigate on Gradebook page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userType = "instructor";
		menuPage.selectGradebook("instructor", browser, done);
	});

	it(". Validate the Export button on different browser", function(done) {
		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) === "iOS") {
			console.log("This feature is not implemented for iOS");
			this.skip();
		} else {
			instructorGradebookNavigationPage.validateExportButton(browser, done);
		}
	});

	it(". Retrieve count of registered student for the launched course", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorMainGradebookView.getStudentCount(browser).then(function(studentCounts) {
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


	it(". Calcuate the total of score earned by students for a particular assignment ", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		var sizeOfColumn = 0;
		instructorMainGradebookView.getTotalScoreBoxOnGradebook(browser, loginPage.getUserName())
			.then(function(elements) {
				sizeOfColumn = _.size(elements);

				function calculateValue() {
					if (sizeOfColumn > 0) {
						instructorMainGradebookView.getScoreText(browser, sizeOfColumn)
							.then(function(value) {
								if (!mathutil.isEmpty(value)) {
									totalValueOfScoresForAllStudents = totalValueOfScoresForAllStudents + parseInt(value);
									sizeOfColumn--;
									calculateValue();
								} else {
									console.log(report.reportHeader() +
										report.stepStatusWithData("failure", "", "failure") +
										report.reportFooter());
								}
							});
					} else {
						done();
					}
				}
				calculateValue();
			});
	});

	it(". Calculate class average for a particular assignment ", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		averageScoreForAllStudents = (totalPointsGainedByStudent / parseInt(totalsudentcount));
		console.log(report.reportHeader() +
			report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment calculated and is coming out to be ::  " + averageScoreForAllStudents, "success") +
			report.reportFooter());
		done();
	});

	it(". LTR-5346 Verify the presence of total point is zero untill the due date has passed on the Instructor GradeBook on the GradeBook table", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorMainGradebookView.getTotalPoints(browser).text().then(function(totalPoints) {
			if (parseInt(totalPoints) === 0) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : TestBot Total points " + 0 + ", is compared against the Max total points  ", totalPoints + " displayed on the Instructor GradeBook table", "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : TestBot Total points  " + 0 + ", is compared against the Max total points  ", totalPoints + " displayed on the Instructor GradeBook table", "failure") +
					report.reportFooter());
			}
		});
	});

	it(". LTR-5346 Verify the presence of point gained by the student is reflected 0 on total points until assignment due date has passed", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorMainGradebookView.getPointsGainedByStudent(browser, loginPage.getUserName())
			.then(function(pointsGained) {
				console.log(" ....... >>>>  " + pointsGained + " === " + totalPointsGainedByStudent);
				totalPointsGainedByStudentBeforeDueDatePassed = pointsGained;
				if (parseInt(totalPointsGainedByStudentBeforeDueDatePassed) === 0) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Total points earned by student " + totalPointsGainedByStudentBeforeDueDatePassed + ", is compared against the testbot calculated total points earned ", 0, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Total points earned by student " + totalPointsGainedByStudentBeforeDueDatePassed + ", is compared against the testbot calculated total points earned ", 0, "failure") +
						report.reportFooter());
				}
			});
	});

	it(". Verify the presence of point of assignments gained by the student", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorMainGradebookView.getScoreText(browser, 1)
			.then(function(pointsGainedByStudent) {
				var totalPointsGained = pointsGainedByStudent;
				console.log("totalPointsGained" + totalPointsGained);
				console.log("totalPointsGainedByStudent" + totalPointsGainedByStudent);
				if (parseInt(totalPointsGained) == totalPointsGainedByStudent) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Total points earned by student " + totalPointsGained + ", is compared against the testbot calculated total points earned ", totalPointsGainedByStudent, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Total points earned by student " + totalPointsGained + ", is compared against the testbot calculated total points earned ", totalPointsGainedByStudent, "failure") +
						report.reportFooter());
				}
			});
	});

	it(". Navigate to student's detailed gradebook view", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		data = loginPage.setLoginData("student");
		instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserName()).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});

	});

	it(". Refresh the page and wait until page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

		it(". LTR-5329 :: Validate assignment column should not disappear from the instructor's student detailed page", function(done) {
		assessmentsPage.validateAssignmentDetailsOnGradebook(browser).then(function(astDetailsStatus) {
			if (astDetailsStatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Created assessment details are appeared on instructor's student detailed page", astDetailsStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Created assessment details are appeared on instructor's student detailed page", astDetailsStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". LTR-5378 : Validate assignment name should be clickable", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.assignmentNameClickableStatus(browser, assessmentsPage.getAssignmentName()).then(function(assignmentNameClickableStatus) {
			console.log("assignmentNameClickableStatus" + assignmentNameClickableStatus);
			assignmentNameClickableStatusAfterAttempt = assignmentNameClickableStatus;
			if (assignmentNameClickableStatusAfterAttempt) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Student Detailed page:: Assignment name is clickable after student assignment submission " + assignmentNameClickableStatusAfterAttempt, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Student Detailed page:: Assignment name is clickable after student assignment submission " + assignmentNameClickableStatusAfterAttempt, "failure") +
					report.reportFooter());
			}

		});
	});

	it(". Validate presence of class average value on student detailed page on instructor gradebook view ", function(done) {
		if (assignmentCreationStatus === "failure" && assignmentNameClickableStatusAfterAttempt == false) {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.retries(3);
		}
		instructorGradebookStudentDetailedPage.validatePresenceOfAverageScore(browser, assessmentsPage.getAssignmentName()).then(function(classAvg) {
			if (classAvg === averageScoreForAllStudents.toString()) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment on student detailed GradeBook view ::  " + classAvg, "is compared against the calculated class average ::" + averageScoreForAllStudents, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment on student detailed GradeBook view ::  " + classAvg, "is compared against the calculated class average ::" + averageScoreForAllStudents, "failure") +
					report.reportFooter());
			}

		});
	});


		it(". [Gradebook] Verify whether the system generated student point score is updated on Instructor Gradebook on the Student Detailed Results Page", function(done) {

		this.retries(3);
		if (assignmentCreationStatus === "failure" && assignmentNameClickableStatusAfterAttempt == false) {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.getScoredPoints(browser, assessmentsPage.getAssignmentName())
			.then(function(scoredPoints) {
				if (scoredPoints.toString() === totalPointsGainedByStudent) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + totalPointsGainedByStudent + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + totalPointsGainedByStudent + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "failure") +
						report.reportFooter());
				}
			});
	});


	it(". Navigate to Assignments page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});


	it(". Delete the created assignment", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		}
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

	it(". Log out as Instructor", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userSignOut.userSignOut(browser, done);
	});

});

//total test case 90
