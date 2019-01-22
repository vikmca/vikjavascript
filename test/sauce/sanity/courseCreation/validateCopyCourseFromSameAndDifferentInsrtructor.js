var wd = require('wd');
var asserters = wd.asserters;
var _ = require('underscore');
var dataUtil = require("../../util/date-utility");
var stringutil = require("../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var takeQuizpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var loginPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var menuPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var calendarNavigation = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/navigationpo");
var assessmentsPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assessmentspo");
var documentAndLinksPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/documentAndLinkspo");
var chapterReadingAssignmentPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/chapterReadingpo");
var studentAssessmentsPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var instructorGradebookNavigationPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/gradebookNavigationpo");
var instructorGradebookStudentDetailedPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/studentDetailedInfopo");
var instructorAssessmentDetailedInfopo = require("../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/assessmentDetailedInfopo");
var instructorGradebookForDropStudent = require("../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/dropStudentFromCourse");
var instructorMainGradebookView = require("../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/mainGradebookView");
var basicpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var casPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var copyCoursePage = require("../../support/pageobject/" + pageobject + "/" + envName + "/copyCoursepo.js");
var createNewCoursepo = require("../..//support/pageobject/" + pageobject + "/" + envName + "/createNewCoursepo");
var userSignOut = require("../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var assessmentData = require("../../../../test_data/assignments/assessments.json");
var session = require("../../support/setup/browser-session");
var studenGradebookPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/student/gradebookValidationpo");
var courseRegistrationpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/courseRegistrationpo.js");
var testData = require("../../../../test_data/data.json");
var clearAllSavedContent = require("../../support/pageobject/" + pageobject + "/" + envName + "/clearData");
var courseHelper = require("../../support/helpers/courseHelper");
var report = require("../../support/reporting/reportgenerator");
var tocPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/tocpo");
var myCengageDashboardpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/myCengageDashboardpo.js");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName+'Copy Course/ ::  VALIDATE COPY COURSE FROM SAME AND DIFFERENT INSTRUCTOR AND ASSIGNMENTS', function() {
	var browser;
	var allPassed = true;
	var userType;
	var setDate;
	var courseName;
	var copyCourse;
	var assignmentCreationStatus = "failure";
	var courseCreationStatus = "failure";
	var aggregationStatus = "failure";
	var aggregationCompletionTime = "Never Completed or took more time than expected";
	var assessmentAssignmentName;
	var DNLAssignmentName;
	var CCAssignmnetName;
	var futureAssessmentname2;
	var FutureChapterReadingAssignment2;
	var FutureDocsAndLinkAssignment2;
	var pageLoadingTime;
	var courseKey;
	var courseKeyForSameInstructor;
	var product;
	var data;
	var productData;
	var totalTime;
	var courseNameStatus;
	var assessmentAssignmentNameOnCurrentDate;
	var studentAssignmentCompletionStatus;
	var questionsCorrectFromCAS;
	var averageScoreForAllStudents;
	var pointsFromStudentGradebook;
	var totalPointsGainedByStudent;
	var serialNumber = 0;
	var copyCourseforDifferentInst;
	var currentUrl;
	var courseAggregationStatus = "failure";
	var courseAggregatedStatus = false;

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
		console.log(report.formatTestName("COPY COURSE - SAME AND DIFFERENT INSTRUCTOR VALIDATION"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("validateCopyCourseFromSameAndDifferentInsrtructor.js"));
		copyCourse = "copy of " + courseName;
		console.log("copyCourse::" + copyCourse);
		copyCourseforDifferentInst = "copy of " + courseName + "for diffent inst"
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
		data = loginPage.setLoginData(userType);
		//Reports
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Product", function(done) {
		brainPage.selectProduct(product, browser, done);
	});

	it(". Select a Course and launch if duplicate course is present on instructor dashboard", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		loginPage.checkIfCoursePresent(browser, copyCourse).then(function(status) {
			courseNameStatus = status;
			if (courseNameStatus) {
				loginPage.launchACourse(userType, copyCourse, browser, done);
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
					report.reportFooter());
					userSignOut.signOutFromSSO(userType, browser).then(function(){
	                 pageLoadingTime =0;
	                 takeQuizpo.pollingPageLoad(pageLoadingTime,browser,done,"Page is loading");
	     });
			}
		});
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Navigate on GradeBook page if any duplicate course is present", function(done) {
		if (courseNameStatus) {
			this.timeout(courseHelper.getElevatedTimeout());
			basicpo.checkEula(browser).then(function(eula) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("EULA Acceptted", !eula, "success") +
					report.reportFooter());
					basicpo.getTitleOfPage(browser).then(function (pageTitle) {
		              console.log("pageTitle"+pageTitle);
		              var pageTitleText = pageTitle;
		              if (pageTitleText !== "undefined") {
		                courseAggregatedStatus = true;
		                console.log("courseAggregationStatus   " + courseAggregatedStatus);
		                if(courseAggregatedStatus){
											if (eula) {
												createNewCoursepo.handleEula(browser).then(function() {
													createNewCoursepo.clickOnGotItButton(browser).then(function() {
														menuPage.selectGradebook("instructor", browser, done);
													});
												});
											} else {
												menuPage.selectGradebook("instructor", browser, done);
											}
									}else {
	                    userSignOut.userSignOut(browser, done);
                }
              }else {
                  console.log(report.reportHeader() +
                  report.stepStatusWithData("Course is not aggregated", courseAggregatedStatus, "success") +
                  report.reportFooter());
                  userSignOut.userSignOut(browser, done);
              }
            });
			});
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course A is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Navigate to student's detailed GradeBook view and drop the student if any student is registered on duplicate course", function(done) {
		if (courseNameStatus) {
			if(courseAggregatedStatus){
					data = loginPage.setLoginData("student");
					console.log(loginPage.getUserName());
					instructorGradebookNavigationPage.checkIfStudentIsPresent(browser, loginPage.getUserName()).then(function(studentNamePresentStatus) {
						if (studentNamePresentStatus) {
							instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserName()).then(function() {
								instructorGradebookForDropStudent.clickOnDropStudentButton(browser).then(function() {
									instructorGradebookForDropStudent.clickOnYesUnderDialogueBox(browser).text().then(function(mainGradebookPageText) {
										userSignOut.userSignOut(browser, done);
									});
								});
							});
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
								report.reportFooter());
							done();
							userSignOut.userSignOut(browser, done);
						}
				});
			}else {
               console.log(report.reportHeader() +
               report.stepStatusWithData("course is not aggregated", courseAggregatedStatus, "success") +
               report.reportFooter());
               done();
      }
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			done();
		}
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
		if (courseNameStatus) {
			createNewCoursepo.clickOnManageMyCourse(browser).then(function() {
				done();
			});
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Select the newly created course and delete it as part of cleanup", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		if (courseNameStatus) {
			clearAllSavedContent.clearCreatedCourse(browser, done, copyCourse);
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Navigate to Instructor SSO", function(done) {
		if (courseNameStatus) {
			basicpo.navigateToInstructorDashboard(browser).then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
			});
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Click on manage my course", function(done) {
		createNewCoursepo.clickOnManageMyCourse(browser).then(function() {
			done();
		});
	});

	it(". Click on edit course under manage my course", function(done) {
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
		calendarNavigation.selectADateForAssignment(browser).
		then(function() {
			calendarNavigation.selectAssessmentTypeAssignment(browser).then(function() {
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assessment type assignment is selected");
			});
		});
	});

	it(". Complete the CFM Assessment form for system created assignment", function(done) {
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
												report.stepStatusWithData("Assessment form has been filled by chapter :"+
												assessmentData.systemgenerated.scorestrategyhigh.chapter+", Score :"+
												assessmentData.systemgenerated.scorestrategyhigh.score+", Number Of Attempts :"+
												assessmentData.systemgenerated.scorestrategyhigh.editedAttempts+", Question Strategy :"+
												assessmentData.systemgenerated.QuestionStrategy.option[0]+", Score Strategy : High("+
												assessmentData.systemgenerated.scorestrategyhigh.scoreStrategy+"), Question Per Student :",
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

	it(". Save the CFM Assessment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});

	it(". Verify if CFM Assessment gets saved successfully", function(done) {
		assessmentsPage.checkIfAssignmentSaved(browser).then(function(value) {
			if (value.toString() === "rgb(236, 41, 142)") {
				assignmentCreationStatus = "success";
				assessmentAssignmentName = assessmentsPage.getAssignmentName();
				assessmentAssignmentNameOnCurrentDate = assessmentsPage.getAssignmentName();
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
				console.log(report.reportHeader() +
					report.stepStatusWithData("Instructor created Documents and links type assignment called :: ", documentAndLinksPage.getAssignmentName() + " is saved successfully", "success") +
					report.reportFooter());
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
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
			chapterReadingAssignmentPage.enterRevealDate(browser).then(function() {
				chapterReadingAssignmentPage.selectAChapter(browser, productData.chapter.topic.documents.assignments[0].reading[0].chapter);
				done();
			});
		});
	});

	it(". Save the assignment", function(done) {
		pageLoadingTime = 0;
		chapterReadingAssignmentPage.saveAssignment(browser).then(function() {
			CCAssignmnetName = chapterReadingAssignmentPage.getAssignmentName();
			console.log("CCAssignmnetName::" + CCAssignmnetName);
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Chapter Content assignment is saved");
		});
	});


	it(". Navigate to the next month on the assignment calendar view", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.navigateToNextMonth(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Select first date of next month for assignment creation", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.selectFirstDateFormNextMonth(browser).then(function() {
			calendarNavigation.selectAssessmentTypeAssignment(browser).then(function() {
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assessment type assignment is selected");
			});
		});
	});

	it(". Complete the CFM Assessment form for system created assignment on first date of next month", function(done) {
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
										console.log(report.reportHeader() +
												report.stepStatusWithData("Assessment form has been filled by chapter :"+
												assessmentData.systemgenerated.scorestrategyhigh.chapter+", Score :"+
												assessmentData.systemgenerated.scorestrategyhigh.score+", Number Of Attempts :"+
												assessmentData.systemgenerated.scorestrategyhigh.attempts+", Question Strategy :"+
												assessmentData.systemgenerated.QuestionStrategy.option[0]+", Score Strategy : High("+
												assessmentData.systemgenerated.scorestrategyhigh.scoreStrategy+"), Question Per Student :",
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

	 // https://jira.cengage.com/browse/LTR-5311
  it(". LTR-5311 :: Validate Page don't keep in loading state for a long after saving Assessment type assignment", function (done) {
      takeQuizpo.pageLoadingStateValue(browser).then(function(loadingState) {
      console.log(loadingState);
      if (!loadingState) {
            console.log(report.reportHeader() +
            report.stepStatusWithData("Page gets loaded successfully", loadingState , "success")
            + report.reportFooter());
            done();
        }else{
            console.log(report.reportHeader() +
            report.stepStatusWithData("Page gets loaded successfully", !loadingState , "failure")
            + report.reportFooter());
        }
      });
  });


	it(". Verify if CFM type assessment type assignment gets saved successfully on first date of next month", function(done) {
		pageLoadingTime = 0;
		futureAssessmentname2 = assessmentsPage.getAssignmentName();
		assessmentsPage.checkIfAssignmentSavedOnFutureDate(browser).then(function(value) {
			if (value.toString() === "rgb(255, 219, 238)") {
				assignmentCreationStatus = "success";
				console.log(report.reportHeader() +
					report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName(), "success") +
					report.reportFooter());
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
			} else {
				assignmentCreationStatus = "failure";
				console.log(report.reportHeader() +
					report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName() + " may not have received the assessmentCGI", "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Reload the page nad wait for page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
			});
	});

	it(". Navigate to tile view", function(done) {
		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) == "mobile" || stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString())==="iOS") {
			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
			pageLoadingTime = 0;
			tocPage.selectTileView(browser).then(function() {
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
		} else {
			this.skip();
		}
	});

	it(". Navigate to the next month on the assignment calendar view", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.navigateToNextMonth(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Click on '+' button and create Chapter Reading assignment on first date of next month", function(done) {
		calendarNavigation.selectFirstDateFormNextMonth(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Selected chapter Reading assignment");
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

	it(". Save the Reading assignment ", function(done) {
		pageLoadingTime = 0;
		chapterReadingAssignmentPage.saveAssignment(browser).then(function() {
			FutureChapterReadingAssignment2 = chapterReadingAssignmentPage.getAssignmentName();
			console.log(report.reportHeader() +
				report.stepStatusWithData("CCS : Instructor created chapter content assessment type assignment called :: ", chapterReadingAssignmentPage.getAssignmentName(), "success") +
				report.reportFooter());
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	 // https://jira.cengage.com/browse/LTR-5311
  it(". LTR-5311 :: Validate Page don't keep in loading state for a long after saving the Chapter Reading assignment", function (done) {
      takeQuizpo.pageLoadingStateValue(browser).then(function(loadingState) {
      console.log(loadingState);
      if (!loadingState) {
            console.log(report.reportHeader() +
            report.stepStatusWithData("Page gets loaded successfully", loadingState , "success")
            + report.reportFooter());
            done();
        }else{
            console.log(report.reportHeader() +
            report.stepStatusWithData("Page gets loaded successfully", !loadingState , "failure")
            + report.reportFooter());
        }
      });
  });


	it(". Verify Assignments gets saved successfully on first date of next month", function(done) {
		var assignmentCGITime = 0;
		polling(assignmentCGITime, browser, done, chapterReadingAssignmentPage);
	});

	it(". Reload the page and wait for page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
			});
	});

	it(". Navigate to assignment list view", function(done) {
		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) == "mobile") {
			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
			pageLoadingTime = 0;
			tocPage.selectTileView(browser).then(function() {
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
		} else {
			this.skip();
		}
	});

	it(". Navigate to the next month on the assignment calendar view", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.navigateToNextMonth(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Click on '+' button on first date of next month and select Document And Link type assignment ", function(done) {
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
		documentAndLinksPage.saveAssignment(browser).then(function() {
			FutureDocsAndLinkAssignment2 = documentAndLinksPage.getAssignmentName();
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	 // https://jira.cengage.com/browse/LTR-5311
  it(". LTR-5311 :: Validate Page don't keep in loading state for a long after saving Document & Link type assignment", function (done) {
      takeQuizpo.pageLoadingStateValue(browser).then(function(loadingState) {
      console.log(loadingState);
      if (!loadingState) {
            console.log(report.reportHeader() +
            report.stepStatusWithData("Page gets loaded successfully", loadingState , "success")
            + report.reportFooter());
            done();
        }else{
            console.log(report.reportHeader() +
            report.stepStatusWithData("Page gets loaded successfully", !loadingState , "failure")
            + report.reportFooter());
        }
      });
  });

	it(". Log out as Instructor", function(done) {
		userSignOut.userSignOut(browser, done);
	});

	it(". Re- Login to 4LTR Platform", function(done) {
		data = loginPage.setLoginData(userType);
		//Reports
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Product", function(done) {
		brainPage.selectProduct(product, browser, done);
	});

	it(". Click on create course link", function(done) {
		createNewCoursepo.clickOnCreateCourseLink(browser).then(function() {
			pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	it(". SSOFD-497 :: Verify copy course radio button should present", function(done) {
		createNewCoursepo.verifyPresenceOfCopyCourse(browser).then(function(copyCourseRadioButton) {
			if(copyCourseRadioButton){
			console.log(report.reportHeader() +
			report.stepStatusWithData("Copy Course with same instructor radio button presence status",copyCourseRadioButton, "success")
			+ report.reportFooter());
			done();
			}else{
				console.log(report.reportHeader() +
        report.stepStatusWithData("Copy Course with same instructor radio button presence status",copyCourseRadioButton, "failure")
        + report.reportFooter());
			}
		});
	});

	it(". SSOFD-497 :: Verify copy course from  different instructor radio button should present", function(done) {
		createNewCoursepo.verifyPresenceOfCopyCourseDiffInst(browser).then(function(copyCourseDiffInstRadioButton) {
			if(copyCourseDiffInstRadioButton){
			console.log(report.reportHeader() +
			report.stepStatusWithData("Copy Course from different instructor radio button presence status",copyCourseDiffInstRadioButton, "success")
			+ report.reportFooter());
			done();
			}else{
				console.log(report.reportHeader() +
        report.stepStatusWithData("Copy Course from different instructor radio button presence status",copyCourseDiffInstRadioButton, "failure")
        + report.reportFooter());
			}
		});
	});

	it(". Copy an existing course option and enter the name of copied course", function(done) {
		console.log("courseKey="+courseKey+"courseKey");
		var courseKey1 = stringutil.returnValueAfterSplit(courseKey,"-",0);
		var courseKey2= stringutil.returnValueAfterSplit(courseKey,"-",1);
		var courseKey3= stringutil.returnValueAfterSplit(courseKey,"-",2);
		var courseKeyFinal = courseKey1+courseKey2+courseKey3;
		console.log(courseKeyFinal);
		createNewCoursepo.selectCopyCourse(browser, courseName, courseKeyFinal).then(function() {
			done();
		});
	});


	it(". Enter the copied course name", function(done) {
		createNewCoursepo.enterCourseName(browser, copyCourse).then(function() {
			done();
		});
	});

	it(". Fill in the start date", function(done) {
		createNewCoursepo.fillTheStartDate(browser).then(function() {
			done();
		});
	});

	it(". Fill the end date with 10 days after the today's date ", function(done) {
		createNewCoursepo.enterTheEndData(browser, dataUtil.getSpecificDateAfterCurrentDate(setDate)).then(function() {
			done();
		});
	});

	it(". Save the course details", function(done) {
		createNewCoursepo.saveTheCourseDetail(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	it(". Check the target location", function(done) {
		browser
			.execute("return window.location.href;").then(function(cgi) {
				courseCGI = cgi.split('products/')[1];
				if (courseCGI !== "undefined") {
					courseCreationStatus = "success";

					console.log("Nirmal   " + courseCreationStatus);
				}
				console.log("Nirmal   outside" + courseCreationStatus + courseCGI);
				browser
					.sleep(1000)
					.nodeify(done);
			});
	});

	it(". Copy Course key", function (done) {
		createNewCoursepo.getCourseKey(browser).then(function(ckey){
			if(ckey.indexOf("course-confirmation")>-1){
			var coursekeyInitial = stringutil.returnValueAfterSplit(ckey, "course-confirmation/", 1);
			courseKeyForSameInstructor = stringutil.returnValueAfterSplit(coursekeyInitial, "/", 0);
			}else {
				courseKeyForSameInstructor = stringutil.returnValueAfterSplit(ckey, "course/", 1);
			}
			console.log("coursekey"+courseKeyForSameInstructor);
			if (courseKeyForSameInstructor !== "undefined") {
				coursekeystatus = "success";
			}
			done();
		});
	});

	it(". Validate course CGI appears in url", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getCourseAggregationTimeOut());
		}
		browser.sleep(courseHelper.getCourseTimeOut()).then(function() {
			createNewCoursepo.launchTheCreatedCourse(browser).then(function() {
				done();
			});
		});
	});

	it(". Wait and launch the course and refresh the page till the aggregation is completed ", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getCourseAggregationTimeOut());
		}
		if (courseCreationStatus !== "failure") {
			browser.execute("window.location.reload();")
				.then(
					function() {
						poll(
							function() {
								console.log("=================== Inside function in Course Aggregation ======================");
								return browser
									// .sleep(3000)
									.sleep(1000)
									.hasElementByCssSelector("button.welcome-button", function(err, flag) {
										console.log("::Is Welcome Modal present ?" + flag);
										return flag;
									});

							},
							function() {
								console.log("=================== Course Aggregation completed ======================");
								aggregationStatus = "success";
								done();

							},
							function() {
								// Error, failure callback
								console.log("=================== Failure in Course Aggregation ======================");

							}, courseHelper.getCourseAggregationTimeOut(), 10000
						);
					}
				);
		} else {
			userSignOut.userSignOut(browser, done);
		}
	});

	it(". Validate course aggregation status", function (done) {
      browser
        .sleep(2000)
        .title().then(function (courrseTitle) {
        console.log("courrseTitle"+courrseTitle);
        var courseTitleText = courrseTitle;
        if (courseTitleText !== "4LTR" && courseTitleText !== "undefined") {
              courseAggregationStatus = "success";
              console.log(report.reportHeader() +
              report.stepStatusWithData("Course is successfully aggregated "+courseAggregationStatus+" and course title name is ",courseTitleText, "success")
              + report.reportFooter());
              done();
        }else {
            console.log(report.reportHeader() +
            report.stepStatusWithData("Course is successfully aggregated "+courseAggregationStatus+" and course title name is ",courseTitleText, "failure")
            + report.reportFooter());
        }
      });
    });

	it(". Handle EULA", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		if (courseCreationStatus !== "failure") {
			createNewCoursepo.handleEula(browser).then(function() {
				done();
			});
		} else {
			done();
		}
	});

	it(". verify the model UI components", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getCourseAggregationTimeOut());
		}
		var iconcount;
		var textcount;
		createNewCoursepo.eulaIconCount(browser).then(function(elementss) {
			iconcount = _.size(elementss);
			createNewCoursepo.eulaIconRespectiveText(browser).then(function(textelements) {
				textcount = _.size(textelements);
				if (iconcount === textcount) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Icon count " + iconcount + ", which is equal to text count", textcount, "success") +
						report.reportFooter());
					createNewCoursepo.textOfGotItButton(browser).text().then(function(gotItUnderEula) {
						if (gotItUnderEula.indexOf(testData.eula.eulaMessage) > -1) {
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
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.clickOnGotItButton(browser).then(function() {
			done();
		});
	});

	it(". Navigate to assignment view", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Wait for page loading", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
	});

	it(". Validate all type of assignments on Copy course", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		this.retries(2);
		calendarNavigation.clickTheToggleOnCurrentMonth(browser).then(function() {
			copyCoursePage.validateAssignments(browser, assessmentAssignmentName).then(function() {
				copyCoursePage.validateAssignments(browser, docAndLinkAssignmentName).then(function() {
					copyCoursePage.validateAssignments(browser, CCAssignmnetName).then(function() {
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
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
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

	it(". Log out as instructor", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userSignOut.userSignOut(browser, done);
	});

	it(". Login to 4LTR Platform as instructor", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		data = loginPage.setLoginData("differentInstructor");
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Product", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		brainPage.selectProduct(product, browser, done);
	});

	it(". Select a Course and launch if duplicate course is present on instructor dashboard", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		loginPage.checkIfCoursePresent(browser, copyCourseforDifferentInst).then(function(status) {
			courseNameStatus = status;
			if (courseNameStatus) {
				createNewCoursepo.clickOnManageMyCourse(browser).then(function() {
					pageLoadingTime = 0;
					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
				});
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
					report.reportFooter());
				done();
			}
		});
	});

	it(". Delete the copy Course if any it as part of cleanup", function(done) {
		if (courseNameStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		}
		if (courseNameStatus) {
			clearAllSavedContent.clearCreatedCourse(browser, done, copyCourseforDifferentInst);
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Navigate to Instructor SSO", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		if (courseNameStatus) {
			basicpo.navigateToInstructorDashboard(browser).then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
			});
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Click on create course link", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.clickOnCreateCourseLink(browser).then(function() {
			done();
		});
	});

	it(". SSOFD-497 :: Verify copy course radio button should present", function(done) {
		createNewCoursepo.verifyPresenceOfCopyCourse(browser).then(function(copyCourseRadioButton) {
			if(copyCourseRadioButton){
			console.log(report.reportHeader() +
			report.stepStatusWithData("Copy Course with same instructor radio button presence status",copyCourseRadioButton, "success")
			+ report.reportFooter());
			done();
			}else{
				console.log(report.reportHeader() +
        report.stepStatusWithData("Copy Course with same instructor radio button presence status",copyCourseRadioButton, "failure")
        + report.reportFooter());
			}
		});
	});

	it(". SSOFD-497 :: Verify copy course from  different instructor radio button should present", function(done) {
		createNewCoursepo.verifyPresenceOfCopyCourseDiffInst(browser).then(function(copyCourseDiffInstRadioButton) {
			if(copyCourseDiffInstRadioButton){
			console.log(report.reportHeader() +
			report.stepStatusWithData("Copy Course from different instructor radio button presence status",copyCourseDiffInstRadioButton, "success")
			+ report.reportFooter());
			done();
			}else{
				console.log(report.reportHeader() +
        report.stepStatusWithData("Copy Course from different instructor radio button presence status",copyCourseDiffInstRadioButton, "failure")
        + report.reportFooter());
			}
		});
	});

	it(". Click on copy from another instructor’s course radio button", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.selectCopyCourseFromAnotherInstructorsCourse(browser, courseKey).then(function() {
			done();
		});
	});

	it(". Enter the copied course name for different instructor", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.enterCourseName(browser, copyCourseforDifferentInst).then(function() {
			done();
		});
	});

	it(". Fill in the start date", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.fillTheStartDate(browser).then(function() {
			done();
		});
	});

	it(". Fill the end date with 10 days after the today's date ", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.enterTheEndData(browser, dataUtil.getSpecificDateAfterCurrentDate(setDate)).then(function() {
			done();
		});
	});

	it(". Save the course details", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.saveTheCourseDetail(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	it(". Copy Course key of the copied course for different instructor and validate course CGI appears in url", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser
			.execute("return window.location.href;").then(function(cgi) {
			console.log(cgi);
				courseCGI = cgi.split('products/')[1];
				console.log(courseCGI);
				if (courseCGI !== "undefined") {
					courseCreationStatus = "success";
					console.log("Nirmal   " + courseCreationStatus);
				}
				console.log("Nirmal   outside" + courseCreationStatus + courseCGI);
				browser
					.sleep(1000)
					.nodeify(done);
			});
	});

	it(". Click on course link", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getCourseAggregationTimeOut());
		}
		browser.sleep(courseHelper.getCourseTimeOut()).then(function() {
			createNewCoursepo.launchTheCreatedCourse(browser).then(function() {
				done();
			});
		});
	});

	it(". Wait and launch the course and refresh the page till the aggregation is completed ", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getCourseAggregationTimeOut());
		}
		if (courseCreationStatus !== "failure") {
			browser.execute("window.location.reload();")
				.then(
					function() {
						poll(
							function() {
								console.log("=================== Inside function in Course Aggregation ======================");
								return browser
									.sleep(1000)
									.hasElementByCssSelector("button.welcome-button", function(err, flag) {
										console.log("::Is Welcome Modal present ?" + flag);
										return flag;
									});
							},
							function() {
								console.log("=================== Course Aggregation completed ======================");
								aggregationStatus = "success";
								done();
							},
							function() {
								// Error, failure callback
								console.log("=================== Failure in Course Aggregation ======================");
							}, courseHelper.getCourseAggregationTimeOut(), 10000
						);
					}
				);
		} else {
			userSignOut.userSignOut(browser, done);
		}
	});

	it(". Validate course aggregation status", function (done) {
      browser
        .sleep(2000)
        .title().then(function (courrseTitle) {
        console.log("courrseTitle"+courrseTitle);
        var courseTitleText = courrseTitle;
        if (courseTitleText !== "4LTR" && courseTitleText !== "undefined") {
              courseAggregationStatus = "success";
              console.log(report.reportHeader() +
              report.stepStatusWithData("Course is successfully aggregated "+courseAggregationStatus+" and course title name is ",courseTitleText, "success")
              + report.reportFooter());
              done();
        }else {
            console.log(report.reportHeader() +
            report.stepStatusWithData("Course is successfully aggregated "+courseAggregationStatus+" and course title name is ",courseTitleText, "failure")
            + report.reportFooter());
        }
      });
    });

	it(". Handle EULA", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		if (courseCreationStatus !== "failure") {
			createNewCoursepo.handleEula(browser).then(function() {
				done();
			});
		} else {
			done();
		}
	});

	it(". verify the model UI components", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		var iconcount;
		var textcount;
		createNewCoursepo.eulaIconCount(browser).then(function(elementss) {
			iconcount = _.size(elementss);
			createNewCoursepo.eulaIconRespectiveText(browser).then(function(textelements) {
				textcount = _.size(textelements);
				if (iconcount === textcount) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Icon count " + iconcount + ", which is equal to text count", textcount, "success") +
						report.reportFooter());
					createNewCoursepo.textOfGotItButton(browser).text().then(function(gotItUnderEula) {
						if (gotItUnderEula.indexOf(testData.eula.eulaMessage) > -1) {
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
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.clickOnGotItButton(browser).then(function() {
			done();
		});
	});

	it(". Navigate to assignment view", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userType = "instructor";
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Wait for page loading", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
	});


	it(". Validate all type of assignments peasent on today's date on Copy course ", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		}
		calendarNavigation.clickTheToggleOnCurrentMonth(browser).then(function() {
			copyCoursePage.validateAssignments(browser, assessmentAssignmentName).then(function() {
				copyCoursePage.validateAssignments(browser, docAndLinkAssignmentName).then(function() {
					copyCoursePage.validateAssignments(browser, CCAssignmnetName).then(function() {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Assignments created on original courses are present on the copied course as well ", "success") +
							report.reportFooter());
						done();
					})
				})
			})
		});
	});

	it(". Validate all types of hidden assignments on Copy course", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		}
		calendarNavigation.navigateToNextMonth(browser).then(function() {
			calendarNavigation.clickTheToggleOnNextMonth(browser).then(function() {
				copyCoursePage.validateAssignmentsNextMonth(browser, futureAssessmentname2).then(function() {
					copyCoursePage.validateAssignmentsNextMonth(browser, FutureDocsAndLinkAssignment2).then(function() {
						copyCoursePage.validateAssignmentsNextMonth(browser, FutureChapterReadingAssignment2).then(function() {
							console.log(report.reportHeader() +
								report.stepStatusWithData("All assignments (Current, and assignments unrevealed to students) are visible on the copied course ", "success") +
								report.reportFooter());
							done();
						})
					})
				})
			});
		});
	});

	it(". Log out as Instructor", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userSignOut.userSignOut(browser, done);
	});

	it(". Login as student", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		userType = "student";
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Register the course key of newly created copy course with same instructor ", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		basicpo.getUrl(browser).then(function(currentLocationUrl){
        currentUrl = currentLocationUrl;
    });
		if (courseCreationStatus !== "failure") {
			if(stringutil.removeBoundaryQuotes(process.env.RUN_FOR_REGION.toString()) == "ASI"){
				courseRegistrationpo.enterCourseKey(browser, courseKeyForSameInstructor).then(function() {
					courseRegistrationpo.clickOnRegistration(browser).then(function() {
						courseRegistrationpo.clickOnContinueButton(browser, currentUrl).then(function() {
							pageLoadingTime = 0;
							takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
						});
					});
				});
				}else{
						myCengageDashboardpo.clickOnAddCourseLink(browser).then(function() {
							myCengageDashboardpo.enterCourseKey(browser, courseKeyForSameInstructor).then(function() {
								myCengageDashboardpo.clickOnSubmitBtn(browser).then(function() {
									myCengageDashboardpo.enterTheNewCourse(browser, currentUrl).then(function() {
										pageLoadingTime = 0;
										takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
									});
								});
							});
						});
				}
		} else {
			console.log("inside course aggregation not equal to success");
			done();
		}
	});

	it(". Select a Course and launch", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		}
		userType = "newStudent";
		loginPage.launchACourse(userType, copyCourse, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Handle EULA", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.handleEula(browser).then(function() {
			done();
		});
	});

	it(". verify the model UI components", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getCourseAggregationTimeOut());
		}
		var iconcount;
		var textcount;
		createNewCoursepo.eulaIconCount(browser).then(function(elementss) {
			iconcount = _.size(elementss);
			createNewCoursepo.eulaIconRespectiveText(browser).then(function(textelements) {
				textcount = _.size(textelements);
				if (iconcount === textcount) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Icon count " + iconcount + ", which is equal to text count", textcount, "success") +
						report.reportFooter());
					createNewCoursepo.textOfGotItButton(browser).text().then(function(gotItUnderEula) {
						if (gotItUnderEula.indexOf(testData.eula.eulaMessage) > -1) {
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
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.clickOnGotItButton(browser).then(function() {
			done();
		});
	});

	it(". Navigate to Assignments page", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Wait for page load", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Click on the current date cell", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickCurrentDateCell(browser, done);
	});

	it(". Launch the assignment at student end for copy course with same instructor", function(done) {
		pageLoadingTime = 0;
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		studentAssessmentsPage.launchAssignment(browser, assessmentAssignmentNameOnCurrentDate).then(function() {
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
		pageLoadingTime = 0;
		//Call this function if you want a specific block to timeout after a specific time interval
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("quiz"));
			takeQuizpo.takeQuiz(browser, done);
		}

	});

	it(". Fetch correct questions from quiz results page", function(done) {
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

	it(". Refresh the assignment result page", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment result page is loaded");
			});
	});

	it(". Click on exit button", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.clickExitButtonOnResultsPage(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is attempted");
		});
	});

	it(". Navigate to Gradebook page", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". [Gradebook]Validate the Points earned by the student", function(done) {
		this.retries(3);
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.getScoredPoints(browser, assessmentAssignmentNameOnCurrentDate).then(function(valueScore) {
			if (valueScore.toString() === assessmentsPage.getRoboPointScore(questionsCorrectFromCAS)) {
				pointsFromStudentGradebook = valueScore;
				console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + assessmentsPage.getRoboPointScore(questionsCorrectFromCAS) + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "success") + report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + assessmentsPage.getRoboPointScore(questionsCorrectFromCAS) + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "failure") + report.reportFooter());
			}
		});
	});

	it(". Validate the presence of Class average value on student GradeBook", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.validateAvgScoreOnStudentGradebook(browser, assessmentAssignmentNameOnCurrentDate, pointsFromStudentGradebook, done);
	});


	it(". Validate the presence of submission date on student Gradebook page", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.getSubmittedDate(browser, assessmentAssignmentNameOnCurrentDate)
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
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.getDueDate(browser, assessmentAssignmentNameOnCurrentDate).then(function(dateOnStudentGradebookPage) {
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
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userSignOut.userSignOut(browser, done);
	});

	it(". Login to 4LTR Platform", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userType = "instructor";
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Product", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		brainPage.selectProduct(product, browser, done);
	});

	it(". Select a Course and launch", function(done) {
		userType = "instructor";
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		loginPage.launchACourse(userType, copyCourse, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate on Gradebook page", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userType = "instructor";
		menuPage.selectGradebook("instructor", browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});
	// LTR-5346 is as won't fix
	it.skip(" LTR-5346 :: Verify the presence of total points, student score value in total points on the Instructor GradeBook on the GradeBook table", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
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

	it(". Verify the presence of point gained by the student", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorMainGradebookView.getScoreOfSecondAssignment(browser, loginPage.getUserName()).text()
			.then(function(pointsGained) {
				totalPointsGainedByStudent = pointsGained;
				if (totalPointsGainedByStudent.toString() === assessmentsPage.getRoboPointScore(questionsCorrectFromCAS)) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Total points earned by student " + totalPointsGainedByStudent + ", is compared against the testbot calculated total points earned ", assessmentsPage.getRoboPointScore(questionsCorrectFromCAS), "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Total points earned by student " + totalPointsGainedByStudent + ", is compared against the testbot calculated total points earned ", assessmentsPage.getRoboPointScore(questionsCorrectFromCAS), "failure") +
						report.reportFooter());
				}
			});
	});


	it(". Navigate to student's detailed gradebook view", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		data = loginPage.setLoginData("student");
		instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserName()).then(function() {
			done();
		});

	});

	it(". Wait until page is loaded successfully", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser
			.refresh().sleep(5000).then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});


	it(". LTR-5211 Validate presence of class average value on student detailed page on instructor gradebook view ", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3);
		instructorGradebookStudentDetailedPage.validatePresenceOfAverageScore(browser, assessmentAssignmentNameOnCurrentDate).then(function(classAvg) {
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

	it(". LTR-5211 [Gradebook] Verify whether the system generated student point score is updated on Instructor Gradebook on the Student Detailed assessment Results Page", function(done) {
		this.retries(3);
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.getScoredPoints(browser, assessmentAssignmentNameOnCurrentDate)
			.then(function(scoredPoints) {
				if (scoredPoints.toString() === assessmentsPage.getRoboPointScore(questionsCorrectFromCAS)) {
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

	it(". Validate the presence of due date on student detailed page under instructor gradebook view ", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.getDueDate(browser, assessmentAssignmentNameOnCurrentDate)
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
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(2);
		instructorGradebookStudentDetailedPage.checkSubmittedDate(browser, assessmentAssignmentNameOnCurrentDate, dataUtil.getCurrentDateOnhyphenatedMMDDYYformat())
			.then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Submission date of assignment " + dataUtil.getCurrentDateOnhyphenatedMMDDYYformat() + "  is compared against current date of assignment submission", dataUtil.getCurrentDateOnhyphenatedMMDDYYformat(), "success") +
					report.reportFooter());
				done();
			});

	});

	it(". Drop the student", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookForDropStudent.clickOnDropStudentButton(browser).then(function() {
			instructorGradebookForDropStudent.clickOnYesUnderDialogueBox(browser).text().then(function(mainGradebookPageText) {
				userSignOut.userSignOut(browser, done);
			});
		});
	});

	it(". Login to 4LTR Platform", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		}
		userType = "instructor";
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Product", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		brainPage.selectProduct(product, browser, done);
	});

	it(". Click on manage my course", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		if (courseNameStatus) {
			createNewCoursepo.clickOnManageMyCourse(browser).then(function() {
				done();
			});
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Select the newly created course and delete it as part of cleanup", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		if (courseNameStatus) {
			clearAllSavedContent.clearCreatedCourse(browser, done, copyCourse);
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Re- Login to 4LTR Platform as instructor", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		data = loginPage.setLoginData("differentInstructor");
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Product", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		brainPage.selectProduct(product, browser, done);
	});

	it(". Click on manage my course", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.clickOnManageMyCourse(browser).then(function() {
			done();
		});
	});

	it(". Select the copy Course created course and delete it as part of cleanup", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}else {
			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		}
		if (aggregationStatus !== "success") {
			console.log("inside course aggregation not equal to success");
			userSignOut.userSignOut(browser, done);
		} else {
			console.log("inside course delete else");
			clearAllSavedContent.clearCreatedCourse(browser, done, copyCourseforDifferentInst);
		}
	});

	it(". Login to 4LTR Platform", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userType = "instructor";
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Product", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		brainPage.selectProduct(product, browser, done);
	});

	it(". Select a Course and launch", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		loginPage.launchACourse(userType, courseName, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate to Assignments Page", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Delete the created assignment", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}else {
			this.timeout(courseHelper.getElevatedTimeout(360000));
		}
		assessmentsPage.deleteAssignment(browser, done);
	});

	it(". Close flash on assignment page", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		calendarNavigation.handleTheFlashAlert(browser).then(function() {
			done();
		});
	});

	it(". Log out as Instructor", function(done) {
		if (courseCreationStatus === "failure" || assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userSignOut.userSignOut(browser, done);
	});

	//=============polling===============\\
	function poll(fn, callback, errback, timeout, interval) {
		var endTime = Number(new Date()) + (timeout || 60000);
		interval = interval || 5000;
		aggregationTime = 0;


		console.log("#### Maximum polling time set for Course Aggregation :: " + dataUtil.millisecondsToStr(timeout));

		(function p() {

			fn().then(function(foundFlag) {
				// If the condition is met, we're done!

				if (foundFlag) {
					console.log("### Aggregation completed in :: " + dataUtil.millisecondsToStr(aggregationTime));
					aggregationCompletionTime = dataUtil.millisecondsToStr(aggregationTime);
					callback();

				}
				// If the condition isn't met but the timeout hasn't elapsed, go again
				else if (Number(new Date()) < endTime) {

					aggregationTime = aggregationTime + interval;

					console.log(" Time taken for aggregation " + dataUtil.millisecondsToStr(aggregationTime));

					setTimeout(p, interval);

					browser.execute("window.location.reload();");

				}
				// Didn't match and too much time, reject!
				else {
					console.log(" No match");
					errback(new Error('timed out for ' + fn + ': ' + arguments));
				}

			});


		})();
	}

	function polling(assignmentCGITime, browser, done, astType) {
		astType.checkIfAssignmentSavedOnFuture(browser).then(function(value) {
			 
			if (value.toString() === "rgb(0, 0, 0)") {
				browser.sleep(2000);
				assignmentCGITime = assignmentCGITime + 2000;
				polling(assignmentCGITime, browser, done, astType);
			} else {
				if (value.toString() === "rgb(255, 219, 238)") {
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
});
