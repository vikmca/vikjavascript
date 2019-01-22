require('colors');
var wd = require('wd');
var _ = require('underscore');
var asserters = wd.asserters;
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var dataUtil = require("../../../util/date-utility");
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var recursiveFnPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/recursiveFnPagepo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var menuPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var calendarNavigation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/navigationpo");
var assessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assessmentspo");
var mediaquizpage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/mediaQuizpo");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var studentAssessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var studenGradebookPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/student/gradebookValidationpo");
var assessmentData = require("../../../../../test_data/assignments/assessments.json");
var session = require("../../../support/setup/browser-session");
var testData = require("../../../../../test_data/data.json");
var instructorGradebookNavigationPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/gradebookNavigationpo");
var instructorMainGradebookView = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/mainGradebookView");
var arraymediaQuizActivity = [];
var courseHelper = require("../../../support/helpers/courseHelper");
var practiceQuizCreation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var tocPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/tocpo");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var instructorGradebookStudentDetailedPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/studentDetailedInfopo");
var report = require("../../../support/reporting/reportgenerator");
var casPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var instructorAssessmentDetailedInfopo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/assessmentDetailedInfopo");
var mathutil = require("../../../util/mathUtil");
var pageLoadingTime;
var countOfQuestion;
var score;
var attempts;
var path = require('path');
var scriptName = path.basename(__filename);

