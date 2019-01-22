require('colors');

var wd = require('wd');
var dataUtil = require("../../util/date-utility");
var stringutil = require("../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var basicpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var takeQuizpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var loginPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var menuPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var studentAssessmentsPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var calendarNavigation = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/navigationpo");
var assessmentsPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assessmentspo");
var assessmentData = require("../../../../test_data/assignments/assessments.json");
var session = require("../../support/setup/browser-session");
var practiceQuizCreation = require("../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var _ = require('underscore');
var testData = require("../../../../test_data/data.json");
var studybit = require("../../support/pageobject/" + pageobject + "/" + envName + "/studybitpo");
var searchFeaturePage = require("../../support/pageobject/" + pageobject + "/" + envName + "/searchFeaturepo");
var createNewCoursepo = require("../../support/pageobject/" + pageobject + "/" + envName + "/createNewCoursepo");
var clearAllSavedContent = require("../../support/pageobject/" + pageobject + "/" + envName + "/clearData");
var tocPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/tocpo");
var courseHelper = require("../../support/helpers/courseHelper");
var report = require("../../support/reporting/reportgenerator");
var userSignOut = require("../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var switchcoursepo = require("../../support/pageobject/" + pageobject + "/" + envName + "/switchcoursepo.js");
var myCengageDashboardpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/myCengageDashboardpo.js");
var asserters = wd.asserters;
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'CENGAGE COURSE CREATION AND ASSIGNMENT CREATION', function() {
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
	var assignmentCreationStatus = "failure";
	var productData;
	var pageLoadingTime;
	var correctAnswer;
	var totalQuestions;
	var correctAnswerAfterStudentAttempt;
	var testBotQuizMetrics;
	var product;
	var totalTime;
	var serialNumber = 0;
	var courseAggregationStatus = "failure";
	var newCourseData;
	var newCourseName;
	var totalActiveCourses;
	var opendCourseUrl;

	before(function(done) {
		browser = session.create(done);
		setDate = testData.courseAccessInformation.DateBeforeToday;
		newCourseData = testData.instructorResourceCenter;

		userType = "instructor";

		product = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString()) || testData.existingCourseDetails.product;

		if (product === "default") {
			product = testData.existingCourseDetails.product;
		}

		courseName = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_COURSE.toString()) || testData.existingCourseDetails.coursename;

		newCourseName = product + " " + courseHelper.getUniqueCourseName();

		data = loginPage.setLoginData(userType);
		productData = loginPage.getProductData();
		totalTime = 0;

		//Reports
		console.log(report.formatTestName("CENGAGE COURSE CREATION AND ASSIGNMENT CREATION"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***courseCreationAndAssignmentCreationVerification.js***"));
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
			report.stepStatusWithData("CourseCGI and AssessmentCGI Generation, MAX Timeout set as ", dataUtil.millisecondsToStr(courseHelper.getCourseTimeOut())) +
			report.stepStatusWithData("Course Aggregation MAX Timeout set as ", dataUtil.millisecondsToStr(courseHelper.getCourseAggregationTimeOut())) +
			report.stepStatusWithData("Course Key Generated ", coursekey, coursekeystatus) +
			report.stepStatusWithData("Course CGI Generated ", courseCGI, courseCreationStatus) +
			report.stepStatus("Aggregation Status ", aggregationStatus) +
			report.stepStatusWithData("Aggregation process took ", aggregationCompletionTime, aggregationStatus) +
			report.stepStatus("Assignment Creation Status ", assignmentCreationStatus) +
			report.reportFooter());
		console.log(report.formatTestTotalTime(totalTime, scriptName, allPassed));
		session.close(allPassed, done);
	});

	it(". Login to 4LTR Platform as instructor", function(done) {
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
		this.timeout(courseHelper.getElevatedTimeout());
		loginPage.launchACourse(userType, courseName, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate to Assignments Page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Delete the created assignment", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		assessmentsPage.deleteAssignment(browser, done);
	});

	it(". Reload the page and wait for page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Navigate to StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Delete the created studybits if any", function(done) {
		clearAllSavedContent.clearStudyboard(browser, done);
	});

	it(". Reload the page and wait until page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Log out as Instructor", function(done) {
		userSignOut.userSignOut(browser, done);
	});

	it(". Wait for page loading", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
	});

	it(". Log in to 4LTR Platform", function(done) {
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

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Get all link counts of the active courses", function(done) {
		createNewCoursepo.activeCoursesLinksOnManageMyCourse(browser).then(function(activeCourses) {
			totalActiveCourses = _.size(activeCourses);
			console.log(report.reportHeader() +
				report.stepStatusWithData("Total counst of Active Course links ", totalActiveCourses, "success") +
				report.reportFooter());
			done();
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
			console.log(report.reportHeader() +
				report.stepStatusWithData("New created course name is ", newCourseName, "success") +
				report.reportFooter());
			done();
		});
	});

	it(". Fill in the start date ", function(done) {
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

	it(". Copy the Course key of newly created course", function(done) {
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

	it(". Click on course link for launching the newly created course", function(done) {
		this.timeout(courseHelper.getCourseAggregationTimeOut());
		browser.sleep(courseHelper.getCourseTimeOut()).then(function() {
			createNewCoursepo.launchTheCreatedCourse(browser).then(function() {
				done();
			});
		});
	});

	it(". Validate course CGI appears in url ", function(done) {
		browser
			.execute("return window.location.href;").then(function(cgi) {
				courseCGI = cgi.split('products/')[1];
				if (courseCGI !== "undefined") {
					courseCreationStatus = "success";
					console.log("Course Creation Status   " + courseCreationStatus);
				}
				console.log("Course creation  status outside" + courseCreationStatus + courseCGI);
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

	it(". Navigate to a topic to create StudyBits", function(done) {
		tocPage.navigateToToc(browser).then(function() {
			tocPage.navigateToAChapter(productData.chapter.id, browser).then(function() {
				tocPage.navigateToATopic(productData.chapter.id, productData.chapter.topic.id, browser).nodeify(done);
			});
		});
	});

	it(". Click on text to create StudyBit", function(done) {
		createNewCoursepo.clickOnCloseButtonOnNarrativeForFirstUser(browser).then(function() {
			createNewCoursepo.clickOnTextForCreateStudybit(browser, productData.chapter.topic.studybit.text.id).then(function() {
				done();
			});
		});
	});

	it(". Verify UI components of the modal window for first time StudyBit", function(done) {
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
		createNewCoursepo.clickOnClosefirstTimeUserSBWindow(browser).then(function(goiIt) {
			studybit.closeStudyBitPanelOnNarrative(browser, productData.chapter.topic.studybit.text.id).then(function() {
				done();
			});
		});
	});

	it(". Reload the page", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Create a KeyTerm StudyBit", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		studybit.createKeyTermStudyBitForNewCourse(browser, done,
			productData.chapter.topic.studybit.keyterm.id,
			productData.chapter.topic.studybit.keyterm.definition,
			productData.chapter.topic.studybit.keyterm.notes,
			productData.chapter.topic.studybit.keyterm.windowScrollY);
	});

	it(". Reload the page and wait for page load", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Create a Text StudyBit", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		studybit.createTextStudyBitForNewCourse(browser, done,
			productData.chapter.topic.studybit.text.id,
			productData.chapter.topic.studybit.text.notes,
			productData.chapter.topic.studybit.text.comprehension,
			productData.chapter.topic.studybit.text.windowScrollY);
	});


	it(". Navigate To StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Verify the first time user message on studyboard", function(done) {
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

	it(". Launch the practice Quiz for newly created course", function(done) {
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
		//Call this function if you want a specific block to timeout after a specific time interval
		this.timeout(courseHelper.getElevatedTimeout("quiz"));
		takeQuizpo.takeQuiz(browser, done);
	});


	it(". Store the correct and Total Questions answers after student's attempt on practice quiz", function(done) {
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
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Wait for page loading", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
	});

	it(". Navigate to ConceptTracker", function(done) {
		menuPage.selectSubTabOnStudyBoard(browser, "Concept Tracker", done);
	});

	it(". LTR-3273 :: Validate correct|total answers on student's ConceptTracker view after student's attempt", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("concepttracker"));
		testBotQuizMetrics = correctAnswer + "/" + totalQuestions + " Questions";
		console.log("testBotQuizMetrics :::" + testBotQuizMetrics);
		console.log(report.reportHeader() + report.stepStatusWithData("ANALYTICS :: TestBot Calculated metrics for the attempted quiz by student   \" " + productData.concepttracker.quiz.chapterbased.name, testBotQuizMetrics, "success") + report.reportFooter());
		// browser.waitForElementByXPath("//h1[contains(.,'" + productData.concepttracker.quiz.chapterbased.name + "')]/following-sibling::div[@class='chartjs overview']//div[@class='question-count']//p", asserters.isDisplayed, 90000).text().should.eventually.become(testBotQuizMetrics)
		practiceQuizCreation.getQuizText(browser, productData.concepttracker.quiz.chapterbased.name)
			.then(function(practiceQuizResult) {
				console.log("testBotQuizMetrics" + testBotQuizMetrics);
				console.log("practiceQuizResult" + practiceQuizResult);
				correctAnswerAfterStudentAttempt = stringutil.returnValueAfterSplit(stringutil.returnValueAfterSplit(practiceQuizResult, " ", 0), "/", 0);
				totalAnsweredQuestionsByStudent = stringutil.returnValueAfterSplit(stringutil.returnValueAfterSplit(practiceQuizResult, " ", 0), "/", 1);
				if (practiceQuizResult.indexOf(testBotQuizMetrics) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("ANALYTICS :: Practice Quiz metrics retrieved from the platform after the student attempted a quiz on  \" " + productData.concepttracker.quiz.chapterbased.name + " and ROBO analytics is ::" + testBotQuizMetrics + " compared with", practiceQuizResult, "success") + report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("ANALYTICS :: Practice Quiz metrics retrieved from the platform after the student attempted a quiz on  \" " + productData.concepttracker.quiz.chapterbased.name + " and ROBO analytics is ::" + testBotQuizMetrics + " compared with", practiceQuizResult, "failure") + report.reportFooter());
				}
			});
	});

	it(". Enter a search keyword and verify the results", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		searchFeaturePage.openSearchControl(browser).then(function() {
			searchFeaturePage.enterTheSearchTerm(browser, productData.search_keyword).then(function() {
				searchFeaturePage.getResultsCount(browser)
					.text().should.eventually.include(productData.search_result_count)
					.then(function() {
						console.log(report.reportHeader() +
							report.stepStatusWithData("SEARCH :: Keyword \"" + productData.search_keyword + "\" fetched a total of   ", productData.search_result_count + " matches") +
							report.reportFooter());
						var counter = 0;
						(function scrollTillFooterVisible() {
							searchFeaturePage.scrollToSearchResultsBottom(browser);
							if (counter < 10) {
								setTimeout(scrollTillFooterVisible, 3000);
								counter++;
							} else {
								searchFeaturePage.selectAResult(browser, productData.search_result_count).then(function(result) {
									console.log("result::" + result);
									if (result !== undefined) {
										console.log(report.reportHeader() +
											report.stepStatusWithData("SEARCH :: Keyword", "\"" + productData.search_keyword + "\" has the " + productData.search_result_count + "th result with title", result) +
											report.reportFooter());
										done();
									} else {
										console.log(report.reportHeader() +
											report.stepStatus("SEARCH :: Not able to retrieve the " + productData.search_result_count + "th result for Keyword \"", productData.search_keyword + "\"", "failure") +
											report.reportFooter());
									}
								});
							}
						})();
					});
			});
		});
	});

	it(". Navigate to Assignments Page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Delete the created assignment", function(done) {
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

	it(". Navigate to tile view", function(done) {
		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) === "mobile" || stringutil.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString()) === "iOS") {
			tocPage.selectTileView(browser).then(function() {
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

	it(". Select current date and open the Assessment Type assignment settings page", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.selectADateForAssignment(browser).
		then(function() {
			calendarNavigation.selectAssessmentTypeAssignment(browser).then(function() {
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assessment type assignment is selected");
			});
		});
	});


	it(". Complete the CFM Assessment form for system created assignment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.enterName(browser).then(function() {
			assessmentsPage.enterRevealDate(browser).then(function() {
				assessmentsPage.selectChapter(browser, assessmentData.systemgenerated.scorestrategyhigh.chapter).then(function() {
					assessmentsPage.enterScore(browser, assessmentData.systemgenerated.scorestrategyhigh.score).then(function() {
						assessmentsPage.selectAttempts(browser, assessmentData.systemgenerated.scorestrategyhigh.attempts).then(function() {
							assessmentsPage.selectScoreStrategy(browser, assessmentData.systemgenerated.scorestrategyhigh.scoreStrategy).then(function() {
								assessmentsPage.selectQuestionStrategy(browser, assessmentData.systemgenerated.QuestionStrategy.option[0]).then(function() {
									assessmentsPage.enterQuestionsPerStudent(browser, assessmentData.systemgenerated.scorestrategyhigh.questions).then(function() {
										console.log(report.reportHeader() +
											report.stepStatusWithData("Assessment form has been filled by chapter :" +
												assessmentData.systemgenerated.scorestrategyhigh.chapter + ", Score :" +
												assessmentData.systemgenerated.scorestrategyhigh.score + ", Number Of Attempts :" +
												assessmentData.systemgenerated.scorestrategyhigh.attempts + ", Question Strategy :" +
												assessmentData.systemgenerated.QuestionStrategy.option[0] + ", Score Strategy : High(" +
												assessmentData.systemgenerated.scorestrategyhigh.scoreStrategy + "), Question Per Student :",
												assessmentData.systemgenerated.scorestrategyhigh.questions, "success") +
											report.reportFooter());
										takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment form is filled");
									});
								});
							});
						});
					});
				});
			});
		});
	});


	it(". Save the CFM assessment and verify if its saved successfully", function(done) {
		assessmentsPage.saveAssignment(browser).then(function() {
			assessmentsPage.checkIfAssignmentSaved(browser).then(function(value) {
				if (value.toString() === "rgb(236, 41, 142)") {
					assignmentCreationStatus = "success";
					console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName(), "success") + report.reportFooter());
					done();
				} else {
					assignmentCreationStatus = "failure";
					console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName() + " may not have received the assessmentCGI", "failure") + report.reportFooter());
				}
			});
		});
	});

	it(". Delete the created CFM assignment", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		assessmentsPage.deleteAssignment(browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Navigate to StudyBoard ", function(done) {
		studybit.navigateToStudyBoard(browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Delete the created studybits if any", function(done) {
		clearAllSavedContent.clearStudyboard(browser, done);
	});

	it(". Wait until page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
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
			if (courseCountOnSwitchWindow === totalActiveCourses) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Total courses on Switch Courses window is " + courseCountOnSwitchWindow + " is compared with count of active courses ", totalActiveCourses, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Total courses on Switch Courses window is " + courseCountOnSwitchWindow + " is compared with count of active courses ", totalActiveCourses, "failure") +
					report.reportFooter());
			}

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

	it(". Log out as Instructor", function(done) {
		userSignOut.userSignOut(browser, done);
	});


	it(". Log in as Instructor again", function(done) {
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
		if (aggregationStatus !== "success") {
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
