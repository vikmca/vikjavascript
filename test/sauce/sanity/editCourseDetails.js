var wd = require('wd');
var asserters = wd.asserters;
var stringutil = require("../util/stringUtil");
var session = require("../support/setup/browser-session");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("..//support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("..//support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var tocPage = require("..//support/pageobject/" + pageobject + "/" + envName + "/tocpo");
var basicpo = require("..//support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var userSignOut = require("..//support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var copyCoursePage = require("../support/pageobject/" + pageobject + "/" + envName + "/copyCoursepo.js");
var dataUtil = require("../util/date-utility");
var createNewCoursepo = require("..//support/pageobject/" + pageobject + "/" + envName + "/createNewCoursepo");
var additionalInstructOrTA = require("../support/pageobject/" + pageobject + "/" + envName + "/additionalInstructOrTApo.js");
var courseHelper = require("../support/helpers/courseHelper");
var testData = require("../../../test_data/data.json");
var takeQuizpo = require("../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var report = require("../support/reporting/reportgenerator");
var _ = require('underscore');
var path = require('path');
var scriptName = path.basename(__filename);

describe(scriptName + 'INSTRUCTOR :: EDIT COURSE START AND END DATE', function() {

	var browser;
	var allPassed = true;
	var userType;
	var courseName;
	var product;
	var productData;
	var pageLoadingTime;
	var totalTime;
	var serialNumber = 0;
	var courseKey;
	var courseNameStatus = false;
	var courseAggregatedStatus = false;
	var copyCourse;
	var setDate;
	var copyCourseforDifferentInst;
	before("EDIT START AND END DATE OF COURSE", function(done) {

		browser = session.create(done);
		setDate = testData.courseAccessInformation.DateBeforeToday;
		userType = "instructor";
		product = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString());
		courseName = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_COURSE.toString());

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
		console.log(report.formatTestName("EDIT START AND END DATE OF COURSE"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***editCourseDetails.js***"));
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
	// if (process.env.RUN_ENV.toString() === "\"not\"") {
	//
	// if(process.env.RUN_IN_PLATFORM.toString() === "\"Desktop\"") {
	// it(". Login to 4LTR Platform", function(done) {
	// 	data = loginPage.setLoginData(userType);
	// 	//Reports
	// 	console.log(report.printLoginDetails(data.userId, data.password));
	// 	loginPage.loginToApplication(browser, userType, done);
	// });
	//
	// it(". Select a Product", function(done) {
	// 	brainPage.selectProduct(product, browser, done);
	// });
	//
	// it(". Select a Course and launch if duplicate course is present on instructor dashboard", function(done) {
	// 	this.timeout(courseHelper.getElevatedTimeout());
	// 	loginPage.checkIfCoursePresent(browser, copyCourse).then(function(status) {
	// 		courseNameStatus = status;
	// 		if (courseNameStatus) {
	// 			loginPage.launchACourse(userType, copyCourse, browser, done);
	// 		} else {
	// 			console.log(report.reportHeader() +
	// 				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
	// 				report.reportFooter());
	// 			userSignOut.signOutFromSSO(userType, browser).then(function() {
	// 				pageLoadingTime = 0;
	// 				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
	// 			});
	// 		}
	// 	});
	// });
	//
	// it(". Wait for page load", function(done) {
	// 	pageLoadingTime = 0;
	// 	takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	// });
	//
	// it(". Navigate on GradeBook page if any duplicate course is present", function(done) {
	// 	if (courseNameStatus) {
	// 		this.timeout(courseHelper.getElevatedTimeout());
	// 		basicpo.checkEula(browser).then(function(eula) {
	// 			console.log(report.reportHeader() +
	// 				report.stepStatusWithData("EULA Acceptted", !eula, "success") +
	// 				report.reportFooter());
	// 			basicpo.getTitleOfPage(browser).then(function(pageTitle) {
	// 				console.log("pageTitle" + pageTitle);
	// 				var pageTitleText = pageTitle;
	// 				if (pageTitleText !== "undefined") {
	// 					courseAggregatedStatus = true;
	// 					console.log("courseAggregationStatus   " + courseAggregatedStatus);
	// 					if (courseAggregatedStatus) {
	// 						if (eula) {
	// 							createNewCoursepo.handleEula(browser).then(function() {
	// 								createNewCoursepo.clickOnGotItButton(browser).then(function() {
	// 									menuPage.selectGradebook(userType, browser, done);
	// 								});
	// 							});
	// 						} else {
	// 							menuPage.selectGradebook("instructor", browser, done);
	// 						}
	// 					} else {
	// 						userSignOut.userSignOut(browser, done);
	// 					}
	// 				} else {
	// 					console.log(report.reportHeader() +
	// 						report.stepStatusWithData("Course is not aggregated", courseAggregatedStatus, "success") +
	// 						report.reportFooter());
	// 					userSignOut.userSignOut(browser, done);
	// 				}
	// 			});
	// 		});
	// 	} else {
	// 		console.log(report.reportHeader() +
	// 			report.stepStatusWithData("Duplicate course A is not present on instructor dashboard", courseNameStatus, "success") +
	// 			report.reportFooter());
	// 		done();
	// 	}
	// });
	//
	// it(". Navigate to student's detailed GradeBook view if any student is registered on duplicate course", function(done) {
	// 	if (courseNameStatus) {
	// 		if (courseAggregatedStatus) {
	// 			data = loginPage.setLoginData("student");
	// 			console.log(loginPage.getUserName());
	// 			instructorGradebookNavigationPage.checkIfStudentIsPresent(browser, loginPage.getUserName()).then(function(studentNamePresentStatus) {
	// 				if (studentNamePresentStatus) {
	// 					instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserName()).then(function() {
	// 						instructorGradebookForDropStudent.clickOnDropStudentButton(browser).then(function() {
	// 							instructorGradebookForDropStudent.clickOnYesUnderDialogueBox(browser).text().then(function(mainGradebookPageText) {
	// 								userSignOut.userSignOut(browser, done);
	// 							});
	// 						});
	// 					});
	// 				} else {
	// 					console.log(report.reportHeader() +
	// 						report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
	// 						report.reportFooter());
	// 					done();
	// 					userSignOut.userSignOut(browser, done);
	// 				}
	// 			});
	// 		} else {
	// 			console.log(report.reportHeader() +
	// 				report.stepStatusWithData("course is not aggregated", courseAggregatedStatus, "success") +
	// 				report.reportFooter());
	// 			done();
	// 		}
	// 	} else {
	// 		console.log(report.reportHeader() +
	// 			report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
	// 			report.reportFooter());
	// 		done();
	// 	}
	// });
	//
	// it(". Login to 4LTR Platform", function(done) {
	// 	data = loginPage.setLoginData(userType);
	// 	//Reports
	// 	console.log(report.printLoginDetails(data.userId, data.password));
	// 	loginPage.loginToApplication(browser, userType, done);
	// });
	//
	// it(". Select a Product", function(done) {
	// 	brainPage.selectProduct(product, browser, done);
	// });
	//
	// it(". Select a Course and launch if duplicate course is present on instructor dashboard", function(done) {
	// 	this.timeout(courseHelper.getElevatedTimeout());
	// 	loginPage.checkIfCoursePresent(browser, copyCourseforDifferentInst).then(function(status) {
	// 		courseNameStatus = status;
	// 		if (courseNameStatus) {
	// 			loginPage.launchACourse(userType, copyCourseforDifferentInst, browser, done);
	// 		} else {
	// 			console.log(report.reportHeader() +
	// 				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
	// 				report.reportFooter());
	// 			userSignOut.signOutFromSSO(userType, browser).then(function() {
	// 				pageLoadingTime = 0;
	// 				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
	// 			});
	// 		}
	// 	});
	// });
	//
	// it(". Wait for page load", function(done) {
	// 	pageLoadingTime = 0;
	// 	takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	// });
	//
	// it(". Navigate on GradeBook page if any duplicate course is present", function(done) {
	// 	if (courseNameStatus) {
	// 		this.timeout(courseHelper.getElevatedTimeout());
	// 		basicpo.checkEula(browser).then(function(eula) {
	// 			console.log(report.reportHeader() +
	// 				report.stepStatusWithData("EULA Acceptted", !eula, "success") +
	// 				report.reportFooter());
	// 			basicpo.getTitleOfPage(browser).then(function(pageTitle) {
	// 				console.log("pageTitle" + pageTitle);
	// 				var pageTitleText = pageTitle;
	// 				if (pageTitleText !== "undefined") {
	// 					courseAggregatedStatus = true;
	// 					console.log("courseAggregationStatus   " + courseAggregatedStatus);
	// 					if (courseAggregatedStatus) {
	// 						if (eula) {
	// 							createNewCoursepo.handleEula(browser).then(function() {
	// 								createNewCoursepo.clickOnGotItButton(browser).then(function() {
	// 									menuPage.selectGradebook(userType, browser, done);
	// 								});
	// 							});
	// 						} else {
	// 							menuPage.selectGradebook("instructor", browser, done);
	// 						}
	// 					} else {
	// 						userSignOut.userSignOut(browser, done);
	// 					}
	// 				} else {
	// 					console.log(report.reportHeader() +
	// 						report.stepStatusWithData("Course is not aggregated", courseAggregatedStatus, "success") +
	// 						report.reportFooter());
	// 					userSignOut.userSignOut(browser, done);
	// 				}
	// 			});
	// 		});
	// 	} else {
	// 		console.log(report.reportHeader() +
	// 			report.stepStatusWithData("Duplicate course A is not present on instructor dashboard", courseNameStatus, "success") +
	// 			report.reportFooter());
	// 		done();
	// 	}
	// });
	//
	// it(". Navigate to student's detailed GradeBook view if any student is registered on duplicate course", function(done) {
	// 	if (courseNameStatus) {
	// 		if (courseAggregatedStatus) {
	// 			data = loginPage.setLoginData("student");
	// 			console.log(loginPage.getUserName());
	// 			instructorGradebookNavigationPage.checkIfStudentIsPresent(browser, loginPage.getUserName()).then(function(studentNamePresentStatus) {
	// 				if (studentNamePresentStatus) {
	// 					instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserName()).then(function() {
	// 						instructorGradebookForDropStudent.clickOnDropStudentButton(browser).then(function() {
	// 							instructorGradebookForDropStudent.clickOnYesUnderDialogueBox(browser).text().then(function(mainGradebookPageText) {
	// 								userSignOut.userSignOut(browser, done);
	// 							});
	// 						});
	// 					});
	// 				} else {
	// 					console.log(report.reportHeader() +
	// 						report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
	// 						report.reportFooter());
	// 					done();
	// 					userSignOut.userSignOut(browser, done);
	// 				}
	// 			});
	// 		} else {
	// 			console.log(report.reportHeader() +
	// 				report.stepStatusWithData("course is not aggregated", courseAggregatedStatus, "success") +
	// 				report.reportFooter());
	// 			done();
	// 		}
	// 	} else {
	// 		console.log(report.reportHeader() +
	// 			report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
	// 			report.reportFooter());
	// 		done();
	// 	}
	// });
	//
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

	it(". Fill in the start date", function(done) {
		createNewCoursepo.fillTheStartDate(browser).then(function() {
			done();
		});
	});

	it(". Re- Edit the date, 10 days before from today's date ", function(done) {
		createNewCoursepo.enterTheEndData(browser, dataUtil.getSpecificDateAfterCurrentDate(setDate)).then(function() {
			done();
		});
	});

	it(". Save the course", function(done) {
		additionalInstructOrTA.clickOnSaveButton(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		});
	});

	it(". Wait for page loading", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
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

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Log out as Instructor", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userSignOut.userSignOut(browser, done);
	});
// }
	// }

});
