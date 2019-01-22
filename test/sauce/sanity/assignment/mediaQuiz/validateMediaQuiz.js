require('colors');
var wd = require('wd');
var _ = require('underscore');
var asserters = wd.asserters;
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var recursiveFnPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/recursiveFnPagepo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var menuPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var calendarNavigation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/navigationpo");
var assessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assessmentspo");
var mediaquizpage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/mediaQuizpo");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var studentAssessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var studenGradebookPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/student/gradebookValidationpo");
var createNewCoursepo = require("../../..//support/pageobject/" + pageobject + "/" + envName + "/createNewCoursepo");
var dataUtil = require("../../../util/date-utility");
var assessmentData = require("../../../../../test_data/assignments/assessments.json");
var session = require("../../../support/setup/browser-session");
var testData = require("../../../../../test_data/data.json");
var instructorGradebookNavigationPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/gradebookNavigationpo");
var arraymediaQuizActivity = [];
var courseHelper = require("../../../support/helpers/courseHelper");
var practiceQuizCreation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var copyCoursePage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/copyCoursepo.js");
var additionalInstructOrTA = require("../../../support/pageobject/" + pageobject + "/" + envName + "/additionalInstructOrTApo.js");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var tocPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/tocpo");
var report = require("../../../support/reporting/reportgenerator");
var casPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var pageLoadingTime;
var countOfQuestion;
var score;
var attempts;
var path = require('path');
var scriptName = path.basename(__filename);

