require('colors');
var wd = require('wd');
var asserters = wd.asserters;
var _ = require('underscore');
var stringutil = require("../../util/stringUtil");
var dataUtil = require("../../util/date-utility");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var basicpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var session = require("../../support/setup/browser-session");
var testData = require("../../../../test_data/data.json");
var createNewCoursepo = require("../..//support/pageobject/" + pageobject + "/" + envName + "/createNewCoursepo");
var clearAllSavedContent = require("../../support/pageobject/" + pageobject + "/" + envName + "/clearData");
var takeQuizpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
var tocPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/tocpo");
var courseHelper = require("../../support/helpers/courseHelper");
var report = require("../../support/reporting/reportgenerator");
var chaptertile = require("../../support/pageobject/" + pageobject + "/" + envName + "/chaptertileverificationpo.js");
var userSignOut = require("../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var copyCoursePage = require("../../support/pageobject/" + pageobject + "/" + envName + "/copyCoursepo.js");
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
	var productData;
	var pageLoadingTime;
	var totalTime;
	var product;
	var serialNumber = 0;

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
		editedCourseName = "Edit" + product + " " + courseHelper.getUniqueCourseName();
		// newCourseName = product + " new validation";
		data = loginPage.setLoginData(userType);
		productData = loginPage.getProductData();
		totalTime = 0;
		//Reports
		console.log(report.formatTestName("CENGAGE COURSE CREATION AND ASSIGNMENT CREATION"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("courseCreation.js"));
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
			report.reportFooter());
		console.log(report.formatTestTotalTime(totalTime, scriptName, allPassed));
		session.close(allPassed, done);
	});

	it(". Log in to 4LTR Platform as Instructor", function(done) {
		loginPage.loginToApplication(browser, userType, done);
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
			done();
		});
	});

	it(". Fill in the start date", function(done) {
		createNewCoursepo.fillTheStartDate(browser).then(function() {
			done();
		});
	});

	it(". Fill the end date also with today's date for validating the error message appeared on the page", function(done) {
		createNewCoursepo.fillTheEndDateWithTodaysDate(browser).then(function() {
			done();
		});
	});

	it(". Save the course details", function(done) {
		createNewCoursepo.saveTheCourseDetail(browser).then(function() {
			done();
		});
	});

	it(". Validate error appears on the page if user enter the current date of course end date", function(done) {
		createNewCoursepo.getErrorText(browser).then(function(errorText) {
			if(errorText.indexOf("End date should be after begin date.")>-1){
			console.log(report.reportHeader() +
			report.stepStatusWithData("Error message "+errorText+" is compared with ", "End date should be after begin date.", "success")
			+ report.reportFooter());
			done();
			}else{
			console.log(report.reportHeader() +
			report.stepStatusWithData("Error message "+errorText+" is compared with ", "End date should be after begin date.", "failure")
			+ report.reportFooter());
			}
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
					console.log("Nirmal   " + courseCreationStatus);
				}
				console.log("Nirmal   outside" + courseCreationStatus + courseCGI);
				browser
					.sleep(1000)
					.nodeify(done);
			});
	});

	it(". Wait and launch the course and refresh the page till the aggregation is completed ", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getCourseAggregationTimeOut());
		}
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

	it(". Handle EULA[End User Agreement Licence]", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		if (courseCreationStatus !== "failure") {
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
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
		}
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
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.clickOnGotItButton(browser).then(function() {
			done();
		});
	});

	it(". Validate total chapters are present on tiles view", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		chaptertile.validateTotalChapterPresentOnChapterTilesView(browser).then(function(totalChapterCount) {
			if (_.size(totalChapterCount) == productData.chapter.chapterCounts) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Total count of chapters " + productData.chapter.chapterCounts + " is compared with the chapter present on tiles view", _.size(totalChapterCount), "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Total count of chapters  " + productData.chapter.chapterCounts + " is compared with the chapter present on tiles view", _.size(totalChapterCount), "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Validate all chapters are not viewed for newly created course", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		chaptertile.getChapterViewedCount(browser).then(function(allChapterNotViewed) {
			if (_.size(allChapterNotViewed) == productData.chapter.chapterCounts) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("All " + productData.chapter.chapterCounts + " chapters is not viewed and compared with UI", _.size(allChapterNotViewed), "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("All " + productData.chapter.chapterCounts + " chapters is not viewed and compared with UI", _.size(allChapterNotViewed), "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Navigate to TOC ", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		tocPage.navigateToToc(browser).nodeify(done);
	});

	it(". Navigate to a Chapter", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		tocPage.getChapterTitle(productData.chapter.id, browser)
			.then(function(text) {
				text.should.contain(productData.chapter.title);
			})
			.then(function() {
				tocPage.navigateToAChapter(productData.chapter.id, browser)
					.nodeify(done);
			});
	});

	it(". Navigate to Chapter Review", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		tocPage.navigateToChapterReview(browser, productData.chapter.topic.studybit.keytermOnChapterReview.place, done);
	});

	it(". Accept the first time user message", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.clickOnCloseButtonOnNarrativeForFirstUser(browser).then(function() {
			done();
		});
	});

	it(". Wait until page is loaded successfully", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		pageLoadingTime = 0;
		takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
	});

	it(". Navigate to TOC ", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		tocPage.navigateToToc(browser).then(function() {
			done();
		});
	});

	it(". Validate text \"less than an hour ago\" appears below the viewed chapter tiles", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		chaptertile.chapterViewedMessageAppear(browser).then(function(chapterViewedMessage) {
			if (_.size(chapterViewedMessage)) {
				chaptertile.getChapterViewedCount(browser).then(function(viewedChapterCounts) {
					var viewedChapterCountAfterVisit = productData.chapter.chapterCounts - 1;
					if (_.size(viewedChapterCounts) == viewedChapterCountAfterVisit) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("TILES VIEW :: Now View chapter counts is " + _.size(chapterViewedMessage) + " and unvisited chapters count is", _.size(viewedChapterCounts), "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("TILES VIEW :: Now View chapter counts is " + _.size(chapterViewedMessage) + " and unvisited chapters count is", _.size(viewedChapterCounts), "failure") +
							report.reportFooter());
					}
				});
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("TILES VIEW :: Now View chapter counts is ", _.size(chapterViewedMessage), "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Click on List view ", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		tocPage.clickonlistview(browser, done);
	});

	it(". Validate text \"less than an hour ago\" appears below the viewed chapter on list view", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		chaptertile.chapterViewedMessageAppear(browser).then(function(chapterViewedMessage) {
			if (_.size(chapterViewedMessage)) {
				chaptertile.getChapterViewedCount(browser).then(function(viewedChapterCounts) {
					var viewedChapterCountAfterVisit = productData.chapter.chapterCounts - 1;
					if (_.size(viewedChapterCounts) == viewedChapterCountAfterVisit) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("LIST VIEW :: Now View chapter counts is " + _.size(chapterViewedMessage) + " and unvisited chapters count is", _.size(viewedChapterCounts), "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("LIST VIEW :: Now View chapter counts is " + _.size(chapterViewedMessage) + " and unvisited chapters count is", _.size(viewedChapterCounts), "failure") +
							report.reportFooter());
					}
				});
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("LIST VIEW :: Now View chapter counts is ", _.size(chapterViewedMessage), "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Expand the 1st chapter on list view", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		tocPage.navigateToAChapterThroughListView(productData.chapter.id, browser).then(function() {
			tocPage.verifyChapterExpanded(browser).then(function(expandedChapterStatus) {
				if (expandedChapterStatus) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("LIST VIEW :: Chapter is expanded", expandedChapterStatus, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("LIST VIEW :: Chapter expanded status", expandedChapterStatus, "failure") +
						report.reportFooter());
				}
			});
		});
	});

	it(". Click on tiles view ", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		tocPage.clickOnTilesView(browser).then(function() {
			done();
		});
	});

	it(". Validate the expanded chapter on list view is expanded on tiles view after navigation", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		tocPage.verifyChapterExpanded(browser).then(function(expandedChapterStatus) {
			if (expandedChapterStatus) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("TILE VIEW :: Chapter expanded status", expandedChapterStatus, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("TILE VIEW :: Chapter expanded status", expandedChapterStatus, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Log out as Instructor", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		userSignOut.userSignOut(browser, done);
	});

	it(". Log in as Instructor again", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		loginPage.loginToApplication(browser, userType, done);
	});

	it(". Click on manage my course", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.clickOnManageMyCourse(browser).then(function() {
			done();
		});
	});


	it(". Click on edit icon under manage my course", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		copyCoursePage.clickOnEditIcon(browser, newCourseName).then(function() {
			done();
		});
	});

	it(". Edit in the new Course name", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.editCourseName(browser, editedCourseName).then(function() {
			done();
		});
	});

	it(". Save the edited course details", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.saveTheCourseDetail(browser).then(function() {
			done();
		});
	});

	it(". Navigate to Instructor SSO", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		basicpo.navigateToInstructorDashboard(browser).then(function() {
			pageLoadingTime = 0;
			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
		});
	});

	it(". Select a Product", function(done) {
		brainPage.selectProduct(product, browser, done);
	});

	it(". Select a Course and launch", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		this.timeout(courseHelper.getElevatedTimeout());
		loginPage.launchACourse(userType, editedCourseName, browser, done);
	});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

	//Refer Bug id LTR-4776
	it.skip(" Validate the edited course should be reflect under manage my course page", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.verifyEditedCourseNameUnderManageMyCourse(browser).text().then(function(courseNameedited) {
			if (courseNameedited === editedCourseName) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Course is successfully edited and displayed under manage my course dropdown", courseNameedited, "success") +
					report.reportFooter());
				done();
			} else {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Course is successfully edited and displayed under manage my course dropdown", courseNameedited, "failure") +
					report.reportFooter());
			}
		});
	});

	it(". Log out as Instructor", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		userSignOut.userSignOut(browser, done);
	});


	it(". Log in as Instructor again", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		loginPage.loginToApplication(browser, userType, done);
	});


	it(". Click on manage my course", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		}
		createNewCoursepo.clickOnManageMyCourse(browser).then(function() {
			done();
		});
	});


	it(". Select the newly created course and delete it as part of cleanup", function(done) {
		if (courseCreationStatus === "failure") {
			this.timeout(courseHelper.getElevatedTimeout("timeoutForDependentFeature"));
		} else {
			this.timeout(courseHelper.getElevatedTimeout());
		}
		if (aggregationStatus !== "success") {
			console.log("inside course aggregation not equal to success");
			userSignOut.userSignOut(browser, done);
		} else {
			console.log("inside course delete else");
			clearAllSavedContent.clearCreatedCourse(browser, done, editedCourseName);
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