describe(scriptName + 'MEDIA QUIZ  ASSIGNMENT WITH DROP LOWEST SCORE TEST STRATEGY VALIDATION', function() {
	var browser;
	var allPassed = true;
	var userType;
	var setDate;
	var courseName;
	var selectedActivityText;
	var assignmentCreationStatus = "failure";
	var previewQuestionText;
	var product;
	var totalTime;
	var questionsCorrectFromCAS;
	var scoreFromStudentGradebook;
	var totalQuestionsInTheQuiz;
	var serialNumber = 0;
	var errorStatusOnPreview;
	var errorStatusAfterAssignmentLaunched;
	var totalsudentcount;
	var roboPoints;
	var PercentangeRoboPoints;
	var highestScoreForAllStudents;
	var totalValueOfScoresForAllStudents = 0;
	var questionsCorrectFromCAS2;
	var questionsCorrectFromCAS3;
	var totalQuestionsInTheQuiz2;
	var totalQuestionsInTheQuiz3;
	var averageScore;
	var correctQuestionArray;
	var highestValueOfCorrectedQuestion;
	var getPoints;
	var highestPoints;

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
		console.log(report.formatTestName("MEDIA QUIZ ASSIGNMENT WITH HIGH SCORE TEST STRATEGY VALIDATION"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***validateHighScoreMediaQuiz.js***"));
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
		this.timeout(courseHelper.getElevatedTimeout());
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

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Delete created assignment", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		assessmentsPage.deleteAssignment(browser, done);
	});

	it(". Wait for page load", function(done) {
		browser.refresh().sleep(4000).then(function(){
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Select current date and open Media Quiz Type assignment settings page", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.handleTheFlashAlert(browser).then(function() {
			calendarNavigation.selectADateForAssignment(browser).
			then(function() {
				mediaquizpage.selectMediaQuizTypeAssignment(browser).then(function() {
					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Media Quiz type assignment is selected");
				});
			});
		});
	});

	it(". Verify the preview and save buttons are disabled until user fills all the mandatory fields under setting panel", function(done) {
		mediaquizpage.verifyPreviewButtonStatus(browser).then(function() {
			mediaquizpage.verifySaveButtonStatus(browser).then(function(saveButtonStatus) {
				if (saveButtonStatus === "true") {
					console.log(report.reportHeader() +
						report.stepStatusWithData("[Media Quiz] :  save button is disabled and status is", saveButtonStatus, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("[Media Quiz] :  save button is enabled and status is", saveButtonStatus, "failure") +
						report.reportFooter());
				}
			});
		});
	});

	it(". Complete the Media Quiz form(with high score strategy) under Setting tab for system created assignment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.enterName(browser).then(function() {
			assessmentsPage.validateDueAndRevealDateText(browser, assessmentData.systemgenerated.mediaquiz.dueRevealDate).then(function() {
				mediaquizpage.selectChapterForMediaQuiz(browser, assessmentData.systemgenerated.mediaquiz.chapter).then(function() {
					assessmentsPage.enterScore(browser, assessmentData.systemgenerated.scorestrategyhigh.score).then(function() {
						assessmentsPage.selectAttempts(browser, assessmentData.systemgenerated.scorestrategyAverage.attempts).then(function() {
							assessmentsPage.selectScoreStrategy(browser, assessmentData.systemgenerated.scorestrategyhigh.scoreStrategy).then(function() {
									mediaquizpage.getTextOfSelectedActivity(browser, assessmentData.systemgenerated.mediaquiz.chapter).then(function(activityText) {
										selectedActivityText = activityText;
										console.log(report.reportHeader() +
											report.stepStatusWithData("Assessment form has been filled by chapter :" +
												assessmentData.systemgenerated.mediaquiz.chapter + ", Score :" +
												assessmentData.systemgenerated.scorestrategyhigh.score + ", Number Of Attempts :" +
												assessmentData.systemgenerated.scorestrategyhigh.attempts + ", Due reveal date :" +
												assessmentData.systemgenerated.mediaquiz.dueRevealDate + ", Score Strategy : Average(" +
												assessmentData.systemgenerated.scorestrategyAverage.scoreStrategy, "success") +
											report.reportFooter());
										console.log(report.reportHeader() +
											report.stepStatusWithData("[Media Quiz] : Selected activity is on media quiz preview", selectedActivityText, "success") +
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

	it(". Save the Media Quiz Assignment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});

	it(". Verify if media quiz assignment saves successfully", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		assessmentsPage.checkIfAssignmentSaved(browser).then(function(value) {
			if (value.toString() === "rgb(236, 41, 142)") {
				assignmentCreationStatus = "success";
				console.log(report.reportHeader() +
					report.stepStatusWithData("[Media Quiz] : Instructor created an media quiz type assignment called :: ", assessmentsPage.getAssignmentName(), "success") +
					report.reportFooter());
				done();
			} else {
				assignmentCreationStatus = "failure";
				console.log(report.reportHeader() +
					report.stepStatusWithData("[Media Quiz] : Instructor created an media quiz type assignment called :: ", assessmentsPage.getAssignmentName() + " may not have received the assessmentCGI", "failure") +
					report.reportFooter());
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


	it(". Log out as Instructor", function(done) {
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

	it(". Click on the current date cell", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickCurrentDateCell(browser, done);
	});

	it(". Launch the media quiz for first time", function(done) {
		pageLoadingTime = 0;
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.launchAssignment(browser, assessmentsPage.getAssignmentName()).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is launched");
		});
	});

	it(". LTR-4699 Validate error message should not be display on launching the Media Quiz Assignment at student end", function(done) {
		mediaquizpage.verifyErrorMessageOnPreview(browser).then(function(status) {
			errorStatusAfterAssignmentLaunched = status;
			if (errorStatusAfterAssignmentLaunched) {
				mediaquizpage.getErrorMessageOnPreview(browser).text().then(function(errorText) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("CAS error message is displaying n launching the assessment at student end and text is " + errorText, "failure") +
						report.reportFooter());
				});
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("No CAS error message is displaying and status is " + errorStatusAfterAssignmentLaunched, "success") +
					report.reportFooter());
				done();
			}
		});
	});

	it(". Verify the video is present at student end for Media Quiz Assignment", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {
			mediaquizpage.validateIfPreviewVideoIsPresent(browser).then(function(videoPresenceStatus) {
				if (videoPresenceStatus) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("[Media Quiz] : Video is presesnt at student end", videoPresenceStatus, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("[Media Quiz] : Video is presesnt at student end", videoPresenceStatus, "success") +
						report.reportFooter());
				}
			});
		}
	});

	it(". Click on '?' button and verify presence of questions and log first question text", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {

			mediaquizpage.clickOnQuestionMark(browser, 1).then(function() {
				mediaquizpage.validateIfPreviewQuestionsIsPresent(browser).then(function() {
					mediaquizpage.validateQuestionOnPreviewTab(browser).text().then(function(questionText) {
						previewQuestionText = questionText;
						console.log(report.reportHeader() +
							report.stepStatusWithData("[Media Quiz] : First question appears on media quiz preview tab :: ", previewQuestionText, "success") +
							report.reportFooter());
						done();
					});
				});
			});
		}
	});

	it(". Attempt all the questions on the first cue then click on 'Score' and 'Continue Video' button", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {
			recursiveFnPage.takeMediaQuizAtStudent(browser, done);
		}
	});

	it(". Click on second question cue", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {

			mediaquizpage.clickOnQuestionMark(browser, 2).then(function() {
				done();
			});
		}
	});



	it(". Attempt all the questions on the second cue then click on 'Score' and 'Continue Video' button", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {
			recursiveFnPage.takeMediaQuizAtStudent(browser, done);
		}
	});

	it(". Click on third question cue", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {
			mediaquizpage.clickOnQuestionMark(browser, 3).then(function() {
				done();
			});
		}
	});


	it(". Attempt all the questions on the third Cue then click on 'Score' and 'Continue Video' button", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {
			recursiveFnPage.takeMediaQuizAtStudent(browser, done);
		}
	});

	it(". Verify the Submit button is present when user completes all the questions on all cues", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {
			this.retries(4);
			mediaquizpage.checkIfSubmitButtonIsPresent(browser).text().then(function(submitButtonText) {
				mediaquizpage.clickOnSubmitButton(browser).then(function() {
					if (submitButtonText = assessmentData.systemgenerated.mediaquiz.submit) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("[Media Quiz] : Submit Button is present when user completes all the questions on all cues", submitButtonText, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("[Media Quiz] : Submit Button is present when user completes all the questions on all cues", submitButtonText, "success") +
							report.reportFooter());
					}
				});
			});
		}
	});

	it(". Validate the presence of result, fetch correct answers and total questions from the quiz", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {
			casPage.getQuestionsCorrect(browser).then(function(questionsCorrect) {
				console.log("Total Questions Correct " + questionsCorrect);
				questionsCorrectFromCAS = parseInt(questionsCorrect);
				studentAssignmentCompletionStatus = "success";
				console.log(report.reportHeader() +
					report.stepStatusWithData("CAS : Student Completed the assignment  questions and got a score of  ", questionsCorrectFromCAS, "success") +
					report.reportFooter());
				practiceQuizCreation.getTotalQuestions(browser).then(function(TotalQuestions) {
					totalQuestionsInTheQuiz = TotalQuestions;
					console.log(report.reportHeader() +
						report.stepStatusWithData("Total number of questions in this quiz were " + TotalQuestions, "success") +
						report.reportFooter());
					done();
				});
			});
		}
	});

	it(". Click on exit button", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {
			pageLoadingTime = 0;
			mediaquizpage.clickOnExitButton(browser).then(function() {
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is attempted");
			});
		}
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

	it(". LTR-5329 :: Validate Assessment(Media Quiz) coulum should not disappear from the Student gradebook page ", function(done) {
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

	it(". [Gradebook]Validate the Points earned by the student", function(done) {
		this.retries(3);
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		roboPoints = assessmentsPage.getRoboPointScoreForMediaQuiz(questionsCorrectFromCAS, totalQuestionsInTheQuiz);
		PercentangeRoboPoints = mathutil.getScorePercentage(questionsCorrectFromCAS, totalQuestionsInTheQuiz);
		studenGradebookPage.getScoredPoints(browser, assessmentsPage.getAssignmentName()).then(function(valueScore) {
			if (valueScore.toString() === assessmentsPage.getRoboPointScoreForMediaQuiz(questionsCorrectFromCAS, totalQuestionsInTheQuiz)) {
				var pointsFromStudentGradebook = valueScore;
				console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + assessmentsPage.getRoboPointScoreForMediaQuiz(questionsCorrectFromCAS, totalQuestionsInTheQuiz) + " points, is compared against the student point score retrieved from Student Gradebook ", valueScore, "success") + report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + assessmentsPage.getRoboPointScoreForMediaQuiz(questionsCorrectFromCAS, totalQuestionsInTheQuiz) + " points, is compared against the student point score retrieved from Student Gradebook ", valueScore, "failure") + report.reportFooter());
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

	it(". Validate the presence of Class average value on student GradeBook for Media Quiz Assignment", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.validateAvgScoreOnStudentGradebookForMediaQuiz(browser, assessmentsPage.getAssignmentName(), roboPoints, done);
	});


	it(". Validate the presence of submission date on student Gradebook page for Media Quiz Assignment", function(done) {
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

	it(". Validate the presence of due date on student GradeBbook page for Media Quiz Assignment", function(done) {
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

	it(". Navigate to Assignments page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Click on the current date cell for taking 2nd attempt", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickCurrentDateCell(browser, done);
	});

	it(". Launch the assignment for taking 2nd attempt", function(done) {
		pageLoadingTime = 0;
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.launchAssignment(browser, assessmentsPage.getAssignmentName()).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is launched");
		});
	});

	it(". LTR-4699 Validate error message should not be display on launching the Media Quiz at student end", function(done) {
		mediaquizpage.verifyErrorMessageOnPreview(browser).then(function(status) {
			errorStatusAfterAssignmentLaunched = status;
			if (errorStatusAfterAssignmentLaunched) {
				mediaquizpage.getErrorMessageOnPreview(browser).text().then(function(errorText) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("CAS error message is displaying n launching the Media Quiz at student end and text is " + errorText, "failure") +
						report.reportFooter());
				});
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("No CAS error message is displaying on launching the Media Quiz and status is " + errorStatusAfterAssignmentLaunched, "success") +
					report.reportFooter());
				done();
			}
		});
	});

	it(". [Media Quiz] Verify the video is present at student end for Media Quiz Assignment", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {
			mediaquizpage.validateIfPreviewVideoIsPresent(browser).then(function(videoPresenceStatus) {
				if (videoPresenceStatus) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("[Media Quiz] : Video is presesnt at student end", videoPresenceStatus, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("[Media Quiz] : Video is presesnt at student end", videoPresenceStatus, "success") +
						report.reportFooter());
				}
			});
		}
	});

	it(". Click on '?' button and verify presence of questions and log first question text", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {

			mediaquizpage.clickOnQuestionMark(browser, 1).then(function() {
				mediaquizpage.validateIfPreviewQuestionsIsPresent(browser).then(function() {
					mediaquizpage.validateQuestionOnPreviewTab(browser).text().then(function(questionText) {
						previewQuestionText = questionText;
						console.log(report.reportHeader() +
							report.stepStatusWithData("[Media Quiz] : First question appears on media quiz preview tab :: ", previewQuestionText, "success") +
							report.reportFooter());
						done();
					});
				});
			});
		}
	});

	it(". Attempt all the questions on the first cue then click on 'Score' and 'Continue Video' button", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {
			recursiveFnPage.takeMediaQuizAtStudent(browser, done);
		}
	});

	it(". Click on second question cue", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {

			mediaquizpage.clickOnQuestionMark(browser, 2).then(function() {
				done();
			});
		}
	});



	it(". Attempt all the questions on the second cue then click on 'Score' and 'Continue Video' button", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {
			recursiveFnPage.takeMediaQuizAtStudent(browser, done);
		}
	});

	it(". Click on third question cue", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {
			mediaquizpage.clickOnQuestionMark(browser, 3).then(function() {
				done();
			});
		}
	});


	it(". Attempt all the questions on the third Cue then click on 'Score' and 'Continue Video' button", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {
			recursiveFnPage.takeMediaQuizAtStudent(browser, done);
		}
	});

	it(". Verify the Submit button is present when user completes all the questions on all cues", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {
			this.retries(4);
			mediaquizpage.checkIfSubmitButtonIsPresent(browser).text().then(function(submitButtonText) {
				mediaquizpage.clickOnSubmitButton(browser).then(function() {
					if (submitButtonText = assessmentData.systemgenerated.mediaquiz.submit) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("[Media Quiz] : Submit Button is present when user completes all the questions on all cues", submitButtonText, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("[Media Quiz] : Submit Button is present when user completes all the questions on all cues", submitButtonText, "success") +
							report.reportFooter());
					}
				});
			});
		}
	});

	it(". Validate the presence of result, fetch correct answers and total questions from the quiz", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {
			casPage.getQuestionsCorrect(browser).then(function(questionsCorrect) {
				console.log("Total Questions Correct " + questionsCorrect);
				questionsCorrectFromCAS2 = parseInt(questionsCorrect);
				studentAssignmentCompletionStatus = "success";
				console.log(report.reportHeader() +
					report.stepStatusWithData("CAS : Student Completed the assignment  questions and got a score of  ", questionsCorrectFromCAS, "success") +
					report.reportFooter());
				practiceQuizCreation.getTotalQuestions(browser).then(function(TotalQuestions) {
					totalQuestionsInTheQuiz2 = TotalQuestions;
					console.log(report.reportHeader() +
						report.stepStatusWithData("Total number of questions in this quiz were " + TotalQuestions, "success") +
						report.reportFooter());
					done();
				});
			});
		}
	});

	it(". Click on exit button", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {
			pageLoadingTime = 0;
			mediaquizpage.clickOnExitButton(browser).then(function() {
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is attempted");
			});
		}
	});

