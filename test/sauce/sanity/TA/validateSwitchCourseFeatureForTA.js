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
var basicpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var copyCoursePage = require("../../support/pageobject/" + pageobject + "/" + envName + "/copyCoursepo.js")
var createNewCoursepo = require("../..//support/pageobject/" + pageobject + "/" + envName + "/createNewCoursepo");
var userSignOut = require("../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var brainPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var session = require("../../support/setup/browser-session");
var switchcoursepo = require("../../support/pageobject/" + pageobject + "/" + envName + "/switchcoursepo.js");
var additionalInstructOrTA = require("../../support/pageobject/" + pageobject + "/" + envName + "/additionalInstructOrTApo.js");
var testData = require("../../../../test_data/data.json");
var clearAllSavedContent = require("../../support/pageobject/" + pageobject + "/" + envName + "/clearData");
var courseHelper = require("../../support/helpers/courseHelper");
var report = require("../../support/reporting/reportgenerator");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'TA ::  VALIDATE ALLOW SWITCHING BETWEEN COURSES WITHIN 4LTR', function() {
	var browser;
	var allPassed = true;
	var userType;
	var setDate;
	var courseName;
	var courseCreationStatus = "failure";
	var aggregationStatus = "failure";
	var aggregationCompletionTime = "Never Completed or took more time than expected";
	var pageLoadingTime;
	var courseKey;
	var product;
	var data;
	var productData;
	var totalTime;
	var courseNameStatus;
	var serialNumber = 0;
	var courseAggregationStatus = "failure";
	var courseTAStatusB;
	var courseTAStatusA;
	var newCourseNameA;
	var newCourseNameB;
	var TAStudentStatus = 0;
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
		if (product === "MKTG9") {
			productB = "PSYCH4";
		} else {
			productB = "MKTG9";
		}
		newCourseNameA = product + " TA COURSE A NEW";
		newCourseNameB = productB + " TA COURSE B NEW";
		console.log(report.formatTestName("TA  ::  VALIDATE ALLOW SWITCHING BETWEEN COURSES WITHIN 4LTR"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, newCourseNameA + " AND " + newCourseNameB));
		console.log(report.formatTestScriptFileName("validateSwitchCourseFeatureForTA.js"));

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
// for(var i = 0;i<20; i++){
	it(". Login to 4LTR Platform as instructor", function(done) {
		data = loginPage.setLoginData(userType);
		//Reports
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Product", function(done) {
		brainPage.selectProduct(product, browser, done);
	});

	it(". Click on manage my course", function(done) {
		createNewCoursepo.clickOnManageMyCourse(browser).then(function() {
			done();
		});
	});

	it(". Remove the student(TA) to allow us to delete the course if any TA course is present", function(done) {
		additionalInstructOrTA.verifyPresesnceOfTACourseOnManageMyCourse(browser, newCourseNameA).then(function(coursePresenceStatus) {
			courseTAStatusA = coursePresenceStatus;
			if (coursePresenceStatus) {
				copyCoursePage.clickOnEditIcon(browser, newCourseNameA).then(function() {
					additionalInstructOrTA.checkIfTAStudentAdded(browser).then(function(TAStudent) {
						TAStudentStatus = TAStudent;
						if (TAStudentStatus) {
							additionalInstructOrTA.deleteTAstudent(browser).then(function() {
								pageLoadingTime = 0;
								takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
							});
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("TA course is not added", "success") +
								report.reportFooter());
							done();
						}
					});
				});
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("TA course is not present", "success") +
					report.reportFooter());
				done();
			}
		});
	});

	it(". Save the course", function(done) {
		additionalInstructOrTA.clickOnSaveButton(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	it(". Select the newly created course and delete it as part of cleanup", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		if (courseTAStatusA) {
			clearAllSavedContent.clearCreatedCourse(browser, done, newCourseNameA);
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		}
	});

	it(". Remove the student(TA) to allow us to delete the course if any TA course is present", function(done) {
		additionalInstructOrTA.verifyPresesnceOfTACourseOnManageMyCourse(browser, newCourseNameB).then(function(coursePresenceStatus) {
			courseTAStatusB = coursePresenceStatus;
			if (coursePresenceStatus) {
				copyCoursePage.clickOnEditIcon(browser, newCourseNameB).then(function() {
					additionalInstructOrTA.checkIfTAStudentAdded(browser).then(function(TAStudent) {
						TAStudentStatus = TAStudent;
						if (TAStudentStatus) {
							additionalInstructOrTA.deleteTAstudent(browser).then(function() {
								pageLoadingTime = 0;
								takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
							});
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("TA course is not added", "success") +
								report.reportFooter());
							done();
						}
					});
				});
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("TA course is not present", "success") +
					report.reportFooter());
				done();
			}
		});
	});

	it(". Save the course", function(done) {
		if (courseTAStatusB) {
			additionalInstructOrTA.clickOnSaveButton(browser).then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
			});
		} else {
			done();
		}
	});

	it(". Select the newly created course and delete it as part of cleanup", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		if (courseTAStatusB) {
			clearAllSavedContent.clearCreatedCourse(browser, done, newCourseNameB);
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			done();
		}
	});
