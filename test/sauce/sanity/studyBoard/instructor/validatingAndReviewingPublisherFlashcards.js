  require('colors');
  var wd = require('wd');
  var asserters = wd.asserters;
  var testData = require("../../../../../test_data/data.json");
  var session = require("../../../support/setup/browser-session");
  var stringutil = require("../../../util/stringUtil");
  var pageobject = stringutil.getPlatform();
  var envName = stringutil.getEnvironment();
  var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
  var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
  var tocPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/tocpo");
  var studyboardPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/studyboardpo.js");
  var flashcard = require("../../../support/pageobject/" + pageobject + "/" + envName + "/flashcardspo.js");
  var clearData = require("../../../support/pageobject/" + pageobject + "/" + envName + "/clearData.js");
  var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
  var report = require("../../../support/reporting/reportgenerator");
  var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
  var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
  var _ = require('underscore');
  var courseHelper = require("../../../support/helpers/courseHelper");
  var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
  var studybit = require("../../../support/pageobject/" + pageobject + "/" + envName + "/studybitpo.js");
  var flashcardPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/flashcardspo.js");
  var path = require('path');
  var scriptName = path.basename(__filename);
  describe(scriptName + 'INSTRUCTOR :: PUBLISHER FLASHCARDS VALIDATION AND REVIEW', function() {
  	var browser;
  	var allPassed = true;
  	var userType;
  	var courseName;
  	var product;
  	var data;
  	var productData;
  	var count = 0;
  	var GlobalCount;
  	var comprehensionlevelAfterTheChange;
  	var pageLoadingTime;
  	var frontTextOfFlashcardBeforeEdit;
  	var serialNumber = 0;
  	var flashcardFronttextAfterRevertingEditedFlashcard;
  	var flashcardFronttextBeforeEdit;
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
  		console.log(report.formatTestName("PUBLISHER FLASHCARD VALIDATION AND REVIEW"));
  		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
  		console.log(report.formatTestScriptFileName("***validatingAndReviewingPublisherFlashcards.js***"));
  		console.log(report.printTestData("CHAPTER " + productData.chapter.id + " ", productData.chapter.title));

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
  		browser.refresh().then(function() {
  			pageLoadingTime = 0;
  			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
  		});
  	});

  	it(". Verify Key Term Flashcard is present for every Chapter", function(done) {
  		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
  		flashcard.verifyKeyTermFlashcard(browser, done);
  	});

  	it(". Verify if the unexpanded flashcard tile has the keyterm icon", function(done) {
  		browser
  			.execute("return getComputedStyle(document.querySelector('.studybit.keyterm .tile-icon')).backgroundImage").then(function(iconurl) { // updated for INT
  				if (iconurl.indexOf('studybit-keyterm-default') > -1) {
  					console.log(report.reportHeader() +
  						report.stepStatusWithData("Icon For Key Term Flash Card", iconurl, "success") +
  						report.reportFooter());
  					done();
  				} else {
  					console.log(report.reportHeader() +
  						report.stepStatusWithData("Icon For Key Term Flash Card", "", "failure") +
  						report.reportFooter());
  				}
  			});
  	});

  	it(". Wait until page is loaded successfully", function(done) {
  		pageLoadingTime = 0;
  		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
  	});

  	it(". Open the filter panel and verify the tags on Publisher keyterms is pulling the tags for smart search", function(done) {
  		this.timeout(courseHelper.getElevatedTimeout());
  		studyboardPage.clickOnFilter(browser).then(function() {
  			studyboardPage.typeSearchText(browser, productData.chapter.topic.flashcards.publisher.chapters[0].searchtag).then(function() {
  				flashcard.verifyTextFromSmartSearch(browser, done);
  			});
  		});
  	});


  	it(". Expand the Flashcard and verify the text on the front and back of the flashcard", function(done) {
  		flashcard.expandTheFlashCard(browser).then(function() {
  			done();
  		});
  	});

  	it(". Verify the presence of publisher keyterm concepts on the expanded flashcard", function(done) {
  		this.timeout(courseHelper.getElevatedTimeout());
  		flashcard.verifyKeyTermPublisherConcepts(browser, done);
  	});

  	it(". Close Expanded Flashcard", function(done) {
  		flashcard.closeExpandedFlashcard(browser, done);
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
  		flashcard.navigateToPublisherFlashcardReview(browser).then(function() {
  			done();
  		});
  	});

  	it(". Verify the total count of Key term flash card in Chapter First", function(done) {
  		flashcard.getCardNoOnReviewDeck(browser).text().then(function(flashcardcountOnReviewDeck) {
  			var flashcardcount = stringutil.returnValueAfterSplit(flashcardcountOnReviewDeck, "of ", 1);
  			GlobalCount = flashcardcount;
  			if (GlobalCount) {
  				console.log(report.reportHeader() +
  					report.stepStatusWithData("Count of Key Term Flash Card for Chapter First on ReviewDesk view", GlobalCount, "success") +
  					report.reportFooter());
  				done();
  			} else {
  				console.log(report.reportHeader() +
  					report.stepStatus("Count of Key Term Flash Card for Chapter First on ReviewDesk view", "", "failure") +
  					report.reportFooter());

  			}
  		});
  	});

  	it(". Navigate To PublisherFlashcard", function(done) {
  		pageLoadingTime = 0;
  		flashcard.clickOnExitButton(browser).then(function() {
  			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
  		});
  	});

  	it(". Wait until page is loaded successfully", function(done) {
  		browser.refresh().then(function() {
  			pageLoadingTime = 0;
  			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
  		});
  	});

  	it(". Click on Filter and clear all chapter toggle", function(done) {
  		studyboardPage.clickOnFilter(browser).then(function() {
  			studyboardPage.clearAllChapterFilters(browser, done);
  		});
  	});

  	it(". NavigateToPublisherFlashcardReview", function(done) {
  		pageLoadingTime = 0;
  		studyboardPage.selectChapterForFilter(browser, "1").then(function() {
  			flashcard.navigateToPublisherFlashcardReview(browser).then(function() {
  				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
  			});
  		});
  	});

  	it(". Verify text on Front and back side of Flash Card", function(done) {
  		this.timeout(courseHelper.getElevatedTimeout("publisherFlashCardReviewDeck"));
  		flashcard.verifyFrontAndBackFlashCard(browser, done);
  	});

  	it(". Validate flashCard counts on flash card results", function(done) {
  		comprehensionlevelAfterTheChange = GlobalCount - 1;
  		if (process.env.RUN_ENV.toString() === "\"production\"") {
  			flashcard.validateCountForKeytermFlashCardOnPROD(browser).then(function() {
  				done();
  			})
  		} else {
  			flashcard.validateCountForKeytermFlashCard(browser, comprehensionlevelAfterTheChange, GlobalCount).then(function() {
  				done();
  			})
  		}
  	});


  	it(". Click on Exit Button and verify the presence of shuffle button", function(done) {
  		this.timeout(courseHelper.getElevatedTimeout());
  		flashcard.verifyPresenceOfShuffle(browser, "Shuffle").then(function() {
  			flashcard.clickOnExitButton(browser, done);
  		});
  	});

  	it(". Wait until page is loaded successfully", function(done) {
  		pageLoadingTime = 0;
  		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
  	});

  	it(". Revert all Flashcard", function(done) {
  		this.timeout(courseHelper.getElevatedTimeout());
  		clearData.revertAllKeyTermFlashcard(browser, done);
  	});

  	it(". Wait until page is loaded successfully", function(done) {
  		pageLoadingTime = 0;
  		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
  	});

  	it(". Expand the Flashcard and log the text on front of the flashcard", function(done) {
  		flashcard.expandTheFlashCard(browser).then(function() {
  			flashcard.getFrontTextBeforeEdit(browser).then(function(frontText) {
  				frontTextOfFlashcardBeforeEdit = frontText;
  				done();
  			});
  		});
  	});

  	it(". Edit chapter and save the flashcard", function(done) {
  		flashcard.editChapterOfKeyTermFlashcard(browser, testData.alertForFlashcardFileter.editFlashcardChapter).then(function() {
  			done();
  		});
  	});


  	it(". Validate Flashcard appears under edited chapter chapter", function(done) {
  		flashcard.getFrontTextBeforeEdit(browser).then(function(frontTextOfFlashcard) {
  			if (frontTextOfFlashcard.indexOf(frontTextOfFlashcardBeforeEdit) > -1) {
  				flashcard.validateEditedFlashcardChapter(browser, testData.alertForFlashcardFileter.editFlashcardChapter, frontTextOfFlashcardBeforeEdit).then(function() {
  					console.log(report.reportHeader() +
  						report.stepStatusWithData("Text on front of flashcard before edit " + frontTextOfFlashcardBeforeEdit + " is compared against the front text of flashcard after edit under edited chapter", frontTextOfFlashcard, "success") +
  						report.reportFooter());
  					done();
  				});
  			} else {
  				console.log(report.reportHeader() +
  					report.stepStatusWithData("Text on front of flashcard before edit " + frontTextOfFlashcardBeforeEdit + " is compared against the front text of flashcard after edit under edited chapter", frontTextOfFlashcard, "success") +
  					report.reportFooter());
  			}
  		});
  	});

  	it(". Revert all Flashcard", function(done) {
  		this.timeout(courseHelper.getElevatedTimeout());
  		clearData.revertAllKeyTermFlashcard(browser, done);
  	});

  	it(". Wait until page is loaded successfully", function(done) {
  		pageLoadingTime = 0;
  		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
  	});

  	it(". Fetch the Front text of the first flashcard under keyterm flashcatd page", function(done) {
  		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) === "mobile") {
  			flashcardPage.fetchTextOnKeytermFlashcard(browser).then(function(frontText) {
  				flashcardFronttextBeforeEdit = frontText;
  				console.log(frontText);
  				console.log(flashcardFronttextBeforeEdit);
  				console.log(report.reportHeader() +
  					report.stepStatusWithData("Front text of the first flashcard under flashcard page" + flashcardFronttextBeforeEdit, "success") +
  					report.reportFooter());
  				done();
  			});
  		} else {
  			flashcardPage.fetchTextOnKeytermFlashcard(browser).text().then(function(frontText) {
  				flashcardFronttextBeforeEdit = frontText;
  				console.log(frontText);
  				console.log(flashcardFronttextBeforeEdit);
  				console.log(report.reportHeader() +
  					report.stepStatusWithData("Front text of the first flashcard under flashcard page" + flashcardFronttextBeforeEdit, "success") +
  					report.reportFooter());
  				done();
  			});
  		}
  	});

  	it(". Edit key term flashcard", function(done) {
  		flashcardPage.editKeyTermFlashcard(browser, productData.chapter.topic.flashcard.userflashcard.edittag).then(function() {
  			done();
  		});
  	});

  	it(". Close on expanded FlashCard", function(done) {
  		flashcardPage.closeExpandedFlashcard(browser, done);
  	});

  	it(". Revert the recently added Flashcard ", function(done) {
  		clearData.revertKeyTermFlashcard(browser, done);
  	});

  	it(". Wait until page is loaded successfully", function(done) {
  		pageLoadingTime = 0;
  		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
  	});

  	it(". Refresh and wait until page is loaded successfully", function(done) {
  		browser.refresh().then(function() {
  			pageLoadingTime = 0;
  			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
  		});
  	});

  	it(". BUG:: LTR-4600 ::Verify On clicking Revert button or Revert to Original button the flashcard should not vanishes from the DOM", function(done) {
  		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) === "mobile") {
  			flashcardPage.fetchTextOnKeytermFlashcard(browser).then(function(textOfFlashcard) {
  				flashcardFronttextAfterRevertingEditedFlashcard = textOfFlashcard;
  				console.log(flashcardFronttextAfterRevertingEditedFlashcard);
  				flashcardPage.validateEditedFlashcardChapterPresent(browser, flashcardFronttextBeforeEdit).then(function(status) {
  					if (status) {
  						console.log(report.reportHeader() +
  							report.stepStatusWithData("On clicking Revert button or Revert to Original button the flashcard is not vanishes from its original position,front text before edit" + frontTextOfFlashcardBeforeEdit + " is compared against the front text of flashcard after edit ", flashcardFronttextAfterRevertingEditedFlashcard, "success") +
  							report.reportFooter());
  						done();
  					} else {
  						console.log(report.reportHeader() +
  							report.stepStatusWithData("On clicking Revert button or Revert to Original button the flashcard vanishes from the DOM ,front text before edit" + frontTextOfFlashcardBeforeEdit + " is compared against the front text of flashcard after edit", flashcardFronttextAfterRevertingEditedFlashcard, "success") +
  							report.reportFooter());
  					}
  				});
  			});
  		} else {
  			flashcardPage.fetchTextOnKeytermFlashcard(browser).text().then(function(textOfFlashcard) {
  				flashcardFronttextAfterRevertingEditedFlashcard = textOfFlashcard;
  				console.log(flashcardFronttextAfterRevertingEditedFlashcard);
  				flashcardPage.validateEditedFlashcardChapterPresent(browser, flashcardFronttextBeforeEdit).then(function(status) {
  					if (status) {
  						console.log(report.reportHeader() +
  							report.stepStatusWithData("On clicking Revert button or Revert to Original button the flashcard is not vanishes from its original position,front text before edit" + frontTextOfFlashcardBeforeEdit + " is compared against the front text of flashcard after edit ", flashcardFronttextAfterRevertingEditedFlashcard, "success") +
  							report.reportFooter());
  						done();
  					} else {
  						console.log(report.reportHeader() +
  							report.stepStatusWithData("On clicking Revert button or Revert to Original button the flashcard vanishes from the DOM ,front text before edit" + frontTextOfFlashcardBeforeEdit + " is compared against the front text of flashcard after edit", flashcardFronttextAfterRevertingEditedFlashcard, "success") +
  							report.reportFooter());
  					}
  				});
  			});
  		}
  	});

  	it(". Log out as instructor", function(done) {
  		this.timeout(courseHelper.getElevatedTimeout());
  		userSignOut.userSignOut(browser, done);
  	});

  });
