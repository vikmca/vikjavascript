require('colors');
var wd = require('wd');
var asserters = wd.asserters;
var _ = require('underscore');
var session = require("../../support/setup/browser-session");
var dataUtil = require("../../util/date-utility");
var stringutil = require("../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var courseHelper = require("../../support/helpers/courseHelper");
var basicpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var createNewCoursepo = require("../../support/pageobject/" + pageobject + "/" + envName + "/createNewCoursepo");
var brainPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var copyCoursePage = require("../../support/pageobject/" + pageobject + "/" + envName + "/copyCoursepo.js")
var additionalInstructOrTA = require("../../support/pageobject/" + pageobject + "/" + envName + "/additionalInstructOrTApo.js");
var report = require("../../support/reporting/reportgenerator");
var clearAllSavedContent = require("../../support/pageobject/" + pageobject + "/" + envName + "/clearData");
var userSignOut = require("../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var testData = require("../../../../test_data/data.json");
var takeQuizpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'VALIDATE TEACHING ASSISTANT ROLE IN 4LTR PLATFORM', function() {
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
	var productData;
	var pageLoadingTime;
	var product;
	var browserName;
	var courseTAStatus = false;
	var data;
	var totalTime;
	var serialNumber = 0;
	var courseAggregationStatus = "failure";

	before(function(done) {
		browser = session.create(done);
		setDate = testData.courseAccessInformation.DateBeforeToday;
		newCourseData = testData.instructorResourceCenter;
		userType = "instructor";
		product = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString()) || testData.existingCourseDetails.product;
		if (product === "default") {
			product = testData.existingCourseDetails.product;
		}
		browserName = stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString());
		console.log("browserName::" + browserName);
		courseName = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_COURSE.toString()) || testData.existingCourseDetails.coursename;
		newCourseName = product + " : TA : COURSE"
		data = loginPage.setLoginData(userType);
		productData = loginPage.getProductData();
		totalTime = 0;
		//Reports
		console.log(report.formatTestName("VALIDATE TEACHING ASSISTANT ROLE IN 4LTR PLATFORM"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, newCourseName));
		console.log(report.formatTestScriptFileName("***validateTAStudentHasInstructorPrivileges.js***"));
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
		console.log(report.reportHeader() +
			report.stepStatusWithData("CourseCGI and MAX Timeout set as ", dataUtil.millisecondsToStr(courseHelper.getCourseTimeOut())) +
			report.stepStatusWithData("Course Aggregation MAX Timeout set as ", dataUtil.millisecondsToStr(courseHelper.getCourseAggregationTimeOut())) +
			report.stepStatusWithData("Course Key Generated ", coursekey, coursekeystatus) +
			report.stepStatusWithData("Course CGI Generated ", courseCGI, courseCreationStatus) +
			report.stepStatus("Aggregation Status ", aggregationStatus) +
			report.stepStatusWithData("Aggregation process took ", aggregationCompletionTime, aggregationStatus) +
			report.reportFooter());
		console.log(report.formatTestTotalTime(totalTime, scriptName, allPassed));
		session.close(allPassed, done);
	});
