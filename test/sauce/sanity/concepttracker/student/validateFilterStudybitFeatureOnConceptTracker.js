var wd = require('wd');
var asserters = wd.asserters;
var stringutil = require("../../../util/stringUtil");
var testData = require("../../../../../test_data/data.json");
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
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var notesFeature = require("../../../support/pageobject/" + pageobject + "/" + envName + "/notespo");
var courseHelper = require("../../../support/helpers/courseHelper");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var report = require("../../../support/reporting/reportgenerator");

var _ = require('underscore');
var path = require('path');
var scriptName = path.basename(__filename);

describe(scriptName + '4LTR (' + 'Instructor/Student' + ') :: STUDYBITS/PRACTICE QUIZ METRICS RECORDING ON INSTRUCTOR AND STUDENT CONCEPT TRACKER VALIDATION', function() {

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
	var preExistingCorrectAnswerAtStudentEnd;
	var preExistingTotalQuestionsAtStudentEnd;
	var sbCountOnStudentEnd;
	var correctAnswerforSBQuiz;
	var totalQuestionsForSBQuiz;
	var finalSumOfCorrectAnswer;
	var finalSumOfTotalQuestions;
	var testBotQuizMetrics;
	var pageLoadingTime;
	var totalTime;
	var serialNumber = 0;

	before("CONCEPT TRACKER::STUDYBITS ARE FILTERING ON CONCEPT TRACKER USING CHAPTERS AND THEIR CONCEPTS", function(done) {

		browser = session.create(done);
		userType = "student";
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
		console.log(report.formatTestName("CONCEPT TRACKER::STUDYBITS ARE FILTERING ON CONCEPT TRACKER USING CHAPTERS AND THEIR CONCEPTS"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***validateFilterStudybitFeatureOnConceptTracker.js***"));
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

	it(". Login as student", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		data = loginPage.setLoginData(userType);
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

	it(". Log out as Student", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userSignOut.userSignOut(browser, done);
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

	it(". Fetch existing StudyBits metrics on a chapter if any ", function(done) {
		conceptrackerPageInstructor.isConceptTrackerLoaded(browser).text().should.become('Concept Tracker').then(function() {
			practiceQuizCreation.getChapterPresenceStatusOnCTPage(browser, productData.concepttracker.quiz.studybitbased.name)
			.then(function(status) {
				if (status == 1) {
					studybit.getStudyBitCountTextOnCT(browser, productData.concepttracker.quiz.studybitbased.name)
						.then(function(studybitCountsOnCT) {
							studybitCount = studybitCountsOnCT;
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

	// it(". Fetch existing StudyBits metrics on a chapter if any ", function(done) {
	// 	conceptrackerPageInstructor.isConceptTrackerLoaded(browser).text().should.become('Concept Tracker').then(function() {
	// 		browser.execute("return document.evaluate(\"count(//div[contains(@class,'chart-container ng-scope')]/h1[contains(.,'" + productData.concepttracker.quiz.studybitbased.name + "')])\", document, null, XPathResult. NUMBER_TYPE, null ).numberValue").then(function(status) {
	// 			if (status == 1) {
	// 				browser.waitForElementByXPath("//h1[contains(.,'" + productData.concepttracker.quiz.studybitbased.name + "')]/following-sibling::div[contains(@class,'chartjs overview')]//div[@class='studybits']//div[contains(@class,'studybit-count')]", asserters.isDisplayed, 90000).text().then(function(studybitCountsOnCT) {
	// 					studybitCount = studybitCountsOnCT;
	// 					console.log(report.reportHeader() +
	// 						report.stepStatusWithData("ANALYTICS :: StudyBits present for \" " + productData.concepttracker.quiz.studybitbased.name + " :", studybitCount, "success") +
	// 						report.reportFooter());
	// 					done();
	// 				});
	// 			} else {
	// 				console.log("Chapter not present on Concept tracker");
	// 				studybitCount = 0;
	// 				console.log(report.reportHeader() +
	// 					report.stepStatusWithData("ANALYTICS :: StudyBits present for \" " + productData.concepttracker.quiz.studybitbased.name + " :", studybitCount, "success") +
	// 					report.reportFooter());
	// 				done();
	// 			}
	// 		});
	// 	});
	// });


	it(". Log out as Instructor", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userSignOut.userSignOut(browser, done);
	});

	it(". Login as student", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userType = "student";
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});


	it(". Select a Course and launch", function(done) {
		loginPage.launchACourse(userType, courseName, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
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

	// it(". Fetch existing StudyBits metrics on a chapter if any on Student ConceptTracker", function(done) {
	// 	browser.execute("return document.evaluate(\"count(//div[contains(@class,'chart-container ng-scope')]/h1[contains(.,'" + productData.concepttracker.quiz.studybitbased.name + "')])\", document, null, XPathResult. NUMBER_TYPE, null ).numberValue").then(function(status) {
	// 		if (status === 1) {
	// 			browser.waitForElementByXPath("//h1[contains(.,'" + productData.concepttracker.quiz.studybitbased.name + "')]/following-sibling::div[contains(@class,'chartjs overview')]//div[@class='studybits']//div[contains(@class,'studybit-count')]", asserters.isDisplayed, 90000).text().then(function(studybitCountsOnCT) {
	// 				sbCountOnStudentEnd = parseInt(stringutil.returnValueAfterSplit(studybitCountsOnCT, " ", 0));
	// 				done();
	// 			});
	// 		} else {
	// 			console.log("Chapter not present on Concept tracker");
	// 			sbCountOnStudentEnd = 0;
	// 			done();
	// 		}
	// 	});
	// });
	it(". Fetch existing StudyBits metrics on a chapter if any on Student ConceptTracker", function(done) {
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
		this.retries(3);
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Create a Text StudyBit", function(done) {
		studybit.createTextStudyBit(browser, done, productData.concepttracker.quiz.studybitbased.studybit.text.id,
			productData.concepttracker.quiz.studybitbased.studybit.text.concepts[0],
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

	it(". Create a note on a topic page", function(done) {
		notesFeature.notesCreation(browser, done, testData.notesTerms.noteText);
	});

	it(". Create a note on a topic page", function(done) {
		notesFeature.notesCreation(browser, done, testData.notesTerms.noteText2);
	});


	it(". Navigate To StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Verify the presence of all created StudyBits and notes present on StudyBoard ", function(done) {
		studyboardpo.getStudybitCount(browser).then(function(studyBitCountsOnStudyBoard) {
			console.log("studyBitCount" + _.size(studyBitCountsOnStudyBoard));
			if (_.size(studyBitCountsOnStudyBoard) === 4) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Stubord item counts are : 4 is compared to the created studybits count", _.size(studyBitCountsOnStudyBoard), "success") + report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Stubord item counts are : 4 is compared to the created studybits count", _.size(studyBitCountsOnStudyBoard), "failure") +
					report.reportFooter());
			}

		});
	});

	it(". Edit comprehension level of 2nd notes on studyboard ", function(done) {
		notesFeature.changeNotesComprehension(browser, done);
	});

	it(". Edit comprehension level of 1st notes on studyboard ", function(done) {
		notesFeature.change2ndNotesComprehension(browser, done);
	});

	it(". Wait for page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});

	});

	it(". Navigate to ConceptTracker", function(done) {
		browser.execute("window.scrollTo(0,0)").then(function() {
			menuPage.selectSubTabOnStudyBoard(browser, "Concept Tracker", done);
		});
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	// it(". Fetch existing StudyBits metrics on a chapter if any on Student ConceptTracker", function(done) {
	// 	browser
	// 		.execute("window.scrollBy(0,0)")
	// 		.execute("return document.evaluate(\"count(//div[contains(@class,'chart-container ng-scope')]/h1[contains(.,'" + productData.concepttracker.quiz.studybitbased.name + "')])\", document, null, XPathResult. NUMBER_TYPE, null ).numberValue").then(function(status) {
	// 			if (status === 1) {
	// 				browser.waitForElementByXPath("//h1[contains(.,'" + productData.concepttracker.quiz.studybitbased.name + "')]/following-sibling::div[contains(@class,'chartjs overview')]//div[@class='studybits']//div[contains(@class,'studybit-count')]", asserters.isDisplayed, 90000).text().then(function(studybitCountsOnCT) {
	// 					sbCountOnStudentEnd = parseInt(stringutil.returnValueAfterSplit(studybitCountsOnCT, " ", 0));
	// 					if (sbCountOnStudentEnd == 4) {
	// 						console.log(report.reportHeader() +
	// 							report.stepStatusWithData("Study bit count on Concept Tracker " + sbCountOnStudentEnd + " is compared against", 4, "success") +
	// 							report.reportFooter());
	// 						done();
	// 					}
	// 				});
	// 			} else {
	// 				console.log("Chapter not present on Concept tracker");
	// 			}
	// 		});
	// });
	it(". Fetch existing StudyBits metrics on a chapter if any on Student ConceptTracker", function(done) {
		conceptrackerPageStudent.getChapterPresenceStatusOnCT(browser, productData.concepttracker.quiz.studybitbased.name).then(function(status) {
			console.log("status" + status);
			if (status === 1) {
				studybit.getStudyBitCountTextOnCT(browser, productData.concepttracker.quiz.studybitbased.name)
					.then(function(studybitCount) {
						console.log("studybitCount" + studybitCount);
						sbCountOnStudentEnd = parseInt(stringutil.returnValueAfterSplit(studybitCount, " ", 0));
						if (sbCountOnStudentEnd == 4) {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Study bit count on Concept Tracker " + sbCountOnStudentEnd + " is compared against", 4, "success") +
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
							studybit.scrollToChapterLocation(browser, productData.concepttracker.quiz.studybitbased.name).then(function(){
									studybit.clickOnStudyBitCountOnCT(browser, productData.concepttracker.quiz.studybitbased.name)
										.then(function(count) {
											pageLoadingTime = 0;
											takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
										});
							})
					});
			} else {
				console.log("Chapter not present on Concept tracker");
			}
		});
	});

	// it(". Click on studybit link on ConceptTracker", function(done) {
	// 	browser.execute("return document.evaluate(\"count(//div[contains(@class,'chart-container ng-scope')]/h1[contains(.,'" + productData.concepttracker.quiz.studybitbased.name + "')])\", document, null, XPathResult. NUMBER_TYPE, null ).numberValue").then(function(status) {
	// 		if (status === 1) {
	// 			browser.waitForElementByXPath("//h1[contains(.,'" + productData.concepttracker.quiz.studybitbased.name + "')]", asserters.isDisplayed, 90000).then(function(scrollToStudybitCount) {
	// 				browser
	// 					.getLocationInView(scrollToStudybitCount)
	// 					.waitForElementByXPath("//h1[contains(.,'" + productData.concepttracker.quiz.studybitbased.name + "')]/following-sibling::div[contains(@class,'chartjs overview')]//div[@class='studybits']//div[contains(@class,'studybit-count')]", asserters.isDisplayed, 90000).click().then(function(count) {
	// 						pageLoadingTime = 0;
	// 						takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	// 					});
	// 			});
	// 		} else {
	// 			console.log("Chapter not present on Concept tracker");
	// 		}
	// 	});
	// });

	it(". Validate Studybit tab is active and studybit count on studybit tab", function(done) {
		conceptrackerPageStudent.isTabStateIsNotActive(browser, "Concept Tracker").then(function(conceptTrackerStatus) {
			conceptrackerPageStudent.isTabStateIsActive(browser, "StudyBit").then(function(studyBitStatus) {
				studyboardpo.getStudybitCount(browser).then(function(studyBitCount) {
					if (conceptTrackerStatus && studyBitStatus && (_.size(studyBitCount) === 4)) {
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

	it(". Click on filter toggle button and validate filtered studybis's chapter is selected", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		var chapterName = productData.concepttracker.quiz.chapterbased.desiredchapterforquiz;
		var chapterNumber = parseInt(stringutil.returnValueAfterSplit(chapterName, " ", 1));
		console.log("645" + chapterNumber);
		studyboardpo.clickOnFilter(browser).then(function() {
			studyboardpo.validateFilteredChapterIsSelected(browser, chapterNumber).then(function(checkedBoxBackgroundColor) {
				console.log("checkedBoxBackgroundColor" + checkedBoxBackgroundColor);
				if (checkedBoxBackgroundColor.toString() == "rgb(140, 208, 209)" || checkedBoxBackgroundColor.toString() == "rgb(50, 130, 133)") {
					console.log(report.reportHeader() +
						report.stepStatusWithData("CheckBox background color is", checkedBoxBackgroundColor + " and compered with rgb(140, 208, 209)", "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("CheckBox background color is", checkedBoxBackgroundColor + " and compered with rgb(140, 208, 209)", "failure") +
						report.reportFooter());
				}
			});
		});
	});

	it(". Validate remaining chapteres are diselected on filter studybit panel", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		studyboardpo.validateRemaingChapterUnselected(browser).then(function(unCheckedBoxBackgroundColor) {
			console.log("checkedBoxBackgroundColor" + unCheckedBoxBackgroundColor);
			if (unCheckedBoxBackgroundColor.toString() == "rgb(255, 255, 255)") {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Unchecked checkBox background color is", unCheckedBoxBackgroundColor + " and compered with rgb(255, 255, 255)", "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Unchecked checkBox background color is", unCheckedBoxBackgroundColor + " and compered with rgb(255, 255, 255)", "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Wait for page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});

	});

	it(". Navigate to ConceptTracker", function(done) {
		menuPage.selectSubTabOnStudyBoard(browser, "Concept Tracker", done);
	});


	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Click on Studybit Link under concepts", function(done) {
		var chapterName = productData.concepttracker.quiz.chapterbased.desiredchapterforquiz;
		var chapterNumber = stringutil.returnValueAfterSplit(chapterName, " ", 1);
		pageLoadingTime = 0;

		studyboardpo.clickOnStudyBitLink(browser, chapterNumber, productData.concepttracker.quiz.studybitbased.studybit.text.concepts[0]).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Validate Studybit tab is active and studybit count on studybit tab", function(done) {
		conceptrackerPageStudent.isTabStateIsNotActive(browser, "Concept Tracker").then(function(conceptTrackerStatus) {
			conceptrackerPageStudent.isTabStateIsActive(browser, "StudyBit").then(function(studyBitStatus) {
				studyboardpo.getStudybitCount(browser).then(function(studyBitCount) {
					if (conceptTrackerStatus && studyBitStatus && (_.size(studyBitCount) === 1)) {
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

	it(". Click on filter toggle button and validate filtered studybis based on concepts", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		var chapterName = productData.concepttracker.quiz.chapterbased.desiredchapterforquiz;
		var chapterNumber = stringutil.returnValueAfterSplit(chapterName, " ", 1);
		studyboardpo.clickOnFilter(browser).then(function() {
			studyboardpo.validatePublisherTagIsPresent(browser).then(function(publisherTagText) {
				if (publisherTagText === productData.concepttracker.quiz.studybitbased.studybit.text.concepts[0]) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("CheckBox background color is", publisherTagText, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("CheckBox background color is", publisherTagText, "failure") +
						report.reportFooter());
				}
			});
		});
	});

	it(". Delete the created studybits if any", function(done) {
		clearAllSavedContent.clearStudyboard(browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Navigate to ConceptTracker", function(done) {
		menuPage.selectSubTabOnStudyBoard(browser, "Concept Tracker", done);
	});


	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	// it(". Fetch existing StudyBits metrics on a chapter if any on Student ConceptTracker", function(done) {
	// 	browser
	// 		.execute("window.scrollBy(0,0)")
	// 		.execute("return document.evaluate(\"count(//div[contains(@class,'chart-container ng-scope')]/h1[contains(.,'" + productData.concepttracker.quiz.studybitbased.name + "')])\", document, null, XPathResult. NUMBER_TYPE, null ).numberValue").then(function(status) {
	// 			if (status === 1) {
	// 				browser.waitForElementByXPath("//h1[contains(.,'" + productData.concepttracker.quiz.studybitbased.name + "')]/following-sibling::div[contains(@class,'chartjs overview')]//div[@class='studybits']//div[contains(@class,'studybit-count')]", asserters.isDisplayed, 90000).text().then(function(studybitCountsOnCT) {
	// 					sbCountOnStudentEnd = parseInt(stringutil.returnValueAfterSplit(studybitCountsOnCT, " ", 0));
	// 					if (sbCountOnStudentEnd == 0) {
	// 						console.log(report.reportHeader() +
	// 							report.stepStatusWithData("Study bit count on Concept Tracker " + sbCountOnStudentEnd + " is compared against", 4, "success") +
	// 							report.reportFooter());
	// 						done();
	// 					}
	// 				});
	// 			} else {
	// 				console.log(report.reportHeader() +
	// 					report.stepStatusWithData("Created studybits and notes are deleted", "successfully", "success") +
	// 					report.reportFooter());
	// 				done();
	// 			}
	// 		});
	// });

	it(". Fetch existing StudyBits metrics on a chapter if any on Student ConceptTracker", function(done) {
		conceptrackerPageStudent.getChapterPresenceStatusOnCT(browser, productData.concepttracker.quiz.studybitbased.name).then(function(status) {
			console.log("status" + status);
			if (status === 1) {
				studybit.getStudyBitCountTextOnCT(browser, productData.concepttracker.quiz.studybitbased.name)
					.then(function(studybitCount) {
						console.log("studybitCount" + studybitCount);
						sbCountOnStudentEnd = parseInt(stringutil.returnValueAfterSplit(studybitCount, " ", 0));
						if (sbCountOnStudentEnd == 0) {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Study bit count on Concept Tracker " + sbCountOnStudentEnd + " is compared against", 4, "success") +
								report.reportFooter());
							done();
						}
					});
			} else {
				console.log("Chapter not present on Concept tracker");
			}
		});
	});

	it(". Log out as Student", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userSignOut.userSignOut(browser, done);
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

	it(". Fetch existing StudyBits metrics on a chapter is remains same after deleting from studybits from students ", function(done) {
		conceptrackerPageInstructor.isConceptTrackerLoaded(browser).text().should.become('Concept Tracker').then(function() {
			// browser.execute("return document.evaluate(\"count(//div[contains(@class,'chart-container ng-scope')]/h1[contains(.,'" + productData.concepttracker.quiz.studybitbased.name + "')])\", document, null, XPathResult. NUMBER_TYPE, null ).numberValue").then(function(status) {
			// 	if (status == 1) {
				practiceQuizCreation.getChapterPresenceStatusOnCTPage(browser,  productData.concepttracker.quiz.studybitbased.name)
				.then(function(status) {
					if (status == 1) {
					browser.waitForElementByXPath("//h1[contains(.,'" + productData.concepttracker.quiz.studybitbased.name + "')]/following-sibling::div[contains(@class,'chartjs overview')]//div[@class='studybits']//div[contains(@class,'studybit-count')]", asserters.isDisplayed, 90000).text().then(function(studybitCountsOnCT) {
						if (studybitCountsOnCT == studybitCount) {
							console.log(report.reportHeader() +
								report.stepStatusWithData("ANALYTICS :: StudyBits present for \" " + productData.concepttracker.quiz.studybitbased.name + " :", studybitCountsOnCT, "success") +
								report.reportFooter());
							done();
						}
					});
				} else {
					console.log("Chapter not present on Concept tracker");
					console.log(report.reportHeader() +
						report.stepStatusWithData("ANALYTICS :: StudyBits deleted and not present for \" " + productData.concepttracker.quiz.studybitbased.name + " :", studybitCountsOnCT, "success") +
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
