require('colors');
var wd = require('wd');
var asserters = wd.asserters;
var testData = require("../../../../../test_data/data.json");
var session = require("../../../support/setup/browser-session");
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var tocPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/tocpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var studybit = require("../../../support/pageobject/" + pageobject + "/" + envName + "/studybitpo");
var studentAssessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var clearAllSavedContent = require("../../../support/pageobject/" + pageobject + "/" + envName + "/clearData");
var report = require("../../../support/reporting/reportgenerator");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var practiceQuizCreation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var _ = require('underscore');
var courseHelper = require("../../../support/helpers/courseHelper");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'STUDENT :: VALIDATE USER IS NOT ABLE TO ATTEMPT STUDYBIT PRACTICE QUIZ POST DELETING ALL STUDYBITS', function() {
	var browser;
	var allPassed = true;
	var userType;
	var courseName;
	var product;
	var data;
	var productData;
	var pageLoadingTime;
	var totalTime;
	var serialNumber = 0;

	before(function(done) {

		browser = session.create(done);

		userType = "student";

		product = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString());
		if (product === "default") {
			product = testData.existingCourseDetails.product;
		}
		courseName = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_COURSE.toString());
		if (courseName === "default") {

			courseName = testData.existingCourseDetails.coursename;
		}

		data = loginPage.setLoginData(userType);
		productData = loginPage.getProductData();
		totalTime = 0;
		//Reports
		console.log(report.formatTestName("STUDENT :: 4LTR FEATURES :: USER IS NOT ABLE TO ATTEMPT STUDYBIT PRACTICE QUIZ POST DELETING ALL STUDYBITS"));
		console.log("======================================");
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***validateStudybitPracticeQuizPostdeletingAllStudybit.js***"));
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


	it(". Login to 4LTR platform as Student", function(done) {
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

	it(". Navigate to StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Delete the created studybits if any", function(done) {
		clearAllSavedContent.clearStudyboard(browser, done);
	});

	it(". Navigate to TOC ", function(done) {
		tocPage.navigateToToc(browser).nodeify(done);
	});

	it(". Navigate to a Chapter", function(done) {
		tocPage.getChapterTitle(productData.chapter.id, browser)
			.then(function(text) {
				text.should.contain(productData.chapter.title);
			})
			.then(function() {
				tocPage.navigateToAChapter(productData.chapter.id, browser)
					.nodeify(done);
			});
	});

	it(". Navigate to a topic", function(done) {
		pageLoadingTime = 0;
		tocPage.navigateToATopic(productData.chapter.id, productData.chapter.topic.id, browser)
			.then(function() {
				tocPage.disposeFirstVisitTopicModalIfVisible(browser).then(function() {
					tocPage.getTopicTitleHero(browser).then(function(text) {
						text.should.contain(productData.chapter.topic.titlehero);
						takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
					});
				});
			});
	});

	it(". Create a Text StudyBit", function(done) {
		studybit.createTextStudyBit(browser, done, productData.chapter.topic.studybit.text.id,
			productData.chapter.topic.studybit.text.concepts,
			productData.chapter.topic.studybit.text.usertag,
			productData.chapter.topic.studybit.text.notes,
			productData.chapter.topic.studybit.text.comprehension,
			productData.chapter.topic.studybit.text.windowScrollY);
	});

	it(". Verify page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Edit Text StudyBit on Narrative view", function(done) {
		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) == "mobile" || stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) === "iOS") {
			this.skip();
		} else {
			studybit.editTextStudyBit(browser, done, productData.chapter.topic.studybit.text.id,
				productData.chapter.topic.studybit.text.concepts,
				productData.chapter.topic.studybit.text.editedusertag,
				productData.chapter.topic.studybit.text.editednotes,
				productData.chapter.topic.studybit.text.comprehension,
				productData.chapter.topic.studybit.text.windowScrollY);

		}
	});


	it(". Verify page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Verify the presence of edited text StudyBit on Narrative Page ", function(done) {
		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) == "mobile" || stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) === "iOS") {
			this.skip();
		} else {
			studybit.validateTextStudyBitOnNarrativeView(browser, done,
				productData.chapter.topic.studybit.text.id,
				productData.chapter.topic.studybit.text.editedcomprehension,
				productData.chapter.topic.studybit.text.editednotes,
				productData.chapter.topic.studybit.text.concepts,
				productData.chapter.topic.studybit.text.editedusertag);
		}

	});

	it(". Navigate to StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Wait for page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Validate that the user is able to select 'On My filtered studybit' radio button if any studybit is present", function(done) {
		studybit.navigateToCreateStudybitPanel(browser).then(function() {
			studybit.validateOnMyFilteredStudybitsEnabled(browser).then(function(statusOfRadioButton) {
				if (statusOfRadioButton === "true") {
					console.log(report.reportHeader() +
						report.stepStatusWithData("On my filtered studybits checkbox is selected", statusOfRadioButton, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("On my filtered studybits checkbox is selected", statusOfRadioButton, "failure") +
						report.reportFooter());
				}
			});
		});
	});

	it(". Delete the created studybits if any", function(done) {
		clearAllSavedContent.clearStudybitsOnStudyboard(browser, done);
	});

	it(". Validate On My filtered studybits radio button is disabled after deletion of all studybits", function(done) {
		studybit.validateOnMyFilteredStudybitsDisabled(browser).then(function(statusOfRadioButtonDisable) {
			if (statusOfRadioButtonDisable === "true") {
				console.log(report.reportHeader() +
					report.stepStatusWithData("On My filtered studybits radio button is selected", statusOfRadioButtonDisable, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("On My filtered studybits radio button is selected", statusOfRadioButtonDisable, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Close practice quiz panel", function(done) {
		studybit.closePacticeQuizPanel(browser, done);
	});

	it(". Launch the practice Quiz ", function(done) {
		practiceQuizCreation.navigateToPracticeQuizFromDesiredChapter(browser, productData.concepttracker.quiz.chapterbased.desiredchapterforquiz).then(function() {
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

	it(". Attempt 3 questions in practice Quiz", function(done) {
		//Call this function if you want a specific block to timeout after a specific time interval
		this.timeout(courseHelper.getElevatedTimeout("quiz"));
		takeQuizpo.submitTwoQuesFromPracticeQuiz(browser, done);
	});

	it(". Validate if Quiz resets to first question after refreshing the quiz in the middle of an attempt", function(done) {
		studybit.validateRefreshStatus(browser).then(function(attemptStatus) {
			if (attemptStatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Quiz does not resets to first question after refreshing the quiz in the middle of an attempt", attemptStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Quiz resets to first question after refreshing the quiz in the middle of an attempt", attemptStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Log out as Student", function(done) {
		userSignOut.userSignOut(browser, done);
	});


});
