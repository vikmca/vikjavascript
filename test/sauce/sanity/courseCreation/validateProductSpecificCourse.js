require('colors');

var wd = require('wd');
var dataUtil = require("../../util/date-utility");
var stringutil = require("../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var takeQuizpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var loginPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var menuPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var basicpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var session = require("../../support/setup/browser-session");
var practiceQuizCreation = require("../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var _ = require('underscore');
var clearData = require("../../support/pageobject/" + pageobject + "/" + envName + "/clearData.js");
var testData = require("../../../../test_data/data.json");
var studybit = require("../../support/pageobject/" + pageobject + "/" + envName + "/studybitpo");
var createNewCoursepo = require("../../support/pageobject/" + pageobject + "/" + envName + "/createNewCoursepo");
var clearAllSavedContent = require("../../support/pageobject/" + pageobject + "/" + envName + "/clearData");
var tocPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/tocpo");
var brainPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var studentAssessmentsPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var courseHelper = require("../../support/helpers/courseHelper");
var report = require("../../support/reporting/reportgenerator");
var mathutil = require("../../util/mathUtil");
var userSignOut = require("../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var flashcardPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/flashcardspo.js");
var instructorGradebookNavigationPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/gradebookNavigationpo");
var asserters = wd.asserters;
var courseRegistrationpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/courseRegistrationpo.js");
var instructorGradebookForDropStudent = require("../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/dropStudentFromCourse");
var myCengageDashboardpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/myCengageDashboardpo.js");
var path = require('path');
var scriptName = path.basename(__filename);

describe(scriptName + 'STUDYBITS,FLASHCARDS,PRACTICEQUIZ ARE PRODUCT SPECIFIC', function() {
	console.log(stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()));
	var browser;
	var allPassed = true;
	var userType;
	var setDate;
	var courseName;
	var coursekey = "Empty";
	var coursekeystatus = "failure";
	var courseCGI = "undefined";
	var aggregationCompletionTime = "Never Completed or took more time than expected";
	var aggregationStatus = "failure";
	var courseCreationStatus = "failure";
	var keyTermSBValidationStatusOnSBrd = "failure";
	var productData;
	var pageLoadingTime;
	var correctAnswer;
	var totalQuestions;
	var correctAnswerAfterStudentAttempt;
	var testBotQuizMetrics;
	var coursekeyOfCourseA;
	var coursekeyOfCourseB;
	var product;
	var courseNameA;
	var courseNameB;
	var totalTime;
	var courseNameAStatus;
	var courseNameBStatus;
	var firstname = "TestBot";
	var lastname = "Robo";
	var serialNumber = 0;
	var currentUrl;
	var courseAggregationStatus = "failure";
	var courseAggregatedStatus = false;

	before(function(done) {
		browser = session.create(done);
		setDate = testData.courseAccessInformation.DateBeforeToday;
		newCourseData = testData.instructorResourceCenter;

		userType = "instructor";

		product = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString()) || testData.existingCourseDetails.product;

		if (product === "default") {
			product = testData.existingCourseDetails.product;
		}

		data = loginPage.setLoginData(userType);
		productData = loginPage.getProductData();
		totalTime = 0;
		courseNameA = product + " " + "COURSE A FOR NEW STUDENT " + process.env.RUN_INDEX;
		courseNameB = product + " " + "COURSE B FOR NEW STUDENT " + process.env.RUN_INDEX;
		//Reports
		console.log(report.formatTestName("STUDYBITS,FLASHCARDS,PRACTICEQUIZ ARE PRODUCT SPECIFIC"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseNameA + "and" + courseNameB));
		console.log(report.formatTestScriptFileName("***validateProductSpecificCourse.js***"));

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
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Product", function(done) {
		brainPage.selectProduct(product, browser, done);
	});

	it(". Select a course A and launch if duplicate course is present on instructor dashboard", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		loginPage.checkIfCoursePresent(browser, courseNameA).then(function(status) {
			courseNameAStatus = status;
			if (courseNameAStatus) {
				loginPage.launchACourse(userType, courseNameA, browser, done);
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Duplicate course A is not present on instructor dashboard", courseNameAStatus, "success") +
					report.reportFooter());
				userSignOut.signOutFromSSO(userType, browser).then(function() {
					pageLoadingTime = 0;
					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
				});
			}
		});
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Navigate on GradeBook page if any duplicate course A is present", function(done) {
		if (courseNameAStatus) {
			this.timeout(courseHelper.getElevatedTimeout());
			basicpo.checkEula(browser).then(function(eula) {
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
										menuPage.selectGradebook(userType, browser, done);
									});
								});
							} else {
								menuPage.selectGradebook(userType, browser, done);
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
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course A is not present on instructor dashboard", courseNameAStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Navigate to student's detailed GradeBook view and drop the student if any student is registered on duplicate courseA", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		if (courseNameAStatus) {
			if (courseAggregatedStatus) {
				loginPage.getUserNameOfNewStudent(firstname, lastname);
				instructorGradebookNavigationPage.checkIfStudentIsPresent(browser, loginPage.getUserNameOfNewStudent(firstname, lastname)).then(function(studentNamePresentStatus) {
					console.log(studentNamePresentStatus);
					if (studentNamePresentStatus) {
						instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserNameOfNewStudent(firstname, lastname)).then(function() {
							instructorGradebookForDropStudent.clickOnDropStudentButton(browser).then(function() {
								instructorGradebookForDropStudent.clickOnYesUnderDialogueBox(browser).text().then(function(mainGradebookPageText) {
									userSignOut.userSignOut(browser, done);
								});
							});
						});
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameAStatus, "success") +
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
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameAStatus, "success") +
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

	it(". Select a Course and launch if duplicate course B is present on instructor dashboard", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		loginPage.checkIfCoursePresent(browser, courseNameB).then(function(status) {
			courseNameBStatus = status;
			if (courseNameBStatus) {
				loginPage.launchACourse(userType, courseNameB, browser, done);
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Duplicate course B is not present on instructor dashboard", courseNameBStatus, "success") +
					report.reportFooter());
				done();
			}
		});
	});

	it(". Wait for page loading", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
	});

	it(". Navigate on GradeBook page if any duplicate course B is present", function(done) {
		if (courseNameBStatus) {
			this.timeout(courseHelper.getElevatedTimeout());
			basicpo.checkEula(browser).then(function(eula) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("EULA Acceptted", !eula, "success") +
					report.reportFooter());
				if (eula) {
					createNewCoursepo.handleEula(browser).then(function() {
						createNewCoursepo.clickOnGotItButton(browser).then(function() {
							menuPage.selectGradebook(userType, browser, done);
						});
					});
				} else {
					menuPage.selectGradebook(userType, browser, done);
				}
			});
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course B is not present on instructor dashboard", courseNameBStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Navigate to student's detailed GradeBook view and drop the student if any student is registered on duplicate course B", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		if (courseNameBStatus) {
			loginPage.getUserNameOfNewStudent(firstname, lastname);
			instructorGradebookNavigationPage.checkIfStudentIsPresent(browser, loginPage.getUserNameOfNewStudent(firstname, lastname)).then(function(studentNamePresentStatus) {
				console.log(studentNamePresentStatus);
				if (studentNamePresentStatus) {
					instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserNameOfNewStudent(firstname, lastname)).then(function() {
						instructorGradebookForDropStudent.clickOnDropStudentButton(browser).then(function() {
							instructorGradebookForDropStudent.clickOnYesUnderDialogueBox(browser).text().then(function(mainGradebookPageText) {
								userSignOut.userSignOut(browser, done);
							});
						});
					});
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Student is not present on instructor gradebook for course B", studentNamePresentStatus, "success") +
						report.reportFooter());
					userSignOut.userSignOut(browser, done);
				}
			});
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameBStatus, "success") +
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
		if (courseNameAStatus || courseNameBStatus) {
			createNewCoursepo.clickOnManageMyCourse(browser).then(function() {
				done();
			});
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course A is not present on instructor dashboard", courseNameAStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Select the newly created course A and delete it as part of cleanup", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		if (courseNameAStatus) {
			clearAllSavedContent.clearCreatedCourse(browser, done, courseNameA);
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course A is not present on instructor dashboard", courseNameAStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Select the newly created course B and delete it as part of cleanup", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		if (courseNameBStatus) {
			clearAllSavedContent.clearCreatedCourse(browser, done, courseNameB);
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course B is not present on instructor dashboard", courseNameBStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Navigate to Instructor SSO", function(done) {
		if (courseNameAStatus || courseNameBStatus) {
			basicpo.navigateToInstructorDashboard(browser).then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
			});
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameAStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Click on create course link", function(done) {
		createNewCoursepo.clickOnCreateCourseLink(browser).then(function() {
			done();
		});
	});

	it(". Select radio button to create a new course and click on continue button", function(done) {
		createNewCoursepo.selectRadioForCourseType(browser).then(function() {
			done();
		});
	});

	it(". Fill in the new Course name", function(done) {
		createNewCoursepo.enterCourseName(browser, courseNameA).then(function() {
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
				var coursekeyInitial = stringutil.returnValueAfterSplit(ckey, "course-confirmation/", 1);
				coursekeyOfCourseA = stringutil.returnValueAfterSplit(coursekeyInitial, "/", 0);
			} else {
				coursekeyOfCourseA = stringutil.returnValueAfterSplit(ckey, "course/", 1);
			}
			console.log("coursekeyOfCourseA" + coursekeyOfCourseA);
			if (coursekeyOfCourseA !== "undefined") {
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
					console.log("courseCreationStatus   " + courseCreationStatus);
				}
				console.log("courseCreationStatus " + courseCreationStatus + courseCGI);
				browser
					.sleep(1000)
					.nodeify(done);
			});
	});

	it(". Wait and launch the course and refresh the page till the aggregation is completed ", function(done) {
		if (courseCreationStatus !== "failure") {
			this.timeout(courseHelper.getCourseAggregationTimeOut());
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
		if (courseAggregationStatus !== "failure") {
			createNewCoursepo.handleEula(browser).then(function() {
				done();
			});
		} else {
			done();
		}
	});

	it(". Click on 'GOT IT!' button", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		createNewCoursepo.clickOnGotItButton(browser).then(function() {
			done();
		});
	});

	it(". Log out as Instructor", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		userSignOut.userSignOut(browser, done);
	});

	it(". Login to 4LTR Platform", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		userType = "studentforProductSpecific";
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Register the course key of newly created course", function(done) {
		basicpo.getUrl(browser).then(function(currentLocationUrl) {
			currentUrl = currentLocationUrl;
		});
		if (courseAggregationStatus !== "failure") {
			if(stringutil.removeBoundaryQuotes(process.env.RUN_FOR_REGION.toString()) == "ASI"){
				courseRegistrationpo.enterCourseKey(browser, coursekeyOfCourseA).then(function() {
					courseRegistrationpo.clickOnRegistration(browser).then(function() {
						courseRegistrationpo.clickOnContinueButton(browser, currentUrl).then(function() {
							pageLoadingTime = 0;
							takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
						});
					});
				});
			}else{
					myCengageDashboardpo.clickOnAddCourseLink(browser).then(function() {
						myCengageDashboardpo.enterCourseKey(browser, coursekeyOfCourseA).then(function() {
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
		userType = "studentforProductSpecific";
		loginPage.launchACourse(userType, courseNameA, browser, done);
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
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		createNewCoursepo.clickOnGotItButton(browser).then(function() {
			done();
		});
	});

	it(". Navigate To StudyBoard ", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Verify the first time user message on studyboard", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.firstTimeUserPracticeQuizWindow(browser).then(function() {
			createNewCoursepo.firstTimeUserPracticeQuizMsg(browser).text().then(function(firstTimePracticeQuizMsg) {
				var practiceQuizMsgText = firstTimePracticeQuizMsg;
				if (practiceQuizMsgText.indexOf("Take a Practice Quiz") > -1) {
					createNewCoursepo.clickOnClosefirstTimeQuizSBWindow(browser).then(function() {
						console.log(report.reportHeader() + report.stepStatusWithData(practiceQuizMsgText, " message is present for first time user under StudyBoard to create practice quiz", "success") + report.reportFooter());
						createNewCoursepo.checkIffirstTimeUserMessageOnFilterPresent(browser).then(function(statusFilterOrganiseText) {
							if (statusFilterOrganiseText) {
								createNewCoursepo.firstTimeUserMessageOnFilter(browser).text().then(function(filterOrganiseText) {
									if (filterOrganiseText.indexOf("Filter and Organize") > -1) {
										createNewCoursepo.clickOnClosefirstTimeQuizSBWindow(browser).then(function() {
											console.log(report.reportHeader() + report.stepStatusWithData(filterOrganiseText, " message is present for first time user under StudyBoard to filter StudyBits", "success") + report.reportFooter());
											done();
										});
									} else {
										console.log(report.reportHeader() + report.stepStatusWithData(filterOrganiseText, " message is not present for first time user under StudyBoard to filter StudyBits", "failure") + report.reportFooter());
									}
								});
							} else {
								console.log(report.reportHeader() + report.stepStatusWithData(statusFilterOrganiseText, " first time user message is not present for first time user under StudyBoard to filter StudyBits", "success") + report.reportFooter());
								done();
							}
						});
					});
				} else {
					console.log(report.reportHeader() + report.stepStatusWithData(practiceQuizMsgText, " message is not present for first time user under StudyBoard to create practice quiz", "failure") + report.reportFooter());
				}
			});
		});
	});

	it(". Delete the created studybits if any", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		clearAllSavedContent.clearStudyboard(browser, done);
	});

	it(". Navigate to a topic to create StudyBits", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		tocPage.navigateToToc(browser).then(function() {
			tocPage.navigateToAChapter(productData.chapter.id, browser).then(function() {
				tocPage.navigateToATopic(productData.chapter.id, productData.chapter.topic.id, browser).nodeify(done);
			});
		});
	});

	it(". Click on text to create StudyBit", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.clickOnCloseButtonOnNarrativeForFirstUser(browser).then(function() {
			createNewCoursepo.clickOnTextForCreateStudybit(browser, productData.chapter.topic.studybit.text.id).then(function() {
				done();
			});
		});
	});

	it(". Verify UI components of the modal window for first time StudyBit", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		var firstTimeUserSBIconCount;
		var firstTimeUserSBTextCount;
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		createNewCoursepo.eulaIconCount(browser).then(function(firstTimeUserSBIconCounts) {
			firstTimeUserSBIconCount = _.size(firstTimeUserSBIconCounts);
			createNewCoursepo.firstTimeUserSBTextCountsOnEula(browser).then(function(firstTimeUserSBTextCounts) {
				firstTimeUserSBTextCount = _.size(firstTimeUserSBTextCounts);
				if (firstTimeUserSBIconCount === firstTimeUserSBTextCount) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Create StudyBit message For first time user contains " + firstTimeUserSBIconCount + " icon, which is equal to their respective text count", firstTimeUserSBTextCount, "success") +
						report.reportFooter());
					createNewCoursepo.closefirstTimeUserSBWindow(browser).text().then(function(gotItUnderStudybitMessage) {
						if (gotItUnderStudybitMessage.indexOf(testData.eula.eulaMessage) > -1) {
							createNewCoursepo.closefirstTimeUserSBWindow(browser).then(function() {
								console.log(report.reportHeader() + report.stepStatusWithData(gotItUnderStudybitMessage, "Button is present", "success") + report.reportFooter());
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

	it(". Click on 'GOT IT!' button and close the create studybit panel", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		createNewCoursepo.clickOnClosefirstTimeUserSBWindow(browser).then(function(goiIt) {
			studybit.closeStudyBitPanelOnNarrative(browser, productData.chapter.topic.studybit.text.id).then(function() {
				done();
			});
		});
	});

	it(". Reload the page", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Create a KeyTerm StudyBit", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		studybit.createKeyTermStudyBit(browser, done,
			productData.chapter.topic.studybit.keyterm.id,
			productData.chapter.topic.studybit.keyterm.definition,
			productData.chapter.topic.studybit.keyterm.comprehension,
			productData.chapter.topic.studybit.keyterm.publishertag,
			productData.chapter.topic.studybit.keyterm.notes,
			productData.chapter.topic.studybit.keyterm.usertag,
			productData.chapter.topic.studybit.keyterm.windowScrollY);
	});

	it(". Reload the page", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});


	it(". Create a Text StudyBit", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studybit.createTextStudyBit(browser, done, productData.chapter.topic.studybit.text.id,
			productData.chapter.topic.studybit.text.concepts,
			productData.chapter.topic.studybit.text.usertag,
			productData.chapter.topic.studybit.text.notes,
			productData.chapter.topic.studybit.text.comprehension,
			productData.chapter.topic.studybit.text.windowScrollY);
	});


	it(". Navigate To StudyBoard ", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Verify the first time user message on studyboard", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.checkIffirstTimeUserMessageOnFilterPresent(browser).then(function(statusFilterOrganiseText) {
			if (statusFilterOrganiseText) {
				createNewCoursepo.firstTimeUserMessageOnFilter(browser).text().then(function(filterOrganiseText) {
					if (filterOrganiseText.indexOf("Filter and Organize") > -1) {
						createNewCoursepo.clickOnClosefirstTimeQuizSBWindow(browser).then(function() {
							console.log(report.reportHeader() + report.stepStatusWithData(filterOrganiseText, " message is present for first time user under StudyBoard to filter StudyBits", "success") + report.reportFooter());
							done();
						});
					} else {
						console.log(report.reportHeader() + report.stepStatusWithData(filterOrganiseText, " message is not present for first time user under StudyBoard to filter StudyBits", "failure") + report.reportFooter());
					}
				});
			} else {
				console.log(report.reportHeader() + report.stepStatusWithData(statusFilterOrganiseText, " first time user message is not present for first time user under StudyBoard to filter StudyBits", "success") + report.reportFooter());
				done();
			}
		});
	});

	it(". Launch the practice Quiz", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		practiceQuizCreation.navigateToPracticeQuizFromDesiredChapter(browser, productData.concepttracker.quiz.chapterbased.desiredchapterforquiz).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". LTR-5399 :: Verify error message should not be displayed on Practice Quiz launch and also validate Continue button should be appear on launched Practice Quiz page", function(done) {
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
					report.stepStatusWithData("LTR-5399:: Error message is not displaying on the page on Practice Quiz launch",statusOfErrorPresence, "success") +
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

	it(". Attempt a practice Quiz", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		//Call this function if you want a specific block to timeout after a specific time interval
		this.timeout(courseHelper.getElevatedTimeout("quiz"));
		takeQuizpo.takeQuiz(browser, done);
	});


	it(". Store the correct and Total Questions answers after student's attempt on practice quiz", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		practiceQuizCreation.verifyPracticeQuizResultPage(browser).then(function() {
			practiceQuizCreation.getQuestionsCorrect(browser).then(function(correct) {
				correctAnswer = correct;
				console.log(report.reportHeader() +
					report.printTestData("CAS ::  CORRECT ANSWER FROM QUIZZING VIA CHAPTER ", correctAnswer) +
					report.reportFooter());
				practiceQuizCreation.getTotalQuestions(browser).then(function(totalQ) {
					totalQuestions = totalQ;
					console.log(report.reportHeader() +
						report.printTestData("CAS ::   QUESTIONS ANSWERED ON QUIZZING VIA CHAPTER ", totalQuestions) +
						report.reportFooter());
					done();
				});
			});
		});
	});

	it(". Navigate To StudyBoard ", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Wait for page loading", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
	});

	it(". Navigate to ConceptTracker", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectSubTabOnStudyBoard(browser, "Concept Tracker", done);
	});

	it(". Wait for page loading", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
	});

	it(". Validate correct|total answers on student's ConceptTracker view after student's attempt", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		browser.refresh().sleep(10000).then(function(){
		testBotQuizMetrics = correctAnswer + "/" + totalQuestions + " Questions";
		console.log("testBotQuizMetrics :::" + testBotQuizMetrics);
		console.log(report.reportHeader() + report.stepStatusWithData("ANALYTICS :: TestBot Calculated metrics for the attempted quiz by student   \" " + productData.concepttracker.quiz.chapterbased.name, testBotQuizMetrics, "success") + report.reportFooter());
		practiceQuizCreation.getQuizText(browser, productData.concepttracker.quiz.chapterbased.name)
			//   browser.waitForElementByXPath("//h1[contains(.,'" + productData.concepttracker.quiz.chapterbased.name + "')]/following-sibling::div[@class='chartjs overview']//div[@class='question-count']//p", asserters.isDisplayed, 90000).text().should.eventually.become(testBotQuizMetrics)
			.then(function(practiceQuizResult) {
				console.log("practiceQuizResult" + practiceQuizResult);
				console.log("testBotQuizMetrics" + testBotQuizMetrics);
				if (practiceQuizResult.indexOf(testBotQuizMetrics) > -1) {
					correctAnswerAfterStudentAttempt = stringutil.returnValueAfterSplit(stringutil.returnValueAfterSplit(practiceQuizResult, " ", 0), "/", 0);
					totalAnsweredQuestionsByStudent = stringutil.returnValueAfterSplit(stringutil.returnValueAfterSplit(practiceQuizResult, " ", 0), "/", 1);
					console.log(report.reportHeader() +
						report.stepStatusWithData("ANALYTICS :: Practice Quiz metrics retrieved from the platform after the student attempted a quiz on  \" " + productData.concepttracker.quiz.chapterbased.name, practiceQuizResult, "success") + report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("ANALYTICS :: Practice Quiz metrics retrieved from the platform after the student attempted a quiz on  \" " + productData.concepttracker.quiz.chapterbased.name, practiceQuizResult, "failure") + report.reportFooter());
						this.retries(2);
				}
			});
		});
	});

	it(". Navigate To StudyBoard ", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.timeout(courseHelper.getElevatedTimeout());
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Verify page is loaded successfully", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Navigate flashcard Tab", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		flashcardPage.SelectFlashcardTab(browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Navigate to user flashcard View", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		flashcardPage.selectUserFlashcardViewBeforeCreateFlashcard(browser).then(function() {
			done();
		});
	});

	it(". Verify page is loaded successfully", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Delete already created user flashcards", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		clearAllSavedContent.clearFlashcard(browser, done);
	});

	it(". Verify page is loaded successfully", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Create a flashcard with full details", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
			flashcardPage.createFlashcardWithFullDetails(browser, done,
				productData.chapter.topic.flashcard.userflashcard.valuetext[0],
				productData.chapter.topic.flashcard.userflashcard.valuetext[1],
				productData.chapter.topic.flashcard.userflashcard.chapterValue,
				productData.chapter.topic.flashcard.userflashcard.usertag,
				productData.chapter.topic.flashcard.userflashcard.comprehension
			);
		}
	});

	it(". Verify page is loaded successfully", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Navigate to user flashcard View", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		flashcardPage.selectUserFlashcardViewBeforeCreateFlashcard(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Verify page is loaded successfully", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Navigate To StudyBoard ", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
			studybit.navigateToStudyBoard(browser, done);
		}
	});

	it(". Verify page is loaded successfully", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Navigate flashcard Tab", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		flashcardPage.SelectFlashcardTab(browser, done);
	});

	it(". Verify page is loaded successfully", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});


	it(". Revert all Flashcards if already not reverted", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		clearData.revertAllKeyTermFlashcard(browser, done);
	});


	it(". Wait until page is loaded successfully", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Edit key term flashcard under course A", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		flashcardPage.editKeyTermFlashcard(browser, productData.chapter.topic.flashcard.userflashcard.edittag).then(function() {
			done();
		});
	});

	it(". Close on expanded FlashCard", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		flashcardPage.closeExpandedFlashcard(browser, done);
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
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
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

	it(". Click on create course link", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.clickOnCreateCourseLink(browser).then(function() {
			done();
		});
	});

	it(". Select radio button to create a new course and click on continue button", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.selectRadioForCourseType(browser).then(function() {
			done();
		});
	});

	it(". Fill in the new Course name", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.enterCourseName(browser, courseNameB).then(function() {
			done();
		});
	});

	it(". Fill in the start date", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.fillTheStartDate(browser).then(function() {
			done();
		});
	});

	it(". Fill the end date with 10 days after the today's date ", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.enterTheEndData(browser, dataUtil.getSpecificDateAfterCurrentDate(setDate)).then(function() {
			done();
		});
	});

	it(". Save the course details", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.saveTheCourseDetail(browser).then(function() {
			done();
		});
	});

	it(". Copy Course key", function(done) {
		createNewCoursepo.getCourseKey(browser).then(function(ckey) {
			if (ckey.indexOf("course-confirmation") > -1) {
				var coursekeyInitial = stringutil.returnValueAfterSplit(ckey, "course-confirmation/", 1);
				coursekeyOfCourseB = stringutil.returnValueAfterSplit(coursekeyInitial, "/", 0);
			} else {
				coursekeyOfCourseB = stringutil.returnValueAfterSplit(ckey, "course/", 1);
			}
			console.log("coursekeyOfCourseB" + coursekeyOfCourseB);
			if (coursekeyOfCourseB !== "undefined") {
				coursekeystatus = "success";
			}
			done();
		});
	});

	it(". Click on course link", function(done) {
		if (coursekeystatus === "failure") {
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


	it(". Validate course CGI appears in url", function(done) {
		browser
			.execute("return window.location.href;").then(function(cgi) {
				courseCGI = cgi.split('products/')[1];
				if (courseCGI !== "undefined") {
					courseCreationStatus = "success";

					console.log("courseCreationStatus   " + courseCreationStatus);
				}
				console.log("courseCreationStatus" + courseCreationStatus + courseCGI);
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
		if (courseCreationStatus !== "failure") {
			createNewCoursepo.handleEula(browser).then(function() {
				done();
			});
		} else {
			done();
		}
	});

	it(". Click on 'GOT IT!' button", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.clickOnGotItButton(browser).then(function() {
			done();
		});
	});

	it(". Log out as Instructor", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		userSignOut.userSignOut(browser, done);
	});

	it(". Login to 4LTR Platform", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		userType = "studentforProductSpecific";
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Register the course key of newly created course", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		if (courseAggregationStatus !== "failure") {
		if(stringutil.removeBoundaryQuotes(process.env.RUN_FOR_REGION.toString()) == "ASI"){
			courseRegistrationpo.enterCourseKey(browser, coursekeyOfCourseB).then(function() {
				courseRegistrationpo.clickOnRegistration(browser).then(function() {
					courseRegistrationpo.clickOnContinueButton(browser, currentUrl).then(function() {
						pageLoadingTime = 0;
						takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
					});
				});
			});
			}else{
					myCengageDashboardpo.clickOnAddCourseLink(browser).then(function() {
						myCengageDashboardpo.enterCourseKey(browser, coursekeyOfCourseB).then(function() {
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
		userType = "studentforProductSpecific";
		loginPage.launchACourse(userType, courseNameB, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
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

	it(". Navigate To StudyBoard ", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Verify the first time user message on studyboard", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.firstTimeUserPracticeQuizWindow(browser).then(function() {
			createNewCoursepo.firstTimeUserPracticeQuizMsg(browser).text().then(function(firstTimePracticeQuizMsg) {
				var practiceQuizMsgText = firstTimePracticeQuizMsg;
				if (practiceQuizMsgText.indexOf("Take a Practice Quiz") > -1) {
					createNewCoursepo.clickOnClosefirstTimeQuizSBWindow(browser).then(function() {
						console.log(report.reportHeader() + report.stepStatusWithData(practiceQuizMsgText, " message is present for first time user under StudyBoard to create practice quiz", "success") + report.reportFooter());
						createNewCoursepo.firstTimeUserMessageOnWindow(browser).then(function() {
							createNewCoursepo.firstTimeUserMessageOnFilter(browser).text().then(function(filterOrganiseText) {
								if (filterOrganiseText.indexOf("Filter and Organize") > -1) {
									createNewCoursepo.clickOnClosefirstTimeQuizSBWindow(browser).then(function() {
										console.log(report.reportHeader() + report.stepStatusWithData(filterOrganiseText, " message is present for first time user under StudyBoard to filter StudyBits", "success") + report.reportFooter());
										done();
									});
								} else {
									console.log(report.reportHeader() + report.stepStatusWithData(filterOrganiseText, " message is not present for first time user under StudyBoard to filter StudyBits", "failure") + report.reportFooter());
								}
							});
						});
					});
				} else {
					console.log(report.reportHeader() + report.stepStatusWithData(practiceQuizMsgText, " message is not present for first time user under StudyBoard to create practice quiz", "failure") + report.reportFooter());
				}
			});
		});
	});

	it(". Verify the presence of text StudyBit on StudyBoard ", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studybit.validateTextStudyBitOnStudyBoard(browser, done,
			productData.chapter.topic.studybit.text.chaptername,
			productData.chapter.topic.studybit.text.notes,
			productData.chapter.topic.studybit.text.concepts,
			productData.chapter.topic.studybit.text.usertag);
	});

	it(". Verify the presence of keyterm StudyBit on StudyBoard ", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		}
		studybit.VerifyKeytermStudybit(browser, keyTermSBValidationStatusOnSBrd).then(function() {
			browser
				.refresh().then(function() {
					pageLoadingTime = 0;
					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
				});
		});
	});

	it(". Navigate To StudyBoard ", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Navigate flashcard Tab", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		flashcardPage.SelectFlashcardTab(browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Navigate to user flashcard View", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		flashcardPage.selectUserFlashcardViewBeforeCreateFlashcard(browser).then(function() {
			done();
		});
	});

	it(". Verify the presence of user Flashcard on StudyBoard ", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		flashcardPage.validateUserFlashCardOnStudyBoard(browser).then(function(userTag) {
			if (userTag.indexOf(productData.chapter.topic.flashcard.userflashcard.usertag) > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("StudyBit Flashcard is successfully saved and appearing on  StudyBoard with user tag ", userTag, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("StudyBit Flashcard is not successfully saved and is not appearing on  StudyBoard", userTag, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Navigate To StudyBoard ", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Wait for page loading", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
	});

	it(". Navigate to ConceptTracker", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectSubTabOnStudyBoard(browser, "Concept Tracker", done);
	});

	it.skip(" Validate correct|total answers on student's ConceptTracker on course B after student's attempt of course A", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("concepttracker"));
		}
		testBotQuizMetrics = correctAnswer + "/" + totalQuestions + " Questions";
		console.log("testBotQuizMetrics :::" + testBotQuizMetrics);
		console.log(report.reportHeader() + report.stepStatusWithData("ANALYTICS :: TestBot Calculated metrics for the attempted quiz by student   \" " + productData.concepttracker.quiz.chapterbased.name, testBotQuizMetrics, "success") + report.reportFooter());
		//   browser.waitForElementByXPath("//h1[contains(.,'" + productData.concepttracker.quiz.chapterbased.name + "')]/following-sibling::div[@class='chartjs overview']//div[@class='question-count']//p", asserters.isDisplayed, 90000).text().should.eventually.become(testBotQuizMetrics)
		practiceQuizCreation.getQuizText(browser, productData.concepttracker.quiz.chapterbased.name)
			.then(function(practiceQuizResult) {
				if (practiceQuizResult.indexOf(testBotQuizMetrics) > -1) {
					correctAnswerAfterStudentAttempt = stringutil.returnValueAfterSplit(stringutil.returnValueAfterSplit(practiceQuizResult, " ", 0), "/", 0);
					totalAnsweredQuestionsByStudent = stringutil.returnValueAfterSplit(stringutil.returnValueAfterSplit(practiceQuizResult, " ", 0), "/", 1);
					console.log(report.reportHeader() +
						report.stepStatusWithData("ANALYTICS :: Practice Quiz metrics retrieved from the platform after the student attempted a quiz on  \" " + productData.concepttracker.quiz.chapterbased.name, practiceQuizResult, "success") + report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("ANALYTICS :: Practice Quiz metrics retrieved from the platform after the student attempted a quiz on  \" " + productData.concepttracker.quiz.chapterbased.name, practiceQuizResult, "failure") + report.reportFooter());

				}
			});
	});

	it(". Wait until page is loaded successfully", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Navigate flashcard Tab", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		flashcardPage.SelectFlashcardTab(browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Validate edited key term flash card for course 1 is present for course 2 also ", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		console.log("productData.chapter.topic.flashcard.userflashcard.edittag" + productData.chapter.topic.flashcard.userflashcard.edittag);
		flashcardPage.validateUserFlashCardOnStudyBoardForCourseB(browser).then(function(userTag) {
			console.log("userTag" + userTag);
			if (userTag.indexOf(productData.chapter.topic.flashcard.userflashcard.edittag) > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("StudyBit Flashcard is successfully saved and appearing on  StudyBoard with user tag " + productData.chapter.topic.flashcard.userflashcard.edittag + " compared with", userTag, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("StudyBit Flashcard is not successfully saved and is not appearing on  StudyBoard as user tag " + productData.chapter.topic.flashcard.userflashcard.edittag + " compared with", userTag, "failure") +
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

	it(". Log in as Instructor again", function(done) {
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
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		userType = "instructor";
		loginPage.launchACourse("instructor", courseNameA, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate on GradeBook page", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Navigate to student's detailed GradeBook view", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		loginPage.getUserNameOfNewStudent(firstname, lastname);
		instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserNameOfNewStudent(firstname, lastname)).then(function() {
			done();
		});
	});

	it(". Validate Instructor returned to the main GradeBook page on Dropping the course B", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookForDropStudent.clickOnDropStudentButton(browser).then(function() {
			instructorGradebookForDropStudent.clickOnYesUnderDialogueBox(browser).text().then(function(mainGradebookPageText) {
				instructorGradebookForDropStudent.checkIfExportButtonIsPresent(browser).text().then(function(exportButton) {
					if (mainGradebookPageText === testData.DropStudent.dropStudentFromCourse.gradebookText && exportButton === testData.DropStudent.dropStudentFromCourse.exportButtonText) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : Instructor returned to main GradeBook page and verify export button status is " + exportButton, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK :Instructor is not returned to main GradeBook page and verify export button status i" + exportButton, "failure") +
							report.reportFooter());
					}
				});
			});
		});
	});


	it(". Log in as Instructor again", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userType = "instructor";
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Product", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		brainPage.selectProduct(product, browser, done);
	});

	it(". Select a Course and launch", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		userType = "instructor";
		loginPage.launchACourse(userType, courseNameB, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate on GradeBook page", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectGradebook("instructor", browser, done);
	});

	it(". Navigate to student's detailed GradeBook view", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		loginPage.getUserNameOfNewStudent(firstname, lastname);
		instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserNameOfNewStudent(firstname, lastname)).then(function() {
			done();
		});
	});

	it(". Validate Instructor returned to the main GradeBook page on dropping the course B", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookForDropStudent.clickOnDropStudentButton(browser).then(function() {
			instructorGradebookForDropStudent.clickOnYesUnderDialogueBox(browser).text().then(function(mainGradebookPageText) {
				instructorGradebookForDropStudent.checkIfExportButtonIsPresent(browser).text().then(function(exportButton) {
					if (mainGradebookPageText === testData.DropStudent.dropStudentFromCourse.gradebookText && exportButton === testData.DropStudent.dropStudentFromCourse.exportButtonText) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : Instructor returned to main GradeBook page and verify export button status is " + exportButton, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK :Instructor is not returned to main GradeBook page and verify export button status i" + exportButton, "failure") +
							report.reportFooter());
					}
				});
			});
		});
	});


	it(". Log in as Instructor again", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userType = "instructor";
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});


	it(". Click on manage my course", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.clickOnManageMyCourse(browser).then(function() {
			done();
		});
	});


	it(". Select the newly created course A and delete it as part of cleanup", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		console.log("inside course delete");
		if (aggregationStatus !== "success") {
			console.log("inside course aggregation not equal to success");
			userSignOut.userSignOut(browser, done);
		} else {
			console.log("inside course delete else");
			clearAllSavedContent.clearCreatedCourse(browser, done, courseNameA);
		}

	});

	it(". Wait for page load", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Select the newly created course B and delete it as part of cleanup", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		console.log("inside course delete");
		if (aggregationStatus !== "success") {
			console.log("inside course aggregation not equal to success");
			userSignOut.userSignOut(browser, done);
		} else {
			console.log("inside course delete else");
			clearAllSavedContent.clearCreatedCourse(browser, done, courseNameB);
		}

	});

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
