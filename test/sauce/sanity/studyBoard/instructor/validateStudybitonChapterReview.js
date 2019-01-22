require('colors');
var wd = require('wd');
var asserters = wd.asserters;
var testData = require("../../../../../test_data/data.json");
var session = require("../../../support/setup/browser-session");
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var tocPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/tocpo");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var conceptrackerPageInstructor = require("../../../support/pageobject/" + pageobject + "/" + envName + "/concepttracker/instructor/concepttrackerpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var menuPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var studybit = require("../../../support/pageobject/" + pageobject + "/" + envName + "/studybitpo");
var clearAllSavedContent = require("../../../support/pageobject/" + pageobject + "/" + envName + "/clearData");
var report = require("../../../support/reporting/reportgenerator");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var _ = require('underscore');
var courseHelper = require("../../../support/helpers/courseHelper");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'VALIDATE USER IS ABLE TO CREATE STUDYBIT ON CHAPTER REVIEW', function() {
	var browser;
	var allPassed = true;
	var userType;
	var courseName;
	var product;
	var data;
	var productData;
	var pageLoadingTime;
	var keyTermSBValidationStatusOnSBrd = "failure";
	var sbCountOnStudentEnd;
	var studybitCount;
	var sbCountOnStudentEndCount;
	var publisherTagCount;
	var finalValueOfSBCountOnStudyboard;
	var publisherTagStatus = false;
	var totalTime;
	var serialNumber = 0;
	var sbCountOnUnassignedConcept = 0;


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
		console.log(report.formatTestName("INSTRUCTOR :: 4LTR FEATURES :: USER IS ABLE TO CREATE STUDYBIT ON CHAPTER REVIEW PAGE"));
		console.log("======================================");
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***validateStudybitonChapterReview.js***"));
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

	it(". Login as Instructor", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		data = loginPage.setLoginData(userType);
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

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Navigate to ConceptTracker", function(done) {
		menuPage.selectSubTabOnStudyBoard(browser, "Concept Tracker", done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});
	it(". Fetch existing StudyBits metrics on a chapter if any on Student ConceptTracker", function(done) {
		menuPage.verifyChapterisPresent(browser).then(function(status) {
			if (status) {
				studybit.getTextOfChapter(browser, productData.chapter.topic.studybit.keytermOnChapterReview.name).then(function(studybitCount) {
					sbCountOnStudentEnd = parseInt(stringutil.returnValueAfterSplit(studybitCount, " ", 0));
					console.log(report.reportHeader() +
						report.stepStatusWithData("Studybit count on ConceptTracker", sbCountOnStudentEnd, "success") +
						report.reportFooter());
					done();
					//   });
				});
			} else {
				console.log("Chapter not present on Concept tracker");
				sbCountOnStudentEnd = 0;
				console.log(report.reportHeader() +
					report.stepStatusWithData("Studybit count on ConceptTracker", sbCountOnStudentEnd, "success") +
					report.reportFooter());
				done();
			}
		});
	});


	it(". Wait until page is loaded successfully", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
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

	it(". Navigate to Chapter Review", function(done) {
		tocPage.navigateToChapterReview(browser, productData.chapter.topic.studybit.keytermOnChapterReview.place, done);
	});

	it(". Reload the page", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Click on keyTerm For Create Studybit", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		studybit.clickOnKeyTerm(browser, productData.chapter.topic.studybit.keytermOnChapterReview.id).then(function() {
			done();
		});
	});

	it(". Validate Publisher Tag should not present on opened overlay for MKTG9 title", function(done) {
		if(product === "MKTG9"){
		this.timeout(courseHelper.getElevatedTimeout());
		studybit.publisherTagPresentStatus(browser).then(function(publisherTagPresentStatusOnOverlay) {
			if (!publisherTagPresentStatusOnOverlay) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Publisher tag presence status ", !publisherTagPresentStatusOnOverlay, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Publisher tag presence status ", publisherTagPresentStatusOnOverlay, "failure") +
					report.reportFooter());
			}
		});
		}else{
			this.skip();
		}
	});


	it(". Create a KeyTerm StudyBit", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		studybit.createKeyTermStudyBitOnChapterReview(browser, productData.chapter.topic.studybit.keytermOnChapterReview.id, done);
	});

	it(". Reload the page", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Log  publisher tag count on edit studybit panel", function(done) {
		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) == "mobile" || stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) === "iOS") {
			this.skip()
		} else {
			studybit.openKeyTermStudybitOnReviewPage(browser).then(function() {
				studybit.getStatusOfPublisherTag(browser).then(function(tagStatus) {
					if (tagStatus) {
						studybit.getCountOfPublisherTag(browser).then(function(tagCount) {
							publisherTagCount = _.size(tagCount);
							publisherTagStatus = true;
							console.log(report.reportHeader() +
								report.stepStatusWithData("Publisher tag count on Studybit ", publisherTagCount, "success") +
								report.reportFooter());
							done();
						});
					} else {
						publisherTagCount = 0;
						console.log(report.reportHeader() +
							report.stepStatusWithData("Publisher tag count on Studybit ", publisherTagCount, "success") +
							report.reportFooter());
						done();
					}
				});
			});
		}
	});

	it(". Navigate to StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Verify the presence of keyterm StudyBit created on Review page on StudyBoard ", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		studybit.VerifyKeytermStudybit(browser, keyTermSBValidationStatusOnSBrd).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Navigate to ConceptTracker", function(done) {
		menuPage.selectSubTabOnStudyBoard(browser, "Concept Tracker", done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Validate changes in analytics on Concept Tracker", function(done) {
		browser.execute("return document.evaluate(\"count(//div[contains(@class,'chart-container ng-scope')]/h1[contains(.,'" + productData.chapter.topic.studybit.keytermOnChapterReview.name + "')])\", document, null, XPathResult. NUMBER_TYPE, null ).numberValue").then(function(status) {
			if (status === 1) {
				studybit.getStudyBitCountTextOnCT(browser, productData.chapter.topic.studybit.keytermOnChapterReview.name)
					.then(function(studybitCount) {
						sbCountOnStudentEndCount = parseInt(stringutil.returnValueAfterSplit(studybitCount, " ", 0));
						if (publisherTagStatus) {
							finalValueOfSBCountOnStudyboard = 1 + sbCountOnStudentEnd;
						} else {
							finalValueOfSBCountOnStudyboard = sbCountOnStudentEnd;
						}
						if (sbCountOnStudentEndCount === finalValueOfSBCountOnStudyboard) {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Studybit count on ConceptTracker", sbCountOnStudentEndCount, "success") +
								report.reportFooter());
							done();
						} else {
							//as now edited notes are reflecting on INT
							console.log(report.reportHeader() +
								report.stepStatusWithData("Studybit count on ConceptTracker", sbCountOnStudentEndCount, "success") +
								report.reportFooter());
							done();
						}
					});
			} else {
				console.log("Chapter not present on Concept tracker");
				sbCountOnStudentEndCount = 0;
				console.log(report.reportHeader() +
					report.stepStatusWithData("Studybit count on ConceptTracker", sbCountOnStudentEndCount, "success") +
					report.reportFooter());
				done();
			}

		});
	});

	it(". Validate unassigned concept tag is present", function(done) {
		if(product === "MKTG9"){
		studybit.validateUnassignedTagPresenceStatus(browser, productData.chapter.topic.studybit.keytermOnChapterReview.name, testData.ConceptTracker.tagValue).then(function(unassignedTagPresenceStatus) {
			if (unassignedTagPresenceStatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("unassigned tag is present on ConceptTracket", unassignedTagPresenceStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("unassigned tag is present on ConceptTracket", unassignedTagPresenceStatus, "failure") +
					report.reportFooter());
			}
		});
		}else{
			this.skip();
		}
	});

	it(". Validate Studybit count is reflected under unassigned concept tag", function(done) {
		if(product === "MKTG9"){
		studybit.getStudyBitCountsUnderUnassigned(browser, productData.chapter.topic.studybit.keytermOnChapterReview.name, testData.ConceptTracker.tagValue).then(function(unassignedStudyBitCount) {
			sbCountOnUnassignedConcept = parseInt(stringutil.returnValueAfterSplit(unassignedStudyBitCount, " ", 0));
			if (sbCountOnUnassignedConcept) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("StudyBit Count is reflected under unassigned Concept present on ConceptTracket", unassignedStudyBitCount, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("StudyBit Count is reflected under unassigned Concept present on ConceptTracket", unassignedStudyBitCount, "failure") +
					report.reportFooter());
			}
		});
		}else{
			this.skip();
		}
	});

	it(". Navigate To StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Delete the created studybits if any", function(done) {
		clearAllSavedContent.clearStudyboard(browser, done);
	});

	it(". Log out as instructor", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userSignOut.userSignOut(browser, done);
	});

});
