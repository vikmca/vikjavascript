require('colors');
var wd = require('wd');
var asserters = wd.asserters;
var Q = wd.Q;
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var recursiveFnPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/recursiveFnPagepo");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var menuPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var instructorMainGradebookView = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/mainGradebookView");
var calendarNavigation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/navigationpo");
var assessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assessmentspo");
var studentAssessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var casPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var studenGradebookPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/student/gradebookValidationpo");
var instructorGradebookStudentDetailedPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/studentDetailedInfopo");
var instructorGradebookNavigationPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/gradebookNavigationpo");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var session = require("../../../support/setup/browser-session");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var courseHelper = require("../../../support/helpers/courseHelper");
var report = require("../../../support/reporting/reportgenerator");
var assignmentpage = require("../../../support/pagefactory/assignmentpage");
var chapterReadingAssignmentPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/chapterReadingpo");
var mathutil = require("../../../util/mathUtil");
var assessmentData = require("../../../../../test_data/assignments/assessments.json");
var gradebookData = require("../../../../../test_data/gradebook/gradebook.json");
var testData = require("../../../../../test_data/data.json");
var _ = require('underscore');
var assignmentAvgScore = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assesmentspoforAvgScore");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'FORM FIELD VALIDATIONS ON CREATE ASSIGNMENT', function() {
	var browser;
	var allPassed = true;
	var userType;
	var setDate;
	var characterLeftCount;
	var textboxCountDecreases;
	var assignmentCharacterCount;
	var courseName;
	var assignmentCreationStatus = "failure";
	var product;
	var initialLeftCount = 30;
	var pageLoadingTime;
	var totalTime;
	var productData;
	var serialNumber = 0;
	var pointsFromStudentGradebook;
	var currentDateText;
	var beforeCurrentDateText;
	var afterCurrentDateText;
	var questionsCorrectFromCAS;
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

		browserName = stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString());
		console.log("browserName::" + browserName);

		data = loginPage.setLoginData(userType);
		productData = loginPage.getProductData();
		totalTime = 0;
		//Reports
		console.log(report.formatTestName("FORM FIELD VALIDATIONS ON CREATE ASSIGNMENT"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***validateAssessmentAlternativeScenarios.js***"));

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

	it(". Validate the all labels and Icons present under Manage My Course", function(done) {
		menuPage.clickOnManageMyCourse(browser).then(function() {
			menuPage.getlabelsCountUnderManageMyCourse(browser).then(function(count) {
				menuPage.getIconsTotalCountUnderManageMyCourse(browser).then(function(iconscount) {
					if (_.size(count) == 4 && _.size(iconscount) == 4) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Verify the presence of 4 sub dropdown menu Under ManageMyCourse", "success") +
							report.reportFooter());
							menuPage.verifyLabelsUnderManageMyCourse(browser, "2", testData.ManageMyCourse.dropDownLabels.label1).then(function() {
								menuPage.verifyLabelsUnderManageMyCourse(browser, "3", testData.ManageMyCourse.dropDownLabels.label2).then(function() {
									menuPage.verifyLabelsUnderManageMyCourse(browser, "4", testData.ManageMyCourse.dropDownLabels.label3).then(function() {
										menuPage.verifyLabelsUnderManageMyCourse(browser, "5", testData.ManageMyCourse.dropDownLabels.label4).then(function() {
											console.log(report.reportHeader() +
												report.stepStatusWithData("All labels are present on ",
													testData.ManageMyCourse.dropDownLabels.label1 + "," +
													testData.ManageMyCourse.dropDownLabels.label2 + "," +
													testData.ManageMyCourse.dropDownLabels.label3 + "," +
													testData.ManageMyCourse.dropDownLabels.label4,
													"success") +
												report.reportFooter());
											menuPage.clickOnManageMyCourse(browser).then(function() {
												done();
											});
										});
									});
								});
							});
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Verify the presence of 4 sub dropdown menu Under ManageMyCourse", "success") +
							report.reportFooter());
					}
				});
			});
		});
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Navigate to Assignments Page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Delete all past assignments", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		assessmentsPage.deleteAssignment(browser, done);
	});

	it(". Wait for page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Select current date and open the Assessment Type assignment settings page", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.handleTheFlashAlert(browser).then(function() {
			calendarNavigation.selectADateForAssignment(browser).then(function() {
				calendarNavigation.selectAssessmentTypeAssignment(browser).then(function() {
					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assessment type assignment is selected");
				});
			});
		});
	});

	it(". Verify the assessment preview and question buttons are disabled until user fills all the mandatory fields under setting panel", function(done) {
		assessmentsPage.verifyQuestionButton(browser).then(function() {
			assessmentsPage.verifyPreviewButtonStatus(browser).then(function(previewButtonStatus) {
				if (previewButtonStatus) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("[Media Quiz] :  preview tab is disabled and status is", previewButtonStatus, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("[Media Quiz] :  preview tab is enabled and status is", previewButtonStatus, "failure") +
						report.reportFooter());
				}
			});
		});
	});

	it(". Validate total count decreases as the user enter characters in assignment name", function(done) {
		assessmentsPage.enterName(browser).then(function() {
			assessmentsPage.characterCountAssignmentName(browser).then(function(textboxCharacterCount) {
				assignmentCharacterCount = parseInt(textboxCharacterCount);
				assessmentsPage.leftCountFromAssignmentTextBox(browser).then(function(leftCount) {
					characterLeftCount = parseInt(leftCount);
					textboxCountDecreases = initialLeftCount - assignmentCharacterCount;
					if (textboxCountDecreases === characterLeftCount) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("count decreases as the user enter character in assignment name", characterLeftCount, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("count decreases as the user enter character in assignment name", characterLeftCount, "failure") +
							report.reportFooter());
					}
				});
			});
		});
	});


	it(". Validate when user enters the character beyond limits then count becomes negative", function(done) {
		recursiveFnPage.validateLeftcountAtAstNameTextbox(browser, done);
	});

	it(". Validate the assignment name textbox is disabled when user enters the value greater than textbox character linit ", function(done) {
		assessmentsPage.fetchAssignmentNameTextBox(browser).getAttribute('aria-invalid')
			.then(function(textBoxState) {
				if (textBoxState === testData.assignmentDetails.assignmentTextBoxDtails.textBoxStatus) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("When user enters character more than pool then assignment name textbox status is ", textBoxState, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("When user enters character more than pool then assignment name textbox status is ", textBoxState, "failure") +
						report.reportFooter());
				}
			});
	});

	it(". Validate the 'I will choose' button gets disabled when user enters the value greater than question pool", function(done) {
		assessmentsPage.iWillChooseButtonDisabled(browser).getAttribute('aria-disabled')
			.then(function(iWillChooseButtonInDisabelState) {
				if (iWillChooseButtonInDisabelState === testData.assignmentDetails.assignmentTextBoxDtails.iWillChooseAttributeStatus) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("'I will choose' button disabled after entering the text greater than pool and status is ", iWillChooseButtonInDisabelState, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("'I will choose' button disabled after entering the text greater than pool and status is ", iWillChooseButtonInDisabelState, "failure") +
						report.reportFooter());
				}
			});
	});

	it(". Close create Assignment Panel", function(done) {
		assessmentsPage.closeAssignmentPanel(browser).then(function() {
			done();
		});
	});

	it(". Validate when user click on 'x' icon then assignment don't get saved", function(done) {
		assessmentsPage.checkIfAssignmentGetSavedOnCurrentDate(browser).then(function(status) {
			if (!status) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment is not present in current date status is " + status, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Student :Course is no longer available on dashboard " + status, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Select current date and open the Assessment Type assignment settings page", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.selectADateForAssignment(browser).then(function() {
			calendarNavigation.selectAssessmentTypeAssignment(browser).then(function() {
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assessment type assignment is selected");
			});
		});
	});

	it(". Validate Default text of the reveal date and Due date should be 'Today'", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.fetchDefaultTextOnDueDate(browser, 1).text().then(function(defaultTextOnDueDate) {
			assessmentsPage.fetchDefaultTextOnDueDate(browser, 2).text().then(function(defaultTextOnRevealDate) {
				if (defaultTextOnDueDate === "Today" && defaultTextOnRevealDate === "Today") {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Default text on due date", +defaultTextOnDueDate, "and default text on reveal date", defaultTextOnRevealDate, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Default text on due date", +defaultTextOnDueDate, "and default text on reveal date", defaultTextOnRevealDate, "failure") +
						report.reportFooter());
				}
			});
		});
	});


	it(". Select Due date and validate the background colour of the current date in the calendar", function(done) {
		calendarNavigation.verifyBackGrndColorOfCurrentDate(browser).then(function(backgroundColor) {
			if (backgroundColor === "rgb(140, 208, 209)" || backgroundColor === "rgb(50, 130, 133)") {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Background colour of the current date in the calendar", backgroundColor, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Background colour of the current date in the calendar", backgroundColor, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate the background image of before current date in the calendar under create assignment panel", function(done) {
		assessmentsPage.fetchCurrentDate(browser).then(function(textOfDate) {
			currentDateText = parseInt(textOfDate);
			beforeCurrentDateText = parseInt(textOfDate) - 1;
			afterCurrentDateText = parseInt(textOfDate) + 1;
			console.log(afterCurrentDateText);
			assessmentsPage.getBackGrndColorOfBeforeCurrentDate(browser).then(function(url) {
				console.log(url);
				if (url.indexOf("/images/crossout-magenta.e1232443.svg") > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("background image of before current date in the calendar under assignment panel", url, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("background image of before current date in the calendar under assignment panel", url, "failure") +
						report.reportFooter());
				}
			});
		});
	});

	it(". Validate that user should not be able to click date after the due date in the reveal date calendar under create assignment panel", function(done) {
		if (process.env.RUN_IN_PLATFORM.toString() === "\"mobile\"") {
			this.skip();
		} else {
			// assessmentsPage.clickOnRevealDatecalendar(browser).then(function (text) {
			assessmentsPage.clickOnRevealDatecalendar(browser).then(function() {
				assessmentsPage.getBackGrndColorOfAfterDueDate(browser).then(function(url) {
					if (url.indexOf("/images/crossout-magenta.e1232443.svg") > -1) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("background image after the due date in the reveal date calendar  under assignment panel", url, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("background image after the due date in the reveal date calendar under assignment panel", url, "failure") +
							report.reportFooter());
					}
				});
			});
		}
	});

	it(". Validate that user should not be able to click date before the due date in the reveal date calendar under assignment panel", function(done) {
		assessmentsPage.getBackGrndColorOfBeforeDueDate(browser).then(function(backgrndcolor) {
			assessmentsPage.clickOnTodayDate(browser).then(function() {
				if (backgrndcolor.indexOf("rgb(234, 234, 234)") > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Background color before the due date in the reveal date calendar  under assignment panel", backgrndcolor, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Background color before the due date in the reveal date calendar under assignment panel", backgrndcolor, "failure") +
						report.reportFooter());
				}
			});
		});
	});

	it(". Validate the left count increases as user hits the spaces in the middle of the characters.", function(done) {
		assessmentsPage.enterNameIncludingSpaces(browser).then(function() {
			assessmentsPage.leftCountFromAssignmentTextBox(browser).then(function(countLeftAfterSpacing) {
				if (countLeftAfterSpacing === testData.assignmentDetails.assignmentTextBoxDtails.assignmentNameWithSpaceleftCount) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Count is not decreasing when user enter spaces under assignment name text box", countLeftAfterSpacing, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Count is not decreasing when user enter spaces under assignment name text box", countLeftAfterSpacing, "failure") +
						report.reportFooter());

				}
			});
		});
	});

	it(". Validate the default selected attempt, average score and lowest score checkbox is disabled under assignment panel ", function(done) {
		assessmentsPage.checkByDefaultSelectedAttempt(browser).text().then(function(defaultSelectedAttemptText) {
			assessmentsPage.averageScoreCheckboxdefaultStatus(browser).getAttribute('aria-disabled').then(function(defaultStatusOfAverageScore) {
				assessmentsPage.dropLowestScoreCheckboxdefaultStatus(browser).getAttribute('aria-disabled').then(function(defaultStatusOfdropLowestScore) {
					if (defaultSelectedAttemptText === assessmentData.systemgenerated.scorestrategyhigh.defaultselectedAttempt && defaultStatusOfAverageScore === "true" && defaultStatusOfdropLowestScore === "true") {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Default selected attempt displayed as", defaultSelectedAttemptText, "averagescore checkbox status is", defaultStatusOfAverageScore, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Default selected attempt displayed as", defaultSelectedAttemptText, "averagescore checkbox status is", defaultStatusOfAverageScore, "failure") +
							report.reportFooter());
					}
				});
			});
		});
	});

	it(". Validate the high score checkbox should be selected by default and validate validate user should not be able to select 'drop lowest' untill the average score is selected", function(done) {
		assessmentsPage.highscoreCheckboxByDefaultSelected(browser).getAttribute('aria-disabled').then(function(defaultSelectedHighScore) {
			assessmentsPage.dropLowestScoreCheckboxdefaultStatus(browser).getAttribute('aria-disabled').then(function(defaultStatusOfdropLowestScore) {
				if (defaultSelectedHighScore === "true" && defaultStatusOfdropLowestScore === "true") {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Default selected drop lowest score checkbox status is", defaultStatusOfdropLowestScore, "success") +
						report.reportFooter());
					assessmentsPage.selectAttempts(browser, assessmentData.systemgenerated.scorestrategyhigh.attempts).then(function() {
						assignmentAvgScore.selectAvgScore(browser).then(function() {
							assessmentsPage.dropLowestScoreCheckboxstatus(browser).getAttribute('aria-disabled').then(function(statusOfdropLowestScore) {
								if (statusOfdropLowestScore === "false") {
									console.log(report.reportHeader() +
										report.stepStatusWithData("On selecting avg score then drop lowest checkbox status is", statusOfdropLowestScore, "success") +
										report.reportFooter());
									done();
								} else {
									console.log(report.reportHeader() +
										report.stepStatusWithData("On selecting avg score then drop lowest checkbox status is", statusOfdropLowestScore, "failure") +
										report.reportFooter());
								}
							});
						});
					});
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Default selected drop lowest score checkbox status is", defaultStatusOfdropLowestScore, "failure") +
						report.reportFooter());
				}
			});
		});
	});


	// automated issue LTR-4007
	it(". Complete the CFM Assessment form for system created assignment and validate question tab is disabled if user enter the zero value in 'Possible Score'", function(done) {
		assessmentsPage.enterRevealDate(browser).then(function() {
			assessmentsPage.selectChapter(browser, assessmentData.systemgenerated.scorestrategyhigh.chapter).then(function() {
				assessmentsPage.enterScore(browser, 0).then(function() {
					assessmentsPage.questionBtnDisabled(browser).then(function(nextBtnStatus) {
						if (nextBtnStatus) {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Question button is disabled if user enter the zero value in 'Possible Score'", nextBtnStatus, "success") +
								report.reportFooter());
							done();
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Question button is disabled if user enter the zero value in 'Possible Score'", nextBtnStatus, "failure") +
								report.reportFooter());
						}
					});
				});
			});
		});
	});

	it(". Enter valid 'Possible Score' and attempt", function(done) {
		assessmentsPage.selectAttempts(browser, assessmentData.systemgenerated.scorestrategyhigh.editedAttempts).then(function() {
			assessmentsPage.enterScore(browser, assessmentData.systemgenerated.scorestrategyhigh.score).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Attempt  " +
						assessmentData.systemgenerated.scorestrategyhigh.editedAttempts + ", and score ",
						assessmentData.systemgenerated.scorestrategyhigh.score, "success") +
					report.reportFooter());
				done();
			});
		});
	});

	it(". Validate the average score checkbox should be enabled after selecting attempts more than 1 under create assignment panel ", function(done) {
		assessmentsPage.averageScroreButtonStatus(browser).getAttribute('aria-disabled').then(function(statusOfAverageScore) {
			if (statusOfAverageScore === "false") {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Default selected attempt displayed as", statusOfAverageScore, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Default selected attempt displayed as", statusOfAverageScore, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Select score strategy and questions for system created assignment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.selectScoreStrategy(browser, assessmentData.systemgenerated.scorestrategyhigh.scoreStrategy).then(function() {
			assessmentsPage.selectQuestionStrategy(browser, assessmentData.systemgenerated.QuestionStrategy.option[0]).then(function() {
				assessmentsPage.enterQuestionsPerStudent(browser, assessmentData.systemgenerated.scorestrategyhigh.questions).then(function() {
					assessmentsPage.verifySettingButton(browser).then(function() {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Score stategy  " +
								assessmentData.systemgenerated.scorestrategyhigh.scoreStrategy + ", Question strategy " +
								assessmentData.systemgenerated.QuestionStrategy.option[0] + ", Total Questions ",
								assessmentData.systemgenerated.scorestrategyhigh.questions, "success") +
							report.reportFooter());
						takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Completed the assignment form");
					});
				});
			});
		});
	});

	it(". Validate question button should be displayed on preview page", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.clickOnPreviewButtonUnderQuestionTab(browser).then(function() {
			assessmentsPage.verifyQuestionsButton(browser).then(function() {
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Completed the assignment form");
			});
		});
	});

	it(". Save the CFM type assessment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});

	it(". Validate the Assignment name gets saved without contains any spaces when user save the assignment with spaces at the leading position.", function(done) {
		assessmentsPage.getTextRecentlyCreatedAssignment(browser).text().then(function(assignmentNameText) {
			if (assignmentNameText === testData.assignmentDetails.assignmentTextBoxDtails.assignmentName) {
				assignmentCreationStatus = "success";
				console.log(report.reportHeader() +
					report.stepStatusWithData(" Assignment name do not contains the spaces when user hits spaces at the leading position", assignmentNameText, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData(" Assignment name do not contains the spaces when user hits spaces at the leading position", assignmentNameText, "failure") +
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

	it(". Navigate on instructor's GradeBook page", function(done) {
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". LTR-5350 :: Validate the assignment count with 'Assignments' text should be present below export button", function(done) {
		assessmentsPage.getAssignmentTextBelowExport(browser).text().then(function(assignmentNameTextBelowExport) {
			if (assignmentNameTextBelowExport === assessmentData.systemgenerated.scorestrategyhigh.assignmentTextBelowExportButton) {
				console.log(report.reportHeader() +
					report.stepStatusWithData(" assignment count with '" + assessmentData.systemgenerated.scorestrategyhigh.assignmentTextBelowExportButton + "' text is present below export button", assignmentNameTextBelowExport, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData(" assignment count with '" + assessmentData.systemgenerated.scorestrategyhigh.assignmentTextBelowExportButton + "' text is present below export button", assignmentNameTextBelowExport, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate Override textbox should be disabled for Assignment score", function(done) {
		instructorMainGradebookView.overrideTheScoreDisableStatus(browser).then(function(overrideStatus) {
			console.log(overrideStatus);
			if (overrideStatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Override box disabled before due date not passed ", overrideStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log("in else" + overrideStatus);
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Override box disabled before due date not passed ", overrideStatus, "failure") +
					report.reportFooter());
			}
		});
	});


	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
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
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		userType = "student";
		data = loginPage.setLoginData(userType);
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

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Click on the current date cell", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickCurrentDateCell(browser, done);
	});

	it(". Validate assignment detailed panel expanded", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.validateDetailedPanelClass(browser).then(function(panelAttribute) {
			if (panelAttribute === "assignment-details") {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment detailed panel is expanded with contains class name", panelAttribute, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment detailed panel is expanded with contains class name", panelAttribute, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Click on close button", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickOnCloseButton(browser).then(function(browser) {
			done();
		});
	});

	it(". Validate detailed panel is closed", function(done) {
		pageLoadingTime = 0;
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		studentAssessmentsPage.validateDetailedPanelClosed(browser).then(function(status) {
			if (status) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment detailed panel is expanded with status", status, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment detailed panel is expanded with status", status, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Click on the current date cell", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickCurrentDateCell(browser, done);
	});

	it(". Launch the CFM assessment type assignment for taking first attempt", function(done) {
		pageLoadingTime = 0;
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}

		studentAssessmentsPage.launchAssignment(browser, testData.assignmentDetails.assignmentTextBoxDtails.assignmentNameWithSpaces).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is launched");
		});
	});

	it(". LTR-5399 :: Verify error message should not be displayed on assessment launch and also validate Continue button should be appear on launched assessment page", function(done) {
		pageLoadingTime = 0;
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		studentAssessmentsPage.validateErrorStatusOnPage(browser).then(function(statusOfErrorPresence) {
			console.log("statusOfErrorPresence" + statusOfErrorPresence);
			if (statusOfErrorPresence) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5399 :: Error is displaying on the page", statusOfErrorPresence, "failure") +
					report.reportFooter());
				studentAssessmentsPage.getErrorMessage(browser).then(function(errorMessageText) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("LTR-5399:: Displayed error message test is ", errorMessageText, "failure") +
						report.reportFooter());
				});
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5399:: Error message is not displaying on the page on assessment launch", statusOfErrorPresence, "success") +
					report.reportFooter());
				studentAssessmentsPage.submitButtonPresenceStatus(browser).then(function(statusOfSubmitButtonPresence) {
					if (statusOfSubmitButtonPresence) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("LTR-5399:: Submit button presence status on the page ", statusOfSubmitButtonPresence, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Submit button presence status on the page ", statusOfSubmitButtonPresence, "success") +
							report.reportFooter());
					}
				});
			}
		});
	});

	it(". Complete the CFM assessment type assignment ", function(done) {
		pageLoadingTime = 0;
		//Call this function if you want a specific block to timeout after a specific time interval
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("quiz"));
			takeQuizpo.takeQuiz(browser, done);
		}

	});

	it(". Fetch correct questions from assessment results page", function(done) {
		casPage.getQuestionsCorrect(browser).then(function(questionsCorrect) {
			console.log("Total Questions Correct " + questionsCorrect);
			questionsCorrectFromCAS = questionsCorrect;
			console.log("Total Assignment Questions " + assessmentsPage.getMaxAssignmentQuestions());
			studentAssignmentCompletionStatus = "success";
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS : Student Completed the assignment with questions " + assessmentsPage.getMaxAssignmentQuestions() + " and got a score of  ", questionsCorrect, "success") +
				report.reportFooter());
			done();
		});
	});

	it(". Click on exit button", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.clickExitButtonOnResultsPage(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is attempted");
		});
	});

	it(". Refresh the assignment result page", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment result page is loaded");
			});
	});

	it(". Navigate to Gradebook page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". [Student Gradebook] :: Validate the Points earned by the student", function(done) {
		this.retries(3);
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		console.log("assessmentsPage.getRoboPointScore(questionsCorrectFromCAS)" + assessmentsPage.getRoboPointScore(questionsCorrectFromCAS));
		studenGradebookPage.getScoredPoints(browser, testData.assignmentDetails.assignmentTextBoxDtails.assignmentNameWithSpaces).then(function(valueScore) {
			if (valueScore.toString() === assessmentsPage.getRoboPointScore(questionsCorrectFromCAS)) {
				pointsFromStudentGradebook = valueScore;
				console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + valueScore + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "success") + report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + valueScore + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "failure") + report.reportFooter());
			}
		});
	});

	it(". Validate the presence of Class average value on student GradeBook", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.validateAvgScoreOnStudentGradebook(browser, testData.assignmentDetails.assignmentTextBoxDtails.assignmentNameWithSpaces, pointsFromStudentGradebook, done);
	});

	it(". Log out as Student", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
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
		loginPage.launchACourse(userType, courseName, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate on Gradebook page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userType = "instructor";
		menuPage.selectGradebook("instructor", browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
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

	it(". Refresh the page and wait until page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Validate presence of class average value on student detailed page on instructor gradebook view ", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		var astNameOnGradebook = testData.assignmentDetails.assignmentTextBoxDtails.assignmentNameWithSpaces + "   trailing"
		this.retries(3);
		browser.sleep(5000);
		instructorGradebookStudentDetailedPage.validatePresenceOfAverageScore(browser, astNameOnGradebook).then(function(classAvg) {
			console.log("parseInt(classAvg)" + parseInt(classAvg));
			if (parseInt(classAvg) == assessmentsPage.getRoboPointScore(questionsCorrectFromCAS)) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment on student detailed GradeBook view ::  " + classAvg, "is compared against the calculated class average ::" + assessmentsPage.getRoboPointScore(questionsCorrectFromCAS), "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment on student detailed GradeBook view ::  " + classAvg, "is compared against the calculated class average ::" + assessmentsPage.getRoboPointScore(questionsCorrectFromCAS), "failure") +
					report.reportFooter());
			}

		});
	});

	it(". [Gradebook] Verify whether the system generated student point score is updated on Instructor Gradebook on the Student Detailed Results Page", function(done) {

		this.retries(3);
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.getScoredPoints(browser, testData.assignmentDetails.assignmentTextBoxDtails.assignmentNameWithSpaces)
			.then(function(scoredPoints) {
				if (scoredPoints.toString() === assessmentsPage.getRoboPointScore(questionsCorrectFromCAS).toString()) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + assessmentsPage.getRoboPointScore(questionsCorrectFromCAS) + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + assessmentsPage.getRoboPointScore(questionsCorrectFromCAS) + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "failure") +
						report.reportFooter());
				}
			});
	});

	it(". Navigate to instructor Assignments page", function(done) {
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

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Close flash on assignment page", function(done) {
		calendarNavigation.handleTheFlashAlert(browser).then(function() {
			done();
		});
	});

	it(". Select current date and open Reading Assignments page", function(done) {
		calendarNavigation.selectADateForAssignment(browser)
			.then(function() {
				calendarNavigation.selectChapterReadingAssessment(browser, done);
			});
	});

	it(". Validate the save button remains disabled as user hits the spaces in the assignment name text box", function(done) {
		chapterReadingAssignmentPage.enterSpaceOnAssignmentNameTextBox(browser).then(function() {
			chapterReadingAssignmentPage.saveBtnDisabled(browser).getAttribute('aria-disabled').then(function(statusOfSaveButton) {
				chapterReadingAssignmentPage.clickOnCancel(browser).then(function() {
					if (statusOfSaveButton === "true") {
						console.log(report.reportHeader() +
							report.stepStatusWithData("save button disabled as user hits the spaces in the assignment name text box", statusOfSaveButton, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("save button enabled as user hits the spaces in the assignment name text box", statusOfSaveButton, "failure") +
							report.reportFooter());

					}
				});
			});
		});
	});

	it(". Select current date and open Reading Assignments page", function(done) {
		calendarNavigation.selectADateForAssignment(browser)
			.then(function() {
				calendarNavigation.selectChapterReadingAssessment(browser, done);
			});
	});

	it(". Validate star is present if no chapter is selected and disappears once chapter is selected for reading assignments", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		chapterReadingAssignmentPage.enterName(browser).then(function() {
			chapterReadingAssignmentPage.enterRevealDate(browser).then(function() {
				chapterReadingAssignmentPage.checkIfStarIsPresntBeforeChapterSeleted(browser).text().then(function(starText) {
					chapterReadingAssignmentPage.selectAChapter(browser, productData.chapter.topic.documents.assignments[0].reading[0].chapter).then(function() {
						chapterReadingAssignmentPage.checkIfStarIsNotPresntAfterChapterSeleted(browser).then(function(status) {
							if (status) {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Star disappears when user selects an chapter, status of star is", status, "success") +
									report.reportFooter());
								if (starText === "*") {
									console.log(report.reportHeader() +
										report.stepStatusWithData("Star disappears when user selects an chapter, status of star is", starText, "success") +
										report.reportFooter());
									done();
								} else {
									console.log(report.reportHeader() +
										report.stepStatusWithData("Star is present if no chapter is selcted", starText, "failure") +
										report.reportFooter());
								}
							} else {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Star is not dissapearing when user selects an chapter, status of star is", status, "failure") +
									report.reportFooter());
							}
						});
					});
				});
			});
		});
	});

	it(". Save the Chapter Content assignment and verify that Chapter Content assignment gets saved successfully", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		var assignmentCGITime = 0;
		chapterReadingAssignmentPage.saveAssignment(browser).then(function() {
			function polling() {
				chapterReadingAssignmentPage.checkIfAssignmentSaved(browser).then(function(value) {
					if (value.toString() === "rgb(0, 0, 0)") {
						browser.sleep(2000);
						assignmentCGITime = assignmentCGITime + 2000;
						polling();
					} else {
						if (value.toString() === "rgb(236, 41, 142)") {
							var timeTaken = assignmentCGITime / 1000;
							console.log(report.reportHeader() +
								report.stepStatusWithData("Instructor created an Chapter Reading type assignment called :: " + chapterReadingAssignmentPage.getAssignmentName() + " takes time in CGI ", timeTaken + "seconds", "success") +
								report.reportFooter());
							done();
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Instructor created an Chapter Reading type assignment called :: ", chapterReadingAssignmentPage.getAssignmentName() + " is not created successfully", "failure") +
								report.reportFooter());
						}
					}
				});
			}

			polling();
		});
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Navigate to Assignments page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Wait for page load", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Navigate to the next month from instructor assignment calendar page", function(done) {
		calendarNavigation.navigateToNextMonth(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});


	it(". Click on '+' button of second date of next month", function(done) {
		calendarNavigation.selectSecondDateFormNextMonth(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Select Assessment Type assignment settings page", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.selectAssessmentTypeAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assessment type assignment is selected");
		});
	});

	it(". Complete the CFM Assessment form for system created assignment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.enterName(browser).then(function() {
			assessmentsPage.enterRevealDateNextMonth2ndDate(browser).then(function() {
				assessmentsPage.selectChapter(browser, assessmentData.systemgenerated.scorestrategyhigh.chapter).then(function() {
					assessmentsPage.enterScore(browser, assessmentData.systemgenerated.scorestrategyhigh.score).then(function() {
						assessmentsPage.selectAttempts(browser, assessmentData.systemgenerated.scorestrategyhigh.editedAttempts).then(function() {
							assessmentsPage.selectScoreStrategy(browser, assessmentData.systemgenerated.scorestrategyhigh.scoreStrategy).then(function() {
								assessmentsPage.selectQuestionStrategy(browser, assessmentData.systemgenerated.QuestionStrategy.option[0]).then(function() {
									assessmentsPage.enterQuestionsPerStudent(browser, assessmentData.systemgenerated.scorestrategyhigh.questions).then(function() {
										console.log(report.reportHeader() +
											report.stepStatusWithData("Assessment form has been filled by chapter :" +
												assessmentData.systemgenerated.scorestrategyhigh.chapter + ", Score :" +
												assessmentData.systemgenerated.scorestrategyhigh.score + ", Number Of Attempts :" +
												assessmentData.systemgenerated.scorestrategyhigh.editedAttempts + ", Question Strategy :" +
												assessmentData.systemgenerated.QuestionStrategy.option[0] + ", Score Strategy : High(" +
												assessmentData.systemgenerated.scorestrategyhigh.scoreStrategy + "), Question Per Student :",
												assessmentData.systemgenerated.scorestrategyhigh.questions, "success") +
											report.reportFooter());
										takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Completed the assignment form");
									});
								});
							});
						});
					});
				});
			});
		});
	});

	it(". Save the CFM assessment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});

	it(". Verify if the CFM assessment type assignment gets saved successfully", function(done) {
		assessmentsPage.checkIfAssignmentSavedOnFuture2ndDate(browser, assessmentsPage.getAssignmentName()).then(function(value) {
			if (value.toString() === "rgb(255, 219, 238)") {
				assignmentCreationStatus = "success";
				console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName(), "success") + report.reportFooter());
				done();
			} else {
				assignmentCreationStatus = "failure";
				console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName() + " may not have received the assessmentCGI", "failure") + report.reportFooter());
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
	it(". Navigate to the next month", function(done) {
		calendarNavigation.navigateToNextMonth(browser).then(function() {
			done();
		});
	});

	if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString()) === "safari") {
		console.log("drag and drop on safari browser is not implemented yet");
	} else {

		it(". Drag the assignment to the next date", function(done) {
			var astPath = "//div[@class='day ng-scope']/span/span[@class='number ng-binding' and (text()='{{}}')]//parent::span//following-sibling::div[contains(@class,'event')]";
			var astOnfirstdate = stringutil.returnreplacedstring(astPath, "{{}}", assessmentData.dragndrop.fromDate);
			var astpathonsecond = "//div[@class='day ng-scope']/span/span[@class='number ng-binding' and (text()='{{}}')]/parent::span//parent::div";
			var astOnseconddate = stringutil.returnreplacedstring(astpathonsecond, "{{}}", assessmentData.dragndrop.toDate);
			assessmentsPage.checkIfAssignmentSavedOnFuture2ndDate(browser, assessmentsPage.getAssignmentName()).then(function(value) {
				pageLoadingTime = 0;
				console.log(value.toString());
				if (value.toString() === "rgb(255, 219, 238)") {
					assessmentsPage.dragAssignmentOnCalenderView(browser, astOnfirstdate, astOnseconddate, done);
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Instructor created an Chapter Reading type assignment called :: ROBO is not CGI successfully", "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Verify popup for changing the reveal date(when assessment will display on Student calendar) should be present ", function(done) {
			assessmentsPage.revealInStudentPopup(browser).then(function(statusOfPopup) {
				if (statusOfPopup) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("popup for changing the reveal date(when assessment will display on Student calendar) is present", statusOfPopup, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("popup for changing the reveal date(when assessment will display on Student calendar) is not present", statusOfPopup, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Verify the text on popup window which has appeared for changing the reveal date", function(done) {
			assessmentsPage.getTextOnrevealInStudentPopup(browser).text().then(function(textOfPopup) {
				if (textOfPopup.indexOf(assessmentData.dragndrop.revealPanelText1) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Text on popup window which has appeared for changing the reveal date", textOfPopup, "success") +
						report.reportFooter());
					assessmentsPage.getTextOnrevealInStudentCalendar(browser).text().then(function(textOfPopup2) {
						if (textOfPopup2.indexOf(assessmentData.dragndrop.revealPanelText2) > -1) {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Another text on popup window which has appeared for changing the reveal date ", textOfPopup2, "success") +
								report.reportFooter());
							done();
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Another on popup window which has appeared for changing the reveal date ", textOfPopup2, "failure") +
								report.reportFooter());
						}
					});
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Text on popup window which has appeared for changing the reveal date ", textOfPopup, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Verify Done button is disabled before selecting the reveal date and gets enabled once the reveal date is selected", function(done) {
			assessmentsPage.doneButtonStatus(browser).then(function(statusOfDoneButtone) {
				if (statusOfDoneButtone == "true") {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Done button disable status without select reveal date", statusOfDoneButtone, "success") +
						report.reportFooter());
					assessmentsPage.clickOnCalendar(browser).then(function() {
						assessmentsPage.selectRevealDate(browser).then(function() {
							assessmentsPage.doneButtonStatus(browser).then(function(doneButtonStatusAfterSelectRevealDate) {
								console.log(doneButtonStatusAfterSelectRevealDate);
								if (doneButtonStatusAfterSelectRevealDate != "true") {
									console.log(report.reportHeader() +
										report.stepStatusWithData("Done button enable status after select reveal date", !doneButtonStatusAfterSelectRevealDate, "success") +
										report.reportFooter());
									done();
								} else {
									console.log(report.reportHeader() +
										report.stepStatusWithData("Done button enable status after select reveal date", !doneButtonStatusAfterSelectRevealDate, "failure") +
										report.reportFooter());
								}
							});
						});
					});
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Done button disable status without selecting reveal date", statusOfDoneButtone, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Click on done button for changing the reveal date", function(done) {
			assessmentsPage.clickOnDoneButton(browser).then(function(browser) {
				done();
			})
		});

		it(". Wait for page load", function(done) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});

		it(". Verify assignment gets displayed on 1st date of next month after drag", function(done) {
			assessmentsPage.checkIfAssignmentSavedOnFutureDate(browser).then(function(value) {
				if (value.toString() === "rgb(236, 41, 142)") {
					assignmentCreationStatus = "success";
					console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName(), "success") + report.reportFooter());
					done();
				} else {
					assignmentCreationStatus = "failure";
					console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName() + " may not have received the assessmentCGI", "failure") + report.reportFooter());

				}

			});
		});

	}

	it(". Refresh the page and wait for page load", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Delete the created assignment", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		assessmentsPage.deleteAssignment(browser, done);
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