it(". Click on the current date cell", function(done) {
	if (assignmentCreationStatus === "failure") {
		this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
	}
	studentAssessmentsPage.clickCurrentDateCell(browser, done);
});

it(". Launch the assignment", function(done) {
	pageLoadingTime = 0;
	if (assignmentCreationStatus === "failure") {
		this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
	}
	studentAssessmentsPage.launchAssignment(browser, assessmentsPage.getAssignmentName()).then(function() {
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is launched");
	});
});

it(". LTR-4699 Validate error message should not be display on launching the assessment at student end", function(done) {
	mediaquizpage.verifyErrorMessageOnPreview(browser).then(function(status) {
		errorStatusAfterAssignmentLaunched = status;
		if (errorStatusAfterAssignmentLaunched) {
			mediaquizpage.getErrorMessageOnPreview(browser).text().then(function(errorText) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("CAS error message is displaying n launching the assessment at student end and text is " + errorText, "failure") +
					report.reportFooter());
			});
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("No CAS error message is displaying and status is " + errorStatusAfterAssignmentLaunched, "success") +
				report.reportFooter());
			done();
		}
	});
});

it(". Verify the video is present at student end for Media Quiz Assignment", function(done) {
	if (errorStatusAfterAssignmentLaunched) {
		console.log(report.reportHeader() +
			report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
			report.reportFooter());
		this.skip();
	} else {
		mediaquizpage.validateIfPreviewVideoIsPresent(browser).then(function(videoPresenceStatus) {
			if (videoPresenceStatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[Media Quiz] : Video is presesnt at student end", videoPresenceStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[Media Quiz] : Video is presesnt at student end", videoPresenceStatus, "success") +
					report.reportFooter());
			}
		});
	}
});