// }
	it(". Navigate to Instructor SSO", function(done) {
		if (courseTAStatusA || courseTAStatusB) {
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

	it(". Verify navigation to course information page by validating course information label", function(done) {
		createNewCoursepo.verifyCourseInformationLabel(browser, newCourseData.courseInformationLabel).then(function() {
			done();
		});
	});

	it(". Fill in the new Course name", function(done) {
		createNewCoursepo.enterCourseName(browser, newCourseNameA).then(function() {
			console.log(report.reportHeader() +
				report.stepStatusWithData("New created course name is ", newCourseNameA, "success") +
				report.reportFooter());
			done();
		});
	});

	it(". Fill in the start date", function(done) {
		createNewCoursepo.fillTheStartDate(browser).then(function() {
			done();
		});
	});

	it(". Fill the End date, 10 days passed from today's date ", function(done) {
		createNewCoursepo.enterTheEndData(browser, dataUtil.getSpecificDateAfterCurrentDate(setDate)).then(function() {
			done();
		});
	});

	it(". Add Additional Instructor or TA", function(done) {
		additionalInstructOrTA.clickOnAddAdditionalInstructorOrTA(browser)
			.then(function() {
				additionalInstructOrTA.getPrimaryInstructorName(browser).then(function(primaryInstructor) {
					console.log(primaryInstructor);
					additionalInstructOrTA.enterAdditionalInstructorName(browser, primaryInstructor).then(function() {
						additionalInstructOrTA.clickOnAddButton(browser).then(function() {
							additionalInstructOrTA.validateErrorMessageOnPage(browser).then(function(errormessage) {
								if (errormessage.indexOf("The specified user is already added.") > -1) {
									console.log(report.reportHeader() +
										report.stepStatusWithData("Error message " + errormessage + " is displaying", "on adding primary instructor", "success") +
										report.reportFooter());
									done();
								} else {
									console.log(report.reportHeader() +
										report.stepStatusWithData("Error message is not displaying displaying", "", "failure") +
										report.reportFooter());
								}
							});
						});
					});
				});
			});
	});

	it(". Clear the text box and enter valid TA user", function(done) {
		data = loginPage.setLoginData("studentTA");
		//Reports
		console.log(report.printLoginDetails(data.userId, data.password));
		additionalInstructOrTA.clearTheTextBox(browser).then(function() {
			additionalInstructOrTA.enterAdditionalInstructorName(browser, data.userId).then(function() {
				additionalInstructOrTA.clickOnAddButton(browser).then(function() {
					done();
				});
			});
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
					console.log("Course creation inside   " + courseCreationStatus);
				}
				console.log("Course creation status" + courseCreationStatus + courseCGI);
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

	it(". verify the model UI components", function(done) {
		var iconcount;
		var textcount;
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
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
		createNewCoursepo.clickOnGotItButton(browser).then(function() {
			done();
		});
	});


	it(". Log out as Instructor", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userSignOut.userSignOut(browser, done);
	});

	it(". Quit the session", function(done) {
		browser.quit()
			.nodeify(done);
	});

	it(". Start the session", function(done) {
		browser = session.create(done);
	});

	it(". Log in as TA student", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userType = "studentTA";
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Wait for page loading", function(done) {
		browser.refresh().sleep(5000).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	it(". Select a Course and launch", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		loginPage.launchACourse(userType, newCourseNameA, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
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

	it(". verify the model UI components", function(done) {
		var iconcount;
		var textcount;
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
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
		createNewCoursepo.clickOnGotItButton(browser).then(function() {
			done();
		});
	});

	it(". Wait for page loading", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	//  if (process.env.RUN_ENV.toString() === "\"integration\""|| process.env.RUN_ENV.toString() === "\"staging\"") {
	it(". Click on user profile and validate switch courses link should not be appear", function(done) {
		userSignOut.clickOnUserProfile(browser).then(function() {
			switchcoursepo.courseSwichButtonHidden(browser).then(function(statusOfSwitchCourseLink) {
				console.log("statusOfSwitchCourseLink" + statusOfSwitchCourseLink);
				if (statusOfSwitchCourseLink) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Switch Courses Link is not present under profile link", statusOfSwitchCourseLink, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Switch Courses Link is present under profile link", statusOfSwitchCourseLink, "failure") +
						report.reportFooter());
				}

			});
		});
	});
	// }

	it(". Wait for page loading", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	it(". Log out as student", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		userSignOut.userSignOut(browser, done);
	});

	it(". Login to 4LTR Platform", function(done) {
		userType = "instructor";
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Product", function(done) {
		brainPage.selectProduct(productB, browser, done);
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

	it(". Verify navigation to course information page by validating course information label", function(done) {
		createNewCoursepo.verifyCourseInformationLabel(browser, newCourseData.courseInformationLabel).then(function() {
			done();
		});
	});

	it(". Fill in the new Course name", function(done) {
		createNewCoursepo.enterCourseName(browser, newCourseNameB).then(function() {
			console.log(report.reportHeader() +
				report.stepStatusWithData("New created course name is ", newCourseNameB, "success") +
				report.reportFooter());
			done();
		});
	});

	it(". Fill in the start date", function(done) {
		createNewCoursepo.fillTheStartDate(browser).then(function() {
			done();
		});
	});

	it(". Fill the end date with 10 days after from today's date ", function(done) {
		createNewCoursepo.enterTheEndData(browser, dataUtil.getSpecificDateAfterCurrentDate(setDate)).then(function() {
			done();
		});
	});

	it(". Add Additional Instructor or TA", function(done) {
		additionalInstructOrTA.clickOnAddAdditionalInstructorOrTA(browser)
			.then(function() {
				additionalInstructOrTA.getPrimaryInstructorName(browser).then(function(primaryInstructor) {
					console.log(primaryInstructor);
					additionalInstructOrTA.enterAdditionalInstructorName(browser, primaryInstructor).then(function() {
						additionalInstructOrTA.clickOnAddButton(browser).then(function() {
							additionalInstructOrTA.validateErrorMessageOnPage(browser).then(function(errormessage) {
								if (errormessage.indexOf("The specified user is already added.") > -1) {
									console.log(report.reportHeader() +
										report.stepStatusWithData("Error message " + errormessage + " is displaying", "on adding primary instructor", "success") +
										report.reportFooter());
									done();
								} else {
									console.log(report.reportHeader() +
										report.stepStatusWithData("Error message is not displaying displaying", "", "failure") +
										report.reportFooter());
								}
							});
						});
					});
				});
			});
	});

	it(". Clear the text box and enter valid TA user name and click on add button", function(done) {
		data = loginPage.setLoginData("studentTA");
		//Reports
		console.log(report.printLoginDetails(data.userId, data.password));
		additionalInstructOrTA.clearTheTextBox(browser).then(function() {
			additionalInstructOrTA.enterAdditionalInstructorName(browser, data.userId).then(function() {
				additionalInstructOrTA.clickOnAddButton(browser).then(function() {
					done();
				});
			});
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
					console.log("Course creation inside   " + courseCreationStatus);
				}
				console.log("Course creation status" + courseCreationStatus + courseCGI);
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

	it(". Handle EULA[End User License Agreement]", function(done) {
		if (courseAggregationStatus !== "failure") {
			createNewCoursepo.handleEula(browser).then(function() {
				done();
			});
		} else {
			done();
		}
	});

	it(". verify the model UI components", function(done) {
		var iconcount;
		var textcount;
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
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
		createNewCoursepo.clickOnGotItButton(browser).then(function() {
			done();
		});
	});


	it(". Log out as Instructor", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userSignOut.userSignOut(browser, done);
	});

	it(". Quit the session", function(done) {
		browser
			.quit()
			.nodeify(done);
	});

	it(". Start the session", function(done) {
		browser = session.create(done);
	});

	it(". Log in as TA student", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userType = "studentTA";
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Wait for page loading", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	it(". Select a Course and launch", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		loginPage.launchACourse(userType, newCourseNameB, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Handle EULA[End User License Agreement]", function(done) {
		if (courseAggregationStatus !== "failure") {
			createNewCoursepo.handleEula(browser).then(function() {
				done();
			});
		} else {
			done();
		}
	});

	it(". verify the model UI components", function(done) {
		var iconcount;
		var textcount;
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
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
		createNewCoursepo.clickOnGotItButton(browser).then(function() {
			done();
		});
	});

	it(". Wait for page loading", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	// if (process.env.RUN_ENV.toString() === "\"integration\""|| process.env.RUN_ENV.toString() === "\"staging\"") {
	it(". Click on user profile and validate switch courses link should be appear", function(done) {
		userSignOut.clickOnUserProfile(browser).then(function() {
			switchcoursepo.presentStatusOfSwitchCourseLink(browser).then(function(statusOfSwitchCourseLink) {
				if (statusOfSwitchCourseLink) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Switch Courses Link present under profile link", statusOfSwitchCourseLink, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Switch Courses Link present under profile link", statusOfSwitchCourseLink, "failure") +
						report.reportFooter());
				}

			});
		});
	});
	it(". Verify that switch course popup should be not present on page before clicking on Switch course link", function(done) {
		switchcoursepo.hiddenStatusOfSwitchCourseWindow(browser).then(function(hiddenStatusOfSwitchCourseWindow) {
			if (hiddenStatusOfSwitchCourseWindow) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Switch Courses panel is hidden from page before clicking on Switch course link", hiddenStatusOfSwitchCourseWindow, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Switch Courses panel is hidden from page before clicking on Switch course link", hiddenStatusOfSwitchCourseWindow, "failure") +
					report.reportFooter());
			}

		});
	});

	it(". Click on switch courses link and validate the My Courses panel should be appear", function(done) {
		switchcoursepo.clickOnSwitchCourseLink(browser).then(function() {
			switchcoursepo.presentStatusOfSwitchCourseWindow(browser).then(function(statusOfSwitchCourseWindow) {
				console.log(statusOfSwitchCourseWindow);
				if (statusOfSwitchCourseWindow) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Switch Courses window is displaying on page after clicking on switch course link", statusOfSwitchCourseWindow, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Switch Courses window is displaying on page after clicking on switch course link", statusOfSwitchCourseWindow, "failure") +
						report.reportFooter());
				}

			});
		});
	});

	it(". Validate the header text on Switch Course Window", function(done) {
		switchcoursepo.getHeaderTextOfSwitchCourseWindow(browser).then(function(textOfSwitchCourseWindow) {
			console.log(textOfSwitchCourseWindow);
			if (textOfSwitchCourseWindow.indexOf("My Courses") > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Text on Switch Courses window 'My Courses' is comapred against", textOfSwitchCourseWindow, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Text on Switch Courses window 'My Courses' is comapred against", textOfSwitchCourseWindow, "failure") +
					report.reportFooter());
			}

		});
	});

	it(". Validate the image icon on Switch Course Window", function(done) {
		switchcoursepo.getHeaderImage(browser).then(function(imageUrlOfSwitchCourseWindow) {
			if (imageUrlOfSwitchCourseWindow.indexOf("notes-gray") > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Header background image is appearing on page ", imageUrlOfSwitchCourseWindow, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Header background image is appearing on page", imageUrlOfSwitchCourseWindow, "failure") +
					report.reportFooter());
			}

		});
	});

	it(". Validate all active courses are present under switch course window", function(done) {
		switchcoursepo.getCourseCountOnSwitchWindow(browser).then(function(getCourseCounts) {
			var courseCountOnSwitchWindow = _.size(getCourseCounts);
			if (courseCountOnSwitchWindow === 1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Total courses on Switch Courses window is " + courseCountOnSwitchWindow + " is compared with count of active courses ", 1, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Total courses on Switch Courses window is " + courseCountOnSwitchWindow + " is compared with count of active courses ", 1, "failure") +
					report.reportFooter());
			}

		});
	});

	it(". Validate on close button should be present on overlay", function(done) {
		switchcoursepo.validateCloseButtonPresenceStatus(browser).then(function(closeButtonStatus) {
			if (closeButtonStatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Close button presence status ", closeButtonStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Close button presence status ", closeButtonStatus, "failure") +
					report.reportFooter());
			}

		});
	});

	it(". Validate on clicking on close button overlay should be closed", function(done) {
		switchcoursepo.clickOnCloseButton(browser).then(function() {
			switchcoursepo.hiddenStatusOfSwitchCourseWindow(browser).then(function(hiddenStatusOfSwitchCourseWindow) {
				if (hiddenStatusOfSwitchCourseWindow) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Switch Courses panel is hidden from page after clicking on close button", hiddenStatusOfSwitchCourseWindow, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Switch Courses panel is hidden from page after clicking on close button", hiddenStatusOfSwitchCourseWindow, "failure") +
						report.reportFooter());
				}

			});

		});
	});

	it(". Click on user profile and validate switch courses link should be appear", function(done) {
		userSignOut.clickOnUserProfile(browser).then(function() {
			switchcoursepo.presentStatusOfSwitchCourseLink(browser).then(function(statusOfSwitchCourseLink) {
				if (statusOfSwitchCourseLink) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Switch Courses Link present under profile link", statusOfSwitchCourseLink, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Switch Courses Link present under profile link", statusOfSwitchCourseLink, "failure") +
						report.reportFooter());
				}

			});
		});
	});

	it(". Click on switch courses link and validate the My Courses panel should be appear", function(done) {
		switchcoursepo.clickOnSwitchCourseLink(browser).then(function() {
			switchcoursepo.presentStatusOfSwitchCourseWindow(browser).then(function(statusOfSwitchCourseWindow) {
				console.log(statusOfSwitchCourseWindow);
				if (statusOfSwitchCourseWindow) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Switch Courses window is displaying on page after clicking on switch course link", statusOfSwitchCourseWindow, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Switch Courses window is displaying on page after clicking on switch course link", statusOfSwitchCourseWindow, "failure") +
						report.reportFooter());
				}

			});
		});
	});

	it(". Get the current link of launched course and switch to another course", function(done) {
		browser.url().then(function(oldUrl) {
			opendCourseUrl = oldUrl;
			console.log(opendCourseUrl);
			switchcoursepo.clickOnFirstCourseLink(browser).then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
		});
	});

	it(". Validate user is switched to another course", function(done) {
		browser.url().then(function(newUrl) {
			var opendCourseUrlFromSwitchedCourseWindow = newUrl;
			console.log(opendCourseUrlFromSwitchedCourseWindow);
			if (!(opendCourseUrl.indexOf(opendCourseUrlFromSwitchedCourseWindow) > -1)) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("SSO launched cousres url is " + opendCourseUrl + " compared with Swiched course url", opendCourseUrlFromSwitchedCourseWindow, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("SSO launched cousres url is " + opendCourseUrl + " compared with Swiched course url", opendCourseUrlFromSwitchedCourseWindow, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate the switched course name should be reflect under manage my course page", function(done) {
		createNewCoursepo.verifyEditedCourseNameUnderManageMyCourse(browser).text().then(function(switchedCourseName) {
			var switchedCourseNameOnDropDown = stringutil.returnValueAfterSplit(switchedCourseName, "\n", 0);
			if (switchedCourseNameOnDropDown === newCourseNameA) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Switched  course name " + switchedCourseNameOnDropDown + " is compared against the course displayed under manage my course dropdown", newCourseNameA, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Switched  course name " + switchedCourseNameOnDropDown + " is compared against the course displayed under manage my course dropdown", newCourseNameA, "failure") +
					report.reportFooter());
			}
		});
	});

	// }

	it(". Wait for page loading", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	it(". Log out as student", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		userSignOut.userSignOut(browser, done);
	});

	it(". Login to 4LTR Platform", function(done) {
		userType = "instructor";
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Product", function(done) {
		brainPage.selectProduct(product, browser, done);
	});

	it(". Click on manage my course", function(done) {
		createNewCoursepo.clickOnManageMyCourse(browser).then(function() {
			done();
		});
	});

	it(". Remove the student(TA) to allow us to delete the course if any TA course is present", function(done) {
		additionalInstructOrTA.verifyPresesnceOfTACourseOnManageMyCourse(browser, newCourseNameA).then(function(coursePresenceStatus) {
			courseTAStatusA = coursePresenceStatus;
			if (coursePresenceStatus) {
				copyCoursePage.clickOnEditIcon(browser, newCourseNameA).then(function() {
					additionalInstructOrTA.checkIfTAStudentAdded(browser).then(function(TAStudent) {
						TAStudentStatus = TAStudent;
						if (TAStudentStatus) {
							additionalInstructOrTA.deleteTAstudent(browser).then(function() {
								pageLoadingTime = 0;
								takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
							});
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("TA course is not added", "success") +
								report.reportFooter());
							done();
						}
					});
				});
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("TA course is not present", "success") +
					report.reportFooter());
				done();
			}
		});
	});

	it(". Save the course", function(done) {
		additionalInstructOrTA.clickOnSaveButton(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	it(". Select the newly created course and delete it as part of cleanup", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		if (courseTAStatusA) {
			clearAllSavedContent.clearCreatedCourse(browser, done, newCourseNameA);
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
				report.reportFooter());
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		}
	});

	it(". Remove the student(TA) to allow us to delete the course if any TA course is present", function(done) {
		additionalInstructOrTA.verifyPresesnceOfTACourseOnManageMyCourse(browser, newCourseNameB).then(function(coursePresenceStatus) {
			courseTAStatusB = coursePresenceStatus;
			if (coursePresenceStatus) {
				copyCoursePage.clickOnEditIcon(browser, newCourseNameB).then(function() {
					additionalInstructOrTA.checkIfTAStudentAdded(browser).then(function(TAStudent) {
						TAStudentStatus = TAStudent;
						if (TAStudentStatus) {
							additionalInstructOrTA.deleteTAstudent(browser).then(function() {
								pageLoadingTime = 0;
								takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
							});
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("TA course is not added", "success") +
								report.reportFooter());
							done();
						}
					});
				});
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("TA course is not present", "success") +
					report.reportFooter());
				done();
			}
		});
	});

	it(". Save the course", function(done) {
		if (courseTAStatusB) {
			additionalInstructOrTA.clickOnSaveButton(browser).then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
			});
		} else {
			done();
		}
	});

	it(". Select the newly created course and delete it as part of cleanup", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		if (courseTAStatusB) {
			clearAllSavedContent.clearCreatedCourse(browser, done, newCourseNameB);
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
