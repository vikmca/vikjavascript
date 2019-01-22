require('colors');
var wd = require('wd');
var _ = require('underscore');
var testData = require("../../../../../test_data/data.json");
var docsnlinks = require("../../../../../test_data/assignments/documentAndLinks.json");
var session = require("../../../support/setup/browser-session");
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var recursiveFnPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/recursiveFnPagepo");
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var menuPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var calendarNavigation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/navigationpo");
var documentAndLinksPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/documentAndLinkspo");
var assessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assessmentspo");
var searchFeaturePage = require("../../..//support/pageobject/" + pageobject + "/" + envName + "/searchFeaturepo");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var courseHelper = require("../../../support/helpers/courseHelper");
var tocpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/tocpo.js");
var managemydocspo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/managemydocspo");
var studentAssessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var report = require("../../../support/reporting/reportgenerator");
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + '4LTR (' + 'Instructor/Student' + ') :: SEARCH :: SEARCH,MANAGE DOCUMENTS,DOCS AND LINKS ASSIGNMENT VALIDATION', function() {

	var browser;
	var allPassed = true;
	var userType;
	var courseName;
	var product;
	var productData;
	var totalTime;
	var serialNumber = 0;
	var pageLoadingTime;

	before(function(done) {
		browser = session.create(done);
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
		console.log(report.formatTestName("SEARCH :: SEARCH,MANAGE DOCUMENTS,DOCS AND LINKS ASSIGNMENT VALIDATION"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***searchServiceForTextAndDocValidation.js***"));
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


	it(". Login to 4LTR Platform as Instructor", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		data = loginPage.setLoginData(userType);
		//Reports
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
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

	it(". Navigate to Assignments page", function(done) {
		menuPage.selectAssignments(userType, browser, done);

	});

	it(". Delete all the past assignments for cleanup", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		assessmentsPage.deleteAssignment(browser, done);
	});

	it(". Refresh the page and wait for page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment result page is loaded");
			});
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Close flash on assignment page", function(done) {
		calendarNavigation.handleTheFlashAlert(browser).then(function() {
			done();
		});
	});

	it(". Navigate to assignment list view", function(done) {
		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) === "mobile" || stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) === "iOS") {
			tocpo.selectTileView(browser).then(function() {
				done();
			});
		} else {
			console.log("for mobile specific");
			done();
		}
	});

	it(". Wait for page loading", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
	});

	it(". Select current date and open the 'Documents And Links' Type assignment settings page", function(done) {
		calendarNavigation.selectADateForAssignment(browser).then(function() {
			calendarNavigation.selectDocumentsAndLinksTypeAssignment(browser, done);
		});
	});

	it(". Complete the Document and Link form for system created assignment", function(done) {
		documentAndLinksPage.enterName(browser).then(function() {
			documentAndLinksPage.enterRevealDate(browser).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Document and link assignment has been created :", "success") +
					report.reportFooter());
				documentAndLinksPage.enterDescription(browser).nodeify(done);
			});
		});
	});

	it(". Add the attachments", function(done) {
		documentAndLinksPage.clickOnAddAttachment(browser).then(function() {
			documentAndLinksPage.addTheAttachments(browser, done);
		});
	});

	it(". Save the Documents and Link Assignment", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		documentAndLinksPage.saveAssignment(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	// https://jira.cengage.com/browse/LTR-5311
	it(". LTR-5311 :: Validate Page don't keep in loading state for a long after saving Document & Link type assignment", function(done) {
		takeQuizpo.pageLoadingStateValue(browser).then(function(loadingState) {
			console.log(loadingState);
			if (!loadingState) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Page gets loaded successfully", loadingState, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Page gets loaded successfully", !loadingState, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate the the Documents and Link Assignment get saved", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		recursiveFnPage.validateAssignmentGetsSaved(browser, done);
	});

	it(". Enter a search keyword and verify the results", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("searchFeature"));
		recursiveFnPage.verfiySearchedResults(browser, done);
	});

	it(". Wait for page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Open the search panel and type the text and validate the text present after reopening the search panel", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("searchFeature"));
		searchFeaturePage.openSearchControl(browser).then(function() {
			searchFeaturePage.enterTheSearchTerm(browser, productData.search_keyword).then(function() {
				searchFeaturePage.openSearchControl(browser).then(function() {
					searchFeaturePage.getTextFromSearchBox(browser).then(function(searchText) {
						if (searchText.indexOf(productData.search_keyword) > -1) {
							console.log(report.reportHeader() +
								report.stepStatus("Searched text is still displaying  as " + searchText + " after closing and reopening the search box", productData.search_keyword, "success") +
								report.reportFooter());
							done();
						} else {
							console.log(report.reportHeader() +
								report.stepStatus("Searched text is still displaying as " + searchText + " after closing and reopening the search box", productData.search_keyword, "failure") +
								report.reportFooter());
						}
					});
				});
			});
		});
	});

	it(". Refresh the page and wait for page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Open the search box and validate the text disappears after refreshing the page", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("searchFeature"));
		searchFeaturePage.openSearchControl(browser).then(function() {
			searchFeaturePage.validateSearchPanelIsActive(browser).then(function() {
				searchFeaturePage.openSearchControl(browser).then(function() {
					searchFeaturePage.getTextFromSearchBox(browser).then(function(searchText) {
						if (searchText.indexOf("") > -1) {
							console.log(report.reportHeader() +
								report.stepStatus("Searched text is still displaying  as " + searchText + " after closing and reopening the search box", "blank", "success") +
								report.reportFooter());
							done();
						} else {
							console.log(report.reportHeader() +
								report.stepStatus("Searched text is still displaying as " + searchText + " after closing and reopening the search box", "blank", "failure") +
								report.reportFooter());
						}
					});
				});
			});
		});
	});

	it(". Refresh the page and wait for page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Navigate to Documents page under Manage My Course", function(done) {
		menuPage.selectManagDocs(browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Validate all chapters present on Documents page under Manage My Course", function(done) {
		if(product == "PFIN6" || product == "SOC5"){
			console.log("in if pfin");
			managemydocspo.allChaptersPresentOnManageMyDocsPage(browser).then(function(chapters) {
				if (_.size(chapters) === parseInt(productData.chapter.chapterCounts) + 1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("All chapters on Documents page under Manage My Course " + _.size(chapters) + " is comapred against", productData.chapter.chapterCounts+1, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("All chapters on Documents page under Manage My Course " + _.size(chapters) + " is comapred against", productData.chapter.chapterCounts+1, "failure") +
						report.reportFooter());
				}
			});
		}else{
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
		}
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

	it(". Enter a invalid keyword under search panel and verify the results", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("searchFeature"));
		searchFeaturePage.openSearchControl(browser).then(function() {
			searchFeaturePage.enterTheSearchTerm(browser, productData.search_invalid_keyword).then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
		});
	});

	it(". Validate the search results when user enters invalid keyword", function(done) {
		browser.execute("return document.getElementsByClassName('search-results')[0].getElementsByTagName('h1')[0].textContent").then(function(searched_text) {
			if (searched_text === productData.search_results_invalid_keyword) {
				console.log(report.reportHeader() +
					report.stepStatus("O Searched results is displaying  as " + searched_text + " after entering the invalid keyword", "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatus("Searched results is still displaying  as " + searched_text + " after entering the invalid keyword", "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Wait for page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Log out as Instructor", function(done) {
		userSignOut.userSignOut(browser, done);
	});

	it(". Login as student", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userType = "student";
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});


	it(". Select a Course and launch", function(done) {
		loginPage.launchACourse(userType, courseName, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate to Assignments page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});


	it(". Click on the current date cell", function(done) {
		studentAssessmentsPage.clickCurrentDateCell(browser, done);
	});

	it(". Verify the Documents and Links type assignment and its attachment on Student's assignment view'", function(done) {
		this.retries(2);
		documentAndLinksPage.verifyDocsAndLinkAssignmentAtStudentCalendar(browser, productData.chapter.topic.documents.assignments[0].documents[0].name, documentAndLinksPage.getAssignmentName()).then(function() {
			console.log(report.reportHeader() +
				report.stepStatusWithData("SEARCH :: STUDENT ASSIGNMENT :: Verified the presence of assigned document ", productData.chapter.topic.documents.assignments[0].documents[0].name) +
				report.reportFooter());
			documentAndLinksPage.verifyDocsAndLinkAssignmentAtStudentCalendar(browser, productData.chapter.topic.documents.assignments[0].documents[1].name, documentAndLinksPage.getAssignmentName()).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("SEARCH :: STUDENT ASSIGNMENT :: Verified the presence of assigned document ", productData.chapter.topic.documents.assignments[0].documents[1].name) +
					report.reportFooter());
				done();
			});
		});
	});

	it(". Verify the Description of Documents and Links type assignment and its attachment on Student's assignment view to include the link", function(done) {
		documentAndLinksPage.VerifyDescriptionOfDocAndLinkAssignment(browser, docsnlinks.assignment.description).then(function() {
			done();
		});
	});

	it(". Log out as Student", function(done) {
		userSignOut.userSignOut(browser, done);
	});

	it(". Login as Instructor", function(done) {
		userType = "instructor";
		data = loginPage.setLoginData(userType);
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
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

	it(". Navigate to Assignments page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Delete the Document and links assignment for cleanup", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		assessmentsPage.deleteAssignment(browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Close flash on assignment page", function(done) {
		calendarNavigation.handleTheFlashAlert(browser).then(function() {
			done();
		});
	});

	it(". Log out as Instructor", function(done) {
		userSignOut.userSignOut(browser, done);
	});
});

//total test case : 30
