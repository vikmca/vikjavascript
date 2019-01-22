require('colors');
var wd = require('wd');
var _ = require('underscore');
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var session = require("../../../support/setup/browser-session");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var studybit = require("../../../support/pageobject/" + pageobject + "/" + envName + "/studybitpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var testData = require("../../../../../test_data/data.json");
var report = require("../../../support/reporting/reportgenerator");
var practiceQuizCreation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var mathutil = require("../../../util/mathUtil");
var courseHelper = require("../../../support/helpers/courseHelper");
var asserters = wd.asserters;
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + '4LTR (' + 'STUDENT' + ') :: TAKE PRACTICE QUIZ AND VALIDATE RESULTS PAGE', function() {
	var browser;
	var allPassed = true;
	var userType;
	var practiceQuizValidationStatus = "failure";
	var product;
	var courseName;
	var length = null;
	var incorrectResponseListCount = 0;
	var correctResponseListCount = 0;
	var pageLoadingTime;
	var totalTime;
	var serialNumber = 0;

	before(function(done) {
		browser = session.create(done);
		userType = "student";
		product = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString()) || testData.existingCourseDetails.product;
		if (product === "default") {
			product = testData.existingCourseDetails.product;
		}
		courseName = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_COURSE.toString()) || testData.existingCourseDetails.coursename;
		if (courseName === "default") {
			courseName = testData.existingCourseDetails.coursename;
		}
		data = loginPage.setLoginData(userType);
		totalTime = 0;
		//Reports
		console.log(report.formatTestName("CAS INTEGRATION TEST :: STUDENT ::  VALIDATE PRACTICE QUIZ RESULT PAGE"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***validatePracticeQuizResultPage.js***"));
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
		console.log(report.reportHeader() +
			report.stepStatus("Take Practice Quiz from chapter - Validation status ", practiceQuizValidationStatus) +
			report.reportFooter());
		console.log(report.formatTestTotalTime(totalTime, scriptName, allPassed));
		session.close(allPassed, done);
	});

	it(". Login to 4LTR platform", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		data = loginPage.setLoginData(userType);
		//Reports
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

	it(". Launch the quiz by selecting filter studybits", function(done) {
		practiceQuizCreation.navigateToStudyBoard(browser).then(function() {
			practiceQuizCreation.navigateToStudybits(browser).then(function() {
				practiceQuizCreation.navigateToPracticeQuizFromChapters(browser).then(function() {
					pageLoadingTime = 0;
					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
				});
			});
		});
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". LTR-2412 Validate error message should not be display on launching practice quiz", function(done) {
		practiceQuizCreation.verifyErrorOnLaunchingQuiz(browser).then(function(status) {
			if (status) {
				practiceQuizCreation.verifyErrorMessageOnLaunchingQuiz(browser);
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("No error message is displaying on dragging the assignmnet " + status, "success") +
					report.reportFooter());
				done();
			}
		});
	});
	it(". Take a Practice quiz from Chapter and exit", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("quiz"));
		takeQuizpo.takeQuiz(browser, done);
	});

	it(". Validate the results page: presence of buttons", function(done) {
		practiceQuizCreation.validateViewPastQuizButton(browser).then(function(viewPastQuizButtonName) {
			practiceQuizCreation.validateRetakeButton(browser).then(function(retakeQuizButtonName) {
				practiceQuizCreation.validateExitButton(browser).then(function(exitButtonName) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("All these buttons are present on practice quiz result view " + viewPastQuizButtonName, "," + retakeQuizButtonName, "," + exitButtonName, "success") +
						report.reportFooter());
					done();
				});
			});
		});
	});

	it(". Validate the presence of result, fetch correct answers and total questions from the quiz", function(done) {
		browser
			.waitForElementByCss(".progress-count", asserters.isDisplayed, 5000).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Results are appearing successfully ", "success") +
					report.reportFooter());
				practiceQuizCreation.getTotalQuestions(browser).then(function(TotalQuestions) {
					totalQuestionsInTheQuiz = TotalQuestions;
					console.log(report.reportHeader() +
						report.stepStatusWithData("Total number of questions in this quiz were " + TotalQuestions, "success") +
						report.reportFooter());
					practiceQuizCreation.getQuestionsCorrect(browser).then(function(correctResponse) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Correct answers given by the student out of " + TotalQuestions + " questions are " + correctResponse, "success") +
							report.reportFooter());
						practiceQuizValidationStatus = "success"
						done();
					});
				});
			});
	});


	it(". Validate incorrect answers displaying on tab is equal to the count of list of incorrect responses displaying on result page", function(done) {
		practiceQuizCreation.fetchCorrectIncorrectCount(browser, "1").then(function(correctQuestionCount) {
			if (parseInt(correctQuestionCount) <= 10) {
				console.log(correctQuestionCount);
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

	it(". Click on Correct tab on quiz result page and validate the navigation", function(done) {
		practiceQuizCreation.fetchCorrectIncorrectCount(browser, "1").then(function(correctQuestionCount) {
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
		practiceQuizCreation.fetchCorrectIncorrectCount(browser, "1").then(function(correctQuestionCount) {
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
				if (correctResponseListCount === _.size(CGIDCount)) {
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

});
