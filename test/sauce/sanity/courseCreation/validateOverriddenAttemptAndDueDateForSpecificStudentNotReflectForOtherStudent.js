var wd = require('wd');
var asserters = wd.asserters;
var _ = require('underscore');
var dataUtil = require("../../util/date-utility");
var stringutil = require("../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var menuPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var calendarNavigation = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/navigationpo");
var assessmentsPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assessmentspo");
var studentAssessmentsPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var instructorGradebookNavigationPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/gradebookNavigationpo");
var instructorGradebookStudentDetailedPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/studentDetailedInfopo");
var instructorGradebookForDropStudent = require("../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/dropStudentFromCourse");
var instructorMainGradebookView = require("../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/mainGradebookView");
var basicpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var brainPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var createNewCoursepo = require("../..//support/pageobject/" + pageobject + "/" + envName + "/createNewCoursepo");
var userSignOut = require("../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var assessmentData = require("../../../../test_data/assignments/assessments.json");
var session = require("../../support/setup/browser-session");
var courseRegistrationpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/courseRegistrationpo.js");
var testData = require("../../../../test_data/data.json");
var clearAllSavedContent = require("../../support/pageobject/" + pageobject + "/" + envName + "/clearData");
var takeQuizpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var myCengageDashboardpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/myCengageDashboardpo.js");
var courseHelper = require("../../support/helpers/courseHelper");
var report = require("../../support/reporting/reportgenerator");
var mathutil = require("../../util/mathUtil");
var currentUrl;
var path = require('path');
var scriptName = path.basename(__filename);

describe(scriptName + 'MULTIPLE STUDENT ::  VALIDATE EDITED ATTEMPT AND DUE DATE FOR SPECIFIC STUDENT IS NOT CHANGING THE SAME FOR OTHERS', function() {
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
	var serialNumber = 0;
	var coursekeystatus;
	var courseAggregationStatus = "failure";
	before('OVERRIDE ATTEMPT AND DUE DATE FOR SPECIFI STUDENT AND VALIDATE CHANGES SHOULD NOT REFLECTED FOR OTHER STUDENTS', function(done) {
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
		console.log(report.formatTestName("OVERRIDE ATTEMPT AND DUE DATE FOR SPECIFI STUDENT AND VALIDATE CHANGES SHOULD NOT REFLECTED FOR OTHER STUDENTS"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("validateOverriddenAttemptAndDueDateForSpecificStudentNotReflectForOtherStudent.js"));

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
				done();
			}
		});
	});

	it(". Navigate on GradeBook page if any duplicate course is present", function(done) {
		if (courseNameStatus) {
			this.timeout(courseHelper.getElevatedTimeout());
			basicpo.checkEula(browser).then(function(eula) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("EULA Acceptted", !eula, "success") +
					report.reportFooter());
				if (eula) {
					createNewCoursepo.handleEula(browser).then(function() {
						createNewCoursepo.clickOnGotItButton(browser).then(function() {
							menuPage.selectGradebook("instructor", browser, done);
						});
					});
				} else {
					menuPage.selectGradebook(userType, browser, done);
				}
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
			pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Navigate to student's detailed GradeBook view and drop the student if student A is registered on duplicate course", function(done) {
		if (courseNameStatus) {
			data = loginPage.setLoginData("studentA");
			console.log(loginPage.getUserName());
			instructorGradebookNavigationPage.checkIfStudentIsPresent(browser, loginPage.getUserName()).then(function(studentNamePresentStatus) {
				if (studentNamePresentStatus) {
					instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserName()).then(function() {
						instructorGradebookForDropStudent.clickOnDropStudentButton(browser).then(function() {
							instructorGradebookForDropStudent.clickOnYesUnderDialogueBox(browser).text().then(function(mainGradebookPageText) {
								pageLoadingTime = 0;
								pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
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
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Navigate on GradeBook page if any duplicate course is present", function(done) {
		if (courseNameStatus) {
			this.timeout(courseHelper.getElevatedTimeout());
			basicpo.checkEula(browser).then(function(eula) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("EULA Acceptted", !eula, "success") +
					report.reportFooter());
				if (eula) {
					createNewCoursepo.handleEula(browser).then(function() {
						createNewCoursepo.clickOnGotItButton(browser).then(function() {
							menuPage.selectGradebook("instructor", browser, done);
						});
					});
				} else {
					menuPage.selectGradebook(userType, browser, done);
				}
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
			pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Navigate to student's detailed GradeBook view and drop the student if student B is registered on duplicate course", function(done) {
		if (courseNameStatus) {
			data = loginPage.setLoginData("studentB");
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
				pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
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

	it(". Validate course aggregated successfully", function(done) {
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

	it(". Handle EULA", function(done) {
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

	it(". Wait until page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
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
		pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
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
				pollingPageLoad(pageLoadingTime, browser, done, "Assessment type assignment is selected");
			});
		});
	});

	it(". Complete the CFM Assessment form for system created assignment", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
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
												assessmentData.systemgenerated.scorestrategyhigh.score + ", Number Of Attempts :" +
												assessmentData.systemgenerated.scorestrategyhigh.editedAttempts + ", Question Strategy :" +
												assessmentData.systemgenerated.QuestionStrategy.option[0] + ", Score Strategy : High(" +
												assessmentData.systemgenerated.scorestrategyhigh.scoreStrategy + "), Question Per Student :",
												assessmentData.systemgenerated.scorestrategyhigh.questions, "success") +
											report.reportFooter());
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

	it(". Save the CFM assessment", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});

	it(". Verify if CFM assessment type assignment saved successfully", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
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

	it(". Log out as Instructor", function(done) {
		if (courseAggregationStatus === "failure") {
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
		data = loginPage.setLoginData("studentA");
		userType = "student";
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Register the course key of newly created course", function(done) {
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
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
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
		pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
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
		pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Click on the current date cell", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickCurrentDateCell(browser, done);
	});

	it(". Validate created assignment is present with desired count of attempt on current date", function(done) {
		pageLoadingTime = 0;
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		studentAssessmentsPage.validateAssignmentIsPresentOnStudentCalendar(browser, assessmentAssignmentName).then(function() {
			studentAssessmentsPage.getTextOfAttempt(browser).text().then(function(attemptsprogressmsg) {
				if (attemptsprogressmsg.indexOf(assessmentData.systemgenerated.scorestrategyhigh.totalAttemptBeforeEdit) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Attempt status on student end", attemptsprogressmsg, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Attempt status on student end", attemptsprogressmsg, "failure") +
						report.reportFooter());
				}
			});
		});
	});

	it(". Log out as Student", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userSignOut.userSignOut(browser, done);
	});

	it(". Login as student", function(done) {
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

	it(". Register the course key of newly created course", function(done) {
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
		pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
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
		pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Click on the current date cell", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickCurrentDateCell(browser, done);
	});

	it(". Validate created assignment is present with desired count of attempt on current date", function(done) {
		pageLoadingTime = 0;
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		studentAssessmentsPage.validateAssignmentIsPresentOnStudentCalendar(browser, assessmentAssignmentName).then(function() {
			studentAssessmentsPage.getTextOfAttempt(browser).text().then(function(attemptsprogressmsg) {
				if (attemptsprogressmsg.indexOf(assessmentData.systemgenerated.scorestrategyhigh.totalAttemptBeforeEdit) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Attempt status on student end", attemptsprogressmsg, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Attempt status on student end", attemptsprogressmsg, "failure") +
						report.reportFooter());
				}
			});
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
		userType = "instructor";
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
		userType = "instructor";
		menuPage.selectGradebook("instructor", browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Navigate to student's detailed gradebook view", function(done) {
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
				pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Edit attempt from the instructor gradebook", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.editedAttemptsFromStudentDetaledViewBeforeTakeAnyAttempt(browser, assessmentAssignmentName).then(function() {
			done();
		});
	});

	it(". Validate attempts edited successfully without any error message", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.editedAttemptOnStudentDetailPageBeforeTakeAnyAttempt(browser, assessmentAssignmentName).then(function(editedAttempt) {
			if (editedAttempt.indexOf("unlimited") > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment edited attempts with", "unlimited", "success") +
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
					report.stepStatusWithData("Assignment edited attempts with", "unlimited", "failure") +
					report.reportFooter());
			}

		});
	});

	it(". Wait until the assignment page is loaded successfully", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser
			.sleep(2000)
			.refresh().then(function() {
				pageLoadingTime = 0;
				pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
			});
	});

	it(". Re-validate edited attempts persist after refreshing the page without any error", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser.sleep(5000);
		instructorGradebookStudentDetailedPage.editedAttemptOnStudentDetailPageBeforeTakeAnyAttempt(browser, assessmentAssignmentName).then(function(editedAttempt) {
			if (editedAttempt.indexOf("unlimited") > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment edited attempts with", "unlimited", "success") +
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
					report.stepStatusWithData("Assignment edited attempts with", "unlimited", "failure") +
					report.reportFooter());
			}

		});
	});

	it(". Edit due date for current student", function(done) {
		pageLoadingTime = 0;
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.dueDateValueBeforeTakeAnyAttempt(browser, assessmentAssignmentName).then(function(dueDateBeforeEdit) {
			instructorGradebookStudentDetailedPage.editDueDateBeforeTakeAnyAttempt(browser, assessmentAssignmentName).then(function() {
				instructorGradebookStudentDetailedPage.dueDateValueBeforeTakeAnyAttempt(browser, assessmentAssignmentName).then(function(dueDateAfterEdit) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Assignment due date " + dueDateBeforeEdit + " updated by", dueDateAfterEdit, "success") +
						report.reportFooter());
					pollingPageLoad(pageLoadingTime, browser, done, "Due date edited");
				});
			});
		});
	});

	it(". Validate due date edited successfully without any error message", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.dueDateValueBeforeTakeAnyAttempt(browser, assessmentAssignmentName).then(function(dueDate) {
			if (dueDate.indexOf(dataUtil.getDueDateOfNextMonth()) > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment edited due date " + dueDate + " is compared with", dataUtil.getDueDateOfNextMonth(), "success") +
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
					report.stepStatusWithData("Assignment edited due date " + dueDate + " is compared with", dataUtil.getDueDateOfNextMonth(), "failure") +
					report.reportFooter());
			}

		});
	});

	it(". Wait until the assignment page is loaded successfully", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
		});
	});

	it(". Re-validating the edited due date persist after refreshing the page without any error", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.dueDateValueBeforeTakeAnyAttempt(browser, assessmentAssignmentName).then(function(dueDate) {
			if (dueDate.indexOf(dataUtil.getDueDateOfNextMonth()) > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment edited due date " + dueDate + " is compared with", dataUtil.getDueDateOfNextMonth(), "success") +
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
					report.stepStatusWithData("Assignment edited due date " + dueDate + " is compared with", dataUtil.getDueDateOfNextMonth(), "failure") +
					report.reportFooter());
			}

		});
	});

	it(". Log out as Instructor", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userSignOut.userSignOut(browser, done);
	});

	it(". Login as student", function(done) {
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

	it(". Wait for page load", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
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
		pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Edited assignment doesn't present on today's date ", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		var astcount = 0;
		studentAssessmentsPage.verifyAssignmentNotPresentOnCurrentDate(browser, astcount).then(function(assignmentOnCurrentDateStatus) {
			if (assignmentOnCurrentDateStatus) {
				data = loginPage.setLoginData("studentA");
				console.log(report.reportHeader() +
					report.stepStatusWithData("Edited Due date of assignment for student " + loginPage.getUserName() + " doesn't present on today's date", assignmentOnCurrentDateStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Edited Due date of assignment for student " + loginPage.getUserName() + "  presents on today's date", assignmentOnCurrentDateStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Navigate to the next month on calendar view", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		calendarNavigation.navigateToNextMonth(browser).then(function() {
			pageLoadingTime = 0;
			pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Verify the edited due date of assignment is visible on future date on Student assignment calendar", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.assignmentVisibilityStatusOnFutureDate(browser).then(function() {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Edited Due date of assignment for student " + loginPage.getUserName() + "  presents on future date", "success") +
				report.reportFooter());
			done();
		});
	});

	it(". Click on the first date of future date", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickOnNextMonthFirstDate(browser).then(function() {
			done();
		});
	});

	it(". Validate created assignment is present with desired count of attempt on future date", function(done) {
		pageLoadingTime = 0;
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		studentAssessmentsPage.validateAssignmentIsPresentOnStudentCalendar(browser, assessmentAssignmentName).then(function() {
			studentAssessmentsPage.getTextOfAttempt(browser).text().then(function(attemptsprogressmsg) {
				if (attemptsprogressmsg.indexOf(assessmentData.systemgenerated.scorestrategyhigh.totalAttemptAfterEdit) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Attempt status on student end", attemptsprogressmsg, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Attempt status on student end", attemptsprogressmsg, "failure") +
						report.reportFooter());
				}
			});
		});
	});

	it(". Log out as Student", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userSignOut.userSignOut(browser, done);
	});

	it(". Login as student", function(done) {
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

	it(". Wait for page load", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
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
		pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Edited assignment is present for other student ", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		var astcount = 1;
		studentAssessmentsPage.verifyAssignmentNotPresentOnCurrentDate(browser, astcount).then(function(assignmentOnCurrentDateStatus) {
			if (assignmentOnCurrentDateStatus) {
				data = loginPage.setLoginData("studentB");
				console.log(report.reportHeader() +
					report.stepStatusWithData("Edited Due date of assignment present for student " + loginPage.getUserName() + " on current date", assignmentOnCurrentDateStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Edited Due date of assignment present for student " + loginPage.getUserName() + " on current date", assignmentOnCurrentDateStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Click on the current date cell", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickCurrentDateCell(browser, done);
	});

	it(". Validate created assignment is present with desired count of attempts on current date", function(done) {
		pageLoadingTime = 0;
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		studentAssessmentsPage.validateAssignmentIsPresentOnStudentCalendar(browser, assessmentAssignmentName).then(function() {
			studentAssessmentsPage.getTextOfAttempt(browser).text().then(function(attemptsprogressmsg) {
				if (attemptsprogressmsg.indexOf(assessmentData.systemgenerated.scorestrategyhigh.totalAttemptBeforeEdit) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Attempt status on student end", attemptsprogressmsg, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Attempt status on student end", attemptsprogressmsg, "failure") +
						report.reportFooter());
				}
			});
		});
	});

	it(". Click on the current date cell", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickCurrentDateCell(browser, done);
	});

	it(". Navigate to the next month on calendar view", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		calendarNavigation.navigateToNextMonth(browser).then(function() {
			pageLoadingTime = 0;
			pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Verify the assignment is not visible on future date", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.assignmentVisibilityTrueStatusOnFutureDate(browser).then(function(statusOfEditedAssignment) {
			if (statusOfEditedAssignment) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Edited due date for specific student is not reflected for another student", statusOfEditedAssignment, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Edited due date for specific student is not reflected for another student", statusOfEditedAssignment, "failure") +
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
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		brainPage.selectProduct(product, browser, done);
	});

	it(". Launch the course", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout(120000));
		}
		loginPage.checkIfCoursePresent(browser, courseName).then(function(status) {
			courseNameStatus = status;
			if (courseNameStatus) {
				loginPage.launchACourse(userType, courseName, browser, done);
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Course is not present on instructor dashboard", courseNameStatus, "success") +
					report.reportFooter());
				done();
			}
		});
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		if (courseNameStatus) {
			loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
		}else{
			this.skip();
		}
	});

	it(". Navigate on GradeBook page for drop the student", function(done) {
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
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		if (courseNameStatus) {
			pageLoadingTime = 0;
			pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Navigate to student's detailed GradeBook view and drop the student if student A is registered on duplicate course", function(done) {
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
								pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
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


	it(". Navigate on GradeBook page ", function(done) {
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
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		if (courseNameStatus) {
			pageLoadingTime = 0;
			pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Navigate to student's detailed GradeBook view and drop the student if student B is registered on duplicate course", function(done) {
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
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
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

	function pollingPageLoad(LoadTime, browser, done, message) {
		basicpo.documentState(browser).then(function(LoadingState) {
			if (LoadingState) {
				browser.sleep(2000);
				LoadTime = LoadTime + 2000;
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
