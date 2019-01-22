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
var studyboardPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/studyboardpo.js")
var report = require("../../../support/reporting/reportgenerator");
var _ = require('underscore');
var courseHelper = require("../../../support/helpers/courseHelper");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var path = require('path');
var scriptName = path.basename(__filename);
var flashcardPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/flashcardspo.js");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
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
	var frontTextStrongFlashcard1;
	var frontTextStrongFlashcard2;
	var frontTextStrongFlashcard3;
	var frontTextWeakFlashcard1;
	var frontTextWeakFlashcard2;
	var frontTextWeakFlashcard3;
	var flashCardCounts;
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
		console.log(report.formatTestName("iNSTRUCTOR :: FLASHCARD REVIEW DECK::  VALIDATE FLASHCARD CHANGED ON REVIEW DECK PERSIST ON FLASHCARD AND CHAPTER TILES BOTH VIEW "));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***flashcardReviewDeckValidation.js***"));

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

		it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
			loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
		});

		it(". Navigate To Studyboard", function(done) {
			studybit.navigateToStudyBoard(browser, done);
		});

		it(". Wait until page is loaded successfully", function(done) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});

		it(". Navigate Flashcard Tab", function(done) {
			flashcardPage.SelectFlashcardTab(browser, done);
		});

		it(". Wait until page is loaded successfully", function(done) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});

		it(". Verify Default selected Tab is KeyTerm FlashCard", function(done) {
			flashcardPage.Verifykeytermflashcardselected(browser, done);
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
			chaptertile.findFlashcardCount(browser).then(function(flashcardCount) {
				flashCardCounts = parseInt(flashcardCount);
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
		});

		it(". Change the strong comprehension Level for 1st flashcard", function(done) {
			chaptertile.changeComprehensionLevel(browser, 1, "STRONG").then(function(frontTextStrong) {
				frontTextStrongFlashcard1 = frontTextStrong;
				console.log(report.reportHeader() +
					report.stepStatusWithData("Front Text of strong flashcard" + frontTextStrongFlashcard1, "success") +
					report.reportFooter());
				done();
			});
		});

		it(". Click on next button", function(done) {
			chaptertile.clickOnNext(browser).then(function() {
				done();
			});
		});

		it(". Change the strong comprehension Level for 2nd flashcard", function(done) {
			chaptertile.changeComprehensionLevel(browser, 2, "STRONG").then(function(frontTextStrong) {
				frontTextStrongFlashcard2 = frontTextStrong;
				console.log(report.reportHeader() +
					report.stepStatusWithData("Front Text of fair flashcard" + frontTextStrongFlashcard2, "success") +
					report.reportFooter());
				done();
			});
		});

		it(". Click on next button", function(done) {
			chaptertile.clickOnNext(browser).then(function() {
				done();
			});
		});

		it(". Change the strong comprehension Level for 3rd flashcard", function(done) {
			chaptertile.changeComprehensionLevel(browser, 3, "STRONG").then(function(frontTextStrong) {
				frontTextStrongFlashcard3 = frontTextStrong;
				console.log(report.reportHeader() +
					report.stepStatusWithData("Front Text of weak flashcard" + frontTextStrongFlashcard3, "success") +
					report.reportFooter());
				done();
			});
		});

		it(". Click on next", function(done) {
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
			chaptertile.validateCountFlashCard(browser, "strong", "3", "0").then(function() {
				chaptertile.validateCountFlashCard(browser, "unassigned", comrehesionlevelCounts, productData.chapter.topic.flashcard.flashcardontoc.totalcards).then(function() {
					chaptertile.validatePresenceOfResults(browser).then(function() {
						flashcardPage.verifyPresenceOfShuffle(browser, "Shuffle").then(function() {
							chaptertile.verifyPresenceOfReviewSelected(browser).then(function() {
								chaptertile.clickOnFlashcardReview(browser).then(function() {
									done();
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

		it(". Revert the changnges which have done in flashcard review", function(done) {
			chaptertile.reviewAllFlashcardAndChangeComprehension(browser, done, 1, "STRONG");
		});

		it(". Click On Show More button", function(done) {
			chaptertile.clickOnShowMore(browser).then(function() {
				done();
			});
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

		it(". LTR-5310 :: Validate all changes of comprehension lavel Strong to unassigned has refleted with same flashcard", function(done) {
			chaptertile.validateFlashcardByFrontText(browser, productData.chapter.topic.studybit.keytermOnChapterReview.name, "unassigned", frontTextStrongFlashcard1).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Strong flash crad changed with unassigned", "PASS", "success") +
					report.reportFooter());
				done();
			});
		});

		it(". LTR-5310 :: Validate all changes of comprehension lavel strong to unassigned to has refleted with same flashcard", function(done) {
			chaptertile.validateFlashcardByFrontText(browser, productData.chapter.topic.studybit.keytermOnChapterReview.name, "unassigned", frontTextStrongFlashcard2).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Strong flash crad changed with unassigned", "PASS", "success") +
					report.reportFooter());
				done();
			});
		});

		it(". LTR-5310 :: Validate all changes of comprehension lavel Strong to unassigned has refleted with same flashcard", function(done) {
			chaptertile.validateFlashcardByFrontText(browser, productData.chapter.topic.studybit.keytermOnChapterReview.name, "unassigned", frontTextStrongFlashcard3).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Strong flash crad changed with unassigned", "PASS", "success") +
					report.reportFooter());
				done();
			});
		});

		it(". LTR-5310 :: Validate Flashcard Count is same even we change it on review deck", function(done) {
			chaptertile.getFlashcardCountsOnFlashcardPage(browser, productData.chapter.topic.studybit.keytermOnChapterReview.name).then(function(flashcardCountsOnFlashCard) {
				if (flashCardCounts === _.size(flashcardCountsOnFlashCard)) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Flashcard counts on chapter tiles for " + productData.chapter.topic.studybit.keytermOnChapterReview.name + " is " + flashCardCounts + " is compared with flashcard counts on FlashCard page", _.size(flashcardCountsOnFlashCard), "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Flashcard counts on chapter tiles for " + productData.chapter.topic.studybit.keytermOnChapterReview.name + " is " + flashCardCounts + " is compared with flashcard counts on FlashCard page", _.size(flashcardCountsOnFlashCard), "failure") +
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

		it(". Open the filter panel and verify the tags on Publisher keyterms is pulling the tags for smart search", function(done) {
			this.timeout(courseHelper.getElevatedTimeout());
			studyboardPage.clickOnFilter(browser).then(function() {
				done();
			});
		});

		it(". Click on Filter and clear all chapter toggle", function(done) {
			studyboardPage.clearAllChapterFilters(browser, done);
		});

		it(". Verify the total count of Key term flash card on first chapter", function(done) {
			studyboardPage.selectChapterForFilter(browser, "1").then(function() {
				studyboardPage.getCountOfFilteredOverlay(browser, "1").then(function(countofstudybit) {
					if (_.size(countofstudybit)) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Count of Key Term Flash Card for first chapter ", _.size(countofstudybit), "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Count of Key Term Flash Card for first chapter ", _.size(countofstudybit), "failure") +
							report.reportFooter());

					}
				});
			});
		});

		it(". Click on review deck", function(done) {
			flashcardPage.navigateToPublisherFlashcardReview(browser).then(function() {
				done();
			});
		});

		it(". Validate 'Flashcard Review' label appears above the flashcard review feature to the right of the TOC for each chapter", function(done) {
			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
			chaptertile.findFlashcardCount(browser).then(function(flashcardCount) {
				flashCardCounts = parseInt(flashcardCount);
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

		it(". Change the Weak comprehension Level for 1st flashcard under flashcard tab", function(done) {
			chaptertile.changeComprehensionLevel(browser, 1, "WEAK").then(function(frontTextWeak) {
				frontTextWeakFlashcard1 = frontTextWeak;
				console.log(report.reportHeader() +
					report.stepStatusWithData("Front Text of strong flashcard" + frontTextWeakFlashcard1, "success") +
					report.reportFooter());
				done();
			});
		});

		it(". Click on next", function(done) {
			chaptertile.clickOnNext(browser).then(function() {
				done();
			});
		});

		it(". Change the Weak comprehension Level for 2nd flashcard under flashcard tab", function(done) {
			chaptertile.changeComprehensionLevel(browser, 2, "WEAK").then(function(frontTextWeak) {
				frontTextWeakFlashcard2 = frontTextWeak;
				console.log(report.reportHeader() +
					report.stepStatusWithData("Front Text of fair flashcard" + frontTextWeakFlashcard2, "success") +
					report.reportFooter());
				done();
			});
		});

		it(". Click on next button", function(done) {
			chaptertile.clickOnNext(browser).then(function() {
				done();
			});
		});

		it(". Change the weak comprehension Level for 3rd flashcard under flashcard tab", function(done) {
			chaptertile.changeComprehensionLevel(browser, 3, "WEAK").then(function(frontTextWeak) {
				frontTextWeakFlashcard3 = frontTextWeak;
				console.log(report.reportHeader() +
					report.stepStatusWithData("Front Text of weak flashcard" + frontTextWeakFlashcard3, "success") +
					report.reportFooter());
				done();
			});
		});

		it(". Click on next", function(done) {
			chaptertile.clickOnNext(browser).then(function() {
				done();
			});
		});

		it(". Validate the flashcard card counter", function(done) {
			chaptertile.verifyFlashcardTotalCounterLabel(browser).then(function() {
				done();
			});
		});

		it(". Verify text on Front and back side of Flash Card and Navigate to flashcardresults page", function(done) {
			this.timeout(courseHelper.getElevatedTimeout("publisherFlashCardReviewDeck"));
			chaptertile.verifyFrontAndBackFlashCardOnTOC(browser, done, 4);
		});

		it(". Validate flashCard counts on flash card results", function(done) {
			var comrehesionlevelCounts = parseInt(productData.chapter.topic.flashcard.flashcardontoc.totalcards) - 3;
			chaptertile.validateCountFlashCard(browser, "weak", "3", "0").then(function() {
				chaptertile.validateCountFlashCard(browser, "unassigned", comrehesionlevelCounts, productData.chapter.topic.flashcard.flashcardontoc.totalcards).then(function() {
					chaptertile.validatePresenceOfResults(browser).then(function() {
						flashcardPage.verifyPresenceOfShuffle(browser, "Shuffle").then(function() {
							chaptertile.verifyPresenceOfReviewSelected(browser).then(function() {
								chaptertile.clickOnFlashcardReview(browser).then(function() {
									done();
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

		it(". Revert the changnges which have done in flashcard review", function(done) {
			chaptertile.reviewAllFlashcardAndChangeComprehension(browser, done, 1, "WEAK");
		});

		it(". Click On Exit button", function(done) {
			flashcardPage.clickOnExitButton(browser).then(function() {
				done();
			});
		});

		it(". Validate after Clicking on Exit button user should navigate to flashcard tab", function(done) {
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

		it(". LTR-5310 :: Validate all changes of comprehension lavel weak to unassigned has refleted with same flashcard under Flashcard page", function(done) {
			chaptertile.validateFlashcardByFrontText(browser, productData.chapter.topic.studybit.keytermOnChapterReview.name, "unassigned", frontTextWeakFlashcard1).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Strong flash crad changed with unassigned", "PASS", "success") +
					report.reportFooter());
				done();
			});
		});

		it(". LTR-5310 :: Validate all changes of comprehension lavel weak to unassigned to has refleted with same flashcard under Flashcard page", function(done) {
			chaptertile.validateFlashcardByFrontText(browser, productData.chapter.topic.studybit.keytermOnChapterReview.name, "unassigned", frontTextWeakFlashcard2).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Strong flash crad changed with unassigned", "PASS", "success") +
					report.reportFooter());
				done();
			});
		});

		it(". LTR-5310 :: Validate all changes of comprehension lavel weak to unassigned has refleted with same flashcard under Flashcard page", function(done) {
			chaptertile.validateFlashcardByFrontText(browser, productData.chapter.topic.studybit.keytermOnChapterReview.name, "unassigned", frontTextWeakFlashcard3).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Strong flash crad changed with unassigned", "PASS", "success") +
					report.reportFooter());
				done();
			});
		});

		it(". LTR-5310 :: Validate Flashcard Count is same even we change it on review deck under Flashcard page ", function(done) {
			chaptertile.getFlashcardCountsOnFlashcardPage(browser, productData.chapter.topic.studybit.keytermOnChapterReview.name).then(function(flashcardCountsOnFlashCard) {
				if (flashCardCounts === _.size(flashcardCountsOnFlashCard)) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Flashcard counts on chapter tiles for " + productData.chapter.topic.studybit.keytermOnChapterReview.name + " is " + flashCardCounts + " is compared with flashcard counts on FlashCard page", _.size(flashcardCountsOnFlashCard), "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Flashcard counts on chapter tiles for " + productData.chapter.topic.studybit.keytermOnChapterReview.name + " is " + flashCardCounts + " is compared with flashcard counts on FlashCard page", _.size(flashcardCountsOnFlashCard), "failure") +
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
