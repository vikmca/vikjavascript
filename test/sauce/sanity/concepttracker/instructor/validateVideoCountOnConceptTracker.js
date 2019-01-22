var wd = require('wd');
var asserters = wd.asserters;
var stringutil = require("../../../util/stringUtil");
var session = require("../../../support/setup/browser-session");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var menuPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var tocPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/tocpo");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var conceptrackerPageInstructor = require("../../../support/pageobject/" + pageobject + "/" + envName + "/concepttracker/instructor/concepttrackerpo");
var _ = require('underscore');
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var videopo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/videopo");
var testData = require("../../../../../test_data/data.json");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var courseHelper = require("../../../support/helpers/courseHelper");
var report = require("../../../support/reporting/reportgenerator");
var path = require('path');
var scriptName = path.basename(__filename);

describe(scriptName + '4LTR (' + 'Instructor/Student' + ') :: VIDEO VIEWED BY STUDENT ON INSTRUCTOR CONCEPT TRACKER VALIDATION', function() {

	var browser;
	var allPassed = true;
	var userType;
	var courseName;
	var product;
	var productData;
	var preExistingViewed;
	var preExistingStudentsViewedAtLeastOne;
	var pageLoadingTime;
	var totalTime;
	var serialNumber = 0;

	before(function(done) {
		browser = session.create(done);
		userType = "instructor";
		product = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString());
		courseName = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_COURSE.toString());
		if (product === "default") {
			product = testData.existingCourseDetails.product;
		}
		if (courseName === "default") {
			courseName = product + " " + courseHelper.getUniqueCourseName();
		}
		data = loginPage.setLoginData(userType);
		productData = loginPage.getProductData();
		totalTime = 0;
		//Reports
		console.log(report.formatTestName("INSTRUCTOR VIDEO ANALYTICS ::  VIDEO VIEWED BY INSTRUCTOR NOT ON INSTRUCTOR CONCEPT TRACKER VALIDATION"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***ValidateVideoCountOnConceptTracker.js***"));
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
		done();
	});

	after(function(done) {
		console.log(report.formatTestTotalTime(totalTime, scriptName, allPassed));
		session.close(allPassed, done);
	});
	if (process.env.RUN_IN_PLATFORM.toString() === "\"iOS\"") {
		console.log("Currently we are facing chalenges on playing video on iOS device through script");
	} else {
		if (stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString()) == "MIS7") {
			it(". Login as instructor", function(done) {
				this.timeout(courseHelper.getElevatedTimeout());
				userType = "instructor";
				data = loginPage.setLoginData(userType);
				console.log(report.printLoginDetails(data.userId, data.password));
				loginPage.loginToApplication(browser, userType, done);
			});

			it(". Select a Product", function(done) {
				brainPage.selectProduct(product, browser, done);
			});

			it(". Select a Course and launch", function(done) {
				loginPage.launchACourse(userType, courseName, browser, done);
			});

			it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
				loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
			});

			it(". Click on List view and Verify", function(done) {
				tocPage.selectListView(browser).then(function() {
					done();
				});
			});

			it(". Navigate to a Chapter", function(done) {
				tocPage.navigateToAChapterByListView(productData.chapter.id, browser, productData.concepttracker.video.chapter);
				done();
			});

			it(". Navigate to a topic", function(done) {
				tocPage.navigateToATopicByListView(browser, done, productData.chapter.topic.id, productData.concepttracker.video.topic);
			});

			it(". Wait for page load", function(done) {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});

			it(". Play video and pause it with in narrative content", function(done) {
				videopo.validateYouTobeVideo(browser, done, productData.concepttracker.video.videoTitle);
			});

			it(". Log out as Instructor", function(done) {
				this.timeout(courseHelper.getElevatedTimeout());
				userSignOut.userSignOut(browser, done);
			});

		} else {
			it(". Login as Instructor", function(done) {
				this.timeout(courseHelper.getElevatedTimeout());
				userType = "instructor";
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

			it(". Navigate to Concept Tracker", function(done) {
				menuPage.selectConceptTracker(userType, browser, done);
			});

			it(". Wait for page loading", function(done) {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
			});

			it(". Validate the white box and media labels are present", function(done) {
				conceptrackerPageInstructor.verifyVideoLabelsForSpecificChapter(browser, productData.concepttracker.video.chapter).then(function(videoMediaStatus) {
					if (videoMediaStatus) {
						conceptrackerPageInstructor.isConceptTrackerLoaded(browser).then(function() {
							conceptrackerPageInstructor.getChapterName(browser, productData.concepttracker.video.chapter).then(function(chapterName) {
								if (chapterName.indexOf(productData.concepttracker.video.chapterName) > -1) {
									conceptrackerPageInstructor.verifyMediaLabelVideo(browser, productData.concepttracker.video.chapter,
										testData.ConceptTracker.mediaLabels.label1,
										testData.ConceptTracker.mediaLabels.label2,
										testData.ConceptTracker.mediaLabels.label3,
										testData.ConceptTracker.mediaLabels.label4
									).then(function() {
										console.log(report.reportHeader() +
											report.stepStatusWithData("All media labels ", testData.ConceptTracker.mediaLabels.label1 + ", " + testData.ConceptTracker.mediaLabels.label2 + ", " + testData.ConceptTracker.mediaLabels.label2 + ", " + testData.ConceptTracker.mediaLabels.label4 + " are present", "success") +
											report.reportFooter());
										done();
									});
								}
							});
						});
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Blank page appear due to not viewed any video by registered student", "", "success") +
							report.reportFooter());
						done();
					}
				});
			});

			it(". Log the count video analytics if white box is present", function(done) {
				conceptrackerPageInstructor.verifyVideoLabelsForSpecificChapter(browser, productData.concepttracker.video.chapter).then(function(videoMediaStatus) {
					if (videoMediaStatus) {
						conceptrackerPageInstructor.getValueVideoViewed(browser, productData.concepttracker.video.chapter, 1).then(function(viewedlabel1) {
							preExistingViewed = viewedlabel1;
							conceptrackerPageInstructor.getValueVideoViewed(browser, productData.concepttracker.video.chapter, 2).then(function(viewedlabel2) {
								preExistingStudentsViewedAtLeastOne = viewedlabel2;
								conceptrackerPageInstructor.getValueVideoViewed(browser, productData.concepttracker.video.chapter, 3).then(function(viewedlabel3) {
									preExistingTotalViews = viewedlabel3;
									console.log(report.reportHeader() +
										report.stepStatusWithData("Record the count: Videos Viewed: " + preExistingViewed + ", Students Viewed At Least One: " + preExistingStudentsViewedAtLeastOne + " and Total Views", preExistingTotalViews, "success") +
										report.reportFooter());
									done();
								});
							});
						});
					} else {
						preExistingViewed = 0;
						preExistingStudentsViewedAtLeastOne = 0;
						preExistingTotalViews = 0;
						console.log(report.reportHeader() +
							report.stepStatusWithData("Blank page appear due to not viewed any video by registered student", "", "success") +
							report.reportFooter());
						done();
					}
				});
			});


			it(". Log out as Instructor", function(done) {
				this.timeout(courseHelper.getElevatedTimeout());
				userSignOut.userSignOut(browser, done);
			});

			it(". Login as instructor", function(done) {
				this.timeout(courseHelper.getElevatedTimeout());
				userType = "instructor";
				data = loginPage.setLoginData(userType);
				console.log(report.printLoginDetails(data.userId, data.password));
				loginPage.loginToApplication(browser, userType, done);
			});

			it(". Select a Product", function(done) {
				brainPage.selectProduct(product, browser, done);
			});

			it(". Select a Course and launch", function(done) {
				loginPage.launchACourse(userType, courseName, browser, done);
			});

			it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
				loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
			});

			it(". Click on List view and Verify", function(done) {
				tocPage.selectListView(browser).then(function() {
					done();
				});
			});

			it(". Navigate to a Chapter", function(done) {
				tocPage.navigateToAChapterByListView(productData.chapter.id, browser, productData.concepttracker.video.chapter);
				done();
			});

			it(". Navigate to a topic", function(done) {
				tocPage.navigateToATopicByListView(browser, done, productData.chapter.topic.id, productData.concepttracker.video.topic);
			});

			it(". Wait for page load", function(done) {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});

			it(". Play video and pause it with in narrative content", function(done) {
				videopo.playVideo(browser, productData.concepttracker.video.videoid).then(function() {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Video Play and pause feature is working fine", "", "success") +
						report.reportFooter());
					done();
				});
			});

			it(". Validate Show transcript button should be displayed below the video", function(done) {
				videopo.verifyShowTranscriptButtonIsDisplayed(browser)
					.then(function(transcriptBtnStatus) {
						if (transcriptBtnStatus) {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Transcript button is present", transcriptBtnStatus, "success") +
								report.reportFooter());
							videopo.getTextOnShowTranscriptButton(browser).text()
								.then(function(transcriptBtnText) {
									if (transcriptBtnText.indexOf(testData.video.showtranscript) > -1) {
										console.log(report.reportHeader() +
											report.stepStatusWithData("Transcript button text " + transcriptBtnText + " is compared with", testData.video.showtranscript, "success") +
											report.reportFooter());
										done();
									} else {
										console.log(report.reportHeader() +
											report.stepStatusWithData("Transcript button text " + transcriptBtnText + " is compared with", testData.video.showtranscript, "failure") +
											report.reportFooter());
									}
								});
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Transcript button is present", transcriptBtnStatus, "failure") +
								report.reportFooter());
							done();
						}
					});
			});

			it(". Validate download video button should be displayed below the video", function(done) {
				if (stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString()) == "PSYCH4") {
					this.skip();
				} else {
					videopo.verifyDownloadVideoButtonIsDisplayed(browser)
						.then(function(downloadVideoBtnStatus) {
							if (downloadVideoBtnStatus) {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Download Video button is present", downloadVideoBtnStatus, "success") +
									report.reportFooter());
								videopo.getTextOfDownloadVideoButton(browser).text()
									.then(function(downloadVideoBtnText) {
										if (downloadVideoBtnText.indexOf(testData.video.downloadVideo) > -1) {
											console.log(report.reportHeader() +
												report.stepStatusWithData("Download video button text " + downloadVideoBtnText + " is compared with", testData.video.downloadVideo, "success") +
												report.reportFooter());
											done();
										} else {
											console.log(report.reportHeader() +
												report.stepStatusWithData("Download video button text " + downloadVideoBtnText + " is compared with", testData.video.downloadVideo, "failure") +
												report.reportFooter());
										}
									});
							} else {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Download Video button is present", downloadVideoBtnStatus, "failure") +
									report.reportFooter());
							}
						});
				}
			});



			it(". Click on transcript button and validate two transcript buttons should be displayed", function(done) {
				if (stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString()) == "PSYCH4") {
					this.skip();
				} else {
					videopo.clickOnOnTranscriptButton(browser).then(function() {
						videopo.verifyTopHideTrancriptBtn(browser).then(function(topHideTrancriptStatus) {
							videopo.verifyBottomHideTrancriptBtn(browser).then(function(bottomHideTrancriptStatus) {
								if (topHideTrancriptStatus && bottomHideTrancriptStatus) {
									console.log(report.reportHeader() +
										report.stepStatusWithData("Top Hide Transcript button is present " + topHideTrancriptStatus + " and bottom hide transcript button is present", bottomHideTrancriptStatus, "success") +
										report.reportFooter());
									videopo.getTextTopHideTrancriptBtn(browser).text()
										.then(function(topHideTrancriptText) {
											videopo.getTextBottomHideTrancriptBtn(browser).text().then(function(bottomHideTrancriptText) {
												if ((topHideTrancriptText.indexOf(testData.video.hidetranscript) > -1) && (bottomHideTrancriptText.indexOf(testData.video.hidetranscript) > -1)) {
													console.log(report.reportHeader() +
														report.stepStatusWithData("Top Hide Transcript button text " + topHideTrancriptText + " and bottom transcript button text " + bottomHideTrancriptText + " compared with", testData.video.hidetranscript, "success") +
														report.reportFooter());
													done();
												} else {
													console.log(report.reportHeader() +
														report.stepStatusWithData("Top Hide Transcript button text " + topHideTrancriptText + " and bottom transcript button text " + bottomHideTrancriptText + " compared with", testData.video.hidetranscript, "failure") +
														report.reportFooter());
												}
											});
										});

								} else {
									console.log(report.reportHeader() +
										report.stepStatusWithData("Top Hide Transcript button is present " + topHideTrancriptStatus + " and bottom hide transcript button is present", bottomHideTrancriptStatus, "failure") +
										report.reportFooter());
								}
							});
						});
					});
				}
			});

			it(". Validate transcript should be displayed when user click on show transcript button", function(done) {
				if (stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString()) == "PSYCH4") {
					this.skip();
				} else {
					videopo.validateTrancript(browser).then(function(transcriptVisibilityStatus) {
						if (transcriptVisibilityStatus) {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Transcript is displaying on clicking on Show Transcript Button", transcriptVisibilityStatus, "success") +
								report.reportFooter());
							done();
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Transcript is displaying on clicking on Show Transcript Button", transcriptVisibilityStatus, "failure") +
								report.reportFooter());
						}
					});
				}
			});

			it(". Validate download video button should be displayed below the video after clicking on show transcript button", function(done) {
				if (stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString()) == "PSYCH4") {
					this.skip();
				} else {
					videopo.verifyDownloadVideoButtonIsDisplayed(browser)
						.then(function(downloadVideoBtnStatus) {
							if (downloadVideoBtnStatus) {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Download Video button is still present after clicking on show transcript", downloadVideoBtnStatus, "success") +
									report.reportFooter());
								videopo.getTextOfDownloadVideoButton(browser).text()
									.then(function(downloadVideoBtnText) {
										if (downloadVideoBtnText.indexOf(testData.video.downloadVideo) > -1) {
											console.log(report.reportHeader() +
												report.stepStatusWithData("Download video button text " + downloadVideoBtnText + " is compared with", testData.video.downloadVideo, "success") +
												report.reportFooter());
											done();
										} else {
											console.log(report.reportHeader() +
												report.stepStatusWithData("Download video button text " + downloadVideoBtnText + " is compared with", testData.video.downloadVideo, "failure") +
												report.reportFooter());
										}
									});
							} else {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Download Video button is still present after clicking on show transcript", downloadVideoBtnStatus, "failure") +
									report.reportFooter());
							}
						});
				}
			});


			it(". Click on HIDE TRANSCRIPT button and validate transcript should not be displayed", function(done) {
				if (stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString()) == "PSYCH4") {
					this.skip();
				} else {
					videopo.clickOnOnTranscriptButton(browser).then(function() {
						videopo.validateTrancriptHideOnNarrtive(browser).then(function(HideTrancriptStatus) {
							if (HideTrancriptStatus) {
								console.log(report.reportHeader() +
									report.stepStatusWithData("On clicking on Hide Transcript button transcript is not displayed", HideTrancriptStatus, "success") +
									report.reportFooter());
								done();
							} else {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Transcript is displaing on clicking on Show Transcript Button", transcriptVisibilityStatus, "failure") +
									report.reportFooter());
							}
						});
					});
				}
			});


			it(". Click on next Button to navigate next topic", function(done) {
				this.retries(3);
				tocPage.navigateToNextTopic(browser, done);
			});

			it(". Wait for page loading", function(done) {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
			});

			it(". Navigate to Concept Tracker", function(done) {
				menuPage.selectConceptTracker(userType, browser, done);
			});
			//Instructor Manage My Course Concept Tracker has record of registered students activity
			it(". Verify the count of video viewed of Instructor is not reflecting on Instructor Manage My Course's Concept Tracker", function(done) {
				conceptrackerPageInstructor.verifyVideoLabelsForSpecificChapter(browser, productData.concepttracker.video.chapter).then(function(videoMediaStatus) {
					if (videoMediaStatus) {
						conceptrackerPageInstructor.getValueVideoViewed(browser, productData.concepttracker.video.chapter, 1).then(function(viewedlabel1) {
							preExistingViewed = viewedlabel1;
							conceptrackerPageInstructor.getValueVideoViewed(browser, productData.concepttracker.video.chapter, 2).then(function(viewedlabel2) {
								preExistingStudentsViewedAtLeastOne = viewedlabel2;
								conceptrackerPageInstructor.getValueVideoViewed(browser, productData.concepttracker.video.chapter, 3).then(function(viewedlabel3) {
									var preExistingTotalView = parseInt(preExistingTotalViews) + 1;
									if (parseInt(viewedlabel3) === preExistingTotalView) {
										console.log(report.reportHeader() +
											report.stepStatusWithData("Recorded count of Total Views " + preExistingTotalViews + " is increased by 1 on play video within narrative content of intsructor", preExistingTotalView, "failure") +
											report.reportFooter());

									} else {
										console.log(report.reportHeader() +
											report.stepStatusWithData("Recorded count of Total Views " + preExistingTotalViews + " is not increased by ", 1, "success") +
											report.reportFooter());
											done();
									}
								});
							});
						});
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Blank page appear due to not viewed any video by student as expected", "", "success") +
							report.reportFooter());
						done();
					}
				});
			});

			it(". Log out as Instructor", function(done) {
				this.timeout(courseHelper.getElevatedTimeout());
				userSignOut.userSignOut(browser, done);
			});

		}
	}
});
//total test case count 32