it(". Click on '?' button and verify presence of questions and log first question text", function(done) {
	if (errorStatusAfterAssignmentLaunched) {
		console.log(report.reportHeader() +
			report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
			report.reportFooter());
		this.skip();
	} else {

		mediaquizpage.clickOnQuestionMark(browser, 1).then(function() {
			mediaquizpage.validateIfPreviewQuestionsIsPresent(browser).then(function() {
				mediaquizpage.validateQuestionOnPreviewTab(browser).text().then(function(questionText) {
					previewQuestionText = questionText;
					console.log(report.reportHeader() +
						report.stepStatusWithData("[Media Quiz] : First question appears on media quiz preview tab :: ", previewQuestionText, "success") +
						report.reportFooter());
					done();
				});
			});
		});
	}
});

it(". Attempt all the questions on the first cue then click on 'Score' and 'Continue Video' button", function(done) {
	if (errorStatusAfterAssignmentLaunched) {
		console.log(report.reportHeader() +
			report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
			report.reportFooter());
		this.skip();
	} else {
		recursiveFnPage.takeMediaQuizAtStudent(browser, done);
	}
});

it(". Click on second question cue", function(done) {
	if (errorStatusAfterAssignmentLaunched) {
		console.log(report.reportHeader() +
			report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
			report.reportFooter());
		this.skip();
	} else {

		mediaquizpage.clickOnQuestionMark(browser, 2).then(function() {
			done();
		});
	}
});



