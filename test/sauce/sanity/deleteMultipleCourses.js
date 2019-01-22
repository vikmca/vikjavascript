require('colors');
var wd = require('wd');
var dataUtil = require("../util/date-utility");
var stringutil = require("../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var session = require("../support/setup/browser-session");
var brainPage = require("../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var createNewCoursepo = require("../support/pageobject/" + pageobject + "/" + envName + "/createNewCoursepo");
var testData = require("../../../test_data/data.json");
var clearAllSavedContent = require("../support/pageobject/" + pageobject + "/" + envName + "/clearData");
var menuPage = require("../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var instructorGradebookNavigationPage = require("../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/gradebookNavigationpo");
var courseHelper = require("../support/helpers/courseHelper");
var instructorGradebookForDropStudent = require("../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/dropStudentFromCourse");
var report = require("../support/reporting/reportgenerator");
var userSignOut = require("../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var basicpo = require("../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var takeQuizpo = require("../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var courseRegistrationpo = require("../support/pageobject/" + pageobject + "/" + envName + "/courseRegistrationpo.js");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'DELETE MULTIPLE COURSES', function() {
	var browser;
	var allPassed = true;
	var userType;
	var setDate;
	var firstname = "TestBot";
	var lastname = "Robo";
	var courseName = " ";
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
		// courseName = product + " " + "COURSE FOR DROP STUDENT FROM COURSE";
		//Reports
		console.log(report.formatTestName("DELETE MULTIPLE COURSES"));
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
	for (var courseIndex = 1; courseIndex < 7; courseIndex++) {
		it(". Login to 4LTR Platform", function(done) {
			this.timeout(courseHelper.getElevatedTimeout());
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

		it(". Get course name", function(done) {
			loginPage.getCourseName(browser, courseIndex).then(function(courseNameForDeletion) {
				courseName = courseNameForDeletion;
				console.log(courseNameForDeletion);
				done();
			});
		});
		if (courseName.indexOf("Automation") > -1 || courseName.indexOf(" : Index : ") > -1) {
			console.log("course is used in automation script");
			console.log("in" + courseName);
		} else {
			it(". Launch a Course under manage course", function(done) {
				this.timeout(courseHelper.getElevatedTimeout());
				loginPage.launchCoursesOnManageCourse(browser, courseIndex, done);
			});

			it(". Navigate on GradeBook page if any duplicate course is present", function(done) {
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
			});

			it(". Navigate to student's detailed GradeBook view if any student is registered on duplicate course", function(done) {
				if (courseAggregatedStatus) {
					instructorGradebookNavigationPage.checkIfStudentIsPresent(browser, " ").then(function(studentNamePresentStatus) {
						console.log(studentNamePresentStatus);
						if (studentNamePresentStatus) {
							instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, " ").then(function() {
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
				createNewCoursepo.clickOnManageMyCourse(browser).then(function() {
					done();
				});
			});

			it(". Select the newly created course and delete it as part of cleanup", function(done) {
				this.timeout(courseHelper.getElevatedTimeout());
				clearAllSavedContent.clearCreatedCourse(browser, done, courseName);
			});

			it(". Select the newly created course and delete it as part of cleanup", function(done) {
				browser.quit().nodeify(done);
			});

			// it(". Log out as Instructor. ", function (done) {
			//   browser.refresh().sleep(500).then(function(){
			//     userSignOut.signOutFromSSO(userType, browser).then(function(){
			//           done();
			//       });
			//   });
			// });
		}
	}

});
