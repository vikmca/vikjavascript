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
var conceptrackerPageInstructor = require("../../../support/pageobject/" + pageobject + "/" + envName + "/concepttracker/instructor/concepttrackerpo");
var conceptrackerPageStudent = require("../../../support/pageobject/" + pageobject + "/" + envName + "/conceptTrackerpo");
var studybit = require("../../../support/pageobject/" + pageobject + "/" + envName + "/studybitpo");
var practiceQuizCreation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var clearAllSavedContent = require("../../../support/pageobject/" + pageobject + "/" + envName + "/clearData");
var studyboardpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/studyboardpo");
var studentAssessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var courseHelper = require("../../../support/helpers/courseHelper");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var report = require("../../../support/reporting/reportgenerator");
var _ = require('underscore');
var path = require('path');
var scriptName = path.basename(__filename);

describe(scriptName + '4LTR (' + 'Instructor' + ') :: STUDYBITS/PRACTICE QUIZ METRICS RECORDING ON INSTRUCTOR AND STUDENT CONCEPT TRACKER VALIDATION', function() {

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
	var sbCountOnStudentEnd;
	var correctAnswerforSBQuiz;
	var totalQuestionsForSBQuiz;
	var finalSumOfCorrectAnswer;
	var finalSumOfTotalQuestions;
	var finalSumOfCorrectAnswerAtInstructor;
	var finalSumOfTotalQuestionsAtInstructor;
	var testBotQuizMetricsAtInstructor;
	var testBotQuizMetrics;
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
		console.log(report.formatTestName("ANALYTICS :: STUDYBITS/PRACTICE QUIZ METRICS RECORDING ON INSTRUCTOR AND STUDENT CONCEPT TRACKER"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***conceptTracker.js***"));
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

	it(". Login as instructor", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
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

	it(". Navigate To StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Delete the created studybits if any", function(done) {
		clearAllSavedContent.clearStudyboard(browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Navigate to Concept Tracker", function(done) {
		menuPage.selectConceptTracker(userType, browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

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

	it(". Fetch existing StudyBits metrics on a chapter if any ", function(done) {
		conceptrackerPageInstructor.isConceptTrackerLoaded(browser).text().should.become('Concept Tracker').then(function() {
			practiceQuizCreation.getChapterPresenceStatusOnCTPage(browser, productData.concepttracker.quiz.studybitbased.name)
			.then(function(status) {
				if (status == 1) {
					studybit.getStudyBitCountTextOnCT(browser, productData.concepttracker.quiz.studybitbased.name)
						.then(function(studybitCount) {
							console.log(report.reportHeader() +
								report.stepStatusWithData("ANALYTICS :: StudyBits present for \" " + productData.concepttracker.quiz.studybitbased.name + " :", studybitCount, "success") +
								report.reportFooter());
							done();
						});
				} else {
					console.log("Chapter not present on Concept tracker");
					studybitCount = 0;
					console.log(report.reportHeader() +
						report.stepStatusWithData("ANALYTICS :: StudyBits present for \" " + productData.concepttracker.quiz.studybitbased.name + " :", studybitCount, "success") +
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

	it(". Fetch existing StudyBits metrics on a chapter if any on Instructor's Studyboard ConceptTracker", function(done) {
		practiceQuizCreation.getChapterPresenceStatusOnCTPage(browser, productData.concepttracker.quiz.studybitbased.name)
		// browser.execute("return document.evaluate(\"count(//div[contains(@class,'chart-container ng-scope')]/h1[contains(.,'" + productData.concepttracker.quiz.studybitbased.name + "')])\", document, null, XPathResult. NUMBER_TYPE, null ).numberValue")
		.then(function(status) {
			if (status === 1) {
				studybit.getStudyBitCountTextOnCT(browser, productData.concepttracker.quiz.studybitbased.name)
					.then(function(studybitCount) {
						sbCountOnStudentEnd = parseInt(stringutil.returnValueAfterSplit(studybitCount, " ", 0));
						done();
					});
			} else {
				console.log("Chapter not present on Concept tracker");
				sbCountOnStudentEnd = 0;
				done();
			}
		});
	});

	it(". Navigate to TOC ", function(done) {
		tocPage.navigateToToc(browser).nodeify(done);
	});

	it(". Wait For page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Click on List view and Verify", function(done) {
		tocPage.selectListView(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});


	it(". Navigate to a Chapter", function(done) {
		tocPage.navigateToAChapterByListView(productData.chapter.id, browser, 3);
		done();
	});

	it(". Navigate to a topic", function(done) {
		tocPage.navigateToATopicByListView(browser, done, productData.chapter.topic.id, 2);
	});

	it(". Refresh the page and wait until page is loaded successfully", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Create a Text StudyBit", function(done) {
		studybit.createTextStudyBit(browser, done, productData.concepttracker.quiz.studybitbased.studybit.text.id,
			productData.concepttracker.quiz.studybitbased.studybit.text.concepts,
			productData.concepttracker.quiz.studybitbased.studybit.text.usertag,
			productData.concepttracker.quiz.studybitbased.studybit.text.notes,
			productData.concepttracker.quiz.studybitbased.studybit.text.comprehension,
			productData.concepttracker.quiz.studybitbased.studybit.text.windowScrollY);
	});

	it(". Refresh the page and wait until page is loaded successfully", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Create a KeyTerm StudyBit", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		studybit.createKeyTermStudyBit(browser, done,
			productData.concepttracker.quiz.studybitbased.studybit.keyterm.id,
			productData.concepttracker.quiz.studybitbased.studybit.keyterm.definition,
			productData.concepttracker.quiz.studybitbased.studybit.keyterm.comprehension,
			productData.concepttracker.quiz.studybitbased.studybit.keyterm.publishertag,
			productData.concepttracker.quiz.studybitbased.studybit.keyterm.notes,
			productData.concepttracker.quiz.studybitbased.studybit.keyterm.usertag,
			productData.concepttracker.quiz.studybitbased.studybit.keyterm.windowScrollY);
	});

	it(". Navigate To StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Verify the presence of text StudyBit on StudyBoard ", function(done) {
		studybit.verifyTheCreatedSBOnStudyBoard(browser, "text").then(function() {
			done();
		});
	});

	it(". Launch the practice quiz from studybit", function(done) {
		practiceQuizCreation.navigateToPracticeQuizFromStudyBits(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". LTR-5399 :: Verify error message should not be displayed on practice quiz launch and also validate Continue button should be appear on launched quiz page", function(done) {
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

	it(". Take a Practice quiz from studybits ", function(done) {
		//Call this function if you want a specific block to timeout after a specific time interval
		this.timeout(courseHelper.getElevatedTimeout("quiz"));
		takeQuizpo.takeQuiz(browser, done);
	});

	it(". Store the correct and Total Questions answers after Instructor's attempt on practice quiz from StudyBit", function(done) {
		practiceQuizCreation.verifyPracticeQuizResultPage(browser).then(function() {
			practiceQuizCreation.getQuestionsCorrect(browser).then(function(correct) {
				correctAnswerforSBQuiz = correct;
				console.log(report.reportHeader() +
					report.printTestData("CAS ::  CORRECT ANSWER FROM QUIZZING VIA STUDYBITS ", correctAnswerforSBQuiz) +
					report.reportFooter());
				practiceQuizCreation.getTotalQuestions(browser).then(function(totalQ) {
					totalQuestionsForSBQuiz = totalQ;
					console.log(report.reportHeader() +
						report.printTestData("CAS ::  TOTAL QUESTIONS ATTEMPTED ON QUIZZING VIA STUDYBITS ", totalQuestionsForSBQuiz) +
						report.reportFooter());
					done();
				});
			});
		});
	});

	it(". Navigate To StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Launch the Practice Quiz", function(done) {
		practiceQuizCreation.navigateToPracticeQuizFromDesiredChapter(browser, productData.concepttracker.quiz.chapterbased.desiredchapterforquiz).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
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

	it(". Attempt a practice Quiz", function(done) {
		//Call this function if you want a specific block to timeout after a specific time interval
		this.timeout(courseHelper.getElevatedTimeout("quiz"));
		takeQuizpo.takeQuiz(browser, done);
	});

	it(". Store the correct and Total Questions answers after student's attempt on practice quiz", function(done) {
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


	it(". Record sum of Correct answer and Total questions for both quizzes attempted", function(done) {
		var sumOFCorrectAnswerSBAndChapter;
		var sumOFTotalQuestionsSBAndChapter;
		sumOFCorrectAnswerSBAndChapter = parseInt(correctAnswerforSBQuiz) + parseInt(correctAnswer);
		finalSumOfCorrectAnswer = parseInt(preExistingCorrectAnswerAtInstructorEnd) + sumOFCorrectAnswerSBAndChapter;
		sumOFTotalQuestionsSBAndChapter = parseInt(totalQuestionsForSBQuiz) + parseInt(totalQuestions);
		finalSumOfTotalQuestions = parseInt(preExistingTotalQuestionsAtInstructorEnd) + sumOFTotalQuestionsSBAndChapter;
		console.log(report.reportHeader() +
			report.printTestData("CAS :: TOTAL ANSWERS CORRECT ON BOTH QUIZ ATTEMPTS INCLUDING PAST METRICS", finalSumOfCorrectAnswer) +
			report.reportFooter());
		console.log(report.reportHeader() +
			report.printTestData("CAS :: TOTAL QUESTIONS ATTEMPTED ON BOTH QUIZ ATTEMPTS INCLUDING PAST METRICS", finalSumOfTotalQuestions) +
			report.reportFooter());
		done();
	});

	it(". LTR-3273 :: Validate correct|total answers on student's ConceptTracker view after student's attempt", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("quiz"));
		browser.refresh().sleep(10000).then(function(){
			testBotQuizMetrics = finalSumOfCorrectAnswer + "/" + finalSumOfTotalQuestions + " Questions";
			console.log(report.reportHeader() + report.stepStatusWithData("ANALYTICS :: TestBot Calculated metrics for the attempted quiz by student   \" " + productData.concepttracker.quiz.chapterbased.name, testBotQuizMetrics, "success") + report.reportFooter());
			practiceQuizCreation.getQuizText(browser, productData.concepttracker.quiz.chapterbased.name)
				.then(function(practiceQuizResult) {
					correctAnswerAfterStudentAttempt = stringutil.returnValueAfterSplit(stringutil.returnValueAfterSplit(practiceQuizResult, " ", 0), "/", 0);
					totalAnsweredQuestionsByStudent = stringutil.returnValueAfterSplit(stringutil.returnValueAfterSplit(practiceQuizResult, " ", 0), "/", 1);
					console.log("practiceQuizResult::"+practiceQuizResult);
					console.log("testBotQuizMetrics::"+testBotQuizMetrics);
					if (practiceQuizResult.indexOf(testBotQuizMetrics) > -1) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("ANALYTICS :: Practice Quiz metrics retrieved from the platform after the student attempted a quiz on  \" " + productData.concepttracker.quiz.chapterbased.name + " Robo analytics " + testBotQuizMetrics + " is compared with ", practiceQuizResult, "success") + report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("ANALYTICS :: Practice Quiz metrics retrieved from the platform after the student attempted a quiz on  \" " + productData.concepttracker.quiz.chapterbased.name + " Robo analytics " + testBotQuizMetrics + " is compared with ", practiceQuizResult, "failure") + report.reportFooter());
							this.retries(2);
					}
				});
		});
	});


	it(". Fetch existing StudyBits metrics on a chapter if any on Instructor Studyboard ConceptTracker", function(done) {
		conceptrackerPageStudent.getChapterPresenceStatusOnCT(browser, productData.concepttracker.quiz.studybitbased.name).then(function(status) {
			console.log("status" + status);
			if (status === 1) {
				studybit.getStudyBitCountTextOnCT(browser, productData.concepttracker.quiz.studybitbased.name)
					.then(function(studybitCount) {
						console.log("studybitCount" + studybitCount);
						sbCountOnStudentEnd = parseInt(stringutil.returnValueAfterSplit(studybitCount, " ", 0));
						if (sbCountOnStudentEnd == 2) {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Study bit count on Concept Tracker " + sbCountOnStudentEnd + " is compared against", 2, "success") +
								report.reportFooter());
							done();
						}
					});
			} else {
				console.log("Chapter not present on Concept tracker");
			}
		});
	});

	it(". Click on studybit link on ConceptTracker", function(done) {
		conceptrackerPageStudent.getChapterPresenceStatusOnCT(browser, productData.concepttracker.quiz.studybitbased.name).then(function(status) {
			console.log("status" + status);
			if (status === 1) {
				studybit.getStudyBitCountTextOnCT(browser, productData.concepttracker.quiz.studybitbased.name)
					.then(function(scrollToStudybitCount) {
						browser
							.getLocationInView(scrollToStudybitCount)
						studybit.clickOnStudyBitCountOnCT(browser, productData.concepttracker.quiz.studybitbased.name)
							.then(function(count) {
								pageLoadingTime = 0;
								takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
							});
					});
			} else {
				console.log("Chapter not present on Concept tracker");
			}
		});
	});

	it(". Validate Studybit tab is active and studybit count on studybit tab", function(done) {
		conceptrackerPageStudent.isTabStateIsNotActive(browser, "Concept Tracker").then(function(conceptTrackerStatus) {
			conceptrackerPageStudent.isTabStateIsActive(browser, "StudyBit").then(function(studyBitStatus) {
				studyboardpo.getStudybitCount(browser).then(function(studyBitCount) {
					if (conceptTrackerStatus && studyBitStatus && (_.size(studyBitCount) == sbCountOnStudentEnd)) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Concept Tracker button is inactive :" + conceptTrackerStatus + ", StudyBit button is active " + studyBitStatus + " and studybit count is", _.size(studyBitCount), "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Concept Tracker button is inactive :" + conceptTrackerStatus + ", StudyBit button is active " + studyBitStatus + " and studybit count is", _.size(studyBitCount), "failure") +
							report.reportFooter());
					}
				});
			});
		});
	});

	it(". Navigate to Concept Tracker", function(done) {
		menuPage.selectConceptTracker(userType, browser, done);

	});

	it(". Record sum of Correct answer and Total questions for both attempted quiz on instructor ConceptTracker", function(done) {
		var sumOFCorrectAnswerSBAndChapter;
		var sumOFTotalQuestionsSBAndChapter;
		sumOFCorrectAnswerSBAndChapter = parseInt(correctAnswerforSBQuiz) + parseInt(correctAnswer);
		finalSumOfCorrectAnswerAtInstructor = parseInt(preExistingCorrectAnswer) + sumOFCorrectAnswerSBAndChapter;
		sumOFTotalQuestionsSBAndChapter = parseInt(totalQuestionsForSBQuiz) + parseInt(totalQuestions);
		finalSumOfTotalQuestionsAtInstructor = parseInt(preExistingTotalQuestions) + sumOFTotalQuestionsSBAndChapter;
		console.log(report.reportHeader() +
			report.printTestData("instructor ConceptTracker :: TOTAL ANSWERS CORRECT ON BOTH QUIZ ATTEMPTS INCLUDING PAST METRICS", finalSumOfCorrectAnswer) +
			report.reportFooter());
		console.log(report.reportHeader() +
			report.printTestData("instructor ConceptTracker :: TOTAL QUESTIONS ATTEMPTED ON BOTH QUIZ ATTEMPTS INCLUDING PAST METRICS", finalSumOfTotalQuestions) +
			report.reportFooter());
		done();
	});

	it(". Validate correct|total answers on instructor's ConceptTracker view after student's attempt", function(done) {
			this.timeout(courseHelper.getElevatedTimeout("concepttracker"));
			conceptrackerPageInstructor.isConceptTrackerLoaded(browser).text().should.become('Concept Tracker').then(function() {
				practiceQuizCreation.getChapterPresenceStatusOnCTPage(browser, productData.concepttracker.quiz.chapterbased.name)
				.then(function(status) {
					if (status == 1) {
						testBotQuizMetricsAtInstructor = finalSumOfCorrectAnswerAtInstructor + "/" + finalSumOfTotalQuestionsAtInstructor + " Questions";
						console.log(report.reportHeader() + report.stepStatusWithData("ANALYTICS :: TestBot Calculated metrics for the attempted quiz by student   \" " + productData.concepttracker.quiz.chapterbased.name, testBotQuizMetrics, "success") + report.reportFooter());
						practiceQuizCreation.getQuizText(browser, productData.concepttracker.quiz.chapterbased.name)
							.then(function(practiceQuizResult) {
								correctAnswerAfterStudentAttempt = stringutil.returnValueAfterSplit(stringutil.returnValueAfterSplit(practiceQuizResult, " ", 0), "/", 0);
								totalAnsweredQuestionsByStudent = stringutil.returnValueAfterSplit(stringutil.returnValueAfterSplit(practiceQuizResult, " ", 0), "/", 1)
								if (practiceQuizResult.indexOf(testBotQuizMetricsAtInstructor) > -1) {
									console.log(report.reportHeader() +
										report.stepStatusWithData("ANALYTICS :: Practice Quiz metrics retrieved from the platform after the instructor attempted a quiz on  \" " + productData.concepttracker.quiz.chapterbased.name + " Robo analytics " + testBotQuizMetricsAtInstructor + " is compared with ", practiceQuizResult, "failure") + report.reportFooter());
								} else {
									console.log(report.reportHeader() +
										report.stepStatusWithData("ANALYTICS :: Practice Quiz metrics retrieved from the platform after the instructor attempted a quiz on  \" " + productData.concepttracker.quiz.chapterbased.name + " Robo analytics " + testBotQuizMetricsAtInstructor + " is not reflecting as compared with ", practiceQuizResult, "success") + report.reportFooter());
										done();
								}
							});
					} else {
						console.log("Chapter not present on Concept tracker");
						preExistingCorrectAnswer = 0;
						preExistingTotalQuestions = 0;
						console.log(report.reportHeader() +
							report.stepStatusWithData("ANALYTICS :: Practice Quiz metrics is not appearing on the instructor Concept Tracker as expected", status ,"success") +
							report.reportFooter());
						done();
					}
				});
			});
	});

	it(". Navigate To StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Delete the created studybits if any", function(done) {
		clearAllSavedContent.clearStudyboard(browser, done);
	});

	it(". Log out as instructor", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userSignOut.userSignOut(browser, done);
	});

});

//total test cases 43
