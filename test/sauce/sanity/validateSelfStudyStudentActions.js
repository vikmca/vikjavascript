require('colors');
var wd = require('wd');
var _ = require('underscore');
var asserters = wd.asserters;
var testData = require("../../../test_data/data.json");
var session = require("../support/setup/browser-session");
var dataUtil = require("../util/date-utility");
var stringutil = require("../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var studyBoardPage = require("../support/pageobject/" + pageobject + "/" + envName + "/studyboardpo");
var tocPage = require("../support/pageobject/" + pageobject + "/" + envName + "/tocpo");
var menuPage = require("../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var flashcard = require("../support/pageobject/" + pageobject + "/" + envName + "/flashcardspo.js");
var studybit = require("../support/pageobject/" + pageobject + "/" + envName + "/studybitpo");
var searchFeaturePage = require("..//support/pageobject/" + pageobject + "/" + envName + "/searchFeaturepo");
var practiceQuizCreation = require("../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var clearAllSavedContent = require("../support/pageobject/" + pageobject + "/" + envName + "/clearData");
var takeQuizpo = require("../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var mathutil = require("../util/mathUtil");
var report = require("../support/reporting/reportgenerator");
var userSignOut = require("../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var brainPage = require("../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var studentAssessmentsPage = require("../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var studentAssignmentPage = require("../support/pagefactory/studentAssignment.json");
var practiceQuizPage = require("../support/pagefactory/practicequiz.json");
var basicpo = require("../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var courseHelper = require("../support/helpers/courseHelper");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'SELF STUDY STUDENT VALIDATIONS FOR STUDYBIT FLASHCARD CREATION STUDYBOARD VALIDATION SEARCH PRACTICE QUIZ AND CUSTOM TAG ON NARRATIVE', function() {
	var browser;
	var allPassed = true;

	var userType;
	var courseName;
	var product;
	var data;
	var productData;
	var keyTermSBValidationStatusOnSBrd = "failure";
	var cas_activity_series;
	var trueFalseQuestionRadio;
	var cas_choice_radio_for_true_false;
	var multipleChoiceQuestionRadio;
	var cas_choice_radio_for_multiple_type_question;
	var continueButton;
	var disabled_continue_button;
	var dropDownBox;
	var select_option_from_dropdown;
	var exit_button;
	var trueFalseRadioChoice;
	var multipleChoiceRadioOption;
	var optionOfSelectType;
	var pastQuizButtonOnResultPage;
	var retakeButtonOnResultPage;
	var progressButtonOnResultPage;
	var incorrectQuestionOnResultPage;
	var cas_questions_text;
	var cas_multiple_choice_text;
	var cas_fill_in_question_text;
	var totalTime;
	var serialNumber = 0;
	var correctAnswerforQuiz;
  var totalQuestionsForQuiz;



	before(function(done) {

		browser = session.create(done);

		userType = "selfstudy";

		product = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString());
		if (product === "default") {
			product = testData.existingCourseDetails.product;
		}


		courseName = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_COURSE.toString());
		if (courseName === "default") {

			courseName = testData.existingCourseDetails.selfstudycoursename;
		}

		data = loginPage.setLoginData(userType);
		productData = loginPage.getProductData();
		totalTime = 0;
		//Reports
		console.log(report.formatTestName("4LTR FEATURES :: SELF STUDY STUDENT VALIDATION"));
		console.log(report.formatTestScriptFileName("***validateSelfStudyStudentActions.js***"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.printTestData("CHAPTER " + productData.chapter.id + " ", productData.chapter.title));
		console.log(report.printTestData("TOPIC " + productData.chapter.topic.id + " ", productData.chapter.topic.title));
		console.log(report.printTestData("STUDYBITID", productData.chapter.topic.studybit.text.id));
		console.log(report.printTestData("STUDYBIT CONCEPT", productData.chapter.topic.studybit.text.concepts[0]));

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


	it(". Login to 4LTR platform for selfstudy", function(done) {
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

	it(". Verify the assignment tag is disabled", function(done) {
		studentAssessmentsPage.verifyAssignmentTabDisabled(browser).then(function(element) {
			element.getAttribute('class').then(function(attributevalue) {
				if (attributevalue.indexOf("disabled") > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Assignment tab in top navigation bar is disabled", "", "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Assignment tab in top navigation bar is not disabled", "", "failure") +
						report.reportFooter());
					done();
				}
			});
		});
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
		tocPage.navigateToATopic(productData.chapter.id, productData.chapter.topic.id, browser)
			.then(function() {
				tocPage.disposeFirstVisitTopicModalIfVisible(browser).then(function() {
					tocPage.getTopicTitleHero(browser).then(function(text) {
						text.should.contain(productData.chapter.topic.titlehero);
					}).nodeify(done);
				});
			});
	});

	it(". Create a Text StudyBit", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		studybit.createTextStudyBit(browser, done, productData.chapter.topic.studybit.text.id,
			productData.chapter.topic.studybit.text.concepts[0],
			productData.chapter.topic.studybit.text.usertag,
			productData.chapter.topic.studybit.text.notes,
			productData.chapter.topic.studybit.text.comprehension,
			productData.chapter.topic.studybit.text.windowScrollY);
	});

	it(". Navigate To StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Verify the presence of text StudyBit on StudyBoard ", function(done) {
		studybit.validateTextStudyBitOnStudyBoard(browser, done,
			productData.chapter.topic.studybit.text.chaptername,
			productData.chapter.topic.studybit.text.notes,
			productData.chapter.topic.studybit.text.concepts[0],
			productData.chapter.topic.studybit.text.usertag);
	});

	it(". Navigate Flashcard Tab", function(done) {
		flashcard.SelectFlashcardTab(browser, done);

	});


	it(". Refresh the page and wait until page is loaded successfully", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Verify Default selected Tab is KeyTerm FlashCard", function(done) {
		flashcard.Verifykeytermflashcardselected(browser, done);
	});


	it(". Revert all Flashcards if already not reverted", function(done) {
		clearAllSavedContent.revertAllKeyTermFlashcard(browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Verify Key Term Flashcard is present for every Chapter", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		var totalFlashcards = 0;
		var currentChapterNumber = 1;

		browser
			.waitForElementByCss(".icon-studyboard-blue", asserters.isDisplayed, 10000).then(function() {
				function countskeytermflashcard() {
					if (currentChapterNumber <= productData.chapter.topic.flashcards.publisher.chapters[0].totalchaptercount) {
						browser
							.waitForElementsByXPath("(//div[@class='chapter ng-scope'])[" + currentChapterNumber + "]//li[@class='tile ng-scope']").then(function(countofFlashcards) {
								browser
									.waitForElementByXPath("(//div[@class='chapter ng-scope'])[" + currentChapterNumber + "]").then(function(chapterLocation) {
										browser.getLocationInView(chapterLocation);
										console.log("No of Flashcard in " + currentChapterNumber + ":" + _.size(countofFlashcards));
										var countofFlashcard = _.size(countofFlashcards);
										if (countofFlashcard) {
											currentChapterNumber++;
											console.log(report.reportHeader() +
												report.stepStatusWithData("Number of KeyTerm Flash Cards in Chapter ", currentChapterNumber + ": " + countofFlashcard, "success") +
												report.reportFooter());
											totalFlashcards = totalFlashcards + countofFlashcard;
											countskeytermflashcard();
										} else {
											currentChapterNumber++;
											console.log(report.reportHeader() +
												report.stepStatusWithData("Number of KeyTerm Flash Cards in Chapter ", currentChapterNumber + ": " + countofFlashcard, "failure") +
												report.reportFooter());
											totalFlashcards = totalFlashcards + countofFlashcard;
											countskeytermflashcard();
										}
									});
							});
					} else {
						console.log(report.reportHeader() +
							report.stepStatus("Total number of keyterm Flashcards present :" + totalFlashcards, "success") +
							report.reportFooter());
						done();
					}

				}

				countskeytermflashcard();
			});
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

	it(". Navigate to Studybit tab from Flashcard tab ", function(done) {
		studybit.navigateToStudyBitTab(browser, done);
	});

	it(". Delete the created studybits", function(done) {
		clearAllSavedContent.clearStudyboard(browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Enter a search keyword and verify the results", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("searchFeature"));
		searchFeaturePage.openSearchControl(browser).then(function() {
			searchFeaturePage.enterTheSearchTerm(browser, productData.search_keyword).then(function() {
				searchFeaturePage.getResultsCount(browser)
					.text().should.eventually.include(productData.search_result_count)
					.then(function() {
						console.log(report.reportHeader() +
							report.stepStatusWithData("SEARCH :: Keyword \"" + productData.search_keyword + "\" fetched a total of   ", productData.search_result_count + " matches") +
							report.reportFooter());
						counter = 0;
						(function scrollTillFooterVisible() {
							searchFeaturePage.scrollToSearchResultsBottom(browser);
							if (counter < 10) {
								setTimeout(scrollTillFooterVisible, 3000);
								counter++;
							} else {
								searchFeaturePage.selectAResult(browser, productData.search_result_count).then(function(result) {

									if (result != undefined) {
										console.log(report.reportHeader() +
											report.stepStatusWithData("SEARCH :: Keyword \"" + productData.search_keyword + "\" has the ", productData.search_result_count + "th result with title  ", result) +
											report.reportFooter());
										done();
									} else {
										console.log(report.reportHeader() +
											report.stepStatus("SEARCH :: Not able to retrieve the " + productData.search_result_count + "th result for Keyword", "\"" + productData.search_keyword + "\"", "failure") +
											report.reportFooter());
										// done();
									}
								});
							}
						})();

					});
			});
		});
	});

	it(". Navigate To StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Launch a Practice quiz", function(done) {
		practiceQuizCreation.navigateToPracticeQuizFromStudyBits(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". LTR-5399 :: Verify error message should not be displayed on assessment launch and also validate Continue button should be appear on launched assessment page", function(done) {
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


	// it(". Take a Practice quiz from Chapter and exit", function(done) {
	// 	this.timeout(courseHelper.getElevatedTimeout("quiz"));
	// 	cas_questions_text = studentAssignmentPage.studentAssignmentSubmissionPage.cas_questions_text;
	// 	cas_multiple_choice_text = studentAssignmentPage.studentAssignmentSubmissionPage.cas_multiple_choice_text;
	// 	cas_fill_in_question_text = studentAssignmentPage.studentAssignmentSubmissionPage.cas_fill_in_question_text;
	// 	cas_activity_series = studentAssignmentPage.studentAssignmentSubmissionPage.cas_activity_series;
	// 	trueFalseQuestionRadio = studentAssignmentPage.studentAssignmentSubmissionPage.trueFalseQuestionRadio;
	// 	cas_choice_radio_for_true_false = studentAssignmentPage.studentAssignmentSubmissionPage.cas_choice_radio_for_true_false;
	// 	multipleChoiceQuestionRadio = studentAssignmentPage.studentAssignmentSubmissionPage.multipleChoiceQuestionRadio;
	// 	cas_choice_radio_for_multiple_type_question = studentAssignmentPage.studentAssignmentSubmissionPage.cas_choice_radio_for_multiple_type_question;
	// 	continueButton = studentAssignmentPage.studentAssignmentSubmissionPage.continueButton;
	// 	disabled_continue_button = studentAssignmentPage.studentAssignmentSubmissionPage.disabled_continue_button;
	// 	dropDownBox = studentAssignmentPage.studentAssignmentSubmissionPage.dropDownBox;
	// 	select_option_from_dropdown = studentAssignmentPage.studentAssignmentSubmissionPage.select_option_from_dropdown;
	// 	exit_button = studentAssignmentPage.studentAssignmentSubmissionPage.exit_button;
	// 	optionOfSelectType = stringutil.returnreplacedstring(select_option_from_dropdown, "{{}}", +mathutil.getRandomInt(1, 4));
	// 	trueFalseRadioChoice = stringutil.returnreplacedstring(cas_choice_radio_for_true_false, "{{}}", mathutil.getRandomInt(1, 3));
	// 	multipleChoiceRadioOption = stringutil.returnreplacedstring(cas_choice_radio_for_multiple_type_question, "{{}}", mathutil.getRandomInt(1, 3));
	//
	// 	pastQuizButtonOnResultPage = practiceQuizPage.praticeQuiz.pastQuizButtonOnResultPage;
	// 	retakeButtonOnResultPage = practiceQuizPage.praticeQuiz.retakeButtonOnResultPage;
	// 	progressButtonOnResultPage = practiceQuizPage.praticeQuiz.progressButtonOnResultPage;
	// 	incorrectQuestionOnResultPage = practiceQuizPage.praticeQuiz.incorrectQuestionOnResultPage;
	//
	// 	browser
	// 		// .sleep(10000)
	// 		.waitForElementsByCss(cas_activity_series, asserters.isDisplayed, 60000).then(function(progresslist) {
	// 			countOfQuestions = _.size(progresslist);
	// 			console.log("Count of incomplete Questions : " + countOfQuestions);
	// 			completedQuestions = 0;
	//
	// 			function selectAnAnswerAndProceed() {
	//
	// 				if (countOfQuestions > 0) {
	// 					countOfQuestions--;
	// 					completedQuestions++;
	//
	// 					browser
	// 						.sleep(1000)
	// 						.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
	// 						.hasElementByCss(trueFalseQuestionRadio).then(function(flag) {
	// 							if (!flag) {
	// 								browser.sleep(1000).waitForElementByCss(multipleChoiceQuestionRadio, asserters.isDisplayed, 5000).getTagName().then(function(tag) {
	// 									if (tag === "div") {
	// 										browser
	// 											.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
	// 											.waitForElementByXPath(multipleChoiceRadioOption, asserters.isDisplayed, 3000).click()
	// 											.elementByCssSelectorWhenReady(continueButton, 3000).click();
	// 										console.log("Answered a Question with Radio Button " + completedQuestions + " and remaining Questions " + countOfQuestions);
	//
	//
	// 									} else {
	// 										browser
	// 											.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
	// 											.waitForElementByCss(dropDownBox, asserters.isDisplayed, 7000)
	// 											.click()
	// 											.waitForElementByCss(optionOfSelectType, asserters.isDisplayed, 10000)
	// 											.click()
	// 											.sleep(1000)
	// 											.elementByCssSelectorWhenReady(continueButton, 3000).click();
	// 										console.log("Answered a Question with a Drop down " + completedQuestions + " and remaining Questions " + countOfQuestions);
	//
	// 									}
	//
	//
	// 									setTimeout(selectAnAnswerAndProceed, 7000);
	// 								});
	// 							} else {
	// 								browser.waitForElementByCss(trueFalseQuestionRadio, asserters.isDisplayed, 5000).getTagName().then(function(tag) {
	// 									if (tag === "div") {
	// 										browser
	// 											.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
	// 											.waitForElementByXPath(trueFalseRadioChoice, asserters.isDisplayed, 3000).click()
	// 											.elementByCssSelectorWhenReady(continueButton, 5000).click();
	// 										console.log("Answered a True or False Question " + completedQuestions + " and remaining Questions " + countOfQuestions);
	//
	//
	// 									} else {
	//
	// 										console.log("Problem in answering T/F");
	//
	// 									}
	//
	//
	// 									setTimeout(selectAnAnswerAndProceed, 5000);
	// 								});
	// 							}
	// 						});
	//
	// 				} else {
	//
	// 					if (completedQuestions == _.size(progresslist)) {
	// 						console.log("All Questions successfully attempted");
	//
	// 						browser.waitForElementByCss(pastQuizButtonOnResultPage, asserters.isDisplayed, 5000)
	// 							.waitForElementByCss(retakeButtonOnResultPage, asserters.isDisplayed, 1000)
	// 							.waitForElementByCss(progressButtonOnResultPage, asserters.isDisplayed, 1000)
	// 							.waitForElementByXPath(incorrectQuestionOnResultPage, asserters.isDisplayed, 1000)
	// 							.waitForElementByCss(exit_button, asserters.isDisplayed, 3000)
	// 							.nodeify(done);
	//
	// 					} else {
	// 						console.log("failure");
	// 						practiceQuizValidationStatus = "failure";
	// 						done();
	// 					}
	//
	// 				}
	//
	// 			}
	//
	// 			//Function to answer all the Questions
	// 			selectAnAnswerAndProceed();
	//
	// 		});
	// });

	it(". Take a Practice quiz from studybits ", function(done) {
		//Call this function if you want a specific block to timeout after a specific time interval
		this.timeout(courseHelper.getElevatedTimeout("quiz"));
		takeQuizpo.takeQuiz(browser, done);
	});

	it(". Store the correct and Total Questions answers after Instructor's attempt on practice quiz from StudyBit", function(done) {
		practiceQuizCreation.verifyPracticeQuizResultPage(browser).then(function() {
			practiceQuizCreation.getQuestionsCorrect(browser).then(function(correct) {
				correctAnswerforQuiz = correct;
				console.log(report.reportHeader() +
					report.printTestData("CAS ::  CORRECT ANSWER FROM QUIZZING VIA STUDYBITS ", correctAnswerforQuiz) +
					report.reportFooter());
				practiceQuizCreation.getTotalQuestions(browser).then(function(totalQ) {
					totalQuestionsForQuiz = totalQ;
					console.log(report.reportHeader() +
						report.printTestData("CAS ::  TOTAL QUESTIONS ATTEMPTED ON QUIZZING VIA STUDYBITS ", totalQuestionsForQuiz) +
						report.reportFooter());
					done();
				});
			});
		});
	});

	it(". Validate the result page: presence of buttons", function(done) {
		practiceQuizCreation.validateViewPastQuizButton(browser).then(function(viewPastQuizButtonName) {
			practiceQuizCreation.validateRetakeButton(browser).then(function(retakeQuizButtonName) {
				practiceQuizCreation.validateExitButton(browser).then(function(exitButtonName) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("All these buttons are present on practice quiz result view ", viewPastQuizButtonName + "," + retakeQuizButtonName + "," + exitButtonName, "success") +
						report.reportFooter());
					done();
				});
			});
		});
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

	it(". Click on List view", function(done) {
		tocPage.selectListView(browser).then(function() {
			done();
		});
	});

	it(". Navigate to a Chapter", function(done) {
		tocPage.getChapterTitleonListView(productData.chapter.id, browser, productData.chapter.topic.studybit.contiguousStudybit.chapter)
			.then(function(text) {
				tocPage.navigateToAChapterByListView(productData.chapter.id, browser, productData.chapter.topic.studybit.contiguousStudybit.chapter);
				done();
			});
	});

	it(". Navigate to a topic", function(done) {
		tocPage.navigateToATopicByListView(browser, done, productData.chapter.topic.id, productData.chapter.topic.studybit.contiguousStudybit.topic);
	});

	it(". Select A head text for studybit and validate the increased tag count", function(done) {
		studybit.selectTextFromAHead(browser, productData.chapter.topic.studybit.contiguousStudybit.studybitId,
			productData.chapter.topic.studybit.contiguousStudybit.windowScrollY).then(function() {
			studybit.fetchTheNumberOfPublisherTag(browser).then(function(elements) {
				publisherTagCountForAHead = _.size(elements);
				if (publisherTagCountForAHead > 0) {
					console.log(report.reportHeader() +
						report.stepStatus("Publisher tag count for A head", _.size(elements), "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatus("Publisher tag count for A head", _.size(elements), "failure") +
						report.reportFooter());
					//  done();
				}
			});
		});
	});

	it(". Select B head text for studybit and validate the increased tag count", function(done) {
		studybit.selectTextFromAHead(browser, productData.chapter.topic.studybit.contiguousStudybit.studybitIdForBHead,
				productData.chapter.topic.studybit.contiguousStudybit.windowScrollYForBHead)
			.then(function() {
				studybit.fetchTheNumberOfPublisherTag(browser).then(function(element) {
					publisherTagCountForBHead = _.size(element);
					if (publisherTagCountForBHead >= publisherTagCountForAHead) {
						console.log(report.reportHeader() +
							report.stepStatus("Publisher tag count for B head", _.size(element), "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatus("Publisher tag count for B head", _.size(element), "failure") +
							report.reportFooter());
						//  done();
					}
				});
			});
	});

	it(". Select C head text for studybit and validate the increased tag count", function(done) {
		studybit.selectTextFromAHead(browser, productData.chapter.topic.studybit.contiguousStudybit.studybitIdForCHead,
			productData.chapter.topic.studybit.contiguousStudybit.windowScrollYForCHead).then(function() {
			studybit.fetchTheNumberOfPublisherTag(browser).then(function(element) {
				publisherTagCountForCHead = _.size(element);
				if (publisherTagCountForCHead >= publisherTagCountForBHead) {
					console.log(report.reportHeader() +
						report.stepStatus("Publisher tag count for C head", _.size(element), "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatus("Publisher tag count for C head", _.size(element), "failure") +
						report.reportFooter());
					//  done();
				}
			});
		});
	});
	it(". Log out as Student", function(done) {
		userSignOut.userSignOut(browser, done);
	});

});
