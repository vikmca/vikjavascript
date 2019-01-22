require('colors');
var wd = require('wd');
var asserters = wd.asserters;
var dataUtil = require("../../../util/date-utility");
var _ = require('underscore');
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var menuPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var calendarNavigation = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/navigationpo");
var assessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assessmentspo");
var studentAssessmentsPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var instructorGradebookStudentDetailedPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/studentDetailedInfopo");
var casPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var studenGradebookPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/student/gradebookValidationpo");
var instructorGradebookNavigationPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/gradebookNavigationpo");
var mainGradebookView = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/mainGradebookView");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var assignmentAvgScore = require("../../../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assesmentspoforAvgScore");
var instructorAssessmentDetailedInfopo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/assessmentDetailedInfopo");
var assessmentData = require("../../../../../test_data/assignments/assessments.json");
var session = require("../../../support/setup/browser-session");
var testData = require("../../../../../test_data/data.json");
var courseHelper = require("../../../support/helpers/courseHelper");
var report = require("../../../support/reporting/reportgenerator");
var mathutil = require("../../../util/mathUtil");
var dateUtil = require("../../../util/date-utility");
var pageLoadingTime;
var takeQuizpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'CCS/CAS/ASSIGNMENT :: I WILL CHOOSE ASSIGNMENT WITH DROP LOWEST SCORE TEST STRATEGY VALIDATION', function() {
	var browser;
	var allPassed = true;
	var userType;
	var setDate;
	var courseName;
	var studentAssignmentCompletionStatus = "failure";
	var assignmentCreationStatus = "failure";
	var product;
	var feedbackColoumnCount;
	var questionPool = 0;
	var questionsCorrect1stattemptFromCAS;
	var questionsCorrect2ndattemptFromCAS;
	var questionsCorrect3rdattemptFromCAS;
	var secondtConceptContent;
	var firstConceptContent;
	var questionText = [];
	var totalsudentcount;
	var classAvgScore;
	var totalTime;
	var averageScore;
	var serialNumber = 0;
	var averageScoreOnGradebook;

	var attemptAfterAttempDelete;
	var attemptInDropDownAfterDelete;
	var ScoreInDropDownFields = [];
	var attemptBeforeAttempDelete;
	var remainingAttempts;
	var totalAttempts = [];
	var correctQuestionCountFromAssessmentDetailedPage;
	var getDueDateWhichIsInNextWeek;
	var getMonthForNextWeek;

	before(function(done) {
		browser = session.create(done);
		setDate = testData.courseAccessInformation.DateBeforeToday;
		newCourseData = testData.instructorResourceCenter;
		userType = "instructor";
		product = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString());
		if (product === "default") {
			product = testData.existingCourseDetails.product;
		}
		console.log("product = "+product);
		courseName = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_COURSE.toString());
		if (courseName === "default") {
			courseName = product + " " + courseHelper.getUniqueCourseName();
		}
		data = loginPage.setLoginData(userType);
		totalTime = 0;
		console.log(report.formatTestName("CCS/CAS/ASSIGNMENT :: I WILL CHOOSE ASSIGNMENT WITH DROP LOWEST SCORE AND NEXT WEEK DUE DATE TEST STRATEGY VALIDATION"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***validateIWCAssessmentWithDifferentDueDate.js***"));
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

	it(". Navigate on GradeBook page", function(done) {
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Retrieve count of registered student for the launched course", function(done) {
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

	it(". Navigate to Assignments Page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Delete all past assignments", function(done) {
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

	it(". Select current date and open the Assessment Type assignment settings page", function(done) {
		pageLoadingTime = 0;
		calendarNavigation.selectADateForAssignment(browser).
		then(function() {
			calendarNavigation.selectAssessmentTypeAssignment(browser).then(function() {
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assessment type assignment is selected");
			});
		});
	});


	it(". Complete the IWC Assessment type assignment form Setting tab for system created assignment", function(done) {
		pageLoadingTime = 0;
		assessmentsPage.enterName(browser).then(function() {
			assessmentsPage.validateDueAndRevealDateText(browser, assessmentData.systemgenerated.iwillchoose.dueRevealDate).then(function() {
				assessmentsPage.enterDueDateWithSevenDaysAhead(browser).then(function() {
					assessmentsPage.getDueDateText(browser).then(function(getDueDate) {
						console.log(getDueDate);
						var fullDate = stringutil.returnValueAfterSplit(getDueDate, " ", 1);
						getDueDateWhichIsInNextWeek = stringutil.returnValueAfterSplit(fullDate, ",", 0);
						getMonthForNextWeek = stringutil.returnValueAfterSplit(getDueDate, " ", 0);
						assessmentsPage.selectChapter(browser, assessmentData.systemgenerated.iwillchoose.chapter).then(function() {
							assessmentsPage.enterScore(browser, assessmentData.systemgenerated.scorestrategyhigh.score).then(function() {
								assessmentsPage.selectAttempts(browser, assessmentData.systemgenerated.scorestrategyAverage.attempts).then(function() {
									assessmentsPage.selectScoreStrategy(browser, assessmentData.systemgenerated.scorestrategyAverage.scoreStrategy).then(function() {
										assessmentsPage.selectDropLowestScore(browser).then(function() {
											assessmentsPage.selectQuestionStrategy(browser, assessmentData.systemgenerated.QuestionStrategy.option[1]).then(function() {
												assessmentsPage.validateQuestionPerStudentDefaultSelection(browser).then(function() {
													console.log(report.reportHeader() +
														report.stepStatusWithData("Assessment form has been filled by due date" +
															assessmentData.systemgenerated.iwillchoose.dueRevealDate + "chapter :" +
															assessmentData.systemgenerated.iwillchoose.chapter + ", Score :" +
															assessmentData.systemgenerated.scorestrategyhigh.score + ", Number Of Attempts :" +
															assessmentData.systemgenerated.scorestrategyAverage.attempts + ", Question Strategy :" +
															assessmentData.systemgenerated.QuestionStrategy.option[1] + ", Score Strategy : Average(Drop Lowest)" +
															assessmentData.systemgenerated.scorestrategyAverage.scoreStrategy + ", Question Per Student",
															assessmentData.systemgenerated.scorestrategyhigh.questions + "Due Date" + ", " + fullDate, "success") +
														report.reportFooter());
													takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is edited");
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});

	it(". Expand the filter Panel and report all the filters and sub-filters", function(done) {
		assessmentsPage.expandTheFilterPanel(browser).then(function() {
			assessmentsPage.getFilterOptions(browser, "Type").then(function() {
				assessmentsPage.getFilterOptions(browser, "Blooms").then(function() {
					assessmentsPage.getFilterOptions(browser, "Difficulty").then(function() {
						done();
					});
				});
			});
		});
	});

	it(". Expand concept filter and report all the concepts", function(done) {
		browser
			.waitForElementByCss(".dropdown-toggle.ng-binding", asserters.isDisplayed, 60000)
			.click().then(function() {
				var counter = 0;
				browser
					.sleep(2000)
					.elementsByCssSelector(".dropdown-options .cg-checkbox label")
					.then(function(parameters) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("There are " + _.size(parameters) + " concepts under chapter " + assessmentData.systemgenerated.iwillchoose.chapter + " and they are", "success") +
							report.reportFooter());

						function printConceptsText() {
							if (counter < _.size(parameters)) {
								parameters[counter].text().then(function(conceptText) {
									var pos = counter + 1;
									console.log(report.reportHeader() +
										report.stepStatusWithData("At position " + pos + " concept", conceptText, "success") +
										report.reportFooter());
									counter++;
									printConceptsText();
								});
							} else {
								done();
							}
						}
						printConceptsText();
					});
			});
	});

	it(". Clear all Concept Filters, select any 2 concepts and collapse the filter", function(done) {
		browser
			.waitForElementByXPath("//div[contains(@class,'assessment-filters')]//h6[contains(.,'Concepts')]/div", asserters.isDisplayed, 60000)
			.click()
			.sleep(1000)
			.waitForElementByXPath("(//div[@class='dropdown-options']//label)[" + assessmentData.systemgenerated.iwillchoose.filter.ConceptsNumber[0] + "]", asserters.isDisplayed, 60000)
			.then(function(firstConcept) {
				firstConcept.click();
				firstConcept.text().then(function(content) {
					firstConceptContent = content;
					browser
						.sleep(1000)
						.waitForElementByXPath("(//div[@class='dropdown-options']//label)[" + assessmentData.systemgenerated.iwillchoose.filter.ConceptsNumber[1] + "]", asserters.isDisplayed, 60000)
						.then(function(secondConcept) {
							secondConcept.click();
							secondConcept.text().then(function(content) {
								secondtConceptContent = content;
								done();
							});
						});
				});
			});
	});

	it(". verify first filtered Question has Type, Bloom, Difficulty Specified", function(done) {
		if(product === "COMM4"){
		var typeFilterText;
		var bloomFilterText;
		var difficultyFilterText;
		assessmentsPage.retrieveSecondFilterType(browser).then(function(typeText) {
			assessmentsPage.filterOnIWCAssignment(browser, "Type", "multiple-choice").then(function() {
				assessmentsPage.filterOnIWCAssignment(browser, "Type", "true-false").then(function() {
					assessmentsPage.retrieveBloomType(browser).then(function(bloomText) {
						assessmentsPage.filterOnIWCAssignment(browser, "Blooms", "Remember").then(function() {
							assessmentsPage.retrieveSecondDifficultyType(browser).then(function(difficultyText) {
								assessmentsPage.filterOnIWCAssignment(browser, "Difficulty", "Easy").then(function() {
									assessmentsPage.filterOnIWCAssignment(browser, "Blooms", "Understand").then(function() {
										assessmentsPage.filterOnIWCAssignment(browser, "Difficulty", "Moderate").then(function() {
											assessmentsPage.expandTheFilterPanel(browser).then(function() {
												assessmentsPage.getDescriptionOfQuestion(browser)
													.text().then(function(descriptiontext) {
														typeFilterText = stringutil.returnValueAfterSplit(descriptiontext, "|", 1);
														if (typeFilterText.indexOf(typeText) > -1) {
															console.log(report.reportHeader() +
																report.printTestData("Type filter from first Question which is " + typeFilterText + " is compared against the type filter selected" + typeText, "success") +
																report.reportFooter());
														}
														bloomFilterText = stringutil.returnValueAfterSplit(descriptiontext, "|", 3);
														if (bloomFilterText.indexOf(bloomText) > -1) {
															console.log(report.reportHeader() +
																report.printTestData("Boom filter from first Question which is " + bloomFilterText + " is compared against the type filter selected" + bloomText, "success") +
																report.reportFooter());
														}
														difficultyFilterText = stringutil.returnValueAfterSplit(descriptiontext, "|", 2);
														if (difficultyFilterText.indexOf(difficultyText) > -1) {
															console.log(report.reportHeader() +
																report.printTestData("Difficulty filter from first Question which is " + difficultyFilterText + " is compared against the type filter selected" + difficultyText, "Success") +
																report.reportFooter());
															done();
														}
													});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
		}else{
		var typeFilterText;
		var bloomFilterText;
		var difficultyFilterText;
		assessmentsPage.retrieveFilterType(browser).then(function(typeText) {
			assessmentsPage.filterOnIWCAssignment(browser, "Type", "multiple-choice").then(function() {
				assessmentsPage.filterOnIWCAssignment(browser, "Type", "true-false").then(function() {
					assessmentsPage.retrieveBloomType(browser).then(function(bloomText) {
						assessmentsPage.filterOnIWCAssignment(browser, "Blooms", "Remember").then(function() {
							assessmentsPage.retrieveDifficultyType(browser).then(function(difficultyText) {
								assessmentsPage.filterOnIWCAssignment(browser, "Difficulty", "Easy").then(function() {
									assessmentsPage.expandTheFilterPanel(browser).then(function() {
										assessmentsPage.getDescriptionOfQuestion(browser)
											.text().then(function(descriptiontext) {
												typeFilterText = stringutil.returnValueAfterSplit(descriptiontext, "|", 1);
												if (typeFilterText.indexOf(typeText) > -1) {
													console.log(report.reportHeader() +
														report.printTestData("Type filter from first Question which is " + typeFilterText + " is compared against the type filter selected" + typeText, "success") +
														report.reportFooter());
												}
												bloomFilterText = stringutil.returnValueAfterSplit(descriptiontext, "|", 3);
												if (bloomFilterText.indexOf(bloomText) > -1) {
													console.log(report.reportHeader() +
														report.printTestData("Boom filter from first Question which is " + bloomFilterText + " is compared against the type filter selected" + bloomText, "success") +
														report.reportFooter());
												}
												difficultyFilterText = stringutil.returnValueAfterSplit(descriptiontext, "|", 2);
												if (difficultyFilterText.indexOf(difficultyText) > -1) {
													console.log(report.reportHeader() +
														report.printTestData("Difficulty filter from first Question which is " + difficultyFilterText + " is compared against the type filter selected" + difficultyText, "Success") +
														report.reportFooter());
													done();
												}
											});
									});
								});
							});
						});
					});
				});
			});
		});
		}
	});

	it(". Validate first filtered Question has specified concept", function(done) {
		assessmentsPage.getConceptOfQuestion(browser).text().then(function(conceptContent) {
			if (conceptContent.indexOf(firstConceptContent) > -1) {
				console.log(report.reportHeader() +
					report.printTestData("Concept in the question and First concept selected are same which is ", firstConceptContent, "success") +
					report.reportFooter());
				done();
			} else if (conceptContent.indexOf(secondtConceptContent) > -1) {
				console.log(report.reportHeader() +
					report.printTestData("Concept in the question and Second concept selected are same which is ", secondtConceptContent, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.printTestData("Concept in the question which is " + conceptContent + " does not match with any selected concept ", "failure") +
					report.reportFooter());
				done();
			}
		});
	});

	it(". Select all filters again and select first 5 questions", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		var count = 1;
		if (process.env.RUN_IN_BROWSER.toString() === "\"internet explorer\"") {
			browser
				.sleep(2000)
				.execute("document.getElementsByClassName('textRadio')[0].scrollIntoView(true);")
				.sleep(2000)
				.waitForElementByCss(".filter-questions", asserters.isDisplayed, 60000).click()
				.sleep(1000)
				.waitForElementByCss(".select-all-filters", asserters.isDisplayed, 60000).then(function(filterIWCAst) {
					browser
						.execute("document.getElementsByClassName('select-all-filters')[0].scrollIntoView(true);")
						// .getLocationInView(filterIWCAst)
						.sleep(2000)
						.waitForElementByCss(".select-all-filters", asserters.isDisplayed, 60000).click().then(function() {
							// I am skipping the fill-in, since the question displayed on questions tab is having an underline which will not match the preview
							browser.hasElementByXPath("//label[@for='fill-in']", asserters.isDisplayed, 60000).then(function(fillTypeQuestion) {
									if (fillTypeQuestion) {
										browser.waitForElementByXPath("//label[@for='fill-in']", asserters.isDisplayed, 60000).click();
									}
								})
								.waitForElementByCss(".filter-questions", asserters.isDisplayed, 60000).then(function(filterChapterIWCAst) {
									browser.execute("document.getElementsByClassName('textRadio')[0].scrollIntoView(true);")
										.sleep(2000)
										.waitForElementByCss(".filter-questions", asserters.isDisplayed, 60000).click().then(function() {
											browser
												.execute("document.getElementsByClassName('select-questions')[0].getElementsByTagName('h2')[0].scrollIntoView(true);");

											function selectQuestions() {
												if (count <= 5) {
													browser
														.waitForElementByXPath("(//div[@class='full-width']//ul//li//div//span[@class='question'])[" + count + "]", asserters.isDisplayed, 60000).then(function(element) {
															element.click();
															browser.sleep(2000);
															element.text().then(function(value) {

																questionText[questionPool] = value.replace(/[^\w\s]/gi, '');;
																console.log(report.reportHeader() +
																	report.printTestData("" + count + " Question is ", questionText[questionPool], "success") +
																	report.reportFooter());
																questionPool++;
																count++;
																selectQuestions();
															})
														})
												} else {
													if (questionPool === 5) {
														console.log("In if11");
														console.log(report.reportHeader() +
															report.printTestData("Number of Questions selected is ", questionPool, "success") +
															report.reportFooter());
														done();
													} else {
														console.log(report.reportHeader() +
															report.printTestData("Number of Questions selected is ", questionPool, "failure") +
															report.reportFooter());
													}
												}
											}
											selectQuestions();
										});
								});
						});
				});
		} else if (process.env.RUN_IN_BROWSER.toString() === "\"firefox\"") {
			browser
				.waitForElementByCss(".filter-questions", asserters.isDisplayed, 60000).click()
				.sleep(1000)
				.waitForElementByCss(".select-all-filters", asserters.isDisplayed, 60000).then(function(filterIWCAst) {
					browser.getLocationInView(filterIWCAst)
						.sleep(1000)
						.waitForElementByCss(".select-all-filters", asserters.isDisplayed, 60000).click().then(function() {
							// I am skipping the fill-in, since the question displayed on questions tab is having an underline which will not match the preview
							browser.hasElementByXPath("//label[@for='fill-in']", asserters.isDisplayed, 60000).then(function(fillTypeQuestion) {
									if (fillTypeQuestion) {
										browser.waitForElementByXPath("//label[@for='fill-in']", asserters.isDisplayed, 60000).click();
									}
								})
								.waitForElementByCss(".filter-questions", asserters.isDisplayed, 60000).then(function(filterChapterIWCAst) {
									browser.getLocationInView(filterChapterIWCAst)
										.sleep(1000)
										.waitForElementByCss(".filter-questions", asserters.isDisplayed, 60000).click().then(function() {
											function selectQuestions() {
												if (count <= 5) {
													browser
														.waitForElementByXPath("(//div[@class='full-width']//ul//li//div//span[@class='question'])[" + count + "]", asserters.isDisplayed, 60000).then(function(element) {
															browser
																.execute("document.evaluate(\"(//div[@class='full-width']//ul//li//div//span[@class='question'])[" + count + "]\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()")
																.sleep(1000)
																.waitForElementByXPath("(//div[@class='full-width']//ul//li//div//span[@class='question'])[" + count + "]", asserters.isDisplayed, 60000).text().then(function(value) {

																	questionText[questionPool] = value.replace(/[^\w\s]/gi, '');;
																	console.log(report.reportHeader() +
																		report.printTestData("" + count + " Question is ", questionText[questionPool], "success") +
																		report.reportFooter());
																	questionPool++;
																	count++;
																	selectQuestions();
																})
														})
												} else {
													if (questionPool === 5) {
														console.log("In if11");
														console.log(report.reportHeader() +
															report.printTestData("Number of Questions selected is ", questionPool, "success") +
															report.reportFooter());
														done();
													} else {
														console.log(report.reportHeader() +
															report.printTestData("Number of Questions selected is ", questionPool, "failure") +
															report.reportFooter());
													}
												}
											}
											selectQuestions();
										});
								});
						});
				});
		} else {
			browser
				.waitForElementByCss(".filter-questions", asserters.isDisplayed, 60000).click()
				.sleep(1000)
				.waitForElementByCss(".select-all-filters", asserters.isDisplayed, 60000).then(function(filterIWCAst) {
					browser.getLocationInView(filterIWCAst)
						.sleep(1000)
						.waitForElementByCss(".select-all-filters", asserters.isDisplayed, 60000).click().then(function() {
							// I am skipping the fill-in, since the question displayed on questions tab is having an underline which will not match the preview
							browser.hasElementByXPath("//label[@for='fill-in']", asserters.isDisplayed, 60000).then(function(fillTypeQuestion) {
									if (fillTypeQuestion) {
										browser.waitForElementByXPath("//label[@for='fill-in']", asserters.isDisplayed, 60000).click();
									}
								})
								.waitForElementByCss(".filter-questions", asserters.isDisplayed, 60000).then(function(filterChapterIWCAst) {
									browser.getLocationInView(filterChapterIWCAst)
										.sleep(1000)
										.waitForElementByCss(".filter-questions", asserters.isDisplayed, 60000).click().then(function() {
											function selectQuestions() {
												if (count <= 5) {
													browser
														.waitForElementByXPath("(//div[@class='full-width']//ul//li//div//span[@class='question'])[" + count + "]", asserters.isDisplayed, 60000).then(function(element) {
															element.click();
															element.text().then(function(value) {

																questionText[questionPool] = value.replace(/[^\w\s]/gi, '');;
																console.log(report.reportHeader() +
																	report.printTestData("" + count + " Question is ", questionText[questionPool], "success") +
																	report.reportFooter());
																questionPool++;
																count++;
																selectQuestions();
															})
														})
												} else {
													if (questionPool === 5) {
														console.log("In if11");
														console.log(report.reportHeader() +
															report.printTestData("Number of Questions selected is ", questionPool, "success") +
															report.reportFooter());
														done();
													} else {
														console.log(report.reportHeader() +
															report.printTestData("Number of Questions selected is ", questionPool, "failure") +
															report.reportFooter());
													}
												}
											}
											selectQuestions();
										});
								});
						});
				});
		}
	});

	it(". Validate the pool of questions label ", function(done) {
		browser
			.sleep(2000)
			.waitForElementByXPath("//div[contains(@class,'textRadio nudge-right')]/parent::div//div[contains(@class,'label')]", asserters.isDisplayed, 60000)
			.text().then(function(label) {
				if (label.indexOf(questionPool) > -1) {
					console.log(report.reportHeader() +
						report.printTestData("Questions pool label which is:: " + label + " is compared against number of question selected", questionPool, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.printTestData("Questions pool label which is:: " + label + " is compared against number of question selected", questionPool, "failure") +
						report.reportFooter());
				}
			});
	});

	it(". Navigate to preview tab and verify the preview question tab is present", function(done) {
		assessmentsPage.clickOnPreviewButtonUnderQuestionTab(browser).then(function() {
			assessmentsPage.validateIfPreviewQuestionIsPresent(browser).then(function() {
				console.log(report.reportHeader() +
					report.printTestData("Question content is appearing successfully", "success") +
					report.reportFooter());
				done();
			});
		});
	});

	it(". Validate if the first question under preview is coming from pool of question selected under question tab", function(done) {
		assessmentsPage.validateIfPreviewQuestionIsCorrect(browser).then(function(qText) {
			var qTextSpecialCharactersRemoved = qText.replace(/[^\w\s]/gi, '');
			var testValue = function(value) {
				return _.find(questionText, function(child) {
					return child.match(new RegExp(value, "i"));
				});
			};
			if (typeof testValue(qTextSpecialCharactersRemoved) !== "undefined") {
				console.log(report.reportHeader() +
					report.printTestData("Question from preview \"" + qText + "\" from question list is appearing successfully", "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.printTestData("Preview is displaying an incorrect question", "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate Show Correct Answers, Print buttons are present under preview tab", function(done) {
		assessmentsPage.validatePresenceOfShowCorrectAnswersButton(browser).text().then(function(showCorrectAnswersText) {
			assessmentsPage.validatePresenceOfPrintButton(browser).then(function(printButtonText) {
				if ((showCorrectAnswersText.indexOf(assessmentData.systemgenerated.scorestrategyhigh.showCorrectAnswer) > -1) && (printButtonText.indexOf(assessmentData.systemgenerated.scorestrategyhigh.Print) > -1)) {
					console.log(report.reportHeader() +
						report.printTestData("Buttons under preview tab are:: " + showCorrectAnswersText + ", " + printButtonText + " are appearing successfully", "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.printTestData("Buttons under preview tab are not appearing successfully", "failure") +
						report.reportFooter());
				}
			});
		});
	});

	it(". Validate Feedback is not present when user selected 'show correct answers' button ", function(done) {
		assessmentsPage.vaildateFeedbackColoumnUnderCorrectAnswers(browser).then(function(status) {
			if (!status) {
				console.log(report.reportHeader() +
					report.printTestData("Feedback is not present under show correct answers ans status is :: " + status + " are appearing successfully", "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.printTestData("Feedback is not present under show correct answers ans status is :: " + status + " are appearing successfully", "failure") +
					report.reportFooter());
			}
		});
	});


	it(". Validate button name changed on clicking show correct answers button ", function(done) {
		assessmentsPage.validatePresenceOfShowCorrectAnswersButton(browser).click().then(function() {
			assessmentsPage.validatePresenceOfShowCorrectAnswersButton(browser).text().then(function(hideAnswerButtonText) {
				console.log(hideAnswerButtonText);
				console.log(assessmentData.systemgenerated.scorestrategyhigh.hideAnswer);
				if (hideAnswerButtonText.indexOf(assessmentData.systemgenerated.scorestrategyhigh.hideAnswer) > -1) {
					console.log(report.reportHeader() +
						report.printTestData("Validate changed button text \"hide answers\" is compared against", hideAnswerButtonText, "success") +
						report.reportFooter());
						assessmentsPage.checkIfCreditsIsPresentOnHideAnswersPanel(browser).then(function() {
						done();
					});
				} else {
					console.log(report.reportHeader() +
						report.printTestData("Validate changed button text \"hide answers\" is compared against", hideAnswerButtonText, "failure") +
						report.reportFooter());
				}
			});
		});

	});

	it(". Validate  feedback,credits and  displayed on hide answers panel", function(done) {
		var product = process.env.RUN_FOR_PRODUCT.toString();
		console.log("Run in product" + product);
		if (product === "\"ORGB5\"" || product === "PFIN6\"" || product === "\"SOC5\"" || product === "\"COMM4\"") {
			console.log(report.reportHeader() +
				report.printTestData("Feedback coloumn counts are not present for title",product, "failure") +
				report.reportFooter());
			this.skip();
		} else {
			assessmentsPage.validatePresenceOfFeedbackColoumn(browser).then(function(length) {
				feedbackColoumnCount = _.size(length);
				assessmentsPage.checkIfCorrectIconIsPresentOnHideAnswersPanel(browser).then(function() {
					if (parseInt(feedbackColoumnCount) === assessmentData.systemgenerated.scorestrategyhigh.feedbackColoumnCount2) {
						console.log(report.reportHeader() +
							report.printTestData("Feedback coloumn counts are :: " + feedbackColoumnCount, " are appearing successfully", "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.printTestData("Feedback coloumn counts are not diplaying under hide answer panel ", "", "failure") +
							report.reportFooter());
					}
				});
			});
		}
	});


	it(". Validate Questions, cancel and save/close button under preview tab", function(done) {
		assessmentsPage.validatePresenceOfQuestionButton(browser).then(function(button1Text) {
			assessmentsPage.validatePresenceOfCancelButton(browser).then(function(button2Text) {
				assessmentsPage.validatePresenceOfSaveOrCloseButton(browser).then(function(button3Text) {
					if ((button1Text.indexOf("QUESTIONS") > -1) && (button2Text.indexOf("CANCEL") > -1) && (button3Text.indexOf("SAVE / CLOSE") > -1)) {
						console.log(report.reportHeader() +
							report.printTestData("Buttons under preview tab are:: " + button1Text + ", " + button2Text + ", " + button3Text + " and are appearing successfully", "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.printTestData("Buttons under preview tab are not appearing successfully", "failure") +
							report.reportFooter());
						done();
					}
				});
			});
		});
	});

	it(". Click on Question button under preview tab and validate the navigation", function(done) {
		assessmentsPage.clickOnQuestionButtonUnderPreviewTab(browser).then(function() {
			assessmentsPage.validateTheNavigation(browser).then(function() {
				console.log(report.reportHeader() +
					report.printTestData("Question tab became active on clicking question button under preview tab", "success") +
					report.reportFooter());
				done();
			});
		});
	});


	it(". Click on preview button under question tab and validate the navigation", function(done) {
		assessmentsPage.clickOnPreviewButtonUnderQuestionTab(browser).then(function() {
			assessmentsPage.validateIfPreviewQuestionIsPresent(browser).then(function() {
				console.log(report.reportHeader() +
					report.printTestData("Navigation to preview tab successfully loaded the question content", "success") +
					report.reportFooter());
				done();
			});
		});
	});


	it(". Save the IWC assessment using save/close button", function(done) {
		assessmentsPage.clickOnQuestionButtonUnderPreviewTab(browser).then(function() {
			assessmentsPage.saveAssignment(browser).then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
		});
	});

	it(". Verify if IWC assessment gets saved successfully", function(done) {
		console.log("getMonthForNextWeek" + getMonthForNextWeek);
		console.log("dateUtil.getCurrentFullMonthName()" + dateUtil.getCurrentFullMonthName());
		if (dateUtil.getCurrentFullMonthName() == getMonthForNextWeek) {
			assessmentsPage.checkIfAssignmentSavedOnOneWeekAhead(browser, getDueDateWhichIsInNextWeek).then(function(value) {
				if (value.toString() === "rgb(236, 41, 142)") {
					assignmentCreationStatus = "success";
					console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName(), "success") + report.reportFooter());
					done();
				} else {
					assignmentCreationStatus = "failure";
					console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName() + " may not have received the assessmentCGI", "failure") + report.reportFooter());
					//  done();
				}
			});
		} else {
			calendarNavigation.navigateToNextMonth(browser).then(function() {
				assessmentsPage.checkIfAssignmentSavedOnOneWeekAhead(browser, getDueDateWhichIsInNextWeek).then(function(value) {
					if (value.toString() === "rgb(236, 41, 142)") {

						assignmentCreationStatus = "success";
						console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName(), "success") + report.reportFooter());
						done();
					} else {
						assignmentCreationStatus = "failure";
						console.log(report.reportHeader() + report.stepStatusWithData("CCS : Instructor created an assessment type assignment called :: ", assessmentsPage.getAssignmentName() + " may not have received the assessmentCGI", "failure") + report.reportFooter());
						//  done();
					}
				});
			});
		}
	});

	it(". Log out as Instructor", function(done) {
		userSignOut.userSignOut(browser, done);
	});

	it(". Login as student", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
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

	it(". Navigate to Assignments page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Validate assessment is not present on today's date", function(done) {
		studentAssessmentsPage.verifyAssignmentNotPresentOnCurrentDate(browser, 1).then(function(stutusOfAssignmentOnCurrentDate) {
			if (!stutusOfAssignmentOnCurrentDate) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment is not present on current date", stutusOfAssignmentOnCurrentDate, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment is present on current date", stutusOfAssignmentOnCurrentDate, "failure") +
					report.reportFooter());
			}

		});
	});

	it(". Click on assignment due date calendar and validate IWC assessment should be present", function(done) {
		if (dateUtil.getCurrentFullMonthName() == getMonthForNextWeek) {
			studentAssessmentsPage.clickOnCurrentDateCellFromNextMonth(browser, getDueDateWhichIsInNextWeek).then(function() {
				done();
			});
		} else {
			calendarNavigation.navigateToNextMonth(browser).then(function() {
				studentAssessmentsPage.clickOnCurrentDateCellFromNextMonth(browser, getDueDateWhichIsInNextWeek).then(function() {
					done();
				});
			});
		}
	});

	it(". Launch the IWC assessment for the first time", function(done) {
		pageLoadingTime = 0;
		studentAssessmentsPage.launchAssignment(browser, assessmentsPage.getAssignmentName()).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is launched");
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

	it(". Validate questions count should be same on student end", function(done) {
		studentAssessmentsPage.getCountsOfTotalQuestions(browser).then(function(questionCount) {
			console.log("_.size(questionCount)" + _.size(questionCount));
			console.log("assessmentData.systemgenerated.iwillchoose.questionsSelected" + assessmentData.systemgenerated.iwillchoose.questionsSelected);
			if (_.size(questionCount) == assessmentData.systemgenerated.iwillchoose.questionsSelected) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("CAS : Total questions on assignment creation " + assessmentData.systemgenerated.iwillchoose.questionsSelected + "is compared with  ", _.size(questionCount), "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("CAS : Total questions on assignment creation " + assessmentData.systemgenerated.iwillchoose.questionsSelected + "is compared with  ", _.size(questionCount), "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Complete the assignment and exit", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("quiz"));
		takeQuizpo.takeQuiz(browser, done);
	});

	it(". Fetch correct questions from IWC assessment results page", function(done) {
		casPage.getQuestionsCorrect(browser).then(function(questionsCorrect) {
			console.log("Total Questions Correct " + questionsCorrect);
			questionsCorrect1stattemptFromCAS = questionsCorrect;
			console.log("Total Assignment Questions " + assessmentData.systemgenerated.iwillchoose.questionsSelected);
			studentAssignmentCompletionStatus = "success";
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS : Student Completed the assignment with questions " + assessmentData.systemgenerated.iwillchoose.questionsSelected + " and got a score of  ", questionsCorrect, "success") +
				report.reportFooter());
			done();
		});
	});

	it(". Click on exit button", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.clickExitButtonOnResultsPage(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is attempted");
		});
	});

	it(". Click on assignment due date calendar and validate assessment should be present", function(done) {
		if (dateUtil.getCurrentFullMonthName() == getMonthForNextWeek) {
			studentAssessmentsPage.clickOnCurrentDateCellFromNextMonth(browser, getDueDateWhichIsInNextWeek).then(function() {
				done();
			});
		} else {
			calendarNavigation.navigateToNextMonth(browser).then(function() {
				studentAssessmentsPage.clickOnCurrentDateCellFromNextMonth(browser, getDueDateWhichIsInNextWeek).then(function() {
					done();
				});
			});
		}
	});

	it(". Launch the IWC assessment for the second time", function(done) {
		pageLoadingTime = 0;
		studentAssessmentsPage.launchAssignment(browser, assessmentsPage.getAssignmentName()).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is launched");
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

	it(". Complete the IWC assessment", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("quiz"));
		pageLoadingTime = 0;
		//Call this function if you want a specific block to timeout after a specific time interval
		takeQuizpo.takeQuiz(browser, done);
	});

	it(". Fetch correct questions from quiz results page", function(done) {
		casPage.getQuestionsCorrect(browser).then(function(questionsCorrect) {
			questionsCorrect2ndattemptFromCAS = questionsCorrect;
			console.log("Total Questions Correct " + questionsCorrect);
			console.log("Total Assignment Questions " + assessmentData.systemgenerated.iwillchoose.questionsSelected);
			studentAssignmentCompletionStatus = "success";
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS : Student Completed the 2nd attempt of assignment with questions " + assessmentData.systemgenerated.iwillchoose.questionsSelected + " and got a score of  ", questionsCorrect, "success") +
				report.reportFooter());
			done();
		});
	});

	it(". Click on exit button", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.clickExitButtonOnResultsPage(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is attempted");
		});
	});

	it(". Click on assignment due date calendar and validate assessment should be present", function(done) {
		if (dateUtil.getCurrentFullMonthName() == getMonthForNextWeek) {
			studentAssessmentsPage.clickOnCurrentDateCellFromNextMonth(browser, getDueDateWhichIsInNextWeek).then(function() {
				done();
			});
		} else {
			calendarNavigation.navigateToNextMonth(browser).then(function() {
				studentAssessmentsPage.clickOnCurrentDateCellFromNextMonth(browser, getDueDateWhichIsInNextWeek).then(function() {
					done();
				});
			});
		}
	});

	it(". Launch the IWC assessment for the third time", function(done) {
		pageLoadingTime = 0;
		studentAssessmentsPage.launchAssignment(browser, assessmentsPage.getAssignmentName()).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is launched");
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

	it(". Complete the assignment", function(done) {
		this.timeout(courseHelper.getElevatedTimeout("quiz"));
		pageLoadingTime = 0;
		takeQuizpo.takeQuiz(browser, done);
	});

	it(". Fetch correct questions from IWC assessment results page", function(done) {
		casPage.getQuestionsCorrect(browser).then(function(questionsCorrect) {
			questionsCorrect3rdattemptFromCAS = questionsCorrect;
			console.log("Total Questions Correct " + questionsCorrect);
			console.log("Total Assignment Questions " + assessmentData.systemgenerated.iwillchoose.questionsSelected);
			studentAssignmentCompletionStatus = "success";
			console.log(report.reportHeader() +
				report.stepStatusWithData("CAS : Student Completed the 3rd attempt of assignment with questions " + assessmentData.systemgenerated.iwillchoose.questionsSelected + " and got a score of  ", questionsCorrect, "success") +
				report.reportFooter());
			done();
		});
	});

	it(". Click on exit button", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.clickExitButtonOnResultsPage(browser).then(function() {
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is attempted");
		});
	});


	it(". Drop the lowest score and calculate average", function(done) {
		var score1;
		var score2;
		var score3;
		score1 = parseInt(questionsCorrect1stattemptFromCAS) * 6;
		score2 = parseInt(questionsCorrect2ndattemptFromCAS) * 6;
		score3 = parseInt(questionsCorrect3rdattemptFromCAS) * 6;
		var pointScores = [score1, score2, score3];
		var sortedScores = _.sortBy(pointScores);
		var remainingScores = _.rest(sortedScores);

		function average(arr) {
			return _.reduce(arr, function(points, num) {
				return points + num;
			}, 0) / (arr.length === 0 ? 1 : arr.length);
		}
		averageScore = average(remainingScores);
		console.log("Average score is:: " + averageScore);
		done();
	});

	it(". Navigate to GradeBook page", function(done) {
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it.skip(" [Gradebook] Verify whether the system generated student score on Student GradeBook Page", function(done) {
		this.retries(3);
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		var score1stAttempt;
		var score2ndAttempt;
		var score3rdAttempt;
		score1stAttempt = parseInt(questionsCorrect1stattemptFromCAS);
		score2ndAttempt = parseInt(questionsCorrect2ndattemptFromCAS);
		score3rdAttempt = parseInt(questionsCorrect3rdattemptFromCAS);
		var scoresArray = [score1stAttempt, score2ndAttempt, score3rdAttempt];
		var sortedScoresArray = _.sortBy(scoresArray);
		var remainingScoresArray = _.rest(sortedScoresArray);

		function average(arr) {
			return _.reduce(arr, function(points, num) {
				return points + num;
			}, 0) / (arr.length === 0 ? 1 : arr.length);
		}
		var averageScore = average(remainingScoresArray);
		averageScoreOnGradebook = mathutil.getScoreUptoOneDecimal(averageScore);
		console.log("averageScoreOnGradebook" + averageScoreOnGradebook);
		studenGradebookPage.checkStudentScore(browser, assessmentsPage.getAssignmentName(), averageScoreOnGradebook)
			.then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Score on Student gradebook page which is " + averageScoreOnGradebook + " questions, is compared against the student score(Questions correct) retrieved from Instructor GradeBook ", averageScoreOnGradebook, "success") +
					report.reportFooter());
				done();
			});
	});

	it(". Validate the presence of Class average value on student GradeBook", function(done) {
		this.retries(2);
		studenGradebookPage.validateAvgScoreOnStudentGradebook(browser, assessmentsPage.getAssignmentName(), averageScore, done);
	});

	it(". Log out as Student", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userSignOut.userSignOut(browser, done);
	});

	it(". Wait for page load", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

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
		loginPage.launchACourse(userType, courseName, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate on GradeBook page", function(done) {
		menuPage.selectGradebook(userType, browser, done);
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Navigate to student's detailed GradeBook view", function(done) {
		instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserName()).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Wait until page is loaded successfully", function(done) {
		browser
			.refresh().then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
			});
	});

	it(". Validate if the class average scores on Student Detailed GradeBook view is same as calculated", function(done) {
		instructorGradebookStudentDetailedPage.validatePresenceOfAverageScore(browser, assessmentsPage.getAssignmentName()).then(function(avgScore) {
			classAvgScore = averageScore / totalsudentcount;
			if (parseInt(avgScore) == classAvgScore) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("INSRUCTOR GradeBook : Class Average points " + avgScore + " compared with calculated average point", averageScore, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("INSRUCTOR GradeBook : Class Average points " + avgScore + " compared with calculated average point", averageScore, "failure") +
					report.reportFooter());
				done();
			}
		});
	});

	it(". [Gradebook] Verify whether the system generated student scored point is updated on Instructor GradeBook Student Detailed Page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3);
		instructorGradebookStudentDetailedPage.getScoredPoints(browser, assessmentsPage.getAssignmentName())
			.then(function(scoredPoints) {
				console.log(parseInt(scoredPoints));
				if (parseInt(scoredPoints) == averageScore) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + averageScore + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + averageScore + " points, is compared against the student point score retrieved from Instructor GradeBook ", scoredPoints, "failure") +
						report.reportFooter());
				}

			});
	});

	// Automation issue LTR-4984
	it(". Edit attempt from the instructor gradebook", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.editedAttemptsFromStudentDetaledView(browser, assessmentsPage.getAssignmentName()).then(function() {
			done();
		});
	});

	it(". Validate attempts edited successfully without any error message", function(done) {
		instructorGradebookStudentDetailedPage.editedAttemptOnStudentDetailPage(browser, assessmentsPage.getAssignmentName()).then(function(editedAttempt) {
			if (editedAttempt.indexOf("unlimited") > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment edited attempts with", "unlimited", "success") +
					report.reportFooter());
				instructorGradebookStudentDetailedPage.errorFlashHideStatus(browser).then(function(errorFlashHideStatus) {
					if (errorFlashHideStatus) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Error flash hide status on the page", errorFlashHideStatus, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Error flash hide status on the page", errorFlashHideStatus, "failure") +
							report.reportFooter());
					}
				});
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment edited attempts with", "unlimited", "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Edit due date for current student", function(done) {
		pageLoadingTime = 0;
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		instructorGradebookStudentDetailedPage.dueDateValue(browser, assessmentsPage.getAssignmentName()).then(function(dueDateBeforeEdit) {
			instructorGradebookStudentDetailedPage.editDueDate(browser, assessmentsPage.getAssignmentName()).then(function() {
				instructorGradebookStudentDetailedPage.dueDateValue(browser, assessmentsPage.getAssignmentName()).then(function(dueDateAfterEdit) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Assignment due date " + dueDateBeforeEdit + " updated by", dueDateAfterEdit, "success") +
						report.reportFooter());
					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Due date edited");
				});
			});
		});
	});

	it(". Wait until the GradeBook page is loaded successfully", function(done) {
		browser
			.sleep(2000)
			.refresh()
			.then(function() {
				pageLoadingTime = 0;
				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "GradeBook page is loaded");
			});
	});
	// Automation issue LTR-4984 cuurently it is failing so added skip
	it(". LTR-4984 : Re-validate edited attempts persist after refreshing the page without any error", function(done) {
		browser.sleep(5000);
		instructorGradebookStudentDetailedPage.editedAttemptOnStudentDetailPage(browser, assessmentsPage.getAssignmentName()).then(function(editedAttempt) {
			if (editedAttempt.indexOf("unlimited") > -1) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment edited attempts with", "unlimited", "success") +
					report.reportFooter());
				instructorGradebookStudentDetailedPage.errorFlashHideStatus(browser).then(function(errorFlashHideStatus) {
					if (errorFlashHideStatus) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Error flash hide status on the page", errorFlashHideStatus, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Error flash hide status on the page", errorFlashHideStatus, "failure") +
							report.reportFooter());
					}
				});
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Assignment edited attempts with", "unlimited", "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate class average value on student detailed page remains same after attempt override ", function(done) {
		instructorGradebookStudentDetailedPage.validatePresenceOfAverageScore(browser, assessmentsPage.getAssignmentName()).then(function(avgScore) {
			classAvgScore = averageScore / totalsudentcount;
			if (parseInt(avgScore) === classAvgScore) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("INSRUCTOR GradeBook : Class Average points " + avgScore + " compared with calculated average point after attempt override", averageScore, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("INSRUCTOR GradeBook : Class Average points " + avgScore + " compared with calculated average point after attempt override", averageScore, "failure") +
					report.reportFooter());
				done();
			}
		});
	});

	it(". [Gradebook] Verify system generated student point score on Student Detailed Results Page remains same after attempt override", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.retries(3);
		instructorGradebookStudentDetailedPage.getScoredPoints(browser, assessmentsPage.getAssignmentName())
			.then(function(scoredPoints) {
				if (parseInt(scoredPoints) == averageScore) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + averageScore + " points, is compared against the student point score retrieved from Instructor GradeBook after attempt override", scoredPoints, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("GRADEBOOK : TestBot calculated point score" + averageScore + " points, is compared against the student point score retrieved from Instructor GradeBook after attempt override", scoredPoints, "failure") +
						report.reportFooter());
				}

			});
	});

	it(". Navigate to details of student's attempts GradeBook view", function(done) {
		instructorGradebookNavigationPage.navigateToDetailsOfStudentsAttempts(browser, assessmentsPage.getAssignmentName()).then(function() {
			done();
		});
	});

	it(". Wait for page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Retrieve Attempts done by student before clearing the attempt", function(done) {
		instructorGradebookStudentDetailedPage.getAttempts(browser).text().then(function(attemptsValue) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Completed Attempts count before deleting" + attemptsValue, "success") +
				report.reportFooter());
			attemptBeforeAttempDelete = attemptsValue;
			done();
		});
	});

	it(". Fetching the number of ATTEMPT done by student from drop-down list before deleting the attempt ", function(done) {
		instructorGradebookStudentDetailedPage.getAttemptsFromDropDown(browser).then(function(ele) {
			attemptInDropDownbeforeDelete = _.size(ele);
			done();
		});
	});


	it(". Validate the presence of  CLEAR ATTEMPT button and click on it", function(done) {
		instructorGradebookStudentDetailedPage.checkForClearAttemptButtonAndClickClearAttempt(browser).then(function() {
			done();
		});
	});


	it(". Validate heading and warning message should be appeared on pop-up box ", function(done) {
		instructorGradebookStudentDetailedPage.checkForPopUpBoxHeadingAndWarning(browser, testData.attemptClear.popUpBoxHeading, testData.attemptClear.popUpBoxWarning).then(function() {
			done();
		});
	});

	it(". Validate that on clicking the No button on attempt deleting confirmation box then Attempts remain as it is", function(done) { //in process
		instructorGradebookStudentDetailedPage.clickOnCancelButtonOnClearAttemptModel(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "updated attempts page is loaded");
		});
	});

	it(". Confirmation box for delete attempt should be hidden from the page", function(done) { //in process
		instructorGradebookStudentDetailedPage.getStatusOfClearAttemptPopupWindow(browser).then(function(clearAttemptModelWindow) {
			if (!clearAttemptModelWindow) {
				console.log(report.reportHeader() +
					report.stepStatusWithData(" Clear Attempt:: Model Window non Presence Status on Page " + clearAttemptModelWindow, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData(" Clear Attempt:: Model Window non Presence Status on Page " + clearAttemptModelWindow, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validating the presence of CLEAR ATTEMPT button and click on it", function(done) {
		instructorGradebookStudentDetailedPage.checkForClearAttemptButtonAndClickClearAttempt(browser).then(function() {
			done();
		});
	});


	it(". Validating heading and warning message on pop-up box ", function(done) {
		instructorGradebookStudentDetailedPage.checkForPopUpBoxHeadingAndWarning(browser, testData.attemptClear.popUpBoxHeading, testData.attemptClear.popUpBoxWarning).then(function() {
			done();
		});
	});

	it(". Delete the attempt ", function(done) {
		instructorGradebookStudentDetailedPage.confirmAttemptDelete(browser).then(function() {
			done();
		});
	});


	it(". Wait until page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "updated attempts page is loaded");
	});

	it(". Retrieve attempts values after clearing the attempt", function(done) {
		instructorGradebookStudentDetailedPage.getAttempts(browser).text().then(function(attemptsValue) {
			console.log(report.reportHeader() +
				report.stepStatusWithData(" Attempts count after deleting one Attempt = " + attemptsValue, "success") +
				report.reportFooter());

			attemptAfterAttempDelete = attemptsValue;
			done();
		});
	});



	it(". Retrieve the number of ATTEMPT(done by student) from drop-down list after deleting the attempt ", function(done) {
		instructorGradebookStudentDetailedPage.getAttemptsFromDropDown(browser).then(function(ele) {
			attemptInDropDownAfterDelete = _.size(ele);
			done();
		});
	});

	it(". Retrieve value of correct questions after deleting the attempts ", function(done) {
		//  for(var i=1; i<=attemptInDropDownAfterDelete; i++){
		var i = 0;

		function getDropDownValue() {
			if (i < attemptInDropDownAfterDelete) {
				i++;
				instructorGradebookStudentDetailedPage.getValueFromDropDown(browser, i).then(function(AttemptValue) {
					console.log(AttemptValue);
					var percentage = stringutil.returnValueAfterSplit(AttemptValue, " ", 3);
					console.log(percentage);
					var ScoreInDropDown = parseInt(stringutil.returnValueAfterSplit(percentage, "%", 0));
					ScoreInDropDownFields.push(ScoreInDropDown);
					console.log(ScoreInDropDownFields);
					getDropDownValue();

				});
			} else {
				if (i == attemptInDropDownAfterDelete) {
					console.log(ScoreInDropDownFields);
					done();
				}
			}
		}
		getDropDownValue();
	});

	it(". Select highest percentage value attempt detail from comparing options value of select box", function(done) {
		if (parseInt(ScoreInDropDownFields[0]) >= parseInt(ScoreInDropDownFields[1])) {
			instructorAssessmentDetailedInfopo.clickOnMaxPercentageValue(browser, ScoreInDropDownFields[0]).then(function() {
				instructorAssessmentDetailedInfopo.getCorrectQuestionCount(browser).then(function(correctQuestionCount) {
					correctQuestionCountFromAssessmentDetailedPage = parseInt(correctQuestionCount);
					console.log(report.reportHeader() +
						report.stepStatusWithData("Instructor Assignment's Result page:: Highest correct question count", correctQuestionCountFromAssessmentDetailedPage, "success") +
						report.reportFooter());
					done();
				});
			});
			//option[contains(@label,'50%')]
		} else {
			instructorAssessmentDetailedInfopo.clickOnMaxPercentageValue(browser, ScoreInDropDownFields[1]).then(function() {
				instructorAssessmentDetailedInfopo.getCorrectQuestionCount(browser).then(function(correctQuestionCount) {
					correctQuestionCountFromAssessmentDetailedPage = parseInt(correctQuestionCount);
					console.log(report.reportHeader() +
						report.stepStatusWithData("Instructor Assignment's Result page:: Highest correct question count", correctQuestionCountFromAssessmentDetailedPage, "failure") +
						report.reportFooter());
					done();
				});
			});
		}
	});

	it(". Validating the number of attempts in drop-down list get reduce by 1 after deleting the assignments", function(done) {
		var beforeDelete = parseInt(attemptInDropDownbeforeDelete) - 1;
		var afterDelete = parseInt(attemptInDropDownAfterDelete);
		if (beforeDelete === afterDelete) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Instructor Assignment's Result page:: No of assignment count is 1 less then i.e. " + beforeDelete + ", is compared against the after clear attempts count ", afterDelete, "success") +
				report.reportFooter());
			done();
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Instructor Assignment's Result page:: No of assignment count is 1 less then i.e. " + beforeDelete + ", is compared against the after clear attempts count ", afterDelete, "failure") +
				report.reportFooter());
		}
	});

	it(". Validating that after deleting one attempt the attempts count decreased by one at student details assessment result page", function(done) {
		var attemptBeforeAttempDeleteMinusOne = attemptBeforeAttempDelete - 1;
		console.log(attemptAfterAttempDelete);
		console.log(attemptBeforeAttempDeleteMinusOne);
		if (attemptAfterAttempDelete == attemptBeforeAttempDeleteMinusOne) {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Instructor Assignment's Result page:: No of assignment attempt i.e. " + attemptAfterAttempDelete + ", is compared against the after clear attempts count ", attemptBeforeAttempDeleteMinusOne, "success") +
				report.reportFooter());
			done();
		} else {
			console.log(report.reportHeader() +
				report.stepStatusWithData("Instructor Assignment's Result page:: No of assignment attempt i.e. " + attemptAfterAttempDelete + ", is compared against the after clear attempts count ", attemptBeforeAttempDeleteMinusOne, "failure") +
				report.reportFooter());
		}
	});

	it(". Click on back button for navigating on student detailed page", function(done) {
		instructorGradebookNavigationPage.clickOnGradebookBackButton(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Gradebook Page is loaded");
		});
	});

	it(". Again click on back button for navigating on instructor main gradebook page", function(done) {
		instructorGradebookNavigationPage.clickOnGradebookBackButton(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Gradebook Page is loaded");
		});
	});

	it(". Validate score on main gradebook page", function(done) {
		mainGradebookView.getScoreText(browser, 1).then(function(grades) {
			console.log("ScoreInDropDownFields[0]" + ScoreInDropDownFields[0]);
			console.log("ScoreInDropDownFields[1]" + ScoreInDropDownFields[1]);
			var roboPoints = assignmentAvgScore.getAvgScoreAfterDropLowestScoreIf5Questions(correctQuestionCountFromAssessmentDetailedPage);
			if (parseInt(grades) === roboPoints) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Points after clearing attempt " + grades + " is compared with robo points", roboPoints, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : Points after clearing attempt " + grades + " is compared with robo points", roboPoints, "failure") +
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


	it(". Login as student", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userType = "student";
		data = loginPage.setLoginData(userType);
		//Reports
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Course and launch", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		loginPage.launchACourse(userType, courseName, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate to Assignments Page", function(done) {
		menuPage.selectAssignments(userType, browser, done);
	});

	it(". Wait until page load", function(done) {
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment page is loaded");
	});

	it(". Navigate to GradeBook page", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		menuPage.selectGradebook(userType, browser, done);
	});


	it(". LTR-5162:: [Student Gradebook]:: Validate the Points earned by the student get changed or not due to deleting the attempt  ", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		console.log("ScoreInDropDownFields[0]" + ScoreInDropDownFields[0]);
		console.log("ScoreInDropDownFields[1]" + ScoreInDropDownFields[1]);
		var roboPoints = assignmentAvgScore.getAvgScoreAfterDropLowestScoreIf5Questions(correctQuestionCountFromAssessmentDetailedPage);
		console.log("At Instructor side points = " + roboPoints);
		studenGradebookPage.getScoredPoints(browser, assessmentsPage.getAssignmentName()).then(function(valueScore) {
			if (!mathutil.isEmpty(valueScore)) {
				console.log("At Student side points = " + valueScore);
				if (parseInt(valueScore) == parseInt(roboPoints)) {
					pointsFromStudentGradebook = valueScore;
					console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + roboPoints + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "success") + report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() + report.stepStatusWithData("GRADEBOOK : TestBot calculated point score " + roboPoints + " points, is compared against the student point score retrieved from Student GradeBook ", valueScore, "failure") + report.reportFooter());
				}

			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("GRADEBOOK : get point score from element is empty ", valueScore, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Log out as Student", function(done) {
		if (assignmentCreationStatus === "failure" || studentAssignmentCompletionStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userSignOut.userSignOut(browser, done);
	});


	it(". Login as Instructor", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userType = "instructor";
		data = loginPage.setLoginData(userType);
		//Reports
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Select a Product", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		brainPage.selectProduct(product, browser, done);
	});

	it(". Select a Course and launch", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		loginPage.launchACourse(userType, courseName, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	it(". Navigate to Assignments page", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userType = "instructor";
		menuPage.selectAssignments(userType, browser, done);
	});

	if (process.env.RUN_IN_PLATFORM.toString() === "\"mobile\"" || process.env.RUN_IN_PLATFORM.toString() === "\"iOS\"") {

	} else {

		it(". Open the created assignment on next week", function(done) {
			this.timeout(courseHelper.getElevatedTimeout());
			pageLoadingTime = 0;
			if (dateUtil.getCurrentFullMonthName() == getMonthForNextWeek) {
				assessmentsPage.clickOnAssessmentCreatedOnNextWeek(browser, getDueDateWhichIsInNextWeek).then(function() {
					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is opened on edit panel");
				});
			} else {
				calendarNavigation.navigateToNextMonth(browser).then(function() {
					assessmentsPage.clickOnAssessmentCreatedOnNextWeek(browser, getDueDateWhichIsInNextWeek).then(function() {
						takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Assignment is opened on edit panel");
					});
				});
			}
		});

		it(". Validate the Reveal date is non editable once the student has taken the assessment", function(done) {
			assessmentsPage.verifyRevealDateDisabled(browser).getAttribute('aria-disabled').then(function(revealDateStatus) {
				assessmentsPage.verifyAssignmentNameTextboxDisabled(browser).getAttribute('aria-disabled').then(function(textboxStatus) {
					assessmentsPage.verifyScoreDisabled(browser).getAttribute('aria-disabled').then(function(scoreStatus) {
						assessmentsPage.closeAssignmentPanel(browser).then(function() {
							if (revealDateStatus === "true" && scoreStatus === "true" && textboxStatus === "true") {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Reveal date is non editable once the student has taken the assessment", revealDateStatus, "success") +
									report.reportFooter());
								done();
							} else {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Reveal date is non editable once the student has taken the assessment", revealDateStatus, "failure") +
									report.reportFooter());

							}
						});
					});
				});
			});
		});

	}

	it(". Wait for page load", function(done) {
		browser.refresh().then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Delete the created assignment", function(done) {
		if (assignmentCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		}
		assessmentsPage.deleteAssignment(browser, done);
	});

	it(". Close flash on assignment page", function(done) {
		calendarNavigation.handleTheFlashAlert(browser).then(function() {
			done();
		});
	});

	it(". Log out as Instructor", function(done) {
		this.timeout(courseHelper.getElevatedTimeout());
		userSignOut.userSignOut(browser, done);
	});


});
