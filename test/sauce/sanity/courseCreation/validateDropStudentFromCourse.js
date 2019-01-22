require('colors');
var wd = require('wd');
var dataUtil = require("../../util/date-utility");
var stringutil = require("../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var session = require("../../support/setup/browser-session");
var brainPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var createNewCoursepo = require("../../support/pageobject/" + pageobject + "/" + envName + "/createNewCoursepo");
var testData = require("../../../../test_data/data.json");
var clearAllSavedContent = require("../../support/pageobject/" + pageobject + "/" + envName + "/clearData");
var menuPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var instructorGradebookNavigationPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/gradebookNavigationpo");
var courseHelper = require("../../support/helpers/courseHelper");
var instructorGradebookForDropStudent = require("../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/dropStudentFromCourse");
var report = require("../../support/reporting/reportgenerator");
var userSignOut = require("../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var basicpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var takeQuizpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var courseRegistrationpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/courseRegistrationpo.js");
var myCengageDashboardpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/myCengageDashboardpo.js");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'DROP STUDENT FROM COURSE,CENGAGE COURSE CREATION AND NEW STUDENT REGISTRATION', function() {
	var browser;
	var allPassed = true;
	var userType;
	var setDate;
	var firstname = "TestBot";
	var lastname = "Robo";
	var courseName;
	var coursekey = "Empty";
	var coursekeystatus = "failure";
	var courseCGI = "undefined";
	var aggregationCompletionTime = "Never Completed or took more time than expected";
	var aggregationStatus = "failure";
	var courseCreationStatus = "failure";
	var productData;
	var pageLoadingTime;
	var product;
	var totalTime;
	var courseNameStatus;
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
		totalTime = 0;
		courseName = product + " " + "COURSE FOR DROP STUDENT FROM COURSE";
		//Reports
		console.log(report.formatTestName("CENGAGE COURSE CREATION AND NEW STUDENT REGISTRATION AND VALIDATE DROP STUDENT"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***ValidateDropStudentFromCourse.js***"));
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
				console.log(userType);
				userSignOut.signOutFromSSO(userType, browser).then(function() {
					pageLoadingTime = 0;
					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
				});
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
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Navigate to student's detailed GradeBook view and drop the student if any student is registered on duplicate course", function(done) {
		if (courseNameStatus) {
			if (courseAggregatedStatus) {
				loginPage.getUserNameOfNewStudent(firstname, lastname);
				instructorGradebookNavigationPage.checkIfStudentIsPresent(browser, loginPage.getUserNameOfNewStudent(firstname, lastname)).then(function(studentNamePresentStatus) {
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
			console.log("course deleted");
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

	it(". Select radio button to create a new course and click on continue button", function(done) {
		createNewCoursepo.selectRadioForCourseType(browser).then(function() {
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
		this.timeout(courseHelper.getCourseAggregationTimeOut());
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
		if (courseAggregationStatus !== "failure") {
			createNewCoursepo.handleEula(browser).then(function() {
				done();
			});
		} else {
			done();
		}
	});

	it(". Click on 'GOT IT!' button", function(done) {
		createNewCoursepo.clickOnGotItButton(browser).then(function() {
			done();
		});
	});

	it(". Log out as Instructor", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userSignOut.userSignOut(browser, done);
	});

	it(". Login to 4LTR Platform", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userType = "studentforDropStudent";
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Register the course key for newly created course", function(done) {
		if (courseAggregationStatus !== "failure") {
			basicpo.getUrl(browser).then(function(currentLocationUrl) {
				currentUrl = currentLocationUrl;
			});
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

	it(". Logout as an student", function() {
		userSignOut.signOutFromSSO(userType, browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
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

	it(". Select a Course and launch", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userType = "instructor";
		loginPage.launchACourse(userType, courseName, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate on GradeBook page", function(done) {
		menuPage.selectGradebook("instructor", browser, done);
	});

	it(". Navigate to student's detailed GradeBook view", function(done) {
		loginPage.getUserNameOfNewStudent(firstname, lastname);
		instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserNameOfNewStudent(firstname, lastname)).then(function() {
			done();
		});
	});

	it(". Validate Drop student button is available on students detailed page", function(done) {
		instructorGradebookForDropStudent.checkifButtonIsAvailable(browser).text().then(function(buttonText) {
			if (buttonText === testData.DropStudent.dropStudentFromCourse.buttonText) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Text of the button is displayed as :: ", buttonText, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Text of the button is displayed as :: ", buttonText, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate Drop student button is use the grey color on students detailed page", function(done) {
		instructorGradebookForDropStudent.checkDropStudentButtonBackgroundColour(browser).then(function(value) {
			var colourOfButton = value.toString();
			if (value.toString() == "rgb(221, 221, 221)") {
				console.log(report.reportHeader() + report.stepStatusWithData("Color of the drop student button is :: ", colourOfButton, "success") + report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Colour of the drop student button is :: ", colourOfButton, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate The box states, “Are you sure you want to drop student last name, student first name from this course?  ", function(done) {
		instructorGradebookForDropStudent.clickOnDropStudentButton(browser).then(function() {
			instructorGradebookForDropStudent.validateDialogueBox(browser).text().then(function(dialogueBoxText) {
				if (dialogueBoxText === "Are you sure you want to drop " + loginPage.getUserNameOfNewStudent(firstname, lastname) + " from this course?") {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Dialog box states that ::Are you sure you want to drop " + loginPage.getUserNameOfNewStudent(firstname, lastname) + " from this course?", "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Dialog box states that ::Are you sure you want to drop " + loginPage.getUserNameOfNewStudent(firstname, lastname) + " from this course?", "failure") +
						report.reportFooter());
				}
			});
		});
	});

	it(". Clicking on the “No” button cancels the action and returns the instructor to the student detail page ", function(done) {
		instructorGradebookForDropStudent.clickOnCancelOnDialogueBox(browser).then(function() {
			instructorGradebookForDropStudent.checkIfBackButtonIsPresent(browser).text().then(function(backButtonText) {
				instructorGradebookForDropStudent.checkIfDropdownClassstatusIsHide(browser).then(function(statusOfDialogue) {
					if (statusOfDialogue) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : Instructor returns to the student detail page and status of dialog is " + statusOfDialogue, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : Instructor returns to the student detail page and status of dialog is " + statusOfDialogue, "failure") +
							report.reportFooter());
					}
				});
			});
		});
	});

	it(". Validate Instructor returned to the main GradeBook page on clicking the “Yes” Button", function(done) {
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

	it(". Log out as Instructor", function(done) {
		data = loginPage.setLoginData("instructor");
		userSignOut.userSignOut(browser, done);
	});

	it(". Login as student", function(done) {
		userType = "studentforDropStudent";
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Validate If the student had not yet registered an access code for the product, the next time they log into CB.com the product will no longer appear on their dashboard", function(done) {
		instructorGradebookForDropStudent.getTextIfNoCourseIsPresent(browser).then(function() {
			instructorGradebookForDropStudent.checkIfCourseIsPresentAfterDropedStudent(browser, courseName).then(function(courseStatus) {
				if (!courseStatus) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Student : Course is no longer available on dashboard " + courseStatus, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Student :Course is no longer available on dashboard " + courseStatus, "failure") +
						report.reportFooter());
				}
			});
		});
	});

	it(". Logout as an student", function() {
		userSignOut.signOutFromSSO(userType, browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	it(". Log in as Instructor again", function(done) {
		userType = "instructor";
		data = loginPage.setLoginData(userType);
		//Reports
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Click on manage my course", function(done) {
		createNewCoursepo.clickOnManageMyCourse(browser).then(function() {
			done();
		});
	});

	it(". Select the newly created course and delete it as part of cleanup", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		console.log("inside course delete");
		if (aggregationStatus !== "success") {
			console.log("inside course aggregation not equal to success");
			userSignOut.userSignOut(browser, done);
		} else {
			console.log("inside course delete else");
			clearAllSavedContent.clearCreatedCourse(browser, done, courseName);
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