// for(var i = 0;i<20; i++){
	// Log in as primary instructor create the course and log all analytics on ConceptTracker and create a assessment type assignment
	it(". Log in to 4LTR Platform as instructor", function(done) {
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
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	it(". Remove the student(TA) to allow us to delete the course if any TA course is present", function(done) {
		additionalInstructOrTA.verifyPresesnceOfTACourseOnManageMyCourse(browser, newCourseName).then(function(coursePresenceStatus) {
			courseTAStatus = coursePresenceStatus;
			if (coursePresenceStatus) {
				copyCoursePage.clickOnEditIcon(browser, newCourseName).then(function() {
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

	it(". Save the changes after remove TA user if any TA course is present it as part of cleanup", function(done) {
		if (courseTAStatus) {
			additionalInstructOrTA.clickOnSaveButton(browser).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("TA student is deleted from TA course", "success") +
					report.reportFooter());
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("TA course is not present", "success") +
				report.reportFooter());
			done();
		}
	});

	it(". Delete the TA course if present it as part of cleanup", function(done) {
		if (courseTAStatus) {
			clearAllSavedContent.clearCreatedCourse(browser, done, newCourseName);
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("TA course is not present", "success") +
				report.reportFooter());
			done();
		}
	});
// }
	it(". Navigate to Instructor SSO", function(done) {
		basicpo.navigateToInstructorDashboard(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
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
		createNewCoursepo.enterCourseName(browser, newCourseName).then(function() {
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

	it(". Click on add TA button and enter the primary instructor name in input field and validate user should unable to add primary instructor as teaching assistant ", function(done) {
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

	it(". Clear the text box and enter valid TA user and click on add button", function(done) {
		data = loginPage.setLoginData("student");
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
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
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

	it(". Handle EULA[End User License Agreement]", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.handleEula(browser).then(function() {
			done();
		});
	});

	it(". verify the model UI components", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		var iconcount;
		var textcount;
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		createNewCoursepo.eulaIconCount(browser).then(function(elementss) {
			console.log(" _.size(elementss)" + _.size(elementss));
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

	it(". Validate the instructor specific menu items are present", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		basicpo.validatePresenceOfInstructorMenuItem(browser).then(function(menuText) {
			if (menuText.indexOf("MANAGE MY COURSE") > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Instructor menu is present", menuText, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Instructor menu is not present", menuText, "failure") +
					report.reportFooter());
			}
		});
	});


	it(". Log out as Instructor", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userSignOut.userSignOut(browser, done);
	});

	it(". Reload the page and wait for page load", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	// log in as TA student validate instructor's privileges is present
	it(". Log in as TA student", function(done) {
		userType = "student";
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(".Reload the page and wait for page load", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		browser
			.sleep(3000).refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});


	it(". Select a Course and launch", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		loginPage.launchACourse("TA", newCourseName, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Handle EULA[End User License Agreement]", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.handleEula(browser).then(function() {
			done();
		});
	});

	it(". verify the model UI components", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		var iconcount;
		var textcount;
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		createNewCoursepo.eulaIconCount(browser).then(function(elementss) {
			console.log(" _.size(elementss)" + _.size(elementss));
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

	it(". Validate the instructor specific menu items are present", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		basicpo.validatePresenceOfInstructorMenuItem(browser).then(function(menuText) {
			if (menuText.indexOf("MANAGE MY COURSE") > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Instructor menu is present", menuText, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Instructor menu is not present", menuText, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Logout as TA student", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.timeout(courseHelper.getElevatedTimeout());
		userSignOut.userSignOut(browser, done);
	});

	it(". Log in as instructor", function(done) {
		userType = "instructor";
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Click on manage my course", function(done) {
		createNewCoursepo.clickOnManageMyCourse(browser).then(function() {
			done();
		});
	});

	it(". Click on edit course under manage my course", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.timeout(courseHelper.getElevatedTimeout());
		copyCoursePage.clickOnEditIcon(browser, newCourseName).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	it(". Remove the student(TA) to allow us to delete the course if any TA course is present", function(done) {
		if (courseAggregationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		additionalInstructOrTA.checkIfTAStudentAdded(browser).then(function(TAStudent) {
			var TAStudentStatus = TAStudent;
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

	it(". Save the course", function(done) {
		additionalInstructOrTA.clickOnSaveButton(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	it(". Select the created course and delete it as part of cleanup", function(done) {
		if (courseAggregationStatus === "failure") {
			console.log("inside course aggregation not equal to success");
			userSignOut.userSignOut(browser, done);
		} else {
			console.log("inside course delete else");
			clearAllSavedContent.clearCreatedCourse(browser, done, newCourseName);
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
