require('colors');
var wd = require('wd');
var _ = require('underscore');
var asserters = wd.asserters;
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var menuPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var session = require("../../../support/setup/browser-session");
var testData = require("../../../../../test_data/data.json");
var courseHelper = require("../../../support/helpers/courseHelper");
var report = require("../../../support/reporting/reportgenerator");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var managemydocspo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/managemydocspo");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'Document: Validate publisher-provided documents in Manage Docs', function() {
	var browser;
	var allPassed = true;
	var userType;
	var setDate;
	var courseName;
	var product;
	var pageLoadingTime;
	var totalTime;
	var serialNumber = 0;
	var productData;

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
			courseName = "Automation : " + product + "V2";
		}
		data = loginPage.setLoginData(userType);
		productData = loginPage.getProductData();
		totalTime = 0;
		console.log(report.formatTestName("DOCUMENTS :: PUBLISHER DOCUMENTS VERIFICATION"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***validatePublisherProvidedDocuments.js***"));
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
//For now this feature is only implimented for PFIN title so we dont execute for other titles
	if (product === "PFIN6") {
		it(". Login as Instructor", function(done) {
			userType = "instructor";
			data = loginPage.setLoginData(userType);
			//Reports
			console.log(report.printLoginDetails(data.userId, data.password));
			loginPage.loginToApplication(browser, userType, done);
		});

		it(". Select a Product", function(done) {
			brainPage.selectProduct(product, browser, done);
		});

		it(". Select a Course and launch", function(done) {
			this.timeout(120000);
			loginPage.launchACourse(userType, courseName, browser, done);
		});

		it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
			loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
		});

		it(". Wait for page load", function(done) {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});

		it(". Navigate to Documents Page under Manage My Course page", function(done) {
			menuPage.selectManagDocs(browser, done);
		});

		it(". Validate Publisher Documents Heading", function(done) {
			managemydocspo.validatePublisherProvidedDocuments(browser).then(function(documentPageHeading) {
				if (documentPageHeading.indexOf(testData.documents.heading) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Documents page heading " + documentPageHeading + " is compared against ", testData.documents.heading, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Documents page heading " + documentPageHeading + " is compared against ", testData.documents.heading, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Validate Document Division", function(done) {
			managemydocspo.checkActiveTabForAllDocs(browser).then(function(allDocsTabText) {
				if (allDocsTabText.indexOf(testData.documents.allDocs) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Documents page active tab " + allDocsTabText + " is compared against ", testData.documents.allDocs, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Documents active page tab " + allDocsTabText + " is compared against ", testData.documents.allDocs, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Validate Active Tab for Student Accessible Document Tab", function(done) {
			managemydocspo.checkActiveTabForStudentAccessibleDocs(browser).then(function(studentAccessibleDocsTabText) {
				if (studentAccessibleDocsTabText.indexOf(testData.documents.studentAccessibleDocs) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Documents page active tab " + studentAccessibleDocsTabText + " is compared against ", testData.documents.studentAccessibleDocs, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Documents active page tab " + studentAccessibleDocsTabText + " is compared against ", testData.documents.studentAccessibleDocs, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Validate all chapters present on accessible docs page", function(done) {
			managemydocspo.allChaptersPresentOnManageMyDocsPage(browser).then(function(chapters) {
				if (_.size(chapters) == productData.chapter.chapterCounts) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("All chapters on Documents page under Manage My Course " + _.size(chapters) + " is comapred against", productData.chapter.chapterCounts, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("All chapters on Documents page under Manage My Course " + _.size(chapters) + " is comapred against", productData.chapter.chapterCounts, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Validate the presence of different type of documents on Documents page under Manage My Course", function(done) {
			this.timeout(courseHelper.getElevatedTimeout());
			managemydocspo.validateManageMyDocuments(browser, productData.chapter.topic.documents.managedocuments[0].documents[0]).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("SEARCH :: Verified the presence of documents on Documents page under Manage My Course ", productData.chapter.topic.documents.managedocuments[0].documents[0], "success") +
					report.reportFooter());
				managemydocspo.validateManageMyDocuments(browser, productData.chapter.topic.documents.managedocuments[0].documents[1]).then(function() {
					console.log(report.reportHeader() +
						report.stepStatusWithData("SEARCH :: Verified the presence of documents on Documents page under Manage My Course ", productData.chapter.topic.documents.managedocuments[0].documents[1], "success") +
						report.reportFooter());
					done();
				});
			});
		});

		it(". Log out as Instructor", function(done) {
			this.timeout(courseHelper.getElevatedTimeout());
			userSignOut.userSignOut(browser, done);
		});

		it(". Login as student", function(done) {
			userType = "student";
			data = loginPage.setLoginData(userType);
			//Reports
			console.log(report.printLoginDetails(data.userId, data.password));
			loginPage.loginToApplication(browser, userType, done);
		});

		it(". Select a Course and launch", function(done) {
			loginPage.launchACourse(userType, courseName, browser, done);
		});

		it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
			loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
		});

		it(". Navigate to Documents Tab", function(done) {
			managemydocspo.navigateToDocumentsTab(browser).then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
		});

		it(". Validate Publisher Documents tab heading is present", function(done) {
			managemydocspo.validateDocuments(browser).then(function(documentPageHeading) {
				if (documentPageHeading.indexOf(testData.documents.heading) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Documents page heading " + documentPageHeading + " is compared against ", testData.documents.heading, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Documents page heading " + documentPageHeading + " is compared against ", testData.documents.heading, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Validate all chapters present on Student's Documents page", function(done) {
			managemydocspo.checkAllDocsPresentOnStudentDocsPage(browser).then(function(chapters) {
				if (_.size(chapters) == productData.chapter.chapterCounts) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("All chapters on Student's Documents page " + _.size(chapters) + " is comapred against", productData.chapter.chapterCounts, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("All chapters on Student's Documents page " + _.size(chapters) + " is comapred against", productData.chapter.chapterCounts, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Validate the presence of different type of documents on Student's Documents page", function(done) {
			this.timeout(courseHelper.getElevatedTimeout());
			managemydocspo.validateManageMyDocuments(browser, productData.chapter.topic.documents.managedocuments[0].documents[0]).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("SEARCH :: Verified the presence of documents on Student's Documents page ", productData.chapter.topic.documents.managedocuments[0].documents[0], "success") +
					report.reportFooter());
				managemydocspo.validateManageMyDocuments(browser, productData.chapter.topic.documents.managedocuments[0].documents[1]).then(function() {
					console.log(report.reportHeader() +
						report.stepStatusWithData("SEARCH :: Verified the presence of documents on Student's Documents page ", productData.chapter.topic.documents.managedocuments[0].documents[1], "success") +
						report.reportFooter());
					done();
				});
			});
		});

		it(". Log out as Student", function(done) {
			userSignOut.userSignOut(browser, done);
		});
	} else {
		console.log("Publisher documents are not available for other than PFIN6 product");
	}

});
