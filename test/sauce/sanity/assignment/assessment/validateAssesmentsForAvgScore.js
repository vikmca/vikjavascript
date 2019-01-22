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
var calendarNavigation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/navigationpo");
var assessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assessmentspo");
var assignmentAvgScore = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assesmentspoforAvgScore");
var studentAssessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var casPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var studenGradebookPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/student/gradebookValidationpo");
var instructorGradebookNavigationPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/gradebookNavigationpo");
var mainGradebookView = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/mainGradebookView");
var studentDetailedInfopo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/studentDetailedInfopo");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var instructorGradebookStudentDetailedPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/studentDetailedInfopo");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var assessmentData = require("../../../../../test_data/assignments/assessments.json");
var gradebookData = require("../../../../../test_data/gradebook/gradebook.json");
var session = require("../../../support/setup/browser-session");
var testData = require("../../../../../test_data/data.json");
var courseHelper = require("../../../support/helpers/courseHelper");
var report = require("../../../support/reporting/reportgenerator");
var mathutil = require("../../../util/mathUtil");
var _ = require('underscore');
var practiceQuizCreation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'CCS/CAS/GRADEBOOK :: ASSIGNMENT WITH AVERAGE REPORTING STRATEGY VALIDATION', function() {
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
	var totalPointsGainedByStudent;
	var totalsudentcount;
	var questionsCorrect1stattemptFromCAS;
	var questionsCorrect2ndattemptFromCAS;
	var questionsCorrect3rdattemptFromCAS;
	var pageLoadingTime;
	var incorrectResponseListCount = 0;
	var correctResponseListCount = 0;
	var countOfAttempt = 0;
	var defaultSelectedAttemptOnDropdown;
	var scorePercentage;
	var getTextOFSelectBoxOnAttempts = [];
	var getTextOFSelectBoxOnUI = [];
	var scorePercentageForFirstAttempt;
	var scorePercentageForSecondAttempt
	var scorePercentageForThirdAttempt;
	var classAverageScoreAfterAllAttempts
	var totalTime;
	var serialNumber = 0;
	var scoreAverage;
	var errorStatusOnCLickingAssignmentName;
	var attemptAfterAttempDelete;
	var attemptInDropDownAfterDelete;
	var ScoreInDropDownFields = [];
	var attemptBeforeAttempDelete;
	var remainingAttempts;
	var totalAttempts = [];

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
		console.log(report.formatTestName("CCS/CAS/GRADEBOOK :: ASSIGNMENT WITH AVERAGE REPORTING STRATEGY VALIDATION"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***validateAssesmentsForAvgScore.js***"));
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
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
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

	it(". Wait until page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, " page is loaded");
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate on GradeBook page", function(done) {
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Wait until page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
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

	it(". Delete all past assignments", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		assessmentsPage.deleteAssignment(browser, done);
	});

	it(". Refresh the assignment page and wait for page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
			});
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

	it(". Complete form for system created 'Choose For Me' type Assessment with average score strategy ", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.enterName(browser).then(function() {
			assessmentsPage.enterRevealDate(browser).then(function() {
				assessmentsPage.selectChapter(browser, assessmentData.systemgenerated.scorestrategyhigh.chapter).then(function() {
					assessmentsPage.enterScore(browser, assessmentData.systemgenerated.scorestrategyhigh.score).then(function() {
						assessmentsPage.selectAttempts(browser, assessmentData.systemgenerated.scorestrategyhigh.attempts).then(function() {
							assignmentAvgScore.selectAvgScore(browser).then(function() {
								assessmentsPage.selectQuestionStrategy(browser, assessmentData.systemgenerated.QuestionStrategy.option[0]).then(function() {
									assessmentsPage.enterQuestionsPerStudent(browser, assessmentData.systemgenerated.scorestrategyhigh.questions).then(function() {
										console.log(report.reportHeader() +
											report.stepStatusWithData("Assessment form has been filled by chapter :" +
												assessmentData.systemgenerated.scorestrategyhigh.chapter + ", Score :" +
												assessmentData.systemgenerated.scorestrategyhigh.score + ", Number Of Attempts :" +
												assessmentData.systemgenerated.scorestrategyhigh.attempts + ", Question Strategy :" +
												assessmentData.systemgenerated.QuestionStrategy.option[0] + ", Score Strategy :" +
												"Average" + ", Question Per Student",
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

	it(". Save the 'Choose For Me' type Assessment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});

	it(". Verify if 'Choose For Me' type Assessment saved successfully", function(done) {
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

	it(". Launch the 'Choose For Me' type Assessment for the first time", function(done) {
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

	it(". Complete the 'Choose For Me' type Assessment", function(done) {
		pageLoadingTime = 0;
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
			questionsCorrect1stattemptFromCAS = questionsCorrect;
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
			countOfAttempt++;
			scorePercentageForFirstAttempt = mathutil.getScorePercentage(questionsCorrect1stattemptFromCAS, assessmentData.systemgenerated.scorestrategyhigh.questions);
			console.log("scorePercentageForFirstAttempt" + scorePercentageForFirstAttempt);
			var defaultSelectedAttemptOnDropdownForFirstAttempt = stringutil.getTextOnAssignmentDetailedViewOnGragebook(countOfAttempt, scorePercentageForFirstAttempt);
			getTextOFSelectBoxOnAttempts.push(defaultSelectedAttemptOnDropdownForFirstAttempt);
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is attempted");
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

	it(". Navigate on GradeBook page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectGradebook("instructor", browser, done);
	});

	it(". Wait until page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
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
			done();
		});
	});

	it(". LTR-5211 Validated assignment name should be clickable on instructor gradebook student detailed page when student submits an assessment .", function(done) {
		instructorGradebookNavigationPage.checkAssignmentIsClickable(browser, assessmentsPage.getAssignmentName()).then(function(status) {
			astClickableStatus = status;
			if (astClickableStatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment is not clickable and status of assignment is  " + astClickableStatus, "failure") +
					report.reportFooter());
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment is clickable and status of assignment is  " + !astClickableStatus, "Success") +
					report.reportFooter());
				done();
			}
		});
	});

	it(".  navigate to Instructor's gradebook student details Assessment result page by clicking on assignment name on student detailed page", function(done) {
	console.log("assessmentsPage.getAssignmentName()"+assessmentsPage.getAssignmentName());
		instructorGradebookNavigationPage.navigateToDetailsOfStudentsAttempts(browser, assessmentsPage.getAssignmentName()).then(function() {
			console.log("assessmentsPage.getAssignmentName()"+assessmentsPage.getAssignmentName());
			done();
		});
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". LTR-4665 Validate the error message should not be display on clicking assignment name on student details page", function(done) {
		instructorGradebookNavigationPage.verifyErrorMessageOnClickingAssignmentName(browser).then(function(errorStatus) {
			errorStatusOnCLickingAssignmentName = errorStatus
			if (errorStatusOnCLickingAssignmentName) {
				return browser
					.waitForElementByCss(".flash-alert.error-alert ul li[class='ng-scope ng-binding']", asserters.isDisplayed, 60000).text().then(function(errorText) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("error message is displaying on on clicking assignment name in gradebook details page " + errorText, "failure") +
							report.reportFooter());
					});
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("No error message is displaying on dragging the assignmnet " + errorStatus, "success") +
					report.reportFooter());
				done();

			}

		});
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});


	it(". Validate assignment's and student's name are present on assignment result page", function(done) {
		instructorGradebookNavigationPage.getAssignmentNameOnDetailedPage(browser).then(function(assignmentName) {
			instructorGradebookNavigationPage.getStudentNameOnDetailedPage(browser).then(function(studentName) {
				var astNameFormatOnAssessmentDetailedPage = assessmentsPage.getAssignmentName() + ":";
				if (assignmentName === astNameFormatOnAssessmentDetailedPage) {
					if (studentName === loginPage.getUserName()) {
						if (assignmentName === astNameFormatOnAssessmentDetailedPage && studentName === loginPage.getUserName()) {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Assignment name " + assignmentName + " and student name " + studentName + " is compared with " + astNameFormatOnAssessmentDetailedPage + " and ", loginPage.getUserName(), "success") +
								report.reportFooter());
							done();
						}
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Assignment name " + assignmentName + " and student name " + studentName + " is compared with " + astNameFormatOnAssessmentDetailedPage + " and ", loginPage.getUserName(), "failure") +
							report.reportFooter());
					}
				}
			});
		});
	});

	it(". Validate the count of attempts on assessment result page should be one after student has taken the 1 attempt of assessment", function(done) {
		instructorGradebookNavigationPage.getDropDownList(browser).then(function(countOptionsInDropdown) {
			var dropdownListCount = _.size(countOptionsInDropdown);
			if (dropdownListCount === countOfAttempt) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("attempts count is " + countOfAttempt + " is compared with ", dropdownListCount, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("attempts count is " + countOfAttempt + " is compared with ", dropdownListCount, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate Text of the attempt in the drop-down list should be Attempt N - [Score]", function(done) {
		instructorGradebookNavigationPage.getTextOnDefaultSelected(browser, countOfAttempt).then(function(defaultSeletedText) {
			scorePercentage = mathutil.getScorePercentage(questionsCorrect1stattemptFromCAS, assessmentData.systemgenerated.scorestrategyhigh.questions);
			defaultSelectedAttemptOnDropdown = stringutil.getTextOnAssignmentDetailedViewOnGragebook(countOfAttempt, scorePercentage);
			if (defaultSeletedText.indexOf(defaultSelectedAttemptOnDropdown) > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Text on default selected dropdown is " + defaultSeletedText + " is compared with robo created text", defaultSelectedAttemptOnDropdown, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Text on default selected dropdown is " + defaultSeletedText + " is compared with robo created text", defaultSelectedAttemptOnDropdown, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate Score, Correct/Total, Attempts, Class Average (%) and Class Low|High Score (%) label are present", function(done) {
		instructorGradebookNavigationPage.getLabels(browser, "div[translate='assignment.details.score']", gradebookData.instructorgradebook.score).then(function() {
			instructorGradebookNavigationPage.getLabels(browser, "div[translate='assignment.details.correct-total']", gradebookData.instructorgradebook.correctquestion).then(function() {
				instructorGradebookNavigationPage.getLabels(browser, "div[translate='assignment.details.attempts']", gradebookData.instructorgradebook.Attempts).then(function() {
					instructorGradebookNavigationPage.getLabels(browser, "div[translate='assignment.details.class-avg']", gradebookData.instructorgradebook.classaverage).then(function() {
						instructorGradebookNavigationPage.getLabels(browser, "div[translate='assignment.details.class-low']", gradebookData.instructorgradebook.classlowcore).then(function() {
							instructorGradebookNavigationPage.getLabels(browser, "div[translate='assignment.details.class-high']", gradebookData.instructorgradebook.classhighcore).then(function() {
								console.log(report.reportHeader() +
									report.stepStatusWithData("All labels are present on ",
										gradebookData.instructorgradebook.score + "," +
										gradebookData.instructorgradebook.correctquestion + "," +
										gradebookData.instructorgradebook.Attempts + "," +
										gradebookData.instructorgradebook.classaverage + "," +
										gradebookData.instructorgradebook.classlowcore + "," +
										gradebookData.instructorgradebook.classhighcore,
										"success") +
									report.reportFooter());
								done();
							});
						});
					});
				});
			});
		});
	});

	it(". Validate Score, Correct/Total, Attempts, Class Average (%) and Class Low|High Score (%) analytics are reflected", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		var classAverage = scorePercentageForFirstAttempt;
		instructorGradebookNavigationPage.getAnalyticsValues(browser, "#score", scorePercentage).then(function() {
			instructorGradebookNavigationPage.getAnalyticsValues(browser, "#correct", questionsCorrect1stattemptFromCAS).then(function() {
				instructorGradebookNavigationPage.getAnalyticsValues(browser, "#total", assessmentData.systemgenerated.scorestrategyhigh.questions).then(function() {
					instructorGradebookNavigationPage.getAnalyticsValues(browser, "#attempt-count", countOfAttempt).then(function() {
						instructorGradebookNavigationPage.getAnalyticsValues(browser, "#class-average", classAverage).then(function() {
							instructorGradebookNavigationPage.getAnalyticsValues(browser, "#class-low", classAverage).then(function() {
								instructorGradebookNavigationPage.getAnalyticsValues(browser, "#class-high", classAverage).then(function() {
									console.log(report.reportHeader() +
										report.stepStatusWithData("All analytics are present on assignment detailed page",
											"Score :" + scorePercentage +
											", Correct " + questionsCorrect1stattemptFromCAS +
											", Total" + assessmentData.systemgenerated.scorestrategyhigh.questions +
											", Attempts" + countOfAttempt +
											", Class Average " + classAverage, "success") +
										report.reportFooter());
									done();
								});
							});
						});
					});
				});
			});
		});
	});

	it(". Validate incorrect answers displaying on tab is equal to the count of list of incorrect responses displaying on result page", function(done) {
		practiceQuizCreation.fetchTheCountOfIncorrectAnswerFromTab(browser).text().then(function(incorrectCountFromTab) {
			if (parseInt(incorrectCountFromTab) > 0 && parseInt(incorrectCountFromTab) <= 10) {
				practiceQuizCreation.fetchTheCountOfIncorrectAnswerFromTab(browser).then(function(incorrectCountFromTab) {
					practiceQuizCreation.fetchTheCountOfIncorrectAnswerFromList(browser).then(function(list) {
						incorrectResponseListCount = _.size(list);
						if (parseInt(incorrectCountFromTab) === incorrectResponseListCount) {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Incorrect answers  given by the student from tab in quiz result view which is " + incorrectCountFromTab + " is compared against the count of incorrect responses in the list form ", incorrectResponseListCount + " are matching successfully", "success") +
								report.reportFooter());
							done();
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Incorrect answers  given by the student from tab in quiz result view which is " + incorrectCountFromTab + " is compared against the count of incorrect responses in the list form ", incorrectResponseListCount + " are not matching successfully", "failure") +
								report.reportFooter());
						}
					});
				});
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Incorrect answers  given by the student", "0", "failure") +
					report.reportFooter());
				done();
			}
		});
	});

	it(". Validate if CGID is present in results page with each incorrect response", function(done) {
		if (incorrectResponseListCount) {
			practiceQuizCreation.fetchCountOfCGIDWithEachQuizResponse(browser, "incorrect").then(function(CGIDCount) {
				if (incorrectResponseListCount === _.size(CGIDCount)) {
					console.log("incorrectResponseListCount::" + incorrectResponseListCount);
					console.log(report.reportHeader() +
						report.stepStatusWithData("CGID is present with every incorrect response", "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("CGID is not present with every incorrect response", "failure") +
						report.reportFooter());
				}
			});
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Incorrect answers  given by the student", "0", "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Validate if credits are present in results page with each incorrect response", function(done) {
		if (incorrectResponseListCount) {
			practiceQuizCreation.fetchTheCreditsCountOfIncorrectAnswerFromList(browser).then(function(CreditsCount) {
				if (incorrectResponseListCount === _.size(CreditsCount)) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Credit is present with every incorrect response", "success") +
						report.reportFooter());
					done();
				} else {
					if(incorrectResponseListCount*2 === _.size(CreditsCount)){
						console.log(report.reportHeader() +
							report.stepStatusWithData("LTR-5189 :: Two credits are present with every incorrect response", "failure") +
							report.reportFooter());
				}else{
					console.log(report.reportHeader() +
						report.stepStatusWithData("Credits are not present with every incorrect response", "failure") +
						report.reportFooter());
					}
				}
			});
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Incorrect answers  given by the student", "0", "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Click on Correct tab on quiz result page and validate the navigation", function(done) {
		practiceQuizCreation.fetchCorrectCount(browser).text().then(function(correctQuestionCount) {
			if (parseInt(correctQuestionCount) > 0 && parseInt(correctQuestionCount) <= 10) {
				practiceQuizCreation.navigateToCorrectAnswersViewOfQuizResult(browser).then(function() {
					browser
						.waitForElementByCss(".tab-pane.active>a", asserters.isDisplayed, 5000).then(function() {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Correct tab is now active and correct answers list is displaying successfully ", "", "success") +
								report.reportFooter());
							done();
						});
				});
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Correct tab is either active or number of correct question is", "0", "success") +
					report.reportFooter());
				done();
			}
		});
	});

	it(". Validate correct answers displaying on tab is equal to the count of list of correct responses displaying on result page", function(done) {
		practiceQuizCreation.fetchCorrectCount(browser).text().then(function(correctQuestionCount) {
			if (parseInt(correctQuestionCount) > 0) {
				practiceQuizCreation.fetchTheCountOfCorrectAnswerFromTab(browser).then(function(correctCountFromTab) {
					practiceQuizCreation.fetchTheCountOfCorrectAnswerFromList(browser).then(function(list) {
						correctResponseListCount = _.size(list);
						if (parseInt(correctCountFromTab) === correctResponseListCount) {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Correct answers  given by the student from tab in quiz result view which is " + correctCountFromTab + " is compared against the count of incorrect responses in the list form " + correctResponseListCount + " are matching successfully", "success") +
								report.reportFooter());
							done();
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Correct answers  given by the student from tab in quiz result view which is " + correctCountFromTab + " is compared against the count of incorrect responses in the list form " + correctResponseListCount + " are not matching successfully", "failure") +
								report.reportFooter());
							done();
						}
					});
				});
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Correct answers  given by the student", "0", "success") +
					report.reportFooter());
				done();
			}
		});
	});

	it(". Validate if CGID is present in Result page with each correct response", function(done) {
		if (correctResponseListCount) {
			practiceQuizCreation.fetchCountOfCGIDWithEachQuizResponse(browser, "correct").then(function(CGIDCount) {
				console.log("_.size(CGIDCount" + _.size(CGIDCount));
				console.log("correctResponseListCount" + correctResponseListCount);
				if (correctResponseListCount === _.size(CGIDCount)) {
					console.log("correctResponseListCount::" + correctResponseListCount);
					console.log(report.reportHeader() +
						report.stepStatusWithData("CGID is present with every correct response", "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("CGID is not present with every correct response", "failure") +
						report.reportFooter());
				}
			});
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Correct answers  given by the student", "0", "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Validate  Credits are present in results page with each correct response", function(done) {
		if (correctResponseListCount) {
			practiceQuizCreation.fetchTheCreditsCountOfIncorrectAnswerFromList(browser).then(function(CreditsCount) {
				if (correctResponseListCount === _.size(CreditsCount)) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Credits are present with every incorrect response", "success") +
						report.reportFooter());
					done();
				}
				else {
					if(correctResponseListCount*2 === _.size(CreditsCount)){
						console.log(report.reportHeader() +
							report.stepStatusWithData("LTR-5189 :: Two credits are present with every incorrect response", "failure") +
							report.reportFooter());
				}else{
					console.log(report.reportHeader() +
						report.stepStatusWithData("Credits are not present with every incorrect response", "failure") +
						report.reportFooter());
					}
				}
			});
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Incorrect answers  given by the student", "0", "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Click on back button for navigating on student detailed page", function(done) {
		if (errorStatusOnCLickingAssignmentName) {
			this.skip();
		} else {
			instructorGradebookNavigationPage.clickOnGradebookBackButton(browser).then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Gradebook Page is loaded");
			});
		}
	});

	it(". Edit due date with 1st date of next month of CFM assessment for current student on student detailed page", function(done) {
		pageLoadingTime = 0;
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		var astName1 = assessmentsPage.getAssignmentName();
		// var astName1 = "ROBO";
		studentDetailedInfopo.dueDateValue(browser, astName1).then(function(dueDateBeforeEdit) {
			console.log(dueDateBeforeEdit);
			studentDetailedInfopo.editDueDate(browser, astName1).then(function() {
				studentDetailedInfopo.dueDateValue(browser, astName1).then(function(dueDateAfterEdit) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Assignment due date " + dueDateBeforeEdit + " updated by", dueDateAfterEdit, "success") +
						report.reportFooter());
					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Due date edited");
				});
			});
		});
	});

	it(". Validate tooltip(yellow triangle) should be present after instructor manually changed the due date", function(done) {
		studentDetailedInfopo.verifyToolTipPresent(browser).then(function(tooltip) {
			if (tooltip.indexOf("rgb(255, 183, 29)") > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Tool tip is present after instructor changed his due date manually and color of the tool tip is " + tooltip, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Tool tip is present after instructor changed his due date manually and color of the tool tip is " + tooltip, "failure") +
					report.reportFooter());
			}

		});
	});

	it(". Validate a tooltip is present on the indicator which reads 'Due date has been manually changed'", function(done) {
		studentDetailedInfopo.verifyTilteOnToolTip(browser).getAttribute('title').then(function(titleOnTooltip) {
			if (titleOnTooltip.indexOf(gradebookData.instructorgradebook.tooltiptitle) > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Tool tip is present and the tilte is " + titleOnTooltip, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Tool tip is present and the tilte is " + titleOnTooltip, "failure") +
					report.reportFooter());
			}

		});
	});

	it(". Validate due date edited successfully without any error message on student detailed page", function(done) {
		studentDetailedInfopo.dueDateValue(browser, assessmentsPage.getAssignmentName()).then(function(dueDate) {
			if (dueDate.indexOf(dataUtil.getDueDateOfNextMonth()) > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment edited due date " + dueDate + " is compared with", dataUtil.getDueDateOfNextMonth(), "success") +
					report.reportFooter());
				studentDetailedInfopo.errorFlashHideStatus(browser).then(function(errorFlashHideStatus) {
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
					report.stepStatusWithData("Assignment edited due date " + dueDate + " is compared with", dataUtil.getDueDateOfNextMonth(), "failure") +
					report.reportFooter());
			}

		});
	});

	it(". Wait until the assignment page is loaded successfully", function(done) {
		browser.sleep(3000).refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
		});
	});

	it(". Re-Validating tool tip should be present after instructor manually changed the due date", function(done) {
		studentDetailedInfopo.verifyToolTipPresent(browser).then(function(tooltip) {
			if (tooltip.indexOf("rgb(255, 183, 29)") > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Tool tip is present after instructor changed his due date manually and color of the tool tip is " + tooltip, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Tool tip is present after instructor changed his due date manually and color of the tool tip is " + tooltip, "failure") +
					report.reportFooter());
			}

		});
	});

	it(". Re-validating the edited due date persist after refreshing the page without any error on student detailed page", function(done) {
		studentDetailedInfopo.dueDateValue(browser, assessmentsPage.getAssignmentName()).then(function(dueDate) {
			if (dueDate.indexOf(dataUtil.getDueDateOfNextMonth()) > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment edited due date " + dueDate + " is compared with", dataUtil.getDueDateOfNextMonth(), "success") +
					report.reportFooter());
				studentDetailedInfopo.errorFlashHideStatus(browser).then(function(errorFlashHideStatus) {
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
					report.stepStatusWithData("Assignment edited due date " + dueDate + " is compared with", dataUtil.getDueDateOfNextMonth(), "failure") +
					report.reportFooter());
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
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
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

	it(". Wait until the assignment page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
	});

	it(". Navigate to the next month on calendar", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.navigateToNextMonth(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
		});
	});

	it(". Click on 1st date of next month", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickOnNextMonthFirstDate(browser).then(function() {
			done();
		});
	});

	it(". Launch the assignment for taking the second attempt", function(done) {
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
		//Call this function if you want a specific block to timeout after a specific time interval0);

	});
	it(". Fetch correct questions from assessment results page", function(done) {
		casPage.getQuestionsCorrect(browser).then(function(questionsCorrect) {
			console.log("Total Questions Correct " + questionsCorrect);
			questionsCorrect2ndattemptFromCAS = questionsCorrect;
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
			countOfAttempt++;
			scorePercentageForSecondAttempt = mathutil.getScorePercentage(questionsCorrect2ndattemptFromCAS, assessmentData.systemgenerated.scorestrategyhigh.questions);
			console.log("scorePercentageForFirstAttempt" + scorePercentageForFirstAttempt);
			var defaultSelectedAttemptOnDropdownForSecondAttempt = stringutil.getTextOnAssignmentDetailedViewOnGragebook(countOfAttempt, scorePercentageForSecondAttempt);
			getTextOFSelectBoxOnAttempts.push(defaultSelectedAttemptOnDropdownForSecondAttempt);
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is attempted");
		});
	});


	it(". Navigate to the next month on assignment calendar page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.navigateToNextMonth(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Next month page is loaded");
		});
	});

	it(". Click on 1st date of next month on student assignment page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickOnNextMonthFirstDate(browser).then(function() {
			done();
		});
	});

	it(". Launch the assignment for the third attempt", function(done) {
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

	it(". Fetch correct questions from quiz results page for third attempt", function(done) {
		casPage.getQuestionsCorrect(browser).then(function(questionsCorrect) {
			questionsCorrect3rdattemptFromCAS = questionsCorrect;
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
			countOfAttempt++;
			scorePercentageForThirdAttempt = mathutil.getScorePercentage(questionsCorrect3rdattemptFromCAS, assessmentData.systemgenerated.scorestrategyhigh.questions);
			console.log("scorePercentageForThirdAttempt" + scorePercentageForThirdAttempt);
			var defaultSelectedAttemptOnDropdownForThirdAttempt = stringutil.getTextOnAssignmentDetailedViewOnGragebook(countOfAttempt, scorePercentageForThirdAttempt);
			getTextOFSelectBoxOnAttempts.push(defaultSelectedAttemptOnDropdownForThirdAttempt);
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is attempted");
		});
	});

	it(". Navigate to the next month on student's assignment page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.navigateToNextMonth(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Next month page is loaded");
		});
	});

	it(". Click on 1st date of next month for launching assessment", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickOnNextMonthFirstDate(browser).then(function() {
			done();
		});
	});

	it(". After completing the last assignment( third attempt of assessment ) fetching the number of remaining attempts and total attempts", function(done) {
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

	it(". Navigate to student's GradeBook page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Wait for page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "GradeBook page is loaded");
			});
	});

	it(". [Student Gradebook]:: Validate the Points earned by the student", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(2);
		studenGradebookPage.getScoredPoints(browser, assessmentsPage.getAssignmentName()).then(function(valueScore) {
			if (!mathutil.isEmpty(valueScore)) {
				if (parseInt(valueScore).toString() === assignmentAvgScore.getRoboPointScore(questionsCorrect1stattemptFromCAS, questionsCorrect2ndattemptFromCAS, questionsCorrect3rdattemptFromCAS)) {
					pointsFromStudentGradebook = valueScore;
					console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + assignmentAvgScore.getRoboPointScore(questionsCorrect1stattemptFromCAS, questionsCorrect2ndattemptFromCAS, questionsCorrect3rdattemptFromCAS) + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "success") + report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + assignmentAvgScore.getRoboPointScore(questionsCorrect1stattemptFromCAS, questionsCorrect2ndattemptFromCAS, questionsCorrect3rdattemptFromCAS) + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "failure") + report.reportFooter());
				}
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : get point score from element is empty ", valueScore, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate the presence of Class average value on student GradeBook", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.studentGradebookAst(browser, assessmentsPage.getAssignmentName())
			.then(function(assignmentRows) {
				assignmentRows[0].elementByCss("td.avg-col div.left-of-pipe span").text().then(function(valueofclassavg) {
					if (!mathutil.isEmpty(valueofclassavg)) {
						if (parseInt(valueofclassavg).toString() === assignmentAvgScore.getRoboPointScore(questionsCorrect1stattemptFromCAS, questionsCorrect2ndattemptFromCAS, questionsCorrect3rdattemptFromCAS)) {
							console.log(report.reportHeader() +
								report.stepStatusWithData("GRADEBOOK : Class average", valueofclassavg, "success") +
								report.reportFooter());
							done();
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("GRADEBOOK : Class average", valueofclassavg, "failure") +
								report.reportFooter());
						}
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : Class average score fetched from element is empty ", valueofclassavg, "failure") +
							report.reportFooter());
					}
				});
			});

	});

	it(". Validate tool tip should be present at student gradebook page because instructor has manually changed the due date", function(done) {
		studentDetailedInfopo.verifyToolTipPresentAtStudentGradebook(browser).then(function(tooltip) {
			if (tooltip.indexOf("rgb(255, 183, 29)") > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Tool tip is present at student gradebook after instructor changed his due date manually and color of the tool tip is " + tooltip, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Tool tip is present at student gradebook after instructor changed his due date manually and color of the tool tip is " + tooltip, "failure") +
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
		//Reports
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

	it(". Navigate on GradeBook page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectGradebook("instructor", browser, done);
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
			done();
		});
	});

	it(". Navigate to details of student's attempts GradeBook view", function(done) {
		instructorGradebookNavigationPage.navigateToDetailsOfStudentsAttempts(browser, assessmentsPage.getAssignmentName()).then(function() {
			done();
		});
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it.skip(" Validate the count of attempt at GradeBook page and Retrieve the value of the dropdown list", function(done) {
		instructorGradebookNavigationPage.getDropDownList(browser).then(function(countOptionsInDropdown) {
			var index = 1;
			var dropdownListCount = _.size(countOptionsInDropdown);
			if (dropdownListCount === countOfAttempt) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("attempts count is " + countOfAttempt + " is compared with ", dropdownListCount, "success") +
					report.reportFooter());

				function getAllTextOnDropDownOption() {
					if (index <= dropdownListCount) {
						instructorGradebookNavigationPage.getTextOnDropDown(browser, index).then(function(textOnDropdown) {
							getTextOFSelectBoxOnUI.push(textOnDropdown);
							index++;
							getAllTextOnDropDownOption();
						});
					} else {
						if (_.isEqual(getTextOFSelectBoxOnUI, getTextOFSelectBoxOnAttempts)) {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Dropdown option lists " + getTextOFSelectBoxOnUI + " is sorted and compared with stored value after every attempt", getTextOFSelectBoxOnAttempts, "success") +
								report.reportFooter());
							done();
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Dropdown option lists " + getTextOFSelectBoxOnUI + " is sorted and compared with stored value after every attempt", getTextOFSelectBoxOnAttempts, "failure") +
								report.reportFooter());
						}
					}
				}
				getAllTextOnDropDownOption();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("attempts count is " + countOfAttempt + " is compared with ", dropdownListCount, "failure") +
					report.reportFooter());
			}
		});
	});

	it.skip(" Validate Text of the attempt in the drop-down list should be Attempt N - [Score]", function(done) {
		instructorGradebookNavigationPage.getTextOnDefaultSelected(browser, 1).then(function(defaultSeletedText) {
			scorePercentage = mathutil.getScorePercentage(questionsCorrect1stattemptFromCAS, assessmentData.systemgenerated.scorestrategyhigh.questions);
			defaultSelectedAttemptOnDropdown = stringutil.getTextOnAssignmentDetailedViewOnGragebook(1, scorePercentage);
			if (defaultSeletedText.indexOf(defaultSelectedAttemptOnDropdown) > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Text on default selected dropdown is " + defaultSeletedText + " is compared with robo created text", defaultSelectedAttemptOnDropdown, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Text on default selected dropdown is " + defaultSeletedText + " is compared with robo created text", defaultSelectedAttemptOnDropdown, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate Score, Correct/Total, Attempts, Class Average (%) and Class Low|High Score (%) label are present for default selected attempt view", function(done) {
		instructorGradebookNavigationPage.getLabels(browser, "div[translate='assignment.details.score']", gradebookData.instructorgradebook.score).then(function() {
			instructorGradebookNavigationPage.getLabels(browser, "div[translate='assignment.details.correct-total']", gradebookData.instructorgradebook.correctquestion).then(function() {
				instructorGradebookNavigationPage.getLabels(browser, "div[translate='assignment.details.attempts']", gradebookData.instructorgradebook.Attempts).then(function() {
					instructorGradebookNavigationPage.getLabels(browser, "div[translate='assignment.details.class-avg']", gradebookData.instructorgradebook.classaverage).then(function() {
						instructorGradebookNavigationPage.getLabels(browser, "div[translate='assignment.details.class-low']", gradebookData.instructorgradebook.classlowcore).then(function() {
							instructorGradebookNavigationPage.getLabels(browser, "div[translate='assignment.details.class-high']", gradebookData.instructorgradebook.classhighcore).then(function() {
								console.log(report.reportHeader() +
									report.stepStatusWithData("All labels are present on ",
										gradebookData.instructorgradebook.score + "," +
										gradebookData.instructorgradebook.correctquestion + "," +
										gradebookData.instructorgradebook.Attempts + "," +
										gradebookData.instructorgradebook.classaverage + "," +
										gradebookData.instructorgradebook.classlowcore + "," +
										gradebookData.instructorgradebook.classhighcore, "success") +
									report.reportFooter());
								done();
							});
						});
					});
				});
			});
		});
	});

	it.skip(" Validate Score, Correct/Total, Attempts, Class Average (%) and Class Low|High Score (%) analytics are reflected", function(done) {
		classAverageScoreAfterAllAttempts = mathutil.getRoboClassAverage(scorePercentageForFirstAttempt, scorePercentageForSecondAttempt, scorePercentageForThirdAttempt);
		console.log("classAverageScoreAfterAllAttempts" + classAverageScoreAfterAllAttempts);
		instructorGradebookNavigationPage.getAnalyticsValues(browser, "#score", scorePercentage).then(function() {
			instructorGradebookNavigationPage.getAnalyticsValues(browser, "#correct", questionsCorrect1stattemptFromCAS).then(function() {
				instructorGradebookNavigationPage.getAnalyticsValues(browser, "#total", assessmentData.systemgenerated.scorestrategyhigh.questions).then(function() {
					instructorGradebookNavigationPage.getAnalyticsValues(browser, "#attempt-count", countOfAttempt).then(function() {
						instructorGradebookNavigationPage.getAnalyticsValues(browser, "#class-average", classAverageScoreAfterAllAttempts).then(function() {
							instructorGradebookNavigationPage.getAnalyticsValues(browser, "#class-low", classAverageScoreAfterAllAttempts).then(function() {
								instructorGradebookNavigationPage.getAnalyticsValues(browser, "#class-high", classAverageScoreAfterAllAttempts).then(function() {
									console.log(report.reportHeader() +
										report.stepStatusWithData("All analytics are present on assignment detailed page",
											"Score :" + scorePercentage +
											", Correct " + questionsCorrect1stattemptFromCAS +
											", Total " + assessmentData.systemgenerated.scorestrategyhigh.questions +
											", Attempts " + countOfAttempt +
											", Class Average " + classAverageScoreAfterAllAttempts, "success") +
										report.reportFooter());
									done();
								});
							});
						});
					});
				});
			});
		});
	});

	it.skip(" Select last attempt from dropdown and validates all analytics for Score, Attempt, Correct question count and Average score ", function(done) {
		instructorGradebookNavigationPage.clickOnSelectBox(browser, countOfAttempt).then(function() {
			instructorGradebookNavigationPage.getAnalyticsValues(browser, "#score", scorePercentageForThirdAttempt).then(function() {
				instructorGradebookNavigationPage.getAnalyticsValues(browser, "#correct", questionsCorrect3rdattemptFromCAS).then(function() {
					instructorGradebookNavigationPage.getAnalyticsValues(browser, "#total", assessmentData.systemgenerated.scorestrategyhigh.questions).then(function() {
						instructorGradebookNavigationPage.getAnalyticsValues(browser, "#attempt-count", countOfAttempt).then(function() {
							instructorGradebookNavigationPage.getAnalyticsValues(browser, "#class-average", classAverageScoreAfterAllAttempts).then(function() {
								instructorGradebookNavigationPage.getAnalyticsValues(browser, "#class-low", classAverageScoreAfterAllAttempts).then(function() {
									instructorGradebookNavigationPage.getAnalyticsValues(browser, "#class-high", classAverageScoreAfterAllAttempts).then(function() {
										console.log(report.reportHeader() +
											report.stepStatusWithData("All analytics are present on assignment detailed page",
												"Score :" + scorePercentage +
												", Correct " + questionsCorrect3rdattemptFromCAS +
												", Total " + assessmentData.systemgenerated.scorestrategyhigh.questions +
												", Attempts " + countOfAttempt +
												", Class Average " + classAverageScoreAfterAllAttempts,
												"success") +
											report.reportFooter());
										done();
									});
								});
							});
						});
					});
				});
			});
		});
	});

	it(". Wait for page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "GradeBook page is loaded");
			});
	});

	it(". Click on back button for navigating student detailed page", function(done) {
		instructorGradebookNavigationPage.clickOnGradebookBackButton(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
		});
	});


	it(". Again click on back button for navigating instructor's main gradebook page", function(done) {
		instructorGradebookNavigationPage.clickOnGradebookBackButton(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
		});
	});
	//LTR-5346 won't fix
	it(". LTR-5346 :: Verify the presence of total point is zero until the due date has not passed on the Instructor main GradeBook page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		mainGradebookView.getTotalPoints(browser).text()
			.then(function(totalPoints) {
				console.log("totalPoints " + totalPoints);
				console.log("totalPoints" + totalPoints);
				if (!mathutil.isEmpty(totalPoints)) {
					console.log("totalPoints " + totalPoints);
					if (parseInt(totalPoints) == 0) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : TestBot Total points " + 0 + ", is compared against the Max total points  ", totalPoints + " displayed on the Instructor GradeBook table", "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : TestBot Total points  " + 0 + ", is compared against the Max total points  ", totalPoints + " displayed on the Instructor GradeBook table", "failure") +
							report.reportFooter());
					}
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Max Total points is empty ", totalPoints, "failure") +
						report.reportFooter());
				}
			});
	});

	it(". LTR-5346 :: Verify the presence of total point earned by student is zero until the due date has not passed on the Instructor main GradeBook page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		mainGradebookView.pointGainedByStudent(browser, loginPage.getUserName()).text()
			.then(function(pointsGained) {
				console.log("totalPointsGainedByStudent " + totalPointsGainedByStudent);
				totalPointsGainedByStudent = pointsGained;
				if (!mathutil.isEmpty(pointsGained)) {
					console.log("totalPointsGainedByStudent " + totalPointsGainedByStudent);
					if (parseInt(totalPointsGainedByStudent) == 0) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : Total points earned by student " + totalPointsGainedByStudent + ", is compared against the testbot calculated total points earned ", 0, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : Total points earned by student " + totalPointsGainedByStudent + ", is compared against the testbot calculated total points earned ", 0, "failure") +
							report.reportFooter());
					}
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Total points earned by student is empty ", totalPointsGainedByStudent, "failure") +
						report.reportFooter());
				}
			});
	});

	it(". Navigate to student's detailed GradeBook view", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserName()).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
		});

	});

	it(". Wait until page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". [Gradebook] Verify whether the system generated student point score is updated on Instructor GradeBook Student Detailed Page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentDetailedInfopo.getScoredPoints(browser, assessmentsPage.getAssignmentName())
			.then(function(scoredPoints) {
				if (!mathutil.isEmpty(scoredPoints)) {
					if (parseInt(scoredPoints) === parseInt(assignmentAvgScore.getRoboPointScore(questionsCorrect1stattemptFromCAS, questionsCorrect2ndattemptFromCAS, questionsCorrect3rdattemptFromCAS))) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + assignmentAvgScore.getRoboPointScore(questionsCorrect1stattemptFromCAS, questionsCorrect2ndattemptFromCAS, questionsCorrect3rdattemptFromCAS) + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + assignmentAvgScore.getRoboPointScore(questionsCorrect1stattemptFromCAS, questionsCorrect2ndattemptFromCAS, questionsCorrect3rdattemptFromCAS) + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "failure") +
							report.reportFooter());
					}
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Point score is empty ", scoredPoints, "failure") +
						report.reportFooter());
				}
			});
	});

	it(". Navigate to assessment result( details of student's attempts) GradeBook view", function(done) {
		instructorGradebookNavigationPage.navigateToDetailsOfStudentsAttempts(browser, assessmentsPage.getAssignmentName()).then(function() {
			done();
		});
	});

	it(". Retrieve all the attempts done by student before clearing the attempt", function(done) {
		instructorGradebookStudentDetailedPage.getAttempts(browser).text().then(function(attemptsValue) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Completed Attempts count before deleting" + attemptsValue, "success") +
				report.reportFooter());
			attemptBeforeAttempDelete = attemptsValue;
			done();
		});
	});

	it(". Retrieve the number of ATTEMPT done by student from drop-down list before deleting the attempt ", function(done) {
		instructorGradebookStudentDetailedPage.getAttemptsFromDropDown(browser).then(function(ele) {
			attemptInDropDownbeforeDelete = _.size(ele);
			done();
		});
	});


	it(". Validate the presence of 'CLEAR ATTEMPT' button and click on it", function(done) {
		instructorGradebookStudentDetailedPage.checkForClearAttemptButtonAndClickClearAttempt(browser).then(function() {
			done();
		});
	});


	it(". Validate heading and warning message should be appeared on popup window", function(done) {
		instructorGradebookStudentDetailedPage.checkForPopUpBoxHeadingAndWarning(browser, testData.attemptClear.popUpBoxHeading, testData.attemptClear.popUpBoxWarning).then(function() {
			done();
		});
	});

	it(". Validate that if user click on 'No' button on attempt deleting confirmation box then Attempts remain as it is", function(done) { //in process
		instructorGradebookStudentDetailedPage.clickOnCancelButtonOnClearAttemptModel(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "updated attempts page is loaded");
		});
	});

	it(".  On clicking on 'No' button, confirmation box for delete attempt should hidden from the page", function(done) { //in process
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

	it(". Validate the presence of 'CLEAR ATTEMPT' button and click on it", function(done) {
		instructorGradebookStudentDetailedPage.checkForClearAttemptButtonAndClickClearAttempt(browser).then(function() {
			done();
		});
	});


	it(". Again validate heading and warning message should be appeared on popup window", function(done) {
		instructorGradebookStudentDetailedPage.checkForPopUpBoxHeadingAndWarning(browser, testData.attemptClear.popUpBoxHeading, testData.attemptClear.popUpBoxWarning).then(function() {
			done();
		});
	});

	it(". Delete the attempt ", function(done) {
		instructorGradebookStudentDetailedPage.confirmAttemptDelete(browser).then(function() {
			done();
		});
	});


	it(". Wait until page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "updated attempts page is loaded");
	});

	it(". Getting attempts values after clear the attempt", function(done) {
		instructorGradebookStudentDetailedPage.getAttempts(browser).text().then(function(attemptsValue) {
			console.log(report.reportHeader() +
				report.stepStatusWithData(" Attempts count after deleting one Attempt = " + attemptsValue, "success") +
				report.reportFooter());

			attemptAfterAttempDelete = attemptsValue;
			done();
		});
	});



	it(". Fetching the number of ATTEMPT done by student from drop-down list after deleting the attempt ", function(done) {
		instructorGradebookStudentDetailedPage.getAttemptsFromDropDown(browser).then(function(ele) {
			attemptInDropDownAfterDelete = _.size(ele);
			done();
		});
	});

	it(". Get value of correct question after deleting the attempts ", function(done) {
		//  for(var i=1; i<=attemptInDropDownAfterDelete; i++){
		var i = 0;

		function getDropDownValue() {
			if (i < attemptInDropDownAfterDelete) {
				i++;
				instructorGradebookStudentDetailedPage.getValueFromDropDown(browser, i).then(function(AttemptValue) {
					console.log(AttemptValue);
					var percentage = stringutil.returnValueAfterSplit(AttemptValue, " ", 3);
					console.log(percentage);
					var ScoreInDropDown = parseInt(stringutil.returnValueAfterSplit(percentage, "%", 0));
					ScoreInDropDownFields.push(ScoreInDropDown);
					console.log(ScoreInDropDownFields);
					getDropDownValue();

				});
			} else {
				if (i == attemptInDropDownAfterDelete) {
					console.log(ScoreInDropDownFields);
					done();
				}
			}
		}
		getDropDownValue();
	});

	it(". Validate the number of attempts in drop-down list get reduced by 1 after deleting the assignment's attempt", function(done) {
		var beforeDelete = parseInt(attemptInDropDownbeforeDelete) - 1;
		var afterDelete = parseInt(attemptInDropDownAfterDelete);
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

	it(". Calculate the value for attempt as after deleting one attempt, the attempts count decreased by one at student details assessment result page", function(done) {
		var attemptBeforeAttempDeleteMinusOne = attemptBeforeAttempDelete - 1;
		console.log(attemptAfterAttempDelete);
		console.log(attemptBeforeAttempDeleteMinusOne);
		if (attemptAfterAttempDelete == attemptBeforeAttempDeleteMinusOne) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Instructor Assignment's Result page:: No of assignment attempt i.e. " + attemptAfterAttempDelete + ", is compared against the after clear attempts count ", attemptBeforeAttempDeleteMinusOne, "success") +
				report.reportFooter());
			done();
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Instructor Assignment's Result page:: No of assignment attempt i.e. " + attemptAfterAttempDelete + ", is compared against the after clear attempts count ", attemptBeforeAttempDeleteMinusOne, "failure") +
				report.reportFooter());
		}
	});

	it(". Click on back button for navigating student detailed page", function(done) {
		instructorGradebookNavigationPage.clickOnGradebookBackButton(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Gradebook Page is loaded");
		});
	});

	it(". Again click on back button for navigating instructor's main gradebook page", function(done) {
		instructorGradebookNavigationPage.clickOnGradebookBackButton(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Gradebook Page is loaded");
		});
	});

	it(". Validate score on main gradebook page", function(done) {
		mainGradebookView.getScoreText(browser, 1).then(function(grades) {
			console.log("ScoreInDropDownFields[0]" + ScoreInDropDownFields[0]);
			console.log("ScoreInDropDownFields[1]" + ScoreInDropDownFields[1]);
			var roboPoints = assignmentAvgScore.getAvgPointsFromPercentage(parseInt(ScoreInDropDownFields[0]), parseInt(ScoreInDropDownFields[1]));
			if (parseInt(grades) === roboPoints) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Points after clearing attempt " + grades + " is compared with robo points", roboPoints, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Points after clearing attempt " + grades + " is compared with robo points", roboPoints, "failure") +
					report.reportFooter());
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

	it(". Navigate to student's Assignments Page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Wait until page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
	});

	it(". Navigate to student's GradeBook page", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectGradebook(userType, browser, done);
	});


	it(". LTR-5162:: [Student Gradebook]:: Validate the Points earned by the student get changed or not due to deleting the attempt  ", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		console.log("ScoreInDropDownFields[0]" + ScoreInDropDownFields[0]);
		console.log("ScoreInDropDownFields[1]" + ScoreInDropDownFields[1]);
		var roboPoints = assignmentAvgScore.getAvgPointsFromPercentage(parseInt(ScoreInDropDownFields[0]), parseInt(ScoreInDropDownFields[1]));
		console.log("At Instructor side points = " + roboPoints);
		studenGradebookPage.getScoredPoints(browser, assessmentsPage.getAssignmentName()).then(function(valueScore) {
			if (!mathutil.isEmpty(valueScore)) {
				console.log("At Student side points = " + valueScore);
				if (parseInt(valueScore) == parseInt(roboPoints)) {
					pointsFromStudentGradebook = valueScore;
					console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + roboPoints + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "success") + report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + roboPoints + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "failure") + report.reportFooter());
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


	it(". Login as Instructor", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userType = "instructor";
		data = loginPage.setLoginData(userType);
		//Reports
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

	it(". Navigate to Assignments page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userType = "instructor";
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Open the created CFM assessment type assignment", function(done) {
		pageLoadingTime = 0;
		this.timeout(courseHelper.getElevatedTimeout());
		assessmentsPage.clickOnAssignmentOnCurrentDate(browser, assessmentsPage.getAssignmentName()).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is opened on edit panel");
		});
	});

	it(". Validate the Reveal date is non editable once the student has taken the assessment", function(done) {
		assessmentsPage.verifyRevealDateDisabled(browser).getAttribute('aria-disabled').then(function(revealDateStatus) {
			assessmentsPage.verifyAssignmentNameTextboxDisabled(browser).getAttribute('aria-disabled').then(function(textboxStatus) {
				assessmentsPage.verifyScoreDisabled(browser).getAttribute('aria-disabled').then(function(scoreStatus) {
					assessmentsPage.closeAssignmentPanel(browser).then(function() {
						if (revealDateStatus === "true" && scoreStatus === "true" && textboxStatus === "true") {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Reveal date is non editable once the student has taken the assessment", revealDateStatus, "success") +
								report.reportFooter());
							done();
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Reveal date is non editable once the student has taken the assessment", revealDateStatus, "failure") +
								report.reportFooter());

						}
					});
				});
			});
		});
	});

	it(". Wait until page load", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
		});
	});

	it(". Delete the created assignment", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		}
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

});
