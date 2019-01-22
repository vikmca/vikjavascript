require('colors');
var wd = require('wd');
var asserters = wd.asserters;
var testData = require("../../../../../test_data/data.json");
var session = require("../../../support/setup/browser-session");
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var studyBoardPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/studyboardpo");
var tocPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/tocpo");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var menuPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var studybit = require("../../../support/pageobject/" + pageobject + "/" + envName + "/studybitpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var searchFeaturePage = require("../../..//support/pageobject/" + pageobject + "/" + envName + "/searchFeaturepo");
var contentBaseFeature = require("../../../support/pageobject/" + pageobject + "/" + envName + "/conceptTrackerpo.js");
var clearAllSavedContent = require("../../../support/pageobject/" + pageobject + "/" + envName + "/clearData");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var courseHelper = require("../../../support/helpers/courseHelper");
var flashcardPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/flashcardspo.js");
var notesCreation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/notespo");
var report = require("../../../support/reporting/reportgenerator");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'STUDYBIT, FLASHCARD, NOTES CREATION AND CONCEPT TRACKER VALIDATION', function() {
	var browser;
	var allPassed = true;
	var userType;
	var courseName;
	var keyTermSBValidationStatusOnSBrd = "failure";
	var flashCardValidationStatus = "failure";
	var notesValidation = "failure";
	var product;
	var data;
	var productData;
	var keyConceptOnConceptTracker;
	var pageLoadingTime;
	var totalTime;
	var serialNumber = 0;


	before(function(done) {
		browser = session.create(done);
		userType = "instructor";
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
		console.log(report.formatTestName("INSTRUCTOR :: 4LTR SMOKE FEATURES :: STUDYBIT, FLASHCARD, NOTES CREATION AND CONCEPT TRACKER VALIDATION"));
		console.log("======================================");
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***smokeFeatures.js***"));
		console.log(report.printTestData("CHAPTER " + productData.chapter.id + " ", productData.chapter.title));
		console.log(report.printTestData("TOPIC " + productData.chapter.topic.id + " ", productData.chapter.topic.title));
		console.log(report.printTestData("STUDYBITID", productData.chapter.topic.studybit.text.id));
		console.log(report.printTestData("STUDYBIT CONCEPT", productData.chapter.topic.studybit.text.concepts));
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


	it(". Login to 4LTR platform as instructor", function(done) {
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

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate to StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Delete the created studybits if any", function(done) {
		clearAllSavedContent.clearStudyboard(browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Navigate flashcard Tab", function(done) {
		flashcardPage.SelectFlashcardTab(browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Navigate to user flashcard View", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		flashcardPage.selectUserFlashcardViewBeforeCreateFlashcard(browser).then(function() {
			done();
		});
	});

	it(". Delete already created user flashcards", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		clearAllSavedContent.clearFlashcard(browser, done);
	});

	it(". Navigate to studybit ", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) == "iOS") {
			basicpo.clickOnStudybit(browser, done);
		} else {
			this.skip();
		}
	});

	it(". Wait until page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Navigate to TOC ", function(done) {
		tocPage.navigateToToc(browser).nodeify(done);
	});

	it(". Navigate to a Chapter", function(done) {
		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) == "iOS") {
			browser.sleep(5000);
		}
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
		tocPage.navigateToATopic(productData.chapter.id, productData.chapter.topic.id, browser)
			.then(function() {
				tocPage.disposeFirstVisitTopicModalIfVisible(browser).then(function() {
					tocPage.getTopicTitleHero(browser).then(function(text) {
						text.should.contain(productData.chapter.topic.titlehero);
						pageLoadingTime = 0;
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

	it(". Open created Text StudyBit and validate the StudyBit Save ", function(done) {
		studybit.validateTextStudyBitSave(browser, done, productData.chapter.topic.studybit.text.id,
			productData.chapter.topic.studybit.text.concepts,
			productData.chapter.topic.studybit.text.usertag,
			productData.chapter.topic.studybit.text.notes,
			productData.chapter.topic.studybit.text.comprehension,
			productData.chapter.topic.studybit.text.windowScrollY);
	});

	it(". Wait until page is loaded successfully", function(done) {
		browser
			.refresh().
		then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Create a KeyTerm StudyBit", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		studybit.createKeyTermStudyBit(browser, done,
			productData.chapter.topic.studybit.keyterm.id,
			productData.chapter.topic.studybit.keyterm.definition,
			productData.chapter.topic.studybit.keyterm.comprehension,
			productData.chapter.topic.studybit.keyterm.publishertag,
			productData.chapter.topic.studybit.keyterm.notes,
			productData.chapter.topic.studybit.keyterm.usertag,
			productData.chapter.topic.studybit.keyterm.windowScrollY);
	});

	it(". Refresh the page and wait until page is loaded successfully", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Open and validate created KeyTerm StudyBit", function(done) {
		studybit.validateKeyTermStudyBitSave(browser, done, productData.chapter.topic.studybit.keyterm.id,
			productData.chapter.topic.studybit.keyterm.publishertag,
			productData.chapter.topic.studybit.keyterm.usertag,
			productData.chapter.topic.studybit.keyterm.notes,
			productData.chapter.topic.studybit.keyterm.comprehension,
			productData.chapter.topic.studybit.keyterm.windowScrollY,
			productData.chapter.topic.studybit.keyterm.definition);
	});

	it(". Navigate To StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". LTR-5060 :: On StudyBit under StudyBoard Page:: Validating that on first click the filter toggle button should be expanded ", function(done) {
		studybit.expandFilterToggleButton(browser).then(function(toggleStatus) {
			if (toggleStatus == true) {

				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5060 on first click the filter toggle button should be expanded  : " + toggleStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[error]LTR-5060 on first click the filter toggle button should be expanded  : " + toggleStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". LTR-5060 :: On StudyBit under StudyBoard Page::  Validating that on clicking the chapter's CLEAR ALL toggle button its text should be changed  to SHOW ALL", function(done) {
		studybit.clearAllChapterToggleButton(browser).then(function(toggleStatus) {
			if (toggleStatus == true) {

				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5060 on  clicking the chapter's CLEAR ALL toggle button its text should be changed to SHOW ALL   : " + toggleStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[error]LTR-5060 on first click the chapter's CLEAR ALL toggle button its text should be changed to SHOW ALL   : " + toggleStatus, "failure") +
					report.reportFooter());
			}
		});

	});
	it(". LTR-5060 :: On StudyBit under StudyBoard Page::  Validating that on clicking the chapter's SHOW ALL toggle button its text should be changed to CLEAR ALL ", function(done) {

		studybit.showAllChapterToggleButton(browser).then(function(toggleStatus) {
			if (toggleStatus == true) {

				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5060 on  clicking the chapter's CLEAR ALL toggle button  its text should be changed to SHOW ALL   : " + toggleStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[error]LTR-5060 on  clicking the chapter's CLEAR ALL toggle button  its text should be changed to SHOW ALL  : " + toggleStatus, "failure") +
					report.reportFooter());
			}
		});

	});

	it(". LTR-5060 :: On StudyBit under StudyBoard Page::  Validating that on clicking the Type's CLEAR ALL toggle button its text should be changed  to SHOW ALL", function(done) {
		studybit.clearAllTypesToggleButton(browser).then(function(toggleStatus) {
			if (toggleStatus == true) {

				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5060 on  clicking the types CLEAR ALL toggle button its text should be changed to SHOW ALL   : " + toggleStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[error]LTR-5060 on clicking the types CLEAR ALL toggle button its text should be changed to SHOW ALL   : " + toggleStatus, "failure") +
					report.reportFooter());
			}
		});

	});
	it(". LTR-5060 :: On StudyBit under StudyBoard Page::  Validating that on clicking the Type's SHOW ALL toggle button its text should be changed  to CLEAR ALL", function(done) {
		studybit.showAllTypesToggleButton(browser).then(function(toggleStatus) {
			if (toggleStatus == true) {

				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5060 on  clicking the  Type's SHOW ALL toggle button its text should be changed  to CLEAR ALL   : " + toggleStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[error]LTR-5060 on clicking Type's SHOW ALL toggle button its text should be changed  to CLEAR ALL   : " + toggleStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". LTR-5060 :: On StudyBit under StudyBoard Page::  Validating that on clicking the My Understanding's CLEAR ALL toggle button its text should be changed  to SHOW ALL", function(done) {
		studybit.clearAllMyUnderstandingToggleButton(browser).then(function(toggleStatus) {
			if (toggleStatus == true) {

				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5060 on  clicking the My Understanding CLEAR ALL toggle button its text should be changed to SHOW ALL   : " + toggleStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[error]LTR-5060 on clicking the My Understanding CLEAR ALL toggle button its text should be changed to SHOW ALL   : " + toggleStatus, "failure") +
					report.reportFooter());
			}
		});
	});
	it(". LTR-5060 :: On StudyBit under StudyBoard Page::  Validating that on clicking the My Understanding's SHOW ALL toggle button its text should be changed  to CLEAR ALL", function(done) {
		studybit.showAllMyUnderstandingToggleButton(browser).then(function(toggleStatus) {

			if (toggleStatus == true) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5060 on  clicking the  My Understanding's SHOW ALL toggle button its text should be changed  to CLEAR ALL   : " + toggleStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[error]LTR-5060 on clicking My Understanding's SHOW ALL toggle button its text should be changed  to CLEAR ALL   : " + toggleStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". LTR-5060 :: On StudyBit under StudyBoard Page::  Validating that on Second click the filter toggle button should be collapsed ", function(done) {
		studybit.collapseFilterToggleButton(browser).then(function(toggleStatus) {
			if (toggleStatus == true) {

				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5060 on Second click the filter toggle button should be collapsed  : " + toggleStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[error]LTR-5060 on Second click the filter toggle button should be collapsed  : " + toggleStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Verify the presence of text StudyBit on StudyBoard ", function(done) {
		studybit.validateTextStudyBitOnStudyBoard(browser, done,
			productData.chapter.topic.studybit.text.chaptername,
			productData.chapter.topic.studybit.text.notes,
			productData.chapter.topic.studybit.text.concepts,
			productData.chapter.topic.studybit.text.usertag);
	});

	it(". Close the expanded keyterm StudyBit on StudyBoard ", function(done) {
		studybit.closeExpandedStudybit(browser).then(function() {
			done();
		});
	});

	it(". Verify the presence of keyterm StudyBit on StudyBoard ", function(done) {
		studybit.verifyTheCreatedSBOnStudyBoard(browser, "keyterm").then(function() {
			keyTermSBValidationStatusOnSBrd = "success";
			console.log(report.reportHeader() +
				report.stepStatus("KeyTerm Validation status on StudyBoard ", keyTermSBValidationStatusOnSBrd) +
				report.reportFooter());
			done();
		});
	});

	it(". Edit tag of text studybit", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		if (process.env.RUN_IN_PLATFORM.toString() === "\"mobile\"" || process.env.RUN_IN_PLATFORM.toString() === "\"iOS\"") {
			studybit.editStudybitWithTag(browser, testData.studybitTerms.editedUserTagText).then(function() {
				studybit.clickOnSaveButton(browser).then(function() {
					studybit.closeExpandedStudybit(browser).then(function() {
						done();
					});
				});
			});
		} else {
			console.log("edit studybit on studyboard is only for mobile device");
			done();
		}
	});

	it(". Edit tag of key term studybit", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		if (process.env.RUN_IN_PLATFORM.toString() === "\"mobile\"" || process.env.RUN_IN_PLATFORM.toString() === "\"iOS\"") {
			studybit.editKeyTermStudybitWithTag(browser, productData.chapter.topic.studybit.text.usertag).then(function() {
				studybit.clickOnSaveButton(browser).then(function() {
					studybit.closeExpandedStudybit(browser).then(function() {
						done();
					});
				});
			});
		} else {
			console.log("edit studybit on studyboard is for mobile device");
			done();
		}
	});

	it(". Edit tag of key term studybit", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		if (process.env.RUN_IN_PLATFORM.toString() === "\"mobile\"" || process.env.RUN_IN_PLATFORM.toString() === "\"iOS\"") {
			browser.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
		} else {
			console.log("edit studybit on studyboard is for mobile device");
			done();
		}
	});

	it(". Verify studybits get filtered based on user tag ", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		studyBoardPage.clickAndVerifyFilterPanel(browser).then(function() {
			studyBoardPage.enterTagValueOnFilterPanel(browser, productData.chapter.topic.studybit.text.usertag).then(function() {
				studyBoardPage.verifyFilteredStudybit(browser, done, "userTag", productData.chapter.topic.studybit.text.usertag, productData.chapter.topic.studybit.text.chaptername, process.env.RUN_ENV.toString());
			});
		});
	});

	it(". Wait until page is loaded successfully", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Clear all chapter filters", function(done) {
		studyBoardPage.clickAndVerifyFilterPanel(browser).then(function() {
			studyBoardPage.clearAllChapterFilters(browser, done);
		});
	});

	it(". Verify studybits get filtered based on chapter ", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		studyBoardPage.verifyFilteredStudybit(browser, done, "chapter", productData.chapter.title, productData.chapter.topic.studybit.text.chaptername, process.env.RUN_ENV.toString());
	});

	it(". Wait until page is loaded successfully", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Change comprehension level of one of the studybit ", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		studyBoardPage.changeComprehensionOfStudybit(browser, done);
	});

	it(". Clear all chapter filters", function(done) {
		studyBoardPage.clickAndVerifyFilterPanel(browser).then(function() {
			done();
		});
	});

	it(". Verify studybits get filtered based on comprehension level ", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		studyBoardPage.verifyFilteredStudybit(browser, done, "comprehension", productData.chapter.title, productData.chapter.topic.studybit.text.chaptername, process.env.RUN_ENV.toString());
	});

	it(". Navigate to a topic to create note", function(done) {
		tocPage.navigateToToc(browser).then(function() {
			tocPage.navigateToAChapter(productData.chapter.id, browser).then(function() {
				tocPage.navigateToATopic(productData.chapter.id, productData.chapter.topic.id, browser).nodeify(done);
			});
		});
	});

	it(". Create a note on a topic page", function(done) {
		notesCreation.notesCreation(browser, done, testData.notesTerms.noteText);
	});

	it(". Navigate to StudyBoard", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Verify the presence of note on the StudyBoard", function(done) {
		notesCreation.verifyNoteOnStudyBoard(notesValidation, browser, done);
	});

	it(". Click on the Concept Tracker", function(done) {
		menuPage.selectSubTabOnStudyBoard(browser, "Concept Tracker", done);
	});

	it(". Verify the count of Created StudyBits reflected on the Concept Tracker", function(done) {
		contentBaseFeature.conceptTackerValidation(2, browser, done);
	});

	it(". Verify the search feature on ConceptTracker", function(done) {
		searchFeaturePage.getSearchTextOnConceptTracker(browser)
			.text().then(function(keyconcept) {
				keyConceptOnConceptTracker = keyconcept;
				if (keyconcept.indexOf(productData.chapter.topic.studybit.text.searchterem) > -1) {
					searchFeaturePage.clickOnSearchTextOnConceptTracker(browser)
					// browser
					// 	.waitForElementByXPath("(//div[contains(@class,'chart-container ng-scope')])[1]//div[contains(@class,'chartjs ng-scope')][1]//div[1]//a", asserters.isDisplayed, 10000)
						// .click()
						.then(function() {
							pageLoadingTime = 0;
							takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
						});
				}
			});
	});

	it(". Verify the search result", function(done) {
		this.retries(3);
		this.timeout(courseHelper.getElevatedTimeout());
		searchFeaturePage.getSearchResultText(browser)
			.text().then(function(searchtitle) {
				if (searchtitle.indexOf(keyConceptOnConceptTracker) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Retrieve search content from a concept present in Concept tracker : " + searchtitle, "success") +
						report.reportFooter());
					//  searchFeaturePage.clickOnSearchedTopic(browser).then(function(){
					pageLoadingTime = 0;
					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
					//  });
				}
			});
	});

	it(". Wait until page is loaded successfully", function(done) {
		browser.refresh().sleep(3000).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Click on search topic", function(done) {
		searchFeaturePage.clickOnSearchedTopic(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Verify the searched result is present within narrative", function(done) {
		this.retries(3);
		this.timeout(courseHelper.getElevatedTimeout());
		searchFeaturePage.verifySearchResultWithInNarrative(browser)
			.text().then(function(narrativetext) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Navigate to narrative content from the retrieved search result links to : " + narrativetext, "success") +
					report.reportFooter());
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Click on Studyboard", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Delete the created text StudyBit and cleanup for subsequent runs", function(done) {
		clearAllSavedContent.clearStudyboard(browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Navigate to flashcard page", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		menuPage.selectSubTabOnStudyBoard(browser, "Flashcards", done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Create flashcard for End To End Flashcard validation", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		flashcardPage.createFlashcard(browser).then(function() {
			flashCardValidationStatus = "success"
			done();
		});
	});

	it(". Navigate to studybit ", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) == "iOS") {
			basicpo.clickOnStudybit(browser, done);
		} else {
			this.skip();
		}
	});

	it(". Wait until page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Navigate to StudyBoard ", function(done) {
		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) == "iOS") {
			this.skip();
		}
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Delete the created studybits if any", function(done) {
		clearAllSavedContent.clearStudyboard(browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Navigate flashcard Tab", function(done) {
		flashcardPage.SelectFlashcardTab(browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". LTR-5060 :: On Publisher Flashcard Page:: Validating that on first click the filter toggle button should be expanded ", function(done) {
		studybit.expandFilterToggleButton(browser).then(function(toggleStatus) {
			if (toggleStatus == true) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5060 on first click the filter toggle button should be expanded  : " + toggleStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[error]LTR-5060 on first click the filter toggle button should be expanded  : " + toggleStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". LTR-5060 :: On Publisher Flashcard Page:: Validating that on clicking the chapter's CLEAR ALL toggle button its text should be changed  to SHOW ALL", function(done) {
		studybit.clearAllChapterToggleButton(browser).then(function(toggleStatus) {
			if (toggleStatus == true) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5060 on  clicking the chapter's CLEAR ALL toggle button its text should be changed to SHOW ALL   : " + toggleStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[error]LTR-5060 on first click the chapter's CLEAR ALL toggle button its text should be changed to SHOW ALL   : " + toggleStatus, "failure") +
					report.reportFooter());
			}
		});
	});
	it(". LTR-5060 :: On Publisher Flashcard Page:: Validating that on clicking the chapter's SHOW ALL toggle button its text should be changed to CLEAR ALL ", function(done) {
		studybit.showAllChapterToggleButton(browser).then(function(toggleStatus) {
			if (toggleStatus == true) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5060 on  clicking the chapter's CLEAR ALL toggle button  its text should be changed to SHOW ALL   : " + toggleStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[error]LTR-5060 on  clicking the chapter's CLEAR ALL toggle button  its text should be changed to SHOW ALL  : " + toggleStatus, "failure") +
					report.reportFooter());
			}
		});

	});

	it(". LTR-5060 :: On Publisher Flashcard Page:: Validating that on clicking the My Understanding's CLEAR ALL toggle button its text should be changed  to SHOW ALL", function(done) {
		studybit.clearAllMyUnderstandingToggleButton(browser).then(function(toggleStatus) {
			if (toggleStatus == true) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5060 on  clicking the My Understanding CLEAR ALL toggle button its text should be changed to SHOW ALL   : " + toggleStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[error]LTR-5060 on clicking the My Understanding CLEAR ALL toggle button its text should be changed to SHOW ALL   : " + toggleStatus, "failure") +
					report.reportFooter());
			}
		});
	});
	it(". LTR-5060 :: On Publisher Flashcard Page:: Validating that on clicking the My Understanding's SHOW ALL toggle button its text should be changed  to CLEAR ALL", function(done) {
		studybit.showAllMyUnderstandingToggleButton(browser).then(function(toggleStatus) {

			if (toggleStatus == true) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5060 on  clicking the  My Understanding's SHOW ALL toggle button its text should be changed  to CLEAR ALL   : " + toggleStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[error]LTR-5060 on clicking My Understanding's SHOW ALL toggle button its text should be changed  to CLEAR ALL   : " + toggleStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". LTR-5060 :: On Publisher Flashcard Page:: Validating that on Second click the filter toggle button should be collapsed ", function(done) {
		studybit.collapseFilterToggleButton(browser).then(function(toggleStatus) {
			if (toggleStatus == true) {

				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5060 on Second click the filter toggle button should be collapsed  : " + toggleStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[error]LTR-5060 on Second click the filter toggle button should be collapsed  : " + toggleStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Navigate to user flashcard view", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		flashcardPage.selectUserFlashcardView(browser).then(function() {
			done();
		});
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". LTR-5060 :: On User Flashcard Page:: Validating that on first click the filter toggle button should be expanded ", function(done) {
		studybit.expandFilterToggleButton(browser).then(function(toggleStatus) {
			if (toggleStatus == true) {

				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5060 on first click the filter toggle button should be expanded  : " + toggleStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[error]LTR-5060 on first click the filter toggle button should be expanded  : " + toggleStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". LTR-5060 :: On User Flashcard Page:: Validating that on clicking the chapter's CLEAR ALL toggle button its text should be changed  to SHOW ALL", function(done) {
		studybit.clearAllChapterToggleButton(browser).then(function(toggleStatus) {
			if (toggleStatus == true) {

				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5060 on  clicking the chapter's CLEAR ALL toggle button its text should be changed to SHOW ALL   : " + toggleStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[error]LTR-5060 on first click the chapter's CLEAR ALL toggle button its text should be changed to SHOW ALL   : " + toggleStatus, "failure") +
					report.reportFooter());
			}
		});

	});
	it(". LTR-5060 :: On User Flashcard Page:: Validating that on clicking the chapter's SHOW ALL toggle button its text should be changed to CLEAR ALL ", function(done) {

		studybit.showAllChapterToggleButton(browser).then(function(toggleStatus) {
			if (toggleStatus == true) {

				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5060 on  clicking the chapter's CLEAR ALL toggle button  its text should be changed to SHOW ALL   : " + toggleStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[error]LTR-5060 on  clicking the chapter's CLEAR ALL toggle button  its text should be changed to SHOW ALL  : " + toggleStatus, "failure") +
					report.reportFooter());
			}
		});

	});

	it(". LTR-5060 :: On User Flashcard Page:: Validating that on clicking the Type's CLEAR ALL toggle button its text should be changed  to SHOW ALL", function(done) {
		studybit.clearAllTypesToggleButton(browser).then(function(toggleStatus) {
			if (toggleStatus == true) {

				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5060 on  clicking the types CLEAR ALL toggle button its text should be changed to SHOW ALL   : " + toggleStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[error]LTR-5060 on clicking the types CLEAR ALL toggle button its text should be changed to SHOW ALL   : " + toggleStatus, "failure") +
					report.reportFooter());
			}
		});

	});
	it(". LTR-5060 :: On User Flashcard Page:: Validating that on clicking the Type's SHOW ALL toggle button its text should be changed  to CLEAR ALL", function(done) {
		studybit.showAllTypesToggleButton(browser).then(function(toggleStatus) {
			if (toggleStatus == true) {

				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5060 on  clicking the  Type's SHOW ALL toggle button its text should be changed  to CLEAR ALL   : " + toggleStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[error]LTR-5060 on clicking Type's SHOW ALL toggle button its text should be changed  to CLEAR ALL   : " + toggleStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". LTR-5060 :: On User Flashcard Page:: Validating that on clicking the My Understanding's CLEAR ALL toggle button its text should be changed  to SHOW ALL", function(done) {
		studybit.clearAllMyUnderstandingToggleButton(browser).then(function(toggleStatus) {
			if (toggleStatus == true) {

				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5060 on  clicking the My Understanding CLEAR ALL toggle button its text should be changed to SHOW ALL   : " + toggleStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[error]LTR-5060 on clicking the My Understanding CLEAR ALL toggle button its text should be changed to SHOW ALL   : " + toggleStatus, "failure") +
					report.reportFooter());
			}
		});
	});
	it(". LTR-5060 :: On User Flashcard Page:: Validating that on clicking the My Understanding's SHOW ALL toggle button its text should be changed  to CLEAR ALL", function(done) {
		studybit.showAllMyUnderstandingToggleButton(browser).then(function(toggleStatus) {

			if (toggleStatus == true) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5060 on  clicking the  My Understanding's SHOW ALL toggle button its text should be changed  to CLEAR ALL   : " + toggleStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[error]LTR-5060 on clicking My Understanding's SHOW ALL toggle button its text should be changed  to CLEAR ALL   : " + toggleStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". LTR-5060 :: On User Flashcard Page:: Validating that on Second click the filter toggle button should be collapsed ", function(done) {
		studybit.collapseFilterToggleButton(browser).then(function(toggleStatus) {
			if (toggleStatus == true) {

				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5060 on Second click the filter toggle button should be collapsed  : " + toggleStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[error]LTR-5060 on Second click the filter toggle button should be collapsed  : " + toggleStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Delete already created user flashcards", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		clearAllSavedContent.clearFlashcard(browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Log out as instructor", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userSignOut.userSignOut(browser, done);
	});

});

//total test case 72