describe(scriptName + 'MEDIA QUIZ  ASSIGNMENT WITH DROP LOWEST SCORE TEST STRATEGY VALIDATION', function() {
	var browser;
	var allPassed = true;
	var userType;
	var setDate;
	var courseName;
	var selectedActivityName;
	var selectedActivityText;
	var assignmentCreationStatus = "failure";
	var previewQuestionText;
	var product;
	var totalTime;
	var questionsCorrectFromCAS;
	var scoreFromStudentGradebook;
	var totalQuestionsInTheQuiz;
	var serialNumber = 0;
	var errorStatusOnPreview;
	var errorStatusAfterAssignmentLaunched;

	before(function(done) {
		browser = session.create(done);
		setDate = testData.courseAccessInformation.DateBeforeToday;
		newCourseData = testData.instructorResourceCenter;
		userType = "instructor";
		product = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString());
		if (product === "default") {
			product = testData.existingCourseDetails.product;
		}
		courseName = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_COURSE.toString());
		if (courseName === "default") {
			courseName = product + " " + courseHelper.getUniqueCourseName();
		}
		//Added default course for media quiz ORGB5 because this feature has been implited only for ORGB5 title
		product = "ORGB5";
		courseName = "Automation : ORGB5"
		data = loginPage.setLoginData(userType);
		totalTime = 0;
		//Reports
		console.log(report.formatTestName("MEDIA QUIZ ASSIGNMENT WITH DROP LOWEST SCORE TEST STRATEGY VALIDATION"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***validateMediaQuiz.js***"));
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

		it(". Login to 4LTR Platform as instructor", function(done) {
			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
			userType = "instructor";
			data = loginPage.setLoginData(userType);
			console.log(report.printLoginDetails(data.userId, data.password));
			loginPage.loginToApplication(browser, userType, done);
		});

		it(". Select a Product", function(done) {
			brainPage.selectProduct(product, browser, done);
		});


		it(". Click on manage my course", function(done) {
			createNewCoursepo.clickOnManageMyCourse(browser).then(function() {
				done();
			});
		});

		it(". Click on edit course under manage my course", function(done) {
			console.log(courseName);
			copyCoursePage.clickOnEditIcon(browser, courseName).then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
			});
		});


		it(". Copy Course key", function(done) {
			copyCoursePage.getCourseKey(browser).then(function(courseKeyVal) {
				courseKey = courseKeyVal;
				done();
			});
		});

		it(". Fill in the start date", function(done) {
			createNewCoursepo.fillTheStartDate(browser).then(function() {
				done();
			});
		});

		it(". Re- Edit the date, 10 days before from today's date ", function(done) {
			createNewCoursepo.enterTheEndData(browser, dataUtil.getSpecificDateAfterCurrentDate(setDate)).then(function() {
				done();
			});
		});

		it(". Save the course", function(done) {
			additionalInstructOrTA.clickOnSaveButton(browser).then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
			});
		});

		it(". Wait for page loading", function(done) {
			browser.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
			});
		});

		it(". Navigate to Instructor SSO", function(done) {
			basicpo.navigateToInstructorDashboard(browser).then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
			});
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

		it(". Wait for page load", function(done) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});

		it(". Log out as Instructor", function(done) {
			this.timeout(courseHelper.getElevatedTimeout());
			userSignOut.userSignOut(browser, done);
		});

	it(". Login to 4LTR Platform", function(done) {
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
		loginPage.launchACourse(userType, courseName, browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate to Assignments Page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Delete created assignment", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		assessmentsPage.deleteAssignment(browser, done);
	});

	it(". Select current date and open Media Quiz Type assignment settings page", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.handleTheFlashAlert(browser).then(function() {
			calendarNavigation.selectADateForAssignment(browser).
			then(function() {
				mediaquizpage.selectMediaQuizTypeAssignment(browser).then(function() {
					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Media Quiz type assignment is selected");
				});
			});
		});
	});

	it(". Verify the preview and save buttons are disabled until user fills all the mandatory fields under setting panel", function(done) {
		mediaquizpage.verifyPreviewButtonStatus(browser).then(function() {
			mediaquizpage.verifySaveButtonStatus(browser).then(function(saveButtonStatus) {
				if (saveButtonStatus === "true") {
					console.log(report.reportHeader() +
						report.stepStatusWithData("[Media Quiz] :  save button is disabled and status is", saveButtonStatus, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("[Media Quiz] :  save button is enabled and status is", saveButtonStatus, "failure") +
						report.reportFooter());
				}
			});
		});
	});

	it(". Complete the Media Quiz form Setting tab for system created assignment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.enterName(browser).then(function() {
			assessmentsPage.validateDueAndRevealDateText(browser, assessmentData.systemgenerated.mediaquiz.dueRevealDate).then(function() {
				mediaquizpage.selectChapterForMediaQuiz(browser, assessmentData.systemgenerated.mediaquiz.chapter).then(function() {
					assessmentsPage.enterScore(browser, assessmentData.systemgenerated.scorestrategyhigh.score).then(function() {
						assessmentsPage.selectAttempts(browser, assessmentData.systemgenerated.scorestrategyAverage.attempts).then(function() {
							assessmentsPage.selectScoreStrategy(browser, assessmentData.systemgenerated.scorestrategyAverage.scoreStrategy).then(function() {
								assessmentsPage.selectDropLowestScore(browser).then(function() {
									mediaquizpage.getTextOfSelectedActivity(browser, assessmentData.systemgenerated.mediaquiz.chapter).then(function(activityText) {
										selectedActivityText = activityText;
										console.log(report.reportHeader() +
											report.stepStatusWithData("Assessment form has been filled by chapter :" +
												assessmentData.systemgenerated.mediaquiz.chapter + ", Score :" +
												assessmentData.systemgenerated.scorestrategyhigh.score + ", Number Of Attempts :" +
												assessmentData.systemgenerated.scorestrategyhigh.attempts + ", Due reveal date :" +
												assessmentData.systemgenerated.mediaquiz.dueRevealDate + ", Score Strategy : High(" +
												assessmentData.systemgenerated.scorestrategyAverage.scoreStrategy, "success") +
											report.reportFooter());
										console.log(report.reportHeader() +
											report.stepStatusWithData("[Media Quiz] : Selected activity is on media quiz preview", selectedActivityText, "success") +
											report.reportFooter());
										done();
									});
								});
							});
						});
					});
				});
			});
		});
	});

	it(". Click on preview tab", function(done) {
		pageLoadingTime = 0;
		mediaquizpage.selectPreviewTab(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Preview Tab Loaded");
		});
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});


	it(". LTR-4699 Validate error message should not be display on Media Quiz Preview panel at instructor end", function(done) {
		mediaquizpage.verifyErrorMessageOnPreview(browser).then(function(status) {
			errorStatusOnPreview = status;
			if (errorStatusOnPreview) {
				mediaquizpage.getErrorMessageOnPreview(browser).text().then(function(errorText) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("CAS error message is displaying on preview tab and text is " + errorText, "failure") +
						report.reportFooter());
				});
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("No CAS error message is displaying and status is " + status, "success") +
					report.reportFooter());
				done();
			}
		});
	});

	it(". Verify the text on 'SHOW TRANSCRIPT' button is displayed under preview tab", function(done) {
		if (errorStatusOnPreview) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on Preview panel and status is", "success") +
				report.reportFooter());
			this.skip();
		} else {
			mediaquizpage.showTranscriptButton(browser).text().then(function(textOnShowTranscriptButton) {
				if (textOnShowTranscriptButton === assessmentData.systemgenerated.mediaquiz.showtranscriptbuttontext) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("[Media Quiz] : Text appears on show transcript button is", textOnShowTranscriptButton, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("[Media Quiz] : Text appears on show transcript button is", textOnShowTranscriptButton, "failure") +
						report.reportFooter());
				}
			});
		}
	});

	it(". Verify the video is present under preview tab", function(done) {
		if (errorStatusOnPreview) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on Preview panel and status is", "success") +
				report.reportFooter());
			this.skip();
		} else {
			mediaquizpage.validateIfPreviewVideoIsPresent(browser).then(function(videoPresenceStatus) {
				if (videoPresenceStatus) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("[Media Quiz] : Video is presesnt on media quiz preview", videoPresenceStatus, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("[Media Quiz] : Video is presesnt on media quiz preview", videoPresenceStatus, "success") +
						report.reportFooter());
				}
			});
		}
	});

	it(". Play video and pause it within preview", function(done) {
		if (errorStatusOnPreview) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on Preview panel and status is", "success") +
				report.reportFooter());
			this.skip();
		} else {
			mediaquizpage.playVideoOnPreview(browser).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Video Play and pause feature is working fine under preview", "", "success") +
					report.reportFooter());
				done();
			});
		}
	});

	it(". Click on '?' button and verify presence of questions and log first question text", function(done) {
		if (errorStatusOnPreview) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on Preview panel and status is", "success") +
				report.reportFooter());
			this.skip();
		} else {
			mediaquizpage.clickOnQuestionMark(browser, 1).then(function() {
				mediaquizpage.validateIfPreviewQuestionsIsPresent(browser).then(function() {
					mediaquizpage.validateQuestionOnPreviewTab(browser).text().then(function(questionText) {
						previewQuestionText = questionText;
						console.log(report.reportHeader() +
							report.stepStatusWithData("[Media Quiz] : First question appears on media quiz preview tab :: ", previewQuestionText, "success") +
							report.reportFooter());
						done();
					});
				});
			});
		}
	});

	it(". Attempt all the questions on the first cue then click on 'Score' and 'Continue Video' button", function(done) {
		if (errorStatusOnPreview) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on Preview panel and status is", "success") +
				report.reportFooter());
			this.skip();
		} else {
			recursiveFnPage.takeMediaQuiz(browser, done);
		}
	});

	it(". Click on second question cue", function(done) {
		if (errorStatusOnPreview) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on Preview panel and status is", "success") +
				report.reportFooter());
			this.skip();
		} else {
			mediaquizpage.clickOnQuestionMark(browser, 2).then(function() {
				done();
			});
		}
	});

	it(". Attempt all the questions on the second cue then click on 'Score' and 'Continue Video' button", function(done) {
		if (errorStatusOnPreview) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on Preview panel and status is", "success") +
				report.reportFooter());
			this.skip();
		} else {
			recursiveFnPage.takeMediaQuiz(browser, done);
		}
	});

	it(". Click on third question cue", function(done) {
		if (errorStatusOnPreview) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on Preview panel and status is", "success") +
				report.reportFooter());
			this.skip();
		} else {
			mediaquizpage.clickOnQuestionMark(browser, 3).then(function() {
				done();
			});
		}
	});


	it(". Attempt all the questions on the third Cue then click on 'Score' and 'Continue Video' button", function(done) {
		if (errorStatusOnPreview) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on Preview panel and status is", "success") +
				report.reportFooter());
			this.skip();
		} else {
			recursiveFnPage.takeMediaQuiz(browser, done);
		}
	});

	it(". Validate if attempted question's radio button is already checked after clicking on black question mark", function(done) {
		if (errorStatusOnPreview) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on Preview panel and status is", "success") +
				report.reportFooter());
			this.skip();
		} else {
			var indexOfQuestinMardButton = 1;
			mediaquizpage.clickOnBlackQuestionMarkButton(browser, indexOfQuestinMardButton).then(function() {
				mediaquizpage.getSelectedRadioButtonBackground(browser).then(function(checkedRadioButtonBackgroundColor) {
					if (checkedRadioButtonBackgroundColor.toString() === "rgb(140, 208, 209)" || checkedRadioButtonBackgroundColor.toString() === "rgb(50, 130, 133)") {
						console.log(report.reportHeader() +
							report.stepStatusWithData("MEDIA QUIZ : Attempted question's radio button is already checked and background color is ", checkedRadioButtonBackgroundColor.toString(), "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("MEDIA QUIZ : Question's radio button is not selected and background color is ", checkedRadioButtonBackgroundColor.toString(), "failure") +
							report.reportFooter());
					}
				});
			});
		}
	});

	it(". Validate if Score button is not displaying on clicking black question mark", function(done) {
		if (errorStatusOnPreview) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on Preview panel and status is", "success") +
				report.reportFooter());
			this.skip();
		} else {
			mediaquizpage.validateScoreButtonPresnceStatus(browser).then(function(scoreButtonStatus) {
				if (!scoreButtonStatus) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("MEDIA QUIZ : Score button is not displaying  ", scoreButtonStatus, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("MEDIA QUIZ : Score button is displaying  ", scoreButtonStatus, "failure") +
						report.reportFooter());
				}
			});
		}
	});

	it(". Save the assessment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});

	it(". Verify if media quiz assignment saves successfully", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		assessmentsPage.checkIfAssignmentSaved(browser).then(function(value) {
			if (value.toString() === "rgb(236, 41, 142)") {
				assignmentCreationStatus = "success";
				console.log(report.reportHeader() +
					report.stepStatusWithData("[Media Quiz] : Instructor created an media quiz type assignment called :: ", assessmentsPage.getAssignmentName(), "success") +
					report.reportFooter());
				done();
			} else {
				assignmentCreationStatus = "failure";
				console.log(report.reportHeader() +
					report.stepStatusWithData("[Media Quiz] : Instructor created an media quiz type assignment called :: ", assessmentsPage.getAssignmentName() + " may not have received the assessmentCGI", "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Wait for page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Reopen the recently created media quiz assignment ", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		assessmentsPage.clickOnAssignmentOnCurrentDate(browser, assessmentsPage.getAssignmentName()).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});


	it(". Validate selected activity is present", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		mediaquizpage.getChapterNameDefaultSelected(browser).then(function(activityName) {
			selectedActivityName = activityName.toString();
			mediaquizpage.getTextOfSelectedActivity(browser, 1).then(function(activityText) {
				if (selectedActivityText.indexOf(activityText) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Selected activity " + activityText + " on edit panel is compared with", selectedActivityText, "success") +
						report.reportFooter());
					mediaquizpage.validateMediaQuizActivitySelection(browser).then(function(statusOfRadioButton) {
						if (statusOfRadioButton === "true") {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Activity of chapter " + selectedActivityName + " is selected", statusOfRadioButton, "success") +
								report.reportFooter());
							done();
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Activity of chapter " + selectedActivityName + " is selected", statusOfRadioButton, "failure") +
								report.reportFooter());
						}
					});
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Selected activity " + activityText + " on edit panel is compared with", selectedActivityText, "success") +
						report.reportFooter());
				}
			});
		});
	});


	it(". Validate delete button enabled status", function(done) {
		this.retries(3);
		assessmentsPage.checkIfDeleteButtonNotDisabled(browser).then(function(deleteButtonStatus) {
			if (!deleteButtonStatus) {
				console.log(report.reportHeader() +
					report.printTestData("Delete button enabled status", !deleteButtonStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.printTestData("Delete button is not enabled now", deleteButtonStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate the same question present on edit panel for same assignment", function(done) {
		if (errorStatusOnPreview) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on Preview panel and status is", "success") +
				report.reportFooter());
			this.skip();
		} else {
			mediaquizpage.selectPreviewTab(browser).then(function() {
				mediaquizpage.validateIfPreviewVideoIsPresent(browser).then(function() {
					mediaquizpage.clickOnQuestionMark(browser, 1).then(function() {
						mediaquizpage.validateQuestionOnPreviewTab(browser).text().then(function(questionTextOnEditPanel) {
							if (questionTextOnEditPanel === previewQuestionText) {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Question text " + questionTextOnEditPanel + " on edit panel is compared with", previewQuestionText, "success") +
									report.reportFooter());
								done();
							} else {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Question text " + questionTextOnEditPanel + " on edit panel is compared with", previewQuestionText, "success") +
									report.reportFooter());
							}
						});
					});
				});
			});
		}
	});

	it(". Close the edit assignment panel", function(done) {
		mediaquizpage.clickOnCancelButton(browser).then(function() {
			done();
		});
	});

	it(". Select current date and open the Media Quiz Type assignment settings page", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.selectADateForAssignment(browser).then(function() {
			mediaquizpage.selectMediaQuizTypeAssignment(browser).then(function() {
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Media Quiz type assignment is selected");
			});
		});
	});

	it(". Fetch all the activity list in an array", function(done) {
		mediaquizpage.getActivity(browser).then(function(countOfMediaQuizActivities) {
			// browser
			// .waitForElementsByCss(".media-quiz-selection li h3", asserters.isDisplayed, 60000).then(function(countOfMediaQuizActivities) {
				var activityListCount = 1;

				function mediaQuizActivity() {
					if (activityListCount <= _.size(countOfMediaQuizActivities)) {
							mediaquizpage.getActivityText(browser, activityListCount).then(function(activityName) {
						// browser
						// 	.waitForElementByXPath("//ul[@class='media-quiz-selection']//li[" + activityListCount + "]//h3[@class='ng-scope ng-binding']", asserters.isDisplayed, 60000).text().then(function(activityName) {
								arraymediaQuizActivity.push(activityName);
								activityListCount++;
								mediaQuizActivity();
							});
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData(" All Activities are stored in an array ", arraymediaQuizActivity, "Success") +
							report.reportFooter());
						done();
					}
				}
				mediaQuizActivity();
			});
	});

	it(". Validate the non availability of the same chapter media quiz once that is used in the previously created media quiz assignment", function(done) {
		var arrayIndex = 0;
		if (!(_.contains(arraymediaQuizActivity, selectedActivityName, [arrayIndex]))) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Previous Assignment activity of the same chapter is not present in the list for new media quiz assignment", selectedActivityName + "Success") +
				report.reportFooter());
			done();
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Previous Assignment activity of the same chapter is present in the list for new media quiz assignment", selectedActivityName + "Failure") +
				report.reportFooter());
		}
	});

	it(". Click on cancel button", function(done) {
		mediaquizpage.clickOnCancelButton(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Refresh the page", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Click on List view and Verify", function(done) {
		tocPage.selectListView(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	//Refer bug for more details LTR-4702
	it(". Validate the attempts and max score should be displayed for media quiz assignments on list view", function(done) {
		mediaquizpage.getMaxPointsFromListView(browser).text().then(function(maxScoreOnListView) {
		console.log("maxScoreOnListView  "+maxScoreOnListView);
			mediaquizpage.getAttemptsFromListView(browser).text().then(function(attemptsOnListView) {
console.log("attemptsOnListView  "+attemptsOnListView);
				score = parseInt(assessmentData.systemgenerated.scorestrategyhigh.score);
				attempts = parseInt(assessmentData.systemgenerated.scorestrategyAverage.attempts);
				if (parseInt(maxScoreOnListView) === score && parseInt(attemptsOnListView) === attempts) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Max score on list view is displayed " + maxScoreOnListView + " and attempts", attemptsOnListView, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Max score on list view is displayed  " + maxScoreOnListView + " and attempts", attemptsOnListView, "failure") +
						report.reportFooter());
				}
			});
		});
	});

	it(". Log out as Instructor", function(done) {
		userSignOut.userSignOut(browser, done);
	});

	it(". Login as student", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userType = "student";
		data = loginPage.setLoginData(userType);
		//Reports
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});


	it(". Select a Course and launch", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		loginPage.launchACourse(userType, courseName, browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate to Assignments page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Click on the current date cell", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickCurrentDateCell(browser, done);
	});

	it(". Launch the Media Quiz", function(done) {
		pageLoadingTime = 0;
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.launchAssignment(browser, assessmentsPage.getAssignmentName()).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is launched");
		});
	});

	it(". LTR-4699 Validate error message should not be display on launching the assessment at student end", function(done) {
		mediaquizpage.verifyErrorMessageOnPreview(browser).then(function(status) {
			errorStatusAfterAssignmentLaunched = status;
			if (errorStatusAfterAssignmentLaunched) {
				mediaquizpage.getErrorMessageOnPreview(browser).text().then(function(errorText) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("CAS error message is displaying n launching the assessment at student end and text is " + errorText, "failure") +
						report.reportFooter());
				});
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("No CAS error message is displaying and status is " + errorStatusAfterAssignmentLaunched, "success") +
					report.reportFooter());
				done();
			}
		});
	});

	it(". Verify the video is present at student end", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {
			mediaquizpage.validateIfPreviewVideoIsPresent(browser).then(function(videoPresenceStatus) {
				if (videoPresenceStatus) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("[Media Quiz] : Video is presesnt at student end", videoPresenceStatus, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("[Media Quiz] : Video is presesnt at student end", videoPresenceStatus, "success") +
						report.reportFooter());
				}
			});
		}
	});

	it(". Click on '?' button and verify presence of questions and log first question text", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {

			mediaquizpage.clickOnQuestionMark(browser, 1).then(function() {
				mediaquizpage.validateIfPreviewQuestionsIsPresent(browser).then(function() {
					mediaquizpage.validateQuestionOnPreviewTab(browser).text().then(function(questionText) {
						previewQuestionText = questionText;
						console.log(report.reportHeader() +
							report.stepStatusWithData("[Media Quiz] : First question appears on media quiz preview tab :: ", previewQuestionText, "success") +
							report.reportFooter());
						done();
					});
				});
			});
		}
	});

	it(". Attempt all the questions on the first cue then click on 'Score' and 'Continue Video' button", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {
			recursiveFnPage.takeMediaQuizAtStudent(browser, done);
		}
	});

	it(". Click on second question cue", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {

			mediaquizpage.clickOnQuestionMark(browser, 2).then(function() {
				done();
			});
		}
	});



	it(". Attempt all the questions on the second cue then click on 'Score' and 'Continue Video' button", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {
			recursiveFnPage.takeMediaQuizAtStudent(browser, done);
		}
	});

	it(". Click on third question cue", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {
			mediaquizpage.clickOnQuestionMark(browser, 3).then(function() {
				done();
			});
		}
	});


	it(". Attempt all the questions on the third Cue then click on 'Score' and 'Continue Video' button", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {
			recursiveFnPage.takeMediaQuizAtStudent(browser, done);
		}
	});

	it(". Verify the Submit button is present when user completes all the questions on all cues", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {
			this.retries(4);
			mediaquizpage.checkIfSubmitButtonIsPresent(browser).text().then(function(submitButtonText) {
				mediaquizpage.clickOnSubmitButton(browser).then(function() {
					if (submitButtonText = assessmentData.systemgenerated.mediaquiz.submit) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("[Media Quiz] : Submit Button is present when user completes all the questions on all cues", submitButtonText, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("[Media Quiz] : Submit Button is present when user completes all the questions on all cues", submitButtonText, "success") +
							report.reportFooter());
					}
				});
			});
		}
	});

	it(". Validate the presence of result, fetch correct answers and total questions from the quiz", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {
			casPage.getQuestionsCorrect(browser).then(function(questionsCorrect) {
				console.log("Total Questions Correct " + questionsCorrect);
				questionsCorrectFromCAS = questionsCorrect;
				studentAssignmentCompletionStatus = "success";
				console.log(report.reportHeader() +
					report.stepStatusWithData("CAS : Student Completed the assignment  questions and got a score of  ", questionsCorrectFromCAS, "success") +
					report.reportFooter());
				practiceQuizCreation.getTotalQuestions(browser).then(function(TotalQuestions) {
					totalQuestionsInTheQuiz = TotalQuestions;
					console.log(report.reportHeader() +
						report.stepStatusWithData("Total number of questions in this quiz were " + TotalQuestions, "success") +
						report.reportFooter());
					done();
				});
			});
		}
	});


	it(". Click on exit button", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {
			pageLoadingTime = 0;
			mediaquizpage.clickOnExitButton(browser).then(function() {
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is attempted");
			});
		}
	});

	it(". Navigate to Gradebook page", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {

			if (assignmentCreationStatus === "failure") {
				this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
			}
			menuPage.selectGradebook(userType, browser, done);
		}
	});

	it(". Wait until the assignment page is loaded successfully", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
		});
	});

	it.skip(" [Gradebook]Validate the Points earned by the student for Media Quiz", function(done) {
		this.retries(3);
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.getScoredPoints(browser, assessmentsPage.getAssignmentName()).then(function(valueScore) {
			if (valueScore.toString() === assessmentsPage.getRoboPointScoreForMediaQuiz(questionsCorrectFromCAS, totalQuestionsInTheQuiz)) {
				pointsFromStudentGradebook = valueScore;
				console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + assessmentsPage.getRoboPointScoreForMediaQuiz(questionsCorrectFromCAS, totalQuestionsInTheQuiz) + " points, is compared against the student point score retrieved from Student Gradebook ", valueScore, "success") + report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + assessmentsPage.getRoboPointScoreForMediaQuiz(questionsCorrectFromCAS, totalQuestionsInTheQuiz) + " points, is compared against the student point score retrieved from Student Gradebook ", valueScore, "failure") + report.reportFooter());
			}
		});
	});

	it(". Login as Instructor", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userType = "instructor";
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Product", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		brainPage.selectProduct(product, browser, done);
	});

	it(". Select a Course and launch", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		loginPage.launchACourse("instructor", courseName, browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate on Gradebook page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Navigate to student's detailed gradebook view", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {

			if (assignmentCreationStatus === "failure") {
				this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
				console.log(loginPage.getUserName());
			}
			data = loginPage.setLoginData("student");
			console.log(report.printLoginDetails(data.userId, data.password));
			console.log(loginPage.getUserName());
			instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserName()).then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
		}
	});

	it(". Navigate to details of student's attempts gradebook view", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {

			instructorGradebookNavigationPage.navigateToDetailsOfStudentsAttempts(browser, assessmentsPage.getAssignmentName()).then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
		}
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Select last attempt from dropdown", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the assignment at student end", "success") +
				report.reportFooter());
			this.skip();
		} else {

			instructorGradebookNavigationPage.countAttemptsForMediaQuiz(browser).then(function(count) {
				var attemptCount = _.size(count);
				instructorGradebookNavigationPage.selectLastAttempt(browser, attemptCount).then(function() {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Last attempt selected", "Success", "success") +
						report.reportFooter());
					done();
				});
			});
		}
	});

	it.skip(" Validates all analytics for Correct question count and total question count on instructor student's detailed view", function(done) {
		this.retries(3);
		instructorGradebookNavigationPage.getAnalyticsValues(browser, "#score", assessmentsPage.getScorePercentageForMediaQuiz(questionsCorrectFromCAS, totalQuestionsInTheQuiz)).then(function() {
			instructorGradebookNavigationPage.getAnalyticsValues(browser, "#correct", questionsCorrectFromCAS).then(function() {
				instructorGradebookNavigationPage.getAnalyticsValues(browser, "#total", totalQuestionsInTheQuiz).then(function() {
					console.log(report.reportHeader() +
						report.stepStatusWithData("All analytics are present on assignment detailed page",
							"Score :" + assessmentsPage.getScorePercentageForMediaQuiz(questionsCorrectFromCAS, totalQuestionsInTheQuiz) +
							"Correct " + questionsCorrectFromCAS +
							"Total " + totalQuestionsInTheQuiz +
							"success") +
						report.reportFooter());
					done();
				});
			});
		});
	});

	it(". Wait until page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Log out as Instructor", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userSignOut.userSignOut(browser, done);
	});
});


//total test case: 77
