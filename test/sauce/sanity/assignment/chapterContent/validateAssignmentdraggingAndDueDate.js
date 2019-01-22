require('colors');
var wd = require('wd');
var Q = wd.Q;
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var menuPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var calendarNavigation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/navigationpo");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var assessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assessmentspo");
var chapterReadingAssignmentPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/chapterReadingpo");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var chapterReadingAssignmentData = require("../../../../../test_data/assignments/chapterReading.json");
var session = require("../../../support/setup/browser-session");
var testData = require("../../../../../test_data/data.json");
var courseHelper = require("../../../support/helpers/courseHelper");
var report = require("../../../support/reporting/reportgenerator");
var assignmentpage = require("../../../support/pagefactory/assignmentpage");
var asserters = wd.asserters;
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'ASSIGNMENT DRAG AND DROP VALIDATION', function() {
	var browser;
	var allPassed = true;
	var userType;
	var setDate;
	var courseName;
	var data;
	var assignmentCreationStatus = "failure";
	var product;
	var assignmentDueDateBeforeDrag;
	var assignmentDueDateAfterDrag;
	var pageLoadingTime;
	var productData;
	var totalTime;
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
		console.log(report.formatTestName("ASSIGNMENT DRAG AND DROP VALIDATION"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***validateAssignmentdraggingAndDueDate.js***"));
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

	if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString()) === "safari" || process.env.RUN_IN_PLATFORM.toString() === "\"iOS\"") {
		console.log("drag and drop on safari browser is not implemented yet");
	} else {

		it(". Login to 4LTR Platform as Instructor", function(done) {
			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
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

		it(". Wait for page loading", function(done) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
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

		it(". Close flash on assignment page", function(done) {
			calendarNavigation.handleTheFlashAlert(browser).then(function() {
				done();
			});
		});

		it(". Navigate to the next month", function(done) {
			calendarNavigation.navigateToNextMonth(browser).then(function() {
				done();
			});
		});

		it(". Click on '+' button of first date of next month", function(done) {
			calendarNavigation.selectFirstDateFormNextMonth(browser).then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
		});

		it(". Create Chapter Content type assignment", function(done) {
			calendarNavigation.selectChapterReadingAssessment(browser, done);
		});

		it(". Complete the Chapter Content assignments form", function(done) {
			chapterReadingAssignmentPage.enterName(browser).then(function() {
				assessmentsPage.enterRevealDateNextMonth(browser).then(function() {
					chapterReadingAssignmentPage.saveBtnDisabled(browser).getAttribute('aria-disabled').then(function(statusOfSaveButton) {
						chapterReadingAssignmentPage.selectAChapter(browser, productData.chapter.topic.documents.assignments[0].reading[0].chapter);
						if (statusOfSaveButton === "true") {
							console.log(report.reportHeader() +
								report.stepStatusWithData("save button disabled as user hits the spaces in the assignment name text box", statusOfSaveButton, "success") +
								report.reportFooter());
							console.log(report.reportHeader() +
								report.stepStatusWithData("Chapter Content assignment form has been filled by chapter :" +
									productData.chapter.topic.documents.assignments[0].reading[0].chapter,
									"Due and reveal date:  1st date of next month", "success") +
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

		it(". Fetch the due date of the Chapter Content assignment before Drag", function(done) {
			assessmentsPage.fetchDueDate(browser).text()
				.then(function(dueDateBeforeDrag) {
					assignmentDueDateBeforeDrag = dueDateBeforeDrag;
					console.log(report.reportHeader() +
						report.stepStatusWithData("Due date for created chapter reading assignment before Drag :: ", assignmentDueDateBeforeDrag, "success") +
						report.reportFooter());
					done();
				});
		});


		it(". Save the Chapter Content assignment", function(done) {
			var assignmentCGITime = 0;
			chapterReadingAssignmentPage.saveAssignment(browser).then(function() {
				function polling() {
					chapterReadingAssignmentPage.checkIfAssignmentSavedOnFuture(browser).then(function(value) {
						if (value.toString() === "rgb(0, 0, 0)") {
							assignmentCGITime = assignmentCGITime + 2000;
							polling();
						} else {
							if (value.toString() === "rgb(255, 219, 238)") {
								assignmentCreationStatus = "success";
								console.log(report.reportHeader() +
									report.stepStatusWithData("Instructor created an Chapter Reading type assignment called :: " + chapterReadingAssignmentPage.getAssignmentName() + " takes time in CGI ", assignmentCGITime, "success") +
									report.reportFooter());
								done();
							} else {
								assignmentCreationStatus = "failure";
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

		it(". Drag the assignment to the next date", function(done) {
			var astPath = assignmentpage.dragassignment.assignmentOnDateOfNextMonthOfCurrent;
			var astOnFirstDate = stringutil.returnreplacedstring(astPath, "{{}}", chapterReadingAssignmentData.dragndrop.fromDate);
			var astPathOnSecond = assignmentpage.dragassignment.assignmentOnDateOfNextMonth;
			var astOnSecondDate = stringutil.returnreplacedstring(astPathOnSecond, "{{}}", chapterReadingAssignmentData.dragndrop.toDate);
			// pageLoadingTime = 0;
			console.log(astOnFirstDate);
			console.log(astOnSecondDate);
			chapterReadingAssignmentPage.checkIfAssignmentSavedOnFuture(browser).then(function(value) {
				console.log(value.toString());
				if (value.toString() === "rgb(255, 219, 238)") {
					assessmentsPage.dragAssignmentOnCalenderView(browser, astOnFirstDate, astOnSecondDate, done);
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Instructor created an Chapter Reading type assignment called :: " + chapterReadingAssignmentPage.getAssignmentName(), " is not CGI successfully", "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Wait for page load", function(done) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});

		it(". LTR-5261 Validate the error message should not be display on dragging  the Chapter Content assignment in future date", function(done) {
			chapterReadingAssignmentPage.verifyErrorMessageOnDraggingTheAssignment(browser, done);
		});



		it(". Reopen the dragged Chapter Content assignment to next Date", function(done) {
			var astpath = "//div[@class='day ng-scope']/span/span[@class='number ng-binding' and (text()='{{}}')]//parent::span//following-sibling::div[contains(@class,'event')]";
			var astOnseconddate = stringutil.returnreplacedstring(astpath, "{{}}", chapterReadingAssignmentData.dragndrop.toDate);
			this.timeout(courseHelper.getElevatedTimeout());
			browser
				.waitForElementByXPath(astOnseconddate, 20000).then(function(element) {
					element.click();
					browser
						.waitForElementByXPath(assignmentpage.assignmentForm.dueDateCalendar, asserters.isDisplayed, 10000).text()
						.then(function(dueDateAfterDrag) {
							assignmentDueDateAfterDrag = dueDateAfterDrag;
							console.log(report.reportHeader() +
								report.stepStatusWithData("Due date for created chapter reading assignment after Drag & Drop :: ", assignmentDueDateAfterDrag, "success") +
								report.reportFooter());
							done();
						});
				});
		});

		it(". Validate due date of Chapter Content assignment before dragging and after dragging", function(done) {
			var beforeDateSplit;
			var afterDragDateSplit;
			beforeDateSplit = parseInt(stringutil.returnValueAfterSplit(assignmentDueDateBeforeDrag, " ", 1));
			afterDragDateSplit = beforeDateSplit + 1;
			if (afterDragDateSplit.toString() === chapterReadingAssignmentData.dragndrop.toDate) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Due date for created chapter reading assignment before Drag & Drop " + assignmentDueDateBeforeDrag + " is now :: ", assignmentDueDateAfterDrag + " after successfully dragging the assignment to the next date", "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Due date for created chapter reading assignment before Drag & Drop " + assignmentDueDateBeforeDrag + " is now :: ", assignmentDueDateAfterDrag + " after an unsuccessful attempt to drag the assignment to the next date", "failure") +
					report.reportFooter());
			}
		});

		//Automated the bug LTR-4185

		it(". LTR-5261 Validate selected chapter's checkbox background color of Chapter Content assignment", function(done) {
			chapterReadingAssignmentPage.validateSelectedChapterBackgroundColor(browser).then(function(selectedCheckbox) {
				if (selectedCheckbox.toString() === "rgb(140, 208, 209)" || selectedCheckbox.toString() === "rgb(50, 130, 133)") {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Selected chapter background color is", selectedCheckbox.toString(), "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Selected chapter background color is", selectedCheckbox.toString(), "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Edit the chapter, due date and reveal date of Chapter Content assignment", function(done) {
			chapterReadingAssignmentPage.editChapter(browser, productData.chapter.topic.documents.assignments[0].reading[0].chapter).then(function() {
				chapterReadingAssignmentPage.editChapter(browser, productData.chapter.topic.documents.assignments[0].reading[0].editedChepter).then(function() {
					chapterReadingAssignmentPage.validateSelectedChapterBackgroundColor(browser).then(function(selectedCheckbox) {
						if (selectedCheckbox.toString() === "rgb(140, 208, 209)" || selectedCheckbox.toString() === "rgb(50, 130, 133)") {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Edited chapter background color is", selectedCheckbox.toString(), "success") +
								report.reportFooter());
							done();
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Edited chapter background color is", selectedCheckbox.toString(), "failure") +
								report.reportFooter());
						}
					});
				});
			});
		});

		it(". Edit reveal date of the created Chapter Content assignment", function(done) {
			assessmentsPage.changeRevelAndDueDate(browser, 2, "Reveal in Student Calendar").then(function() {
				done();
			});
		});

		it(". Edit due date of the created Chapter Content assignment", function(done) {
			assessmentsPage.changeRevelAndDueDate(browser, 1, "Due Date").then(function() {
				done();
			});
		});

		it(". Save the chapter content assignment after edit due date", function(done) {
			chapterReadingAssignmentPage.saveAssignment(browser).then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
		});

		it(". Click on previous button for navigating to current month", function(done) {
			calendarNavigation.navigateCurrentMonthFromNextMonth(browser, done)
		});

		it(". Refresh the page and wait for page load", function(done) {
			browser
				.refresh().then(function() {
					pageLoadingTime = 0;
					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
				});
		});

		it(". Verify  edited Chapter Content assignment is present on current date cell and edited with desired chapter", function(done) {
			chapterReadingAssignmentPage.clickOnAssignmentOnCurrentDate(browser, chapterReadingAssignmentPage.getAssignmentName()).then(function() {
				chapterReadingAssignmentPage.verifyEditedChapter(browser, productData.chapter.topic.documents.assignments[0].reading[0].editedChepter).then(function(statusOfEditedChapter) {
					if (statusOfEditedChapter) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Edited Assignments chapter " + productData.chapter.topic.documents.assignments[0].reading[0].editedChepter + "is", " present", "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Edited Assignments chapter " + productData.chapter.topic.documents.assignments[0].reading[0].editedChepter + "is", "not present", "failure") +
							report.reportFooter());
					}
				});
			});
		});

		it(". Wait for page load", function(done) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});

		it(". Refresh the page and wait for page load", function(done) {
			browser
				.refresh().then(function() {
					pageLoadingTime = 0;
					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
				});
		});

		it(". Delete the created assignment", function(done) {
			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
			assessmentsPage.deleteAssignment(browser, done);
		});

		it(". Close flash on assignment page", function(done) {
			calendarNavigation.handleTheFlashAlert(browser).then(function() {
				done();
			});
		});
		it(". Log out as Instructor", function(done) {
			userSignOut.userSignOut(browser, done);
		});
	}

});
