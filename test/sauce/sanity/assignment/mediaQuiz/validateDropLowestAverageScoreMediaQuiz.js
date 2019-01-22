require('colors');
var wd = require('wd');
var _ = require('underscore');
var asserters = wd.asserters;
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var dataUtil = require("../../../util/date-utility");
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
var assessmentData = require("../../../../../test_data/assignments/assessments.json");
var session = require("../../../support/setup/browser-session");
var testData = require("../../../../../test_data/data.json");
var instructorGradebookNavigationPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/gradebookNavigationpo");
var instructorMainGradebookView = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/mainGradebookView");
var arraymediaQuizActivity = [];
var courseHelper = require("../../../support/helpers/courseHelper");
var practiceQuizCreation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var tocPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/tocpo");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var instructorGradebookStudentDetailedPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/studentDetailedInfopo");
var report = require("../../../support/reporting/reportgenerator");
var casPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var instructorAssessmentDetailedInfopo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/assessmentDetailedInfopo");
var mathutil = require("../../../util/mathUtil");
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
	var totalsudentcount;
	var roboPoints;
	var PercentangeRoboPoints;
	var averageScoreForAllStudents;
	var totalValueOfScoresForAllStudents = 0;
	var dropAverageScore;

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
		data = loginPage.setLoginData(userType);
		totalTime = 0;
		//Reports
		console.log(report.formatTestName("MEDIA QUIZ ASSIGNMENT WITH DROP LOWEST SCORE TEST STRATEGY VALIDATION"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***validateDropLowestAverageScoreMediaQuiz.js***"));
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

	it(". Login to 4LTR Platform as Instructor ", function(done) {
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

	it(". Delete created Media Quiz assignment", function(done) {
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

	it(". Complete the Media Quiz Assessment form Setting tab for system created assignment", function(done) {
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

	it(". Click on Media Quiz preview tab", function(done) {
		pageLoadingTime = 0;
		mediaquizpage.selectPreviewTab(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Preview Tab Loaded");
		});
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});


	it(". LTR-4699 Validate error message should not be display on Media Quiz assignment Preview panel at instructor end", function(done) {
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

	it(". Verify the text on 'SHOW TRANSCRIPT' button is displayed under Media Quiz preview tab", function(done) {
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

	it(". Verify the video is present under Media Quiz preview tab", function(done) {
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

	it(". Play video and pause it within Media Quiz preview page", function(done) {
		if (errorStatusOnPreview) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on Media Quiz Preview panel and status is", "success") +
				report.reportFooter());
			this.skip();
		} else {
			mediaquizpage.playVideoOnPreview(browser).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Video Play and pause feature is working fine under Media Quiz preview", "", "success") +
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
				report.stepStatusWithData("CAS Error message is displaying on Media Quiz Preview panel and status is", "success") +
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
				report.stepStatusWithData("CAS Error message is displaying on Media Quiz Preview panel and status is", "success") +
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

	it(". Validate if attempted question's radio button is already checked after clicking on question cue of Media Quiz", function(done) {
		if (errorStatusOnPreview) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on Media Quiz Preview panel and status is", "success") +
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

	it(". Validate Score button is not displaying on clicking on question cue(already attempted questions) of Media Quiz", function(done) {
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

	it(". Save the Media Quiz assignment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});

	it(". Verify if media quiz assignment gets saved successfully", function(done) {
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

	it(". Refresh the page and wait for page load", function(done) {
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


	it(". Validate selected activity for Media Quiz is present", function(done) {
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


	it(". Validate delete button should be enabled on Media Quiz assignment edit panel", function(done) {
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

	it(". Validate the same question present on Media Quiz edit panel for same assignment", function(done) {
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

	it(". Close the Media Quiz edit assignment panel", function(done) {
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

	it(". Fetch all the activity list in an array for Media Quiz", function(done) {
		mediaquizpage.getActivity(browser).then(function(countOfMediaQuizActivities) {
			var activityListCount = 1;
				function mediaQuizActivity() {
					if (activityListCount <= _.size(countOfMediaQuizActivities)) {
							mediaquizpage.getActivityText(browser, activityListCount).then(function(activityName) {
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

	it(". Refresh the page and wait for page load", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Click on assignment List view and Verify", function(done) {
		tocPage.selectListView(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	//Refer bug for more details LTR-4702
	it(". Validate the attempts and max score should be displayed for media quiz assignments on list view", function(done) {
		mediaquizpage.getMaxPointsFromListView(browser).text().then(function(maxScoreOnListView) {
			mediaquizpage.getAttemptsFromListView(browser).text().then(function(attemptsOnListView) {
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

	it(". Launch the Media Quiz assignment for first time", function(done) {
		pageLoadingTime = 0;
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.launchAssignment(browser, assessmentsPage.getAssignmentName()).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is launched");
		});
	});

	it(". LTR-4699 Validate error message should not be display on launching the Media Quiz assignment at student end", function(done) {
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

	it(". Verify the video is present at student end for Media Quiz", function(done) {
		if (errorStatusAfterAssignmentLaunched) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS Error message is displaying on launching the Media Quiz assignment at student end", "success") +
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

	it(". Click on '?' button and verify presence of questions for Media Quiz and log first question text", function(done) {
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

	it(". Click on second question cue of Media Quiz", function(done) {
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

	it(". Click on third question cue of Media Quiz", function(done) {
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
				questionsCorrectFromCAS = parseInt(questionsCorrect);
				studentAssignmentCompletionStatus = "success";
				console.log(report.reportHeader() +
					report.stepStatusWithData("CAS : Student Completed the assignment  questions and got a score of  ", questionsCorrectFromCAS, "success") +
					report.reportFooter());
				practiceQuizCreation.getTotalQuestions(browser).then(function(TotalQuestions) {
					totalQuestionsInTheQuiz = parseInt(TotalQuestions);
					console.log(report.reportHeader() +
						report.stepStatusWithData("Total number of questions in this quiz were " + TotalQuestions, "success") +
						report.reportFooter());
					done();
				});
			});
		}
	});

	it(". Refresh the page and wait for page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment result page is loaded");
			});
	});


	it(". Validate refresh button on results should not restart the Media Quiz attempt", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		assessmentsPage.assignmentCasStatusOnPage(browser).then(function(casStatus) {
			if (!casStatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment question is reloaded while refreshing the page", casStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment question is reloaded while refreshing the page", casStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate incorrect answers displaying on tab is equal to the count of list of incorrect responses displaying on result page", function(done) {
		this.retries(3);
		practiceQuizCreation.fetchCorrectIncorrectCount(browser, "1").then(function(correctQuestionCount) {
			if (parseInt(correctQuestionCount) <= 10) {
				console.log(correctQuestionCount);
				practiceQuizCreation.fetchTheCountOfIncorrectAnswerFromTab(browser).then(function(incorrectCountFromTab) {
					practiceQuizCreation.checkAllQuestionCorrectStatus(browser).then(function(allCorrectStatus) {
						if (!allCorrectStatus) {
							practiceQuizCreation.fetchTheCountOfIncorrectAnswerFromList(browser).then(function(list) {
								incorrectResponseListCount = _.size(list);
								if (parseInt(incorrectCountFromTab) === incorrectResponseListCount) {
									console.log(report.reportHeader() +
										report.stepStatusWithData("Incorrect answers  given by the student from tab in quiz result view which is " + incorrectCountFromTab + " is compared against the count of incorrect responses in the list form ", incorrectResponseListCount + " are matching successfully", "success") +
										report.reportFooter());
									done();
								} else {
									console.log(report.reportHeader() +
										report.stepStatusWithData("Incorrect answers  given by the student from tab in quiz result view which is " + incorrectCountFromTab + " is compared against the count of incorrect responses in the list form ", incorrectResponseListCount + " are not matching successfully", "failure") +
										report.reportFooter());
								}
							});
						} else {
							incorrectResponseListCount = 0;
							if (parseInt(incorrectCountFromTab) === incorrectResponseListCount) {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Incorrect answers  given by the student from tab in quiz result view which is " + incorrectCountFromTab + " is compared against the count of incorrect responses in the list form ", incorrectResponseListCount + " are matching successfully", "success") +
									report.reportFooter());
								done();
							} else {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Incorrect answers  given by the student from tab in quiz result view which is " + incorrectCountFromTab + " is compared against the count of incorrect responses in the list form ", incorrectResponseListCount + " are not matching successfully", "failure") +
									report.reportFooter());
							}
						}
					});
				});
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Incorrect answers  given by the student", "0", "failure") +
					report.reportFooter());
				done();
			}
		});
	});


	it(". Validate if CGID is present in results page with each incorrect response of Media Quiz", function(done) {
		if (incorrectResponseListCount) {
			practiceQuizCreation.fetchCountOfCGIDWithEachQuizResponse(browser, "incorrect").then(function(CGIDCount) {
				if (incorrectResponseListCount === _.size(CGIDCount)) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("CGID is present with every incorrect response", "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("CGID is not present with every incorrect response", "failure") +
						report.reportFooter());
				}
			});
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Incorrect answers  given by the student", "0", "success") +
				report.reportFooter());
			done();
		}
	});
	//LTR-5189  :: validate onle one credits should be present for each questions
	it(". LTR-5189 :: Validate if credits present in results page with each incorrect response of Media Quiz", function(done) {
		if (incorrectResponseListCount) {
			assessmentsPage.fetchCountOfCreditsWithEachQuizResponse(browser).then(function(creditsCount) {
				if (incorrectResponseListCount === _.size(creditsCount)) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("credits is present with every incorrect response", "success") +
						report.reportFooter());
					done();
				} else if (incorrectResponseListCount === _.size(creditsCount) * 2) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("LTR-5189 :: 2 credits are present with every incorrect response", "failure") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("credits is not present with every incorrect response", "failure") +
						report.reportFooter());
					done();
				}
			});
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Incorrect answers  given by the student", "0", "success") +
				report.reportFooter());
			done();
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

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});



	it(". Navigate to Gradebook page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". LTR-5329 :: Validate assignment coulum should not disappear from the Student gradebook page ", function(done) {
		assessmentsPage.validateAssignmentDetailsOnGradebook(browser).then(function(astDetailsStatus) {
			if (astDetailsStatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Created assessment details are appeared on student gradebook page", astDetailsStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Created assessment details are appeared on student gradebook page", astDetailsStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Wait until page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". [Gradebook]Validate the Points earned by the student for Media Quiz", function(done) {
		this.retries(3);
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		roboPoints = assessmentsPage.getRoboPointScoreForMediaQuiz(questionsCorrectFromCAS, totalQuestionsInTheQuiz);
		PercentangeRoboPoints = mathutil.getScorePercentage(questionsCorrectFromCAS, totalQuestionsInTheQuiz);
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

	it(". [Gradebook]Validate the Score(Questions Correct) is not present from Student Gradebook table for Media Quiz", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.verifyStudentScoreColoumn(browser, assessmentsPage.getAssignmentName()).then(function(status) {
			if (!status) {
				console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : Score(Questions Correct) is not avaibale on stuent gradebook table at student end and status of score coloumn is " + status, "success") + report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : Score(Questions Correct) is not avaibale on stuent gradebook table at student end and status of score coloumn is " + status, "failure") + report.reportFooter());
			}
		});
	});

	it(". Validate the presence of Class average value on student GradeBook for Media Quiz", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.validateAvgScoreOnStudentGradebookForMediaQuiz(browser, assessmentsPage.getAssignmentName(), roboPoints, done);
	});


	it(". Validate the presence of submission date on student Gradebook page for Media Quiz", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.getSubmittedDate(browser, assessmentsPage.getAssignmentName())
			.then(function(dateOnStudentDetailedPage) {
				if (dateOnStudentDetailedPage.indexOf(dataUtil.getCurrentDateOnhyphenatedMMDDYYformatOnStudent()) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Submission date of assignment " + dateOnStudentDetailedPage + " is compared against current date of assignment submission", dataUtil.getCurrentDateOnhyphenatedMMDDYYformatOnStudent(), "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Submission date of assignment " + dateOnStudentDetailedPage + " is compared against current date of assignment submission", dataUtil.getCurrentDateOnhyphenatedMMDDYYformatOnStudent(), "failure") +
						report.reportFooter());
				}
			});
	});

	it(". Validate the presence of due date on student GradeBbook page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.getDueDate(browser, assessmentsPage.getAssignmentName()).then(function(dateOnStudentGradebookPage) {
			if (dateOnStudentGradebookPage.indexOf(dataUtil.getCurrentDateOnhyphenatedMMDDYYformatOnStudent()) > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : due date of assignment " + dateOnStudentGradebookPage + " is compared against current date of assignment submission", dataUtil.getCurrentDateOnhyphenatedMMDDYYformatOnStudent(), "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Submission date of assignment " + dateOnStudentGradebookPage + " is compared against current date of assignment submission", dataUtil.getCurrentDateOnhyphenatedMMDDYYformatOnStudent(), "failure") +
					report.reportFooter());
			}
		});
	});

it(". Navigate to Assignments page", function(done) {
	if (assignmentCreationStatus === "failure") {
		this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
	}
	menuPage.selectAssignments(userType, browser, done);
});

it(". Click on the current date cell for taking 2nd attempt", function(done) {
	if (assignmentCreationStatus === "failure") {
		this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
	}
	studentAssessmentsPage.clickCurrentDateCell(browser, done);
});

it(". Launch the assignment for taking 2nd attempt", function(done) {
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

it(". Click on second question cue of Media Quiz", function(done) {
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

it(". Click on third question cue of Media Quiz", function(done) {
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
			questionsCorrectFromCAS2 = parseInt(questionsCorrect);
			studentAssignmentCompletionStatus = "success";
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS : Student Completed the assignment  questions and got a score of  ", questionsCorrectFromCAS, "success") +
				report.reportFooter());
			practiceQuizCreation.getTotalQuestions(browser).then(function(TotalQuestions) {
				totalQuestionsInTheQuiz2 = TotalQuestions;
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

it(". Click on the current date cell", function(done) {
if (assignmentCreationStatus === "failure") {
	this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
}
studentAssessmentsPage.clickCurrentDateCell(browser, done);
});

it(". Launch the Media Quiz assignment for taking 3rd attempt ", function(done) {
pageLoadingTime = 0;
if (assignmentCreationStatus === "failure") {
	this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
}
studentAssessmentsPage.launchAssignment(browser, assessmentsPage.getAssignmentName()).then(function() {
	takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is launched");
});
});

it(". LTR-4699 Validate error message should not be display on launching the Media Quiz at student end", function(done) {
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

it(". Verify the video is present at student end for Media Quiz", function(done) {
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

it(". Click on second question cue of Media Quiz", function(done) {
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

it(". Click on third question cue of Media Quiz", function(done) {
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
		questionsCorrectFromCAS3 = parseInt(questionsCorrect);
		studentAssignmentCompletionStatus = "success";
		console.log(report.reportHeader() +
			report.stepStatusWithData("CAS : Student Completed the assignment  questions and got a score of  ", questionsCorrectFromCAS, "success") +
			report.reportFooter());
			practiceQuizCreation.getTotalQuestions(browser).then(function(TotalQuestions) {
				totalQuestionsInTheQuiz3 = TotalQuestions;
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

it(". Drop the lowest score and calculate average score of Media Quiz", function(done) {

	var correctQuestionsValueList = [questionsCorrectFromCAS, questionsCorrectFromCAS2, questionsCorrectFromCAS3];
	var sortedScores = _.sortBy(correctQuestionsValueList);
	var remainingScores = _.rest(sortedScores);

	function average(arr) {
		return _.reduce(arr, function(points, num) {
			return points + num;
		}, 0) / (arr.length === 0 ? 1 : arr.length);
	}
	// var averageValueOfCorrectQuestion = (remainingScores[0]+remainingScores[1])/2;
	console.log("remainingScores "+remainingScores);
	var averageValueOfCorrectQuestion = average(remainingScores);
	console.log("Average correct Question Count is:: " + averageValueOfCorrectQuestion);
	dropAverageScore = assessmentsPage.getRoboPointScoreForMediaQuiz(averageValueOfCorrectQuestion, totalQuestionsInTheQuiz);
	console.log("dropAverageScore"+dropAverageScore);
	done();
});

it(". Wait until page is loaded successfully", function(done) {
pageLoadingTime = 0;
takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
});

it(". Navigate to Gradebook page", function(done) {
if (assignmentCreationStatus === "failure") {
	this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
}
menuPage.selectGradebook(userType, browser, done);
});

it(". Wait until page is loaded successfully", function(done) {
pageLoadingTime = 0;
takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
});

it(". LTR-5329 :: Validate assignment coulum should not disappear from the Student gradebook page ", function(done) {
assessmentsPage.validateAssignmentDetailsOnGradebook(browser).then(function(astDetailsStatus) {
	if (astDetailsStatus) {
		console.log(report.reportHeader() +
			report.stepStatusWithData("Created assessment details are appeared on student gradebook page", astDetailsStatus, "success") +
			report.reportFooter());
		done();
	} else {
		console.log(report.reportHeader() +
			report.stepStatusWithData("Created assessment details are appeared on student gradebook page", astDetailsStatus, "failure") +
			report.reportFooter());
	}
});
});

it(". Wait until page is loaded successfully", function(done) {
browser
	.refresh().then(function() {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});
});

it(". [Gradebook]Validate the Points earned by the student of Media Quiz", function(done) {
this.retries(3);
browser.refresh().sleep(5000);
if (assignmentCreationStatus === "failure") {
	this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
}
studenGradebookPage.getScoredPoints(browser, assessmentsPage.getAssignmentName()).then(function(valueScore) {
	if (valueScore.toString() === dropAverageScore) {
		var pointsFromStudentGradebook = valueScore;
		console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + dropAverageScore + " points, is compared against the student point score retrieved from Student Gradebook ", valueScore, "success") + report.reportFooter());
		done();
	} else {
		console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + dropAverageScore + " points, is compared against the student point score retrieved from Student Gradebook ", valueScore, "failure") + report.reportFooter());
	}
});
});

it(". [Gradebook]Validate the Score(Questions Correct) is not present from Student Gradebook table as it is a obsolete feature", function(done) {
if (assignmentCreationStatus === "failure") {
	this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
}
studenGradebookPage.verifyStudentScoreColoumn(browser, assessmentsPage.getAssignmentName()).then(function(status) {
	if (!status) {
		console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : Score(Questions Correct) is not avaibale on stuent gradebook table at student end and status of score coloumn is " + status, "success") + report.reportFooter());
		done();
	} else {
		console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : Score(Questions Correct) is not avaibale on stuent gradebook table at student end and status of score coloumn is " + status, "failure") + report.reportFooter());
	}
});
});

it(". Validate the presence of Class average value on student GradeBook", function(done) {
if (assignmentCreationStatus === "failure") {
	this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
}
studenGradebookPage.validateAvgScoreOnStudentGradebookForMediaQuiz(browser, assessmentsPage.getAssignmentName(), dropAverageScore, done);
});


it(". Validate the presence of submission date on student Gradebook page for Media Quiz", function(done) {
if (assignmentCreationStatus === "failure") {
	this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
}
studenGradebookPage.getSubmittedDate(browser, assessmentsPage.getAssignmentName())
	.then(function(dateOnStudentDetailedPage) {
		if (dateOnStudentDetailedPage.indexOf(dataUtil.getCurrentDateOnhyphenatedMMDDYYformatOnStudent()) > -1) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("GRADEBOOK : Submission date of assignment " + dateOnStudentDetailedPage + " is compared against current date of assignment submission", dataUtil.getCurrentDateOnhyphenatedMMDDYYformatOnStudent(), "success") +
				report.reportFooter());
			done();
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("GRADEBOOK : Submission date of assignment " + dateOnStudentDetailedPage + " is compared against current date of assignment submission", dataUtil.getCurrentDateOnhyphenatedMMDDYYformatOnStudent(), "failure") +
				report.reportFooter());
		}
	});
});

it(". Validate the presence of due date on student GradeBbook page  for Media Quiz", function(done) {
if (assignmentCreationStatus === "failure") {
	this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
}
studenGradebookPage.getDueDate(browser, assessmentsPage.getAssignmentName()).then(function(dateOnStudentGradebookPage) {
	if (dateOnStudentGradebookPage.indexOf(dataUtil.getCurrentDateOnhyphenatedMMDDYYformatOnStudent()) > -1) {
		console.log(report.reportHeader() +
			report.stepStatusWithData("GRADEBOOK : due date of assignment " + dateOnStudentGradebookPage + " is compared against current date of assignment submission", dataUtil.getCurrentDateOnhyphenatedMMDDYYformatOnStudent(), "success") +
			report.reportFooter());
		done();
	} else {
		console.log(report.reportHeader() +
			report.stepStatusWithData("GRADEBOOK : Submission date of assignment " + dateOnStudentGradebookPage + " is compared against current date of assignment submission", dataUtil.getCurrentDateOnhyphenatedMMDDYYformatOnStudent(), "failure") +
			report.reportFooter());
	}
});
});

it(". Log out as Student", function(done) {
	userSignOut.userSignOut(browser, done);
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

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Navigate on Gradebook page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});



	it(". Validate the Export button on different browser", function(done) {
		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) === "iOS") {
			console.log("This feature is not implemented for iOS");
			this.skip();
		} else {
			instructorGradebookNavigationPage.validateExportButton(browser, done);
		}
	});


	it(". Retrieve count of registered student for the launched course", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorMainGradebookView.getStudentCount(browser).then(function(studentCounts) {
			totalsudentcount = _.size(studentCounts);
			if (!mathutil.isEmpty(totalsudentcount)) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Number of student who will attempt the assignment ", totalsudentcount, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : No student appears on the Instructor GradeBook page that is", totalsudentcount, "failure") +
					report.reportFooter());
			}
		});
	});


	it(". Calcuate the total of score earned by students for a particular Media Quiz assignment ", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		var sizeOfColumn = 0;
		instructorMainGradebookView.getTotalScoreBoxOnGradebook(browser, loginPage.getUserName())
			.then(function(elements) {
				sizeOfColumn = _.size(elements);

				function calculateValue() {
					if (sizeOfColumn > 0) {
						instructorMainGradebookView.getScoreText(browser, sizeOfColumn)
							.then(function(value) {
								if (!mathutil.isEmpty(value)) {
									totalValueOfScoresForAllStudents = totalValueOfScoresForAllStudents + parseInt(value);
									sizeOfColumn--;
									calculateValue();
								} else {
									console.log(report.reportHeader() +
										report.stepStatusWithData("failure", "", "failure") +
										report.reportFooter());
								}
							});
					} else {
						done();
					}
				}
				calculateValue();
			});
	});

	it(". Calculate class average for a  for Media Quiz assignment ", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		averageScoreForAllStudents = ((dropAverageScore * 10 / parseInt(totalsudentcount) * 10) / 10) / 10;
		console.log(report.reportHeader() +
			report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment calculated and is coming out to be ::  " + averageScoreForAllStudents, "success") +
			report.reportFooter());
		done();
	});
	//LTR-5346 won't fix
	it(". LTR-5346 Verify the presence of total point is zero untill the due date has passed on the Instructor GradeBook on the GradeBook table for  for Media Quiz", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorMainGradebookView.getTotalPoints(browser).text().then(function(totalPoints) {
			if (parseInt(totalPoints) === 0) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : TestBot Total points " + 0 + ", is compared against the Max total points  ", totalPoints + " displayed on the Instructor GradeBook table", "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : TestBot Total points  " + 0 + ", is compared against the Max total points  ", totalPoints + " displayed on the Instructor GradeBook table", "failure") +
					report.reportFooter());
			}
		});
	});

	it(". LTR-5346 Verify the presence of point gained by the student is reflected 0 on total points until assignment due date has not passed  for Media Quiz", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		data = loginPage.setLoginData("student");
		console.log("loginPage.getUserName()" + loginPage.getUserName());
		instructorMainGradebookView.getPointsGainedByStudent(browser, loginPage.getUserName())
			.then(function(pointsGained) {
				console.log(" ....... >>>>  " + pointsGained + " === assessmentsPage.getRoboPointScore(questionsCorrectFromCAS)");
				totalPointsGainedByStudent = pointsGained;
				if (parseInt(totalPointsGainedByStudent) === 0) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Total points earned by student " + totalPointsGainedByStudent + ", is compared against the testbot calculated total points earned ", 0, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Total points earned by student " + totalPointsGainedByStudent + ", is compared against the testbot calculated total points earned ", 0, "failure") +
						report.reportFooter());
				}
			});
	});

	it(". Verify the presence of point of Media Quiz assignments gained by the student", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorMainGradebookView.getScoreText(browser, 1)
			.then(function(pointsGainedByStudent) {
				var totalPointsGained = pointsGainedByStudent;
				if (totalPointsGained.indexOf(dropAverageScore) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Total points earned by student " + totalPointsGained + ", is compared against the testbot calculated total points earned ", dropAverageScore, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Total points earned by student " + totalPointsGained + ", is compared against the testbot calculated total points earned ", dropAverageScore, "failure") +
						report.reportFooter());
				}
			});
	});

	it(". Navigate to student's detailed gradebook view", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		data = loginPage.setLoginData("student");
		instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserName()).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});

	});

	it(".Refresh the page and wait until page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". LTR-5329 :: Validate Media Quiz assignment column should not disappear from the instructor's student detailed page", function(done) {
		assessmentsPage.validateAssignmentDetailsOnGradebook(browser).then(function(astDetailsStatus) {
			if (astDetailsStatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Created assessment details are appeared on instructor's student detailed page", astDetailsStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Created assessment details are appeared on instructor's student detailed page", astDetailsStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". LTR-5378 : Validate Media Quiz assignment name should be clickable", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.assignmentNameClickableStatus(browser, assessmentsPage.getAssignmentName()).then(function(assignmentNameClickableStatus) {
			console.log("assignmentNameClickableStatus" + assignmentNameClickableStatus);
			assignmentNameClickableStatusAfterAttempt = assignmentNameClickableStatus;
			if (assignmentNameClickableStatusAfterAttempt) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Student Detailed page:: Assignment name is clickable after student assignment submission " + assignmentNameClickableStatusAfterAttempt, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Student Detailed page:: Assignment name is clickable after student assignment submission " + assignmentNameClickableStatusAfterAttempt, "failure") +
					report.reportFooter());
			}

		});
	});

	it(". Validate presence of class average value on student detailed page on instructor gradebook view  for Media Quiz", function(done) {
		if (assignmentCreationStatus === "failure" && assignmentNameClickableStatusAfterAttempt == false) {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.retries(3);
		}
		instructorGradebookStudentDetailedPage.validatePresenceOfAverageScore(browser, assessmentsPage.getAssignmentName()).then(function(classAvg) {
			if (classAvg.indexOf(averageScoreForAllStudents) > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment on student detailed GradeBook view ::  " + classAvg, "is compared against the calculated class average ::" + averageScoreForAllStudents, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment on student detailed GradeBook view ::  " + classAvg, "is compared against the calculated class average ::" + averageScoreForAllStudents, "failure") +
					report.reportFooter());
			}

		});
	});


	it(". [Gradebook] Verify whether the system generated student Highest point score is updated on Instructor Gradebook on the Student Detailed media quiz Results Page", function(done) {

		this.retries(3);
		if (assignmentCreationStatus === "failure" && assignmentNameClickableStatusAfterAttempt == false) {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.getScoredPoints(browser, assessmentsPage.getAssignmentName())
			.then(function(scoredPoints) {
				if (scoredPoints.indexOf(dropAverageScore) > -1) {
					// if (scoredPoints.toString() === assessmentsPage.getRoboPointScore(questionsCorrectFromCAS)) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + dropAverageScore + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + dropAverageScore + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "failure") +
						report.reportFooter());
				}
			});
	});

	it(". Click on back button for navigating student detailed page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookNavigationPage.clickOnGradebookBackButton(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
		});
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
	});

	it(". Verify override score field should be disabled untill the due date has not passed", function(done) {
		instructorMainGradebookView.overrideTheScoreDisableStatus(browser).then(function(overrideStatus) {
			console.log(overrideStatus);
			if (overrideStatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Override box disabled before due date not passed ", overrideStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Override box disabled before due date not passed ", overrideStatus, "failure") +
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


	it(". Navigate to a specific student detailed view and edit attempt from the instructor gradebook", function(done) {
		if (assignmentCreationStatus === "failure" && assignmentNameClickableStatusAfterAttempt == false) {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) === "iOS") {
			browser.sleep(2000);
		}
		data = loginPage.setLoginData("student");
		instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserName()).then(function() {
			instructorGradebookStudentDetailedPage.editedAttemptsFromStudentDetaledView(browser, assessmentsPage.getAssignmentName()).then(function() {
				done();
			});
		});
	});

	it(". Validate attempts edited successfully without any error message", function(done) {
		instructorGradebookStudentDetailedPage.editedAttemptOnStudentDetailPage(browser, assessmentsPage.getAssignmentName()).then(function(editedAttempt) {
			console.log("editedAttempt" + editedAttempt + "editedAttempt");
			if (editedAttempt.indexOf("unlimited") > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment edited attempts with " + editedAttempt + " compared with", "success") +
					report.reportFooter());
				instructorGradebookStudentDetailedPage.errorFlashHideStatus(browser).then(function(errorFlashHideStatus) {
					if (errorFlashHideStatus) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Error flash hide status on the page", errorFlashHideStatus, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Error flash hide status on the page", errorFlashHideStatus, "failure") +
							report.reportFooter());
					}
				});
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment edited attempts with " + editedAttempt + " compared with", "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Wait until the assignment page is loaded successfully", function(done) {
		browser.refresh().
		sleep(5000).refresh().sleep(5000).refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
		});
	});

	it(". Re-validate edited attempts persist after refreshing the page without any error", function(done) {
		instructorGradebookStudentDetailedPage.editedAttemptOnStudentDetailPage(browser, assessmentsPage.getAssignmentName()).then(function(editedAttempt) {
			if (editedAttempt.indexOf("unlimited") > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment edited attempts with " + editedAttempt + " compared with", "unlimited", "success") +
					report.reportFooter());
				instructorGradebookStudentDetailedPage.errorFlashHideStatus(browser).then(function(errorFlashHideStatus) {
					if (errorFlashHideStatus) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Error flash hide status on the page", errorFlashHideStatus, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Error flash hide status on the page", errorFlashHideStatus, "failure") +
							report.reportFooter());
					}
				});
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment edited attempts with " + editedAttempt + " compared with", "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate the presence of Student name on the student detailed page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		data = loginPage.setLoginData("student");
		console.log("loginPage.getUserName()" + loginPage.getUserName() + "loginPage.getUserName()");
		instructorGradebookStudentDetailedPage.getStudentName(browser, loginPage.getUserName()).then(function() {
			done();
		});
	});

	it(". Validate the max point score is displayed correctly on the student detailed page for the assignment", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.getTotalPoints(browser, assessmentsPage.getAssignmentName())
			.then(function(maxPoints) {
				if (maxPoints.toString() === assessmentData.systemgenerated.scorestrategyhigh.score.toString()) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Total point score from student detailed page " + maxPoints + " , is compared against test data ", assessmentData.systemgenerated.scorestrategyhigh.score, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Total point score from student detailed page " + maxPoints + " , is compared against test data ", assessmentData.systemgenerated.scorestrategyhigh.score, "failure") +
						report.reportFooter());
				}
			});
	});

	it(". Validate points possible to date is displayed correctly on the points graph", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.getTotalPointsPossibleOnGraph(browser).then(function(pointsPossible) {
			if (pointsPossible === "0") {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Points possible to date retrieved from Points Graph " + pointsPossible + "  is compared against total points specified for the assignment", "0", "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Points possible to date retrieved from Points Graph " + pointsPossible + "  is compared against total points specified for the assignment", "0", "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate the presence of the total points scored by the student on the points graph", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.getTotalPointsEarnedOnGraph(browser)
			.then(function(totalPoints) {
				if (totalPoints === "0") {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated total points scored on the points Graph " + "0" + ", is compared against the total points displayed on Graph ", totalPoints, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated total points scored on the points Graph " + "0" + ",  is compared against the total points displayed on Graph ", totalPoints, "failure") +
						report.reportFooter());
				}
			});
	});


	it(". Validate the presence of due date on student detailed page under instructor gradebook view ", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.getDueDate(browser, assessmentsPage.getAssignmentName())
			.then(function(dateOnStudentDetailedPage) {
				if (dateOnStudentDetailedPage.indexOf("Today") > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Due date of assignment ", "Today", "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Due date of assignment ", "Today", "failure") +
						report.reportFooter());
				}
			});
	});


	it(". Validate the presence of submission date on student detailed page under instructor gradebook view ", function(done) {

		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(2);
		browser.refresh().then(function() {
			instructorGradebookStudentDetailedPage.checkSubmittedDate(browser, assessmentsPage.getAssignmentName(), dataUtil.getCurrentDateOnhyphenatedMMDDYYformat())
				.then(function() {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Submission date of assignment " + dataUtil.getCurrentDateOnhyphenatedMMDDYYformat() + "  is compared against current date of assignment submission", dataUtil.getCurrentDateOnhyphenatedMMDDYYformat(), "success") +
						report.reportFooter());
					done();
				});
		});

	});


	it(". Click on back button to navigate to gradebook view and click on the attempted assignment", function(done) {

		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookNavigationPage.navigateToGradebookViewFromStudentDetailedPage(browser)
			.then(function() {
				instructorGradebookNavigationPage.clickOnCreatedAssessment(browser, assessmentsPage.getAssignmentName()).then(function() {
					done();
				});
			});
	});

	it(". LTR-4665 :: Validate page should appear without any error", function(done) {

		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorMainGradebookView.getErrorMessagePresenceStatus(browser).then(function(errorMessagePresencestatus) {
			if (!errorMessagePresencestatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK :: Assessment detailed page is appearing without any error", errorMessagePresencestatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK :: Assessment detailed page is appearing without any error", errorMessagePresencestatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". LTR-4665 :: Validate assignment name present on assignment detailed page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorAssessmentDetailedInfopo.getAssessmentNameOnStudentAssessmentDetailedView(browser).then(function(assignmentname) {
			if (assignmentname.indexOf(assessmentsPage.getAssignmentName()) > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Assessment name " + assignmentname + "  is compared against assessment name", assessmentsPage.getAssignmentName(), "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Assessment name " + assignmentname + "  is compared against assessment name", assessmentsPage.getAssignmentName(), "failure") +
					report.reportFooter());
			}
		});
	});

	it(". LTR-4665 :: Validate the presence of score submission count on the submission graph", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorAssessmentDetailedInfopo.scoreSubmissionCountOnSubmissionGraph(browser).then(function(SubmissionCount) {
			if (!mathutil.isEmpty(SubmissionCount)) {
				if (parseInt(totalsudentcount) === 1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK :  Score submission count on the submission graph is : ", SubmissionCount, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK :  Score submission count on the submission graph is: ", SubmissionCount, "failure") +
						report.reportFooter());
				}
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK :  Score submission count on the submission graph is Empty", SubmissionCount, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". LTR-4665 :: Validate the presence of score expected on the submission graph", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorAssessmentDetailedInfopo.ValidatePresenceScoreExpected(browser)
			.then(function(ScoreExpected) {
				if (ScoreExpected.indexOf("1 Submissions Expected") > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK :  Presence of score expected on the submission graph: ", ScoreExpected, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK :  Presence of score expected on the submission graph: ", ScoreExpected, "failure") +
						report.reportFooter());
				}
			});
	});

	it(". LTR-4665 :: Validate the presence of Scores, Distribution, Submissions headers on assignment detailed view", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorAssessmentDetailedInfopo.validateScoreLabel(browser).then(function(scorelabel) {
			if (scorelabel.indexOf("Scores") > -1) {
				instructorAssessmentDetailedInfopo.validateDistibutionLabel(browser).then(function(distributionlabel) {
					if (distributionlabel.indexOf("Distribution") > -1) {
						instructorAssessmentDetailedInfopo.validateSubmissionLabel(browser).then(function(submissionlabel) {
							if (submissionlabel.indexOf("Submissions") > -1) {
								console.log(report.reportHeader() +
									report.stepStatusWithData("GRADEBOOK :  Scores, Distribution, Submissions labels are present: ", scorelabel + ":" + distributionlabel + ":" + submissionlabel, "success") +
									report.reportFooter());
								done();
							} else {
								console.log(report.reportHeader() +
									report.stepStatusWithData("GRADEBOOK :  Scores, Distribution, Submissions labels are present: ", scorelabel + ":" + distributionlabel + ":" + submissionlabel, "failure") +
									report.reportFooter());
							}
						});
					}
				});
			}
		});
	});


	it(".  LTR-4665 :: Validate the presence of Low, Median and High labels under Scores", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorAssessmentDetailedInfopo.validateLowLabel(browser)
			.then(function(lowlabel) {
				if (lowlabel.indexOf("LOW") > -1) {
					instructorAssessmentDetailedInfopo.validateMedianLabel(browser).then(function(medianlabel) {
						if (medianlabel.indexOf("MEDIAN") > -1) {
							instructorAssessmentDetailedInfopo.validateHighLabel(browser).then(function(highlabel) {
								if (highlabel.indexOf("HIGH") > -1) {
									console.log(report.reportHeader() +
										report.stepStatusWithData("GRADEBOOK :  LOW, MEDIAN, HIGH labels are present: ", lowlabel + ":" + medianlabel + ":" + highlabel, "success") +
										report.reportFooter());
									done();
								} else {
									console.log(report.reportHeader() +
										report.stepStatusWithData("GRADEBOOK :  LOW, MEDIAN, HIGH labels are present: ", lowlabel + ":" + medianlabel + ":" + highlabel, "failure") +
										report.reportFooter());
								}
							});
						}
					});
				}
			});
	});


	it(". LTR-4665 :: Validate the presence of distribution Value", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorAssessmentDetailedInfopo.validateDistibutionGraph(browser).then(function() {
			instructorAssessmentDetailedInfopo.validateDistibutionValue(browser, "1").then(function(lessthan60) {
				if (lessthan60.indexOf("<60") > -1) {
					instructorAssessmentDetailedInfopo.validateDistibutionValue(browser, "2").then(function(lessthan70) {
						if (lessthan70.indexOf("60-69") > -1) {
							instructorAssessmentDetailedInfopo.validateDistibutionValue(browser, "3").then(function(lessthan80) {
								if (lessthan80.indexOf("70-79") > -1) {
									instructorAssessmentDetailedInfopo.validateDistibutionValue(browser, "4").then(function(lessthan90) {
										if (lessthan90.indexOf("80-89") > -1) {
											instructorAssessmentDetailedInfopo.validateDistibutionValue(browser, "5").then(function(lessthan100) {
												if (lessthan100.indexOf("90-99") > -1) {
													instructorAssessmentDetailedInfopo.validateDistibutionValue(browser, "6").then(function(upto100) {
														if (upto100.indexOf("100 and up") > -1) {
															console.log(report.reportHeader() +
																report.stepStatusWithData("GRADEBOOK :  Distribution list Value: ", lessthan60 + "::" + lessthan70 + "::" + lessthan80 + "::" + lessthan90 + "::" + lessthan100 + "::" + upto100, "success") +
																report.reportFooter());
															done();
														} else {
															console.log(report.reportHeader() +
																report.stepStatusWithData("GRADEBOOK :  Distribution list Value: ", lessthan60 + "::" + lessthan70 + "::" + lessthan80 + "::" + lessthan90 + "::" + lessthan100 + "::" + upto100, "failure") +
																report.reportFooter());
														}
													});
												}
											});
										}
									});
								}
							});
						}
					});
				}
			});
		});
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
				done();
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
				// instructorGradebookNavigationPage.navigateToDetailsOfStudentsAttempts(browser, "ROBO-Q-U-30 RANDOM NO 111").then(function() {
				done();
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

	// it(". Wait until page is loaded successfully", function(done) {
	// 	browser
	// 		.refresh().then(function() {
	// 			pageLoadingTime = 0;
	// 			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	// 		});
	// });
	//
	it(". LTR-5439 :: Validates all analytics for Correct question count and total question count on instructor student's detailed view", function(done) {
		this.retries(3);
		console.log(PercentangeRoboPoints);
		var PercentageValueUptoOneDecimalPoint = mathutil.getScoreUptoOneDecimal(PercentangeRoboPoints);
		console.log(questionsCorrectFromCAS);
		console.log(totalQuestionsInTheQuiz);
		instructorGradebookNavigationPage.getAnalyticsValues(browser, "#score", PercentageValueUptoOneDecimalPoint).then(function() {
			console.log(roboPoints);
			instructorGradebookNavigationPage.getAnalyticsValues(browser, "#correct", questionsCorrectFromCAS).then(function() {
				console.log(questionsCorrectFromCAS);
				instructorGradebookNavigationPage.getAnalyticsValues(browser, "#total", totalQuestionsInTheQuiz).then(function() {
					console.log(totalQuestionsInTheQuiz);
					console.log(report.reportHeader() +
						report.stepStatusWithData("LTR-5439 :: All analytics are present on assignment detailed page",
							"Score :" + PercentageValueUptoOneDecimalPoint +
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

	it(". Navigate to Assignments Page", function(done) {
		menuPage.selectAssignments("instructor", browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Delete all past assignments", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		assessmentsPage.deleteAssignment(browser, done);
	});

	it(". Refresh the assignment result page", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment result page is loaded");
			});
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Select current date and open Assessment Type assignment settings page", function(done) {
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

	it(". Complete the Media Quiz Assessment form Setting tab for system created assignment", function(done) {
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
												assessmentData.systemgenerated.mediaquiz.dueRevealDate + ", Score Strategy : Average(" +
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

	it(". Save the  for Media Quiz assignment", function(done) {
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


	it(". Log out as Instructor", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
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

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate to Assignments page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});


	it(". Navigate to Gradebook page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". LTR-5329 :: Validate Media Quiz assignment coulum should not disappear from the Student gradebook page", function(done) {
		assessmentsPage.validateAssignmentDetailsOnGradebook(browser).then(function(astDetailsStatus) {
			if (astDetailsStatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Created assessment details are appeared on student gradebook page", astDetailsStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Created assessment details are appeared on student gradebook page", astDetailsStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Wait until page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". [Gradebook]Validate the recreated Media Quiz assignment points should not be updated with old value and presented value should be '-' ", function(done) {
		this.retries(3);
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.getScoredPoints(browser, assessmentsPage.getAssignmentName()).then(function(valueScore) {
			if (valueScore.toString() === "-") {
				pointsFromStudentGradebook = valueScore;
				console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + "-" + " points, is compared against the student point score retrieved from Student Gradebook ", valueScore, "success") + report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + "-" + " points, is compared against the student point score retrieved from Student Gradebook ", valueScore, "failure") + report.reportFooter());
			}
		});
	});

	it(". [Gradebook]Validate the Score(Questions Correct) is not present from Student Gradebook table for Media Quiz as it is obsolete feature", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.verifyStudentScoreColoumn(browser, assessmentsPage.getAssignmentName()).then(function(status) {
			if (!status) {
				console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : Score(Questions Correct) is not avaibale on stuent gradebook table at student end and status of score coloumn is " + status, "success") + report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : Score(Questions Correct) is not avaibale on stuent gradebook table at student end and status of score coloumn is " + status, "failure") + report.reportFooter());
			}
		});
	});

	it(". Validate the presence of Class average value on student GradeBook", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.validateAvgScoreOnStudentGradebookForMediaQuiz(browser, assessmentsPage.getAssignmentName(), "-", done);
	});


	it(". Validate the presence of submission date on student Gradebook page for Media Quiz", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.getSubmittedDate(browser, assessmentsPage.getAssignmentName())
			.then(function(dateOnStudentDetailedPage) {
				if (dateOnStudentDetailedPage.indexOf("-") > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Submission date of assignment " + dateOnStudentDetailedPage + " is compared against current date of assignment submission", "-", "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Submission date of assignment " + dateOnStudentDetailedPage + " is compared against current date of assignment submission", "-", "failure") +
						report.reportFooter());
				}
			});
	});

	it(". Validate the presence of due date on student GradeBbook page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.getDueDate(browser, assessmentsPage.getAssignmentName()).then(function(dateOnStudentGradebookPage) {
			if (dateOnStudentGradebookPage.indexOf(dataUtil.getCurrentDateOnhyphenatedMMDDYYformatOnStudent()) > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : due date of assignment " + dateOnStudentGradebookPage + " is compared against current date of assignment submission", dataUtil.getCurrentDateOnhyphenatedMMDDYYformatOnStudent(), "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Submission date of assignment " + dateOnStudentGradebookPage + " is compared against current date of assignment submission", dataUtil.getCurrentDateOnhyphenatedMMDDYYformatOnStudent(), "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Log out as Student", function(done) {
		userSignOut.userSignOut(browser, done);
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

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Navigate on Gradebook page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});



	it(". Validate the Export button on different browser", function(done) {
		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) === "iOS") {
			console.log("This feature is not implemented for iOS");
			this.skip();
		} else {
			instructorGradebookNavigationPage.validateExportButton(browser, done);
		}
	});

	//LTR-5346 won't fix
	it(". LTR-5346 Verify the presence of total point is zero untill the due date has passed on the Instructor GradeBook on the GradeBook table for Media Quiz", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorMainGradebookView.getTotalPoints(browser).text().then(function(totalPoints) {
			if (parseInt(totalPoints) === 0) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : TestBot Total points " + 0 + ", is compared against the Max total points  ", totalPoints + " displayed on the Instructor GradeBook table", "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : TestBot Total points  " + 0 + ", is compared against the Max total points  ", totalPoints + " displayed on the Instructor GradeBook table", "failure") +
					report.reportFooter());
			}
		});
	});

	it(". LTR-5346 Verify the presence of point gained by the student is reflected 0 on total points until assignment due date has not passed for Media Quiz", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		data = loginPage.setLoginData("student");
		console.log("loginPage.getUserName()" + loginPage.getUserName());
		instructorMainGradebookView.getPointsGainedByStudent(browser, loginPage.getUserName())
			.then(function(pointsGained) {
				console.log(" ....... >>>>  " + pointsGained + " === assessmentsPage.getRoboPointScore(questionsCorrectFromCAS)");
				totalPointsGainedByStudent = pointsGained;
				if (parseInt(totalPointsGainedByStudent) === 0) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Total points earned by student " + totalPointsGainedByStudent + ", is compared against the testbot calculated total points earned ", 0, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Total points earned by student " + totalPointsGainedByStudent + ", is compared against the testbot calculated total points earned ", 0, "failure") +
						report.reportFooter());
				}
			});
	});

	it(". Velidate the presence of scored point for Media Quiz assignments gained by the student", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorMainGradebookView.getScoreText(browser, 1)
			.then(function(pointsGainedByStudent) {
				var totalPointsGained = pointsGainedByStudent;
				if (totalPointsGained.indexOf("-") > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Total points earned by student " + totalPointsGained + ", is compared against the testbot calculated total points earned ", "-", "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Total points earned by student " + totalPointsGained + ", is compared against the testbot calculated total points earned ", "-", "failure") +
						report.reportFooter());
				}
			});
	});

	it(". Navigate to student's detailed gradebook view", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		data = loginPage.setLoginData("student");
		instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserName()).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});

	});

	it(". Wait until page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". LTR-5329 :: Validate Media Quiz assignment column should not disappear from the instructor's student detailed page", function(done) {
		assessmentsPage.validateAssignmentDetailsOnGradebook(browser).then(function(astDetailsStatus) {
			if (astDetailsStatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Created assessment details are appeared on instructor's student detailed page", astDetailsStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Created assessment details are appeared on instructor's student detailed page", astDetailsStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". LTR-5378 : Validate Media Quiz assignment name should not be clickable", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.assignmentNameNotClickableStatus(browser, assessmentsPage.getAssignmentName()).then(function(assignmentNameNotClickableStatus) {
			var assignmentNameClickableStatusBeforeAttempt = assignmentNameNotClickableStatus;
			if (assignmentNameClickableStatusBeforeAttempt) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Student Detailed page:: Assignment name is not clickable without student assignment submission " + assignmentNameClickableStatusBeforeAttempt, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Student Detailed page:: Assignment name is not clickable without student assignment submission " + assignmentNameClickableStatusBeforeAttempt, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate presence of class average value for Media Quiz on student detailed page on instructor gradebook view ", function(done) {
		if (assignmentCreationStatus === "failure" && assignmentNameClickableStatusAfterAttempt == false) {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.retries(3);
		}
		instructorGradebookStudentDetailedPage.validatePresenceOfAverageScoreWithoutAttempt(browser, assessmentsPage.getAssignmentName()).then(function(classAvg) {
			if (classAvg.indexOf("-") > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment on student detailed GradeBook view ::  " + "-", "is compared against the ::" + averageScoreForAllStudents, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment on student detailed GradeBook view ::  " + "-", "is compared against the ::" + averageScoreForAllStudents, "failure") +
					report.reportFooter());
			}
		});
	});


	it(". [Gradebook] Verify whether the system generated student point score is updated on Instructor Gradebook on the Student Detailed Results Page", function(done) {
		this.retries(3);
		if (assignmentCreationStatus === "failure" && assignmentNameClickableStatusAfterAttempt == false) {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.getScoredPointsBeforeAttempt(browser, assessmentsPage.getAssignmentName())
			.then(function(scoredPoints) {
				if (scoredPoints.indexOf("-") > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + "-" + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + "-" + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "failure") +
						report.reportFooter());
				}
			});
	});

	it(". Wait until page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Navigate to Assignments Page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Delete the created assignment", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		assessmentsPage.deleteAssignment(browser, done);
	});

	it(". Refresh the assignment page and wait for page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment result page is loaded");
			});
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Close flash on assignment page", function(done) {
		calendarNavigation.handleTheFlashAlert(browser).then(function() {
			done();
		});
	});

	it(". Log out as Instructor", function(done) {
		userSignOut.userSignOut(browser, done);
	});
});
//total test case: 77