it(". Attempt all the questions on the second cue then click on 'Score' and 'Continue Video' button", function(done) {
	if (errorStatusAfterAssignmentLaunched) {
		console.log(report.reportHeader() +
			report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
			report.reportFooter());
		this.skip();
	} else {
		recursiveFnPage.takeMediaQuizAtStudent(browser, done);
	}
});

it(". Click on third question cue", function(done) {
	if (errorStatusAfterAssignmentLaunched) {
		console.log(report.reportHeader() +
			report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
			report.reportFooter());
		this.skip();
	} else {
		mediaquizpage.clickOnQuestionMark(browser, 3).then(function() {
			done();
		});
	}
});


it(". Attempt all the questions on the third Cue then click on 'Score' and 'Continue Video' button", function(done) {
	if (errorStatusAfterAssignmentLaunched) {
		console.log(report.reportHeader() +
			report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
			report.reportFooter());
		this.skip();
	} else {
		recursiveFnPage.takeMediaQuizAtStudent(browser, done);
	}
});

it(". Verify the Submit button is present when user completes all the questions on all cues", function(done) {
	if (errorStatusAfterAssignmentLaunched) {
		console.log(report.reportHeader() +
			report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
			report.reportFooter());
		this.skip();
	} else {
		this.retries(4);
		mediaquizpage.checkIfSubmitButtonIsPresent(browser).text().then(function(submitButtonText) {
			mediaquizpage.clickOnSubmitButton(browser).then(function() {
				if (submitButtonText = assessmentData.systemgenerated.mediaquiz.submit) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("[Media Quiz] : Submit Button is present when user completes all the questions on all cues", submitButtonText, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("[Media Quiz] : Submit Button is present when user completes all the questions on all cues", submitButtonText, "success") +
						report.reportFooter());
				}
			});
		});
	}
});

