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
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var studybit = require("../../../support/pageobject/" + pageobject + "/" + envName + "/studybitpo");
var clearAllSavedContent = require("../../../support/pageobject/" + pageobject + "/" + envName + "/clearData");
var report = require("../../../support/reporting/reportgenerator");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var flashcardPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/flashcardspo.js");
var courseHelper = require("../../../support/helpers/courseHelper");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'INSTUCTOR :: STUDYBIT AND FLASHCARD CREATION OF MATH EQUATION AND STUDYBOARD VALIDATION', function() {
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
	var mathEqnErrorStatus;
	if (stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString()) != "MKTG9") {
		console.log(report.reportHeader() +
			report.stepStatusWithData("Math Equation is not present on this title", stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString()), "success") +
			report.reportFooter());
	} else {
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
			console.log(report.formatTestName("INSRTUCTOR :: 4LTR FEATURES :: MATH EQUATION STUDYBIT AND FLASHCARD VALIDATION"));
			console.log("======================================");
			console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
			console.log(report.formatTestScriptFileName("***validateMathEquationStudybit.js***"));
			console.log(report.printTestData("STUDYBITID", productData.chapter.topic.studybit.mathequation.id));
			console.log(report.printTestData("STUDYBIT CONCEPT", productData.chapter.topic.studybit.mathequation.concepts[0]));
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

		it(". Navigate to StudyBoard ", function(done) {
			studybit.navigateToStudyBoard(browser, done);
		});

		it(". Wait for page loading", function(done) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});

		it(". Delete the created studybits if any", function(done) {
			clearAllSavedContent.clearStudyboard(browser, done);
		});

		it(". Wait for page loading", function(done) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});

		it(". Navigate flashcard Tab", function(done) {
			flashcardPage.SelectFlashcardTab(browser, done);
		});

		it(". Wait until page is loaded successfully", function(done) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});

		it(". Navigate to user flashcard View", function(done) {
			this.timeout(courseHelper.getElevatedTimeout());
			flashcardPage.selectUserFlashcardViewBeforeCreateFlashcard(browser).then(function() {
				done();
			});
		});

		it(". Delete already created user flashcards", function(done) {
			this.timeout(courseHelper.getElevatedTimeout());
			clearAllSavedContent.clearFlashcard(browser, done);
		});

		it(". Wait until page is loaded successfully", function(done) {
			browser.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
		});

		it(". Navigate to studyboard", function(done) {
			if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) === "iOS") {
				browser.sleep(3000).waitForElementByCss(".view-select a:nth-child(2)", asserters.isDisplayed, 30000).click()
					.refresh().then(function() {
						pageLoadingTime = 0;
						takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
					});
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("This step is specific to iOS device, i.e.", "iPhone", " success") +
					report.reportFooter());
				done();
			}
		});

		it(". Navigate to TOC ", function(done) {
			tocPage.navigateToToc(browser).nodeify(done);
		});

		it(". Wait for page loading", function(done) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});

		it(". Click on List view", function(done) {
			tocPage.selectListView(browser).then(function() {
				done();
			});
		});

		it(". Navigate to a Chapter", function(done) {
			tocPage.navigateToAChapterByListView(productData.chapter.id, browser, productData.chapter.topic.studybit.mathequation.chapter).then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
			});
		});

		it(". Navigate to a topic", function(done) {
			tocPage.navigateToATopicByListView(browser, done, productData.chapter.id, productData.chapter.topic.studybit.mathequation.topic);
		});

		it(". Validate presence of math equation in narrative content", function(done) {
			this.retries(3);
			this.timeout(courseHelper.getElevatedTimeout());
			studybit.verifyMathEquation(browser, productData.chapter.topic.studybit.mathequation.id)
				.then(function(attibute) {
					if (attibute.indexOf("mathexpr") > -1) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Math Equation is present in chapter " + productData.chapter.topic.studybit.mathequation.chapter + " topic ", productData.chapter.topic.studybit.mathequation.topic, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Math Equation is not present on selected chapter topic", "", " failure") +
							report.reportFooter());
					}
				});
		});

		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) == "mobile" || stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) === "iOS") {
			console.log("this feature is not for mobile device");
		} else {

			it(". Create a Text StudyBit", function(done) {
				this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
				studybit.createTextStudyBit(browser, done, productData.chapter.topic.studybit.mathequation.id,
					productData.chapter.topic.studybit.mathequation.concepts,
					productData.chapter.topic.studybit.mathequation.usertag,
					productData.chapter.topic.studybit.mathequation.notes,
					productData.chapter.topic.studybit.mathequation.comprehension,
					productData.chapter.topic.studybit.mathequation.windowScrollY);
			});

			it(". LTR-5086 Verify after saving the studybit 'Math processing error' should not be display on narrative view", function(done) {
				this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
				studybit.verifyMathEqtnError(browser).then(function(errorStatus) {
					mathEqnErrorStatus = errorStatus;
					if (!mathEqnErrorStatus) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Math processing error is appearing while creating math equation studybit", "", "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Math processing error is appearing while creating math equation studybit", "", "failure") +
							report.reportFooter());
					}
				});
			});

			it(". Navigate To StudyBoard ", function(done) {
				if (mathEqnErrorStatus) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Math processing error is appearing while creating math equation studybit", "", "success") +
						report.reportFooter());
					this.skip();
				} else {
					studybit.navigateToStudyBoard(browser, done);

				}
			});

			it(". Validate presence of math equation on StudyBoard with unexpanded view", function(done) {
				if (mathEqnErrorStatus) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Math processing error is appearing while creating math equation studybit", "", "success") +
						report.reportFooter());
					this.skip();
					done();
				} else {
					studybit.verifyMathEquation(browser, productData.chapter.topic.studybit.mathequation.id)
						.then(function(attibute) {
							console.log("attibute" + attibute);
							if (attibute.indexOf("mathexpr") > -1) {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Math Equation is present on StudyBoard with unexpanded view", "", "success") +
									report.reportFooter());
								done();
							} else {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Math Equation is not present on StudyBoard with unexpanded view", "", "failure") +
									report.reportFooter());
							}
						});
				}
			});

			it(". Validate presence of math equation on StudyBoard with expanded view", function(done) {
				if (mathEqnErrorStatus) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Math processing error is appearing while creating math equation studybit", "", "success") +
						report.reportFooter());
					this.skip();
				} else {
					studybit.openMathEquationStudybit(browser).then(function() {
						studybit.verifyMathEquation(browser, productData.chapter.topic.studybit.mathequation.id)
							.then(function(attibute) {
								if (attibute.indexOf("mathexpr") > -1) {
									console.log(report.reportHeader() +
										report.stepStatusWithData("Math Equation is present on StudyBoard with expanded view", attibute, "success") +
										report.reportFooter());
									done();
								} else {
									console.log(report.reportHeader() +
										report.stepStatusWithData("Math Equation is not present on StudyBoard with expanded view", attibute, "failure") +
										report.reportFooter());
								}
							});
					});
				}
			});

			it(". Switch to unexpanded view ", function(done) {
				if (mathEqnErrorStatus) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Math processing error is appearing while creating math equation studybit", "", "success") +
						report.reportFooter());
					this.skip();
				} else {
					studybit.openMathEquationStudybit(browser);
					done();
				}
			});

			it(". Validate the presence of Math Equation StudyBit on StudyBoard ", function(done) {
				if (mathEqnErrorStatus) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Math processing error is appearing while creating math equation studybit", "", "success") +
						report.reportFooter());
					this.skip();
				} else {
					studybit.validateMathEquationStudyBitOnStudyBoard(browser, done,
						productData.chapter.topic.studybit.mathequation.chaptername,
						productData.chapter.topic.studybit.mathequation.notes,
						productData.chapter.topic.studybit.mathequation.concepts,
						productData.chapter.topic.studybit.mathequation.usertag);
				}
			});

			it(". Create flashcard from studybit on StudyBoard page", function(done) {
				if (mathEqnErrorStatus) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Math processing error is appearing while creating math equation studybit", "", "success") +
						report.reportFooter());
					this.skip();
				} else {
					flashcardPage.clickOnCreateFlashcardFromSB(browser).then(function() {
						done();
					});
				}
			});

			it(". Validate if front side of the flashcard can be edited", function(done) {
				if (mathEqnErrorStatus) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Math processing error is appearing while creating math equation studybit", "", "success") +
						report.reportFooter());
					this.skip();
				} else {
					flashcardPage.verifyIfFrontIsEditable(browser).then(function(nonEditableTextOnMathEquFlashcard) {
						if (nonEditableTextOnMathEquFlashcard.indexOf("text not editable" > -1)) {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Front Side is not editable", "", "success") +
								report.reportFooter());
							done();
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Front Side is editable", "", "failure") +
								report.reportFooter());
						}
					});
				}
			});

			it(". Click to Create Flashcard", function(done) {
				if (mathEqnErrorStatus) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Math processing error is appearing while creating math equation studybit", "", "success") +
						report.reportFooter());
					this.skip();
				} else {
					flashcardPage.createFlashcardFromStudyBit(browser, done, "Robo text for flashcard back text box");
				}
			});

			it(". Validate Math Equation Rendering in Flashcard on expanded View", function(done) {
				this.retries(3);
				if (mathEqnErrorStatus) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Math processing error is appearing while creating math equation studybit", "", "success") +
						report.reportFooter());
					this.skip();
				} else {
					flashcardPage.checkForMathEquation(browser).then(function(mathequation) {
						if (mathequation) {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Math Equation is rendering ", mathequation, "success") +
								report.reportFooter());
							done();
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Math Equation is not rendering ", mathequation, "failure") +
								report.reportFooter());
						}
					});
				}
			});

			it(". Validate if Scroller is Present in Math Equation Flashcard", function(done) {
				this.retries(3);
				if (mathEqnErrorStatus) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Math processing error is appearing while creating math equation studybit", "", "success") +
						report.reportFooter());
					this.skip();
				} else {
					flashcardPage.checkForScroller(browser).then(function(scrollProperty) {
						if (scrollProperty === "visible" || scrollProperty === "auto") {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Status of scroller on ", scrollProperty, "success") +
								report.reportFooter());
							done();
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Math Equation is not rendering properly ", scrollProperty, "failure") +
								report.reportFooter());
						}
					});
				}
			});

			it(". Navigate to flashcard review ", function(done) {
				if (mathEqnErrorStatus) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Math processing error is appearing while creating math equation studybit", "", "success") +
						report.reportFooter());
					this.skip();
				} else {
					flashcardPage.navigateToPublisherFlashcardReview(browser).then(function() {
						pageLoadingTime = 0;
						takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
					});
				}
			});

			it.skip(" Validating Math equation Front text, flipping it validating math equation back text ", function(done) {
				this.timeout(courseHelper.getElevatedTimeout());
				flashcardPage.validateFrontContentOnReviewDeck(browser).then(function(frontText) {
					// if (process.env.RUN_ENV.toString() === "\"integration\"" || process.env.RUN_ENV.toString() === "\"staging\"") {
					console.log("if condition");
					console.log(frontText);
					if (frontText.indexOf(productData.chapter.topic.flashcard.userflashcard.mathequationValueINT[0]) > -1) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Flashcard Review deck: Front text of Flashcard on the deck  :: \n" + frontText + " \n is compared against front text specified while creating flashcard which is \n", productData.chapter.topic.flashcard.userflashcard.mathequationValue[0], "success") +
							report.reportFooter());
						flashcardPage.clickBackArrowOnReviewDeck(browser).then(function() {
							flashcardPage.validateBackContentOnReviewDeck(browser).then(function(backText) {
								if (backText.indexOf(productData.chapter.topic.flashcard.userflashcard.mathequationValueINT[1]) > -1) {
									console.log(report.reportHeader() +
										report.stepStatusWithData("Flashcard Review deck: Back text of Flashcard on the deck  :: " + backText + " is compared against back text specified while creating flashcard which is", productData.chapter.topic.flashcard.userflashcard.valuetext[1], "success") +
										report.reportFooter());
									done();
								} else {
									console.log(report.reportHeader() +
										report.stepStatusWithData("Flashcard Review deck: back text of Flashcard on the deck  :: " + backText + " is compared against back text specified while creating flashcard which is", productData.chapter.topic.flashcard.userflashcard.mathequationValue[1], "failure") +
										report.reportFooter());
								}
							});
						});
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Flashcard Review deck: Front text of Flashcard on the deck  :: \n" + frontText + "\n is compared against front text specified while creating flashcard which is \n", productData.chapter.topic.flashcard.userflashcard.mathequationValue[0], "failure") +
							report.reportFooter());
					}
				});
			});

			it(". Navigate to StudyBoard ", function(done) {
				studybit.navigateToStudyBoard(browser, done);
			});

			it(". Delete the created studybits", function(done) {
				clearAllSavedContent.clearStudyboard(browser, done);
			});

			it(". Log out as instructor", function(done) {
				this.timeout(courseHelper.getElevatedTimeout());
				userSignOut.userSignOut(browser, done);
			});
		}
	}
});
