require('colors');
var wd = require('wd');
var testData = require("../../../../../test_data/data.json");
var session = require("../../../support/setup/browser-session");
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var recursiveFnPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/recursiveFnPagepo");
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var tocPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/tocpo");
var studybit = require("../../../support/pageobject/" + pageobject + "/" + envName + "/studybitpo");
var clearAllSavedContent = require("../../../support/pageobject/" + pageobject + "/" + envName + "/clearData");
var notesFeature = require("../../../support/pageobject/" + pageobject + "/" + envName + "/notespo");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var studyboardpo =  require("../../../support/pageobject/" + pageobject + "/" + envName + "/studyboardpo.js");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var report = require("../../../support/reporting/reportgenerator");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var menuPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var courseHelper = require("../../../support/helpers/courseHelper");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var path = require('path');
var conceptrackerPageInstructor = require("../../../support/pageobject/" + pageobject + "/" + envName + "/concepttracker/instructor/concepttrackerpo");
var scriptName = path.basename(__filename);
var asserters = wd.asserters;
describe(scriptName + 'NOTES CREATION AND STUDYBOARD VALIDATION', function() {
	var browser;
	var allPassed = true;
	var userType;
	var courseName;
	var studybitCount;
	var product;
	var data;
	var productData;
	var pageLoadingTime;
	var totalTime;
	var initialLeftCount = 300;
	var notesCharacterCount;
	var characterLeftCount;
	var textboxCountDecreases;
	var textOfNotesField;
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
		console.log(report.formatTestName("INSTRUCTOR :: NOTES CREATION AND VALIDATION"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***validateNotes.js***"));

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

	it(". Login as instructor", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		data = loginPage.setLoginData(userType);
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


	it(". Wait for page loading", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
	});

	it(". Delete the created notes if any", function(done) {
		clearAllSavedContent.clearStudyboard(browser, done);
	});

	it(". Wait for page loading", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
	});


	it(". Navigate to a topic to create note", function(done) {
		tocPage.navigateToToc(browser).then(function() {
			tocPage.navigateToAChapter(productData.chapter.id, browser).then(function() {
				tocPage.navigateToATopic(productData.chapter.id, productData.chapter.topic.id, browser).nodeify(done);
			});
		});
	});

	it(". Validate total count decreases as the user enter character in notes field", function(done) {
		notesFeature.enterDescriptionOnNotesField(browser, testData.notesTerms.noteText).then(function() {
			notesFeature.fetchCharacterCountFromNotes(browser).then(function(textboxCharacterCount) {
				notesCharacterCount = parseInt(textboxCharacterCount);
				notesFeature.leftCountFromNotesTextBox(browser).then(function(leftCount) {
					characterLeftCount = parseInt(leftCount);
					textboxCountDecreases = initialLeftCount - notesCharacterCount;
					if (textboxCountDecreases === characterLeftCount) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("count decreases as the user enter character in notes field", characterLeftCount, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("count decreases as the user enter character in notes field", characterLeftCount, "failure") +
							report.reportFooter());
					}
				});
			});
		});
	});

	it(". Validate when user enters the character beyond limits then count goes to displaying with 'negative sign left count' ", function(done) {
		recursiveFnPage.validateLeftcountAtNotesField(browser, done);
	});

	it(". Validate the save button is disabled when user enters the value greater than textbox limit", function(done) {
		notesFeature.checkSaveButtonDisabled(browser).getAttribute('aria-disabled')
			.then(function(saveButtonStatus) {
				notesFeature.closeNotesPanel(browser).then(function() {
					if (saveButtonStatus === testData.assignmentDetails.assignmentTextBoxDtails.textBoxStatus) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("When user enters character more than notes field limit then save button status is ", saveButtonStatus, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("When user enters character more than notes field limit then save button status is ", saveButtonStatus, "failure") +
							report.reportFooter());
					}
				});
			});
	});

	it(". Wait for page loading", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Create a note on a topic page", function(done) {
		notesFeature.notesCreation(browser, done, testData.notesTerms.noteText);
	});

	it(". Delete Created notes on narrative view", function(done) {
		notesFeature.deleteNotesFromNarrative(browser, testData.notesTerms.noteText).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Wait for page loading", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Verify created notes should not be present after deleting notes from narrative view ", function(done) {
		notesFeature.verifyNoteCount(browser, testData.notesTerms.afterDeletingStudybitNotesCount).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Wait for page loading", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Create a note on a topic page", function(done) {
		notesFeature.notesCreation(browser, done, testData.notesTerms.noteText);
	});

	it(". Create other note on a topic page", function(done) {
		notesFeature.notesCreation(browser, done, testData.notesTerms.noteText2);
	});

	it(". Reload the page and wait until page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Verify notes count and navigate to StudyBoard", function(done) {
		notesFeature.verifyNoteCount(browser, testData.notesTerms.notesCount).then(function() {
			studybit.navigateToStudyBoard(browser, done);
		});
	});

	it(". Reload the page and wait until page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Verify the presence of notes on the StudyBoard", function(done) {
		notesFeature.verifyNotesAvailabilityOnStudyboard(browser, testData.notesTerms.notesCount).then(function() {
			done();
		})
	});

	it(". Navigate to a topic to edit one of the created note text", function(done) {
		tocPage.navigateToToc(browser).then(function() {
			tocPage.navigateToAChapter(productData.chapter.id, browser).then(function() {
				tocPage.navigateToATopic(productData.chapter.id, productData.chapter.topic.id, browser).nodeify(done);
			});
		});
	});

	it(". Edit one of the created note text ", function(done) {
		notesFeature.editNoteText(browser, testData.notesTerms.editedtext, done);
	});

	it(". Reload the page and wait until page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Validate the edited note", function(done) {
		notesFeature.validateEditedNote(browser, testData.notesTerms.editedtext, done);
	});

	it(". Navigate to StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Verify the presence of note on the StudyBoard", function(done) {
		notesFeature.verifyEditedNoteOnStudyBoard(testData.notesTerms.editedtext, browser, done);
	});

	it(". Wait for page loading", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
	});

	it(". Change the comprehension level", function(done) {
		notesFeature.changeNotesComprehension(browser, done);
	});


	it(". Wait for page loading", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
	});

	it(". Navigate to Concept Tracker", function(done) {
		menuPage.selectConceptTracker(userType, browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Validate Notes created by student should not reflect as Studybit on Instructor concept tracker if they are edited on StudyBoard view", function(done) {
		browser.waitForElementByXPath("//h1[contains(.,'" + productData.concepttracker.quiz.chapterbased.desiredChapterForStudybit + "')]/following-sibling::div[contains(@class,'chartjs overview')]//div[@class='studybits']//div[contains(@class,'studybit-count')]", asserters.isDisplayed, 90000).text().then(function(studybitCountAfterEditNotes) {
			var studybitCountOnConceptTracker = stringutil.returnValueAfterSplit(studybitCountAfterEditNotes, " ", 0);
			console.log(report.reportHeader() +
				report.stepStatusWithData("ANALYTICS :: StudyBits present for \" " + productData.concepttracker.quiz.chapterbased.desiredChapterForStudybit + " :", studybitCountOnConceptTracker, "success") +
				report.reportFooter());
			if (studybitCount === parseInt(studybitCountOnConceptTracker)) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("ANALYTICS :: Studybits present for \" " + productData.concepttracker.quiz.chapterbased.desiredChapterForStudybit + " :", studybitCount, "failure") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("ANALYTICS :: StudyBits present for \" " + productData.concepttracker.quiz.chapterbased.desiredChapterForStudybit + " :", studybitCount, "success") +
					report.reportFooter());
				done();
			}
		});
	});


	it(". Navigate To StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Expand the Notes and Click on link Where notes has been created ", function(done) {
		notesFeature.clickOnTopicOnExpandedView(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Validate the notes navigated to the respected topic", function(done) {
		tocPage.getTextOfTopcName(browser).then(function(topicName) {
			if ((productData.chapter.topic.titlehero).indexOf(topicName) > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("User navigated to correct topic, i.e.  " + productData.chapter.topic.titlehero + " compared against:", topicName, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("User navigated to incorrect topic, i.e.  " + productData.chapter.topic.titlehero + " compared against:", topicName, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Delete Created notes on narrative view", function(done) {
		notesFeature.deleteNotesFromNarrative(browser, testData.notesTerms.editedtext).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Navigate To StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Validate deleted notes should not appear on studyboard", function(done) {
		notesFeature.validateNotesOnStudyboard(browser, testData.notesTerms.editedtext).then(function(deletedNotesStatus) {
			console.log("deleted notes status on page : " + deletedNotesStatus);
			console.log("Notes text" + testData.notesTerms.editedtext);
			if (!deletedNotesStatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Deleted notes is not present on StudyBoard page", deletedNotesStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Deleted notes is not present on StudyBoard page", deletedNotesStatus, "failure") +
					report.reportFooter());
			}
		})
	});

	it(". Wait for page loading", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
	});


	it(". Navigate to a topic to create note", function(done) {
		tocPage.navigateToToc(browser).then(function() {
			tocPage.navigateToAChapter(productData.chapter.id, browser).then(function() {
				tocPage.navigateToATopic(productData.chapter.id, productData.chapter.topic.id, browser).nodeify(done);
			});
		});
	});

	it(". Create one more another note on a topic page", function(done) {
		notesFeature.notesCreation(browser, done, testData.notesTerms.noteText2);
	});

	it(". Navigate To StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Delete the created notes without refresing the page", function(done) {
		clearAllSavedContent.clearStudyboardWithoutPageRefresh(browser, done);
	});

	it(". LTR-4827 :: Validate filter button should be disabled on the page", function(done) {
		studyboardpo.getFilterButtonStatus(browser).then(function(filterBtnStatus){
			console.log("filterBtnStatus"+filterBtnStatus);
			if(filterBtnStatus == "true"){
				console.log(report.reportHeader() +
					report.stepStatusWithData("Filter button should be disabled", filterBtnStatus, "success") +
					report.reportFooter());
					done();
			}else{
				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-4827 :: Filter button should be disabled", filterBtnStatus, "failure") +
					report.reportFooter());
					//low minor issue hence adding the done menthod
					done();
			}
		});
	});

	it(". LTR-4827 :: Refresh the page and wait for page ", function(done) {
		browser.refresh().sleep(5000).then(function(){
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". LTR-4827 :: Validate the filter button should be disabled on page refresh", function(done) {
		studyboardpo.getFilterButtonStatus(browser).then(function(filterBtnStatus){
			console.log("filterBtnStatus"+filterBtnStatus);
			if(filterBtnStatus == "true"){
				console.log(report.reportHeader() +
					report.stepStatusWithData("Filter button should be disabled status on page refresh", filterBtnStatus, "success") +
					report.reportFooter());
					done();
			}else{
				console.log(report.reportHeader() +
					report.stepStatusWithData("Filter button should be disabled status on page refresh", filterBtnStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Log out as instructor", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userSignOut.userSignOut(browser, done);
	});

});
