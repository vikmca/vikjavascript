var wd = require('wd');
var asserters = wd.asserters;
var session = require("../../support/setup/browser-session");
var stringutil = require("../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var gatewayPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/gatewayintegrationpo.js");
var report = require("../../support/reporting/reportgenerator");
var createNewCoursepo = require("../..//support/pageobject/" + pageobject + "/" + envName + "/createNewCoursepo");
var brainPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var courseHelper = require("../../support/helpers/courseHelper");
var menuPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var calendarNavigation = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/navigationpo");
var assessmentsPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assessmentspo");
var documentAndLinksPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/documentAndLinkspo");
var chapterReadingAssignmentPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/chapterReadingpo");
var basicpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var assessmentData = require("../../../../test_data/assignments/assessments.json");
var copyCoursePage = require("../../support/pageobject/" + pageobject + "/" + envName + "/copyCoursepo.js");
var _ = require('underscore');
var testData = require("../../../../test_data/gatewayintegration.json");
var qaTestData = require("../../../../test_data/data.json");
var lmsObj = require("../../support/pageobject/" + pageobject + "/" + envName + "/lms");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + '4LTR (' + 'Instructor/Student' + ') :: 4LTR/CCS - Gateway LMS Integration Test Results', function() {

	var browser;
	var allPassed;
	var LoadTime;
	var pageLoadingTime;
	var assessmentAssignmentName;
	var docAndLinkAssignmentName;
	var CCAssignmentName;
	var futureAssessmentname2;
	var FutureChapterReadingAssignment2;
	var FutureDocsAndLinkAssignment2;
	var productData;
	var data;
	var totalTime;
	var productOfInterest;
	var serialNumber = 0;

	before(function(done) {

		browser = session.create(done);
		userType = "instructor";
		product = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString());
		courseName = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_COURSE.toString());
		data = loginPage.setLoginDataForGateway(userType);
		productData = loginPage.getProductData();
		courseName = product + "_" + new Date().toISOString();
		copyCourseName = "Copy Course" + product + "_" + new Date().toISOString();
		productOfInterest = _.find(testData.lmsproduct, function(productInList) {
			return productInList.id === product;
		});
		var courseList = testData.coursename + " " + process.env.COURSE_INDEX.toString()
		totalTime = 0;
		//Reports
		console.log(report.formatTestName("4LTR/CCS - Gateway LMS Integration Test Results"));
		console.log(report.printTestData("LMS URL ", data.urlForLogin));
		console.log(report.printTestData("LMS User ", data.userId));
		console.log(report.printTestData("LMS Password ", data.password));
		console.log(report.printTestData("LMS Product ", testData.lmsproduct.title));
		console.log(report.printTestData("LMS Product deploymentId ", testData.lmsproduct.deploymentId));
		console.log(report.printTestData("LMS Course", testData.coursename[0]));
		console.log(report.printTestData("4LTR Course Name ", courseName));
		console.log(report.formatTestScriptFileName("validateCopyCourseForGatewayIntegration.js"));
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


	it(". Sever the previous courses if any before creating a new course", function(done) {
		//The below block of code will try to delete the Gateway course associated with mindlinks since multiple course
		//creations are not allowed before severing the connections
		lmsObj.getToken().then(function(token) {
			lmsObj.getCoursesForDeployment(product).then(function(courseData) {
				console.log("Course Array size : " + _.size(courseData));
				if (_.size(courseData) > 0) {
					//Added additional logic to loop through the course ids and delete all of them if there are more than one course
					_.each(courseData, function(record) {
						console.log("CourseId for deletion : " + record[0]);
						if (_.indexOf(record, productOfInterest.deploymentId) != -1) {
							console.log("Found the deployment id , time to sever the course to create a new course " + record[0]);
							lmsObj.deleteCourse(record[0]).then(function(status) {
								console.log("Cleanup of " + record[0] + " " + status + " !!!");
							})
						}
					});
					done();


				} else {
					console.log("Nothing to cleanup :) ");
					done();
				}
			})
		});
	});

	it(". Login to the blackboard LMS as a Gateway Instructor user", function(done) {
		data = loginPage.setLoginDataForGateway(userType);
		loginPage.loginToApplicationThroughGateway(browser, done);
	});

	it(". Click on the course link under my courses", function(done) {
		gatewayPage.clickOnManageMyCourse(browser).then(function() {
			loginPage.clickOnCourse(browser, testData.coursename[0]).then(function() {
				done();
			});
		});
	});

	it(". Click on content link on left panel", function(done) {
		gatewayPage.clickOnContent(browser).then(function() {
			done();
		});
	});

	it(". Open Tools > MindLinks to select the Mindlinks course", function(done) {
		gatewayPage.selectMindLinksMenuItemFromTools(browser).then(function() {
			pageLoadingTime = 0;
			pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Launch the content source which is used to create the course", function(done) {
		gatewayPage.selectContentSource(browser, productOfInterest.title).then(function() {
			done();
		});
	});

	it(". Select the create course option and fill the form and continue", function(done) {
		gatewayPage.selectCreateCourseOptionAndFillTheFormAndContinue(browser, courseName).then(function() {
			done();
		});
	});

	it(". Create a link to 4LTR course in Blackboard course and continue", function(done) {
		gatewayPage.link4LTRCourse(browser).then(function() {
			done();
		});
	});

	it(". Add the created 4LTR course to content folder and wait for 30 seconds before launching the course till the aggregation is completed", function(done) {
		gatewayPage.add4LTRCourseLinkToContentFolder(browser).then(function() {
			done();
		});
	});

	it(". Launch the course and verify if the 4LTR course is launched successfully through blackboard LMS", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		gatewayPage.clickOnContent(browser).then(function() {
			loginPage.launchTheCourseForGatewayIntegration(browser, courseName, product).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Course  " + courseName + " is launched", "successfully", "success") +
					report.reportFooter());
				done();
			});
		});
	});


	it(". Handle EULA", function(done) {
		loginPage.switchParentToChildWindow(browser).then(function() {
			createNewCoursepo.handleEula(browser).then(function() {
				done();
			});
		});
	});

	it(". Verify the model UI components", function(done) {
		var iconcount;
		var textcount;
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		createNewCoursepo.eulaIconCount(browser).then(function(elementss) {
			iconcount = _.size(elementss);
			createNewCoursepo.eulaIconRespectiveText(browser).then(function(textelements) {
				textcount = _.size(textelements);
				console.log("textcount" + textcount);
				if (iconcount === textcount) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Icon count " + iconcount + ", which is equal to text count", textcount, "success") +
						report.reportFooter());
					createNewCoursepo.textOfGotItButton(browser).text().then(function(gotItUnderEula) {
						if (gotItUnderEula.indexOf(qaTestData.eula.eulaMessage) > -1) {
							createNewCoursepo.textOfGotItButton(browser).then(function() {
								console.log(report.reportHeader() + report.stepStatusWithData(gotItUnderEula, "Button is present", "success") + report.reportFooter());
								done();
							});

						} else {
							console.log(report.reportHeader() + report.stepStatusWithData("GOT IT! button is not present", "", "failure") + report.reportFooter());
						}
					});

				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Icon and text counts are different", "", "failure") +
						report.reportFooter());
				}
			});
		});
	});

	it(". Click on 'GOT IT!' button", function(done) {
		createNewCoursepo.clickOnGotItButton(browser).then(function() {
			done();
		});
	});

	it(". Navigate to GradeBook page", function(done) {
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Validate 'synch to lms' button should be disabled if there are no students or assignments or attempts submitted", function(done) {
		gatewayPage.validateSYncToLmsSTatus(browser).getAttribute('aria-disabled').then(function(statusOfSyncButton) {
			gatewayPage.getLMSButtonText(browser).then(function() {
				if (statusOfSyncButton == testData.statusSyncLmsButtonWhenDisabled) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("'synch to lms' button is disabled when there are no students or assignments or attempts submitted and status is  ", statusOfSyncButton + " successfully", "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("'synch to lms' button is enabled when there are no students or assignments or attempts submitted and status is  ", statusOfSyncButton + " successfully", "failure") +
						report.reportFooter());
				}
			});
		});
	});

	it(". Navigate to Assignments Page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});


	it(". Wait for page loading", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
			});
	});

	it(". Select current date and open the Assessment Type assignment settings page", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.handleTheFlashAlert(browser).then(function() {
			calendarNavigation.selectADateForAssignment(browser).
			then(function() {
				calendarNavigation.selectAssessmentTypeAssignment(browser).then(function() {
					pollingPageLoad(pageLoadingTime, browser, done, "Assessment type assignment is selected");
				});
			});
		});
	});

	it(". Complete the Assessment form for system created assignment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.enterName(browser).then(function() {
			assessmentsPage.enterRevealDate(browser).then(function() {
				assessmentsPage.selectChapter(browser, assessmentData.systemgenerated.scorestrategyhigh.chapter).then(function() {
					assessmentsPage.enterScore(browser, assessmentData.systemgenerated.scorestrategyhigh.score).then(function() {
						assessmentsPage.selectAttempts(browser, assessmentData.systemgenerated.scorestrategyhigh.editedAttempts).then(function() {
							assessmentsPage.selectScoreStrategy(browser, assessmentData.systemgenerated.scorestrategyhigh.scoreStrategy).then(function() {
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

	it(". Save the assessment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});

	it(". Verify if assignment saved successfully", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
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

	it(". Navigate to GradeBook page", function(done) {
		menuPage.selectGradebook(userType, browser, done);
	});

	it.skip(" Validate 'synch to lms' button should be enabled when user creates an assignment", function(done) {
		gatewayPage.validateSYncToLmsSTatus(browser).getAttribute('aria-disabled').then(function(statusOfSyncButton) {
			gatewayPage.getLMSButtonText(browser).then(function() {
				if (statusOfSyncButton == testData.statusSyncLmsButtonWhenEnabled) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("'synch to lms' button is enabled after the assignments creation and status is  ", statusOfSyncButton + " successfully", "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("'synch to lms' button is disabled after the assignments creation and status is ", statusOfSyncButton + " successfully", "failure") +
						report.reportFooter());
				}
			});
		});
	});

	it(". Navigate to Assignments Page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});


	it(". Wait for page loading", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
			});
	});

	it(". Select current date and open the 'Documents And Links' Type assignment settings page", function(done) {
		calendarNavigation.selectADateForAssignment(browser)
			.then(function() {
				calendarNavigation.selectDocumentsAndLinksTypeAssignment(browser, done);
			});
	});

	it(". Complete the Document and Link form for system created assignment", function(done) {
		documentAndLinksPage.enterName(browser).then(function() {
			documentAndLinksPage.enterRevealDate(browser).then(function() {
				documentAndLinksPage.enterDescription(browser).nodeify(done);
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
			documentAndLinksPage.checkIfAssignmentSaved(browser).then(function() {
				docAndLinkAssignmentName = documentAndLinksPage.getAssignmentName();
				console.log("DNLAssignmentName::" + docAndLinkAssignmentName);
				console.log(report.reportHeader() +
					report.stepStatusWithData("Instructor created Documents and links type assignment called :: ", documentAndLinksPage.getAssignmentName() + " is saved successfully", "success") +
					report.reportFooter());
				pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
			});
		});
	});

	it(". Click on '+' button of first date of next month", function(done) {
		calendarNavigation.selectADateForAssignment(browser).then(function() {
			done();
		});
	});

	it(". Create Chapter Reading type assignment", function(done) {
		calendarNavigation.selectChapterReadingAssessment(browser, done);
	});

	it(". Complete the Reading assignments form", function(done) {
		chapterReadingAssignmentPage.enterName(browser).then(function() {
			assessmentsPage.enterRevealDateNextMonth(browser).then(function() {
				chapterReadingAssignmentPage.selectAChapter(browser, productData.chapter.topic.documents.assignments[0].reading[0].chapter);
				done();
			});
		});
	});

	it(". Save the assignment", function(done) {
		pageLoadingTime = 0;
		chapterReadingAssignmentPage.saveAssignment(browser).then(function() {
			CCAssignmentName = chapterReadingAssignmentPage.getAssignmentName();
			console.log("CCAssignmentName::" + CCAssignmentName);
			pollingPageLoad(pageLoadingTime, browser, done, "Chapter Content assignment is saved");
		});
	});


	it(". Navigate to the next month on the assignment calendar view", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.navigateToNextMonth(browser).then(function() {
			pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Select first date of next month for assignment creation", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.selectFirstDateFormNextMonth(browser).then(function() {
			calendarNavigation.selectAssessmentTypeAssignment(browser).then(function() {
				pollingPageLoad(pageLoadingTime, browser, done, "Assessment type assignment is selected");
			});
		});
	});

	it(". Complete the Assessment form for system created assignment", function(done) {
		pageLoadingTime = 0;
		this.timeout(courseHelper.getElevatedTimeout());
		assessmentsPage.enterName(browser).then(function() {
			assessmentsPage.enterRevealDateNextMonth(browser).then(function() {
				assessmentsPage.selectChapter(browser, assessmentData.systemgenerated.scorestrategyhigh.chapter).then(function() {
					assessmentsPage.enterScore(browser, assessmentData.systemgenerated.scorestrategyhigh.score).then(function() {
						assessmentsPage.selectAttempts(browser, assessmentData.systemgenerated.scorestrategyhigh.attempts).then(function() {
							assessmentsPage.selectScoreStrategy(browser, assessmentData.systemgenerated.scorestrategyhigh.scoreStrategy).then(function() {
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

	it(". Save the assessment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});

	it(". Verify if assignment saved successfully", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		pageLoadingTime = 0;
		futureAssessmentname2 = assessmentsPage.getAssignmentName();
		assessmentsPage.checkIfAssignmentSavedOnFutureDate(browser).then(function(value) {
			if (value.toString() === "rgb(255, 219, 238)" || value.toString() === "rgb(236, 41, 142)") {
				assignmentCreationStatus = "success";
				console.log(report.reportHeader() +
					report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName(), "success") +
					report.reportFooter());
				pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
			} else {
				assignmentCreationStatus = "failure";
				console.log(report.reportHeader() +
					report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName() + " may not have received the assessmentCGI", "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Wait for page loading", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
			});
	});

	it(". Navigate to the next month on the assignment calendar view", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.navigateToNextMonth(browser).then(function() {
			pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Click on '+' button and create Chapter Reading assignment", function(done) {
		calendarNavigation.selectFirstDateFormNextMonth(browser).then(function() {
			pageLoadingTime = 0;
			pollingPageLoad(pageLoadingTime, browser, done, "Selected chapter Reading assignment");
		});

	});

	it(". Select Chapter Reading assignment", function(done) {
		calendarNavigation.selectChapterReadingAssessment(browser, done);
	});

	it(". Complete the Reading assignments form", function(done) {
		chapterReadingAssignmentPage.enterName(browser).then(function() {
			assessmentsPage.enterRevealDateNextMonth(browser).then(function() {
				chapterReadingAssignmentPage.selectAChapter(browser, productData.chapter.topic.documents.assignments[0].reading[0].chapter);
				done();
			});
		});
	});

	it(". Save the Reading assignment and verify if it is saved successfully", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		var assignmentCGITime = 0;
		chapterReadingAssignmentPage.saveAssignment(browser).then(function() {
			FutureChapterReadingAssignment2 = chapterReadingAssignmentPage.getAssignmentName();
			console.log("FutureChapterReadingAssignment2" + FutureChapterReadingAssignment2);
			polling(assignmentCGITime, browser, done, chapterReadingAssignmentPage);
		});
	});

	it(". Wait for page loading", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
			});
	});

	it(". Navigate to the next month on the assignment calendar view", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.navigateToNextMonth(browser).then(function() {
			pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Click on '+' button and create Document And Link type assignment", function(done) {
		calendarNavigation.selectFirstDateFormNextMonth(browser).then(function() {
			calendarNavigation.selectDocumentsAndLinksTypeAssignment(browser, done);
		});

	});

	it(". Complete the Document and Link form for system created assignment", function(done) {
		documentAndLinksPage.enterName(browser).then(function() {
			assessmentsPage.enterRevealDateNextMonth(browser)
				.then(function() {
					documentAndLinksPage.enterDescription(browser).then(function() {
						done();
					});
				});
		});
	});

	it(". Add the attachments in the assignment", function(done) {
		documentAndLinksPage.clickOnAddAttachment(browser).then(function() {
			documentAndLinksPage.addTheAttachments(browser, done);
		});
	});

	it(". Save the Documents and Link type Assignment", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		var assignmentCGITime = 0;
		documentAndLinksPage.saveAssignment(browser).then(function() {
			FutureDocsAndLinkAssignment2 = documentAndLinksPage.getAssignmentName();
			console.log("FutureDocsAndLinkAssignment2" + FutureDocsAndLinkAssignment2);
			done();
		});
	});

	it(". Wait for page loading", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	it(". Click on the course link under my courses to delete the added mindlink", function(done) {
		loginPage.switchChildToParentWindow(browser).then(function() {
			gatewayPage.clickOnManageMyCourse(browser).then(function() {
				loginPage.clickOnCourse(browser, testData.coursename[0]).then(function() {
					gatewayPage.clickOnContent(browser).then(function() {
						done();
					});
				});
			});
		});
	});

	it(". Delete the existing mindlink", function(done) {
		gatewayPage.getExistingMindlinkId(browser, courseName).then(function(idValue) {
			console.log("Id value " + idValue);
			var extractedDeleteId = idValue.slice(7, idValue.length);
			console.log("extractedDeleteId value " + extractedDeleteId);
			gatewayPage.deleteExistingMindlink(browser, extractedDeleteId, courseName).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Course " + courseName + " is deleted", "successfully", "success") +
					report.reportFooter());
				done();
			});
		});
	});

	it(". Wait for page loading", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	it(". Close the current window", function(done) {
		browser.quit();
		done();
	});

	it(". start browser session", function(done) {
		browser = session.create(done);
	});


	it(". Login to the blackboard LMS as a Gateway Instructor user", function(done) {
		userType = "instructor";
		data = loginPage.setLoginDataForGateway(userType);
		loginPage.loginToApplicationThroughGateway(browser, done);
	});

	it(". Click on the course link under my courses", function(done) {
		gatewayPage.clickOnManageMyCourse(browser).then(function() {
			loginPage.clickOnCourse(browser, testData.coursename[1]).then(function() {
				done();
			});
		});
	});

	it(". Click on content link on left panel", function(done) {
		gatewayPage.clickOnContent(browser).then(function() {
			done();
		});
	});

	it(". Open Tools > MindLinks to select the Mindlinks course", function(done) {
		gatewayPage.selectMindLinksMenuItemFromTools(browser).then(function() {
			done();
		});
	});

	it(". Launch the content source which is used to create the course", function(done) {
		gatewayPage.selectContentSource(browser, productOfInterest.title).then(function() {
			done();
		});
	});

	it(". Select the copy course create option and fill the form and continue", function(done) {
		gatewayPage.selectCopyCourseOptionAndFillTheFormAndContinue(browser, courseName, copyCourseName).then(function() {
			done();
		});
	});

	it(". Create a link to 4LTR course in Blackboard course and continue", function(done) {
		gatewayPage.link4LTRCourse(browser).then(function() {
			done();
		});
	});

	it(". Add the created 4LTR course to content folder and wait for 30 seconds before launching the course till the aggregation is completed", function(done) {
		gatewayPage.add4LTRCourseLinkToContentFolder(browser).then(function() {
			done();
		});
	});

	it(". Launch the course and verify if the 4LTR course is launched successfully through blackboard LMS", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		gatewayPage.clickOnContent(browser).then(function() {
			loginPage.launchTheCourseForGatewayIntegration(browser, copyCourseName, product).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Course  " + copyCourseName + " is launched", "successfully", "success") +
					report.reportFooter());
				done();
			});
		});
	});


	it(". Handle EULA", function(done) {
		loginPage.switchParentToChildWindow(browser).then(function() {
			createNewCoursepo.handleEula(browser).then(function() {
				done();
			});
		});
	});

	it(". verify the model UI components", function(done) {
		var iconcount;
		var textcount;
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		createNewCoursepo.eulaIconCount(browser).then(function(elementss) {
			iconcount = _.size(elementss);
			createNewCoursepo.eulaIconRespectiveText(browser).then(function(textelements) {
				textcount = _.size(textelements);
				console.log("textcount" + textcount);
				if (iconcount === textcount) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Icon count " + iconcount + ", which is equal to text count", textcount, "success") +
						report.reportFooter());
					createNewCoursepo.textOfGotItButton(browser).text().then(function(gotItUnderEula) {
						if (gotItUnderEula.indexOf(qaTestData.eula.eulaMessage) > -1) {
							createNewCoursepo.textOfGotItButton(browser).then(function() {
								console.log(report.reportHeader() + report.stepStatusWithData(gotItUnderEula, "Button is present", "success") + report.reportFooter());
								done();
							});

						} else {
							console.log(report.reportHeader() + report.stepStatusWithData("GOT IT! button is not present", "", "failure") + report.reportFooter());
						}
					});

				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Icon and text counts are different", "", "failure") +
						report.reportFooter());
				}
			});
		});
	});

	it(". Click on 'GOT IT!' button", function(done) {
		createNewCoursepo.clickOnGotItButton(browser).then(function() {
			done();
		});
	});

	it(". Navigate to assignment view", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Wait for page loading", function(done) {
		pageLoadingTime = 0;
		pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
	});

	it(". Validate all type of assignments on Copy course", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		this.retries(2);
		calendarNavigation.clickTheToggleOnCurrentMonth(browser).then(function() {
			copyCoursePage.validateAssignments(browser, assessmentAssignmentName).then(function() {
				copyCoursePage.validateAssignments(browser, docAndLinkAssignmentName).then(function() {
					copyCoursePage.validateAssignments(browser, CCAssignmentName).then(function() {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Assignments created on original courses are present on the copied course as well ", "success") +
							report.reportFooter());
						done();
					});
				});
			});
		});
	});

	it(". Validate all types of hidden assignments on Copy course", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		calendarNavigation.navigateToNextMonth(browser).then(function() {
			calendarNavigation.clickTheToggleOnNextMonth(browser).then(function() {
				copyCoursePage.validateAssignmentsNextMonth(browser, futureAssessmentname2).then(function() {
					copyCoursePage.validateAssignmentsNextMonth(browser, FutureDocsAndLinkAssignment2).then(function() {
						copyCoursePage.validateAssignmentsNextMonth(browser, FutureChapterReadingAssignment2).then(function() {
							console.log(report.reportHeader() +
								report.stepStatusWithData("All assignments (Current, and assignments unrevealed to students) are visible on the copied course ", "success") +
								report.reportFooter());
							done();
						});
					});
				});
			});
		});
	});

	it(". Wait for page loading", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	it(". Close the current window", function(done) {
		browser.close();
		done();
	});

	it(". Click on the course link under my courses to delete the added mindlink", function(done) {
		loginPage.switchChildToParentWindow(browser).then(function() {
			gatewayPage.clickOnManageMyCourse(browser).then(function() {
				loginPage.clickOnCourse(browser, testData.coursename[1]).then(function() {
					gatewayPage.clickOnContent(browser).then(function() {
						done();
					});
				});
			});
		});
	});

	it(". Delete the existing mindlink", function(done) {
		gatewayPage.getExistingMindlinkId(browser, copyCourseName).then(function(idValue) {
			console.log("Id value " + idValue);
			var extractedDeleteId = idValue.slice(7, idValue.length);
			console.log("extractedDeleteId value " + extractedDeleteId);
			gatewayPage.deleteExistingMindlink(browser, extractedDeleteId, copyCourseName).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Course " + copyCourseName + " is deleted", "successfully", "success") +
					report.reportFooter());
				done();
			});
		});
	});


	function polling(assignmentCGITime, browser, done, astType) {
		astType.checkIfAssignmentSavedOnFuture(browser).then(function(value) {
			 
			if (value.toString() === "rgb(0, 0, 0)") {
				browser.sleep(2000);
				assignmentCGITime = assignmentCGITime + 2000;
				polling(assignmentCGITime, browser, done, astType);
			} else {
				if (value.toString() === "rgb(255, 219, 238)" || value.toString() === "rgb(236, 41, 142)") {
					var timeTaken = assignmentCGITime / 1000;
					console.log(report.reportHeader() +
						report.stepStatusWithData("Instructor created an Chapter Reading type assignment called :: " + astType.getAssignmentName() + " takes time in CGI ", timeTaken + " seconds", "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Instructor created an Chapter Reading type assignment called :: ", astType.getAssignmentName() + " is not created successfully", "failure") +
						report.reportFooter());
					// done();

				}
			}
		});
	}

	function pollingPageLoad(LoadTime, browser, done, message) {
		basicpo.documentState(browser).then(function(LoadingState) {
			if (LoadingState) {
				browser.sleep(1000);
				LoadTime = LoadTime + 1000;
				pollingPageLoad(LoadTime, browser, done, message);
			} else {
				if (!LoadingState) {
					var timeTaken = LoadTime / 1000;
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
