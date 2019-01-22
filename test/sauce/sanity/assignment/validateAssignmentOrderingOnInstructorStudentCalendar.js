require('colors');
var wd = require('wd');
var asserters = wd.asserters;
var _ = require('underscore');
var stringutil = require("../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var menuPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var calendarNavigation = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/navigationpo");
var assessmentsPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assessmentspo");
var studentAssessmentsPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var userSignOut = require("../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var documentAndLinksPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/documentAndLinkspo");
var chapterReadingAssignmentPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/chapterReadingpo");
var assessmentData = require("../../../../test_data/assignments/assessments.json");
var session = require("../../support/setup/browser-session");
var basicpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var testData = require("../../../../test_data/data.json");
var courseHelper = require("../../support/helpers/courseHelper");
var report = require("../../support/reporting/reportgenerator");
var mathutil = require("../../util/mathUtil");
var takeQuizpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'VALIDATE ASSIGNMENT ORDER IN INSTRUCTOR AND STUDENT CALENDAR', function() {
	var browser;
	var allPassed = true;
	var userType;
	var setDate;
	var courseName;
	var assignmentCreationStatus = "failure";
	var assignmentsDueCurrentDate = [];
	var assignmentsDueCurrentDateOnStudentCalendar = [];
	var sortedAssignmentsOnDueDate = [];
	var sortedAssignmentsOnDueDateOnStudentCalendar = [];
	var chapterReadingAssignmentsDueCurrentDate = [];
	var sortedChapterReadingAssignmentsOnDueDate = [];
	var docAndLinkAssignmentsArrayDueCurrentDate = [];
	var docsAndLinksAssignmentsArraySorted = [];
	var assignmentOrderOnStudentCalendar = [];
	var uniqueOrderOfAssignmentsType = [];
	var product;
	var data;
	var productData;
	var totalTime;
	var pageLoadingTime;
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
		browserName = stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString());
		console.log("browserName::" + browserName);
		data = loginPage.setLoginData(userType);
		productData = loginPage.getProductData();
		totalTime = 0;
		//Reports
		console.log(report.formatTestName("VALIDATE ASSIGNMENT ORDER IN INSTRUCTOR AND STUDENT CALENDAR"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***validateAssignmentOrderingOnInstructorStudentCalendar.js***"));
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

	it(". Login to 4LTR Platform as Instructor", function(done) {
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

	it(". Navigate to Assignments Page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Delete all past assignments", function(done) {
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

	it(". Select current date and open the Assessment Type assignment settings page", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.selectADateForAssignment(browser).then(function() {
			calendarNavigation.selectAssessmentTypeAssignment(browser).then(function() {
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assessment type assignment is selected");
			});
		});
	});

	it(". Complete form for system created 'Choose For Me' type Assessment with high score strategy", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.enterName(browser).then(function() {
			assessmentsPage.enterRevealDate(browser).then(function() {
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
												assessmentData.systemgenerated.QuestionStrategy.option[0] + ", Score Strategy :" +
												"High" + ", Question Per Student",
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

	it(". Save the 'Choose For Me' type Assessment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});

	it(". Verify if the 'Choose For Me' type Assessment is saved successfully", function(done) {
		assessmentsPage.checkIfAssignmentSaved(browser).then(function(value) {
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

	it(". Wait for page loading", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
			});
	});

	it(". Select current date and open the 'Choose For Me' type Assessment settings page", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.selectADateForAssignment(browser).
		then(function() {
			calendarNavigation.selectAssessmentTypeAssignment(browser).then(function() {
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assessment type assignment is selected");
			});
		});
	});

	it(". Complete form for system created 'Choose For Me' type Assessment with high score strategy ", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.enterName(browser).then(function() {
			assessmentsPage.enterRevealDate(browser).then(function() {
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
												assessmentData.systemgenerated.QuestionStrategy.option[0] + ", Score Strategy :" +
												"High" + ", Question Per Student",
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

	it(". Save the 'Choose For Me' type Assessment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});

	it(". Verify if 'Choose For Me' type Assessment saved successfully", function(done) {
		assessmentsPage.checkIfAssignmentSaved(browser).then(function(value) {
			if (value.toString() === "rgb(236, 41, 142)") {
				assignmentCreationStatus = "success";
				assessmentAssignmentName = assessmentsPage.getAssignmentName();
				console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName(), "success") + report.reportFooter());
				console.log("assessmentName::" + assessmentAssignmentName);
				done();
			} else {
				assignmentCreationStatus = "failure";
				console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName() + " may not have received the assessmentCGI", "failure") + report.reportFooter());
			}
		});
	});

	it(". Select current date and open the 'Documents And Links' Type assignment settings page", function(done) {
		calendarNavigation.selectADateForAssignment(browser)
			.then(function() {
				calendarNavigation.selectDocumentsAndLinksTypeAssignment(browser, done);
			});
	});

	it(". Complete the Document and Link assignment form", function(done) {
		documentAndLinksPage.enterName(browser).then(function() {
			documentAndLinksPage.enterRevealDate(browser).then(function() {
				documentAndLinksPage.enterDescription(browser).then(function() {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Filled the Document and link assignment form with current due and revel date and discription :", "successfully", "success") +
						report.reportFooter());
					done();
				});
			});
		});
	});

	it(". Add the attachments", function(done) {
		documentAndLinksPage.clickOnAddAttachment(browser).then(function() {
			documentAndLinksPage.addTheAttachments(browser, done);
		});
	});

	it(". Save the Documents and Link Assignment", function(done) {
		pageLoadingTime = 0;
		documentAndLinksPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	it(". Verify Document and link assignments gets saved successfully", function(done) {
		calendarNavigation.clickTheToggle(browser).then(function() {
			var assignmentCGITime = 0;
			polling(assignmentCGITime, browser, done, documentAndLinksPage, "Document And Link");
		});
	});

	it(". Select current date and open Chapter Content assignment page", function(done) {
		calendarNavigation.selectADateForAssignmentIfMultipleAssignment(browser)
			.then(function() {
				calendarNavigation.selectChapterReadingAssessment(browser, done);
			});
	});

	it(". Complete the Chapter Content assignment form", function(done) {
		chapterReadingAssignmentPage.enterName(browser).then(function() {
			chapterReadingAssignmentPage.enterRevealDate(browser).then(function() {
				chapterReadingAssignmentPage.selectAChapter(browser, loginPage.getProductData().chapter.topic.documents.assignments[0].reading[0].chapter);
				console.log(report.reportHeader() +
					report.stepStatusWithData("Chapter Content assignment form has been filled by chapter :" +
						loginPage.getProductData().chapter.topic.documents.assignments[0].reading[0].chapter,
						"Due and reveal date :  current date", "success") +
					report.reportFooter());
				done();
			});
		});
	});

	it(". Save the Chapter Content assignment", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		chapterReadingAssignmentPage.saveAssignment(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	it(". Verify Chapter Content assignment gets saved", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		var assignmentCGITime = 0;
		polling(assignmentCGITime, browser, done, chapterReadingAssignmentPage, "Chapter Content");
	});

	it(". Select current date and open Chapter Content assignment page", function(done) {
		calendarNavigation.selectADateForAssignmentIfMultipleAssignment(browser)
			.then(function() {
				calendarNavigation.selectChapterReadingAssessment(browser, done);
			});
	});

	it(". Complete the Chapter Content assignment form", function(done) {
		chapterReadingAssignmentPage.enterName(browser).then(function() {
			chapterReadingAssignmentPage.enterRevealDate(browser).then(function() {
				chapterReadingAssignmentPage.selectAChapter(browser, loginPage.getProductData().chapter.topic.documents.assignments[0].reading[0].chapter);
				console.log(report.reportHeader() +
					report.stepStatusWithData("Chapter Content assignment form has been filled by chapter :" +
						loginPage.getProductData().chapter.topic.documents.assignments[0].reading[0].chapter,
						"Due and reveal date :  current date", "success") +
					report.reportFooter());
				done();
			});
		});
	});

	it(". Save the Chapter Content assignment", function(done) {
		chapterReadingAssignmentPage.saveAssignment(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	it(". Wait for page loading", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
			});
	});

	it(". Click on assignment calendar view ", function(done) {
		calendarNavigation.clickTheToggle(browser).then(function() {
			done();
		});
	});

	it(". Verify chapter reading assignment gets saved", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		var assignmentCGITime = 0;
		polling(assignmentCGITime, browser, done, chapterReadingAssignmentPage);
	});

	it(". Select current date and open the 'Documents And Links' Type assignment settings page", function(done) {
		calendarNavigation.selectADateForAssignmentIfMultipleAssignment(browser)
			.then(function() {
				calendarNavigation.selectDocumentsAndLinksTypeAssignment(browser, done);
			});
	});

	it(". Complete the Document and Link form for system created assignment", function(done) {
		documentAndLinksPage.enterName(browser).then(function() {
			documentAndLinksPage.enterRevealDate(browser).then(function() {
				documentAndLinksPage.enterDescription(browser).then(function() {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Filled the Document and link assignment form with current due and revel date and discription :", "successfully", "success") +
						report.reportFooter());
					done();
				})
			});
		});
	});

	it(". Add the attachments", function(done) {
		documentAndLinksPage.clickOnAddAttachment(browser).then(function() {
			documentAndLinksPage.addTheAttachments(browser, done);
		});
	});

	it(". Save the Documents and Link Assignment", function(done) {
		pageLoadingTime = 0;
		documentAndLinksPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
		});
	});

	it(". Wait for page loading", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
			});
	});

	it(". Click on calendar view ", function(done) {
		calendarNavigation.clickTheToggle(browser).then(function() {
			done();
		});
	});

	it(". Verify Docs assignment is gets saved", function(done) {
		documentAndLinksPage.checkIfAssignmentSaved(browser).then(function(value) {
			if (value.toString() === "rgb(236, 41, 142)") {
				assignmentCreationStatus = "success";
				console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", documentAndLinksPage.getAssignmentName(), "success") + report.reportFooter());
				done();
			} else {
				assignmentCreationStatus = "failure";
				console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", documentAndLinksPage.getAssignmentName() + " may not have received the assessmentCGI", "failure") + report.reportFooter());
			}
		});
	});

	it(". Wait for page loading", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
			});
	});

	it(". Fetch all the assignments from calendar view on the current due date", function(done) {
		calendarNavigation.clickTheToggle(browser).then(function() {
			browser
				.waitForElementsByXPath("//div[@class='week ng-scope day-selection-disabled']//div[@class='day ng-scope today selected']//div//span", asserters.isDisplayed, 60000).then(function(countOfAssignments) {
					var count = 1;

					function getAssignmentsArray() {

						if (count <= _.size(countOfAssignments)) {
							browser
								.waitForElementByXPath("(//div[@class='week ng-scope day-selection-disabled']//div[@class='day ng-scope today selected']//div//span)[" + count + "]", asserters.isDisplayed, 60000).text().then(function(assignmentName) {
									//Adding the assignment name to the array
									assignmentsDueCurrentDate.push(assignmentName);
									count++;
									getAssignmentsArray();
								});
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Assignments present on the current due date", assignmentsDueCurrentDate, "Success") +
								report.reportFooter());
							//Copying the values from the due date array to the array to be sorted
							sortedAssignmentsOnDueDate = assignmentsDueCurrentDate.slice();
							//Doing a case insensitive sort
							sortedAssignmentsOnDueDate = sortedAssignmentsOnDueDate.sort(function(firstitem, nextitem) {
								return firstitem.toLowerCase().localeCompare(nextitem.toLowerCase());
							});
							console.log("Sorted assignments " + sortedAssignmentsOnDueDate);
							console.log("Due date assignments " + assignmentsDueCurrentDate);
							done();
						}
					}

					getAssignmentsArray();
				});
		});
	});

	it(". Validate the display of assignments in alphabetical order in the due date cell of assignment calendar", function(done) {
		//Comparing the values and the order of values in the duedate array and sorted array
		if (_.isEqual(assignmentsDueCurrentDate, sortedAssignmentsOnDueDate)) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Assignments displayed in alphabetical order", assignmentsDueCurrentDate, "success") +
				report.reportFooter());
			done();

		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Assignments not displayed in alphabetical order", assignmentsDueCurrentDate, "failure") +
				report.reportFooter());
		}
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

	it(". Click on the current date cell on student assignment calendar", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickCurrentDateCell(browser, done);
	});

	it(". Fetch all the Assessment type assignment from student calendar view on current due date", function(done) {
		studentAssessmentsPage.getAssessmentsPresenceStatus(browser).then(function(countOfAssessmentTypeAssignment) {
			var itemIndex = 1;

			function storeAssessmentTypeAssignmentNames() {
				if (itemIndex <= _.size(countOfAssessmentTypeAssignment)) {
					studentAssessmentsPage.getAssessmentNameUsingIndex(browser, itemIndex).then(function(assessmentsName) {
						//Adding the assignment name to the array
						assignmentsDueCurrentDateOnStudentCalendar.push(assessmentsName);
						itemIndex++;
						storeAssessmentTypeAssignmentNames();
					});
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Assignments present on the current due date", assignmentsDueCurrentDateOnStudentCalendar, "Success") +
						report.reportFooter());
					//Copying the values from the due date array to the array to be sorted
					sortedAssignmentsOnDueDateOnStudentCalendar = assignmentsDueCurrentDateOnStudentCalendar.slice();
					//Doing a case insensitive sort
					sortedAssignmentsOnDueDateOnStudentCalendar = sortedAssignmentsOnDueDateOnStudentCalendar.sort(function(firstitem, nextitem) {
						return firstitem.toLowerCase().localeCompare(nextitem.toLowerCase());
					});
					console.log("Sorted assignments " + sortedAssignmentsOnDueDateOnStudentCalendar);
					console.log("Due date assignments " + assignmentsDueCurrentDateOnStudentCalendar);
					done();
				}
			}

			storeAssessmentTypeAssignmentNames();
		});

	});

	it(". Validate the display of assignments in alphabetical order in the due date cell of assignment calendar", function(done) {
		if (_.isEqual(sortedAssignmentsOnDueDateOnStudentCalendar, assignmentsDueCurrentDateOnStudentCalendar)) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Assessments are displayed on student calendar in alphabetical order", sortedAssignmentsOnDueDateOnStudentCalendar, "success") +
				report.reportFooter());
			done();
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Assessments are displayed on student calendar in alphabetical order", sortedAssignmentsOnDueDateOnStudentCalendar, "failure") +
				report.reportFooter());
		}
	});

	it(". Fetch all the Chapter Content type assignment from student calendar view on current due date", function(done) {
		var itemIndex;
		var countOfChapterReadingTypeAssignment;
		browser
			.waitForElementsByXPath("//div[@ng-repeat='reading in readings']//div[@class='title ng-binding']").then(function(countOfChapterReading) {
				itemIndex = 1;
				countOfChapterReadingTypeAssignment = _.size(countOfChapterReading);

				function storeChapterContentAssignmentNames() {
					if (itemIndex <= countOfChapterReadingTypeAssignment) {
						if (process.env.RUN_IN_BROWSER.toString() === "\"internet explorer\"") {
							browser
								.execute("return document.evaluate(\"//div[@ng-repeat='reading in readings'][" + itemIndex + "]//div[@class='title ng-binding']\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.innerHTML;").then(function(chapterReadingAssignmentName) {
									console.log("chapterReadingAssignmentName" + chapterReadingAssignmentName);
									//Adding the assignment name to the array
									chapterReadingAssignmentsDueCurrentDate.push(chapterReadingAssignmentName);
									itemIndex++;
									storeChapterContentAssignmentNames();
								});
						} else {
							browser
								.waitForElementByXPath("//div[@ng-repeat='reading in readings'][" + itemIndex + "]//div[@class='title ng-binding']", asserters.isDisplayed, 60000).text().then(function(chapterReadingAssignmentName) {
									console.log("chapterReadingAssignmentName" + chapterReadingAssignmentName);
									//Adding the assignment name to the array
									chapterReadingAssignmentsDueCurrentDate.push(chapterReadingAssignmentName);
									itemIndex++;
									storeChapterContentAssignmentNames();
								});
						}
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Chapter Content Assignments present on the current due date", chapterReadingAssignmentsDueCurrentDate, "Success") +
							report.reportFooter());
						//Copying the values from the due date array to the array to be sorted
						sortedChapterReadingAssignmentsOnDueDate = chapterReadingAssignmentsDueCurrentDate.slice();
						//Doing a case insensitive sort
						sortedChapterReadingAssignmentsOnDueDate = sortedChapterReadingAssignmentsOnDueDate.sort(function(firstitem, nextitem) {
							return firstitem.toLowerCase().localeCompare(nextitem.toLowerCase());
						});
						console.log("Sorted assignments " + sortedChapterReadingAssignmentsOnDueDate);
						console.log("Due date assignments " + chapterReadingAssignmentsDueCurrentDate);
						done();
					}
				}

				storeChapterContentAssignmentNames();
			});

	});

	it(". Validate the display of Chapter Content assignments in alphabetical order in the due date cell of assignment calendar", function(done) {
		//Comparing the values and the order of values in the duedate array and sorted array
		if (_.isEqual(chapterReadingAssignmentsDueCurrentDate, sortedChapterReadingAssignmentsOnDueDate)) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Chapter Reading assignmnets displayed in alphabetical order", chapterReadingAssignmentsDueCurrentDate, "success") +
				report.reportFooter());
			done();
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Chapter Reading assignmnets not displayed in alphabetical order", chapterReadingAssignmentsDueCurrentDate, "failure") +
				report.reportFooter());
		}
	});

	it(". Fetch all the Document and Link assignment from student calendar view on current due date", function(done) {
		var countOfChapterReadingTypeAssignment;
		var itemIndex;
		if (process.env.RUN_IN_BROWSER.toString() === "\"internet explorer\"") {
			browser
				.execute("return document.getElementsByClassName('title ng-binding')[2].scrollIntoView(true);")
				.sleep(2000);
		}
		browser
			.waitForElementsByXPath("//div[@ng-repeat='document in documents']//div[@class='title ng-binding']", asserters.isDisplayed, 60000).then(function(countOfDocandinkTypeAssignments) {
				itemIndex = 1;
				countOfChapterReadingTypeAssignment = _.size(countOfDocandinkTypeAssignments);
				console.log("countOfChapterReadingTypeAssignment" + countOfChapterReadingTypeAssignment);

				function storeDocumentsAndLinksAssignmentNames() {
					console.log("countOfChapterReadingTypeAssignment" + countOfChapterReadingTypeAssignment);
					if (itemIndex <= countOfChapterReadingTypeAssignment) {
						if (process.env.RUN_IN_BROWSER.toString() === "\"internet explorer\"") {
							browser
								.execute("return document.evaluate(\"//div[@ng-repeat='document in documents'][" + itemIndex + "]//div[@class='title ng-binding']\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.innerHTML;").then(function(docAndLinkAssignmentsName) {
									console.log("chapterReadingAssignmentName" + docAndLinkAssignmentsName);
									//Adding the assignment name to the array
									docAndLinkAssignmentsArrayDueCurrentDate.push(docAndLinkAssignmentsName);
									itemIndex++;
									storeDocumentsAndLinksAssignmentNames();
								});
						} else {
							browser
								.waitForElementByXPath("//div[@ng-repeat='document in documents'][" + itemIndex + "]//div[@class='title ng-binding']", asserters.isDisplayed, 60000).text().then(function(docAndLinkAssignmentsName) {
									//Adding the assignment name to the array
									docAndLinkAssignmentsArrayDueCurrentDate.push(docAndLinkAssignmentsName);
									itemIndex++;
									storeDocumentsAndLinksAssignmentNames();
								});
						}
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Document and link Assignments present on the current due date", docAndLinkAssignmentsArrayDueCurrentDate, "Success") +
							report.reportFooter());
						//Copying the values from the due date array to the array to be sorted
						docsAndLinksAssignmentsArraySorted = docAndLinkAssignmentsArrayDueCurrentDate.slice();
						//Doing a case insensitive sort
						docsAndLinksAssignmentsArraySorted = docsAndLinksAssignmentsArraySorted.sort(function(firstitem, nextitem) {
							return firstitem.toLowerCase().localeCompare(nextitem.toLowerCase());
						});

						console.log("Sorted assignments " + docsAndLinksAssignmentsArraySorted);
						console.log("Due date assignments " + docAndLinkAssignmentsArrayDueCurrentDate);
						done();
					}
				}

				storeDocumentsAndLinksAssignmentNames();
			});
	});

	it(". Validate the display of documents and link assignments in alphabetical order in assignment calendar", function(done) {
		//Comparing the values and the order of values in the duedate array and sorted array
		if (_.isEqual(docAndLinkAssignmentsArrayDueCurrentDate, docsAndLinksAssignmentsArraySorted)) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Doc and link Assignments displayed in alphabetical order", docAndLinkAssignmentsArrayDueCurrentDate, "success") +
				report.reportFooter());
			done();
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Doc and link Assignments not displayed in alphabetical order", docAndLinkAssignmentsArrayDueCurrentDate, "failure") +
				report.reportFooter());
		}
	});

	it(". Validate assignments are displaying in a specific order", function(done) {
		var assignmentcounts = 1;
		var assignmentTypeName;
		browser
			.waitForElementsByXPath("//div[@class='details']/div", asserters.isDisplayed, 30000).then(function(assignmentIndex) {
				function validateAssignmentsOrderOnStudent() {
					if (assignmentcounts <= _.size(assignmentIndex)) {
						browser
							.waitForElementByXPath("(//div[@class='details']/div)[" + assignmentcounts + "]", asserters.isDisplayed, 30000).getAttribute("ng-repeat").then(function(assignmentType) {
								assignmentTypeName = stringutil.returnValueAfterSplit(assignmentType, " in ", 0);
								assignmentOrderOnStudentCalendar.push(assignmentTypeName);
								assignmentcounts++;
								validateAssignmentsOrderOnStudent();
							});
					} else {
						var assignmentcount = _.size(assignmentIndex) + 1;
						if (assignmentcounts === assignmentcount) {
							uniqueOrderOfAssignmentsType = _.uniq(assignmentOrderOnStudentCalendar);
							console.log(report.reportHeader() +
								report.stepStatusWithData(assignmentOrderOnStudentCalendar + " all types of assignment order on student calendar and their sorted unique order is ", uniqueOrderOfAssignmentsType, "success") +
								report.reportFooter());
							if (_.isEqual(uniqueOrderOfAssignmentsType, testData.assignmentsOrder.assignmentOderList)) {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Assignments ordering is " + uniqueOrderOfAssignmentsType + " which is compared with ", testData.assignmentsOrder.assignmentOderList, "success") +
									report.reportFooter());
								done();
							} else {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Assignments ordering is " + uniqueOrderOfAssignmentsType + " which is compared with ", testData.assignmentsOrder.assignmentOderList, "failure") +
									report.reportFooter());
							}
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Assignments ordering is " + uniqueOrderOfAssignmentsType + " which is compared with ", testData.assignmentsOrder.assignmentOderList, "failure") +
								report.reportFooter());
						}
					}

				}

				validateAssignmentsOrderOnStudent();

			});
	});

	it(". Log out as Student", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userSignOut.userSignOut(browser, done);
	});

	it(". Login to 4LTR Platform", function(done) {
		userType = "instructor";
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

	it(". Delete the created assignment", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("360000"));
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

	it(". Log out as Instructor ", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userSignOut.userSignOut(browser, done);
	});


	function polling(assignmentCGITime, browser, done, astType, assignmentType) {
		astType.checkIfAssignmentSaved(browser).then(function(value) {
			 
			if (value.toString() === "rgb(0, 0, 0)") {
				browser.sleep(1000);
				assignmentCGITime = assignmentCGITime + 1000;
				polling(assignmentCGITime, browser, done, astType);
			} else {
				if (value.toString() === "rgb(236, 41, 142)") {
					var timeTaken = assignmentCGITime / 1000;
					console.log(report.reportHeader() +
						report.stepStatusWithData("Instructor created an " + assignmentType + " type assignment called :: " + astType.getAssignmentName() + " takes time in CGI ", timeTaken + " seconds", "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Instructor created an " + assignmentType + " type assignment called :: ", astType.getAssignmentName() + " is not created successfully", "failure") +
						report.reportFooter());
					// done();

				}
			}
		});
	}



});
