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
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var tocPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/tocpo");
var studybit = require("../../../support/pageobject/" + pageobject + "/" + envName + "/studybitpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var footnotepo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/footnotepo");
var clearAllSavedContent = require("../../../support/pageobject/" + pageobject + "/" + envName + "/clearData");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var _ = require('underscore');
var courseHelper = require("../../../support/helpers/courseHelper");
var report = require("../../../support/reporting/reportgenerator");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + ' TABLE/IMAGE STUDYBIT, INTERNAL EXHIBIT LINKS, CHAPTER LINKS VALIDATION', function() {
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
		console.log(report.formatTestScriptFileName("***exhibitAndImageStudybitAndInlineChapterLinkValidation.js***"));
		console.log(report.formatTestName("INSTRUCTOR TABLE/IMAGE STUDYBIT, INTERNAL EXHIBIT LINKS, CHAPTER LINKS VALIDATION"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.printTestData("CHAPTER " + productData.chapter.topic.studybit.exhibit.chapter + " ", productData.chapter.topic.studybit.exhibit.chaptertitle));
		console.log(report.printTestData("TOPIC " + productData.chapter.topic.studybit.exhibit.topic + " ", productData.chapter.topic.studybit.exhibit.topicname));
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

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Delete the created studybits if any", function(done) {
		clearAllSavedContent.clearStudyboard(browser, done);
	});

	it(". Navigate to TOC ", function(done) {
		tocPage.navigateToToc(browser).nodeify(done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Click on List view and Verify", function(done) {
		tocPage.selectListView(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Navigate to a Chapter", function(done) {
		tocPage.getChapterTitleonListView(productData.chapter.id, browser, productData.chapter.topic.studybit.exhibit.chapter)
			.then(function(text) {
				console.log(text);
				tocPage.navigateToAChapterByListView(productData.chapter.id, browser, productData.chapter.topic.studybit.exhibit.chapter);
				done();
			});
	});

	it(". Navigate to a topic", function(done) {
		tocPage.navigateToATopicByListView(browser, done, productData.chapter.topic.id, productData.chapter.topic.studybit.exhibit.topic);
	});

	it(". Wait for page load", function(done) {
		this.retries(3);
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Select exhibit and create it's studybit", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		studybit.createExhibitStudyBit(browser, done,
			productData.chapter.topic.studybit.exhibit.studybitId,
			productData.chapter.topic.studybit.exhibit.concepts,
			productData.chapter.topic.studybit.exhibit.usertag,
			productData.chapter.topic.studybit.exhibit.notes,
			productData.chapter.topic.studybit.exhibit.windowScrollY);
	});

	it(". Refresh the page", function(done) {
		this.retries(2);
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Open created exhibit StudyBit and validate the StudyBit Save ", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		studybit.validateExhibitStudyBitSave(browser, done,
			productData.chapter.topic.studybit.exhibit.studybitId,
			productData.chapter.topic.studybit.exhibit.concepts,
			productData.chapter.topic.studybit.exhibit.usertag,
			productData.chapter.topic.studybit.exhibit.notes,
			productData.chapter.topic.studybit.exhibit.windowScrollY);
	});

	it(". Wait for page load", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Create an Image StudyBit", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		studybit.createImageStudyBit(browser, done,
			productData.chapter.topic.studybit.image.studybitId,
			productData.chapter.topic.studybit.image.concepts,
			productData.chapter.topic.studybit.image.usertag,
			productData.chapter.topic.studybit.image.notes,
			productData.chapter.topic.studybit.image.windowScrollY);
	});

	it(". Refresh the page", function(done) {
		browser.refresh().sleep(5000).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Open created image StudyBit and validate the StudyBit Save ", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		studybit.validateImageStudyBitSave(browser, done,
			productData.chapter.topic.studybit.image.studybitId,
			productData.chapter.topic.studybit.image.concepts,
			productData.chapter.topic.studybit.image.usertag,
			productData.chapter.topic.studybit.image.notes,
			productData.chapter.topic.studybit.image.windowScrollY);
	});

	it(". Scroll at the bottom of the topic and validate the presence of another exhibit", function(done) {
		studybit.scrollOnlocation(browser, productData.chapter.topic.studybit.bottomMostexhibit.id).then(function() {
			studybit.verifyAnotherExhibitPresent(browser, productData.chapter.topic.studybit.bottomMostexhibit.id, productData.chapter.topic.studybit.bottomMostexhibit.name).then(function() {
				done();
			});
		});
	});

	it(". Validate and Navigate to inline links within narrative content", function(done) {
		if (productData.productid === "MKTG9") {
			studybit.scrollOnlocation(browser, productData.inline_links.chapter.context_id)
				.then(function() {
					studybit.clickOnInlineLink(browser, productData.inline_links.chapter.context_id, productData.inline_links.chapter.link_text)
						.then(function() {
							studybit.validateAndNavigateToInlineLink(browser)
								.then(function() {
									console.log(report.reportHeader() +
										report.stepStatusWithData("Validation of Internal Chapter Navigation through Xref links", productData.inline_links.chapter.link_text, "success") +
										report.reportFooter());
									done();
								})
						});
				});
		} else {
			console.log(report.reportHeader() +
				report.stepStatus("Validation of Internal Chapter Navigation through Xref links skipped for ", "PSYCH4/COMM4", "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Navigate to StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Verify the presence of Exhibit StudyBit on StudyBoard ", function(done) {
		studybit.validateExhibitStudyBitOnStudyBoard(browser, done,
			productData.chapter.topic.studybit.exhibit.chaptername,
			productData.chapter.topic.studybit.exhibit.notes,
			productData.chapter.topic.studybit.exhibit.concepts[0],
			productData.chapter.topic.studybit.exhibit.usertag);
	});

	it(". Wait for page load", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Verify the presence of Image StudyBit On StudyBoard", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		studybit.validateImageStudyBitOnStudyBoard(browser, done,
			productData.chapter.topic.studybit.image.chaptername,
			productData.chapter.topic.studybit.image.notes,
			productData.chapter.topic.studybit.image.concepts[0],
			productData.chapter.topic.studybit.image.usertag);
	});

	it(". Delete the created studybits if any", function(done) {
		clearAllSavedContent.clearStudyboard(browser, done);
	});

	it(". Navigate to a topic to validate foot note", function(done) {
		tocPage.navigateToToc(browser).then(function() {
			tocPage.navigateToAChapter(productData.chapter.id, browser).then(function() {
				tocPage.navigateToATopic(productData.chapter.id, productData.chapter.topic.id, browser).nodeify(done);
			});
		});
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Find the count of foot notes on a specific narrative content and validate text for all", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		recursiveFnPage.getFootNotesCount(browser, done);
	});

	it(". Click on first footnote link and validate it should be open in next tab", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		footnotepo.clickonFirstFootNote(browser, done);
	});

	it(". Log out as instructor", function(done) {
		userSignOut.userSignOut(browser, done);
	});

});
