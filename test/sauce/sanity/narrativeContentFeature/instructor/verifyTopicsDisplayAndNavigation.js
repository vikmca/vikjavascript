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
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var tocPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/tocpo");
var chaptertile = require("../../../support/pageobject/" + pageobject + "/" + envName + "/chaptertileverificationpo.js");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var report = require("../../../support/reporting/reportgenerator");
var _ = require('underscore');
var mediaquizpage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/mediaQuizpo");
var courseHelper = require("../../../support/helpers/courseHelper");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'CHAPTER LIST VIEW VALIDATION', function() {
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
		console.log(report.formatTestName("LIST VIEW-TOPIC SLIDING PANE-TOPIC NAVIGATION-CHAPTER REVIEW, CHAPTER INTRO, GAMES/KEYTERMS ON CHAPTER REVIEW VALIDATION"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***verifyTopicsDisplayAndNavigation.js***"));
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

	it(". Validate Chapter counts on Grid View", function(done) {
		if(stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString())==="PFIN6"){
		tocPage.getChaptersCountOnGridView(browser).then(function(chapterCounts) {
			chapterCountsOnGrideView = _.size(chapterCounts);
			if (parseInt(chapterCountsOnGrideView) === parseInt(productData.chapter.chapterCounts)+2) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Chapters count on Grid View", chapterCountsOnGrideView, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Chapters count on Grid View", chapterCountsOnGrideView, "failure") +
					report.reportFooter());
			}
		});
		}else{
			tocPage.getChaptersCountOnGridView(browser).then(function(chapterCounts) {
				chapterCountsOnGrideView = _.size(chapterCounts);
				if (parseInt(chapterCountsOnGrideView) === parseInt(productData.chapter.chapterCounts)) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Chapters count on Grid View", chapterCountsOnGrideView, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Chapters count on Grid View", chapterCountsOnGrideView, "failure") +
						report.reportFooter());
				}
			});
		}
	});

	//Refer bug id LTR-4557 for more details
	it(". Validate that the chapter title and chapter number should be changed on expanding another chapter", function(done) {
		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) == "mobile" || stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) === "iOS") {
			this.skip()
		} else {
			tocPage.navigateToAChapter(productData.chapter.chapterId, browser)
				.then(function() {
					tocPage.scrollToAChapter(productData.chapter.id, browser)
						.then(function() {
							tocPage.navigateToAChapter(productData.chapter.id, browser).then(function() {
								tocPage.getChapterName(browser).text()
									.then(function(chapterText) {
										chapterText.should.contain(productData.chapter.title);
									})
									.then(function() {
										tocPage.getChapterNumber(browser).text().then(function(chapterNumberText) {
											chapterNumberText.should.contain(productData.chapter.id);
											done();
										});
									});
							});
						});
				});
		}
	});

	it(". Reload the page and wait for page load", function(done) {
			browser
				.refresh().then(function() {
					pageLoadingTime = 0;
					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
				});
	});

	it(". Click on List view and Verify the dispaly", function(done) {
		tocPage.clickonlistview(browser, done);
	});

	it(". Navigate to a Chapter", function(done) {
		tocPage.getChapterTitleonListView(productData.chapter.id, browser, 1)
			.then(function(textChapter) {
				textChapter.should.contain(productData.chapter.title);
				tocPage.getChapterTitleonListView(productData.chapter.id, browser, 2)
					.then(function(textChapter2) {
						console.log(textChapter2);
						textChapter2.should.contain(productData.chapter.title2);
					})
					.then(function() {
						tocPage.navigateToAChapterByListView(productData.chapter.id, browser, 1);
						done();
					});
			});
	});

	it(". Navigate to a 2nd topic from Chapter List View", function(done) {
		tocPage.navigateToATopicByListView(browser, done, productData.chapter.topic.id, 2);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Click on the sliding topic pane on the Topic page and verify the presence of chapters and topics on the sliding topic pane", function(done) {
		recursiveFnPage.verifyChaptersOnTopicPane(browser, done);
	});

	it(". Navigate to first topic under TOC", function(done) {
		tocPage.clickOnFirstTopicUnderToc(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Verify Chapter Introduction and Navigate to Chapter Review by clicking on next Button", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("quiz"));
		recursiveFnPage.verifyChapterIntroductionAndClickNext(browser, done);
	});

	it(". Verify Key Term and Games(Crossword and timer) on Chapter Review", function(done) {
		if(product == "MKTG9" || product == "PSYCH4"){
		chaptertile.verifyKeyTermOnChapterReview(browser, done, productData.chapter.topic.toc.cssofkeyterm, productData.chapter.topic.toc.value, productData.chapter.topic.toc.idofkeyterm, productData.chapter.topic.toc.keyterm);
		}else{
			console.log("Games are not present for "+product+" title");
			this.skip();
		}
	});

	it(". Click on next Button at the Bottom of the Page", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		chaptertile.clickOnNextButtonBottomOfPage(browser, done, productData.chapter.topic.toc.chapterintro2);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Click on the sliding topic pane again on the Topic page and verify the play and pause video on narrative view port", function(done) {
		tocPage.clickOnTOC(browser).then(function() {
			tocPage.clickVideoOnTOC(browser, productData.chapter.topic.toc.idOfVideoOnNarrativeView).then(function() {
				mediaquizpage.playVideoOnPreview(browser).then(function() {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Video Play and pause feature is working fine under preview", "", "success") +
						report.reportFooter());
					done();
				});
			});
		});
	});

	it(". Click on the sliding topic pane on the Topic page and verify the presence of chapters and topic on the sliding topic pane", function(done) {
		tocPage.navigateToSlidingToc(browser).then(function() {
			done();
		});
	});

	it(". Navigate to first topic under TOC", function(done) {
		tocPage.clickOnFirstTopicUnderToc(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Validate that previous arrow button is hidden under 1st topic", function(done) {
		tocPage.previousArrowButtonOnFirstTopic(browser).then(function(previousArrowButtonStatus) {
			if (previousArrowButtonStatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("previous arrow button hide under 1st topic", previousArrowButtonStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("previous arrow button hide under 1st topic", previousArrowButtonStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate that previous button is hidden under 1st topic", function(done) {
		tocPage.previousButtonOnFirstTopic(browser).then(function(previousButtonStatus) {
			if (previousButtonStatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("previous button hide under 1st topic", previousButtonStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("previous button hide under 1st topic", previousButtonStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Click on the sliding topic pane on the Topic page and verify the presence of chapters and topic on the sliding topic pane", function(done) {
		tocPage.navigateToSlidingToc(browser).then(function() {
			done();
		});
	});

	it(". Navigate to first topic under TOC", function(done) {
		tocPage.clickOnLastTopicUnderToc(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Validate next arrow button hide under last topic", function(done) {
		tocPage.nextArrowButtonOnLastTopic(browser).then(function(nextArrowButtonStatus) {
			if (nextArrowButtonStatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Next arrow button hide under 1st topic", nextArrowButtonStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Next arrow button hide under 1st topic", nextArrowButtonStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate next button hide under last topic", function(done) {
		tocPage.nextButtonOnLastTopic(browser).then(function(nextButtonStatus) {
			if (nextButtonStatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Next button hide under last topic", nextButtonStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Next button hide under last topic", nextButtonStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Log out as instructor", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userSignOut.userSignOut(browser, done);
	});

});
