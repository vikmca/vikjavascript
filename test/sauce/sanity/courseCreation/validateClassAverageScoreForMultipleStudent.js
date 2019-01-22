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
var mainGradebookView = require("../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/mainGradebookView.js");
var studentAssessmentsPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var instructorGradebookNavigationPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/gradebookNavigationpo");
var instructorGradebookStudentDetailedPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/studentDetailedInfopo");
var instructorGradebookForDropStudent = require("../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/dropStudentFromCourse");
var basicpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var createNewCoursepo = require("../..//support/pageobject/" + pageobject + "/" + envName + "/createNewCoursepo");
var userSignOut = require("../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var assessmentData = require("../../../../test_data/assignments/assessments.json");
var gradebookData = require("../../../../test_data/gradebook/gradebook.json");
var session = require("../../support/setup/browser-session");
var courseRegistrationpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/courseRegistrationpo.js");
var studenGradebookPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/student/gradebookValidationpo");
var casPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var myCengageDashboardpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/myCengageDashboardpo.js");
var testData = require("../../../../test_data/data.json");
var clearAllSavedContent = require("../../support/pageobject/" + pageobject + "/" + envName + "/clearData");
var courseHelper = require("../../support/helpers/courseHelper");
var report = require("../../support/reporting/reportgenerator");
var mathutil = require("../../util/mathUtil");
var dateUtil = require("../../util/date-utility");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'MULTIPLE STUDENT :: VALIDATE CLASS AVERAGE POINTS FOR MORE THAN TWO STUDENTS AND TWO SUBMISSIONS', function() {
	var browser;
	var allPassed = true;
	var userType;
	var setDate;
	var courseName;
	var assignmentCreationStatus = "failure";
	var courseCreationStatus = "failure";
	var aggregationStatus = "failure";
	var aggregationCompletionTime = "Never Completed or took more time than expected";
	var assessmentAssignmentName;
	var pageLoadingTime;
	var courseKey;
	var product;
	var data;
	var productData;
	var totalTime;
	var courseNameStatus = false;
	var questionsCorrect1stAttemptFromCASForStudentA;
	var questionsCorrect2ndAttemptFromCASForStudentA;
	var questionsCorrect1stAttemptFromCASForStudentB;
	var questionsCorrect2ndAttemptFromCASForStudentB;
	var highestValueOfCorrectedQuestionForStudentA;
	var highestValueOfCorrectedQuestionForStudentB;
	var getPointsForStudentB;
	var getPointsForStudentA;
	var classAverage;
	var serialNumber = 0;
	var currentUrl;
	var courseAggregationStatus = "failure";
	var courseAggregatedStatus = false;
	var assessmentCounts = 0;
	var fullDueDate;

	before('VALIDATE CLASS AVERAGE POINTS FOR MORE THAN TWO STUDENTS AND TWO SUBMISSIONS', function(done) {
		browser = session.create(done);
		setDate = testData.courseAccessInformation.DateBeforeToday;
		newCourseData = testData.instructorResourceCenter;
		userType = "instructor";
		product = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString());
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
		courseName = product + " FOR MULTIPLE STUDENT " + process.env.RUN_INDEX;
		console.log(report.formatTestName("VALIDATE CLASS AVERAGE POINTS FOR MORE THAN TWO STUDENTS AND TWO SUBMISSIONS"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("validateClassAverageScoreForMultipleStudent.js"));

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
		this.timeout(courseHelper.getElevatedTimeout());
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
		loginPage.checkIfCoursePresent(browser, courseName).then(function(status) {
			courseNameStatus = status;
			if (courseNameStatus) {
				loginPage.launchACourse(userType, courseName, browser, done);
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
					report.reportFooter());
				userSignOut.signOutFromSSO(userType, browser).then(function() {
					pageLoadingTime = 0;
					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
				});
			}
		});
	});

	it(". Navigate on GradeBook page if any duplicate course is present", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		if (courseNameStatus) {
			basicpo.checkEula(browser).then(function(eula) {
				console.log(eula);
				createNewCoursepo.presenceStatusOfGotItBtn(browser).then(function(gotItBtnStatus) {
					console.log("gotItBtnStatus");
					console.log(report.reportHeader() +
						report.stepStatusWithData("EULA Acceptted", !eula, "success") +
						report.reportFooter());
					basicpo.getTitleOfPage(browser).then(function(pageTitle) {
						console.log("pageTitle" + pageTitle);
						var pageTitleText = pageTitle;
						if (pageTitleText !== "undefined") {
							courseAggregatedStatus = true;
							console.log("courseAggregationStatus   " + courseAggregatedStatus);
							if (courseAggregatedStatus) {
								if (eula) {
									createNewCoursepo.handleEula(browser).then(function() {
										createNewCoursepo.clickOnGotItButton(browser).then(function() {
											menuPage.selectGradebook("instructor", browser, done);
										});
									});
								} else if (gotItBtnStatus) {
									createNewCoursepo.clickOnGotItButton(browser).then(function() {
										menuPage.selectGradebook("instructor", browser, done);
									});
								} else {
									console.log("in else out");
									menuPage.selectGradebook("instructor", browser, done);
								}
							} else {
								userSignOut.userSignOut(browser, done);
							}
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("Course is not aggregated", courseAggregatedStatus, "success") +
								report.reportFooter());
							userSignOut.userSignOut(browser, done);
						}
					});
				});
			});
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Wait until page is loaded successfully", function(done) {
		if (courseNameStatus) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Navigate to student's detailed GradeBook view and drop the student from course if student A is registered on duplicate course", function(done) {
		if (courseNameStatus) {
			if (courseAggregatedStatus) {
				data = loginPage.setLoginData("studentA");
				instructorGradebookNavigationPage.checkIfStudentIsPresent(browser, loginPage.getUserName()).then(function(studentNamePresentStatus) {
					if (studentNamePresentStatus) {
						instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserName()).then(function() {
							instructorGradebookForDropStudent.clickOnDropStudentButton(browser).then(function() {
								instructorGradebookForDropStudent.clickOnYesUnderDialogueBox(browser).text().then(function(mainGradebookPageText) {
									pageLoadingTime = 0;
									takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
								});
							});
						});
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Student is not present", courseNameStatus, "success") +
							report.reportFooter());
						done();
					}
				});
			} else {
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

	it(". Navigate on GradeBook page if course is present", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		if (courseNameStatus) {
			if (courseAggregatedStatus) {
				menuPage.selectGradebook("instructor", browser, done);
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("course is not aggregated", courseAggregatedStatus, "success") +
					report.reportFooter());
				done();
			}
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Course is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Wait until page is loaded successfully", function(done) {
		if (courseNameStatus) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Navigate to student's detailed GradeBook view and drop the student from course if student B is registered on duplicate course", function(done) {
		if (courseNameStatus) {
			if (courseAggregatedStatus) {
				data = loginPage.setLoginData("studentB");
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
						userSignOut.userSignOut(browser, done);
					}
				});
			} else {
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

	it(". Login to 4LTR Platform", function(done) {
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
			clearAllSavedContent.clearCreatedCourse(browser, done, courseName);
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

	it(". Click on create course link", function(done) {
		createNewCoursepo.clickOnCreateCourseLink(browser).then(function() {
			done();
		});
	});


	it(". Verify page navigation by validating the question label within create course page", function(done) {
		createNewCoursepo.verifyTextOnCreateCoursePage(browser, newCourseData.createCourseQuestionLabel).then(function() {
			done();
		});
	});

	it(". Select radio button to create a new course and click on continue button", function(done) {
		createNewCoursepo.selectRadioForCourseType(browser).then(function() {
			done();
		});
	});

	it(". Verify navigation to course information page by validating course information label", function(done) {
		createNewCoursepo.verifyCourseInformationLabel(browser, newCourseData.courseInformationLabel).then(function() {
			done();
		});
	});

	it(". Fill in the new Course name", function(done) {
		createNewCoursepo.enterCourseName(browser, courseName).then(function() {
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
			done();
		});
	});

	it(". Copy Course key", function(done) {
		createNewCoursepo.getCourseKey(browser).then(function(ckey) {
			if (ckey.indexOf("course-confirmation") > -1) {
				coursekeyInitial = stringutil.returnValueAfterSplit(ckey, "course-confirmation/", 1);
				coursekey = stringutil.returnValueAfterSplit(coursekeyInitial, "/", 0);
			} else {
				coursekey = stringutil.returnValueAfterSplit(ckey, "course/", 1);
			}
			console.log("coursekey" + coursekey);
			if (coursekey !== "undefined") {
				coursekeystatus = "success";
			}
			done();
		});
	});

	it(". Click on course link", function(done) {
		this.timeout(courseHelper.getCourseAggregationTimeOut());
		browser.sleep(courseHelper.getCourseTimeOut()).then(function() {
			createNewCoursepo.launchTheCreatedCourse(browser).then(function() {
				done();
			});
		});
	});

	it(". Validate course CGI appears in url", function(done) {
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
									.sleep(3000)
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

	it(". Validate course aggregation status", function(done) {
		browser
			.sleep(2000)
			.title().then(function(courrseTitle) {
				console.log("courrseTitle" + courrseTitle);
				var courseTitleText = courrseTitle;
				if (courseTitleText !== "4LTR" && courseTitleText !== "undefined") {
					courseAggregationStatus = "success";
					console.log(report.reportHeader() +
						report.stepStatusWithData("Course is successfully aggregated " + courseAggregationStatus + " and course title name is ", courseTitleText, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Course is successfully aggregated " + courseAggregationStatus + " and course title name is ", courseTitleText, "failure") +
						report.reportFooter());
				}
			});
	});

	it(". Handle EULA[End User Agreement Licence]", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		if (courseAggregationStatus !== "failure") {
			createNewCoursepo.handleEula(browser).then(function() {
				done();
			});
		} else {
			done();
		}
	});

	it(". verify the model UI components", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
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
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.clickOnGotItButton(browser).then(function() {
			done();
		});
	});

	it(". Navigate to Assignments Page", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Delete the created assignment", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		}
		assessmentsPage.deleteAssignment(browser, done);
	});

	it(". Wait for page load", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Close flash on assignment page", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		calendarNavigation.handleTheFlashAlert(browser).then(function() {
			done();
		});
	});

	it(". Select current date and open the Assessment Type assignment settings page", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		calendarNavigation.selectADateForAssignment(browser).
		then(function() {
			calendarNavigation.selectAssessmentTypeAssignment(browser).then(function() {
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assessment type assignment is selected");
			});
		});
	});

	it(". Complete the CFM Assessment form for system created assignment", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
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
												assessmentData.systemgenerated.scorestrategyhigh.score + ", Edited Attempts :" +
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
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});

	it(". Verify if CFM assessment type assignment gets saved successfully", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		assessmentsPage.checkIfAssignmentSaved(browser).then(function(value) {
			if (value.toString() === "rgb(236, 41, 142)") {
					assessmentCounts++;
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

	it(". Log out as Instructor", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userSignOut.userSignOut(browser, done);
	});

	it(". Login as student with first student's credential named 'Student A'", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		data = loginPage.setLoginData("studentA");
		userType = "student";
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Wait for page load", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Register the course key of newly created course with first student", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		basicpo.getUrl(browser).then(function(currentLocationUrl) {
			currentUrl = currentLocationUrl;
		});
		if (courseAggregationStatus !== "failure") {
			if(stringutil.removeBoundaryQuotes(process.env.RUN_FOR_REGION.toString()) == "ASI"){
				courseRegistrationpo.enterCourseKey(browser, coursekey).then(function() {
					courseRegistrationpo.clickOnRegistration(browser).then(function() {
						courseRegistrationpo.clickOnContinueButton(browser, currentUrl).then(function() {
							pageLoadingTime = 0;
							takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
						});
					});
				});
				}else{
						myCengageDashboardpo.clickOnAddCourseLink(browser).then(function() {
							myCengageDashboardpo.enterCourseKey(browser, coursekey).then(function() {
								myCengageDashboardpo.clickOnSubmitBtn(browser).then(function() {
									myCengageDashboardpo.enterTheNewCourse(browser, currentUrl).then(function() {
										pageLoadingTime = 0;
										takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
									});
								});
							});
						});
				}
			// courseRegistrationpo.enterCourseKey(browser, coursekey).then(function() {
			// 	courseRegistrationpo.clickOnRegistration(browser).then(function() {
			// 		courseRegistrationpo.clickOnContinueButton(browser, currentUrl).then(function() {
			// 			pageLoadingTime = 0;
			// 			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			// 		});
			// 	});
			// });
		} else {
			console.log("inside course aggregation not equal to success");
			done();
		}
	});

	it(". Select a Course and launch", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		loginPage.launchACourse("studentA", courseName, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Handle EULA", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.handleEula(browser).then(function() {
			done();
		});
	});

	it(". Click on 'GOT IT!' button", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.clickOnGotItButton(browser).then(function() {
			done();
		});
	});

	it(". Wait for page load", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Navigate to Assignments page", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Wait for page load", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Click on the current date cell", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickCurrentDateCell(browser, done);
	});

	it(". Launch the assignment for first attempt from first student", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		studentAssessmentsPage.launchAssignment(browser, assessmentAssignmentName).then(function() {
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

	it(". Complete the assignment and exit ", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("quiz"));
			takeQuizpo.takeQuiz(browser, done);
		}

	});

	it(". Fetch correct questions from quiz results page", function(done) {
		casPage.getQuestionsCorrect(browser).then(function(questionsCorrect) {
			console.log("Total Questions Correct " + questionsCorrect);
			questionsCorrect1stAttemptFromCASForStudentA = questionsCorrect;
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

	it(". Click on the current date cell", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickCurrentDateCell(browser, done);
	});

	it(". Launch the CFM assessment type assignment for second attempt from first student", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		studentAssessmentsPage.launchAssignment(browser, assessmentAssignmentName).then(function() {
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

	it(". Complete the CFM assessment type assignment and exit", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("quiz"));
			takeQuizpo.takeQuiz(browser, done);
		}

	});

	it(". Fetch correct questions from assessment results page", function(done) {
		casPage.getQuestionsCorrect(browser).then(function(questionsCorrect) {
			console.log("Total Questions Correct " + questionsCorrect);
			questionsCorrect2ndAttemptFromCASForStudentA = questionsCorrect;
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

	it(". Navigate to GradeBook page", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Retrieve highest score from all attempts taken by student A ", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		var numbers = [questionsCorrect1stAttemptFromCASForStudentA, questionsCorrect2ndAttemptFromCASForStudentA];
		highestValueOfCorrectedQuestionForStudentA = mathutil.getMaximum(numbers);
		getPointsForStudentA = assessmentsPage.getRoboPointScore(highestValueOfCorrectedQuestionForStudentA);
		classAverage = assessmentsPage.getRoboClassAverage(getPointsForStudentA, 0, 1);
		console.log(report.reportHeader() +
			report.stepStatusWithData("Highest corrected question ::" + highestValueOfCorrectedQuestionForStudentA + ", Scored point :: " + getPointsForStudentA + " and Class Average", classAverage, "success") +
			report.reportFooter());
		done();
	});

	it(". Wait until the GradeBook page is loaded successfully", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser
			.refresh().sleep(4000)
			.then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "GradeBook page is loaded");
			});
	});

	it(". [Gradebook]Validate the Points earned by the student A for CFM type assessment", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3);
		browser.sleep(5000);
		studenGradebookPage.getScoredPoints(browser, assessmentAssignmentName).then(function(valueScore) {
			if (valueScore.toString() === getPointsForStudentA) {
				console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + getPointsForStudentA + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "success") + report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + getPointsForStudentA + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "failure") + report.reportFooter());
			}
		});
	});

	it(". Validate the presence of Class average value on student GradeBook for CFM type assessment", function(done) {
		this.retries(3);
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.validateAvgScoreOnStudentGradebook(browser, assessmentAssignmentName, classAverage, done);
	});

	it(". Validate the presence of submission date on student GradeBook page for CFM type assessment", function(done) {
		this.retries(3);
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.getSubmittedDate(browser, assessmentAssignmentName)
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

	it(". Validate the presence of due date on student GradeBook page for CFM type assessment", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3);
		studenGradebookPage.getDueDate(browser, assessmentAssignmentName).then(function(dateOnStudentGradebookPage) {
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

	it(". Log out as Student A", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userSignOut.userSignOut(browser, done);
	});

	it(". Wait for page load", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Login as student B", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		data = loginPage.setLoginData("studentB");
		userType = "student";
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Wait for page load", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Register the course key of newly created course with second student", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		if (courseAggregationStatus !== "failure") {
			if(stringutil.removeBoundaryQuotes(process.env.RUN_FOR_REGION.toString()) == "ASI"){
				courseRegistrationpo.enterCourseKey(browser, coursekey).then(function() {
					courseRegistrationpo.clickOnRegistration(browser).then(function() {
						courseRegistrationpo.clickOnContinueButton(browser, currentUrl).then(function() {
							pageLoadingTime = 0;
							takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
						});
					});
				});
				}else{
						myCengageDashboardpo.clickOnAddCourseLink(browser).then(function() {
							myCengageDashboardpo.enterCourseKey(browser, coursekey).then(function() {
								myCengageDashboardpo.clickOnSubmitBtn(browser).then(function() {
									myCengageDashboardpo.enterTheNewCourse(browser, currentUrl).then(function() {
										pageLoadingTime = 0;
										takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
									});
								});
							});
						});
				}
			// courseRegistrationpo.enterCourseKey(browser, coursekey).then(function() {
			// 	courseRegistrationpo.clickOnRegistration(browser).then(function() {
			// 		courseRegistrationpo.clickOnContinueButton(browser, currentUrl).then(function() {
			// 			pageLoadingTime = 0;
			// 			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			// 		});
			// 	});
			// });
		} else {
			console.log("inside course aggregation not equal to success");
			done();
		}
	});

	it(". Select a Course and launch", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		loginPage.launchACourse("studentB", courseName, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Handle EULA[End User Agreement Licence]", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.handleEula(browser).then(function() {
			done();
		});
	});

	it(". Click on 'GOT IT!' button", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.clickOnGotItButton(browser).then(function() {
			done();
		});
	});

	it(". Wait for page load", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Navigate to Assignments page", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Wait for page load", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Click on the current date cell", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickCurrentDateCell(browser, done);
	});

	it(". Launch the assignment for first attempt from student B", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		studentAssessmentsPage.launchAssignment(browser, assessmentAssignmentName).then(function() {
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
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("quiz"));
			takeQuizpo.takeQuiz(browser, done);
		}

	});

	it(". Fetch correct questions from quiz results page", function(done) {
		casPage.getQuestionsCorrect(browser).then(function(questionsCorrect) {
			console.log("Total Questions Correct " + questionsCorrect);
			questionsCorrect1stAttemptFromCASForStudentB = questionsCorrect;
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

	it(". Click on the current date cell", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickCurrentDateCell(browser, done);
	});

	it(". Launch the assignment for second attempt from student B", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		studentAssessmentsPage.launchAssignment(browser, assessmentAssignmentName).then(function() {
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
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("quiz"));
			takeQuizpo.takeQuiz(browser, done);
		}

	});

	it(". Fetch correct questions from quiz results page", function(done) {
		casPage.getQuestionsCorrect(browser).then(function(questionsCorrect) {
			console.log("Total Questions Correct " + questionsCorrect);
			questionsCorrect2ndAttemptFromCASForStudentB = questionsCorrect;
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


	it(". Navigate to GradeBook page", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Retrieve highest score from second student's(Student B) attempts", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		var numbers = [questionsCorrect1stAttemptFromCASForStudentB, questionsCorrect2ndAttemptFromCASForStudentB];
		highestValueOfCorrectedQuestionForStudentB = mathutil.getMaximum(numbers);
		getPointsForStudentB = assessmentsPage.getRoboPointScore(highestValueOfCorrectedQuestionForStudentB);
		classAverage = assessmentsPage.getRoboClassAverage(getPointsForStudentA, getPointsForStudentB, 2);
		console.log(report.reportHeader() +
			report.stepStatusWithData("Highest corrected question ::" + highestValueOfCorrectedQuestionForStudentB + ", Scored point :: " + getPointsForStudentB + " and Class Average", classAverage, "success") +
			report.reportFooter());
		done();
	});

	it(". Wait until the GradeBook page is loaded successfully", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser
			.refresh()
			.then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "GradeBook page is loaded");
			});
	});

	it(". [Gradebook]Validate the Points earned by the student B", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3);
		browser.sleep(5000);
		studenGradebookPage.getScoredPoints(browser, assessmentAssignmentName).then(function(valueScore) {
			if (valueScore.toString() == getPointsForStudentB.toString()) {
				console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + getPointsForStudentB + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "success") + report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + getPointsForStudentB + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "failure") + report.reportFooter());
			}
		});
	});

	it.skip(" [Gradebook]Validate the Score(Questions Correct) data on Student Gradebook", function(done) {
		this.retries(3);
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("gradebook"));
		}
		// if (process.env.RUN_ENV.toString() === "\"integration\"" || process.env.RUN_ENV.toString() === "\"staging\"" ) {
		studenGradebookPage.checkStudentScore(browser, assessmentAssignmentName, highestValueOfCorrectedQuestionForStudentB).then(function() {
			console.log(report.reportHeader() +
				report.stepStatusWithData("GRADEBOOK : Questions correct retrieved from Student Assessment Results page which is " + questionsCorrect2ndAttemptFromCASForStudentB + " questions, is compared against the student score(Questions correct) retrieved from Student GradeBook ", questionsCorrect2ndAttemptFromCASForStudentB, "success") +
				report.reportFooter());
			done();
		});
	});

	it(". Validate the presence of Class average value on student GradeBook after submitting by both students", function(done) {
		this.retries(3);
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studenGradebookPage.validateAvgScoreOnStudentGradebook(browser, assessmentAssignmentName, classAverage, done);
	});

	it(". Validate the presence of submission date on student GradeBook page", function(done) {
		this.retries(3);
		if (courseAggregationStatus === "failure") {
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

	it(". Validate the presence of due date on student GradeBook page", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3);
		studenGradebookPage.getDueDate(browser, assessmentAssignmentName).then(function(dateOnStudentGradebookPage) {
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
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userSignOut.userSignOut(browser, done);
	});

	it(". Login to 4LTR Platform", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userType = "instructor";
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Product", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		brainPage.selectProduct(product, browser, done);
	});

	it(". Select a Course and launch", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		loginPage.launchACourse(userType, courseName, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});


	it(". Navigate on Gradebook page", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Navigate to student's(Student A) detailed gradebook view", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		data = loginPage.setLoginData("studentA");
		instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserName()).then(function() {
			done();
		});
	});

	it(". Wait until page is loaded successfully", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser
			.refresh().sleep(5000).then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Validate presence of class average value on student detailed page on instructor GradeBook view for student A", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3);
		instructorGradebookStudentDetailedPage.validatePresenceOfAverageScore(browser, assessmentAssignmentName).then(function(classAvgScore) {
			if (parseInt(classAvgScore) == classAverage) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment on student detailed GradeBook view ::  " + classAvgScore, "is compared against the calculated class average ::" + classAverage, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment on student detailed GradeBook view ::  " + classAvgScore, "is compared against the calculated class average ::" + classAverage, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". [Gradebook] Verify whether the system generated student point score is updated on Instructor GradeBook on the Student Detailed Results Page for student A", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3);
		instructorGradebookStudentDetailedPage.getScoredPoints(browser, assessmentAssignmentName)
			.then(function(scoredPoints) {
				if (parseInt(scoredPoints) == getPointsForStudentA) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + getPointsForStudentA + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + getPointsForStudentA + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "failure") +
						report.reportFooter());
				}

			});
	});

	it(". Navigate on Gradebook page", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookNavigationPage.navigateToGradebookViewFromStudentDetailedPage(browser).then(function() {
			done();
		});
	});

	it(". Wait until page is loaded successfully", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Navigate to student's(Student B) detailed gradebook view", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		data = loginPage.setLoginData("studentB");
		instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserName()).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Wait until page is loaded successfully", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Validate presence of class average value on student detailed page on instructor GradeBook view for student B", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3);
		browser.sleep(5000);
		instructorGradebookStudentDetailedPage.validatePresenceOfAverageScore(browser, assessmentAssignmentName).then(function(classAvgScore) {
			if (parseInt(classAvgScore) == classAverage) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment on student detailed GradeBook view ::  " + classAvgScore, "is compared against the calculated class average ::" + classAverage, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment on student detailed GradeBook view ::  " + classAvgScore, "is compared against the calculated class average ::" + classAverage, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". [Gradebook] Verify whether the system generated student point score is updated on Instructor GradeBook on the Student Detailed Results Page for student B", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3);
		instructorGradebookStudentDetailedPage.getScoredPoints(browser, assessmentAssignmentName)
			.then(function(scoredPoints) {
				if (parseInt(scoredPoints) == getPointsForStudentB) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + getPointsForStudentB + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + getPointsForStudentB + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "failure") +
						report.reportFooter());
				}

			});
	});

	it(". Navigate on Gradebook page", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});
	// if (process.env.RUN_ENV.toString() === "\"integration\"" || process.env.RUN_ENV.toString() === "\"staging\"") {

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

		it(". Validate Filter toggle button should appear on the page", function(done) {
			mainGradebookView.filterButtonPresenceStatus(browser).then(function(filterBtnPresenceStatus) {
				if (filterBtnPresenceStatus) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Filter button is appearing", filterBtnPresenceStatus, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Filter button is appearing", filterBtnPresenceStatus, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Click on filter button and validate that filter button gets expanded", function(done) {
			mainGradebookView.clickOnFilterBtn(browser).then(function() {
				mainGradebookView.getFilterBtnExpandedStatus(browser).then(function(filterBtnExpanedStatus) {
					if (filterBtnExpanedStatus) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : Filter button gets expanded", filterBtnExpanedStatus, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : Filter button gets expanded", filterBtnExpanedStatus, "failure") +
							report.reportFooter());
					}
				});
			});
		});

		it(". Verify default value of due date from and to date", function(done) {
			mainGradebookView.dueDateToValue(browser).then(function(dueDateTo) {
				mainGradebookView.dueDateFromValue(browser).then(function(dueDateFrom) {
					if (dueDateFrom === gradebookData.instructorgradebook.dueDateFromAndTo && dueDateFrom === gradebookData.instructorgradebook.dueDateFromAndTo) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : Due date To " + dueDateFrom + " and Due Date From " + dueDateFrom + " is compared with", gradebookData.instructorgradebook.dueDateFromAndTo, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : Due date To " + dueDateFrom + " and Due Date From " + dueDateFrom + " is compared with", gradebookData.instructorgradebook.dueDateFromAndTo, "failure") +
							report.reportFooter());
					}
				});
			});
		});

		it(". Validate Student name and due date range label should be appeared", function(done) {
			mainGradebookView.getStudentNameLabelText(browser).then(function(studentNameLabelText) {
				mainGradebookView.getDueDateRangeText(browser).then(function(dueDateRangeText) {
					if (studentNameLabelText === "Student Name" && dueDateRangeText === "Due Date Range") {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : Student name label " + studentNameLabelText + " and Due Date Range ", dueDateRangeText, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : Input box is appearing on gradebook page for filter student by name", studentFilterBoxPresenceStatus, "failure") +
							report.reportFooter());
					}
				});
			});
		});


		it(". Validate Student name and due date range icon should be appeared", function(done) {
			mainGradebookView.getStudentNameIcon(browser).then(function(getStudentNameIconStatus) {
				mainGradebookView.getDueDateRangeIcon(browser).then(function(getDueDateRangeIconStatus) {
					if (getStudentNameIconStatus && getDueDateRangeIconStatus) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : Student name icon presence status " + getStudentNameIconStatus + " and Due Date Range icon presence status", getDueDateRangeIconStatus, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : Student name icon presence status " + getStudentNameIconStatus + " and Due Date Range icon presence status", getDueDateRangeIconStatus, "failure") +
							report.reportFooter());
					}
				});
			});
		});

		it(". Validate input box is appearing on gradebook page for filter student by name", function(done) {
			mainGradebookView.studentFilterBoxPresenceStatus(browser).then(function(studentFilterBoxPresenceStatus) {
				if (studentFilterBoxPresenceStatus) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Input box is appearing on gradebook page for filter student by name", studentFilterBoxPresenceStatus, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Input box is appearing on gradebook page for filter student by name", studentFilterBoxPresenceStatus, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Validate two students are appearing on gradebook", function(done) {
			mainGradebookView.getTotalStudentsCount(browser).then(function(countOfTotalStudent) {
				var countOfTotalStudents = _.size(countOfTotalStudent);
				if (countOfTotalStudents === 2) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Total no of students on gradebook " + countOfTotalStudents + " is compared with", 2, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Total no of students on gradebook " + countOfTotalStudents + " is compared with", 2, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Enter first student's name(Student A) in filter box and validate that second student B is appeared after filter", function(done) {
			data = loginPage.setLoginData("studentA");
			mainGradebookView.enterStudentNameInInputBox(browser, loginPage.getUserName()).then(function() {
				mainGradebookView.getTotalStudentsCount(browser).then(function(countOfTotalStudent) {
					var countOfTotalStudents = _.size(countOfTotalStudent);
					if (countOfTotalStudents === 1) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : Total no of students on gradebook " + countOfTotalStudents + " is compared with", 1, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : Total no of students on gradebook " + countOfTotalStudents + " is compared with", 1, "failure") +
							report.reportFooter());
					}
				});
			});
		});

		it(". Validate correct student details is appeared after filter", function(done) {
			data = loginPage.setLoginData("studentA");
			mainGradebookView.getStudentNameOnGradebook(browser).then(function(studentName) {
				if (studentName.indexOf(loginPage.getUserName()) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Student's Name typed for filtering " + loginPage.getUserName() + " is compared with", studentName, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Student's Name typed for filtering " + loginPage.getUserName() + " is compared with", studentName, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Enter 2nd student's name and validate that one student is appeared after filter", function(done) {
			data = loginPage.setLoginData("studentB");
			mainGradebookView.clearStudentName(browser).then(function() {
				mainGradebookView.enterStudentNameInInputBox(browser, loginPage.getUserName()).then(function() {
					mainGradebookView.getTotalStudentsCount(browser).then(function(countOfTotalStudent) {
						var countOfTotalStudents = _.size(countOfTotalStudent);
						if (countOfTotalStudents === 1) {
							console.log(report.reportHeader() +
								report.stepStatusWithData("GRADEBOOK : Total no of students on gradebook " + countOfTotalStudents + " is compared with", 1, "success") +
								report.reportFooter());
							done();
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("GRADEBOOK : Total no of students on gradebook " + countOfTotalStudents + " is compared with", 1, "failure") +
								report.reportFooter());
						}
					});
				});
			});
		});

		it(". Validate correct student B details is appeared after filter", function(done) {
			data = loginPage.setLoginData("studentB");
			mainGradebookView.getStudentNameOnGradebook(browser).then(function(studentName) {
				if (studentName.indexOf(loginPage.getUserName()) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Student's Name typed for filtering " + loginPage.getUserName() + " is compared with", studentName, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Student's Name typed for filtering " + loginPage.getUserName() + " is compared with", studentName, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Validate reset button for student name should be appeared", function(done) {
			mainGradebookView.studentNameResetButtonPresenceStatus(browser).then(function(studentNameResetPresenceStatus) {
				if (studentNameResetPresenceStatus) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Reset button for student name presence Status", studentNameResetPresenceStatus, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Reset button for student name presence Status", studentNameResetPresenceStatus, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Click on Reset button and validate the value of input box gets reset with blank value", function(done) {
			mainGradebookView.clickOnStudentNameResetButton(browser).then(function() {
				mainGradebookView.getTextOfStudentNameInputBox(browser).then(function(studentNameInputBoxText) {
					if (studentNameInputBoxText == "") {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : Student name input field gets blank on clicking on reset button", studentNameInputBoxText, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : Student name input field gets blank on clicking on reset button", studentNameInputBoxText, "failure") +
							report.reportFooter());
					}
				});
			});
		});

		it(". Navigate to Assignments Page", function(done) {
			menuPage.selectAssignments(userType, browser, done);
		});

		it(". Wait for page load", function(done) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
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


		it(". Complete the CFM Assessment form Setting tab for system created assignment", function(done) {
			pageLoadingTime = 0;
			assessmentsPage.enterName(browser).then(function() {
				assessmentsPage.validateDueAndRevealDateText(browser, assessmentData.systemgenerated.iwillchoose.dueRevealDate).then(function() {
					assessmentsPage.enterDueDateWithSevenDaysAhead(browser).then(function() {
						assessmentsPage.getDueDateText(browser).then(function(getDueDate) {
							console.log(getDueDate);
							fullDueDate = getDueDate;
							var fullDate = stringutil.returnValueAfterSplit(getDueDate, " ", 1);
							getDueDateWhichIsInNextWeek = stringutil.returnValueAfterSplit(fullDate, ",", 0);
							getMonthForNextWeek = stringutil.returnValueAfterSplit(getDueDate, " ", 0);
							assessmentsPage.selectChapter(browser, assessmentData.systemgenerated.iwillchoose.chapter).then(function() {
								assessmentsPage.enterScore(browser, assessmentData.systemgenerated.scorestrategyhigh.score).then(function() {
									assessmentsPage.selectAttempts(browser, assessmentData.systemgenerated.scorestrategyAverage.attempts).then(function() {
										assessmentsPage.selectScoreStrategy(browser, assessmentData.systemgenerated.scorestrategyAverage.scoreStrategy).then(function() {
											assessmentsPage.selectDropLowestScore(browser).then(function() {
												assessmentsPage.selectQuestionStrategy(browser, assessmentData.systemgenerated.QuestionStrategy.option[1]).then(function() {
													assessmentsPage.validateQuestionPerStudentDefaultSelection(browser).then(function() {
														console.log(report.reportHeader() +
															report.stepStatusWithData("Assessment form has been filled by due date" +
																assessmentData.systemgenerated.iwillchoose.dueRevealDate + "chapter :" +
																assessmentData.systemgenerated.iwillchoose.chapter + ", Score :" +
																assessmentData.systemgenerated.scorestrategyhigh.score + ", Number Of Attempts :" +
																assessmentData.systemgenerated.scorestrategyAverage.attempts + ", Question Strategy :" +
																assessmentData.systemgenerated.QuestionStrategy.option[1] + ", Score Strategy : Average(Drop Lowest)" +
																assessmentData.systemgenerated.scorestrategyAverage.scoreStrategy + ", Question Per Student",
																assessmentData.systemgenerated.scorestrategyhigh.questions + "Due Date" + ", " + fullDate, "success") +
															report.reportFooter());
														takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is edited");
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});

		it(". Save the CFM assessment using save/close button", function(done) {
			assessmentsPage.selectFirstQuestion(browser).then(function(elementForQuestion) {
				elementForQuestion.click().then(function() {
					assessmentsPage.saveAssignment(browser).then(function() {
						pageLoadingTime = 0;
						takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
					});
				});
			});
		});

		it(". Verify if CFM assessment gets saved successfully", function(done) {
			console.log("getMonthForNextWeek" + getMonthForNextWeek);
			console.log("dateUtil.getCurrentFullMonthName()" + dateUtil.getCurrentFullMonthName());
			if (dateUtil.getCurrentFullMonthName() == getMonthForNextWeek) {
				assessmentsPage.checkIfAssignmentSavedOnOneWeekAhead(browser, getDueDateWhichIsInNextWeek).then(function(value) {
					if (value.toString() === "rgb(236, 41, 142)") {
						assessmentCounts++;
						assignmentCreationStatus = "success";
						console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName(), "success") + report.reportFooter());
						done();
					} else {
						assignmentCreationStatus = "failure";
						console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName() + " may not have received the assessmentCGI", "failure") + report.reportFooter());
						//  done();
					}
				});
			} else {
				calendarNavigation.navigateToNextMonth(browser).then(function() {
					assessmentsPage.checkIfAssignmentSavedOnOneWeekAhead(browser, getDueDateWhichIsInNextWeek).then(function(value) {
						if (value.toString() === "rgb(236, 41, 142)") {
							assessmentCounts++;
							assignmentCreationStatus = "success";
							console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName(), "success") + report.reportFooter());
							done();
						} else {
							assignmentCreationStatus = "failure";
							console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName() + " may not have received the assessmentCGI", "failure") + report.reportFooter());
							//  done();
						}
					});
				});
			}
		});

		it(". Reload the page nad wait for page load", function(done) {
			browser
				.refresh().then(function() {
					pageLoadingTime = 0;
					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
				});
		});

		it(". Navigate to next month and click on '+' button on first date of next month and select assignment type assignment", function(done) {
			this.timeout(120000);
			pageLoadingTime = 0;
			calendarNavigation.navigateToNextMonth(browser).then(function() {
				calendarNavigation.selectFirstDateFormNextMonth(browser).then(function() {
					calendarNavigation.selectAssessmentTypeAssignment(browser).then(function() {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Instructor has navigated to next month calendar view and assignment type assignment is selected", "", "success") +
							report.reportFooter());
						takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Next month calendar is loaded");
					});
				});
			});
		});

		it(". Complete the CFM Assessment form for system created assignment", function(done) {
			pageLoadingTime = 0;
			assessmentsPage.enterName(browser).then(function() {
				assessmentsPage.enterRevealDate(browser).then(function() {
					assessmentsPage.selectChapter(browser, assessmentData.systemgenerated.scorestrategyhigh.chapter).then(function() {
						assessmentsPage.enterScore(browser, assessmentData.systemgenerated.scorestrategyhigh.score).then(function() {
							assessmentsPage.selectScoreStrategy(browser, assessmentData.systemgenerated.scorestrategyhigh.scoreStrategy).then(function() {
								assessmentsPage.selectQuestionStrategy(browser, assessmentData.systemgenerated.QuestionStrategy.option[0]).then(function() {
									assessmentsPage.enterQuestionsPerStudent(browser, assessmentData.systemgenerated.scorestrategyhigh.questions).then(function() {
										console.log(report.reportHeader() +
											report.stepStatusWithData("Assessment form has been filled by chapter :" +
												assessmentData.systemgenerated.scorestrategyhigh.chapter + ", Score :" +
												assessmentData.systemgenerated.scorestrategyhigh.score + ", Question Strategy :" +
												assessmentData.systemgenerated.QuestionStrategy.option[0] + ", Score Strategy : High(" +
												assessmentData.systemgenerated.scorestrategyhigh.scoreStrategy + "), Question Per Student :",
												assessmentData.systemgenerated.scorestrategyhigh.questions, "success") +
											report.reportFooter());
										takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment form filled");
									});
								});
							});
						});
					});
				});
			});
		});

		it(". Click on preview tab and verify the CFM assessment type assignment questions get loaded successfully", function(done) {
			pageLoadingTime = 0;
			assessmentsPage.clickOnPreviewButtonUnderQuestionTab(browser).then(function() {
				assessmentsPage.validateIfPreviewQuestionIsPresent(browser).then(function() {
					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Preview Tab Loaded");
				});
			});
		});

		it(". Click on Question tab of CFM assessment type assignment", function(done) {
			pageLoadingTime = 0;
			assessmentsPage.clickOnQuestionButtonUnderPreviewTab(browser).then(function() {
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Clicked on question tab");
			});
		});

		it(". Save the CFM assessment type assignment", function(done) {
			pageLoadingTime = 0;
			assessmentsPage.saveAssignment(browser).then(function() {
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
			});
		});

		it(". Verify if CFM assessment type assignment gets saved successfully", function(done) {
			this.timeout(courseHelper.getElevatedTimeout());
			assessmentsPage.checkIfAssignmentSavedOnFutureDate(browser).then(function(value) {
				if (value.toString() === "rgb(236, 41, 142)") {
					assessmentCounts++;
					assignmentCreationStatus = "success";
					console.log(report.reportHeader() +
						report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName(), "success") +
						report.reportFooter());
					done();
				} else {
					assignmentCreationStatus = "failure";
					console.log(report.reportHeader() +
						report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName() + " may not have received the assessmentCGI", "failure") +
						report.reportFooter());
				}
			});
		});


		it(". Navigate on Gradebook page", function(done) {
			if (courseAggregationStatus === "failure") {
				this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
			}
			menuPage.selectGradebook(userType, browser, done);
		});

		it(". Wait until page is loaded successfully", function(done) {
			if (courseAggregationStatus === "failure") {
				this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
			}
			browser
				.refresh().then(function() {
					pageLoadingTime = 0;
					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
				});
		});

		it(". LTR-5350 :: Validate the assignment count with 'Assignments' text should be present below export button", function(done) {
			assessmentsPage.getAssignmentTextBelowExport(browser).text().then(function(assignmentNameTextBelowExport) {
				console.log(assessmentData.systemgenerated.scorestrategyhigh.assignmentsTextBelowExportButton);
				console.log(assignmentNameTextBelowExport);
				if (assignmentNameTextBelowExport === assessmentCounts + " " + assessmentData.systemgenerated.scorestrategyhigh.assignmentsTextBelowExportButton) {
					console.log(report.reportHeader() +
						report.stepStatusWithData(" assignment count with '" + assessmentCounts + " " + assessmentData.systemgenerated.scorestrategyhigh.assignmentsTextBelowExportButton + "' text is present below export button", assignmentNameTextBelowExport, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData(" assignment count with '" + assessmentCounts + " " + assessmentData.systemgenerated.scorestrategyhigh.assignmentsTextBelowExportButton + "' text is present below export button", assignmentNameTextBelowExport, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Validate Filter toggle button should appear on the page", function(done) {
			mainGradebookView.filterButtonPresenceStatus(browser).then(function(filterBtnPresenceStatus) {
				if (filterBtnPresenceStatus) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Filter button is appearing", filterBtnPresenceStatus, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Filter button is appearing", filterBtnPresenceStatus, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Click on filter button and validate that filter button gets expanded", function(done) {
			mainGradebookView.clickOnFilterBtn(browser).then(function() {
				mainGradebookView.getFilterBtnExpandedStatus(browser).then(function(filterBtnExpanedStatus) {
					if (filterBtnExpanedStatus) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : Filter button gets expanded", filterBtnExpanedStatus, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : Filter button gets expanded", filterBtnExpanedStatus, "failure") +
							report.reportFooter());
					}
				});
			});
		});

		it(". Verify default value of due date from and to date after creating multiple assignments on different date", function(done) {
			mainGradebookView.dueDateToValue(browser).then(function(dueDateTo) {
			console.log("dueDateTo"+dueDateTo);
				mainGradebookView.dueDateFromValue(browser).then(function(dueDateFrom) {
					if((parseInt(getDueDateWhichIsInNextWeek) > 1) && (parseInt(getDueDateWhichIsInNextWeek) <=7)){
					if (dueDateTo === fullDueDate && dueDateFrom === gradebookData.instructorgradebook.dueDateFromAndTo) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : Due date To " + dueDateTo + " and Due Date From " + dueDateFrom + " is compared with "+fullDueDate+" and ", gradebookData.instructorgradebook.dueDateFromAndTo, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : Due date To " + dueDateTo + " and Due Date From " + dueDateFrom + " is compared with "+fullDueDate+" and ", gradebookData.instructorgradebook.dueDateFromAndTo, "failure") +
							report.reportFooter());
					}
				}else{
						if (dueDateTo === dateUtil.getFirstDateOfNextMonth() && dueDateFrom === gradebookData.instructorgradebook.dueDateFromAndTo) {
							console.log(report.reportHeader() +
								report.stepStatusWithData("GRADEBOOK : Due date To " + dueDateTo + " and Due Date From " + dueDateFrom + " is compared with "+fullDueDate+" and ", gradebookData.instructorgradebook.dueDateFromAndTo, "success") +
								report.reportFooter());
							done();
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("GRADEBOOK : Due date To " + dueDateTo + " and Due Date From " + dueDateFrom + " is compared with "+fullDueDate+" and ", gradebookData.instructorgradebook.dueDateFromAndTo, "failure") +
								report.reportFooter());
						}
					}
				});
			});
		});

		it(". Click on due date to calendar and select current date", function(done) {
			mainGradebookView.clickOnDueDateToOrFrom(browser, 2).then(function() {
				mainGradebookView.clickOnPreviousMonthBtn(browser).then(function() {
					mainGradebookView.clickOnTodayDate(browser).then(function() {
						mainGradebookView.dueDateToValue(browser).then(function(dueDateTo) {
							mainGradebookView.dueDateFromValue(browser).then(function(dueDateFrom) {
								if (dueDateFrom === gradebookData.instructorgradebook.dueDateFromAndTo && dueDateFrom === gradebookData.instructorgradebook.dueDateFromAndTo) {
									console.log(report.reportHeader() +
										report.stepStatusWithData("GRADEBOOK : After filter Due date To " + dueDateFrom + " and Due Date From " + dueDateFrom + " is compared with", gradebookData.instructorgradebook.dueDateFromAndTo, "success") +
										report.reportFooter());
									done();
								} else {
									console.log(report.reportHeader() +
										report.stepStatusWithData("GRADEBOOK : After filter Due date To " + dueDateFrom + " and Due Date From " + dueDateFrom + " is compared with", gradebookData.instructorgradebook.dueDateFromAndTo, "failure") +
										report.reportFooter());
								}
							});
						});
					});
				});
			});
		});

		it(". Validate the assessment count below export button", function(done) {
			mainGradebookView.getAssessmentCountBelowExport(browser).then(function(assessmentCount) {
				var excludedAssessmentCounts = assessmentCounts -1;
					var assessmentCountTextAfterFilter = assessmentData.systemgenerated.scorestrategyhigh.assignmentTextBelowExportButton + " ("+excludedAssessmentCounts+ " excluded by filter)";
					if(assessmentCount === assessmentCountTextAfterFilter){
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : After filter assessment count is "+assessmentCount+" is compared with", assessmentCountTextAfterFilter, "success") +
							report.reportFooter());
						done();
					}else{
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : After filter assessment count is "+assessmentCount+" is compared with", assessmentCountTextAfterFilter, "failure") +
							report.reportFooter());
					}
			});
		});


		it(". Validate the assessment gets filtered", function(done) {
			mainGradebookView.getAssessmentCounts(browser).then(function(assessmentCountsOnGradebook) {
			mainGradebookView.getFilteredAssessmentText(browser).then(function(assessmentText) {
				if(_.size(assessmentCountsOnGradebook) === 1 && assessmentText === assessmentAssignmentName){
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : After filter assessment count is "+assessmentCountsOnGradebook+" is compared with 1 and assessment text is "+assessmentText+" is compared with", assessmentAssignmentName, "success") +
							report.reportFooter());
						done();
					}else{
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : After filter assessment count is "+assessmentCountsOnGradebook+" is compared with 1 and assessment text is "+assessmentText+" is compared with", assessmentAssignmentName, "failure") +
							report.reportFooter());
					}
				});
			});
		});

		it(". Next button should be disabled as no other assignment should be present", function(done) {
			mainGradebookView.nextBtnDisableStatus(browser).then(function(nextButtonDisableStatus) {
				if(nextButtonDisableStatus){
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : After filter next button disabled status as no other assignment should be present", nextButtonDisableStatus, "success") +
							report.reportFooter());
						done();
					}else{
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : After filter next button disabled status as no other assignment should be present", nextButtonDisableStatus, "failure") +
							report.reportFooter());
					}
				});
			});

		it(". Click on reset due date range button and validate due date range should be reset with default value", function(done) {
			mainGradebookView.resetDueDateRange(browser).then(function() {
				mainGradebookView.dueDateToValue(browser).then(function(dueDateTo) {
					mainGradebookView.dueDateFromValue(browser).then(function(dueDateFrom) {
						if((parseInt(getDueDateWhichIsInNextWeek) > 1) && (parseInt(getDueDateWhichIsInNextWeek) <=7)){
						if (dueDateTo === fullDueDate && dueDateFrom === gradebookData.instructorgradebook.dueDateFromAndTo) {
							console.log(report.reportHeader() +
								report.stepStatusWithData("GRADEBOOK : Due date To " + dueDateTo + " and Due Date From " + dueDateFrom + " is compared with "+fullDueDate+" and ", gradebookData.instructorgradebook.dueDateFromAndTo, "success") +
								report.reportFooter());
							done();
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("GRADEBOOK : Due date To " + dueDateTo + " and Due Date From " + dueDateFrom + " is compared with "+fullDueDate+" and ", gradebookData.instructorgradebook.dueDateFromAndTo, "failure") +
								report.reportFooter());
						}
					}else{
							if (dueDateTo === dateUtil.getFirstDateOfNextMonth() && dueDateFrom === gradebookData.instructorgradebook.dueDateFromAndTo) {
								console.log(report.reportHeader() +
									report.stepStatusWithData("GRADEBOOK : Due date To " + dueDateTo + " and Due Date From " + dueDateFrom + " is compared with "+fullDueDate+" and ", gradebookData.instructorgradebook.dueDateFromAndTo, "success") +
									report.reportFooter());
								done();
							} else {
								console.log(report.reportHeader() +
									report.stepStatusWithData("GRADEBOOK : Due date To " + dueDateTo + " and Due Date From " + dueDateFrom + " is compared with "+fullDueDate+" and ", gradebookData.instructorgradebook.dueDateFromAndTo, "failure") +
									report.reportFooter());
							}
						}
					});
				});
			});
		});

		it(". LTR-5350 :: Validate the assignment count with 'Assignments' text should be present below export button", function(done) {
			assessmentsPage.getAssignmentTextBelowExport(browser).text().then(function(assignmentNameTextBelowExport) {
				if (assignmentNameTextBelowExport === assessmentCounts + " " + assessmentData.systemgenerated.scorestrategyhigh.assignmentsTextBelowExportButton) {
					console.log(report.reportHeader() +
						report.stepStatusWithData(" assignment count with '" + assessmentCounts + " " + assessmentData.systemgenerated.scorestrategyhigh.assignmentsTextBelowExportButton + "' text is present below export button", assignmentNameTextBelowExport, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData(" assignment count with '" + assessmentCounts + " " + assessmentData.systemgenerated.scorestrategyhigh.assignmentsTextBelowExportButton + "' text is present below export button", assignmentNameTextBelowExport, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Enter 2nd student's name and validate that one student is appeared after filter", function(done) {
			data = loginPage.setLoginData("studentB");
			mainGradebookView.clearStudentName(browser).then(function() {
				mainGradebookView.enterStudentNameInInputBox(browser, loginPage.getUserName()).then(function() {
					mainGradebookView.getTotalStudentsCount(browser).then(function(countOfTotalStudent) {
						var countOfTotalStudents = _.size(countOfTotalStudent);
						if (countOfTotalStudents === 1) {
							console.log(report.reportHeader() +
								report.stepStatusWithData("GRADEBOOK : Total no of students on gradebook " + countOfTotalStudents + " is compared with", 1, "success") +
								report.reportFooter());
							done();
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("GRADEBOOK : Total no of students on gradebook " + countOfTotalStudents + " is compared with", 1, "failure") +
								report.reportFooter());
						}
					});
				});
			});
		});


		it(". Click on due date to calendar and select current date", function(done) {
			mainGradebookView.clickOnDueDateToOrFrom(browser, 2).then(function() {
				mainGradebookView.clickOnPreviousMonthBtn(browser).then(function() {
					mainGradebookView.clickOnTodayDate(browser).then(function() {
						mainGradebookView.dueDateToValue(browser).then(function(dueDateTo) {
							mainGradebookView.dueDateFromValue(browser).then(function(dueDateFrom) {
								if (dueDateFrom === gradebookData.instructorgradebook.dueDateFromAndTo && dueDateFrom === gradebookData.instructorgradebook.dueDateFromAndTo) {
									console.log(report.reportHeader() +
										report.stepStatusWithData("GRADEBOOK : After filter Due date To " + dueDateFrom + " and Due Date From " + dueDateFrom + " is compared with", gradebookData.instructorgradebook.dueDateFromAndTo, "success") +
										report.reportFooter());
									done();
								} else {
									console.log(report.reportHeader() +
										report.stepStatusWithData("GRADEBOOK : After filter Due date To " + dueDateFrom + " and Due Date From " + dueDateFrom + " is compared with", gradebookData.instructorgradebook.dueDateFromAndTo, "failure") +
										report.reportFooter());
								}
							});
						});
					});
				});
			});
		});

		it(". Click on reset all filter and validate student name and due date range should be reset with default value", function(done) {
			mainGradebookView.resetDueDateRange(browser).then(function() {
				mainGradebookView.dueDateToValue(browser).then(function(dueDateTo) {
					mainGradebookView.dueDateFromValue(browser).then(function(dueDateFrom) {
						if((parseInt(getDueDateWhichIsInNextWeek) > 1) && (parseInt(getDueDateWhichIsInNextWeek) <=7)){
						if (dueDateTo === fullDueDate && dueDateFrom === gradebookData.instructorgradebook.dueDateFromAndTo) {
							console.log(report.reportHeader() +
								report.stepStatusWithData("GRADEBOOK : Due date To " + dueDateTo + " and Due Date From " + dueDateFrom + " is compared with "+fullDueDate+" and ", gradebookData.instructorgradebook.dueDateFromAndTo, "success") +
								report.reportFooter());
							done();
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("GRADEBOOK : Due date To " + dueDateTo + " and Due Date From " + dueDateFrom + " is compared with "+fullDueDate+" and ", gradebookData.instructorgradebook.dueDateFromAndTo, "failure") +
								report.reportFooter());
						}
					}else{
							if (dueDateTo === dateUtil.getFirstDateOfNextMonth() && dueDateFrom === gradebookData.instructorgradebook.dueDateFromAndTo) {
								console.log(report.reportHeader() +
									report.stepStatusWithData("GRADEBOOK : Due date To " + dueDateTo + " and Due Date From " + dueDateFrom + " is compared with "+fullDueDate+" and ", gradebookData.instructorgradebook.dueDateFromAndTo, "success") +
									report.reportFooter());
								done();
							} else {
								console.log(report.reportHeader() +
									report.stepStatusWithData("GRADEBOOK : Due date To " + dueDateTo + " and Due Date From " + dueDateFrom + " is compared with "+fullDueDate+" and ", gradebookData.instructorgradebook.dueDateFromAndTo, "failure") +
									report.reportFooter());
							}
						}
					});
				});
			});
		});

		it(". Validate that student name should also reset with default value", function(done) {
			mainGradebookView.getTextOfStudentNameInputBox(browser).then(function(studentNameInputBoxText) {
				if (studentNameInputBoxText == "") {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Student name input field gets blank on clicking on reset button", studentNameInputBoxText, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Student name input field gets blank on clicking on reset button", studentNameInputBoxText, "failure") +
						report.reportFooter());
				}
			});
		});


	it(". Navigate on GradeBook page if any duplicate course is present", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		if (courseNameStatus) {
			menuPage.selectGradebook("instructor", browser, done);
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Wait until page is loaded successfully", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		if (courseNameStatus) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Navigate to student's detailed GradeBook view if student A is registered on duplicate course", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		if (courseNameStatus) {
			data = loginPage.setLoginData("studentA");
			instructorGradebookNavigationPage.checkIfStudentIsPresent(browser, loginPage.getUserName()).then(function(studentNamePresentStatus) {
				if (studentNamePresentStatus) {
					instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserName()).then(function() {
						instructorGradebookForDropStudent.clickOnDropStudentButton(browser).then(function() {
							instructorGradebookForDropStudent.clickOnYesUnderDialogueBox(browser).text().then(function(mainGradebookPageText) {
								pageLoadingTime = 0;
								takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
							});
						});
					});
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
						report.reportFooter());
					done();
				}
			});
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Navigate on GradeBook page if any duplicate course is present", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		if (courseNameStatus) {
			menuPage.selectGradebook("instructor", browser, done);
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Wait until page is loaded successfully", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		if (courseNameStatus) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Navigate to student's detailed GradeBook view if student B is registered on duplicate course", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		if (courseNameStatus) {
			data = loginPage.setLoginData("studentB");
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
					userSignOut.userSignOut(browser, done);
				}
			});
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Login to 4LTR Platform", function(done) {
		if (courseAggregationStatus === "failure") {
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
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		brainPage.selectProduct(product, browser, done);
	});


	it(". Click on manage my course", function(done) {
		if (courseAggregationStatus === "failure") {
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
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		if (courseNameStatus) {
			clearAllSavedContent.clearCreatedCourse(browser, done, courseName);
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			done();
		}
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

});
