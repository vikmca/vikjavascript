var wd = require('wd');
var asserters = wd.asserters;
var stringutil = require("../../../util/stringUtil");
var session = require("../../../support/setup/browser-session");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var menuPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var tocPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/tocpo");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var studentAssessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var conceptrackerPageInstructor = require("../../../support/pageobject/" + pageobject + "/" + envName + "/concepttracker/instructor/concepttrackerpo");
var conceptrackerPageStudent = require("../../../support/pageobject/" + pageobject + "/" + envName + "/conceptTrackerpo");
var studybit = require("../../../support/pageobject/" + pageobject + "/" + envName + "/studybitpo");
var practiceQuizCreation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var clearAllSavedContent = require("../../../support/pageobject/" + pageobject + "/" + envName + "/clearData");
var studyboardpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/studyboardpo");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var courseHelper = require("../../../support/helpers/courseHelper");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var report = require("../../../support/reporting/reportgenerator");
var _ = require('underscore');
var path = require('path');
var scriptName = path.basename(__filename);

describe(scriptName + '4LTR (' + 'Instructor' + ') :: TAKE/RETAKE PRACTICE QUIZ METRICS RECORDING ON INSTRUCTOR AND STUDENT CONCEPT TRACKER VALIDATION', function() {

	var browser;
	var allPassed = true;
	var userType;
	var courseName;
	var product;
	var productData;
	var preExistingCorrectAnswer;
	var preExistingTotalQuestions;
	var studybitCount;
	var correctAnswer;
	var totalQuestions;
	var correctAnswerAfterStudentAttempt;
	var preExistingCorrectAnswerAtInstructorEnd;
	var preExistingTotalQuestionsAtInstructorEnd;
	var correctAnswerforTakeQuiz;
	var totalQuestionsForTakeQuiz;
	var finalSumOfCorrectAnswer;
	var finalSumOfTotalQuestions;
	var testBotQuizMetricsStudent;
	var testBotQuizMetricsInstructor;
	var pageLoadingTime;
	var totalTime;
	var serialNumber = 0;

	before(function(done) {

		browser = session.create(done);
		userType = "instructor";
		product = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString());
		courseName = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_COURSE.toString());

		if (product === "default") {
			product = testData.existingCourseDetails.product;
		}

		if (courseName === "default") {
			courseName = product + " " + courseHelper.getUniqueCourseName();
		}
		data = loginPage.setLoginData(userType);
		productData = loginPage.getProductData();
		totalTime = 0;
		//Reports
		console.log(report.formatTestName("ANALYTICS :: TAKE/RETAKE PRACTICE QUIZ METRICS RECORDING ON INSTRUCTOR AND STUDENT CONCEPT TRACKER"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***validateTakeRetakePracticeQuiz.js***"));
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

	it(". Login as Instructor", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userType = "instructor";
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

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate to Concept Tracker", function(done) {
		menuPage.selectConceptTracker(userType, browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	// it(". Fetch existing practice quiz metrics on a chapter if any ", function(done) {
	// 	conceptrackerPageInstructor.isConceptTrackerLoaded(browser).text().should.become('Concept Tracker').then(function() {
	// 		browser.sleep(4000).execute("return document.evaluate(\"count(//div[contains(@class,'chart-container ng-scope')]/h1[contains(.,'" + productData.concepttracker.quiz.chapterbased.name + "')])\", document, null, XPathResult. NUMBER_TYPE, null ).numberValue").then(function(status) {
	// 			if (status == 1) {
	// 				practiceQuizCreation.getQuizText(browser, productData.concepttracker.quiz.chapterbased.name)
	// 					.then(function(practiceQuizResult) {
	// 						preExistingCorrectAnswer = stringutil.returnValueAfterSplit(stringutil.returnValueAfterSplit(practiceQuizResult, " ", 0), "/", 0);
	// 						preExistingTotalQuestions = stringutil.returnValueAfterSplit(stringutil.returnValueAfterSplit(practiceQuizResult, " ", 0), "/", 1);
	// 						console.log(report.reportHeader() +
	// 							report.stepStatusWithData("ANALYTICS :: Practice Quiz metrics found before the student attempted a quiz on  \" " + productData.concepttracker.quiz.chapterbased.name, preExistingCorrectAnswer + "/" + preExistingTotalQuestions + " Quiz Correct/Total Questions", "success") +
	// 							report.reportFooter());
	// 						done();
	// 					});
	// 			} else {
	// 				console.log("Chapter not present on Concept tracker");
	// 				preExistingCorrectAnswer = 0;
	// 				preExistingTotalQuestions = 0;
	// 				console.log(report.reportHeader() +
	// 					report.stepStatusWithData("ANALYTICS :: Practice Quiz metrics found before the student attempted a quiz on  \" " + productData.concepttracker.quiz.chapterbased.name, preExistingCorrectAnswer + "/" + preExistingTotalQuestions + " Quiz Correct/Total Questions", "success") +
	// 					report.reportFooter());
	// 				done();
	// 			}
	// 		});
	// 	});
	// });

	it(". Fetch existing practice quiz metrics on a chapter if any ", function(done) {
		conceptrackerPageInstructor.isConceptTrackerLoaded(browser).text().should.become('Concept Tracker').then(function() {
			// browser.execute("return document.evaluate(\"count(//div[contains(@class,'chart-container ng-scope')]/h1[contains(.,'" + productData.concepttracker.quiz.chapterbased.name + "')])\", document, null, XPathResult. NUMBER_TYPE, null ).numberValue")
			practiceQuizCreation.getChapterPresenceStatusOnCTPage(browser, productData.concepttracker.quiz.chapterbased.name)
			.then(function(status) {
				if (status == 1) {
					practiceQuizCreation.getQuizText(browser, productData.concepttracker.quiz.chapterbased.name)
						.then(function(practiceQuizResult) {
							preExistingCorrectAnswer = stringutil.returnValueAfterSplit(stringutil.returnValueAfterSplit(practiceQuizResult, " ", 0), "/", 0);
							preExistingTotalQuestions = stringutil.returnValueAfterSplit(stringutil.returnValueAfterSplit(practiceQuizResult, " ", 0), "/", 1);
							console.log(report.reportHeader() +
								report.stepStatusWithData("ANALYTICS :: Practice Quiz metrics found before the student attempted a quiz on  \" " + productData.concepttracker.quiz.chapterbased.name, preExistingCorrectAnswer + "/" + preExistingTotalQuestions + " Quiz Correct/Total Questions", "success") +
								report.reportFooter());
							done();
						});
				} else {
					console.log("Chapter not present on Concept tracker");
					preExistingCorrectAnswer = 0;
					preExistingTotalQuestions = 0;
					console.log(report.reportHeader() +
						report.stepStatusWithData("ANALYTICS :: Practice Quiz metrics found before the student attempted a quiz on  \" " + productData.concepttracker.quiz.chapterbased.name, preExistingCorrectAnswer + "/" + preExistingTotalQuestions + " Quiz Correct/Total Questions", "success") +
						report.reportFooter());
					done();
				}
			});
		});
	});

	it(". Navigate To StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Navigate to ConceptTracker", function(done) {
		menuPage.selectSubTabOnStudyBoard(browser, "Concept Tracker", done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Record the metrics on Instructor ConceptTracker(Studyboard) for practice quiz", function(done) {
		this.retries(3);
		conceptrackerPageStudent.isConceptTrackerLoadedOnStudentEnd(browser).text().then(function(text) {
			practiceQuizCreation.getChapterPresenceStatusOnCTPage(browser, productData.concepttracker.quiz.chapterbased.name)
			// browser.execute("return document.evaluate(\"count(//div[contains(@class,'chart-container ng-scope')]/h1[contains(.,'" + productData.concepttracker.quiz.chapterbased.name + "')])\", document, null, XPathResult. NUMBER_TYPE, null ).numberValue")
				.then(function(status) {
					if (status === 1) {
						practiceQuizCreation.getQuizText(browser, productData.concepttracker.quiz.chapterbased.name)
							.then(function(practiceQuizResult) {
								console.log("practiceQuizResult:: " + practiceQuizResult);
								preExistingCorrectAnswerAtInstructorEnd = stringutil.returnValueAfterSplit(stringutil.returnValueAfterSplit(practiceQuizResult, " ", 0), "/", 0);
								preExistingTotalQuestionsAtInstructorEnd = stringutil.returnValueAfterSplit(stringutil.returnValueAfterSplit(practiceQuizResult, " ", 0), "/", 1);
								console.log("preExistingCorrectAnswerAtInstructorEnd::" + preExistingCorrectAnswerAtInstructorEnd);
								console.log("preExistingTotalQuestionsAtInstructorEnd::" + preExistingTotalQuestionsAtInstructorEnd);
							});
						done();
					} else {
						console.log("Chapter not present on Concept tracker");
						studybitCount = 0;
						preExistingCorrectAnswerAtInstructorEnd = 0;
						preExistingTotalQuestionsAtInstructorEnd = 0;
						done();
					}
				});
		});
	});

	// it(". Record the metrics on Instructor ConceptTracker for practice quiz", function(done) {
	// 	this.retries(3);
	// 	conceptrackerPageStudent.isConceptTrackerLoadedOnStudentEnd(browser).text().then(function(text) {
	// 		browser
	// 			.sleep(4000)
	// 			.execute("return document.evaluate(\"count(//div[contains(@class,'chart-container ng-scope')]/h1[contains(.,'" + productData.concepttracker.quiz.chapterbased.name + "')])\", document, null, XPathResult. NUMBER_TYPE, null ).numberValue").then(function(status) {
	// 				if (status === 1) {
	// 					practiceQuizCreation.getQuizText(browser, productData.concepttracker.quiz.chapterbased.name)
	// 						.then(function(practiceQuizResult) {
	// 							console.log("practiceQuizResult:: " + practiceQuizResult);
	// 							preExistingCorrectAnswerAtInstructorEnd = stringutil.returnValueAfterSplit(stringutil.returnValueAfterSplit(practiceQuizResult, " ", 0), "/", 0);
	// 							preExistingTotalQuestionsAtInstructorEnd = stringutil.returnValueAfterSplit(stringutil.returnValueAfterSplit(practiceQuizResult, " ", 0), "/", 1);
	// 							console.log("preExistingCorrectAnswerAtInstructorEnd::" + preExistingCorrectAnswerAtInstructorEnd);
	// 							console.log("preExistingTotalQuestionsAtInstructorEnd::" + preExistingTotalQuestionsAtInstructorEnd);
	// 						});
	// 					done();
	// 				} else {
	// 					console.log("Chapter not present on Concept tracker");
	// 					studybitCount = 0;
	// 					preExistingCorrectAnswerAtInstructorEnd = 0;
	// 					preExistingTotalQuestionsAtInstructorEnd = 0;
	// 					done();
	// 				}
	// 			});
	// 	});
	// });

	it(". Navigate To StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Launch a Practice quiz", function(done) {
		practiceQuizCreation.navigateToPracticeQuizFromDesiredChapter(browser, 3).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". LTR-5399 :: Verify error message should not be displayed on Practice Quiz launch and also validate Continue button should be appear on launched Practice Quiz page", function(done) {
		pageLoadingTime = 0;
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
					report.stepStatusWithData("LTR-5399:: Error message is not displaying on the page on Practice Quiz launch",statusOfErrorPresence, "success") +
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

	it(". Take a Practice quiz from Chapter and exit", function(done) {
		//Call this function if you want a specific block to timeout after a specific time interval
		this.timeout(courseHelper.getElevatedTimeout("quiz"));
		takeQuizpo.takeQuiz(browser, done);

	});

	it(". Store the correct and Total Questions answers after Instructor's attempt on practice quiz from StudyBit", function(done) {
		practiceQuizCreation.verifyPracticeQuizResultPage(browser).then(function() {
			practiceQuizCreation.getQuestionsCorrect(browser).then(function(correct) {
				correctAnswerforTakeQuiz = correct;
				console.log(report.reportHeader() +
					report.printTestData("CAS ::  CORRECT ANSWER FROM QUIZZING VIA STUDYBITS ", correctAnswerforTakeQuiz) +
					report.reportFooter());
				practiceQuizCreation.getTotalQuestions(browser).then(function(totalQ) {
					totalQuestionsForTakeQuiz = totalQ;
					console.log(report.reportHeader() +
						report.printTestData("CAS ::  TOTAL QUESTIONS ATTEMPTED ON QUIZZING VIA STUDYBITS ", totalQuestionsForTakeQuiz) +
						report.reportFooter());
					done();
				});
			});
		});
	});

	it(". Reteke the Quiz", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("quiz"));
		takeQuizpo.retakePraticeQuiz(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});


	it(". Attempt a practice Quiz", function(done) {
		//Call this function if you want a specific block to timeout after a specific time interval
		this.timeout(courseHelper.getElevatedTimeout("quiz"));
		takeQuizpo.takeQuiz(browser, done);
	});

	it(". Store the correct and Total Questions answers after student's attempt on practice quiz", function(done) {
		this.retries(3);
		practiceQuizCreation.verifyPracticeQuizResultPage(browser).then(function() {
			practiceQuizCreation.getQuestionsCorrect(browser).then(function(correct) {
				correctAnswer = correct;
				console.log(report.reportHeader() +
					report.printTestData("CAS ::  CORRECT ANSWER FROM QUIZZING VIA CHAPTER ", correctAnswer) +
					report.reportFooter());
				practiceQuizCreation.getTotalQuestions(browser).then(function(totalQ) {
					totalQuestions = totalQ;
					console.log(report.reportHeader() +
						report.printTestData("CAS ::   QUESTIONS ANSWERED ON QUIZZING VIA CHAPTER ", totalQuestions) +
						report.reportFooter());
					done();
				});
			});
		});
	});


	it(". Record sum of Correct answer and Total questions for both quizzes attempted on student concept tracker", function(done) {
		var sumOFCorrectAnswerFromTakeAndRetake;
		var sumOFTotalQuestionsTakeAndRetake;
		sumOFCorrectAnswerFromTakeAndRetake = parseInt(correctAnswerforTakeQuiz) + parseInt(correctAnswer);
		finalSumOfCorrectAnswer = parseInt(preExistingCorrectAnswerAtInstructorEnd) + sumOFCorrectAnswerFromTakeAndRetake;
		sumOFTotalQuestionsTakeAndRetake = parseInt(totalQuestionsForTakeQuiz) + parseInt(totalQuestions);
		finalSumOfTotalQuestions = parseInt(preExistingTotalQuestionsAtInstructorEnd) + sumOFTotalQuestionsTakeAndRetake;
		console.log(report.reportHeader() +
			report.printTestData("CAS :: TOTAL ANSWERS CORRECT ON BOTH QUIZ ATTEMPTS INCLUDING PAST METRICS", finalSumOfCorrectAnswer) +
			report.reportFooter());
		console.log(report.reportHeader() +
			report.printTestData("CAS :: TOTAL QUESTIONS ATTEMPTED ON BOTH QUIZ ATTEMPTS INCLUDING PAST METRICS", finalSumOfTotalQuestions) +
			report.reportFooter());
		done();
	});

	it(". Record sum of Correct answer and Total questions for both quizzes attempted on Instructor concept tracker", function(done) {
		var sumOFCorrectAnswerFromTakeAndRetake;
		var sumOFTotalQuestionsTakeAndRetake;
		sumOFCorrectAnswerFromTakeAndRetake = parseInt(correctAnswerforTakeQuiz) + parseInt(correctAnswer);
		finalSumOfCorrectAnswerOnInstructorCT = parseInt(preExistingCorrectAnswer) + sumOFCorrectAnswerFromTakeAndRetake;
		sumOFTotalQuestionsTakeAndRetake = parseInt(totalQuestionsForTakeQuiz) + parseInt(totalQuestions);
		finalSumOfTotalQuestionsOnInstructorCT = parseInt(preExistingTotalQuestions) + sumOFTotalQuestionsTakeAndRetake;
		console.log(report.reportHeader() +
			report.printTestData("CAS :: TOTAL ANSWERS CORRECT ON BOTH QUIZ ATTEMPTS INCLUDING PAST METRICS", finalSumOfCorrectAnswer) +
			report.reportFooter());
		console.log(report.reportHeader() +
			report.printTestData("CAS :: TOTAL QUESTIONS ATTEMPTED ON BOTH QUIZ ATTEMPTS INCLUDING PAST METRICS", finalSumOfTotalQuestions) +
			report.reportFooter());
		done();
	});


	it(". Navigate To StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Navigate to ConceptTracker", function(done) {
		menuPage.selectSubTabOnStudyBoard(browser, "Concept Tracker", done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". LTR-3273 Validate correct|total answers on Instructor's StudyBoard ConceptTracker view after student's attempt", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("quiz"));
		testBotQuizMetricsStudent = finalSumOfCorrectAnswer + "/" + finalSumOfTotalQuestions + " Questions";
		console.log(report.reportHeader() + report.stepStatusWithData("ANALYTICS :: TestBot Calculated metrics for the attempted quiz by student   \" " + productData.concepttracker.quiz.chapterbased.name, testBotQuizMetricsStudent, "success") + report.reportFooter());
		practiceQuizCreation.getQuizText(browser, productData.concepttracker.quiz.chapterbased.name)
			.then(function(practiceQuizResult) {
				if (testBotQuizMetricsStudent.indexOf(practiceQuizResult) > -1) {
					correctAnswerAfterStudentAttempt = stringutil.returnValueAfterSplit(stringutil.returnValueAfterSplit(practiceQuizResult, " ", 0), "/", 0);
					totalAnsweredQuestionsByStudent = stringutil.returnValueAfterSplit(stringutil.returnValueAfterSplit(practiceQuizResult, " ", 0), "/", 1);
					console.log(report.reportHeader() +
						report.stepStatusWithData("ANALYTICS :: Practice Quiz metrics retrieved from the platform after the student attempted a quiz on  \" " + productData.concepttracker.quiz.chapterbased.name + " practice quiz analytics " + testBotQuizMetricsStudent + " is compared to", practiceQuizResult, "success") + report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("ANALYTICS :: Practice Quiz metrics retrieved from the platform after the student attempted a quiz on  \" " + productData.concepttracker.quiz.chapterbased.name + " practice quiz analytics " + testBotQuizMetricsStudent + " is compared to", practiceQuizResult, "failure") +
						report.reportFooter());
				}
			});
	});

	it(". Navigate to Concept Tracker", function(done) {
		menuPage.selectConceptTracker(userType, browser, done);

	});

	it(". LTR-3273 :: Validate correct|total answers on instructor's ConceptTracker view after student's attempt", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("concepttracker"));
		conceptrackerPageInstructor.isConceptTrackerLoaded(browser).text().should.become('Concept Tracker').then(function() {
			browser.sleep(4000).execute("return document.evaluate(\"count(//div[contains(@class,'chart-container ng-scope')]/h1[contains(.,'" + productData.concepttracker.quiz.chapterbased.name + "')])\", document, null, XPathResult. NUMBER_TYPE, null ).numberValue").then(function(status) {
				if (status == 1) {
					testBotQuizMetricsInstructor = finalSumOfCorrectAnswerOnInstructorCT + "/" + finalSumOfTotalQuestionsOnInstructorCT + " Questions";
					console.log(report.reportHeader() + report.stepStatusWithData("ANALYTICS :: TestBot Calculated metrics for the attempted quiz by student   \" " + productData.concepttracker.quiz.chapterbased.name, testBotQuizMetricsInstructor, "success") + report.reportFooter());
					//   browser.waitForElementByXPath("//h1[contains(.,'" + productData.concepttracker.quiz.chapterbased.name + "')]/following-sibling::div[@class='chartjs overview']//div[@class='question-count']//p", asserters.isDisplayed, 90000).text()
					practiceQuizCreation.getQuizText(browser, productData.concepttracker.quiz.chapterbased.name)
						.then(function(practiceQuizResult) {
							if (testBotQuizMetricsInstructor.indexOf(practiceQuizResult) > -1) {
								correctAnswerAfterStudentAttempt = stringutil.returnValueAfterSplit(stringutil.returnValueAfterSplit(practiceQuizResult, " ", 0), "/", 0);
								totalAnsweredQuestionsByStudent = stringutil.returnValueAfterSplit(stringutil.returnValueAfterSplit(practiceQuizResult, " ", 0), "/", 1);
								console.log(report.reportHeader() +
									report.stepStatusWithData("ANALYTICS :: Instructor created practice quiz analytics is reflecting on Instructor Manage My Course's Concept Tracker i.e. \" " + productData.concepttracker.quiz.chapterbased.name + " practice quiz analytics " + testBotQuizMetricsStudent + " is compared to", practiceQuizResult, "failure") + report.reportFooter());
							} else {
								console.log(report.reportHeader() +
									report.stepStatusWithData("ANALYTICS :: Instructor created practice quiz analytics is not reflecting on Instructor Manage My Course's Concept Tracker i.e.  \" " + productData.concepttracker.quiz.chapterbased.name + " practice quiz analytics " + testBotQuizMetricsStudent + " is compared to", practiceQuizResult, "success") +
									report.reportFooter());
									done();
							}
						});
				} else {
					console.log("Chapter not present on Concept tracker");
					preExistingCorrectAnswer = 0;
					preExistingTotalQuestions = 0;
					console.log(report.reportHeader() +
						report.stepStatusWithData("ANALYTICS :: Instructor created practice quiz analytics is not reflecting on Instructor Manage My Course's Concept Tracker i.e.  \" " + productData.concepttracker.quiz.chapterbased.name, preExistingCorrectAnswer + "/" + preExistingTotalQuestions + " Quiz Correct/Total Questions", "success") +
						report.reportFooter());
					done();
				}
			});
		});
	});

	it(". Log out as Instructor", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userSignOut.userSignOut(browser, done);
	});

});
