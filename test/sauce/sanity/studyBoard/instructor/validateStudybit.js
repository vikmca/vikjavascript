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
var studybit = require("../../../support/pageobject/" + pageobject + "/" + envName + "/studybitpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var clearAllSavedContent = require("../../../support/pageobject/" + pageobject + "/" + envName + "/clearData");
var report = require("../../../support/reporting/reportgenerator");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var _ = require('underscore');
var courseHelper = require("../../../support/helpers/courseHelper");
var fs = require('fs');
var commonutil = require("../../../util/commonUtility.js");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + ' INSTRUCTOR :: STUDYBIT CREATION AND STUDYBOARD VALIDATION', function() {
	var browser;
	var allPassed = true;
	var userType;
	var courseName;
	var keyTermSBValidationStatusOnSBrd = "failure";
	var product;
	var data;
	var productData;
	var pageLoadingTime;
	var totalTime;
	var statusOfCheckbox;
	var serialNumber = 0;
	var previousRelatedTopicstext;
	var relatedTopicsStatus;

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
		console.log(report.formatTestName("INSTRUCTOT :: 4LTR FEATURES :: STUDYBIT CREATION AND VALIDATION"));
		console.log("======================================");
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***validateStudybit.js***"));
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

	it(". Verify page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
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

	it(". Validate the text on the logo under studyboard if no studybits are present", function(done) {
		studybit.validateTextOnLogo(browser).text().then(function(textOnLogo) {
			if (textOnLogo.indexOf(testData.logoOnSTudyboard.textOnLogo) > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Text on the logo under studyboard if no studybits are present" + textOnLogo, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Text on the logo under studyboard if no studybits are present " + textOnLogo, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Verify page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	//Refer bug id LTR-4338 for more details
	it(". Validate user is not able to attempt practice quiz with StudyBit when filtered StudyBtit count is 0", function(done) {
		studybit.checkOnMyFilteredButtonDisabledIfNoStudybitsPresent(browser).getAttribute('aria-disabled').then(function(radioButtonDisabled) {
			if (radioButtonDisabled === "true") {
				console.log(report.reportHeader() +
					report.stepStatusWithData("On my filtered studybits radio button is in disable state", radioButtonDisabled, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("On my filtered studybits radio button is in disable state", radioButtonDisabled, "failure") +
					report.reportFooter());
				commonutil.takeScreenshot(browser, scriptName);
			}
		});
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

	it(". Validate icon for TOC is displayed", function(done) {
		tocPage.tocImageIcon(browser).then(function(icon) {
			if (icon.indexOf('toc-button-gray') > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("TOC icon is present", icon, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("TOC icon is present", icon, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate icon for readspeaker is displayed", function(done) {
		tocPage.readerSpeakerImageIcon(browser).then(function(icon) {
			if (icon.indexOf('player2') > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Readspeaker icon is present", icon, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Readspeaker icon is present", icon, "failure") +
					report.reportFooter());
			}
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

	it(". Validate that the red notification badge appears on creating new KeyTerm Studybit", function(done) {
		studybit.notificationSymbolOnNewlyCreatedStudyBit(browser).then(function(notificationStatus) {
			console.log("  " + notificationStatus);
			if (notificationStatus == true) {
				console.log(report.reportHeader() +
					report.stepStatusWithData(" the red notification badge appears on creating new KeyTerm Studybit = ", notificationStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData(" [error]the red notification badge appears on creating new KeyTerm Studybit = ", notificationStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Reopen recently created studybit and delete it from narrative view", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		studybit.reopenKeyTermStudyBit(browser, done,
			productData.chapter.topic.studybit.keyterm.id);
	});

	it(". Validate recently deleted studybit should not be present in narrative view", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		studybit.verifydeletedkeytermStudyBit(browser, productData.chapter.topic.studybit.keyterm.id).then(function(status) {
			var keytermStudybitStatus = status;
			if (!keytermStudybitStatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("keyterm studybit status after deleteing the studybit from narrative view", keytermStudybitStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("keyterm studybit status after deleteing the studybit from narrative view", keytermStudybitStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Verify page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});
	// As per matthew I'd recommend closing this as Won't Fix, but would like to review with Carly first.
	it.skip(" LTR-5301 : Validate that if newly created studybit deleted from narrative view then after refresh RED notification badge should not appear", function(done) {
		studybit.notificationSymbolOnNewlyCreatedStudyBit(browser).then(function(notificationStatus) {
			if (notificationStatus == false) {
				console.log(report.reportHeader() +
					report.stepStatusWithData(" if newly created studybit deleted from narrative view then after refresh RED notification badge should not appear = ", notificationStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[error] if newly created studybit deleted from narrative view then after refresh RED notification badge should not appear = ", notificationStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Again Create a KeyTerm StudyBit", function(done) {
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

	it(". Again Validate that the red notification badge appears on creating new KeyTerm Studybit", function(done) {
		studybit.notificationSymbolOnNewlyCreatedStudyBit(browser).then(function(notificationStatus) {
			console.log("  " + notificationStatus);
			if (notificationStatus == true) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("the red notification badge appears on creating new KeyTerm Studybit = ", notificationStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[error]the red notification badge appears on creating new KeyTerm Studybit = ", notificationStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Verify page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
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

	it(". Validate that the red notification badge appears on creating new Text Studybit", function(done) {
		studybit.notificationSymbolOnNewlyCreatedStudyBit(browser).then(function(notificationStatus) {
			console.log("  " + notificationStatus);
			if (notificationStatus == true) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("the red notification badge appears on creating new Text Studybit = ", notificationStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[error] the RED Notification badge NOT appears on creating new Text Studybit = ", notificationStatus, "failure") +
					report.reportFooter());
			}
		});
	});


	it(". Verify page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Validate Save button while editing text studybit", function(done) {
		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) == "mobile" || stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) === "iOS") {
			this.skip();
		} else {
			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
			studybit.validateSaveButtonOneditTextStudyBit(browser, done, productData.chapter.topic.studybit.text.id);
		}
	});

	it(". Verify page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});
	it(". Log out as Student", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userSignOut.userSignOut(browser, done);
	});


	it(". Verify page is loaded successfully", function(done) {
		browser.sleep(2000).refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Login to 4LTR platform", function(done) {
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

	it(". Verify page is loaded successfully", function(done) {
		browser.sleep(2000).refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});


	it(". Validate that if user login again and if there is unseen Studybit then the red notification badge should appear ", function(done) {
		studybit.notificationSymbolOnNewlyCreatedStudyBit(browser).then(function(notificationStatus) {
			if (notificationStatus == true) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("if user login again and if there is unseen Studybit then the red notification badge should appear  = ", notificationStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[error]if user login again and if there is unseen Studybit then the red notification badge should appear  = ", notificationStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Verify page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Navigate To StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Verify page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Validate that the red notification badge  disappears on Navigating to StudyBoard", function(done) {
		studybit.notificationSymbolOnNewlyCreatedStudyBit(browser).then(function(notificationStatus) {
			if (notificationStatus == false) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("The red notification badge  disappears on Navigating to StudyBoard  = ", notificationStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("[error]the red notification badge  disappears on Navigating to StudyBoard  = ", notificationStatus, "failure") +
					report.reportFooter());
			}


		});
	});

	it(". Validate Last created Studybits appears first on StudyBoard ", function(done) {
		studybit.validateOrderOfStudybit(browser).getAttribute('class').then(function(studybit) {
			if (studybit.indexOf(testData.studybitsOrder.studybitsOrderList) > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("last created Studybit appears first on Studyboard", studybit, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("last created studybit appears first on Studyboard", studybit, "failure") +
					report.reportFooter());
				commonutil.takeScreenshot(browser, scriptName);
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

	it(". Change the comprehension level", function(done) {
		studybit.changeComprehensionOfStudybit(browser, testData.studybitTerms.comprehension).then(function() {
			console.log("Comprehension level changed successfully");
			done();
		})
	});

	it(". Save the comprehension level changes", function(done) {
		studybit.clickOnSaveButton(browser).then(function() {
			done();
		});
	});

	it(". Validate the saved changes and close the expanded studybit", function(done) {
		this.retries(3);
		studybit.closeExpandedStudybit(browser).then(function() {
			done();
		});
	});

	it(". Wait for page load", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Validate the changed comprehension label of text Studybit", function(done) {
		studybit.validateEditedTextStudybit(browser, testData.studybitTerms.comprehension).then(function() {
			studybit.closeExpandedStudybit(browser).then(function() {
				done();
			});
		});
	});

	it(". Validate the changed comprehension label of text Studybit", function(done) {
		studybit.validateEditedTextStudybit(browser, testData.studybitTerms.comprehension).then(function() {
			done();
		});
	});

	it(". Close the expanded studybit after save ", function(done) {
		this.retries(3);
		studybit.closeExpandedStudybit(browser).then(function() {
			done();
		});
	});

	it(". Verify the presence of keyterm StudyBit on StudyBoard ", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		studybit.VerifyKeytermStudybit(browser, keyTermSBValidationStatusOnSBrd).then(function() {
			browser
				.refresh().then(function() {
					pageLoadingTime = 0;
					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
				});
		});
	});

	it(". Edit the user tag of key term studybit ", function(done) {
		studybit.editUserTagOfKeytermStudybit(browser, testData.studybitTerms.editedUserTagText).then(function() {
			done();
		});
	});

	it(". Fetch first related topic under more section", function(done) {
		studybit.fetchRelatedTopics(browser).text().then(function(previousRelatedTopicstext1) {
			previousRelatedTopicstext = previousRelatedTopicstext1;
			done();
		});
	});


	it(". Save the edited keyterm studybit ", function(done) {
		studybit.clickOnSaveButton(browser).then(function() {
			done();
		});
	});

	it(". LTR-5130 Validated the related topics should not be dissapears from more section after editing the tags from studyboard", function(done) {
		studybit.verifyRelatedTopicsafterEdit(browser).then(function(status) {
			relatedTopicsStatus = status;
			if (relatedTopicsStatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Related Topics are present after editing the tags", relatedTopicsStatus, "success") +
					report.reportFooter());
				studybit.fetchTopicsOnMore(browser, previousRelatedTopicstext).then(function(textUnderMoreAfterEditStudybitStatus) {
					if (textUnderMoreAfterEditStudybitStatus) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Related topic text " + previousRelatedTopicstext + " is same  as before editing the tags", textUnderMoreAfterEditStudybitStatus, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Related topic text " + previousRelatedTopicstext + " is not same  as before editing the tags", textUnderMoreAfterEditStudybitStatus, "success") +
							report.reportFooter());
					}
				});
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Topics are not present after editing the tags under more section", relatedTopicsStatus, "success") +
					report.reportFooter());
			}
		});
	});


	it(". Close the expanded studybit after save ", function(done) {
		this.retries(3);
		studybit.closeExpandedStudybit(browser).then(function() {
			done();
		});
	});

	it(". Verify Edited user tag of keyterm Studybit", function(done) {
		studybit.verifyEditedUserTagOfKeytermStudybit(browser, testData.studybitTerms.editedUserTagText).then(function() {
			done();
		});
	});



	it(". Close the expanded studybit after save ", function(done) {
		this.retries(3);
		studybit.closeExpandedStudybit(browser).then(function() {
			done();
		});
	});

	it(". Filter StudyBit by user tag and type then verify the result", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		studyBoardPage.clickAndVerifyFilterPanel(browser).then(function() {
			studyBoardPage.enterTagValueOnFilterPanel(browser, testData.studybitTerms.editedUserTagText).then(function() {
				studyBoardPage.clickOnClearFilterThenSelectOne(browser, "by-type", "Key Term").then(function() {
					studybit.verifyFilteredStudybit(browser, "span.keytermdef").then(function(textOfKeyTermStudybit) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Filtered key term studybit is present and their text is", textOfKeyTermStudybit, "success") +
							report.reportFooter());
						done();
					});
				});
			});
		});
	});

	it(". Wait for page load", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Select all filter text studybit and comprehension level and verify the filter result", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		studyBoardPage.clickAndVerifyFilterPanel(browser).then(function() {
			studyBoardPage.clickOnClearFilterThenSelectOne(browser, "by-type", "Text").then(function() {
				studyBoardPage.clickOnClearFilterThenSelectOne(browser, "by-comprehension", "Weak").then(function() {
					studyBoardPage.clickOnFilteredStudyBitAndExpandTag(browser).then(function() {
						studyBoardPage.deleteUserTagFromFilter(browser).then(function() {
							studybit.verifyFilteredStudybit(browser, ".studybit.text p").then(function(textOfKeyTermStudybit) {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Filtered text studybit is present and their text is", textOfKeyTermStudybit, "success") +
									report.reportFooter());
								browser.refresh().then(function() {
									pageLoadingTime = 0;
									takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
								});
							});
						});
					});
				});
			});
		});
	});

	it(". Delete user tag of key term studybit", function(done) {
		studybit.openKeyTermStudybit(browser).then(function() {
			studybit.clickOnTag(browser).then(function() {
				studybit.deleteUserTag(browser).then(function() {
					done();
				});
			});
		});
	});

	it(". Save the studybit after deleting the user tag", function(done) {
		studybit.clickOnSaveButton(browser).then(function() {
			done();
		});
	});

	it(". Close the expanded studybit after deleting it", function(done) {
		this.retries(3);
		studybit.closeExpandedStudybit(browser).then(function() {
			done();
		});
	});

	it(". Refresh the page and wait for the page load", function(done) {
		studybit.refreshFunction(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Reopen the key term studybit and verify user tag is deleted", function(done) {
		studybit.openKeyTermStudybit(browser).then(function() {
			studybit.clickOnTag(browser).then(function() {
				studybit.verifyTagDeleted(browser).then(function() {
					done();
				});
			});
		});
	});


	it(". Validate the icon present for notes on expanded studybit view", function(done) {
		studybit.getIconsOnExpandedStudybit(browser, "notes").then(function(notesIcon) {
			if (notesIcon.indexOf("notes-gray") > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Icon for notes is present on expanded studybit", notesIcon, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Icon for notes is present on expanded studybit", notesIcon, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate the icon present for tags on expanded studybit view", function(done) {
		studybit.getIconsOnExpandedStudybit(browser, "tags").then(function(tagsIcon) {
			if (tagsIcon.indexOf("tags-gray") > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Icon for tags is present on expanded studybit", tagsIcon, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Icon for tags is present on expanded studybit", tagsIcon, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate the icon present for more on expanded studybit view", function(done) {
		studybit.getIconsOnExpandedStudybit(browser, "more").then(function(moreIcon) {
			if (moreIcon.indexOf("more-gray") > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Icon for more is present on expanded studybit", moreIcon, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Icon for more is present on expanded studybit", moreIcon, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate the icon present for comprehension on expanded studybit view", function(done) {
		studybit.getComprehensionicon(browser).then(function(comprehensionIcon) {
			if (comprehensionIcon.indexOf("comprehension-gray") > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Icon for comprehension is present on expanded studybit", comprehensionIcon, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Icon for comprehension is present on expanded studybit", comprehensionIcon, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Close the expanded studybit after deleting it", function(done) {
		this.retries(3);
		studybit.closeExpandedStudybit(browser).then(function() {
			done();
		});
	});

	it(". Open filter panel and click on clear all for chapter", function(done) {
		studyBoardPage.clickAndVerifyFilterPanel(browser).then(function() {
			studyBoardPage.clearAllChapterFilters(browser, done);
		});
	});

	it(". Validate when user clicks on 'Clear all' button then all chapters should be unchecked", function(done) {
		browser
			.waitForElementsByXPath("//div[contains(@class,'filter by-chapter')]//ul//li//div", asserters.isDisplayed, 60000).then(function(countOfChapters) {
				var count = 1;
				function verifyAllChaptersUnchecked() {
					if (count <= _.size(countOfChapters)) {
						browser
							.waitForElementByXPath("//div[contains(@class,'filter by-chapter')]//ul//li[" + count + "]//div", asserters.isDisplayed, 60000).getAttribute('aria-checked')
							.then(function(statusOfCheckbox) {
								if (statusOfCheckbox == "false") {
									count++;
									verifyAllChaptersUnchecked();
								} else {
									console.log(report.reportHeader() +
										report.stepStatusWithData("checkox is unchecked for chapter ::", count, "failure") +
										report.reportFooter());
									commonutil.takeScreenshot(browser, scriptName);
								}
							});
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("All chapters are unchecked on clicking clear all button and the total chapters are", count, "Success") +
							report.reportFooter());
						done();
					}
				}
				verifyAllChaptersUnchecked();
			});
	});

	it(". Verify page is loaded successfully", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Delete the created studybits", function(done) {
		clearAllSavedContent.clearStudyboard(browser, done);
	});

	it(". Verify page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Log out as instructor", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userSignOut.userSignOut(browser, done);
	});
});
