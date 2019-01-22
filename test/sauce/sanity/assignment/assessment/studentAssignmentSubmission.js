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
var instructorAssessmentDetailedInfopo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/assessmentDetailedInfopo");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var assessmentData = require("../../../../../test_data/assignments/assessments.json");
var gradebookData = require("../../../../../test_data/gradebook/gradebook.json");
var session = require("../../../support/setup/browser-session");
var tocpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/tocpo.js");
var testData = require("../../../../../test_data/data.json");
var courseHelper = require("../../../support/helpers/courseHelper");
var report = require("../../../support/reporting/reportgenerator");
var mathutil = require("../../../util/mathUtil");
var asserters = wd.asserters;
var _ = require('underscore');
var practiceQuizCreation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var path = require('path');
var scriptName = path.basename(__filename);
var totalpoints = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/mainGradebookView").totalValueOfScoresForAllStudents;
describe(scriptName + 'CCS/CAS/GRADEBOOK :: INSTRUCTOR ASSIGNMENT CREATION, STUDENT SUBMISSION, STUDENT GradeBook VALIDATION, INSTRUCTOR GradeBook VALIDATION', function() {
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
	var totalPointsGainedByStudent;
	var totalsudentcount;
	var totalValueOfScoresForAllStudents = 0;
	var averageScoreForAllStudents;
	var pageLoadingTime;
	var totalMaxPoints;
	var totalTime;
	var incorrectResponseListCount = 0;
	var serialNumber = 0;
	var assignmentNameClickableStatusAfterAttempt = false;


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
		console.log(report.formatTestName("CCS/CAS/GRADEBOOK :: INSTRUCTOR ASSIGNMENT CREATION, STUDENT SUBMISSION, STUDENT GradeBook VALIDATION, INSTRUCTOR GradeBook VALIDATION"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***studentAssignmentSubmission.js***"));
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

	it(". Login to 4LTR Platform as Instructor user.", function(done) {
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

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login(cengagebrain) page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate to Assignments Page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
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

	it(". Verify the current date's background color should be rgb(50, 130, 133)", function(done) {
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
						assessmentsPage.selectAttempts(browser, assessmentData.systemgenerated.scorestrategyhigh.editedAttempts).then(function() {
							assessmentsPage.selectScoreStrategy(browser, assessmentData.systemgenerated.scorestrategyhigh.scoreStrategy).then(function() {
								assessmentsPage.selectQuestionStrategy(browser, assessmentData.systemgenerated.QuestionStrategy.option[0]).then(function() {
									assessmentsPage.enterQuestionsPerStudent(browser, assessmentData.systemgenerated.scorestrategyhigh.questions).then(function() {
										console.log(report.reportHeader() +
											report.stepStatusWithData("Assessment form has been filled by chapter :" +
												assessmentData.systemgenerated.scorestrategyhigh.chapter + ", Score :" +
												assessmentData.systemgenerated.scorestrategyhigh.score + ", Number Of Attempts :" +
												assessmentData.systemgenerated.scorestrategyhigh.editedAttempts + ", Question Strategy :" +
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

	it(". Save the assessment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});

	// https://jira.cengage.com/browse/LTR-5311
	it(". LTR-5311 :: Validate Page should not be in loading state for a long after saving the Assessment type assignment", function(done) {
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

	it(". Verify if the CFM assessment type assignment is saved successfully", function(done) {
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

	it(". Launch the CFM assessment type assignment for the first time", function(done) {
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

	it(". LTR-5399 :: Validate that CAS error should not be aapear on launching the Assessment at student end", function(done) {
		takeQuizpo.errorOnQuizLaunch(browser).then(function(presenceStatus) {
			if (!presenceStatus) {
				takeQuizpo.getQuestionCounts(browser).then(function(questionCounts) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Assessment is launched without any error and questions count is", _.size(questionCounts), "success") +
						report.reportFooter());
					done();
				});
			} else {
				takeQuizpo.getErrorText(browser).then(function(errorText) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Error message is appearing on the Assessment launch i.e.", errorText, "failure") +
						report.reportFooter());
				});
			}
		});
	});

	it(". Complete the CFM assessment type assignment", function(done) {
		pageLoadingTime = 0;
		//Call this function if you want a specific block to timeout after a specific time interval
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("quiz"));
			takeQuizpo.takeQuiz(browser, done);
		}

	});

	it(". Retrieve the correct questions and total questions count from assessment results page", function(done) {
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


	it(". Refresh the assignment result page", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment result page is loaded");
			});
	});


	it(". Validate that refresh button on result page should not restart the assessment's attempt", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		assessmentsPage.assignmentCasStatusOnPage(browser).then(function(casStatus) {
			if (!casStatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment question is reloaded while refreshing the page", casStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment question is reloaded while refreshing the page", casStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate incorrect answers displaying on tab is equal to the count of list of incorrect responses displaying on result page", function(done) {
		this.retries(3);
		practiceQuizCreation.fetchCorrectIncorrectCount(browser, "1").then(function(correctQuestionCount) {
			if (parseInt(correctQuestionCount) <= 5) {
				console.log(correctQuestionCount);
				practiceQuizCreation.fetchTheCountOfIncorrectAnswerFromTab(browser).then(function(incorrectCountFromTab) {
					// practiceQuizCreation.checkAllQuestionCorrectStatus(browser).then(function(allCorrectStatus) {
						// if (!allCorrectStatus) {
					if(parseInt(correctQuestionCount) != 5){
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
						} else {
							incorrectResponseListCount = 0;
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
						}
					// });
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
//LTR-5189
	it(". LTR-5189 :: Validate if credits present in results page with each incorrect response", function(done) {
		if (incorrectResponseListCount) {
			assessmentsPage.fetchCountOfCreditsWithEachQuizResponse(browser).then(function(creditsCount) {
				if (incorrectResponseListCount === _.size(creditsCount)) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Credits are present with every incorrect response", "success") +
						report.reportFooter());
					done();
				} else {
					if(incorrectResponseListCount*2 === _.size(creditsCount)){
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

	it(". Click on exit button", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.clickExitButtonOnResultsPage(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
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

	it(". Wait until page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". [Gradebook] :: Validate the Points earned by the student", function(done) {
		this.retries(3);
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.getScoredPoints(browser, assessmentsPage.getAssignmentName()).then(function(valueScore) {
			if (valueScore.toString() === assessmentsPage.getRoboPointScore(questionsCorrectFromCAS)) {
				pointsFromStudentGradebook = valueScore;
				console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + assessmentsPage.getRoboPointScore(questionsCorrectFromCAS) + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "success") + report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + assessmentsPage.getRoboPointScore(questionsCorrectFromCAS) + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "failure") + report.reportFooter());
			}
		});
	});

	it(". [Gradebook] :: Validate the Score(Questions Correct) is not present on Student Gradebook table as its a obsolete feature", function(done) {
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
		studenGradebookPage.validateAvgScoreOnStudentGradebook(browser, assessmentsPage.getAssignmentName(), pointsFromStudentGradebook, done);
	});


	it(". Validate the presence of assessment submission date on student Gradebook page", function(done) {
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

	it(" Validate number of assignments", function() {
		menuPage.checkAssignmentText(browser).then(function(flag) {
			if (flag) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Singular is used for 1 assignment", "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Plural is used for 1 assignment", "failure") +
					report.reportFooter());
			}
		});
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


	it(". Calcuate the total score earned by students for a particular CFM assessment type assignment ", function(done) {
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

	it(". Calculate class average for a particular CFM assessment type assignment ", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		averageScoreForAllStudents = (totalValueOfScoresForAllStudents / parseInt(totalsudentcount));
		console.log(report.reportHeader() +
			report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment calculated and is coming out to be ::  " + averageScoreForAllStudents, "success") +
			report.reportFooter());
		done();
	});
	//LTR-5346 won't fix
	it(". LTR-5346 :: Verify the presence of total point is zero untill the due date has passed on the Instructor's GradeBook on the GradeBook table", function(done) {
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

	it(". LTR-5346 :: Verify the presence of point gained by the student is reflected with value '0' in total points field until assessment due date has not passed", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		data = loginPage.setLoginData("student");
		console.log("loginPage.getUserName()" + loginPage.getUserName());
		instructorMainGradebookView.getPointsGainedByStudent(browser, loginPage.getUserName())
			.then(function(pointsGained) {
				console.log("pointsGained :: "+pointsGained);
				totalPointsGainedByStudent = pointsGained;
				if (parseInt(totalPointsGainedByStudent) === 0) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Total points earned by student " + totalPointsGainedByStudent + ", is compared against the testbot calculated total points earned ", 0, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Total points earned by student " + totalPointsGainedByStudent + ", is compared against the testbot calculated total points earned ", 0, "failure") +
						report.reportFooter());
				}
			});
	});

	it(". Verify the presence of point gained by the student for the CFM assessment type assignments ", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorMainGradebookView.getScoreText(browser, 1)
			.then(function(pointsGainedByStudent) {
				var totalPointsGained = pointsGainedByStudent;
				console.log("totalPointsGained" + totalPointsGained);
				console.log("assessmentsPage.getRoboPointScore(questionsCorrectFromCAS)" + assessmentsPage.getRoboPointScore(questionsCorrectFromCAS));
				if (parseInt(totalPointsGained) == assessmentsPage.getRoboPointScore(questionsCorrectFromCAS)) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Total points earned by student " + totalPointsGained + ", is compared against the testbot calculated total points earned ", assessmentsPage.getRoboPointScore(questionsCorrectFromCAS), "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Total points earned by student " + totalPointsGained + ", is compared against the testbot calculated total points earned ", assessmentsPage.getRoboPointScore(questionsCorrectFromCAS), "failure") +
						report.reportFooter());
				}
			});
	});

	it(". Navigate to student's detailed page by clicking on student name on gradebook page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		data = loginPage.setLoginData("student");
		instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserName()).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});

	});

	it(". Wait until page is loaded successfully", function(done) {
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

	it(". Validate that correct class average value should be reflected on student detailed page on instructor's gradebook ", function(done) {
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


	it(". [Gradebook] Verify whether the system generated student point score is updated on Instructor Gradebook on the Student Detailed Page", function(done) {
		this.retries(3);
		if (assignmentCreationStatus === "failure" && assignmentNameClickableStatusAfterAttempt == false) {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.getScoredPoints(browser, assessmentsPage.getAssignmentName())
			.then(function(scoredPoints) {
				if (scoredPoints.toString() === assessmentsPage.getRoboPointScore(questionsCorrectFromCAS)) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + assessmentsPage.getRoboPointScore(questionsCorrectFromCAS) + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + assessmentsPage.getRoboPointScore(questionsCorrectFromCAS) + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "failure") +
						report.reportFooter());
				}
			});
	});

	it(". Click on back button", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookNavigationPage.clickOnGradebookBackButton(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
		});
	});

	it(". Refresh the page and wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
	});

	it(". Validate override score field should be disabled untill the due date has not pasesed ", function(done) {
		instructorMainGradebookView.overrideTheScoreDisableStatus(browser).then(function(overrideStatus) {
			console.log(overrideStatus);
			if (overrideStatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Override box is disabled before due date not passed ", overrideStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Override box is disabled before due date not passed ", overrideStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Reload the page and Wait for page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});


	it(". Navigate to a specific student detailed view and edit attempt from the instructor gradebook student detailed page", function(done) {
		if (assignmentCreationStatus === "failure" && assignmentNameClickableStatusAfterAttempt == false) {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) === "iOS") {
			browser.sleep(2000);
		}
		data = loginPage.setLoginData("student");
		instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserName()).then(function() {
			instructorGradebookStudentDetailedPage.editedAttemptsFromStudentDetaledView(browser, assessmentsPage.getAssignmentName()).then(function() {
				done();
			});
		});
	});

	it(". Validate attempts edited successfully without any error message", function(done) {
		instructorGradebookStudentDetailedPage.editedAttemptOnStudentDetailPage(browser, assessmentsPage.getAssignmentName()).then(function(editedAttempt) {
			console.log("editedAttempt" + editedAttempt + "editedAttempt");
			if (editedAttempt.indexOf("unlimited") > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment edited attempts with " + editedAttempt + " compared with", "success") +
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
					report.stepStatusWithData("Assignment edited attempts with " + editedAttempt + " compared with", "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Refresh the page and wait until the assignment page is loaded successfully", function(done) {
		browser.refresh().
		sleep(5000).refresh().sleep(5000).refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
		});
	});

	it(". Re-validate edited attempts persist after refreshing the page without any error", function(done) {
		instructorGradebookStudentDetailedPage.editedAttemptOnStudentDetailPage(browser, assessmentsPage.getAssignmentName()).then(function(editedAttempt) {
			if (editedAttempt.indexOf("unlimited") > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment edited attempts with " + editedAttempt + " compared with", "unlimited", "success") +
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
					report.stepStatusWithData("Assignment edited attempts with " + editedAttempt + " compared with", "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate the presence of Student name on the student detailed page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		data = loginPage.setLoginData("student");
		console.log("loginPage.getUserName()" + loginPage.getUserName() + "loginPage.getUserName()");
		instructorGradebookStudentDetailedPage.getStudentName(browser, loginPage.getUserName()).then(function() {
			done();
		});
	});

	it(". Validate the max point score is displayed correctly on the student detailed page for the assignment", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.getTotalPoints(browser, assessmentsPage.getAssignmentName())
			.then(function(maxPoints) {
				if (maxPoints.toString() === assessmentData.systemgenerated.scorestrategyhigh.score.toString()) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Total point score from student detailed page " + maxPoints + " , is compared against test data ", assessmentData.systemgenerated.scorestrategyhigh.score, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Total point score from student detailed page " + maxPoints + " , is compared against test data ", assessmentData.systemgenerated.scorestrategyhigh.score, "failure") +
						report.reportFooter());
				}
			});
	});

	it(". Instructor Gradebook student detailed view :: Validate points possible to date is displayed correctly on the points graph", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.getTotalPointsPossibleOnGraph(browser).then(function(pointsPossible) {
			if (pointsPossible === "0") {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Points possible to date retrieved from Points Graph " + pointsPossible + "  is compared against total points specified for the assignment", "0", "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Points possible to date retrieved from Points Graph " + pointsPossible + "  is compared against total points specified for the assignment", "0", "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Instructor Gradebook student detailed view :: Validate the presence of the total points scored by the student on the points graph", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.getTotalPointsEarnedOnGraph(browser)
			.then(function(totalPoints) {
				if (totalPoints === "0") {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated total points scored on the points Graph " + "0" + ", is compared against the total points displayed on Graph ", totalPoints, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated total points scored on the points Graph " + "0" + ",  is compared against the total points displayed on Graph ", totalPoints, "failure") +
						report.reportFooter());
				}
			});
	});


	it(". Instructor Gradebook student detailed view :: Validate the presence of due date on student detailed page ", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.getDueDate(browser, assessmentsPage.getAssignmentName())
			.then(function(dateOnStudentDetailedPage) {
				if (dateOnStudentDetailedPage.indexOf("Today") > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Due date of assignment ", "Today", "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Due date of assignment ", "Today", "failure") +
						report.reportFooter());
				}
			});
	});


	it(". Instructor Gradebook student detailed view :: Validate the presence of submission date on student detailed page ", function(done) {

		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(2);
		browser.refresh().then(function() {
			instructorGradebookStudentDetailedPage.checkSubmittedDate(browser, assessmentsPage.getAssignmentName(), dataUtil.getCurrentDateOnhyphenatedMMDDYYformat())
				.then(function() {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Submission date of assignment " + dataUtil.getCurrentDateOnhyphenatedMMDDYYformat() + "  is compared against current date of assignment submission", dataUtil.getCurrentDateOnhyphenatedMMDDYYformat(), "success") +
						report.reportFooter());
					done();
				});
		});

	});


	it(". Click on back button to navigate to main gradebook view and click on the attempted assignment clickable link", function(done) {

		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookNavigationPage.navigateToGradebookViewFromStudentDetailedPage(browser)
			.then(function() {
				instructorGradebookNavigationPage.clickOnCreatedAssessment(browser, assessmentsPage.getAssignmentName()).then(function() {
					done();
				});
			});
	});

	it(". LTR-4665 :: Validate Instructor Gradebook assignment detailed page should be loaded without any error", function(done) {

		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorMainGradebookView.getErrorMessagePresenceStatus(browser).then(function(errorMessagePresencestatus) {
			if (!errorMessagePresencestatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK :: Assessment detailed page is appearing without any error", errorMessagePresencestatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK :: Assessment detailed page is appearing without any error", errorMessagePresencestatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". LTR-4665 :: Instructor Gradebook assignment detailed view :: Validate assignment name present on assignment detailed page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorAssessmentDetailedInfopo.getAssessmentNameOnStudentAssessmentDetailedView(browser).then(function(assignmentname) {
			if (assignmentname.indexOf(assessmentsPage.getAssignmentName()) > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Assessment name " + assignmentname + "  is compared against assessment name", assessmentsPage.getAssignmentName(), "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Assessment name " + assignmentname + "  is compared against assessment name", assessmentsPage.getAssignmentName(), "failure") +
					report.reportFooter());
			}
		});
	});

	it(". LTR-4665 :: Validate the presence of score submission count on the submission graph on Instructor Gradebook assignment detailed view", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorAssessmentDetailedInfopo.scoreSubmissionCountOnSubmissionGraph(browser).then(function(SubmissionCount) {
			if (!mathutil.isEmpty(SubmissionCount)) {
				if (parseInt(totalsudentcount) === 1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK :  Score submission count on the submission graph is : ", SubmissionCount, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK :  Score submission count on the submission graph is: ", SubmissionCount, "failure") +
						report.reportFooter());
				}
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK :  Score submission count on the submission graph is Empty", SubmissionCount, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". LTR-4665 :: Validate the presence of score expected on the submission graph on Instructor Gradebook assignment detailed view", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorAssessmentDetailedInfopo.ValidatePresenceScoreExpected(browser)
			.then(function(ScoreExpected) {
				if (ScoreExpected.indexOf("1 Submissions Expected") > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK :  Presence of score expected on the submission graph: ", ScoreExpected, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK :  Presence of score expected on the submission graph: ", ScoreExpected, "failure") +
						report.reportFooter());
				}
			});
	});

	it(". LTR-4665 :: Validate the presence of Scores, Distribution, Submissions headers on assignment detailed view", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorAssessmentDetailedInfopo.validateScoreLabel(browser).then(function(scorelabel) {
			if (scorelabel.indexOf("Scores") > -1) {
				instructorAssessmentDetailedInfopo.validateDistibutionLabel(browser).then(function(distributionlabel) {
					if (distributionlabel.indexOf("Distribution") > -1) {
						instructorAssessmentDetailedInfopo.validateSubmissionLabel(browser).then(function(submissionlabel) {
							if (submissionlabel.indexOf("Submissions") > -1) {
								console.log(report.reportHeader() +
									report.stepStatusWithData("GRADEBOOK :  Scores, Distribution, Submissions labels are present: ", scorelabel + ":" + distributionlabel + ":" + submissionlabel, "success") +
									report.reportFooter());
								done();
							} else {
								console.log(report.reportHeader() +
									report.stepStatusWithData("GRADEBOOK :  Scores, Distribution, Submissions labels are present: ", scorelabel + ":" + distributionlabel + ":" + submissionlabel, "failure") +
									report.reportFooter());
							}
						});
					}
				});
			}
		});
	});


	it(".  LTR-4665 :: Validate the presence of Low, Median and High labels under Scores on Instructor Gradebook assignment detailed view", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorAssessmentDetailedInfopo.validateLowLabel(browser)
			.then(function(lowlabel) {
				if (lowlabel.indexOf("LOW") > -1) {
					instructorAssessmentDetailedInfopo.validateMedianLabel(browser).then(function(medianlabel) {
						if (medianlabel.indexOf("MEDIAN") > -1) {
							instructorAssessmentDetailedInfopo.validateHighLabel(browser).then(function(highlabel) {
								if (highlabel.indexOf("HIGH") > -1) {
									console.log(report.reportHeader() +
										report.stepStatusWithData("GRADEBOOK :  LOW, MEDIAN, HIGH labels are present: ", lowlabel + ":" + medianlabel + ":" + highlabel, "success") +
										report.reportFooter());
									done();
								} else {
									console.log(report.reportHeader() +
										report.stepStatusWithData("GRADEBOOK :  LOW, MEDIAN, HIGH labels are present: ", lowlabel + ":" + medianlabel + ":" + highlabel, "failure") +
										report.reportFooter());
								}
							});
						}
					});
				}
			});
	});


	it(". LTR-4665 :: Validate the presence of distribution Value on Instructor Gradebook assignment detailed view", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorAssessmentDetailedInfopo.validateDistibutionGraph(browser).then(function() {
			instructorAssessmentDetailedInfopo.validateDistibutionValue(browser, "1").then(function(lessthan60) {
				if (lessthan60.indexOf("<60") > -1) {
					instructorAssessmentDetailedInfopo.validateDistibutionValue(browser, "2").then(function(lessthan70) {
						if (lessthan70.indexOf("60-69") > -1) {
							instructorAssessmentDetailedInfopo.validateDistibutionValue(browser, "3").then(function(lessthan80) {
								if (lessthan80.indexOf("70-79") > -1) {
									instructorAssessmentDetailedInfopo.validateDistibutionValue(browser, "4").then(function(lessthan90) {
										if (lessthan90.indexOf("80-89") > -1) {
											instructorAssessmentDetailedInfopo.validateDistibutionValue(browser, "5").then(function(lessthan100) {
												if (lessthan100.indexOf("90-99") > -1) {
													instructorAssessmentDetailedInfopo.validateDistibutionValue(browser, "6").then(function(upto100) {
														if (upto100.indexOf("100 and up") > -1) {
															console.log(report.reportHeader() +
																report.stepStatusWithData("GRADEBOOK :  Distribution list Value: ", lessthan60 + "::" + lessthan70 + "::" + lessthan80 + "::" + lessthan90 + "::" + lessthan100 + "::" + upto100, "success") +
																report.reportFooter());
															done();
														} else {
															console.log(report.reportHeader() +
																report.stepStatusWithData("GRADEBOOK :  Distribution list Value: ", lessthan60 + "::" + lessthan70 + "::" + lessthan80 + "::" + lessthan90 + "::" + lessthan100 + "::" + upto100, "failure") +
																report.reportFooter());
														}
													});
												}
											});
										}
									});
								}
							});
						}
					});
				}
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


	it(". Click on the current date cell", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickCurrentDateCell(browser, done);
	});

	it(". Verify assignment attempts get edited", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.getAttemptTextOfAssessment(browser, assessmentsPage.getAssignmentName()).then(function(attemptval) {
			if (attemptval.indexOf("Unlimited") > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("STUDENT ASSIGNMENT EXPANDED VIEW:: assignment attempts get edited by ", attemptval, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("STUDENT ASSIGNMENT EXPANDED VIEW:: assignment attempts get edited by ", attemptval, "failure") +
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
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
	});

	it(".  Validate override score box should be disabled as due date has not passed", function(done) {
		instructorMainGradebookView.overrideTheScoreDisableStatus(browser).then(function(overrideStatus) {
			console.log(overrideStatus);
			if (overrideStatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Override box disabled before due date not passed ", overrideStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Override box disabled before due date not passed ", overrideStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
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


	it(". Delete the created CFM assessment type assignment from list view", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		}
		assessmentsPage.deleteAssignment(browser, done);
	});

	it(". Refresh the assignment page and wait for page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
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
