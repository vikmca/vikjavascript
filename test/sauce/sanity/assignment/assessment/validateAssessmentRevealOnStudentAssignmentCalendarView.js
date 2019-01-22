require('colors');
var wd = require('wd');
var dataUtil = require("../../../util/date-utility");
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var menuPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var calendarNavigation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/navigationpo");
var studentassesmentspo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var assessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assessmentspo");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var assessmentData = require("../../../../../test_data/assignments/assessments.json");
var session = require("../../../support/setup/browser-session");
var testData = require("../../../../../test_data/data.json");
var courseHelper = require("../../../support/helpers/courseHelper");
var report = require("../../../support/reporting/reportgenerator");
var _ = require('underscore');
var asserters = wd.asserters;
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var recursiveFnPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/recursiveFnPagepo");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'ASSIGNMENT :: REVEAL/HIDE STUDENT ASSIGNMENTS AND INSTRUCTOR LIST VIEW VALIDATION', function() {
	var browser;
	var allPassed = true;
	var userType;
	var setDate;
	var courseName;
	var assignmentCreationStatus = "failure";
	var product;
	var assignmentCount;
	var assessmentname1;
	var assessmentname2;
	var assignment1position = 0;
	var assignment2position = 0;
	var duedate;
	var revealdate;
	var pageLoadingTime;
	var totalTime;
	var serialNumber = 0;
	var failTestCases = 0;

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
		console.log(report.formatTestName("ASSIGNMENT :: REVEAL/HIDE STUDENT ASSIGNMENTS AND INSTRUCTOR LIST VIEW VALIDATION"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***validateAssessmentRevealOnStudentAssignmentCalendarView.js***"));
	});

	beforeEach(function(done) {
		this.currentTest.title = ++serialNumber + this.currentTest.title;
		brainPage.closePopupWindowFromJavaScript(browser);
		done();
	});

	afterEach(function(done) {
		allPassed = allPassed && (this.currentTest.state === 'passed');
		console.log(this.currentTest.state);
		if (this.currentTest.state === 'failed') {
			failTestCases++;
		}
		// if(FailTestCases===5){
		//     this.skip();
		// }
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

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
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

	it(". Navigate to the next month on the assignment calendar view", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.navigateToNextMonth(browser).then(function() {
			calendarNavigation.selectFirstDateFormNextMonth(browser).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Instructor has navigated to next month calendar view", "", "success") +
					report.reportFooter());
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Next month calendar is loaded");
			});
		});
	});

	it(". Select assessment type assignment", function(done) {
		pageLoadingTime = 0;
		this.timeout(courseHelper.getElevatedTimeout());
		calendarNavigation.selectAssessmentTypeAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assessment type assignment gets selected");
		});
	});

	it(". Complete the CFM Assessment type assignment form for system created assignment", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		pageLoadingTime = 0;
		assessmentsPage.enterName(browser).then(function() {
			assessmentsPage.enterRevealDateNextMonth(browser).then(function() {
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

	it(". Save the CFM Assessment type assignment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});

	it(". Verify if CFM Assessment type assignment gets saved successfully", function(done) {
		assessmentname2 = assessmentsPage.getAssignmentName();
		this.timeout(courseHelper.getElevatedTimeout());
		assessmentsPage.checkIfAssignmentSavedOnFutureDate(browser).then(function(value) {
			if (value.toString() === "rgb(255, 219, 238)") {
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

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate to Assignments page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Navigate to the next month on calendar view", function(done) {
		calendarNavigation.navigateToNextMonth(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Verify assignment should not be visible", function(done) {
		studentassesmentspo.assignmentVisibilityStatus(browser).then(function() {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Assignments with future date reveal date is hidden from student calendar :: ", "success") +
				report.reportFooter());
			done();
		});
	});

	it(". Log out as Student", function(done) {
		userSignOut.userSignOut(browser, done);
	});

	it(". Login as Instructor", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
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
		this.timeout(courseHelper.getElevatedTimeout());
		loginPage.launchACourse(userType, courseName, browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate to Assignments page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Navigate to the next month on the assignment calendar view", function(done) {
		calendarNavigation.navigateToNextMonth(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Logged the reveal date and due date of the created assignment", function(done) {
		pageLoadingTime = 0;
		this.timeout(courseHelper.getElevatedTimeout("quiz"));
		calendarNavigation.clickOnAssignmentOnNextMonth(browser).then(function() {
			assessmentsPage.getDueDateText(browser).then(function(duedateforassignment) {
				assessmentsPage.getRevealDateText(browser).then(function(revealdateforassignment) {
					duedate = duedateforassignment;
					revealdate = revealdateforassignment;
					console.log(duedate);
					console.log(revealdate);
					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
				});
			});
		});

	});

	it(". Edit reveal date of the created assignment", function(done) {
		assessmentsPage.changeRevelAndDueDate(browser, 2, "Reveal in Student Calendar").then(function() {
			done();
		});
	});

	it(". Edit due date of the created assignment", function(done) {
		assessmentsPage.changeRevelAndDueDate(browser, 1, "Due Date").then(function() {
			done();
		});
	});

	it(". Navigate to question tab", function(done) {
		assessmentsPage.clickOnQuestionTab(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Question tab loaded successfully");
		});
	});

	it(". Save the assignment after edit due date", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});

	it(". Click on previous button for navigating to current month", function(done) {
		calendarNavigation.navigateCurrentMonthFromNextMonth(browser, done)
	});

	it(". Verify edited assignment present on current date", function(done) {
		recursiveFnPage.verifyEditedAstPresentOnCurrentDate(browser, done);
	});

	it(". Log out as Instructor", function(done) {
		userSignOut.userSignOut(browser, done);
	});

	it(". Login as student", function(done) {
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

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate to Assignments page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Wait for page loading", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
	});

	it(". Click on the current date cell verify  assignment is present", function(done) {
		studentassesmentspo.clickOnCurrentDateCellAndValidateAssessment(browser).then(function() {
			done()
		});
	});

	it(". Verify assignments present on current date", function(done) {
		var astName = assessmentsPage.getAssignmentName();
		studentassesmentspo.validateAssessmentpresentOnCurrentDate(browser, astName).then(function() {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Assessment assignment is present on current date of student calendar:: ", "success") +
				report.reportFooter());
			done();
		});
	});

	it(". Log out as Student", function(done) {
		userSignOut.userSignOut(browser, done);
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
		this.timeout(courseHelper.getElevatedTimeout());
		loginPage.launchACourse(userType, courseName, browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate to Assignments page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Select current date and open the assessment type assignment settings page", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.selectADateForAssignment(browser).then(function() {
			calendarNavigation.selectAssessmentTypeAssignment(browser).then(function() {
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assessment type assignment is selected");
			});
		});
	});

	it(". Complete the CFM Assessment type assignment form for system created assignment", function(done) {
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

	it(". Save the CFM Assessment type assignment and verify if its saved successfully", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		assessmentsPage.saveAssignment(browser).then(function() {
			assessmentsPage.checkIfAssignmentSaved(browser).then(function(value) {
				if (value.toString() === "rgb(236, 41, 142)") {
					assessmentname1 = assessmentsPage.getAssignmentName();
					assignmentCreationStatus = "success";
					console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName(), "success") + report.reportFooter());
					done();
				} else {
					assessmentname1 = assessmentsPage.getAssignmentName();
					assignmentCreationStatus = "failure";
					console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName() + " may not have received the assessmentCGI", "failure") + report.reportFooter());
				}
			});
		});
	});

	it(". Wait for page loading", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
	});

	it(". Click on Assignment list view", function(done) {
		calendarNavigation.navigateAssignmentListView(browser, done);
	});

	it(". Retrieve position of created assignments and verify their presence on list view", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		assessmentsPage.getAssignmentCountsOnListView(browser).then(function(elements) {
					var countassignmentonlistview = 1;
					function findAssignmentPos() {
						if (countassignmentonlistview <= _.size(elements)) {
							assessmentsPage.getAssignmentNameUsingPosition(browser, countassignmentonlistview).then(function(textast) {
									if (textast.indexOf(assessmentname1) > -1) {
										assignment1position = countassignmentonlistview;
										console.log("assignment2position"+assignment2position);
										countassignmentonlistview++;
										findAssignmentPos();
									} else if (textast.indexOf(assessmentname2) > -1) {
										assignment2position = countassignmentonlistview;
										console.log("assignment2position"+assignment2position);
										countassignmentonlistview++;
										findAssignmentPos();
									} else {
										countassignmentonlistview++;
										findAssignmentPos();
									}
								});
						} else {
							if (assignment1position != 0) {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Assessment with two attempts created by the instructor is present on the list view at position " + assignment1position, assessmentname1, "success") +
									report.reportFooter());
							} else {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Assessment with two attempts created by the instructor is present on the list view", assessmentname1, "failure") +
									report.reportFooter());
							}
							if (assignment2position != 0) {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Assessment with unlimited attempts created by the instructor is present on the list view at position " + assignment2position, assessmentname2, "success") +
									report.reportFooter());
							} else {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Assessment with unlimited attempts created by the instructor is present on the list view", assessmentname2, "failure") +
									report.reportFooter());
							}
							done();
						}
					}
					findAssignmentPos();
				});
			});

	it(". Verify presence of 'Assessment' type assignments, their attempts, score, due date and reveal date on instructor' assignment list view", function(done) {
		console.log("assignment1position::" + assignment1position);
		console.log("assessmentname1::" + assessmentname1);
		console.log("dataUtil.getDateFormatForAssignment()::" + dataUtil.getDateFormatForAssignment());
		console.log("assignment2position::" + assignment2position);
		console.log("assessmentname2::" + assessmentname2);
		calendarNavigation.verifyAssessmentOnListView(browser, done, assignment1position, assessmentname1, dataUtil.getDateFormatForAssignment(), assignment2position, assessmentname2);
	});

	it(". Click on assignment calendar view", function(done) {
		calendarNavigation.navigateAssignmentCalendarView(browser, done);
	});

	it(". Wait for page loading", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
	});

	it(". Delete the created assignment", function(done) {
		// this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		this.timeout(courseHelper.getElevatedTimeout("340000"));
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
		userSignOut.userSignOut(browser, done);
	});


});
