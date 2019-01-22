  require('colors');
  var wd = require('wd');
  var _ = require('underscore');
  var testData = require("../../../../test_data/data.json");
  var session = require("../../support/setup/browser-session");
  var stringutil = require("../../util/stringUtil");
  var pageobject = stringutil.getPlatform();
  var envName = stringutil.getEnvironment();
  var loginPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
  var menuPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
  var studybit = require("../../support/pageobject/" + pageobject + "/" + envName + "/studybitpo");
  var brainPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
  var report = require("../../support/reporting/reportgenerator");
  var userSignOut = require("../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
  var studentAssessmentsPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
  var basicpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
  var courseHelper = require("../../support/helpers/courseHelper");
  var path = require('path');
  var scriptName = path.basename(__filename);
  describe(scriptName + 'VERIFYING STUDENT NOT ABLE TO ACCESS INSTRUCTOR FEATURES', function() {
  	var browser;
  	var allPassed = true;

  	var userType;
  	var courseName;
  	var product;
  	var data;
  	var productData;
  	var pageLoadingTime;
  	var totalTime;
  	var serialNumber = 0;

  	before(function(done) {

  		browser = session.create(done);

  		userType = "student";

  		product = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString());
  		if (product === "default") {
  			product = testData.existingCourseDetails.product;
  		}


  		courseName = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_COURSE.toString());
  		if (courseName === "default") {

  			courseName = testData.existingCourseDetails.selfstudycoursename;
  		}

  		data = loginPage.setLoginData(userType);
  		productData = loginPage.getProductData();
  		totalTime = 0;
  		//Reports
  		console.log(report.formatTestName("4LTR FEATURES :: VERIFYING STUDENT NOT ABLE TO ACCESS INSTRUCTOR FEATURES "));
  		console.log(report.formatTestScriptFileName("***studentFeatureActionControl.js***"));
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


  	it(". Login to 4LTR platform as student", function(done) {
      data = loginPage.setLoginData(userType);
  		//Reports
  		console.log(report.printLoginDetails(data.userId, data.password));
  		loginPage.loginToApplication(browser, userType, done);
  	});

  	it(". Select a Course and launch", function(done) {
  		this.timeout(courseHelper.getElevatedTimeout());
  		loginPage.launchACourse(userType, courseName, browser, done);
  	});

    it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
  		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
  	});

  	it(". Navigate to Assignments Page", function(done) {
  		menuPage.selectAssignments(userType, browser, done);
  	});

  	it(". URL Modification for Instructor Access at Assignments Page ", function(done) {
  		basicpo.studentAccessVerification(browser, "assignments", "studentAssignments").then(function() {
  			pageLoadingTime = 0;
  			pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
  		});
  	});

  	it(". Validate student is not able to access instructor features at Assignments Page", function(done) {
  		studentAssessmentsPage.checkAccessControl(browser, "Assignments").then(function(accessControlStatus) {
  			if (accessControlStatus) {
  				console.log(report.reportHeader() +
  					report.stepStatusWithData("Student is not able to access instructor features at Assignments Page", accessControlStatus, "success") +
  					report.reportFooter());
  				done();
  			} else {
  				console.log(report.reportHeader() +
  					report.stepStatusWithData("Student is able to access instructor features at Assignments Page", accessControlStatus, "failure") +
  					report.reportFooter());
  			}
  		});
  	});

  	it(". Navigate to GradeBook page", function(done) {
  		menuPage.selectGradebook(userType, browser, done);
  	});

  	it(". URL Modification for Instructor Access at GradeBook Page", function(done) {
  		basicpo.studentAccessVerification(browser, "gradebook", "studentGradebook").then(function() {
  			pageLoadingTime = 0;
  			pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
  		});
  	});

  	it(". Validate student is not able to access instructor features at GradeBook Page", function(done) {
  		this.retries(2);
  		studentAssessmentsPage.checkAccessControl(browser, "Gradebook").then(function(accessControlStatus) {
  			if (accessControlStatus) {
  				console.log(report.reportHeader() +
  					report.stepStatusWithData("Student is not able to access instructor features at GradeBook Page", accessControlStatus, "success") +
  					report.reportFooter());
  				done();
  			} else {
  				console.log(report.reportHeader() +
  					report.stepStatusWithData("Student is able to access instructor features at GradeBook Page", accessControlStatus, "failure") +
  					report.reportFooter());
  			}
  		});
  	});

  	it(". Navigate To StudyBoard ", function(done) {
  		studybit.navigateToStudyBoard(browser, done);
  	});

  	it(". Navigate to ConceptTracker", function(done) {
  		menuPage.selectSubTabOnStudyBoard(browser, "Concept Tracker", done);
  	});

  	it(". URL Modification for Instructor Access at Concept Tracker Page", function(done) {
  		basicpo.studentAccessVerification(browser, "conceptTracker", "progress").then(function() {
  			pageLoadingTime = 0;
  			pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
  		});
  	});

  	it(". Validate student is not able to access instructor features at Concept Tracker Page", function(done) {
  		studentAssessmentsPage.checkAccessControl(browser, "Concept Tracker").then(function(accessControlStatus) {
  			if (accessControlStatus) {
  				console.log(report.reportHeader() +
  					report.stepStatusWithData("student is not able to access instructor features", accessControlStatus, "success") +
  					report.reportFooter());
  				done();
  			} else {
  				console.log(report.reportHeader() +
  					report.stepStatusWithData("student is able to access instructor features", "", "failure") +
  					report.reportFooter());
  			}
  		});
  	});

  	it(". Log out as Student", function(done) {
  		userSignOut.userSignOut(browser, done);
  	});

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
