require('colors');
var wd = require('wd');
var testData = require("../../../../../test_data/data.json");
var session = require("../../../support/setup/browser-session");
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var tocPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/tocpo");
var studybit = require("../../../support/pageobject/" + pageobject + "/" + envName + "/studybitpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var clearAllSavedContent = require("../../../support/pageobject/" + pageobject + "/" + envName + "/clearData");
var courseHelper = require("../../../support/helpers/courseHelper");
var report = require("../../../support/reporting/reportgenerator");
var _ = require('underscore');
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'STUDYBIT:: VALIDATE A HEAD B HEAD C HEAD PUBLISHER TAGS FOR STUDYBITS', function() {
	var browser;
	var allPassed = true;
	var userType;
	var courseName;
	var product;
	var data;
	var productData;
	var publisherTagCountForAHead;
	var publisherTagCountForBHead;
	var publisherTagCountForCHead;
	var pageLoadingTime;
	var totalTime;
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
		console.log(report.formatTestName("STUDENT :: 4LTR STUDYBIT:: , VALIDATE A HEAD B HEAD C HEAD PUBLISHER TAG"));
		console.log("======================================");
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***validateAHeadBHeadCHeadTagsWhileCreatingContiguousStudyBit.js***"));
		console.log(report.printTestData("CHAPTER " + productData.chapter.id + " ", productData.chapter.topic.studybit.contiguousStudybit.chapter));
		console.log(report.printTestData("TOPIC " + productData.chapter.topic.id + " ", productData.chapter.topic.studybit.contiguousStudybit.topic));
		console.log(report.printTestData("STUDYBITID", productData.chapter.topic.studybit.contiguousStudybit.studybitId));
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

	if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) == "mobile" || stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) === "iOS") {
		console.log("this feature is not for mobile device");
	} else {
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


		it(". Select A head text for studybit and validate the increased publisher tag count on create studybit panel", function(done) {
			this.retries(3);
			this.timeout(courseHelper.getElevatedTimeout());
			studybit.selectTextFromAHead(browser, productData.chapter.topic.studybit.contiguousStudybit.studybitId,
				productData.chapter.topic.studybit.contiguousStudybit.windowScrollY).then(function() {
				studybit.fetchTheNumberOfPublisherTag(browser).then(function(element) {
					publisherTagCountForAHead = _.size(element);
					if (publisherTagCountForAHead > 0) {
						console.log(report.reportHeader() +
							report.stepStatus("Publisher tag count for A head", publisherTagCountForAHead, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatus("Publisher tag count for A head", publisherTagCountForAHead, "failure") +
							report.reportFooter());
					}
				});
			});
		});

		it(". Select B head text for studybit", function(done) {
			studybit.selectTextFromAHead(browser, productData.chapter.topic.studybit.contiguousStudybit.studybitIdForBHead,
					productData.chapter.topic.studybit.contiguousStudybit.windowScrollYForBHead)
				.then(function() {
					browser.sleep(5000)
						.nodeify(done);
				});
		});

		it(". Validate increased publisher tag count when user select text for B head", function(done) {
			studybit.fetchTheNumberOfPublisherTag(browser).then(function(element) {
				publisherTagCountForBHead = _.size(element);
				if (publisherTagCountForBHead > publisherTagCountForAHead) {
					console.log(report.reportHeader() +
						report.stepStatus("Publisher tag count for B head", publisherTagCountForBHead, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatus("Publisher tag count for B head", publisherTagCountForBHead, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Select C head text for studybit", function(done) {
			studybit.selectTextFromAHead(browser, productData.chapter.topic.studybit.contiguousStudybit.studybitIdForCHead,
				productData.chapter.topic.studybit.contiguousStudybit.windowScrollYForCHead).then(function() {
				browser.sleep(5000)
					.nodeify(done);
			});
		});

		it(". alidate increased tag count when user select text for C head", function(done) {
			studybit.fetchTheNumberOfPublisherTag(browser).then(function(element) {
				publisherTagCountForCHead = _.size(element);
				if (publisherTagCountForCHead > publisherTagCountForBHead) {
					console.log(report.reportHeader() +
						report.stepStatus("Publisher tag count for C head", publisherTagCountForCHead, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatus("Publisher tag count for C head", publisherTagCountForCHead, "failure") +
						report.reportFooter());
				}
			});
		});

	}

});