it(". Validate the presence of result, fetch correct answers and total questions from the quiz", function(done) {
	if (errorStatusAfterAssignmentLaunched) {
		console.log(report.reportHeader() +
			report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
			report.reportFooter());
		this.skip();
	} else {
		casPage.getQuestionsCorrect(browser).then(function(questionsCorrect) {
			console.log("Total Questions Correct " + questionsCorrect);
			questionsCorrectFromCAS3 = parseInt(questionsCorrect);
			studentAssignmentCompletionStatus = "success";
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS : Student Completed the assignment  questions and got a score of  ", questionsCorrectFromCAS, "success") +
				report.reportFooter());
			practiceQuizCreation.getTotalQuestions(browser).then(function(TotalQuestions) {
				totalQuestionsInTheQuiz3 = TotalQuestions;
				console.log(report.reportHeader() +
					report.stepStatusWithData("Total number of questions in this quiz were " + TotalQuestions, "success") +
					report.reportFooter());
				done();
			});
		});
	}
});

it(". Click on exit button", function(done) {
	if (errorStatusAfterAssignmentLaunched) {
		console.log(report.reportHeader() +
			report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
			report.reportFooter());
		this.skip();
	} else {
		pageLoadingTime = 0;
		mediaquizpage.clickOnExitButton(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is attempted");
		});
	}
});

it(". Get Highest Score value for Media Quiz Assignment", function(done) {
	if (errorStatusAfterAssignmentLaunched) {
		console.log(report.reportHeader() +
			report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
			report.reportFooter());
		this.skip();
	} else {
		var totalPoints = assessmentData.systemgenerated.scorestrategyhigh.score;
		var numbers = [questionsCorrectFromCAS, questionsCorrectFromCAS2, questionsCorrectFromCAS3];
		correctQuestionArray = numbers;
		highestValueOfCorrectedQuestion = mathutil.getMaximum(numbers);
		highestPoints=assessmentsPage.getRoboPointScoreForMediaQuiz(highestValueOfCorrectedQuestion, totalQuestionsInTheQuiz);
		// getPoints = assessmentsPage.getRoboPointScore(highestValueOfCorrectedQuestion);
		console.log(report.reportHeader() +
			report.stepStatusWithData("Highest corrected question "+highestValueOfCorrectedQuestion+" and highest Points :: ",highestPoints, "success") +
			report.reportFooter());
		done();
	}
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

it(". LTR-5329 :: Validate assignment coulum should not disappear from the Student gradebook page for Media Quiz Assignment", function(done) {
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

it(". [Gradebook] Validate the Points earned by the student for Media Quiz Assignment", function(done) {
	this.retries(3);
	browser.refresh().sleep(5000);
	if (assignmentCreationStatus === "failure") {
		this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
	}
	studenGradebookPage.getScoredPoints(browser, assessmentsPage.getAssignmentName()).then(function(valueScore) {
		if (valueScore.toString() === highestPoints) {
			var pointsFromStudentGradebook = valueScore;
			console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + highestPoints + " points, is compared against the student point score retrieved from Student Gradebook ", valueScore, "success") + report.reportFooter());
			done();
		} else {
			console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + highestPoints + " points, is compared against the student point score retrieved from Student Gradebook ", valueScore, "failure") + report.reportFooter());
		}
	});
});

