require('colors');
var wd = require('wd');
var asserters = wd.asserters;
var _ = require('underscore');
var dataUtil = require("../../util/date-utility");
var stringutil = require("../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var takeQuizpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var loginPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var menuPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var basicpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var calendarNavigation = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/navigationpo");
var assessmentsPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assessmentspo");
var assessmentData = require("../../../../test_data/assignments/assessments.json");
var session = require("../../support/setup/browser-session");
var testData = require("../../../../test_data/data.json");
var studentAssessmentsPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var instructorGradebookNavigationPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/gradebookNavigationpo");
var createNewCoursepo = require("../..//support/pageobject/" + pageobject + "/" + envName + "/createNewCoursepo");
var casPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var additionalInstructOrTA = require("../../support/pageobject/" + pageobject + "/" + envName + "/additionalInstructOrTApo.js");
var instructorGradebookStudentDetailedPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/studentDetailedInfopo");
var courseHelper = require("../../support/helpers/courseHelper");
var brainPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var instructorMainGradebookView = require("../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/mainGradebookView");
var report = require("../../support/reporting/reportgenerator");
var studenGradebookPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/student/gradebookValidationpo");
var mathutil = require("../../util/mathUtil");
var userSignOut = require("../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var copyCoursePage = require("../../support/pageobject/" + pageobject + "/" + envName + "/copyCoursepo.js");
//pagefactory
var studentAssignmentPage = require("../../support/pagefactory/studentAssignment.json");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'VALIDATE TEACHING ASSISTANT AND ADDITIONAL INSTRUCTOR USE CASES', function() {
	var browser;
	var allPassed = true;
	var userType;
	var setDate;
	var courseName;
	var assignmentCreationStatus = "failure";
	var productData;
	var pageLoadingTime;
	var totalsudentcount;
	var product;
	var questionsCorrectFromCAS;
	var studentAssignmentCompletionStatus;
	var pointsFromStudentGradebook;
	var scoreFromStudentGradebook;
	var totalValueOfScoresForAllStudents = 0;
	var averageScoreForAllStudents;
	var browserName;
	var data;
	var totalTime;
	var serialNumber = 0;

	before(function(done) {
		browser = session.create(done);
		setDate = testData.courseAccessInformation.DateBeforeToday;
		newCourseData = testData.instructorResourceCenter;
		userType = "instructor";
		product = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString()) || testData.existingCourseDetails.product;
		if (product === "default") {
			product = testData.existingCourseDetails.product;
		}
		browserName = stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString());
		console.log("browserName::" + browserName);
		courseName = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_COURSE.toString()) || testData.existingCourseDetails.coursename;
		newCourseName = "TA : " + product + " : Index : " + process.env.RUN_INDEX;
		data = loginPage.setLoginData(userType);
		productData = loginPage.getProductData();
		totalTime = 0;
		//Reports
		console.log(report.formatTestName("VALIDATE TEACHING ASSISTANT AND ADDITIONAL INSTRUCTOR USE CASES"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, newCourseName));
		console.log(report.formatTestScriptFileName("***validateTaAdditionalInstructorFeature.js***"));
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

	it(". Log in to 4LTR Platform as instructor", function(done) {
		data = loginPage.setLoginData(userType);
		//Reports
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Product", function(done) {
		brainPage.selectProduct(product, browser, done);
	});

	it(". Click on manage my course", function(done) {
		createNewCoursepo.clickOnManageMyCourse(browser).then(function() {
			done();
		});
	});

	it(". Click on edit course under manage my course", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		copyCoursePage.clickOnEditIcon(browser, newCourseName).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	it(". Fill in the start date", function(done) {
		createNewCoursepo.fillTheStartDate(browser).then(function() {
			done();
		});
	});

	it(". Fill the end date with 10 days after from the today's date ", function(done) {
		createNewCoursepo.enterTheEndData(browser, dataUtil.getSpecificDateAfterCurrentDate(setDate)).then(function() {
			done();
		});
	});

	it(". Save the course", function(done) {
		additionalInstructOrTA.clickOnSaveButton(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	it(". Wait for page loading", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	it(". Navigate to Instructor SSO", function(done) {
		basicpo.navigateToInstructorDashboard(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	it(". Select a Product", function(done) {
		brainPage.selectProduct(product, browser, done);
	});

	it(". Select a Course and launch", function(done) {
		loginPage.launchACourse(userType, newCourseName, browser, done);
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

	it(". Delete the past assignments", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		assessmentsPage.deleteAssignment(browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Select current date and open the Assessment Type assignment settings page", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.handleTheFlashAlert(browser).then(function() {
			calendarNavigation.selectADateForAssignment(browser).
			then(function() {
				calendarNavigation.selectAssessmentTypeAssignment(browser).then(function() {
					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assessment type assignment is selected");
				});
			});
		});
	});

	it(". Complete the CFM Assessment form for system created assignment", function(done) {
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
										takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment form is filled");
									});
								});
							});
						});
					});
				});
			});
		});
	});

	it(". Save the CFM assessment and verify if its saved successfully", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		assessmentsPage.saveAssignment(browser).then(function() {
			assessmentsPage.checkIfAssignmentSaved(browser).then(function(value) {
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
	});

	it(". Log out as Instructor", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		userSignOut.userSignOut(browser, done);
	});

	it(". Log in as TA student", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userType = "student_ToRegister";
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Wait for page loading", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	it(". Select a Course and launch", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userType = "student_ToRegister";
		loginPage.launchACourse(userType, newCourseName, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Wait for page loading", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
	});

	it(". Navigate to Assignments page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userType = "student";
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Click on the current date cell", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickCurrentDateCell(browser, done);
	});

	it(". Launch the assignment first time at student end ", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
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

	it(". Complete the assignment and exit", function(done) {
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
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Wait until the GradeBook page is loaded successfully", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser
			.refresh()
			.then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "GradeBook page is loaded");
			});
	});

	it(". [Gradebook]Validate the Points earned by the student", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3);
		browser.sleep(5000);
		studenGradebookPage.getScoredPoints(browser, assessmentsPage.getAssignmentName()).then(function(valueScore) {
			console.log("Student points from the student GradeBook " + valueScore);
			console.log("Robo Score " + assessmentsPage.getRoboPointScore(questionsCorrectFromCAS));
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
		this.retries(3);
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.validateAvgScoreOnStudentGradebook(browser, assessmentsPage.getAssignmentName(), pointsFromStudentGradebook, done);
	});

	it(". Validate the presence of submission date on student GradeBook page", function(done) {
		this.retries(3);
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

	it(". Validate the presence of due date on student GradeBook page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3);
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

	it(". Log out as student", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		userSignOut.userSignOut(browser, done);
	});

	// Log in as TA and validate all data
	it(". Log in as TA student", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userType = "TA";
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Course and launch", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		loginPage.launchACourse(userType, newCourseName, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate on GradeBook page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userType = "instructor";
		menuPage.selectGradebook("instructor", browser, done);
	});

	it(". Retrieve count of registered student for the launched course", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3)
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

	it(". Calculate the total of score earned by students for a particular CFM assessment type assignment ", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3);
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
						console.log("totalValueOfScoresForAllStudents" + totalValueOfScoresForAllStudents);
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

	it(". LTR-5346 :: Verify the presence of total points, student score value in total points on the TA GradeBook table", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3);
		instructorMainGradebookView.getTotalPoints(browser).text().then(function(totalPoints) {
			console.log("totalPoints" + totalPoints);
			console.log("assessmentData.systemgenerated.scorestrategyhigh.score" + 0);
			if (parseInt(totalPoints) === 0) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : TestBot Max Total points " + 0 + ", is compared against the Max total points  ", totalPoints + " displayed on the Instructor GradeBook table", "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : TestBot Max Total points  " + 0 + ", is compared against the Max total points  ", totalPoints + " displayed on the Instructor GradeBook table", "failure") +
					report.reportFooter());
			}
		});
	});

	it(". LTR-5346 :: Verify the presence of total points, student score value in total points on the TA GradeBook table", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3);
		data = loginPage.setLoginData("student_ToRegister");
		console.log(report.printLoginDetails(data.userId, data.password));
		console.log("loginPage.getUserName()" + loginPage.getUserName());
		instructorMainGradebookView.getPointsGainedByStudent(browser, loginPage.getUserName())
			.then(function(pointsGained) {
				var totalPointsGainedByStudent = pointsGained;
				// if (totalPointsGainedByStudent.toString() === assessmentsPage.getRoboPointScore(questionsCorrectFromCAS)) {
				if (totalPointsGainedByStudent.toString() == 0) {
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

	it(". Navigate to student's detailed GradeBook view", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		data = loginPage.setLoginData("student_ToRegister");
		console.log("loginPage.getUserName()" + loginPage.getUserName());
		instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserName()).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
		});
	});

	it(". Wait until the assignment page is loaded successfully", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
		});
	});


	it(". Validate presence of class average value on student detailed page on TA GradeBook page ", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
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

	it(". [Gradebook] Verify whether the system generated student point score is updated on TA GradeBook Student Detailed assessment Results Page", function(done) {
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

	it.skip(" [Gradebook] Verify whether the system generated student score(Questions Correct)  is updated on TA GradeBook Student Detailed assessment Results Page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.checkStudentScore(browser, assessmentsPage.getAssignmentName(), questionsCorrectFromCAS)
			.then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Questions correct retrieved from Student Assessment Result page which is " + questionsCorrectFromCAS + " questions, is compared against the student score(Questions correct) retrieved from Instructor GradeBook ", questionsCorrectFromCAS, "success") +
					report.reportFooter());
				done();
			});
	});

	it(". Navigate to Assignments Page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectAssignments("instructor", browser, done);
	});

	it(". Wait for page loading", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
	});

	it(". Delete the created assignment", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		}
		assessmentsPage.deleteAssignment(browser, done);
	});

	it(". Accept flash appeared on page", function(done) {
		calendarNavigation.handleTheFlashAlert(browser).then(function() {
			done();
		});
	});

	it(". Log out as TA", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3);
		this.timeout(courseHelper.getElevatedTimeout());
		userSignOut.userSignOut(browser, done);
	});

});
