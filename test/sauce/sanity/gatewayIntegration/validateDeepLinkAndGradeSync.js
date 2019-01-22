var wd = require('wd');
var asserters = wd.asserters;
var session = require("../../support/setup/browser-session");
var stringutil = require("../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var gatewayPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/gatewayintegrationpo.js");
var report = require("../../support/reporting/reportgenerator");
var menuPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var brainPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var assessmentsPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assessmentspo");
var assignmentAvgScore = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assesmentspoforAvgScore");
var calendarNavigation = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/navigationpo");
var studentAssessmentsPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var _ = require('underscore');
var createNewCoursepo = require("../..//support/pageobject/" + pageobject + "/" + envName + "/createNewCoursepo");
var testData = require("../../../../test_data/gatewayintegration.json");
var assessmentData = require("../../../../test_data/assignments/assessments.json");
var studentAssignmentPage = require("../../support/pagefactory/studentAssignment");
var courseHelper = require("../../support/helpers/courseHelper");
var basicpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var userSignOut = require("../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var lmsObj = require("../../support/pageobject/" + pageobject + "/" + envName + "/lms");
var mathutil = require("../../util/mathUtil");
var casPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var qaTestData = require("../../../../test_data/data.json");
var instructorGradebookStudentDetailedPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/studentDetailedInfopo");
var instructorGradebookNavigationPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/gradebookNavigationpo");
var instructorMainGradebookView = require("../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/mainGradebookView");
var commonutil = require("../../util/commonUtility");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'Gateway LMS Integration Grade Sync Feature test', function() {

	var browser;
	var allPassed;
	var totalTime;
	var assignmentCreationStatus = "failure";
	var cas_activity_series;
	var trueFalseQuestionRadio;
	var cas_choice_radio_for_true_false;
	var multipleChoiceQuestionRadio;
	var cas_choice_radio_for_multiple_type_question;
	var continueButton;
	var disabled_continue_button;
	var dropDownBox;
	var select_option_from_dropdown;
	var exit_button;
	var trueFalseRadioChoice;
	var multipleChoiceRadioOption;
	var optionOfSelectType;
	var productOfInterest;
	var questionsCorrectFromCAS;
	var totalPointsGainedByStudent;
	var totalsudentcount;
	var totalValueOfScoresForAllStudents = 0;
	var averageScoreForAllStudents;
	var pageLoadingTime;
	var scoreAtStudentRow;
	var valueAtGradebook;
	var serialNumber = 0;

	before(function(done) {

		browser = session.create(done);
		userType = "instructor";
		product = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString());
		courseName = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_COURSE.toString());
		data = loginPage.setLoginDataForGateway(userType);
		productOfInterest = _.find(testData.lmsproduct, function(productInList) {
			return productInList.id === product;
		});
		var courseList = testData.coursename[0] + " " + process.env.COURSE_INDEX.toString()
		courseName = product + "_" + new Date().toISOString();
		totalTime = 0;
		//Reports
		console.log(report.formatTestName("Gateway LMS Integration Grade Sync Feature test"));
		console.log(report.printTestData("LMS URL ", data.urlForLogin));
		console.log(report.printTestData("LMS User ", data.userId));
		console.log(report.printTestData("LMS Password ", data.password));
		console.log(report.printTestData("LMS Product ", testData.lmsproduct.title));
		console.log(report.printTestData("LMS Product deploymentId ", testData.lmsproduct.deploymentId));
		console.log(report.printTestData("LMS Course", courseList));
		console.log(report.printTestData("4LTR Course Name ", courseName));
		console.log(report.formatTestScriptFileName("validateDeepLinkAndGradeSync.js"));

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

	it(". Sever the previous courses if any before creating a new course", function(done) {
		//The below block of code will try to delete the Gateway course associated with mindlinks since multiple course
		//creations are not allowed before severing the connections
		lmsObj.getToken().then(function(token) {
			lmsObj.getCoursesForDeployment(product).then(function(courseData) {
				console.log("Course Array size : " + _.size(courseData));
				if (_.size(courseData) > 0) {
					//Added additional logic to loop through the course ids and delete all of them if there are more than one course
					_.each(courseData, function(record) {
						console.log("CourseId for deletion : " + record[0]);
						if (_.indexOf(record, productOfInterest.deploymentId) != -1) {
							console.log("Found the deployment id , time to sever the course to create a new course " + record[0]);
							lmsObj.deleteCourse(record[0]).then(function(status) {
								console.log("Cleanup of " + record[0] + " " + status + " !!!");
							})
						}
					});
					done();
				} else {
					console.log("Nothing to cleanup :) ");
					done();
				}
			})
		});
	});

	it(". Login to the blackboard LMS as a Gateway Instructor user", function(done) {
		data = loginPage.setLoginDataForGateway(userType);
		loginPage.loginToApplicationThroughGateway(browser, done);
	});

	it(". Click on the course link under my courses", function(done) {
		gatewayPage.clickOnManageMyCourse(browser).then(function() {
			loginPage.clickOnCourse(browser, testData.coursename[0]).then(function() {
				pageLoadingTime = 0;
				pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
		});
	});

	it(". Click on content link on left panel", function(done) {
		gatewayPage.clickOnContent(browser).then(function() {
			pageLoadingTime = 0;
			pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Open Tools > MindLinks to select the Mindlinks course", function(done) {
		gatewayPage.selectMindLinksMenuItemFromTools(browser).then(function() {
			pageLoadingTime = 0;
			pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Launch the content source which is used to create the course", function(done) {
		gatewayPage.selectContentSource(browser, productOfInterest.title).then(function() {
			pageLoadingTime = 0;
			pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Select the create course option and fill the form and continue", function(done) {
		gatewayPage.selectCreateCourseOptionAndFillTheFormAndContinue(browser, courseName).then(function() {
			pageLoadingTime = 0;
			pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Create a link to 4LTR course in Blackboard course and continue", function(done) {
		gatewayPage.link4LTRCourse(browser).then(function() {
			pageLoadingTime = 0;
			pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Add the created 4LTR course to content folder and wait for 30 seconds before launching the course till the aggregation is completed", function(done) {
		gatewayPage.add4LTRCourseLinkToContentFolder(browser).then(function() {
			done();
		});
	});


	it(". Launch the course and verify if the 4LTR course is launched successfully through blackboard LMS", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		gatewayPage.clickOnContent(browser).then(function() {
			loginPage.launchTheCourseForGatewayIntegration(browser, courseName, product).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Course  " + courseName + " is launched", "successfully", "success") +
					report.reportFooter());
				done();
			});
		});
	});

	it(". Handle EULA", function(done) {
		loginPage.switchParentToChildWindow(browser).then(function() {
			createNewCoursepo.handleEula(browser).then(function() {
				done();
			});
		});
	});

	it(". Verify the model UI components", function(done) {
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
						if (gotItUnderEula.indexOf(qaTestData.eula.eulaMessage) > -1) {
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


	it(". Navigate to Assignments Page", function(done) {
		menuPage.selectAssignments("instructor", browser, done);
	});

	it(". Wait until page load", function(done) {
		pageLoadingTime = 0;
		pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
	});


	it(". Close flash on assignment page", function(done) {
		calendarNavigation.handleTheFlashAlert(browser).then(function() {
			done();
		});
	});

	it(". Select current date and open the Assessment Type assignment settings page", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.selectADateForAssignment(browser).then(function() {
			calendarNavigation.selectAssessmentTypeAssignment(browser).then(function() {
				pollingPageLoad(pageLoadingTime, browser, done, "Assessment type assignment is selected");
			});
		});
	});

	it(". Complete Assessment form for system created assignment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.enterName(browser).then(function() {
			assessmentsPage.enterRevealDate(browser).then(function() {
				assessmentsPage.selectChapter(browser, assessmentData.systemgenerated.scorestrategyhigh.chapter).then(function() {
					assessmentsPage.enterScore(browser, assessmentData.systemgenerated.scorestrategyhigh.score).then(function() {
						assessmentsPage.selectAttempts(browser, assessmentData.systemgenerated.scorestrategyhigh.attempts).then(function() {
							assignmentAvgScore.selectAvgScore(browser).then(function() {
								assessmentsPage.selectQuestionStrategy(browser, assessmentData.systemgenerated.QuestionStrategy.option[0]).then(function() {
									assessmentsPage.enterQuestionsPerStudent(browser, assessmentData.systemgenerated.scorestrategyhigh.questions).then(function() {
										pollingPageLoad(pageLoadingTime, browser, done, "Completed the assignment form");
									});
								});
							});
						});
					});
				});
			});
		});
	});

	it(". Save the assessment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.saveAssignment(browser).then(function() {
			pollingPageLoad(pageLoadingTime, browser, done, "Assignment is saved");
		});
	});

	it(". Verify if assignment saved successfully", function(done) {
		assessmentsPage.checkIfAssignmentSaved(browser).then(function(value) {
			if (value.toString() === "rgb(236, 41, 142)") {

				assignmentCreationStatus = "success";
				console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName(), "success") + report.reportFooter());
				done();
			} else {
				assignmentCreationStatus = "failure";
				console.log(report.reportHeader() +
					report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName() + " may not have received the assessmentCGI", "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Log out as Instructor", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userSignOut.userSignOut(browser, done);
	});

	it(". Quit the browser", function(done) {
		browser.quit();
		done();
	});

	it(". Start the session", function(done) {
		browser = session.create(done);
	});

	it(". Login to the blackboard LMS as a Gateway Instructor user", function(done) {
		userType = "student";
		data = loginPage.setLoginDataForGateway(userType);
		loginPage.loginToApplicationThroughGateway(browser, done);
	});

	it(". Click on the course link under my courses", function(done) {
		gatewayPage.clickOnManageMyCourse(browser).then(function() {
			loginPage.clickOnCourse(browser, testData.coursename[0]).then(function() {
				pageLoadingTime = 0;
				pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
		});
	});

	it(". Launch the course and verify if the 4LTR course is launched successfully through blackboard LMS", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		gatewayPage.clickOnContent(browser).then(function() {
			loginPage.launchTheCourseForGatewayIntegration(browser, courseName, product).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Course  " + courseName + " is launched", "successfully", "success") +
					report.reportFooter());
				done();
			});
		});
	});

	it(". Handle EULA", function(done) {
		loginPage.switchParentToChildWindow(browser).then(function() {
			createNewCoursepo.handleEula(browser).then(function() {
				done();
			});
		});
	});

	it(". Verify the model UI components", function(done) {
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
						if (gotItUnderEula.indexOf(qaTestData.eula.eulaMessage) > -1) {
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

	it(". Navigate to Assignments page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Wait until page load", function(done) {
		pageLoadingTime = 0;
		pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
	});

	it(". Click on the current date cell", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.clickOnCurrentDateCell(browser).then(function() {
			done();
		})
	});

	it(". Launch the assignment for the first time", function(done) {
		pageLoadingTime = 0;
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		studentAssessmentsPage.launchAssignment(browser, assessmentsPage.getAssignmentName()).then(function() {
			pollingPageLoad(pageLoadingTime, browser, done, "Assignment is launched");
		});
	});

	it(". LTR-5399 :: Verify error message should not be displayed on assessment launch and also validate Continue button should be appear on launched assessment page", function(done) {
		pageLoadingTime = 0;
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
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
					report.stepStatusWithData("LTR-5399:: Error message is not displaying on the page on assessment launch",statusOfErrorPresence, "success") +
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

	it(". Complete the assignment and exit", function(done) {
		pageLoadingTime = 0;
		//Call this function if you want a specific block to timeout after a specific time interval
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("quiz"));
		}
		cas_activity_series = studentAssignmentPage.studentAssignmentSubmissionPage.cas_activity_series;
		trueFalseQuestionRadio = studentAssignmentPage.studentAssignmentSubmissionPage.trueFalseQuestionRadio;
		cas_choice_radio_for_true_false = studentAssignmentPage.studentAssignmentSubmissionPage.cas_choice_radio_for_true_false;
		multipleChoiceQuestionRadio = studentAssignmentPage.studentAssignmentSubmissionPage.multipleChoiceQuestionRadio;
		cas_choice_radio_for_multiple_type_question = studentAssignmentPage.studentAssignmentSubmissionPage.cas_choice_radio_for_multiple_type_question;
		continueButton = studentAssignmentPage.studentAssignmentSubmissionPage.continueButton;
		disabled_continue_button = studentAssignmentPage.studentAssignmentSubmissionPage.disabled_continue_button;
		dropDownBox = studentAssignmentPage.studentAssignmentSubmissionPage.dropDownBox;
		select_option_from_dropdown = studentAssignmentPage.studentAssignmentSubmissionPage.select_option_from_dropdown;
		exit_button = studentAssignmentPage.studentAssignmentSubmissionPage.exit_button;
		optionOfSelectType = stringutil.returnreplacedstring(select_option_from_dropdown, "{{}}", +mathutil.getRandomInt(1, 4));
		trueFalseRadioChoice = stringutil.returnreplacedstring(cas_choice_radio_for_true_false, "{{}}", mathutil.getRandomInt(1, 3));
		multipleChoiceRadioOption = stringutil.returnreplacedstring(cas_choice_radio_for_multiple_type_question, "{{}}", mathutil.getRandomInt(1, 3));
		browser
			.waitForElementsByCss(cas_activity_series, asserters.isDisplayed, 60000).then(function(progresslist) {
				countOfQuestions = _.size(progresslist);
				console.log("Count of incomplete Questions : " + countOfQuestions);
				completedQuestions = 0;

				function selectAnAnswerAndProceed() {
					if (countOfQuestions > 0) {
						countOfQuestions--;
						completedQuestions++;
						browser
							.sleep(1000)
							.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
							.hasElementByCss(trueFalseQuestionRadio).then(function(flag) {
								if (!flag) {
									browser.sleep(1000).waitForElementByCss(multipleChoiceQuestionRadio, asserters.isDisplayed, 5000).getTagName().then(function(tag) {
										if (tag === "div") {
											browser
												.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
												.waitForElementByXPath(multipleChoiceRadioOption, asserters.isDisplayed, 3000).click()
												.elementByCssSelectorWhenReady(continueButton, 3000).click();
											console.log("Answered a Question with Radio Button " + completedQuestions + " and remaining Questions " + countOfQuestions);
										} else {
											browser
												.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
												.waitForElementByCss(dropDownBox, asserters.isDisplayed, 7000)
												.click()
												.waitForElementByCss(optionOfSelectType, asserters.isDisplayed, 10000)
												.click()
												.sleep(1000)
												.elementByCssSelectorWhenReady(continueButton, 3000)
												.click();
											console.log("Answered a Question with a Drop down " + completedQuestions + " and remaining Questions " + countOfQuestions);

										}
										setTimeout(selectAnAnswerAndProceed, 7000);
									});
								} else {
									browser.waitForElementByCss(trueFalseQuestionRadio, asserters.isDisplayed, 5000).getTagName().then(function(tag) {
										if (tag === "div") {
											browser
												.waitForElementByXPath(disabled_continue_button, asserters.isDisplayed, 3000)
												.waitForElementByXPath(trueFalseRadioChoice, asserters.isDisplayed, 3000).click()
												.elementByCssSelectorWhenReady(continueButton, 5000).click();
											console.log("Answered a True or False Question " + completedQuestions + " and remaining Questions " + countOfQuestions);
										} else {
											console.log("Problem in answering T/F");
										}
										setTimeout(selectAnAnswerAndProceed, 5000);
									});
								}
							});
					} else {
						if (completedQuestions == _.size(progresslist)) {
							console.log("All Questions successfully attempted");
							browser
								.waitForElementByCss(exit_button, asserters.isDisplayed, 3000)
								.then(function() {
									casPage.getQuestionsCorrect(browser).then(function(questionsCorrect) {
										console.log("Total Questions Correct " + questionsCorrect);
										questionsCorrectFromCAS = questionsCorrect;
										console.log("Total Assignment Questions " + assessmentsPage.getMaxAssignmentQuestions());
										studentAssignmentCompletionStatus = "success";
										console.log(report.reportHeader() +
											report.stepStatusWithData("CAS : Student Completed the assignment with questions " + assessmentsPage.getMaxAssignmentQuestions() + " and got a score of  ", questionsCorrect, "success") +
											report.reportFooter());
										done();
									});
								});
						} else {
							console.log("failure");
							studentAssignmentCompletionStatus = "failure";
							console.log(report.reportHeader() +
								report.stepStatusWithData("Student Assignment completion status ", studentAssignmentCompletionStatus, "failure") +
								report.reportFooter());
						}
					}
				}

				selectAnAnswerAndProceed();
			});
	});

	it(". Log out as Student", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userSignOut.userSignOut(browser, done);
	});

	it(". Quit the browser", function(done) {
		browser.quit();
		done();
	});

	it(". Start the session", function(done) {
		browser = session.create(done);
	});

	it(". Login to the blackboard LMS as a Gateway Instructor user", function(done) {
		userType = "instructor";
		data = loginPage.setLoginDataForGateway(userType);
		loginPage.loginToApplicationThroughGateway(browser, done);
	});

	it(". Click on the course link under my courses", function(done) {
		gatewayPage.clickOnManageMyCourse(browser).then(function() {
			loginPage.clickOnCourse(browser, testData.coursename[0]).then(function() {
				pageLoadingTime = 0;
				pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
		});
	});

	it(". Launch the course and verify if the 4LTR course is launched successfully through blackboard LMS", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		gatewayPage.clickOnContent(browser).then(function() {
			loginPage.launchTheCourseForGatewayIntegration(browser, courseName, product).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Course  " + courseName + " is launched", "successfully", "success") +
					report.reportFooter());
				done();
			});
		});
	});

	it(". Navigate to GradeBook page", function(done) {
		loginPage.switchParentToChildWindow(browser).then(function() {
			menuPage.selectGradebook("instructor", browser, done);
		});
	});


	it(". Retrieve count of registered student for the launched course", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		mainGradebookView.getStudentCount(browser).then(function(studentCounts) {
			totalsudentcount = _.size(studentCounts);
			if (!mathutil.isEmpty(totalsudentcount)) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Number of student who will attempt the assignment ", totalsudentcount, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : No student appears on the Instructor GradeBook page that is", totalsudentcount, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Calculate class average for a particular assignment ", function(done) {
		gatewayPage.fetchscoreFromGradebook(browser).text().then(function(text) {
			valueAtGradebook = text;
			done();
		});
	});

	it(". Calculate the total of score earned by students for a particular assignment ", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		var sizeOfColumn = 0;
		instructorMainGradebookView.getTotalScoreBoxOnGradebook(browser)
			.then(function(elements) {
				sizeOfColumn = _.size(elements);

				function calculateValue() {
					if (sizeOfColumn > 0) {
						instructorMainGradebookView.getScoreText(browser, sizeOfColumn)
							.then(function(value) {
								if (!mathutil.isEmpty(value)) {
									totalValueOfScoresForAllStudents = totalValueOfScoresForAllStudents + parseInt(value);
									sizeOfColumn--;
									calculateValue();
								} else {
									console.log(report.reportHeader() +
										report.stepStatusWithData("failure", "", "failure") +
										report.reportFooter());
								}
							});
					} else {
						done();
					}
				}
				calculateValue();
			});
	});

	it(". Calculate class average for a particular assignment ", function(done) {
		if (!mathutil.isEmpty(valueAtGradebook)) {
			averageScoreForAllStudents = (totalValueOfScoresForAllStudents / parseInt(totalsudentcount));
			console.log(report.reportHeader() +
				report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment calculated and is coming out to be ::  " + averageScoreForAllStudents, "success") +
				report.reportFooter());
			done();
		} else {
			this.skip();
		}
	});

	it(". Verify the presence of total points, student score value in total points on the Instructor GradeBook on the GradeBook table", function(done) {
		if (!mathutil.isEmpty(valueAtGradebook)) {
			instructorMainGradebookView.getTotalPoints(browser).text().then(function(totalPoints) {
				if (totalPoints === (assessmentData.systemgenerated.scorestrategyhigh.score).toString()) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot Max Total points " + assessmentData.systemgenerated.scorestrategyhigh.score + ", is compared against the Max total points  ", totalPoints + " displayed on the Instructor GradeBook table", "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot Max Total points  " + assessmentData.systemgenerated.scorestrategyhigh.score + ", is compared against the Max total points  ", totalPoints + " displayed on the Instructor GradeBook table", "failure") +
						report.reportFooter());
				}
			});
		} else {
			this.skip();
		}
	});

	it(". Verify the presence of point gained by the student", function(done) {
		if (!mathutil.isEmpty(valueAtGradebook)) {
			instructorMainGradebookView.getPointsGainedByStudent(browser, loginPage.getUserName())
				.then(function(pointsGained) {
					totalPointsGainedByStudent = pointsGained;
					if (totalPointsGainedByStudent.toString() === assessmentsPage.getRoboPointScore(questionsCorrectFromCAS)) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : Total points earned by student " + totalPointsGainedByStudent + ", is compared against the testbot calculated total points earned ", assessmentsPage.getRoboPointScore(questionsCorrectFromCAS), "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : Total points earned by student " + totalPointsGainedByStudent + ", is compared against the testbot calculated total points earned ", assessmentsPage.getRoboPointScore(questionsCorrectFromCAS), "failure") +
							report.reportFooter());
					}
				});
		} else {
			this.skip();
		}
	});


	it(". Navigate to student's detailed GradeBook view", function(done) {
		if (!mathutil.isEmpty(valueAtGradebook)) {
			data = loginPage.setLoginDataForGateway("student");
			instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserName()).then(function() {
				done();
			});
		} else {
			this.skip();
		}
	});

	it(". Validate presence of class average value on student detailed page on instructor GradeBook view ", function(done) {
		if (!mathutil.isEmpty(valueAtGradebook)) {
			this.retries(3);
			instructorGradebookStudentDetailedPage.validatePresenceOfAverageScore(browser, assessmentsPage.getAssignmentName()).then(function(classAvg) {
				if (classAvg === averageScoreForAllStudents.toString()) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment on student detailed GradeBook view ::  " + classAvg, "is compared against the calculated class average ::" + averageScoreForAllStudents, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : Average class score for a particular assignment on student detailed GradeBook view ::  " + classAvg, "is compared against the calculated class average ::" + averageScoreForAllStudents, "failure") +
						report.reportFooter());
				}

			});
		} else {
			this.skip();
		}
	});

	it(". [Gradebook] Verify whether the system generated student point score is updated on Instructor GradeBook on the Student Detailed Results Page", function(done) {
		this.retries(3);
		if (!mathutil.isEmpty(valueAtGradebook)) {
			instructorGradebookStudentDetailedPage.getScoredPoints(browser, assessmentsPage.getAssignmentName())
				.then(function(scoredPoints) {
					if (scoredPoints.toString() === assessmentsPage.getRoboPointScore(questionsCorrectFromCAS)) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + assessmentsPage.getRoboPointScore(questionsCorrectFromCAS) + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + assessmentsPage.getRoboPointScore(questionsCorrectFromCAS) + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "failure") +
							report.reportFooter());
					}
				});
		} else {
			this.skip();
		}
	});

	it(". [Gradebook] Verify whether the system generated student score(Questions Correct)  is updated on Instructor GradeBook on the Student Detailed Results Page", function(done) {
		this.retries(2);
		if (!mathutil.isEmpty(valueAtGradebook)) {
			browser
				.refresh().sleep(20000).then(function() {
					instructorGradebookStudentDetailedPage.checkStudentScore(browser, assessmentsPage.getAssignmentName(), questionsCorrectFromCAS)
						.then(function() {
							console.log(report.reportHeader() +
								report.stepStatusWithData("GRADEBOOK : Questions correct retrieved from Student Assessment Result page which is " + questionsCorrectFromCAS + " questions, is compared against the student score(Questions correct) retrieved from Instructor GradeBook ", questionsCorrectFromCAS, "success") +
								report.reportFooter());
							done();
						});
				});
		} else {
			this.skip();
		}
	});

	it(". Close the current window", function(done) {
		if (!mathutil.isEmpty(valueAtGradebook)) {
			browser.close();
			done();
		} else {
			this.skip();
		}
	});

	it(". Click on content link on left panel", function(done) {
		if (!mathutil.isEmpty(valueAtGradebook)) {
			loginPage.switchChildToParentWindow(browser).then(function() {
				gatewayPage.clickOnContent(browser).then(function() {
					done();
				});
			});
		} else {
			this.skip();
		}
	});

	it(". Open Tools > MindLinks to select the Mindlinks course", function(done) {
		if (!mathutil.isEmpty(valueAtGradebook)) {
			gatewayPage.selectMindLinksMenuItemFromTools(browser).then(function() {
				done();
			});
		} else {
			this.skip();
		}
	});

	it(". Launch the content source which is used to create the course", function(done) {
		if (!mathutil.isEmpty(valueAtGradebook)) {
			gatewayPage.selectProduct(browser, productOfInterest.title).then(function() {
				pageLoadingTime = 0;
				pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
		} else {
			this.skip();
		}
	});

	it(". Wait for page loading", function(done) {
		if (!mathutil.isEmpty(valueAtGradebook)) {
			pageLoadingTime = 0;
			pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		} else {
			this.skip();
		}
	});

	it(". Select the assignment added and attempt submitted by student", function(done) {
		if (!mathutil.isEmpty(valueAtGradebook)) {
			gatewayPage.checkIfAssignmentAdded(browser, assessmentsPage.getAssignmentName()).then(function() {
				done();
			});
		} else {
			this.skip();
		}
	});

	it(". click on Save and submit the selection", function(done) {
		if (!mathutil.isEmpty(valueAtGradebook)) {
			gatewayPage.saveTheSelection(browser).then(function() {
				gatewayPage.clickOnGradeCenter(browser).then(function() {
					gatewayPage.clickOnAssignmentsUnderGradeCenter(browser).then(function() {
						done();
					});
				});
			});
		} else {
			this.skip();
		}
	});

	it(". verify if the added assignment shows up in the grade center", function(done) {
		this.retries(3);
		if (!mathutil.isEmpty(valueAtGradebook)) {
			gatewayPage.verifyIfAssignmentAdded(browser, assessmentsPage.getAssignmentName()).then(function(status) {
				if (status) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Assignment is added and shoows up in the grade center" + status, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Assignment is added and shoows up in the grade center" + status, "failure") +
						report.reportFooter());
				}
			});
		} else {
			this.skip();
		}
	});

	it(". Click on content link on left panel and launch the course", function(done) {
		if (!mathutil.isEmpty(valueAtGradebook)) {
			gatewayPage.clickOnContent(browser).then(function() {
				loginPage.launchTheCourseForGatewayIntegration(browser, courseName, product).then(function() {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Course  " + courseName + " is launched", "successfully", "success") +
						report.reportFooter());
					done();
				});
			});
		} else {
			this.skip();
		}
	});

	it(". Navigate to GradeBook page", function(done) {
		if (!mathutil.isEmpty(valueAtGradebook)) {
			loginPage.switchParentToChildWindow(browser).then(function() {
				menuPage.selectGradebook(userType, browser, done);
			});
		} else {
			this.skip();
		}
	});

	it(". Click on 'SYNC TO LMS' BUTTON", function(done) {
		if (!mathutil.isEmpty(valueAtGradebook)) {
			gatewayPage.clickSYncToLmsButton(browser).then(function() {
				done();
			});
		} else {
			this.skip();
		}
	});


	it(". Validate 'synch to lms' button disabled once its clicked", function(done) {
		if (!mathutil.isEmpty(valueAtGradebook)) {
			gatewayPage.validateSYncToLmsSTatus(browser).getAttribute('aria-disabled').then(function(statusOfSyncButton) {
				gatewayPage.getLMSButtonText(browser).then(function() {
					if (statusOfSyncButton == testData.statusSyncLmsButtonWhenDisabled) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("'synch to lms' button is disabled when there are no students or assignments or attempts submitted and status is  ", statusOfSyncButton + " successfully", "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("'synch to lms' button is enabled when there are no students or assignments or attempts submitted and status is  ", statusOfSyncButton + " successfully", "failure") +
							report.reportFooter());
					}
				});
			});
		} else {
			this.skip();
		}
	});

	it(". Wait for page loading", function(done) {
		if (!mathutil.isEmpty(valueAtGradebook)) {
			pageLoadingTime = 0;
			pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
		} else {
			this.skip();
		}
	});

	it(". Close the current window", function(done) {
		if (!mathutil.isEmpty(valueAtGradebook)) {
			browser.close();
			done();
		} else {
			this.skip();
		}
	});


	it(". Navigate to Control Panel> Grade Center > Full Grade center ", function(done) {
		if (!mathutil.isEmpty(valueAtGradebook)) {
			loginPage.switchChildToParentWindow(browser).then(function() {
				gatewayPage.clickOnAssignmentsUnderGradeCenter(browser).then(function() {
					done();
				});
			});
		} else {
			this.skip();
		}
	});

	it(". Verify if the score shows up against Student One row once the grade sync button is clicked on the 4LTR. ", function(done) {
		if (!mathutil.isEmpty(valueAtGradebook)) {
			gatewayPage.fetchAssignmentAttribute(browser, assessmentsPage.getAssignmentName()).getAttribute('id').then(function(fetchClassAttribute) {
				var str = fetchClassAttribute;
				var replaceClassAttribute = str.replace("0", "1");
				data = loginPage.setLoginDataForGateway("instructor");
				gatewayPage.fetchAssignmentScore(browser, data.lastname, replaceClassAttribute).text().then(function(getScore) {
					scoreAtStudentRow = parseInt(getScore);
					if (scoreAtStudentRow == parseInt(averageScoreForAllStudents)) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("'Score shows up against Student One row once the grade sync button is clicked on the 4LTR.  ", getScore + " successfully", "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("'Score does not shows up against Student One row once the grade sync button is clicked on the 4LTR.  ", getScore + " successfully", "failure") +
							report.reportFooter());
					}
				});
			});
		} else {
			this.skip();
		}
	});


	it(". Click on the double arrow in the column heading and hide the column in grade center", function(done) {
		if (!mathutil.isEmpty(valueAtGradebook)) {
			commonutil.acceptAlertsOnGatewayIntergation(browser, true).then(function() {
				gatewayPage.clickDoubleArrowAndHideCoulmn(browser, assessmentsPage.getAssignmentName()).then(function() {
					done();
				});
			});
		} else {
			this.skip();
		}
	});


	it(". Click on the double arrow in the column heading and delete the assignment in content view", function(done) {
		if (!mathutil.isEmpty(valueAtGradebook)) {
			gatewayPage.clickOnContent(browser).then(function() {
				commonutil.acceptAlertsOnGatewayIntergation(browser, true).then(function() {
					gatewayPage.deleteAssignment(browser, assessmentsPage.getAssignmentName()).then(function() {
						done();
					});
				});
			});
		} else {
			this.skip();
		}
	});

	it(". Delete the existing mindlink", function(done) {
		gatewayPage.getExistingMindlinkId(browser, courseName).then(function(idValue) {
			console.log("Id value " + idValue);
			var extractedDeleteId = idValue.slice(7, idValue.length);
			console.log("extractedDeleteId value " + extractedDeleteId);
			gatewayPage.deleteExistingMindlink(browser, extractedDeleteId, courseName).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Course " + courseName + " is deleted", "successfully", "success") +
					report.reportFooter());
				done();
			});
		});
	});

	it(". Logout from gateway application", function(done) {
		gatewayPage.logoutGatewayCourse(browser).then(function() {
			done();
		});
	});

	function pollingPageLoad(LoadTime, browser, done, message) {
		basicpo.documentState(browser).then(function(LoadingState) {
			if (LoadingState) {
				browser.sleep(2000);
				LoadTime = LoadTime + 2000;
				pollingPageLoad(LoadTime, browser, done, message);
			} else {
				var timeTaken = LoadTime / 1000;
				if (!LoadingState) {

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