it(". [Gradebook] Validate the Score(Questions Correct) is not present from Student Gradebook table for Media Quiz Assignment", function(done) {
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

it(". Validate the presence of Class average value on student GradeBook for Media Quiz Assignment", function(done) {
	if (assignmentCreationStatus === "failure") {
		this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
	}
	studenGradebookPage.validateAvgScoreOnStudentGradebookForMediaQuiz(browser, assessmentsPage.getAssignmentName(), highestPoints, done);
});


it(". Validate the presence of submission date on student Gradebook page for Media Quiz Assignment", function(done) {
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

it(". Validate the presence of due date on student GradeBbook page for Media Quiz Assignment", function(done) {
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
		loginPage.launchACourse("instructor", courseName, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Navigate on Gradebook page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});



	it(". Validate the Export button presence status on different browser", function(done) {
		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) === "iOS") {
			console.log("This feature is not implemented for iOS");
			this.skip();
		} else {
			instructorGradebookNavigationPage.validateExportButton(browser, done);
		}
	});


	it(". Retrieve count of registered student for the launched courses present on ", function(done) {
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

	it(". Calculate class average for a particular Media Quiz Assignment ", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		highestScoreForAllStudents = ((highestPoints * 10 / parseInt(totalsudentcount) * 10) / 10) / 10;
		console.log(report.reportHeader() +
			report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment calculated and is coming out to be ::  " + highestScoreForAllStudents, "success") +
			report.reportFooter());
		done();
	});
	//LTR-5346 won't fix
	it(". LTR-5346 Verify the presence of total point is zero untill the due date has not passed on the Instructor GradeBook on the GradeBook table for Media Quiz Assignment", function(done) {
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

	it(". LTR-5346 Verify the presence of point gained by the student is reflected 0 on total points until assignment due date has not passed for Media Quiz Assignment", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		data = loginPage.setLoginData("student");
		console.log("loginPage.getUserName()" + loginPage.getUserName());
		instructorMainGradebookView.getPointsGainedByStudent(browser, loginPage.getUserName())
			.then(function(pointsGained) {
				console.log(" ....... >>>>  " + pointsGained + " === assessmentsPage.getRoboPointScore(questionsCorrectFromCAS)");
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

	it(". Verify the presence of point of assignments gained by the student for Media Quiz Assignment", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorMainGradebookView.getScoreText(browser, 1)
			.then(function(pointsGainedByStudent) {
				var totalPointsGained = pointsGainedByStudent;
				if (totalPointsGained.indexOf(highestScoreForAllStudents) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Total points earned by student " + totalPointsGained + ", is compared against the testbot calculated total points earned ", highestScoreForAllStudents, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Total points earned by student " + totalPointsGained + ", is compared against the testbot calculated total points earned ", highestScoreForAllStudents, "failure") +
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

	it(". Wait until page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". LTR-5329 :: Validate Media Quiz Assignment column should not disappear from the instructor's student detailed page", function(done) {
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

	it(". LTR-5378 : Validate Media Quiz Assignment name should be clickable", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.assignmentNameClickableStatus(browser, assessmentsPage.getAssignmentName()).then(function(assignmentNameClickableStatus) {
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

	it(". Validate presence of class average value on student detailed page on instructor gradebook view for Media Quiz Assignment", function(done) {
		if (assignmentCreationStatus === "failure" && assignmentNameClickableStatusAfterAttempt == false) {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.retries(3);
			browser.refresh().sleep(5000);
		}
		instructorGradebookStudentDetailedPage.validatePresenceOfAverageScore(browser, assessmentsPage.getAssignmentName()).then(function(classAvg) {
			if (classAvg.indexOf(highestScoreForAllStudents) > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment on student detailed GradeBook view ::  " + classAvg, "is compared against the calculated class average ::" + highestScoreForAllStudents, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment on student detailed GradeBook view ::  " + classAvg, "is compared against the calculated class average ::" + highestScoreForAllStudents, "failure") +
					report.reportFooter());
			}

		});
	});


	it(". [Gradebook] Verify whether the system generated student highest point score is updated on Instructor Gradebook on the Student Detailed  Media Quiz Assignment Results Page ", function(done) {
		this.retries(3);
		if (assignmentCreationStatus === "failure" && assignmentNameClickableStatusAfterAttempt == false) {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.getScoredPoints(browser, assessmentsPage.getAssignmentName())
			.then(function(scoredPoints) {
				if (scoredPoints.indexOf(highestScoreForAllStudents) > -1) {
					// if (scoredPoints.toString() === assessmentsPage.getRoboPointScore(questionsCorrectFromCAS)) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + highestScoreForAllStudents + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + highestScoreForAllStudents + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "failure") +
						report.reportFooter());
				}
			});
	});

	it(". Click on back button for navigating student detailed page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookNavigationPage.clickOnGradebookBackButton(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
		});
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
	});

	it(". Validate override score field should be disabled untill the due date has not pasesed", function(done) {
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

	it(". Refresh the page nad wait for page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Navigate to a specific student detailed view and edit attempt from the instructor gradebook for Media Quiz Assignment", function(done) {
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

	it(". Validate attempts edited successfully without any error message for Media Quiz Assignment", function(done) {
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

	it(". Reload the page and wait until the page is loaded successfully", function(done) {
		browser.refresh()
		.sleep(5000).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Re-validate edited attempts persist after refreshing the page without any error for Media Quiz Assignment", function(done) {
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

	it(". Validate the max point score is displayed correctly on the student detailed page for Media Quiz Assignment", function(done) {
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

	it(". Validate points possible to date is displayed correctly on the points graph for Media Quiz Assignment" , function(done) {
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

	it(". Validate the presence of the total points scored by the student on the points graph for Media Quiz Assignment", function(done) {
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


	it(". Validate the presence of due date on student detailed page under instructor gradebook view for Media Quiz Assignment", function(done) {
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


	it(". Validate the presence of submission date on student detailed page under instructor gradebook view for Media Quiz Assignment", function(done) {

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


	it(". Click on back button to navigate to gradebook view and click on the attempted Media Quiz Assignment ", function(done) {
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

	it(". LTR-4665 :: Validate page should appear without any error ", function(done) {

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

	it(". LTR-4665 :: Validate assignment name present on assignment detailed page", function(done) {
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

	it(". LTR-4665 :: Validate the presence of score submission count on the submission graph for Media Quiz Assignment", function(done) {
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

	it(". LTR-4665 :: Validate the presence of score expected on the submission graph for Media Quiz Assignment", function(done) {
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


	it(".  LTR-4665 :: Validate the presence of Low, Median and High labels under Scores", function(done) {
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


	it(". LTR-4665 :: Validate the presence of distribution Value", function(done) {
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

	it(". Navigate on Gradebook page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Navigate to student's detailed gradebook view", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {

			if (assignmentCreationStatus === "failure") {
				this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
				console.log(loginPage.getUserName());
			}
			data = loginPage.setLoginData("student");
			console.log(report.printLoginDetails(data.userId, data.password));
			console.log(loginPage.getUserName());
			instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserName()).then(function() {
				done();
			});
		}
	});

	it(". Navigate to details of student's attempts gradebook view", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {

			instructorGradebookNavigationPage.navigateToDetailsOfStudentsAttempts(browser, assessmentsPage.getAssignmentName()).then(function() {
				// instructorGradebookNavigationPage.navigateToDetailsOfStudentsAttempts(browser, "ROBO-Q-U-30 RANDOM NO 111").then(function() {
				done();
			});
		}
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Select last attempt from dropdown for Media Quiz Assignment", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {

			instructorGradebookNavigationPage.countAttemptsForMediaQuiz(browser).then(function(count) {
				var attemptCount = _.size(count);
				instructorGradebookNavigationPage.selectLastAttempt(browser, attemptCount).then(function() {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Last attempt selected", "Success", "success") +
						report.reportFooter());
					done();
				});
			});
		}
	});

	it(". Wait until page is loaded successfully", function(done) {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(".  LTR-5439 :: Validates all analytics for Correct question count and total question count on instructor student's detailed view for Media Quiz Assignment", function(done) {
		this.retries(3);
		var PercentageValueUptoOneDecimalPoint = mathutil.getScoreUptoOneDecimal(PercentangeRoboPoints);
		console.log(questionsCorrectFromCAS);
		console.log(totalQuestionsInTheQuiz);
		console.log(PercentageValueUptoOneDecimalPoint);
		instructorGradebookNavigationPage.getAnalyticsValues(browser, "#score", PercentageValueUptoOneDecimalPoint).then(function() {
			console.log(roboPoints);
			instructorGradebookNavigationPage.getAnalyticsValues(browser, "#correct", questionsCorrectFromCAS).then(function() {
				console.log(questionsCorrectFromCAS);
				instructorGradebookNavigationPage.getAnalyticsValues(browser, "#total", totalQuestionsInTheQuiz).then(function() {
					console.log(totalQuestionsInTheQuiz);
					console.log(report.reportHeader() +
						report.stepStatusWithData("All analytics are present on assignment detailed page",
							"Score :" + PercentageValueUptoOneDecimalPoint +
							"Correct " + questionsCorrectFromCAS +
							"Total " + totalQuestionsInTheQuiz +
							"success") +
						report.reportFooter());
					done();
				});
			});
		});
	});

	it(". Wait until page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Navigate to Assignments Page", function(done) {
		menuPage.selectAssignments("instructor", browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Delete the created Media Quiz Assignment", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		assessmentsPage.deleteAssignment(browser, done);
	});

	it(". Refresh the page and wait until page load", function(done) {
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
		userSignOut.userSignOut(browser, done);
	});

//total test case: 77

});
