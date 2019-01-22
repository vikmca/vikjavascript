require('colors');
var wd = require('wd');
var asserters = wd.asserters;
var testData = require("../../../../../test_data/data.json");
var session = require("../../../support/setup/browser-session");
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var tocPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/tocpo");
var chaptertile = require("../../../support/pageobject/" + pageobject + "/" + envName + "/chaptertileverificationpo.js");
var report = require("../../../support/reporting/reportgenerator");
var _ = require('underscore');
var courseHelper = require("../../../support/helpers/courseHelper");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var path = require('path');
var scriptName = path.basename(__filename);
var flashcard = require("../../../support/pageobject/" + pageobject + "/" + envName + "/flashcardspo.js");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var flashcardPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/flashcardspo.js");
var clearData = require("../../../support/pageobject/" + pageobject + "/" + envName + "/clearData.js");
var studybit = require("../../../support/pageobject/" + pageobject + "/" + envName + "/studybitpo.js");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var createNewCoursepo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/createNewCoursepo");
describe(scriptName + 'Flashcards on the title TOC page', function() {
	var browser;
	var allPassed = true;
	var userType;
	var courseName;
	var product;
	var urlForLogin;
	var data;
	var productData;
	var totalTime;
	var serialNumber = 0;
	var frontTextStrongFlashcard;
	var frontTextWeakFlashcard;
	var frontTextFairFlashcard;

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
		console.log(report.formatTestName("INSTRUCTOR :: Flashcards on the title TOC page"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***flashcardAccessOnTocForEachChapter.js***"));

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
		createNewCoursepo.closePopupWindow(browser).then(function() {
			console.log(report.formatTestTotalTime(totalTime, scriptName, allPassed));
			session.close(allPassed, done);
		});
	});
	if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) == "mobile" || stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) == "iOS") {
		console.log(report.reportHeader() +
			report.stepStatusWithData("This feature is not for mobile device", "true", "success") +
			report.reportFooter());
	} else {

		it(". Login to 4LTR platform as instructor", function(done) {
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
			this.timeout(courseHelper.getElevatedTimeout());
			loginPage.launchACourse(userType, courseName, browser, done);
		});

		it(". Navigate To Studyboard", function(done) {
			studybit.navigateToStudyBoard(browser, done);
		});

		it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
			loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
		});

		it(". Wait until page is loaded successfully", function(done) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});

		it(". Navigate Flashcard Tab", function(done) {
			flashcard.SelectFlashcardTab(browser, done);
		});

		it(". Wait until page is loaded successfully", function(done) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});

		it(". Verify Default selected Tab is KeyTerm FlashCard", function(done) {
			flashcard.Verifykeytermflashcardselected(browser, done);
		});

		it(". Wait until page is loaded successfully", function(done) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});

		it(". Revert all Flashcards if already not reverted", function(done) {
			clearData.revertAllKeyTermFlashcard(browser, done);
		});

		it(". Wait until page is loaded successfully", function(done) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});

		it(". Navigated to Menu Page", function(done) {
			chaptertile.navigateToMenuPage(browser, done);
		});

		it(". Wait until page is loaded successfully", function(done) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});

		it(". Verify the Chapter Tiles Image", function(done) {
			chaptertile.verifychaptertileimage(browser, done, productData.chapter.topic.carousel.urlforfirsttileimage);
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


		it(". Validate 'Flashcard Review' label appears above the flashcard review feature to the right of the TOC for each chapter", function(done) {
			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
			chaptertile.verifyFlashcardReviewLabel(browser).then(function() {
				chaptertile.verifydescriptionBelowConceptsReview(browser).then(function() {
					flashcardPage.validateFrontContentOnReviewDeck(browser).then(function(frontText) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Flashcard Review deck: Front text of Flashcard on the deck  :: " + frontText, "success") +
							report.reportFooter());
						flashcardPage.clickOnArrowIconOnReviewDeck(browser).then(function() {
							flashcardPage.validateBackContentOnReviewDeck(browser).then(function(backText) {
								chaptertile.clickOnFront(browser).then(function() {
									console.log(report.reportHeader() +
										report.stepStatusWithData("Flashcard Review deck: Back text of Flashcard on the deck  :: " + backText, "success") +
										report.reportFooter());
									done();
								});
							});
						});
					});
				});
			});
		});

		it(". Change the strong comprehension Level", function(done) {
			chaptertile.changeComprehensionLevel(browser, 1, "STRONG").then(function(frontTextStrong) {
				frontTextStrongFlashcard = frontTextStrong;
				console.log(report.reportHeader() +
					report.stepStatusWithData("Front Text of strong flashcard" + frontTextStrongFlashcard, "success") +
					report.reportFooter());
				done();
			});
		});

		it(". Click on next", function(done) {
			chaptertile.clickOnNext(browser).then(function() {
				done();
			});
		});

		it(". Change the fair comprehension Level", function(done) {
			chaptertile.changeComprehensionLevel(browser, 2, "FAIR").then(function(frontTextFair) {
				frontTextFairFlashcard = frontTextFair;
				console.log(report.reportHeader() +
					report.stepStatusWithData("Front Text of fair flashcard" + frontTextFairFlashcard, "success") +
					report.reportFooter());
				done();
			});
		});

		it(". Click on next", function(done) {
			chaptertile.clickOnNext(browser).then(function() {
				done();
			});
		});

		it(". Change the weak comprehension Level", function(done) {
			chaptertile.changeComprehensionLevel(browser, 3, "WEAK").then(function(frontTextWeak) {
				frontTextWeakFlashcard = frontTextWeak;
				console.log(report.reportHeader() +
					report.stepStatusWithData("Front Text of weak flashcard" + frontTextWeakFlashcard, "success") +
					report.reportFooter());
				done();
			});
		});

		it(". Click on next button", function(done) {
			chaptertile.clickOnNext(browser).then(function() {
				done();
			});
		});

		it(". Validate the flashcard card counter and labels in selected chapter", function(done) {
			chaptertile.verifyFlashcardTotalCounterLabel(browser).then(function() {
				chaptertile.verifyPresenceOfShowMoreLabel(browser).then(function() {
					done();
				});
			});
		});

		it(". Verify text on Front and back side of Flash Card and Navigate to flashcardresults page", function(done) {
			this.timeout(courseHelper.getElevatedTimeout("publisherFlashCardReviewDeck"));
			chaptertile.verifyFrontAndBackFlashCardOnTOC(browser, done, 4);
		});

		it(". Validate flashCard counts on flash card results", function(done) {
			var comrehesionlevelCounts = parseInt(productData.chapter.topic.flashcard.flashcardontoc.totalcards) - 3;
			chaptertile.validateCountFlashCard(browser, "strong", "1", "0").then(function() {
				chaptertile.validateCountFlashCard(browser, "fair", "1", "0").then(function() {
					chaptertile.validateCountFlashCard(browser, "weak", "1", "0").then(function() {
						chaptertile.validateCountFlashCard(browser, "unassigned", comrehesionlevelCounts, productData.chapter.topic.flashcard.flashcardontoc.totalcards).then(function() {
							chaptertile.validatePresenceOfResults(browser).then(function() {
								flashcard.verifyPresenceOfShuffle(browser, "Shuffle").then(function() {
									chaptertile.verifyPresenceOfReviewSelected(browser).then(function() {
										chaptertile.clickOnShowMore(browser).then(function() {
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

		it(". Wait until page is loaded successfully", function(done) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});

		it(". Validate Clicking on Show More takes a student to the StudyBoard, specifically the flashcard tab", function(done) {
			chaptertile.validateFlashcardIsActive(browser).text().then(function(activeTabText) {
				if (activeTabText.indexOf(testData.flashcard.activeTab) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Text on the active tab under studyboard after clicking show more button" + activeTabText, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Text on the active tab under studyboard after clicking show more button" + activeTabText, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Validate all changes of comprehension lavel fair has refleted with same flashcard", function(done) {
			chaptertile.getFrontTextBasedOnComprehension(browser, productData.chapter.topic.studybit.keytermOnChapterReview.name, "fair").then(function(flashcardWithFairLevelFrontText) {
				if (flashcardWithFairLevelFrontText.indexOf(frontTextFairFlashcard) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Front Text on the fair flashcard " + flashcardWithFairLevelFrontText + " is compared with " + frontTextFairFlashcard, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Front Text on the fair flashcard " + flashcardWithFairLevelFrontText + " is compared with " + frontTextFairFlashcard, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Validate all changes of comprehension lavel strong has refleted with same flashcard", function(done) {
			chaptertile.getFrontTextBasedOnComprehension(browser, productData.chapter.topic.studybit.keytermOnChapterReview.name, "strong").then(function(flashcardWithStrongLevelFrontText) {
				console.log("flashcardWithStrongLevelFrontText" + flashcardWithStrongLevelFrontText);
				console.log("frontTextStrongFlashcard" + frontTextStrongFlashcard);
				// var firstText= stringUtil.returnValueAfterSplit(frontTextStrongFlashcard, " ", 0)
				if (flashcardWithStrongLevelFrontText.indexOf(frontTextStrongFlashcard) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Front Text on the strong flashcard " + flashcardWithStrongLevelFrontText + " is compared with " + frontTextStrongFlashcard, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Front Text on the strong flashcard " + flashcardWithStrongLevelFrontText + " is compared with " + frontTextStrongFlashcard, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Validate all changes of comprehension lavel weak has refleted with same flashcard", function(done) {
			chaptertile.getFrontTextBasedOnComprehension(browser, productData.chapter.topic.studybit.keytermOnChapterReview.name, "weak").then(function(flashcardWithWeakLevelFrontText) {
				if (flashcardWithWeakLevelFrontText.indexOf(frontTextWeakFlashcard) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Front Text on the weak flashcard " + flashcardWithWeakLevelFrontText + " is compared with " + frontTextWeakFlashcard, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Front Text on the weak flashcard " + flashcardWithWeakLevelFrontText + " is compared with " + frontTextWeakFlashcard, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Revert all Flashcards if already not reverted", function(done) {
			clearData.revertAllKeyTermFlashcard(browser, done);
		});

		it(". Wait until page is loaded successfully", function(done) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});

		it(". Navigated to Menu Page", function(done) {
			chaptertile.navigateToMenuPage(browser, done);
		});

		it(". Wait until page is loaded successfully", function(done) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});

		it(". Verify the Chapter Tiles Image", function(done) {
			chaptertile.verifychaptertileimage(browser, done, productData.chapter.topic.carousel.urlforfirsttileimage);
		});

		it(". Navigate to a Chapter", function(done) {
			tocPage.getChapterTitle(productData.chapter.id, browser)
				.then(function(textChapter) {
					textChapter.should.contain(productData.chapter.title);
				})
				.then(function() {
					tocPage.navigateToAChapter(productData.chapter.id, browser)
						.nodeify(done);
				});
		});

		it(". Verify text on Front and back side of Flash Card", function(done) {
			this.timeout(courseHelper.getElevatedTimeout("publisherFlashCardReviewDeck"));
			chaptertile.verifyFrontAndBackFlashCardOnTOC(browser, done, 1);
		});

		it(". Wait until page is loaded successfully", function(done) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});

		it(". Click on 'Review selected' on review deck results page", function(done) {
			this.timeout(courseHelper.getElevatedTimeout("publisherFlashCardReviewDeck"));
			chaptertile.clickOnReviewSelectedOption(browser, done);
		});

		it(". Wait until page is loaded successfully", function(done) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});

		it(". Validate on clicking 'Review Selected' option to go through the deck again ", function(done) {
			chaptertile.verifyPageNavigateToFlashcardDeck(browser).text().then(function(counterText) {
				if (counterText.indexOf(productData.chapter.topic.flashcard.flashcardontoc.totalcardcounter) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Text on the active tab under studyboard after clicking show more button" + counterText, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Text on the active tab under studyboard after clicking show more button" + counterText, "success") +
						report.reportFooter());
				}
			});
		});


		it(". Log out as instructor", function(done) {
			this.timeout(courseHelper.getElevatedTimeout());
			userSignOut.userSignOut(browser, done);
		});

	}

});
