require('colors');
var wd = require('wd');
var asserters = wd.asserters;
var testData = require("../../../../../test_data/data.json");
var session = require("../../../support/setup/browser-session");
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var recursiveFnPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/recursiveFnPagepo");
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var tocPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/tocpo");
var flashcardPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/flashcardspo.js");
var studybit = require("../../../support/pageobject/" + pageobject + "/" + envName + "/studybitpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var studyboardPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/studyboardpo.js")
var clearAllSavedContent = require("../../../support/pageobject/" + pageobject + "/" + envName + "/clearData");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var courseHelper = require("../../../support/helpers/courseHelper");
var report = require("../../../support/reporting/reportgenerator");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var path = require('path');
var _ = require('underscore');
var scriptName = path.basename(__filename);
describe(scriptName + 'STUDENT :: USER FLASHCARDS VALIDATION AND REVIEW', function() {
	var browser;
	var allPassed = true;
	var userType;
	var courseName;
	var product;
	var data;
	var productData;
	var count = 0;
	var reviewDeckResultBeforeShuffle = 0;
	var reviewDeckResultAfterShuffle;
	var pageLoadingTime;
	var totalTime;
	var initialLeftCount = 300;
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
		console.log(report.formatTestName("STUDENT :: USER FLASHCARD VALIDATION AND REVIEW"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.printTestData("CHAPTER " + productData.chapter.id + " ", productData.chapter.title));
		console.log(report.formatTestScriptFileName("***validateAndReviewUserFlashCard.js***"));
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

	it(". Navigate To Studyboard", function(done) {
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

	it(". Verify page is loaded successfully", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Validate total count decreases as the user enter character in front end of the flashcard field", function(done) {
		if (process.env.RUN_IN_PLATFORM.toString() === "\"mobile\"") {
			this.skip();
		} else {
			flashcardPage.enterDescriptionOnFrontFlashcardField(browser, productData.chapter.topic.flashcard.userflashcard.valuetext[0]).then(function() {
				flashcardPage.fetchCharacterCountFromFlashcard(browser).then(function(textboxCharacterCount) {
					frontFlashcardCharacterCount = parseInt(textboxCharacterCount);
					flashcardPage.leftCountFromFrontFlashcardTextBox(browser).then(function(leftCount) {
						characterLeftCountForFrontFlashcard = parseInt(leftCount);
						textboxCountDecreases = initialLeftCount - frontFlashcardCharacterCount;
						if (textboxCountDecreases === characterLeftCountForFrontFlashcard) {
							console.log(report.reportHeader() +
								report.stepStatusWithData("count decreases as the user enter character in front of flashcard field", characterLeftCountForFrontFlashcard, "success") +
								report.reportFooter());
							done();
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("count decreases as the user enter character in front of flashcard field", characterLeftCountForFrontFlashcard, "failure") +
								report.reportFooter());
						}
					});
				});
			});
		}
	});

	it(". Validate total count decreases as the user enter character in Back of the flashcard field", function(done) {
		if (process.env.RUN_IN_PLATFORM.toString() === "\"mobile\"") {
			this.skip();
		} else {
			flashcardPage.enterDescriptionOnBackFlashcardField(browser, productData.chapter.topic.flashcard.userflashcard.valuetext[1]).then(function() {
				flashcardPage.fetchCharacterCountFromBackFlashcard(browser).then(function(textboxCharacterCount) {
					backFlashcardCharacterCount = parseInt(textboxCharacterCount);
					flashcardPage.leftCountFromBackFlashcardTextBox(browser).then(function(leftCount) {
						characterLeftCountForBackFlashcard = parseInt(leftCount);
						textboxCountDecreases = initialLeftCount - backFlashcardCharacterCount;
						if (textboxCountDecreases === characterLeftCountForBackFlashcard) {
							console.log(report.reportHeader() +
								report.stepStatusWithData("count decreases as the user enter character in back of the flashcard field", characterLeftCountForBackFlashcard, "success") +
								report.reportFooter());
							done();
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("count decreases as the user enter character in  in back of the flashcard field", characterLeftCountForBackFlashcard, "failure") +
								report.reportFooter());
						}
					});
				});
			});
		}
	});

	it(". Validate when user enters the character beyond limits then count goes to displaying with 'negative sign left count' ", function(done) {
		if (process.env.RUN_IN_PLATFORM.toString() === "\"mobile\"" || stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString()) === "safari") {
			this.skip();
		} else {
			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
			recursiveFnPage.validateLeftcountAtFrontTextFlashcard(browser, done);
		}
	});


	it(". Validate the count of all chapters should be present in 'ASSOCIATED CHAPTER' dropdown list", function(done) {
		if (process.env.RUN_IN_PLATFORM.toString() === "\"mobile\"") {
			this.skip();
		} else {
			if(stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString())==="PFIN6"){
			flashcardPage.validateChaptersUnderDropdownList(browser).then(function(count) {
				var totalCOuntOfChapters = _.size(count) - 1;
				console.log(totalCOuntOfChapters);
				var chaptersTotalCount = totalCOuntOfChapters.toString();
				console.log(productData.chapter.topic.flashcard.userflashcard.countOfAllChapters);
				console.log("chaptersTotalCount" + chaptersTotalCount);
				if (chaptersTotalCount.indexOf(parseInt(productData.chapter.topic.flashcard.userflashcard.countOfAllChapters)+2) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Count of all chapters in 'ASSOCIATED CHAPTER' dropdown list is" + chaptersTotalCount, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Count of all chapters in 'ASSOCIATED CHAPTER' dropdown list is" + chaptersTotalCount, "failure") +
						report.reportFooter());
				}
			});
			}else{
				flashcardPage.validateChaptersUnderDropdownList(browser).then(function(count) {
					var totalCOuntOfChapters = _.size(count) - 1;
					console.log(totalCOuntOfChapters);
					var chaptersTotalCount = totalCOuntOfChapters.toString();
					console.log(productData.chapter.topic.flashcard.userflashcard.countOfAllChapters);
					console.log("chaptersTotalCount" + chaptersTotalCount);
					if (chaptersTotalCount.indexOf(productData.chapter.topic.flashcard.userflashcard.countOfAllChapters) > -1) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Count of all chapters in 'ASSOCIATED CHAPTER' dropdown list is" + chaptersTotalCount, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Count of all chapters in 'ASSOCIATED CHAPTER' dropdown list is" + chaptersTotalCount, "failure") +
							report.reportFooter());
					}
				});
			}
		}
	});


	it(". Validate the save button is disabled when user enters the value greater than textbox limit", function(done) {
		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString()) === "firefox" || stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) === "mobile") {
			this.skip();
		}
		flashcardPage.selectChapter(browser, productData.chapter.topic.flashcard.userflashcard.chapter)
			.then(function() {
				flashcardPage.checkSaveButtonDisabled(browser).getAttribute('aria-disabled')
					.then(function(saveButtonStatus) {
						console.log(saveButtonStatus);
						console.log(testData.assignmentDetails.assignmentTextBoxDtails.textBoxStatus);
						flashcardPage.clickOnCancelButton(browser).then(function() {
							if (saveButtonStatus.toString() === testData.assignmentDetails.assignmentTextBoxDtails.textBoxStatus) {
								console.log(report.reportHeader() +
									report.stepStatusWithData("When user not selected the chapter after user enters value for both front and back flashcard field then save button status is ", saveButtonStatus, "success") +
									report.reportFooter());
								done();
							} else {
								console.log(report.reportHeader() +
									report.stepStatusWithData("When user not selected the chapter after user enters value for both front and back flashcard field then save button status is ", saveButtonStatus, "failure") +
									report.reportFooter());
							}
						});
					});
			});
	});

	it(". Verify page is loaded successfully", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Clear all filter after explanding filter button", function(done) {
		if (process.env.RUN_IN_PLATFORM.toString() === "\"mobile\"" || process.env.RUN_IN_PLATFORM.toString() === "\"iOS\"") {
			this.skip();
		} else {
			flashcardPage.clearAllFilters(browser, done);
		}
	});

	it(". Validate the text 'No matching flashcards were found.' after applying clear all filters", function(done) {
		if (process.env.RUN_IN_PLATFORM.toString() === "\"mobile\"" || process.env.RUN_IN_PLATFORM.toString() === "\"iOS\"") {
			this.skip();
		} else {
			flashcardPage.validateTextForFlashcardPresent(browser).text().then(function(textAfterApplyingFilter) {
				if (textAfterApplyingFilter === testData.textAfterApplyingClearAllFilter.textIfNoFlashcardPresent) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Text  after applying 'CLEAR ALL FILTERS' shown as" + textAfterApplyingFilter, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Text  after applying 'CLEAR ALL FILTERS' shown as" + textAfterApplyingFilter, "failure") +
						report.reportFooter());
				}
			});
		}
	});

	it(". Validate the text 'No matching flashcards were found.' after applying clear all filters", function(done) {
		if (process.env.RUN_IN_PLATFORM.toString() === "\"mobile\"" || process.env.RUN_IN_PLATFORM.toString() === "\"iOS\"") {
			this.skip();
		} else {
			flashcardPage.validateTextForFlashcardPresent(browser).text().then(function(textAfterApplyingFilter) {
				if (textAfterApplyingFilter === testData.textAfterApplyingClearAllFilter.textIfNoFlashcardPresent) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Text  after applying 'CLEAR ALL FILTERS' shown as" + textAfterApplyingFilter, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Text  after applying 'CLEAR ALL FILTERS' shown as" + textAfterApplyingFilter, "failure") +
						report.reportFooter());
				}
			});
		}
	});

	it(". Create a flashcard with full details", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		flashcardPage.createFlashcardWithFullDetails(browser, done,
			productData.chapter.topic.flashcard.userflashcard.valuetext[0],
			productData.chapter.topic.flashcard.userflashcard.valuetext[1],
			productData.chapter.topic.flashcard.userflashcard.chapterValue,
			productData.chapter.topic.flashcard.userflashcard.usertag,
			productData.chapter.topic.flashcard.userflashcard.comprehension
		);
	});

	it(". Validate the text 'Your Flashcard has been created but is not visible due to the current filter.' on alert if user create a user flashcard after selcting filter", function(done) {
		if (process.env.RUN_IN_PLATFORM.toString() === "\"mobile\"" || process.env.RUN_IN_PLATFORM.toString() === "\"iOS\"") {
			this.skip();
		} else {
			flashcardPage.validateFlashcardVisiblility(browser).text().then(function(flashcardTextVisibility) {
				if (flashcardTextVisibility === testData.textAfterApplyingClearAllFilter.alertTextInCUrrentFilter) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Validate the text on alert if user create a user flashcard after selcting filter" + flashcardTextVisibility, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Validate the text on alert if user create a user flashcard after selcting filter " + flashcardTextVisibility, "failure") +
						report.reportFooter());
				}
			});
		}
	});


	it(". Verify page is loaded successfully", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Navigate to user flashcard View", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		flashcardPage.selectUserFlashcardViewBeforeCreateFlashcard(browser).then(function() {
			done();
		});
	});

	it(". Verify page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Expand the Filter panel", function(done) {
		studyboardPage.clickOnFilter(browser).then(function() {
			done();
		});
	});

	it(". Filter the Flashcard by applying comprehension attribute on Filter panel after clearing it and validate the result", function(done) {
		studyboardPage.clickOnClearFilterThenSelectOne(browser, "by-comprehension", "Weak").then(function() {
			studyboardPage.clickOnFilteredFlashcard(browser).then(function() {
				studyboardPage.getUserTag(browser).text().then(function(userTagFetched) {
					if (userTagFetched.indexOf(productData.chapter.topic.flashcard.userflashcard.usertag) > -1) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Flashcard : User tag of filtered flashcard which is:: " + userTagFetched + " is compared against user tag specified while creating flashcard which is", productData.chapter.topic.flashcard.userflashcard.usertag, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Flashcard : User tag of filtered flashcard which is:: " + userTagFetched + " is compared against user tag specified while creating flashcard which is", productData.chapter.topic.flashcard.userflashcard.usertag, "failure") +
							report.reportFooter());
					}
				});
			});
		});
	});

	it(". Review the Flash deck, validating Front text, flipping it validating back text and Review Result ", function(done) {
		flashcardPage.navigateToPublisherFlashcardReview(browser).then(function() {
			flashcardPage.validateFrontContentOnReviewDeck(browser).then(function(frontText) {
				if (frontText.indexOf(productData.chapter.topic.flashcard.userflashcard.valuetext[0]) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Flashcard Review deck: Front text of Flashcard on the deck  :: " + frontText + " is compared against front text specified while creating flashcard which is", productData.chapter.topic.flashcard.userflashcard.valuetext[0], "success") +
						report.reportFooter());
					flashcardPage.clickOnArrowIconOnReviewDeck(browser).then(function() {
						flashcardPage.validateBackContentOnReviewDeck(browser).then(function(backText) {
							if (backText.indexOf(productData.chapter.topic.flashcard.userflashcard.valuetext[1]) > -1) {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Flashcard Review deck: Back text of Flashcard on the deck  :: " + backText + " is compared against back text specified while creating flashcard which is", productData.chapter.topic.flashcard.userflashcard.valuetext[1], "success") +
									report.reportFooter());
								done();
							} else {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Flashcard Review deck: back text of Flashcard on the deck  :: " + backText + " is compared against back text specified while creating flashcard which is", productData.chapter.topic.flashcard.userflashcard.valuetext[1], "failure") +
									report.reportFooter());
							}
						});
					});
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Flashcard Review deck: Front text of Flashcard on the deck  :: " + frontText + " is compared against front text specified while creating flashcard which is", productData.chapter.topic.flashcard.userflashcard.valuetext[0], "failure") +
						report.reportFooter());
				}
			});
		});
	});

	it(". Click on next button,fetch the result from review result ", function(done) {
		flashcardPage.clickOnNextButton(browser).then(function() {
			 
			flashcardPage.flashCardCountOfComprehensionLevel(browser, productData.chapter.topic.flashcard.userflashcard.reviewComprehension)
				.text().then(function(currentDeckResult) {
					console.log("currentDeckResult");
					reviewDeckResultBeforeShuffle = currentDeckResult;
					console.log(report.reportHeader() +
						report.stepStatusWithData("Flashcard Review deck: Result before shuffle and review again is ::" + reviewDeckResultBeforeShuffle, "success") +
						report.reportFooter());
					done();
				});
		});
	});

	it(". Review the deck again and remove the comprehension level from the deck", function(done) {
		flashcardPage.diselectFlashComprehensionLavelIs(browser, productData.chapter.topic.flashcard.userflashcard.comprehension).then(function() {
			flashcardPage.clickOnNextButton(browser).then(function() {
				done();
			});
		});
	});

	it(". Validate the review deck result after shuffle", function(done) {
		var result;
		flashcardPage.flashCardCountOfComprehensionLevel(browser, productData.chapter.topic.flashcard.userflashcard.reviewComprehension)
			.text().then(function(deckResultAfterShuffle) {
				reviewDeckResultAfterShuffle = deckResultAfterShuffle;
				result = reviewDeckResultBeforeShuffle - 1
				if (parseInt(reviewDeckResultAfterShuffle) === parseInt(result)) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Flashcard Review deck: Result before shuffle and review again is ::" + reviewDeckResultBeforeShuffle, "and result after shuffle is ::" + reviewDeckResultAfterShuffle, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Flashcard Review deck: Result before shuffle and review again is ::" + reviewDeckResultBeforeShuffle, "and result after shuffle is ::" + reviewDeckResultAfterShuffle, "failure") +
						report.reportFooter());
				}
			});
	});


	it(". Navigate to StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Verify page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
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
		tocPage.navigateToATopic(productData.chapter.id, productData.chapter.topic.id, browser)
			.then(function() {
				tocPage.disposeFirstVisitTopicModalIfVisible(browser).then(function() {
					tocPage.getTopicTitleHero(browser).then(function(text) {
						text.should.contain(productData.chapter.topic.titlehero);
					}).nodeify(done);
				});

			});
	});

	it(". Verify page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Create a Text StudyBit", function(done) {
		studybit.createTextStudyBit(browser, done, productData.chapter.topic.studybit.text.id,
			productData.chapter.topic.studybit.text.concepts,
			productData.chapter.topic.studybit.text.usertag,
			productData.chapter.topic.studybit.text.notes,
			productData.chapter.topic.studybit.text.comprehension,
			productData.chapter.topic.studybit.text.windowScrollY);
	});

	it(". Validate if StudyBit is successfully saved on narrative view ", function(done) {
		studybit.validateTextStudyBitSave(browser, done, productData.chapter.topic.studybit.text.id,
			productData.chapter.topic.studybit.text.concepts,
			productData.chapter.topic.studybit.text.usertag,
			productData.chapter.topic.studybit.text.notes,
			productData.chapter.topic.studybit.text.comprehension,
			productData.chapter.topic.studybit.text.windowScrollY);
	});

	it(". Navigate To StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Verify the presence of text StudyBit on StudyBoard ", function(done) {
		studybit.validateTextStudyBitOnStudyBoard(browser, done,
			productData.chapter.topic.studybit.text.chaptername,
			productData.chapter.topic.studybit.text.notes,
			productData.chapter.topic.studybit.text.concepts,
			productData.chapter.topic.studybit.text.usertag);
	});

	it(". Edit tag of text studybit", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		if (process.env.RUN_IN_PLATFORM.toString() === "\"mobile\"" || process.env.RUN_IN_PLATFORM.toString() === "\"iOS\"") {
			studybit.closeExpandedStudybit(browser).then(function() {
				studybit.editStudybitWithTag(browser, productData.chapter.topic.studybit.text.usertag).then(function() {
					studybit.clickOnSaveButton(browser).then(function() {
						studybit.closeExpandedStudybit(browser).then(function() {
							pageLoadingTime = 0;
							takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
						});
					});
				});
			});
		} else {
			studybit.closeExpandedStudybit(browser).then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
		}
	});

	it(". Refresh the page", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		if (process.env.RUN_IN_PLATFORM.toString() === "\"mobile\"" || process.env.RUN_IN_PLATFORM.toString() === "\"iOS\"") {
			browser.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
		} else {
			this.skip();
		}
	});

	it(". Click on Create FlashCard button", function(done) {
		studybit.expandStudyBit(browser).then(function() {
			flashcardPage.clickOnCreateFlashcardFromSB(browser).then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
		});
	});

	it(". Validate that chapter name inherited from the created studybit", function(done) {
		flashcardPage.verfiychapterIsPresentByDefault(browser).text().then(function(chaptername) {
			if (chaptername.indexOf(productData.chapter.topic.flashcard.userflashcard.chapter) > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("chapter name inherited from the created studybit with chapter name ", chaptername, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("chapter name inherited from the created studybit with chapter name ", chaptername, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Create a Flashcard from StudyBit", function(done) {
		flashcardPage.createFlashcardFromStudyBit(browser, done, productData.chapter.topic.flashcard.userflashcard.valuetext[1]);
	});



	it(". Navigate to user flashcard View", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		flashcardPage.selectUserFlashcardView(browser).then(function() {
			done();
		});
	});

	it(". Verify the presence of user Flashcard on StudyBoard ", function(done) {
		console.log("productData.chapter.topic.studybit.text.usertag ::" + productData.chapter.topic.studybit.text.usertag);
		flashcardPage.validateUserFlashCardOnStudyBoard(browser).then(function(userTag) {
			console.log("userTag" + userTag);
			if (userTag.indexOf(productData.chapter.topic.studybit.text.usertag) > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("StudyBit Flashcard is successfully saved and appearing on  StudyBoard with user tag ", userTag, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("StudyBit Flashcard is not successfully saved and is not appearing on  StudyBoard", userTag, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Close on expanded FlashCard", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		studyboardPage.closeExpandedStudybit(browser).then(function() {
			done();
		});
	});

	it(". Refresh the page", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});


	it(". Click on filter and Navigate to user flashcard View", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		studyboardPage.clickFilterAndSelectMyFlashcardView(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Enter the user tag", function(done) {
		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) == "mobile" || stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) === "iOS") {
			console.log("this feature is not for mobile device");
			this.skip();
		} else {
			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
			studyboardPage.enterTagValueOnFilterPanelFlashcard(browser, productData.chapter.topic.studybit.text.usertag).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("StudyBit Flashcard is filtered by their usertag", productData.chapter.topic.studybit.text.usertag, "success") +
					report.reportFooter());
				done();
			});
		}
	});

	it(". Filter the flashcard by comprehension level", function(done) {
		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) == "mobile" || stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) === "iOS") {
			console.log("this feature is not for mobile device");
			this.skip();
		} else {
			studyboardPage.clickOnClearFilterThenSelectOne(browser, "by-comprehension", "Unassigned").then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("StudyBit Flashcard is filtered by their respective comprehension level", "Unassigned", "success") +
					report.reportFooter());
				done();
			});
		}
	});

	it(". Verify the flashcard is filtered by user tag, type and comprehension level on studyboard", function(done) {
		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) == "mobile" || stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) === "iOS") {
			console.log("this feature is not for mobile device");
			this.skip();
		} else {
			studyboardPage.clickOnFilter(browser).then(function() {
				flashcardPage.validateUserFlashCardOnStudyBoard(browser).then(function(userTag) {
					if (userTag.indexOf(productData.chapter.topic.studybit.text.usertag) > -1) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("StudyBit Flashcard is filtered by their respective usertag", userTag, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("StudyBit Flashcard is filtered by their respective usertag, comprehension level and type", userTag, "failure") +
							report.reportFooter());
					}
				});
			});
		}
	});

	it(". Delete the created user flashcards", function(done) {
		// studyboardPage.closeExpandedStudybit(browser).then(function(){
		clearAllSavedContent.clearFlashcard(browser, done);
		// });
	});

	it(". wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Refresh the page", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Navigate To StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Verify page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Delete the created studybit", function(done) {
		clearAllSavedContent.clearStudyboard(browser, done);
	});

	it(". Log out as Student", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userSignOut.userSignOut(browser, done);
	});
});
