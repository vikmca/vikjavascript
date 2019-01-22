require('colors');
var wd = require('wd');
var _ = require('underscore');
var asserters = wd.asserters;
var fs = require('fs');
var csv = require('fast-csv');
var chaiAsPromised = require("chai-as-promised");
var path = require('path');
var dataUtil = require("../../../util/date-utility");
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo");
var menuPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var calendarNavigation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/navigationpo");
var assessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assessmentspo");
var assignmentAvgScore = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assesmentspoforAvgScore");
var studentAssessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var casPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var mainGradebookView = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/mainGradebookView");
var assessmentData = require("../../../../../test_data/assignments/assessments.json");
var managemydocspo = require("../../..//support/pageobject/" + pageobject + "/" + envName + "/managemydocspo");
var session = require("../../../support/setup/browser-session");
var testData = require("../../../../../test_data/data.json");
var courseHelper = require("../../../support/helpers/courseHelper");
var report = require("../../../support/reporting/reportgenerator");
var mathutil = require("../../../util/mathUtil");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'CCS/CAS/GRADEBOOK :: ASSIGNMENT GRADEBOOK REPORT VALIDATION', function() {
	var browser;
	var allPassed = true;
	var userType;
	var setDate;
	var courseName;
	var studentAssignmentCompletionStatus = "failure";
	var assignmentCreationStatus = "failure";
	var product;
	var scoreFromStudentGradebook;
	var pointsFromStudentGradebook;
	var totalPointsGainedByStudent;
	var totalsudentcount;
	var questionsCorrect1stattemptFromCAS;
	var questionsCorrect2ndattemptFromCAS;
	var questionsCorrect3rdattemptFromCAS;
	var exportedFile;
	var totalTime;
	var data;
	var temp;
	var FileText = [];
	var productData;
	var x;
	var userName;
	var filename;
	var downloadedFile;
	var productNameInDownloadedFile;
	var productNameAfterSplit;
	var serialNumber = 0;

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
		productData = loginPage.getProductData();
		totalTime = 0;
		//Reports
		console.log(report.formatTestName("CCS/CAS/GRADEBOOK :: ASSIGNMENT GRADEBOOK REPORT VALIDATION"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***validateExportFeature.js***"));
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

	it(". Login to 4LTR Platform", function(done) {
		productNameInDownloadedFile = product.toLowerCase();
		productNameAfterSplit = productNameInDownloadedFile.split("4")[0];
		userName = process.env.USERNAME;
		filename = dataUtil.getDateFormatForExport();
		console.log("Going to delete an existing file for user name " + userName);
		exportedFile = 'C:/Users/' + userName + '/Downloads/Gradebook_export_' + filename + '.csv';
		// downloadedFile = 'C:/Users/'+userName+'/Downloads/*'+productNameAfterSplit+'*.ppt';
		downloadedFile = 'C:/Users/' + userName + '/Downloads/mktg8_wwtbam_ch_01.ppt';
		fs.exists(exportedFile, function(exists) {
			if (exists) {
				fs.unlink(exportedFile, function(err) {
					if (err) {
						return console.error(err);
					}
					console.log("File deleted successfully!");
				});
			} else {
				console.log("No file to delete!");
			}
		});
		fs.exists(downloadedFile, function(exists) {
			if (exists) {
				fs.unlink(downloadedFile, function(err) {
					if (err) {
						return console.error(err);
					}
					console.log("File deleted successfully!");
				});
			} else {
				console.log("No file to delete!");
			}
		});
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

	it(". Navigate on GradeBook page", function(done) {
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Retrieve count of registered student for the launched course", function(done) {
		mainGradebookView.getStudentCount(browser).then(function(studentCounts) {
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

	it(". Navigate to Assignments Page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Delete all past assignments", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		assessmentsPage.deleteAssignment(browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Close flash on assignment page", function(done) {
		calendarNavigation.handleTheFlashAlert(browser).then(function() {
			done();
		});
	});

	it(". Select current date and open the Assessment Type assignment settings page", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.selectADateForAssignment(browser).then(function() {
			calendarNavigation.selectAssessmentTypeAssignment(browser).then(function() {
				pollingPageLoad(pageLoadingTime, browser, done, "Assessment type assignment is selected");
			});
		});
	});

	it(". Complete the Assessment form for system created assignment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.enterName(browser).then(function() {
			assessmentsPage.enterRevealDate(browser).then(function() {
				assessmentsPage.selectChapter(browser, assessmentData.systemgenerated.scorestrategyhigh.chapter).then(function() {
					assessmentsPage.enterScore(browser, assessmentData.systemgenerated.scorestrategyhigh.score).then(function() {
						assessmentsPage.selectAttempts(browser, assessmentData.systemgenerated.scorestrategyhigh.attempts).then(function() {
							assignmentAvgScore.selectAvgScore(browser).then(function() {
								assessmentsPage.selectQuestionStrategy(browser, assessmentData.systemgenerated.QuestionStrategy.option[0]).then(function() {
									assessmentsPage.enterQuestionsPerStudent(browser, assessmentData.systemgenerated.scorestrategyhigh.questions).then(function() {
										pollingPageLoad(pageLoadingTime, browser, done, "Completed the assignment form");
									});
								});
							});
						});
					});
				});
			});
		});
	});

	it(". Save the assessment and verify if its saved successfully", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		assessmentsPage.saveAssignment(browser).then(function() {
			assessmentsPage.checkIfAssignmentSaved(browser).then(function(value) {
				if (value.toString() === "rgb(236, 41, 142)") {

					assignmentCreationStatus = "success";
					console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName(), "success") + report.reportFooter());
					done();
				} else {
					assignmentCreationStatus = "failure";
					console.log(report.reportHeader() +
						report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName() + " may not have received the assessmentCGI", "failure") +
						report.reportFooter());
				}
			});
		});
	});

	it(". Log out as Instructor", function(done) {
		userSignOut.userSignOut(browser, done);
	});

	it(". Login as student", function(done) {
		userType = "student";
		data = loginPage.setLoginData(userType);
		//Reports
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Course and launch", function(done) {
		loginPage.launchACourse(userType, courseName, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate to Assignments page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Click on the current date cell", function(done) {
		studentAssessmentsPage.clickOnCurrentDateCell(browser).then(function() {
			done();
		})
	});

	it(". Launch the assignment for the first time", function(done) {
		studentAssessmentsPage.launchAssignment(browser, assessmentsPage.getAssignmentName()).then(function() {
			done();
		});
	});

	it(". LTR-5399 :: Verify error message should not be displayed on assessment launch and also validate Continue button should be appear on launched assessment page", function(done) {
		pageLoadingTime = 0;
		studentAssessmentsPage.validateErrorStatusOnPage(browser).then(function(statusOfErrorPresence) {
			console.log("statusOfErrorPresence"+statusOfErrorPresence);
			if(statusOfErrorPresence){
				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5399 :: Error is displaying on the page",statusOfErrorPresence, "failure") +
					report.reportFooter());
					studentAssessmentsPage.getErrorMessage(browser).then(function(errorMessageText) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("LTR-5399:: Displayed error message test is ",errorMessageText, "failure") +
							report.reportFooter());
					});
			}else{
				console.log(report.reportHeader() +
					report.stepStatusWithData("LTR-5399:: Error message is not displaying on the page on assessment launch",statusOfErrorPresence, "success") +
					report.reportFooter());
					studentAssessmentsPage.submitButtonPresenceStatus(browser).then(function(statusOfSubmitButtonPresence) {
						if(statusOfSubmitButtonPresence){
							console.log(report.reportHeader() +
								report.stepStatusWithData("LTR-5399:: Submit button presence status on the page ",statusOfSubmitButtonPresence, "success") +
								report.reportFooter());
							done();
						}else{
							console.log(report.reportHeader() +
								report.stepStatusWithData("Submit button presence status on the page ",statusOfSubmitButtonPresence, "success") +
								report.reportFooter());
						}
					});
			}
			});
	});

	it(". Complete the assignment and exit", function(done) {
		//Call this function if you want a specific block to timeout after a specific time interval
		this.timeout(courseHelper.getElevatedTimeout("quiz"));
		browser
			.sleep(10000)
			.elementByCssSelectorWhenReady("span.cas-text", 10000)
			.isDisplayed()
			.should.become(true)
			.execute('return document.getElementsByClassName("cas-activity-series").length').then(function(len) {
				countOfQuestions = len;
				completedQuestions = 0;

				function selectAnAnswerAndProceed() {
					if (countOfQuestions > 0) {
						countOfQuestions--;
						completedQuestions++;
						browser.execute('return document.getElementsByClassName("cas-task")[0].getElementsByClassName("cas-truefalse").length').then(function(length) {
							if (length.toString() === "0") {
								browser.execute('return document.getElementsByClassName("cas-task")[0].getElementsByClassName("cas-multiple-choice")[0].tagName').then(function(tag) {
									if (tag === "DIV") {
										browser
											.waitForElementByXPath("(//label[@class='cas-choice-radio'])[" + mathutil.getRandomInt(1, 5) + "]", asserters.isDisplayed, 3000).click()
											.elementByCssSelectorWhenReady("button.btn.btn-default.cas-activity-action", 3000).click();
										console.log("Answered a Question with Radio Button " + completedQuestions + " and remaining Questions " + countOfQuestions);
									} else {
										browser
											.waitForElementByCss("div.cas-selection-list-item", asserters.isDisplayed, 4000)
											.click()
											.waitForElementByCss("ul li:nth-of-type(" + mathutil.getRandomInt(1, 4) + ") a span.cas-text", asserters.isDisplayed, 10000)
											.click()
											.elementByCssSelectorWhenReady("button.btn.btn-default.cas-activity-action", 3000).click();
										console.log("Answered a Question with a Drop down " + completedQuestions + " and remaining Questions " + countOfQuestions);
									}
									setTimeout(selectAnAnswerAndProceed, 5000);
								});
							} else {
								browser.execute('return document.getElementsByClassName("cas-task")[0].getElementsByClassName("cas-truefalse")[0].tagName').then(function(tag) {
									if (tag === "DIV") {
										browser
											.waitForElementByXPath("(//div[@class='cas-choice-item'])[" + mathutil.getRandomInt(1, 3) + "]/label", asserters.isDisplayed, 3000).click()
											.elementByCssSelectorWhenReady("button.btn.btn-default.cas-activity-action", 3000).click();
										console.log("Answered a True or False Question " + completedQuestions + " and remaining Questions " + countOfQuestions);
									} else {
										console.log("Problem in answering T/F");
									}
									setTimeout(selectAnAnswerAndProceed, 5000);
								});
							}
						});
					} else {
						if (completedQuestions == len) {
							console.log("All Questions successfully attempted");
							browser
								.waitForElementByCss(".exit.ng-scope", asserters.isDisplayed, 3000)
								.then(function(el) {
									casPage.getQuestionsCorrect(browser).then(function(questionsCorrect) {
										questionsCorrect1stattemptFromCAS = questionsCorrect;
										console.log("Total Questions Correct " + questionsCorrect);
										console.log("Total Assignment Questions " + assessmentsPage.getMaxAssignmentQuestions());
										studentAssignmentCompletionStatus = "success";
										console.log(report.reportHeader() +
											report.stepStatusWithData("CAS : Student Completed the 1st attempt of assignment with questions " + assessmentsPage.getMaxAssignmentQuestions() + " and got a score of  ", questionsCorrect, "success") +
											report.reportFooter());
										el.click().then(function() {
											done();
										});
									});
								});
						} else {
							studentAssignmentCompletionStatus = "failure";
							console.log(report.reportHeader() +
								report.stepStatusWithData("Student Assignment completion status ", studentAssignmentCompletionStatus, "failure") +
								report.reportFooter());
							// done();
						}
					}
				}
				//Function to answer all the Questions
				selectAnAnswerAndProceed();
			});
	});

	it(". Click on the current date cell", function(done) {
		studentAssessmentsPage.clickOnCurrentDateCell(browser).then(function() {
			done();
		});
	});

	it(". Log out as Student", function(done) {
		userSignOut.userSignOut(browser, done);
	});

	it(". Login as Instructor", function(done) {
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

	it(". Navigate on GradeBook page", function(done) {
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Download the grade csv file", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		browser
			.sleep(8000)
			.waitForElementByCss('#download-grades-button', asserters.isDisplayed, 20000)
			.doubleclick()
			.then(function() {
				browser
					.sleep(15000)
					.nodeify(done);;
			});
	});

	it(' Read the file content and store within an array', function(done) {
		x = 0;
		fs.createReadStream(exportedFile)
			.pipe(csv())
			.on('data', function(initialData) {
				data = initialData;
				temp = data;
				FileText[x] = temp;
				x++;
				if (x == 3) {
					done();
				}
			});
	});

	it(". Validate the downloaded file data and GradeBook view", function(done) {
		basicpo.returnElementTextByXPath(browser, "(//div[contains(@class,'student-name')]//span)[1]").then(function(firstTextOfCsvFile) {
			if (firstTextOfCsvFile.indexOf(FileText[0][0]) > -1) {
				basicpo.returnElementTextByXPath(browser, "(//div[contains(@class,'total-points')]//span)[1]").then(function(secondTextOfCsvFile) {
					if (secondTextOfCsvFile.indexOf(FileText[0][1]) > -1) {
						basicpo.returnElementTextByXPath(browser, "(//div[contains(@class,'assignment')]//span)[1]").then(function(ThirdTextOfCsvFile) {
							if (ThirdTextOfCsvFile.indexOf(FileText[0][2]) > -1) {
								basicpo.returnElementTextByXPath(browser, "(//div[contains(@class,'total-points')]//span)[2]").then(function(FourthTextOfCsvFile) {
									if (FourthTextOfCsvFile.indexOf(FileText[1][1]) > -1) {
										basicpo.returnElementTextByCss(browser, ".assignment .max-points").then(function(FifthTextOfCsvFile) {
											if (FifthTextOfCsvFile.indexOf(FileText[1][2]) > -1) {
												basicpo.returnElementTextByCss(browser, ".ui-grid-canvas .ui-grid-row .student").then(function(SixthTextOfCsvFile) {
													if (SixthTextOfCsvFile.indexOf(FileText[2][0]) > -1) {
														basicpo.returnElementTextByCss(browser, ".ui-grid-canvas .ui-grid-row .total-points .ui-grid-cell-contents").then(function(SeventhTextOfCsvFile) {
															if (SeventhTextOfCsvFile.indexOf(FileText[2][1]) > -1) {
																basicpo.returnElementTextByCss(browser, ".ui-grid-render-container-body .ui-grid-cell div").then(function(eightthTextOfCsvFile) {
																	if (FileText[2][2].indexOf(eightthTextOfCsvFile) > -1) {
																		console.log(report.reportHeader() +
																			report.stepStatusWithData("GRADEBOOK and DOWNLOADED CSV FILE text are", "same", "success") +
																			report.reportFooter());
																		done();
																	} else {
																		console.log(report.reportHeader() +
																			report.stepStatusWithData("GRADEBOOK and DOWNLOADED CSV FILE text are", "not same", "failure") +
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
					}
				});
			}
		});
	});

	it(". Navigate to Assignments page", function(done) {
		console.log("Going to delete an existing file");
		fs.unlink(exportedFile, function(err) {
			if (err) {
				return console.error(err);
			}
			console.log("File deleted successfully!");
		});
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Navigate to Documents page under Manage My Course", function(done) {
		menuPage.selectManagDocs(browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Validate the presence of different type of documents on Documents page under Manage My Course page", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		managemydocspo.validateManageMyDocuments(browser, productData.chapter.topic.documents.managedocuments[0].documents[0]).then(function() {
			console.log(report.reportHeader() +
				report.stepStatusWithData("SEARCH :: Verified the presence of documents on Documents page under Manage My Course ", productData.chapter.topic.documents.managedocuments[0].documents[0]) +
				report.reportFooter());
			managemydocspo.validateManageMyDocuments(browser, productData.chapter.topic.documents.managedocuments[0].documents[1]).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("SEARCH :: Verified the presence of documents on Documents page under Manage My Course ", productData.chapter.topic.documents.managedocuments[0].documents[1]) +
					report.reportFooter());
				done();
			});
		});
	});

	it(". Validate downloaded file exist", function(done) {
		managemydocspo.downloadDocs(browser, productData.chapter.topic.documents.managedocuments[0].documents[0]).then(function() {
			fs.exists(downloadedFile, function(exists) {
				if (exists) {
					console.log("File exist!");
					done();
				} else {
					console.log("No file exist!");
				}
			});
		});
	});

	it(". Navigate to Assignments Page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Delete the created assignment", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		assessmentsPage.deleteAssignment(browser, done);
	});

	it(". Log out as Instructor", function(done) {
		userSignOut.userSignOut(browser, done);
	});

	function pollingPageLoad(LoadTime, browser, done, message) {
		basicpo.documentState(browser).then(function(LoadingState) {
			if (LoadingState) {
				browser.sleep(2000);
				LoadTime = LoadTime + 2000;
				pollingPageLoad(LoadTime, browser, done, message);
			} else {
				var timeTaken = LoadTime / 1000;
				if (!LoadingState) {

					console.log(report.reportHeader() +
						report.stepStatusWithData(message, "Successfully", "success") +
						report.reportFooter());
					done();

				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Page is loaded in time", timeTaken, "failure") +
						report.reportFooter());
				}
			}
		});
	}

});
