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
var assignmentAvgScore = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assesmentspoforAvgScore");
var studentAssessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var casPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var studenGradebookPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/student/gradebookValidationpo");
var instructorGradebookNavigationPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/gradebookNavigationpo");
var instructorGradebookStudentDetailedPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/studentDetailedInfopo");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var assessmentData = require("../../../../../test_data/assignments/assessments.json");
var gradebookData = require("../../../../../test_data/gradebook/gradebook.json");
var session = require("../../../support/setup/browser-session");
var testData = require("../../../../../test_data/data.json");
var courseHelper = require("../../../support/helpers/courseHelper");
var report = require("../../../support/reporting/reportgenerator");
var mathutil = require("../../../util/mathUtil");
var _ = require('underscore');
var practiceQuizCreation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var instructorMainGradebookView = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/mainGradebookView");

var studentAssignmentPage = require("../../../support/pagefactory/studentAssignment");

var asserters = wd.asserters;
var path = require('path');
var scriptName = path.basename(__filename);

describe(scriptName + 'TESTS FOR ASSESSMENTS WITH HIGH, AVERAGE AND DROP LOWEST SCORE STRATEGY', function() {
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
	var questionsCorrect1stattemptFromCASHighScore;
	var questionsCorrect2ndattemptFromCASHighScore;
	var questionsCorrect1stattemptFromCASAverageScore;
	var questionsCorrect2ndattemptFromCASAverageScore;
	var questionsCorrect1stattemptFromCASAverageDropLowestScore;
	var questionsCorrect2ndattemptFromCASAverageDropLowestScore;
	var pageLoadingTime;
	var cas_questions_text;
	var cas_activity_series;
	var trueFalseQuestionRadio;
	var cas_choice_radio_for_true_false;
	var multipleChoiceQuestionRadio;
	var cas_choice_radio_for_multiple_type_question;
	var continueButton;
	var disabled_continue_button;
	var dropDownBox;
	var select_option_from_dropdown;
	var exit_button;
	var trueFalseRadioChoice;
	var multipleChoiceRadioOption;
	var optionOfSelectType;
	var totalTime;
	var highestValueOfCorrectedQuestion;
	var assessmentNameForHignScore;
	var assessmentNameForAverageScore;
	var assessmentNameForAverageScoreWithDropLowest;
	var getHigestPoints;
	var getAverageDropLowestPoint;
	var getAveragePoints;
	var classAverageScoreAfterAllAttemptsForHignScore;
	var classAverageScoreAfterAllAttemptsForAverageScore;
	var classAverageScoreAfterAllAttemptsForAverageScoreWithDropLowest;
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
		console.log(report.formatTestName("TESTS FOR ASSESSMENTS WITH HIGH, AVERAGE AND DROP LOWEST SCORE STRATEGY"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***validateAssessmentForDifferentScorestrategy.js***"));
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

	it(". Complete Assessment form for system created assignment with high score strategy", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.enterName(browser).then(function() {
			assessmentsPage.enterRevealDate(browser).then(function() {
				assessmentsPage.selectChapter(browser, assessmentData.systemgenerated.scorestrategyhigh.chapter).then(function() {
					assessmentsPage.enterScore(browser, assessmentData.systemgenerated.scorestrategyhigh.score).then(function() {
						assessmentsPage.selectAttempts(browser, assessmentData.systemgenerated.scorestrategyhigh.attempts).then(function() {
							assessmentsPage.selectQuestionStrategy(browser, assessmentData.systemgenerated.QuestionStrategy.option[0]).then(function() {
								assessmentsPage.enterQuestionsPerStudent(browser, assessmentData.systemgenerated.scoreStrategyAll.questions).then(function() {
									console.log(report.reportHeader() +
										report.stepStatusWithData("Assessment form has been filled by chapter :" +
											assessmentData.systemgenerated.scorestrategyhigh.chapter + ", Score :" +
											assessmentData.systemgenerated.scorestrategyhigh.score + ", Number Of Attempts :" +
											assessmentData.systemgenerated.scorestrategyhigh.attempts + ", Question Strategy :" +
											assessmentData.systemgenerated.QuestionStrategy.option[0] + ", Score Strategy : High and Questions Per Student :",
											assessmentData.systemgenerated.scoreStrategyAll.questions, "success") +
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

	it(". Save the assessment with high score strategy", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});


	it(". Verify if assignment saved successfully with high score strategy", function(done) {
		assessmentNameForHignScore = assessmentsPage.getAssignmentName();
		assessmentsPage.checkIfAssignmentSavedOnCurrentDate(browser, assessmentNameForHignScore).then(function(value) {
			if (value.toString() === "rgb(236, 41, 142)") {
				assignmentCreationStatus = "success";
				console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentNameForHignScore, "success") + report.reportFooter());
				done();
			} else {
				assignmentCreationStatus = "failure";
				console.log(report.reportHeader() +
					report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentNameForHignScore + " may not have received the assessmentCGI", "failure") +
					report.reportFooter());
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

	it(". Complete CFM Assessment form for system created assignment with average score strategy", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.enterName(browser).then(function() {
			assessmentsPage.enterRevealDate(browser).then(function() {
				assessmentsPage.selectChapter(browser, assessmentData.systemgenerated.scorestrategyhigh.chapter).then(function() {
					assessmentsPage.enterScore(browser, assessmentData.systemgenerated.scorestrategyhigh.score).then(function() {
						assessmentsPage.selectAttempts(browser, assessmentData.systemgenerated.scorestrategyhigh.attempts).then(function() {
							assignmentAvgScore.selectAvgScore(browser).then(function() {
								assessmentsPage.selectQuestionStrategy(browser, assessmentData.systemgenerated.QuestionStrategy.option[0]).then(function() {
									assessmentsPage.enterQuestionsPerStudent(browser, assessmentData.systemgenerated.scoreStrategyAll.questions).then(function() {
										console.log(report.reportHeader() +
											report.stepStatusWithData("Assessment form has been filled by chapter :" +
												assessmentData.systemgenerated.scorestrategyhigh.chapter + ", Score :" +
												assessmentData.systemgenerated.scorestrategyhigh.score + ", Number Of Attempts :" +
												assessmentData.systemgenerated.scorestrategyhigh.attempts + ", Question Strategy :" +
												assessmentData.systemgenerated.QuestionStrategy.option[0] + ", Score Strategy : Average and Question Per Student :",
												assessmentData.systemgenerated.scoreStrategyAll.questions, "success") +
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

	it(". Save the CFM assessment with average score strategy", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});


	it(". Verify if CFM assignment gets saved successfully with average score strategy", function(done) {
		assessmentNameForAverageScore = assessmentsPage.getAssignmentName();
		assessmentsPage.checkIfAssignmentSavedOnCurrentDate(browser, assessmentNameForAverageScore).then(function(value) {
			if (value.toString() === "rgb(236, 41, 142)") {
				assignmentCreationStatus = "success";
				console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentNameForAverageScore, "success") + report.reportFooter());
				done();
			} else {
				assignmentCreationStatus = "failure";
				console.log(report.reportHeader() +
					report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentNameForAverageScore + " may not have received the assessmentCGI", "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Select current date and open the Assessment Type assignment settings page for creating 2nd assessment", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.selectADateForAssignment(browser).then(function() {
			calendarNavigation.selectAssessmentTypeAssignment(browser).then(function() {
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assessment type assignment is selected");
			});
		});
	});

	it(". Complete CFM Assessment form for system created assignment with drop lowest score strategy", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.enterName(browser).then(function() {
			assessmentsPage.enterRevealDate(browser).then(function() {
				assessmentsPage.selectChapter(browser, assessmentData.systemgenerated.scorestrategyhigh.chapter).then(function() {
					assessmentsPage.enterScore(browser, assessmentData.systemgenerated.scorestrategyhigh.score).then(function() {
						assessmentsPage.selectAttempts(browser, assessmentData.systemgenerated.scorestrategyhigh.attempts).then(function() {
							assessmentsPage.selectScoreStrategy(browser, assessmentData.systemgenerated.scorestrategyAverage.scoreStrategy).then(function() {
								assessmentsPage.selectDropLowestScore(browser).then(function() {
									assessmentsPage.selectQuestionStrategy(browser, assessmentData.systemgenerated.QuestionStrategy.option[0]).then(function() {
										assessmentsPage.enterQuestionsPerStudent(browser, assessmentData.systemgenerated.scoreStrategyAll.questions).then(function() {
											console.log(report.reportHeader() +
												report.stepStatusWithData("Assessment form has been filled by chapter :" +
													assessmentData.systemgenerated.scorestrategyhigh.chapter + ", Score :" +
													assessmentData.systemgenerated.scorestrategyhigh.score + ", Number Of Attempts :" +
													assessmentData.systemgenerated.scorestrategyhigh.attempts + ", Question Strategy :" +
													assessmentData.systemgenerated.QuestionStrategy.option[0] + ", Score Strategy : Drop Lowest average score and Questions Per Student :",
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

	it(". Save the assessment  with drop lowest score strategy", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});


	it(". Verify if CFM assessment type assignment gets saved successfully with drop lowest score strategy", function(done) {
		calendarNavigation.clickTheToggleOnCurrentMonth(browser).then(function() {
			assessmentNameForAverageScoreWithDropLowest = assessmentsPage.getAssignmentName();
			assessmentsPage.checkIfAssignmentSaved(browser, assessmentNameForAverageScoreWithDropLowest).then(function(value) {
				if (value.toString() === "rgb(236, 41, 142)") {
					assignmentCreationStatus = "success";
					console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentNameForAverageScoreWithDropLowest, "success") + report.reportFooter());
					done();
				} else {
					assignmentCreationStatus = "failure";
					console.log(report.reportHeader() +
						report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentNameForAverageScoreWithDropLowest + " may not have received the assessmentCGI", "failure") +
						report.reportFooter());
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

	it(". Launch the CFM high score assignment type assignment for the first time which has created for high score strategy ", function(done) {
		pageLoadingTime = 0;
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.launchAssignment(browser, assessmentNameForHignScore).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is launched");
		});
	});

	it(". LTR-5399 :: Verify error message should not be displayed on CFM with high score strategy assessment launch and also validate Continue button should be appear on launched assessment page", function(done) {
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

	// it(". Complete the assignment and exit", function(done) {
	// 	pageLoadingTime = 0;
	// 	if (assignmentCreationStatus === "failure") {
	// 		this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
	// 	} else {
	// 		this.timeout(courseHelper.getElevatedTimeout("quiz"));
	// 	}
	// 	cas_questions_text = studentAssignmentPage.studentAssignmentSubmissionPage.cas_questions_text;
	// 	cas_activity_series = studentAssignmentPage.studentAssignmentSubmissionPage.cas_activity_series;
	// 	trueFalseQuestionRadio = studentAssignmentPage.studentAssignmentSubmissionPage.trueFalseQuestionRadio;
	// 	cas_choice_radio_for_true_false = studentAssignmentPage.studentAssignmentSubmissionPage.cas_choice_radio_for_true_false;
	// 	multipleChoiceQuestionRadio = studentAssignmentPage.studentAssignmentSubmissionPage.multipleChoiceQuestionRadio;
	// 	cas_choice_radio_for_multiple_type_question = studentAssignmentPage.studentAssignmentSubmissionPage.cas_choice_radio_for_multiple_type_question;
	// 	continueButton = studentAssignmentPage.studentAssignmentSubmissionPage.continueButton;
	// 	disabled_continue_button = studentAssignmentPage.studentAssignmentSubmissionPage.disabled_continue_button;
	// 	dropDownBox = studentAssignmentPage.studentAssignmentSubmissionPage.dropDownBox;
	// 	select_option_from_dropdown = studentAssignmentPage.studentAssignmentSubmissionPage.select_option_from_dropdown;
	// 	exit_button = studentAssignmentPage.studentAssignmentSubmissionPage.exit_button;
	// 	optionOfSelectType = stringutil.returnreplacedstring(select_option_from_dropdown, "{{}}", +mathutil.getRandomInt(1, 4));
	// 	trueFalseRadioChoice = stringutil.returnreplacedstring(cas_choice_radio_for_true_false, "{{}}", mathutil.getRandomInt(1, 3));
	// 	multipleChoiceRadioOption = stringutil.returnreplacedstring(cas_choice_radio_for_multiple_type_question, "{{}}", mathutil.getRandomInt(1, 3));
	// 	//Call this function if you want a specific block to timeout after a specific time interval
	// 	browser
	// 		.waitForElementsByCss(cas_activity_series, asserters.isDisplayed, 60000).then(function(len) {
	// 			countOfQuestions = _.size(len);
	// 			completedQuestions = 0;
	//
	// 			function selectAnAnswerAndProceed() {
	// 				if (countOfQuestions > 0) {
	// 					countOfQuestions--;
	// 					completedQuestions++;
	// 					browser
	// 						.sleep(1000)
	// 						.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
	// 						.hasElementByCss(trueFalseQuestionRadio).then(function(flag) {
	// 							if (!flag) {
	// 								browser.sleep(1000).waitForElementByCss(multipleChoiceQuestionRadio, asserters.isDisplayed, 5000).getTagName().then(function(tag) {
	// 									if (tag === "div") {
	// 										browser
	// 											.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
	// 											.waitForElementByXPath(multipleChoiceRadioOption, asserters.isDisplayed, 3000)
	// 											.click()
	// 											.elementByCssSelectorWhenReady(continueButton, 3000)
	// 											.click();
	// 										console.log("Answered a Question with Radio Button " + completedQuestions + " and remaining Questions " + countOfQuestions);
	// 									} else {
	// 										browser
	// 											.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
	// 											.waitForElementByCss(dropDownBox, asserters.isDisplayed, 7000)
	// 											.click()
	// 											.waitForElementByCss(optionOfSelectType, asserters.isDisplayed, 10000)
	// 											.click()
	// 											.sleep(1000)
	// 											.elementByCssSelectorWhenReady(continueButton, 3000)
	// 											.click();
	// 										console.log("Answered a Question with a Drop down " + completedQuestions + " and remaining Questions " + countOfQuestions);
	// 									}
	// 									setTimeout(selectAnAnswerAndProceed, 7000);
	// 								});
	// 							} else {
	// 								browser.waitForElementByCss(trueFalseQuestionRadio, asserters.isDisplayed, 5000).getTagName().then(function(tag) {
	// 									if (tag === "div") {
	// 										console.log("True False Question");
	// 										browser
	// 											.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
	// 											.waitForElementByXPath(trueFalseRadioChoice, asserters.isDisplayed, 3000)
	// 											.click()
	// 											.elementByCssSelectorWhenReady(continueButton, 5000)
	// 											.click();
	// 										console.log("Answered a True or False Question " + completedQuestions + " and remaining Questions " + countOfQuestions);
	//
	//
	// 									} else {
	//
	// 										console.log("Problem in answering T/F");
	//
	// 									}
	// 									setTimeout(selectAnAnswerAndProceed, 5000);
	// 								});
	// 							}
	// 						});
	// 				} else {
	//
	// 					if (completedQuestions == _.size(len)) {
	// 						console.log("All Questions successfully attempted");
	//
	// 						browser
	// 							.waitForElementByCss(exit_button, asserters.isDisplayed, 3000)
	// 							.then(function(el) {
	//
	// 								casPage.getQuestionsCorrect(browser).then(function(questionsCorrect) {
	// 									questionsCorrect1stattemptFromCASHighScore = parseInt(questionsCorrect);
	// 									console.log("Total Questions Correct " + questionsCorrect);
	//
	// 									console.log("Total Assignment Questions " + assessmentsPage.getMaxAssignmentQuestions());
	// 									studentAssignmentCompletionStatus = "success";
	//
	// 									console.log(report.reportHeader() +
	// 										report.stepStatusWithData("CAS : Student Completed the 1st attempt of assignment with questions " + assessmentsPage.getMaxAssignmentQuestions() + " and got a score of  ", questionsCorrect, "success") +
	// 										report.reportFooter());
	//
	// 									el.click().then(function() {
	// 										takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is attempted");
	// 									});
	//
	// 								});
	//
	//
	// 							});
	//
	// 					} else {
	// 						studentAssignmentCompletionStatus = "failure";
	// 						console.log(report.reportHeader() +
	// 							report.stepStatusWithData("Student Assignment completion status ", studentAssignmentCompletionStatus, "failure") +
	// 							report.reportFooter());
	// 					}
	// 				}
	// 			}
	//
	// 			//Function to answer all the Questions
	// 			selectAnAnswerAndProceed();
	// 		});
	// });

	it(". Complete the 'Choose For Me' type Assessment", function(done) {
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
			console.log("Total Questions Correct " + questionsCorrect);
			questionsCorrect1stattemptFromCASHighScore = parseInt(questionsCorrect);
			console.log("Total Assignment Questions " + assessmentsPage.getMaxAssignmentQuestions());
			studentAssignmentCompletionStatus = "success";
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS : Student Completed the assignment with questions " + assessmentsPage.getMaxAssignmentQuestions() + " and got a score of  ", questionsCorrect1stattemptFromCASHighScore, "success") +
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

	it(". Refresh the page and wait until page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
			});
	});

	it(". Click on the current date cell", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickOnCurrentDateCell(browser).then(function() {
			done();
		})
	});

	it(". Launch the CFM high score assignment for the second attempt", function(done) {
		pageLoadingTime = 0;
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.launchAssignment(browser, assessmentNameForHignScore).then(function() {
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

	// it(". Complete the assignment and exit", function(done) {
	// 	pageLoadingTime = 0;
	// 	if (assignmentCreationStatus === "failure") {
	// 		this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
	// 	} else {
	// 		this.timeout(courseHelper.getElevatedTimeout("quiz"));
	// 	}
	// 	//Call this function if you want a specific block to timeout after a specific time interval0);
	// 	browser
	// 		.waitForElementsByCss(cas_activity_series, asserters.isDisplayed, 60000).then(function(len) {
	// 			console.log("No of Questions : " + _.size(len));
	// 			countOfQuestions = _.size(len);
	// 			completedQuestions = 0;
	//
	// 			function selectAnAnswerAndProceed() {
	// 				if (countOfQuestions > 0) {
	// 					countOfQuestions--;
	// 					completedQuestions++;
	// 					browser
	// 						.sleep(1000)
	// 						.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
	// 						.hasElementByCss(trueFalseQuestionRadio).then(function(flag) {
	// 							if (!flag) {
	// 								browser.sleep(1000).waitForElementByCss(multipleChoiceQuestionRadio, asserters.isDisplayed, 5000).getTagName().then(function(tag) {
	// 									if (tag === "div") {
	// 										browser
	// 											.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
	// 											.waitForElementByXPath(multipleChoiceRadioOption, asserters.isDisplayed, 3000)
	// 											.click()
	// 											.elementByCssSelectorWhenReady(continueButton, 3000)
	// 											.click();
	// 										console.log("Answered a Question with Radio Button " + completedQuestions + " and remaining Questions " + countOfQuestions);
	// 									} else {
	// 										browser
	// 											.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
	// 											.waitForElementByCss(dropDownBox, asserters.isDisplayed, 7000)
	// 											.click()
	// 											.waitForElementByCss(optionOfSelectType, asserters.isDisplayed, 10000)
	// 											.click()
	// 											.sleep(1000)
	// 											.elementByCssSelectorWhenReady(continueButton, 3000)
	// 											.click();
	// 										console.log("Answered a Question with a Drop down " + completedQuestions + " and remaining Questions " + countOfQuestions);
	//
	// 									}
	// 									setTimeout(selectAnAnswerAndProceed, 7000);
	// 								});
	// 							} else {
	// 								browser.waitForElementByCss(trueFalseQuestionRadio, asserters.isDisplayed, 5000).getTagName().then(function(tag) {
	// 									if (tag === "div") {
	// 										console.log("True False Question");
	// 										browser
	// 											.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
	// 											.waitForElementByXPath(trueFalseRadioChoice, asserters.isDisplayed, 3000)
	// 											.click()
	// 											.elementByCssSelectorWhenReady(continueButton, 5000)
	// 											.click();
	// 										console.log("Answered a True or False Question " + completedQuestions + " and remaining Questions " + countOfQuestions);
	// 									} else {
	// 										console.log("Problem in answering T/F");
	// 									}
	// 									setTimeout(selectAnAnswerAndProceed, 5000);
	// 								});
	// 							}
	// 						});
	// 				} else {
	// 					if (completedQuestions == _.size(len)) {
	// 						console.log("All Questions successfully attempted");
	// 						browser
	// 							.waitForElementByCss(exit_button, asserters.isDisplayed, 3000)
	// 							.then(function(el) {
	// 								casPage.getQuestionsCorrect(browser).then(function(questionsCorrect) {
	// 									questionsCorrect2ndattemptFromCASHighScore = parseInt(questionsCorrect);
	// 									console.log("Total Questions Correct " + questionsCorrect);
	// 									console.log("Total Assignment Questions " + assessmentsPage.getMaxAssignmentQuestions());
	// 									studentAssignmentCompletionStatus = "success";
	// 									console.log(report.reportHeader() +
	// 										report.stepStatusWithData("CAS : Student Completed the 2nd attempt of assignment with questions " + assessmentsPage.getMaxAssignmentQuestions() + " and got a score of  ", questionsCorrect, "success") +
	// 										report.reportFooter());
	// 									el.click().then(function() {
	// 										takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is attempted");
	// 									});
	// 								});
	// 							});
	// 					} else {
	// 						studentAssignmentCompletionStatus = "failure";
	// 						console.log(report.reportHeader() +
	// 							report.stepStatusWithData("Student Assignment completion status ", studentAssignmentCompletionStatus, "failure") +
	// 							report.reportFooter());
	// 						// done();
	// 					}
	// 				}
	// 			}
	//
	// 			//Function to answer all the Questions
	// 			selectAnAnswerAndProceed();
	// 		});
	// });

	it(". Complete the 'Choose For Me' type Assessment", function(done) {
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
			console.log("Total Questions Correct " + questionsCorrect);
			questionsCorrect2ndattemptFromCASHighScore = parseInt(questionsCorrect);
			console.log("Total Assignment Questions " + assessmentsPage.getMaxAssignmentQuestions());
			studentAssignmentCompletionStatus = "success";
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS : Student Completed the assignment with questions " + assessmentsPage.getMaxAssignmentQuestions() + " and got a score of  ", questionsCorrect2ndattemptFromCASHighScore, "success") +
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

	it(". Refresh the page and wait until page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
			});
	});

	it(". Click on the current date cell", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickOnCurrentDateCell(browser).then(function() {
			done();
		})
	});

	it(". Launch the CFM average score assessment type assignment for the first attempt", function(done) {
		pageLoadingTime = 0;
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.launchAssignment(browser, assessmentNameForAverageScore).then(function() {
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

	// it(". Complete the assignment and exit", function(done) {
	// 	pageLoadingTime = 0;
	// 	if (assignmentCreationStatus === "failure") {
	// 		this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
	// 	} else {
	// 		this.timeout(courseHelper.getElevatedTimeout("quiz"));
	// 	}
	// 	cas_questions_text = studentAssignmentPage.studentAssignmentSubmissionPage.cas_questions_text;
	// 	cas_activity_series = studentAssignmentPage.studentAssignmentSubmissionPage.cas_activity_series;
	// 	trueFalseQuestionRadio = studentAssignmentPage.studentAssignmentSubmissionPage.trueFalseQuestionRadio;
	// 	cas_choice_radio_for_true_false = studentAssignmentPage.studentAssignmentSubmissionPage.cas_choice_radio_for_true_false;
	// 	multipleChoiceQuestionRadio = studentAssignmentPage.studentAssignmentSubmissionPage.multipleChoiceQuestionRadio;
	// 	cas_choice_radio_for_multiple_type_question = studentAssignmentPage.studentAssignmentSubmissionPage.cas_choice_radio_for_multiple_type_question;
	// 	continueButton = studentAssignmentPage.studentAssignmentSubmissionPage.continueButton;
	// 	disabled_continue_button = studentAssignmentPage.studentAssignmentSubmissionPage.disabled_continue_button;
	// 	dropDownBox = studentAssignmentPage.studentAssignmentSubmissionPage.dropDownBox;
	// 	select_option_from_dropdown = studentAssignmentPage.studentAssignmentSubmissionPage.select_option_from_dropdown;
	// 	exit_button = studentAssignmentPage.studentAssignmentSubmissionPage.exit_button;
	// 	optionOfSelectType = stringutil.returnreplacedstring(select_option_from_dropdown, "{{}}", +mathutil.getRandomInt(1, 4));
	// 	trueFalseRadioChoice = stringutil.returnreplacedstring(cas_choice_radio_for_true_false, "{{}}", mathutil.getRandomInt(1, 3));
	// 	multipleChoiceRadioOption = stringutil.returnreplacedstring(cas_choice_radio_for_multiple_type_question, "{{}}", mathutil.getRandomInt(1, 3));
	// 	//Call this function if you want a specific block to timeout after a specific time interval
	// 	browser
	// 		.waitForElementsByCss(cas_activity_series, asserters.isDisplayed, 60000).then(function(len) {
	// 			countOfQuestions = _.size(len);
	// 			completedQuestions = 0;
	//
	// 			function selectAnAnswerAndProceed() {
	// 				if (countOfQuestions > 0) {
	// 					countOfQuestions--;
	// 					completedQuestions++;
	// 					browser
	// 						.sleep(1000)
	// 						.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
	// 						.hasElementByCss(trueFalseQuestionRadio).then(function(flag) {
	// 							if (!flag) {
	// 								browser.sleep(1000).waitForElementByCss(multipleChoiceQuestionRadio, asserters.isDisplayed, 5000).getTagName().then(function(tag) {
	// 									if (tag === "div") {
	// 										browser
	// 											.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
	// 											.waitForElementByXPath(multipleChoiceRadioOption, asserters.isDisplayed, 3000)
	// 											.click()
	// 											.elementByCssSelectorWhenReady(continueButton, 3000)
	// 											.click();
	// 										console.log("Answered a Question with Radio Button " + completedQuestions + " and remaining Questions " + countOfQuestions);
	// 									} else {
	// 										browser
	// 											.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
	// 											.waitForElementByCss(dropDownBox, asserters.isDisplayed, 7000)
	// 											.click()
	// 											.waitForElementByCss(optionOfSelectType, asserters.isDisplayed, 10000)
	// 											.click()
	// 											.sleep(1000)
	// 											.elementByCssSelectorWhenReady(continueButton, 3000)
	// 											.click();
	// 										console.log("Answered a Question with a Drop down " + completedQuestions + " and remaining Questions " + countOfQuestions);
	// 									}
	// 									setTimeout(selectAnAnswerAndProceed, 7000);
	// 								});
	// 							} else {
	// 								browser.waitForElementByCss(trueFalseQuestionRadio, asserters.isDisplayed, 5000).getTagName().then(function(tag) {
	// 									if (tag === "div") {
	// 										console.log("True False Question");
	// 										browser
	// 											.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
	// 											.waitForElementByXPath(trueFalseRadioChoice, asserters.isDisplayed, 3000)
	// 											.click()
	// 											.elementByCssSelectorWhenReady(continueButton, 5000)
	// 											.click();
	// 										console.log("Answered a True or False Question " + completedQuestions + " and remaining Questions " + countOfQuestions);
	//
	//
	// 									} else {
	//
	// 										console.log("Problem in answering T/F");
	//
	// 									}
	// 									setTimeout(selectAnAnswerAndProceed, 5000);
	// 								});
	// 							}
	// 						});
	// 				} else {
	//
	// 					if (completedQuestions == _.size(len)) {
	// 						console.log("All Questions successfully attempted");
	//
	// 						browser
	// 							.waitForElementByCss(exit_button, asserters.isDisplayed, 3000)
	// 							.then(function(el) {
	//
	// 								casPage.getQuestionsCorrect(browser).then(function(questionsCorrect) {
	// 									questionsCorrect1stattemptFromCASAverageScore = parseInt(questionsCorrect);
	// 									console.log("Total Questions Correct " + questionsCorrect);
	//
	// 									console.log("Total Assignment Questions " + assessmentsPage.getMaxAssignmentQuestions());
	// 									studentAssignmentCompletionStatus = "success";
	//
	// 									console.log(report.reportHeader() +
	// 										report.stepStatusWithData("CAS : Student Completed the 1st attempt of assignment with questions " + assessmentsPage.getMaxAssignmentQuestions() + " and got a score of  ", questionsCorrect, "success") +
	// 										report.reportFooter());
	//
	// 									el.click().then(function() {
	// 										takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is attempted");
	// 									});
	//
	// 								});
	//
	//
	// 							});
	//
	// 					} else {
	// 						studentAssignmentCompletionStatus = "failure";
	// 						console.log(report.reportHeader() +
	// 							report.stepStatusWithData("Student Assignment completion status ", studentAssignmentCompletionStatus, "failure") +
	// 							report.reportFooter());
	// 					}
	// 				}
	// 			}
	//
	// 			//Function to answer all the Questions
	// 			selectAnAnswerAndProceed();
	// 		});
	// });

		it(". Complete the 'Choose For Me' type Assessment", function(done) {
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
				console.log("Total Questions Correct " + questionsCorrect);
				questionsCorrect1stattemptFromCASAverageScore = parseInt(questionsCorrect);
				console.log("Total Assignment Questions " + assessmentsPage.getMaxAssignmentQuestions());
				studentAssignmentCompletionStatus = "success";
				console.log(report.reportHeader() +
					report.stepStatusWithData("CAS : Student Completed the assignment with questions " + assessmentsPage.getMaxAssignmentQuestions() + " and got a score of  ", questionsCorrect1stattemptFromCASAverageScore, "success") +
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


	it(". Refresh the page and wait until page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
			});
	});

	it(". Click on the current date cell", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickOnCurrentDateCell(browser).then(function() {
			done();
		})
	});

	it(".  Launch the CFM average score assessment type assignment for the second attempt", function(done) {
		pageLoadingTime = 0;
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.launchAssignment(browser, assessmentNameForAverageScore).then(function() {
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

	// it(". Complete the assignment and exit", function(done) {
	// 	pageLoadingTime = 0;
	// 	if (assignmentCreationStatus === "failure") {
	// 		this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
	// 	} else {
	// 		this.timeout(courseHelper.getElevatedTimeout("quiz"));
	// 	}
	// 	//Call this function if you want a specific block to timeout after a specific time interval0);
	// 	browser
	// 		.waitForElementsByCss(cas_activity_series, asserters.isDisplayed, 60000).then(function(len) {
	// 			console.log("No of Questions : " + _.size(len));
	// 			countOfQuestions = _.size(len);
	// 			completedQuestions = 0;
	//
	// 			function selectAnAnswerAndProceed() {
	// 				if (countOfQuestions > 0) {
	// 					countOfQuestions--;
	// 					completedQuestions++;
	// 					browser
	// 						.sleep(1000)
	// 						.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
	// 						.hasElementByCss(trueFalseQuestionRadio).then(function(flag) {
	// 							if (!flag) {
	// 								browser.sleep(1000).waitForElementByCss(multipleChoiceQuestionRadio, asserters.isDisplayed, 5000).getTagName().then(function(tag) {
	// 									if (tag === "div") {
	// 										browser
	// 											.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
	// 											.waitForElementByXPath(multipleChoiceRadioOption, asserters.isDisplayed, 3000)
	// 											.click()
	// 											.elementByCssSelectorWhenReady(continueButton, 3000)
	// 											.click();
	// 										console.log("Answered a Question with Radio Button " + completedQuestions + " and remaining Questions " + countOfQuestions);
	// 									} else {
	// 										browser
	// 											.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
	// 											.waitForElementByCss(dropDownBox, asserters.isDisplayed, 7000)
	// 											.click()
	// 											.waitForElementByCss(optionOfSelectType, asserters.isDisplayed, 10000)
	// 											.click()
	// 											.sleep(1000)
	// 											.elementByCssSelectorWhenReady(continueButton, 3000)
	// 											.click();
	// 										console.log("Answered a Question with a Drop down " + completedQuestions + " and remaining Questions " + countOfQuestions);
	//
	// 									}
	// 									setTimeout(selectAnAnswerAndProceed, 7000);
	// 								});
	// 							} else {
	// 								browser.waitForElementByCss(trueFalseQuestionRadio, asserters.isDisplayed, 5000).getTagName().then(function(tag) {
	// 									if (tag === "div") {
	// 										console.log("True False Question");
	// 										browser
	// 											.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
	// 											.waitForElementByXPath(trueFalseRadioChoice, asserters.isDisplayed, 3000)
	// 											.click()
	// 											.elementByCssSelectorWhenReady(continueButton, 5000)
	// 											.click();
	// 										console.log("Answered a True or False Question " + completedQuestions + " and remaining Questions " + countOfQuestions);
	// 									} else {
	// 										console.log("Problem in answering T/F");
	// 									}
	// 									setTimeout(selectAnAnswerAndProceed, 5000);
	// 								});
	// 							}
	// 						});
	// 				} else {
	// 					if (completedQuestions == _.size(len)) {
	// 						console.log("All Questions successfully attempted");
	// 						browser
	// 							.waitForElementByCss(exit_button, asserters.isDisplayed, 3000)
	// 							.then(function(el) {
	// 								casPage.getQuestionsCorrect(browser).then(function(questionsCorrect) {
	// 									questionsCorrect2ndattemptFromCASAverageScore = parseInt(questionsCorrect);
	// 									console.log("Total Questions Correct " + questionsCorrect);
	// 									console.log("Total Assignment Questions " + assessmentsPage.getMaxAssignmentQuestions());
	// 									studentAssignmentCompletionStatus = "success";
	// 									console.log(report.reportHeader() +
	// 										report.stepStatusWithData("CAS : Student Completed the 2nd attempt of assignment with questions " + assessmentsPage.getMaxAssignmentQuestions() + " and got a score of  ", questionsCorrect, "success") +
	// 										report.reportFooter());
	// 									el.click().then(function() {
	// 										takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is attempted");
	// 									});
	// 								});
	// 							});
	// 					} else {
	// 						studentAssignmentCompletionStatus = "failure";
	// 						console.log(report.reportHeader() +
	// 							report.stepStatusWithData("Student Assignment completion status ", studentAssignmentCompletionStatus, "failure") +
	// 							report.reportFooter());
	// 						// done();
	// 					}
	// 				}
	// 			}
	//
	// 			//Function to answer all the Questions
	// 			selectAnAnswerAndProceed();
	// 		});
	// });

	it(". Complete the 'Choose For Me' average score type Assessment", function(done) {
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
			console.log("Total Questions Correct " + questionsCorrect);
			questionsCorrect2ndattemptFromCASAverageScore = parseInt(questionsCorrect);
			console.log("Total Assignment Questions " + assessmentsPage.getMaxAssignmentQuestions());
			studentAssignmentCompletionStatus = "success";
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS : Student Completed the assignment with questions " + assessmentsPage.getMaxAssignmentQuestions() + " and got a score of  ", questionsCorrect2ndattemptFromCASAverageScore, "success") +
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


	it(". Refresh the page and wait until page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
			});
	});

	it(". Click on the current date cell", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickOnCurrentDateCell(browser).then(function() {
			done();
		})
	});

	it(". Launch the CFM drop lowest score assessment type assignment for the first time", function(done) {
		pageLoadingTime = 0;
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.launchAssignment(browser, assessmentNameForAverageScoreWithDropLowest).then(function() {
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

	// it(". Complete the assignment and exit", function(done) {
	// 	pageLoadingTime = 0;
	// 	if (assignmentCreationStatus === "failure") {
	// 		this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
	// 	} else {
	// 		this.timeout(courseHelper.getElevatedTimeout("quiz"));
	// 	}
	// 	cas_questions_text = studentAssignmentPage.studentAssignmentSubmissionPage.cas_questions_text;
	// 	cas_activity_series = studentAssignmentPage.studentAssignmentSubmissionPage.cas_activity_series;
	// 	trueFalseQuestionRadio = studentAssignmentPage.studentAssignmentSubmissionPage.trueFalseQuestionRadio;
	// 	cas_choice_radio_for_true_false = studentAssignmentPage.studentAssignmentSubmissionPage.cas_choice_radio_for_true_false;
	// 	multipleChoiceQuestionRadio = studentAssignmentPage.studentAssignmentSubmissionPage.multipleChoiceQuestionRadio;
	// 	cas_choice_radio_for_multiple_type_question = studentAssignmentPage.studentAssignmentSubmissionPage.cas_choice_radio_for_multiple_type_question;
	// 	continueButton = studentAssignmentPage.studentAssignmentSubmissionPage.continueButton;
	// 	disabled_continue_button = studentAssignmentPage.studentAssignmentSubmissionPage.disabled_continue_button;
	// 	dropDownBox = studentAssignmentPage.studentAssignmentSubmissionPage.dropDownBox;
	// 	select_option_from_dropdown = studentAssignmentPage.studentAssignmentSubmissionPage.select_option_from_dropdown;
	// 	exit_button = studentAssignmentPage.studentAssignmentSubmissionPage.exit_button;
	// 	optionOfSelectType = stringutil.returnreplacedstring(select_option_from_dropdown, "{{}}", +mathutil.getRandomInt(1, 4));
	// 	trueFalseRadioChoice = stringutil.returnreplacedstring(cas_choice_radio_for_true_false, "{{}}", mathutil.getRandomInt(1, 3));
	// 	multipleChoiceRadioOption = stringutil.returnreplacedstring(cas_choice_radio_for_multiple_type_question, "{{}}", mathutil.getRandomInt(1, 3));
	// 	//Call this function if you want a specific block to timeout after a specific time interval
	// 	browser
	// 		.waitForElementsByCss(cas_activity_series, asserters.isDisplayed, 60000).then(function(len) {
	// 			countOfQuestions = _.size(len);
	// 			completedQuestions = 0;
	//
	// 			function selectAnAnswerAndProceed() {
	// 				if (countOfQuestions > 0) {
	// 					countOfQuestions--;
	// 					completedQuestions++;
	// 					browser
	// 						.sleep(1000)
	// 						.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
	// 						.hasElementByCss(trueFalseQuestionRadio).then(function(flag) {
	// 							if (!flag) {
	// 								browser.sleep(1000).waitForElementByCss(multipleChoiceQuestionRadio, asserters.isDisplayed, 5000).getTagName().then(function(tag) {
	// 									if (tag === "div") {
	// 										browser
	// 											.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
	// 											.waitForElementByXPath(multipleChoiceRadioOption, asserters.isDisplayed, 3000)
	// 											.click()
	// 											.elementByCssSelectorWhenReady(continueButton, 3000)
	// 											.click();
	// 										console.log("Answered a Question with Radio Button " + completedQuestions + " and remaining Questions " + countOfQuestions);
	// 									} else {
	// 										browser
	// 											.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
	// 											.waitForElementByCss(dropDownBox, asserters.isDisplayed, 7000)
	// 											.click()
	// 											.waitForElementByCss(optionOfSelectType, asserters.isDisplayed, 10000)
	// 											.click()
	// 											.sleep(1000)
	// 											.elementByCssSelectorWhenReady(continueButton, 3000)
	// 											.click();
	// 										console.log("Answered a Question with a Drop down " + completedQuestions + " and remaining Questions " + countOfQuestions);
	// 									}
	// 									setTimeout(selectAnAnswerAndProceed, 7000);
	// 								});
	// 							} else {
	// 								browser.waitForElementByCss(trueFalseQuestionRadio, asserters.isDisplayed, 5000).getTagName().then(function(tag) {
	// 									if (tag === "div") {
	// 										console.log("True False Question");
	// 										browser
	// 											.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
	// 											.waitForElementByXPath(trueFalseRadioChoice, asserters.isDisplayed, 3000)
	// 											.click()
	// 											.elementByCssSelectorWhenReady(continueButton, 5000)
	// 											.click();
	// 										console.log("Answered a True or False Question " + completedQuestions + " and remaining Questions " + countOfQuestions);
	//
	//
	// 									} else {
	//
	// 										console.log("Problem in answering T/F");
	//
	// 									}
	// 									setTimeout(selectAnAnswerAndProceed, 5000);
	// 								});
	// 							}
	// 						});
	// 				} else {
	//
	// 					if (completedQuestions == _.size(len)) {
	// 						console.log("All Questions successfully attempted");
	//
	// 						browser
	// 							.waitForElementByCss(exit_button, asserters.isDisplayed, 3000)
	// 							.then(function(el) {
	//
	// 								casPage.getQuestionsCorrect(browser).then(function(questionsCorrect) {
	// 									questionsCorrect1stattemptFromCASAverageDropLowestScore = parseInt(questionsCorrect);
	// 									console.log("Total Questions Correct " + questionsCorrect);
	//
	// 									console.log("Total Assignment Questions " + assessmentsPage.getMaxAssignmentQuestions());
	// 									studentAssignmentCompletionStatus = "success";
	//
	// 									console.log(report.reportHeader() +
	// 										report.stepStatusWithData("CAS : Student Completed the 1st attempt of assignment with questions " + assessmentsPage.getMaxAssignmentQuestions() + " and got a score of  ", questionsCorrect, "success") +
	// 										report.reportFooter());
	//
	// 									el.click().then(function() {
	// 										takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is attempted");
	// 									});
	//
	// 								});
	//
	//
	// 							});
	//
	// 					} else {
	// 						studentAssignmentCompletionStatus = "failure";
	// 						console.log(report.reportHeader() +
	// 							report.stepStatusWithData("Student Assignment completion status ", studentAssignmentCompletionStatus, "failure") +
	// 							report.reportFooter());
	// 					}
	// 				}
	// 			}
	//
	// 			//Function to answer all the Questions
	// 			selectAnAnswerAndProceed();
	// 		});
	// });

		it(". Complete the 'Choose For Me' drop lowest score type Assessment", function(done) {
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
				console.log("Total Questions Correct " + questionsCorrect);
				questionsCorrect1stattemptFromCASAverageDropLowestScore = parseInt(questionsCorrect);
				console.log("Total Assignment Questions " + assessmentsPage.getMaxAssignmentQuestions());
				studentAssignmentCompletionStatus = "success";
				console.log(report.reportHeader() +
					report.stepStatusWithData("CAS : Student Completed the assignment with questions " + assessmentsPage.getMaxAssignmentQuestions() + " and got a score of  ", questionsCorrect1stattemptFromCASAverageDropLowestScore, "success") +
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

	it(". Refresh the page and wait until page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
			});
	});

	it(". Click on the current date cell", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickOnCurrentDateCell(browser).then(function() {
			done();
		})
	});

	it(". Launch the CFM drop lowest score assessment type assignment for the second attempt", function(done) {
		pageLoadingTime = 0;
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.launchAssignment(browser, assessmentNameForAverageScoreWithDropLowest).then(function() {
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

	// it(". Complete the assignment and exit", function(done) {
	// 	pageLoadingTime = 0;
	// 	if (assignmentCreationStatus === "failure") {
	// 		this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
	// 	} else {
	// 		this.timeout(courseHelper.getElevatedTimeout("quiz"));
	// 	}
	// 	//Call this function if you want a specific block to timeout after a specific time interval0);
	// 	browser
	// 		.waitForElementsByCss(cas_activity_series, asserters.isDisplayed, 60000).then(function(len) {
	// 			console.log("No of Questions : " + _.size(len));
	// 			countOfQuestions = _.size(len);
	// 			completedQuestions = 0;
	//
	// 			function selectAnAnswerAndProceed() {
	// 				if (countOfQuestions > 0) {
	// 					countOfQuestions--;
	// 					completedQuestions++;
	// 					browser
	// 						.sleep(1000)
	// 						.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
	// 						.hasElementByCss(trueFalseQuestionRadio).then(function(flag) {
	// 							if (!flag) {
	// 								browser.sleep(1000).waitForElementByCss(multipleChoiceQuestionRadio, asserters.isDisplayed, 5000).getTagName().then(function(tag) {
	// 									if (tag === "div") {
	// 										browser
	// 											.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
	// 											.waitForElementByXPath(multipleChoiceRadioOption, asserters.isDisplayed, 3000)
	// 											.click()
	// 											.elementByCssSelectorWhenReady(continueButton, 3000)
	// 											.click();
	// 										console.log("Answered a Question with Radio Button " + completedQuestions + " and remaining Questions " + countOfQuestions);
	// 									} else {
	// 										browser
	// 											.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
	// 											.waitForElementByCss(dropDownBox, asserters.isDisplayed, 7000)
	// 											.click()
	// 											.waitForElementByCss(optionOfSelectType, asserters.isDisplayed, 10000)
	// 											.click()
	// 											.sleep(1000)
	// 											.elementByCssSelectorWhenReady(continueButton, 3000)
	// 											.click();
	// 										console.log("Answered a Question with a Drop down " + completedQuestions + " and remaining Questions " + countOfQuestions);
	//
	// 									}
	// 									setTimeout(selectAnAnswerAndProceed, 7000);
	// 								});
	// 							} else {
	// 								browser.waitForElementByCss(trueFalseQuestionRadio, asserters.isDisplayed, 5000).getTagName().then(function(tag) {
	// 									if (tag === "div") {
	// 										console.log("True False Question");
	// 										browser
	// 											.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
	// 											.waitForElementByXPath(trueFalseRadioChoice, asserters.isDisplayed, 3000)
	// 											.click()
	// 											.elementByCssSelectorWhenReady(continueButton, 5000)
	// 											.click();
	// 										console.log("Answered a True or False Question " + completedQuestions + " and remaining Questions " + countOfQuestions);
	// 									} else {
	// 										console.log("Problem in answering T/F");
	// 									}
	// 									setTimeout(selectAnAnswerAndProceed, 5000);
	// 								});
	// 							}
	// 						});
	// 				} else {
	// 					if (completedQuestions == _.size(len)) {
	// 						console.log("All Questions successfully attempted");
	// 						browser
	// 							.waitForElementByCss(exit_button, asserters.isDisplayed, 3000)
	// 							.then(function(el) {
	// 								casPage.getQuestionsCorrect(browser).then(function(questionsCorrect) {
	// 									questionsCorrect2ndattemptFromCASAverageDropLowestScore = parseInt(questionsCorrect);
	// 									console.log("Total Questions Correct " + questionsCorrect);
	// 									console.log("Total Assignment Questions " + assessmentsPage.getMaxAssignmentQuestions());
	// 									studentAssignmentCompletionStatus = "success";
	// 									console.log(report.reportHeader() +
	// 										report.stepStatusWithData("CAS : Student Completed the 2nd attempt of assignment with questions " + assessmentsPage.getMaxAssignmentQuestions() + " and got a score of  ", questionsCorrect, "success") +
	// 										report.reportFooter());
	// 									el.click().then(function() {
	// 										takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is attempted");
	// 									});
	// 								});
	// 							});
	// 					} else {
	// 						studentAssignmentCompletionStatus = "failure";
	// 						console.log(report.reportHeader() +
	// 							report.stepStatusWithData("Student Assignment completion status ", studentAssignmentCompletionStatus, "failure") +
	// 							report.reportFooter());
	// 					}
	// 				}
	// 			}
	//
	// 			//Function to answer all the Questions
	// 			selectAnAnswerAndProceed();
	// 		});
	// });

	it(". Complete the 'Choose For Me' drop lowest score type Assessment", function(done) {
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
			console.log("Total Questions Correct " + questionsCorrect);
			questionsCorrect2ndattemptFromCASAverageDropLowestScore = parseInt(questionsCorrect);
			console.log("Total Assignment Questions " + assessmentsPage.getMaxAssignmentQuestions());
			studentAssignmentCompletionStatus = "success";
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS : Student Completed the assignment with questions " + assessmentsPage.getMaxAssignmentQuestions() + " and got a score of  ", questionsCorrect2ndattemptFromCASAverageDropLowestScore, "success") +
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

	it(". Refresh the page and wait until page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
			});
	});


	it(". Navigate to GradeBook page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Retrieve highest, average and average with drop lowest score from student's attempts", function(done) {
		//get high score
		var correctedQuestionsInHighestScore = [questionsCorrect1stattemptFromCASHighScore, questionsCorrect2ndattemptFromCASHighScore];
		highestValueOfCorrectedQuestion = mathutil.getMaximum(correctedQuestionsInHighestScore);
		getHigestPoints = assessmentsPage.getRoboPointsForAllAssignmentScoreStrategy(highestValueOfCorrectedQuestion);
		//get average score
		getAveragePoints = assignmentAvgScore.getRoboPointForAverageScoreForAllScoreStrategy(questionsCorrect1stattemptFromCASAverageScore, questionsCorrect2ndattemptFromCASAverageScore)
		//get average with drop lowest
		var correctedQuestionInDropLowest = [questionsCorrect1stattemptFromCASAverageDropLowestScore, questionsCorrect2ndattemptFromCASAverageDropLowestScore];
		highestValueOfCorrectedQuestionInDropLowest = mathutil.getMaximum(correctedQuestionInDropLowest);
		getAverageDropLowestPoint = assessmentsPage.getRoboPointsForAllAssignmentScoreStrategy(highestValueOfCorrectedQuestionInDropLowest);
		//all consoles
		console.log(report.reportHeader() +
			report.stepStatusWithData("Points for Highest score " + getHigestPoints + ", for average " + getAveragePoints + " and for average with drop lowest ", getAverageDropLowestPoint, "success") +
			report.reportFooter());
		done();
	});


	it(". [Student Gradebook]:: Validate the highest Points earned by the student for assignment with high score strategy", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		console.log("getHigestPoints" + getHigestPoints);
		studenGradebookPage.getScoredPoints(browser, assessmentNameForHignScore).then(function(valueScore) {
			if (!mathutil.isEmpty(valueScore)) {
				if (parseInt(valueScore) == getHigestPoints) {
					pointsFromStudentGradebook = valueScore;
					console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated Highest point score " + getHigestPoints + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "success") + report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated Highest point score " + getHigestPoints + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "failure") + report.reportFooter());
				}
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : get point score from element is empty ", valueScore, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". [Student Gradebook]:: Validate the average Points earned by the student for assignment with average score strategy", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.getScoredPoints(browser, assessmentNameForAverageScore).then(function(valueScore) {
			if (!mathutil.isEmpty(valueScore)) {
				if (parseInt(valueScore) == parseInt(getAveragePoints)) {
					pointsFromStudentGradebook = valueScore;
					console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated average point score " + getAveragePoints + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "success") + report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated average point score " + getAveragePoints + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "failure") + report.reportFooter());
				}

			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : get point score from element is empty ", valueScore, "failure") +
					report.reportFooter());
			}

		});
	});

	it(". [Student Gradebook]:: Validate the average Points earned by the student for assignment with average score drop lowest strategy", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.getScoredPoints(browser, assessmentNameForAverageScoreWithDropLowest).then(function(valueScore) {
			if (!mathutil.isEmpty(valueScore)) {
				if (parseInt(valueScore) == parseInt(getAverageDropLowestPoint)) {
					pointsFromStudentGradebook = valueScore;
					console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated average score with drop lowest point score " + getAverageDropLowestPoint + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "success") + report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated average score with drop lowest point score " + getAverageDropLowestPoint + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "failure") + report.reportFooter());
				}

			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : get point score from element is empty ", valueScore, "failure") +
					report.reportFooter());
			}

		});
	});

	it(". Validate the presence of Class average value for assignment with high score strategy on student gradebook", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		classAverageScoreAfterAllAttemptsForHignScore = getHigestPoints / parseInt(totalsudentcount);
		console.log("getHigestPoints" + getHigestPoints);
		console.log("classAverageScoreAfterAllAttemptsForHignScore" + classAverageScoreAfterAllAttemptsForHignScore);
		// browser
		// 	.waitForElementsByXPath("//span[text()='" + assessmentNameForHignScore + "']/parent::td[@class='assignment-col']/parent::tr", asserters.isDisplayed, 60000)
		// 	.then(function(assignmentRows) {
		// 		assignmentRows[0].elementByCss("td.avg-col div.left-of-pipe span").text()
					studenGradebookPage.getClassAveragePoint(browser, assessmentNameForHignScore).then(function(valueofclassavg) {
					if (!mathutil.isEmpty(valueofclassavg)) {
						if (parseInt(valueofclassavg) == classAverageScoreAfterAllAttemptsForHignScore) {
							console.log(report.reportHeader() +
								report.stepStatusWithData("GRADEBOOK : Test Robo Class average " + classAverageScoreAfterAllAttemptsForHignScore + " is compared with", valueofclassavg, "success") +
								report.reportFooter());
							done();
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("GRADEBOOK : Test Robo Class average " + classAverageScoreAfterAllAttemptsForHignScore + " is compared with", valueofclassavg, "failure") +
								report.reportFooter());
						}
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : Class average score fetched from element is empty ", valueofclassavg, "failure") +
							report.reportFooter());
					}
				});

	});

	it(". Validate the presence of Class average value for assignment with average score on student gradebook", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		classAverageScoreAfterAllAttemptsForAverageScore = getAveragePoints / parseInt(totalsudentcount);
		console.log("getAveragePoints" + getAveragePoints);
		console.log("classAverageScoreAfterAllAttemptsForAverageScore" + classAverageScoreAfterAllAttemptsForAverageScore);
		// browser
		// 	.waitForElementsByXPath("//span[text()='" + assessmentNameForAverageScore + "']/parent::td[@class='assignment-col']/parent::tr", asserters.isDisplayed, 60000)
		// 	.then(function(assignmentRows) {
		// 		assignmentRows[0].elementByCss("td.avg-col div.left-of-pipe span").text()
			studenGradebookPage.getClassAveragePoint(browser, assessmentNameForAverageScore).then(function(valueofclassavg) {
					if (!mathutil.isEmpty(valueofclassavg)) {
						if (parseInt(valueofclassavg) == classAverageScoreAfterAllAttemptsForAverageScore) {
							console.log(report.reportHeader() +
								report.stepStatusWithData("GRADEBOOK : Test Robo Class average " + classAverageScoreAfterAllAttemptsForAverageScore + " is compared with", valueofclassavg, "success") +
								report.reportFooter());
							done();
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("GRADEBOOK : Test Robo Class average " + classAverageScoreAfterAllAttemptsForAverageScore + " is compared with", valueofclassavg, "failure") +
								report.reportFooter());
						}
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : Class average score fetched from element is empty ", valueofclassavg, "failure") +
							report.reportFooter());
					}
				});

	});

	it(". Validate the presence of Class average value for assignment with drop lowest strategy on student gradebook", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		classAverageScoreAfterAllAttemptsForAverageScoreWithDropLowest = getAverageDropLowestPoint / parseInt(totalsudentcount);
		console.log("getAverageDropLowestPoint" + getAverageDropLowestPoint);
		console.log("classAverageScoreAfterAllAttemptsForAverageScoreWithDropLowest" + classAverageScoreAfterAllAttemptsForAverageScoreWithDropLowest);
		// browser
		// 	.waitForElementsByXPath("//span[text()='" + assessmentNameForAverageScoreWithDropLowest + "']/parent::td[@class='assignment-col']/parent::tr", asserters.isDisplayed, 60000)
		// 	.then(function(assignmentRows) {
		// 		assignmentRows[0].elementByCss("td.avg-col div.left-of-pipe span").text()
					studenGradebookPage.getClassAveragePoint(browser, assessmentNameForAverageScoreWithDropLowest).then(function(valueofclassavg) {
					if (!mathutil.isEmpty(valueofclassavg)) {
						if (parseInt(valueofclassavg) == classAverageScoreAfterAllAttemptsForAverageScoreWithDropLowest) {
							console.log(report.reportHeader() +
								report.stepStatusWithData("GRADEBOOK : Test Robo Class average " + classAverageScoreAfterAllAttemptsForAverageScoreWithDropLowest + " is compared with", valueofclassavg, "success") +
								report.reportFooter());
							done();
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("GRADEBOOK : Test Robo Class average " + classAverageScoreAfterAllAttemptsForAverageScoreWithDropLowest + " is compared with", valueofclassavg, "failure") +
								report.reportFooter());
						}
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : Class average score fetched from element is empty ", valueofclassavg, "failure") +
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
	it(". Wait until page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Gradebook page is loaded");
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
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Student detailed page is loaded");
		});
	});

	it(". Wait until page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Validate presence of class average value on student detailed page for assessment with high score on instructor GradeBook view ", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3);
		instructorGradebookStudentDetailedPage.validatePresenceOfAverageScore(browser, assessmentNameForHignScore).then(function(classAvg) {
			if (parseInt(classAvg) == classAverageScoreAfterAllAttemptsForHignScore) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment on student detailed GradeBook view ::  " + classAvg, "is compared against the calculated class average ::" + classAverageScoreAfterAllAttemptsForHignScore, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment on student detailed GradeBook view ::  " + classAvg, "is compared against the calculated class average ::" + classAverageScoreAfterAllAttemptsForHignScore, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate presence of class average value on student detailed page for assessment with average score on instructor GradeBook view ", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3);
		instructorGradebookStudentDetailedPage.validatePresenceOfAverageScore(browser, assessmentNameForAverageScore).then(function(classAvg) {
			if (parseInt(classAvg) == classAverageScoreAfterAllAttemptsForAverageScore) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment on student detailed GradeBook view ::  " + classAvg, "is compared against the calculated class average ::" + classAverageScoreAfterAllAttemptsForAverageScore, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment on student detailed GradeBook view ::  " + classAvg, "is compared against the calculated class average ::" + classAverageScoreAfterAllAttemptsForAverageScore, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate presence of class average value on student detailed page for assessment with average score with drop lowest on instructor GradeBook view ", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3);
		instructorGradebookStudentDetailedPage.validatePresenceOfAverageScore(browser, assessmentNameForAverageScoreWithDropLowest)
			.then(function(classAvg) {
				if (parseInt(classAvg) == classAverageScoreAfterAllAttemptsForAverageScoreWithDropLowest) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment on student detailed GradeBook view ::  " + classAvg + ", is compared against the calculated class average ::", classAverageScoreAfterAllAttemptsForAverageScoreWithDropLowest, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment on student detailed GradeBook view ::  " + classAvg + ", is compared against the calculated class average ::", classAverageScoreAfterAllAttemptsForAverageScoreWithDropLowest, "failure") +
						report.reportFooter());
				}
			});
	});

	it(". [Gradebook] Verify whether the system generated student point score for assignment with high score is updated on Instructor GradeBook on the Student Detailed Results Page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3);
		instructorGradebookStudentDetailedPage.getScoredPoints(browser, assessmentNameForHignScore)
			.then(function(scoredPoints) {
				if (parseInt(scoredPoints) == getHigestPoints) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + getHigestPoints + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + getHigestPoints + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "failure") +
						report.reportFooter());
				}

			});
	});

	it(". [Gradebook] Verify whether the system generated student point score for assignment with average score is updated on Instructor GradeBook on the Student Detailed Results Page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3);
		instructorGradebookStudentDetailedPage.getScoredPoints(browser, assessmentNameForAverageScore)
			.then(function(scoredPoints) {
				if (parseInt(scoredPoints) == getAveragePoints) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + getAveragePoints + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + getAveragePoints + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "failure") +
						report.reportFooter());
				}

			});
	});

	it(". [Gradebook] Verify whether the system generated student point score for assignment with average score with drop lowest is updated on Instructor GradeBook on the Student Detailed Results Page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3);
		instructorGradebookStudentDetailedPage.getScoredPoints(browser, assessmentNameForAverageScoreWithDropLowest)
			.then(function(scoredPoints) {
				if (parseInt(scoredPoints) == getAverageDropLowestPoint) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + getAverageDropLowestPoint + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + getAverageDropLowestPoint + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "failure") +
						report.reportFooter());
				}

			});
	});

	it(". Navigate to Assignments page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userType = "instructor";
		menuPage.selectAssignments(userType, browser, done);
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
