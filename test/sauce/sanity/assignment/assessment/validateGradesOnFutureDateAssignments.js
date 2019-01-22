require('colors');
var wd = require('wd');
var _ = require('underscore');
var asserters = wd.asserters;
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var studenGradebookPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/student/gradebookValidationpo");
var instructorGradebookNavigationPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/gradebookNavigationpo");
var instructorMainGradebookView = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/mainGradebookView");
var studentAssessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var instructorGradebookStudentDetailedPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/studentDetailedInfopo");
var menuPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var calendarNavigation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/navigationpo");
var assessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assessmentspo");
var studentassesmentspo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var session = require("../../../support/setup/browser-session");
var testData = require("../../../../../test_data/data.json");
var courseHelper = require("../../../support/helpers/courseHelper");
var report = require("../../../support/reporting/reportgenerator");
var casPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var mathutil = require("../../../util/mathUtil");
var assessmentData = require("../../../../../test_data/assignments/assessments.json");
var path = require('path');
var scriptName = path.basename(__filename);


describe(scriptName + 'ASSIGNMENT :: FUTURE DUE DATE ASSIGNMENTS SUBMISSION AND GRADES VALIDATION AT INSTRUCTOR AND STUDENT GRADEBOOK', function() {
	var browser;
	var allPassed = true;
	var userType;
	var setDate;
	var courseName;
	var assignmentCreationStatus = "failure";
	var product;
	var revealdate;
	var pageLoadingTime;
	var totalTime;
	var assignmentName;
	var studentAssignmentCompletionStatus = "failure";
	var pointsFromStudentGradebook;
	var questionsCorrectFromCAS;
	var totalsudentcount;
	var totalValueOfScoresForAllStudents = 0;
	var averageScoreForAllStudents;
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
		console.log(report.formatTestName("ASSIGNMENT :: FUTURE DUE DATE ASSIGNMENTS SUBMISSION AND GRADES VALIDATION AT INSTRUCTOR AND STUDENT GRADEBOOK"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***validateGradesOnFutureDateAssignments.js***"));
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
		this.timeout(120000);
		loginPage.launchACourse(userType, courseName, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate to Assignments Page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Delete the assignments if its not already deleted", function(done) {
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

	it(". Click on '+' button and create assessment type assignment", function(done) {
		this.timeout(120000);
		pageLoadingTime = 0;
		calendarNavigation.navigateToNextMonth(browser).then(function() {
			calendarNavigation.selectFirstDateFormNextMonth(browser).then(function() {
				calendarNavigation.selectAssessmentTypeAssignment(browser).then(function() {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Instructor has navigated to next month calendar view and assignment type assignment is selected", "", "success") +
						report.reportFooter());
					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Next month calendar is loaded");
				});
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
											assessmentData.systemgenerated.scorestrategyhigh.score + ", Question Strategy :" +
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

	it(". Click on preview tab and verify the assignment questions get loaded successfully", function(done) {
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
		assessmentsPage.checkIfAssignmentSavedOnFutureDate(browser).then(function(value) {
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

	it(". Log out as Instructor", function(done) {
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


	it(". Click on next month current date cell", function(done) {
		this.timeout(120000);
		pageLoadingTime = 0;
		calendarNavigation.navigateToNextMonth(browser).then(function() {
			studentassesmentspo.clickOnCurrentDateCellFromNextMonth(browser).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Student has navigated to next month calendar view and assignment type assignment is selected", "", "success") +
					report.reportFooter());
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Next month calendar is loaded");
			});
		});
	});

	it(". Launch the assignment", function(done) {
		pageLoadingTime = 0;
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		studentassesmentspo.launchAssignment(browser, assessmentsPage.getAssignmentName()).then(function() {
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

	it(". Complete the CFM Assessment type assignment", function(done) {
		pageLoadingTime = 0;
		//Call this function if you want a specific block to timeout after a specific time interval
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

	it(". Navigate to Gradebook page", function(done) {
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

	it(". [Gradebook]Validate the Points earned by the student", function(done) {
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

	it(". Validate the presence of Class average value on student GradeBook", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.validateAvgScoreOnStudentGradebook(browser, assessmentsPage.getAssignmentName(), pointsFromStudentGradebook, done);
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
		menuPage.selectGradebook(userType, browser, done);
	});


	it(". Validate the Export button on different browser", function(done) {
		if (process.env.RUN_IN_PLATFORM.toString() === "\"iOS\"" || stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString()) === "safari" || process.env.RUN_IN_PLATFORM.toString() === "\"mobile\"") {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Export button is not present on Safari browser", "true", "success") +
				report.reportFooter());
			done();
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

	it(". Calcuate the total of score earned by students for a particular CFM Assessment type assignment ", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		var sizeOfColumn = 0;
		instructorMainGradebookView.getTotalScoreBoxOnGradebook(browser)
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
		averageScoreForAllStudents = (totalValueOfScoresForAllStudents / parseInt(totalsudentcount));
		console.log(report.reportHeader() +
			report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment calculated and is coming out to be ::  " + averageScoreForAllStudents, "success") +
			report.reportFooter());
		done();
	});

	it(". Verify the assignment text box is disabled when user creates an assignment on future date", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorMainGradebookView.verifyAssignmentTextBox(browser).then(function(status) {
			if (status) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Assignment text box is disabled and status is ", status + " displayed on the Instructor GradeBook table", "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Assignment text box is disabled and status is ", status + " displayed on the Instructor GradeBook table", "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Verify the Assignment score should not be updated in student total points column at Gradebook page when user creates an assignment on future date.", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorMainGradebookView.getTotalPoints(browser).text().then(function(totalPoints) {
			if (totalPoints === (assessmentData.systemgenerated.scorestrategyhigh.scorezero).toString()) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : TestBot Max Total points " + assessmentData.systemgenerated.scorestrategyhigh.scorezero + ", is compared against the Max total points  ", totalPoints + " displayed on the Instructor GradeBook table", "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : TestBot Max Total points  " + assessmentData.systemgenerated.scorestrategyhigh.scorezero + ", is compared against the Max total points  ", totalPoints + " displayed on the Instructor GradeBook table", "failure") +
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

	it(". Validate presence of class average value on student detailed page on instructor gradebook view ", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3);
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


	it(". [Gradebook] Verify whether the system generated student scored point is updated on Instructor Gradebook Student Detailed Page", function(done) {
		this.retries(3);
		if (assignmentCreationStatus === "failure") {
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
