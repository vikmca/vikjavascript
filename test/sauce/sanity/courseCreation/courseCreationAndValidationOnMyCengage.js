    require('colors');
    var wd = require('wd');
    var dataUtil = require("../../util/date-utility");
    var stringutil = require("../../util/stringUtil");
    var pageobject = stringutil.getPlatform();
    var envName = stringutil.getEnvironment();
    var loginPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
    var session = require("../../support/setup/browser-session");
    var brainPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
    var createNewCoursepo = require("../../support/pageobject/" + pageobject + "/" + envName + "/createNewCoursepo");
    var testData = require("../../../../test_data/data.json");
    var clearAllSavedContent = require("../../support/pageobject/" + pageobject + "/" + envName + "/clearData");
    var courseHelper = require("../../support/helpers/courseHelper");
    var instructorGradebookForDropStudent = require("../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/dropStudentFromCourse");
    var report = require("../../support/reporting/reportgenerator");
    var userSignOut = require("../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
    var asserters = wd.asserters;
    var mathutil = require("../../util/mathUtil");
    var menuPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/menupo");
    var instructorGradebookNavigationPage = require("../../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/gradebookNavigationpo");
    var basicpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
    var copyCoursePage = require("../../support/pageobject/" + pageobject + "/" + envName + "/copyCoursepo.js")
    var dropCourseFromStudent = require("../../support/pageobject/" + pageobject + "/" + envName + "/dropCoursepo");
    var courseRegistrationpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/courseRegistrationpo.js");
    var takeQuizpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/takeQuizpo.js");
    var myCengageDashboardpo = require("../../support/pageobject/" + pageobject + "/" + envName + "/myCengageDashboardpo.js");
    var path = require('path');
    var scriptName = path.basename(__filename);
    describe(scriptName + 'MY CENGAGE ::  4LTR COURSE CREATION AND VALIDATION ON STUDENT AND INSTRUCTOR DASHBOARD FOR US REGION', function() {
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
    	var pageLoadingTime;
    	var product;
    	var totalTime;
    	var courseNameStatus;
    	var editedCourseNameStatus;
    	var firstname = "qa";
    	var lastname = "qa";
    	var serialNumber = 0;
    	var currentUrl;
    	var courseAggregationStatus = "failure";
    	var courseAggregatedStatus = false;
    	var errorMessageStatusSSO = false;

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
    		courseName = "Validation of MyCengage " + product;
    		editedCourseName = "Edited Course of MyCengage " + product;
    		//Reports
    		console.log(report.formatTestName("4LTR COURSE CREATION AND VALIDATION ON STUDENT AND INSTRUCTOR DASHBOARD FOR US REGION"));
    		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
    		console.log(report.formatTestScriptFileName("***CourseCreationAndValidationOnMyCengage.js***"));
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

    	it(". Login to 4LTR Platform as instructor", function(done) {
    		this.timeout(courseHelper.getElevatedTimeout());
    		loginPage.loginToApplicationForUSRegion(userType, browser, done);
    	});

    	it(". Select a Product", function(done) {
    		brainPage.selectProduct(product, browser, done);
    	});

    	it(". Validate logout button present on Instructor SSO dashboard", function() {
    		userSignOut.validateLogoutButtonStatusOnSSO(userType, browser).then(function(logoutButtonStatus) {
    			if (logoutButtonStatus) {
    				console.log(report.reportHeader() +
    					report.stepStatusWithData("Logout button status on instructor SSO dashboard", logoutButtonStatus, "success") +
    					report.reportFooter());
    				done();
    			} else {
    				console.log(report.reportHeader() +
    					report.stepStatusWithData("Logout button status on instructor SSO dashboard", logoutButtonStatus, "failure") +
    					report.reportFooter());
    			}
    		});
    	});

    	it(". Select a Course and launch if duplicate course is present on instructor dashboard", function(done) {
    		this.timeout(courseHelper.getElevatedTimeout());
    		loginPage.checkIfCoursePresent(browser, courseName).then(function(status) {
    			courseNameStatus = status;
    			if (courseNameStatus) {
    				loginPage.launchACourse(userType, courseName, browser, done);
    			} else {
    				console.log(report.reportHeader() +
    					report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
    					report.reportFooter());
    				userSignOut.signOutFromSSO(userType, browser).then(function() {
    					pageLoadingTime = 0;
    					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
    				});
    			}
    		});
    	});

    	it(". Navigate on GradeBook page if any duplicate course is present", function(done) {
    		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
    		if (courseNameStatus) {
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
    										menuPage.selectGradebook("instructor", browser, done);
    									});
    								});
    							} else {
    								menuPage.selectGradebook(userType, browser, done);
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
    		} else {
    			console.log(report.reportHeader() +
    				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
    				report.reportFooter());
    			done();
    		}
    	});

    	it(". Navigate to student's detailed GradeBook view and drop the student if any student is registered on duplicate course", function(done) {
    		if (courseNameStatus) {
    			if (courseAggregatedStatus) {
    				loginPage.getUserNameOfNewStudent(firstname, lastname);
    				console.log(loginPage.getUserNameOfNewStudent(firstname, lastname));
    				instructorGradebookNavigationPage.checkIfStudentIsPresent(browser, loginPage.getUserNameOfNewStudent(firstname, lastname)).then(function(studentNamePresentStatus) {
    					if (studentNamePresentStatus) {
    						instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserNameOfNewStudent(firstname, lastname)).then(function() {
    							instructorGradebookForDropStudent.clickOnDropStudentButton(browser).then(function() {
    								instructorGradebookForDropStudent.clickOnYesUnderDialogueBox(browser).text().then(function(mainGradebookPageText) {
    									userSignOut.userSignOut(browser, done);
    								});
    							});
    						});
    					} else {
    						console.log(report.reportHeader() +
    							report.stepStatusWithData("Student name is not present on instructor's gradebook", courseNameStatus, "success") +
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
    		} else {
    			console.log(report.reportHeader() +
    				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
    				report.reportFooter());
    			done();
    		}
    	});

    	it(". Login to 4LTR Platform as instructor", function(done) {
    		this.timeout(courseHelper.getElevatedTimeout());
    		loginPage.loginToApplicationForUSRegion(userType, browser, done);
    	});

    	it(". Select a Product", function(done) {
    		brainPage.selectProduct(product, browser, done);
    	});

    	it(". Select a Course and launch if duplicate course(edited course name) is present on instructor dashboard", function(done) {
    		this.timeout(courseHelper.getElevatedTimeout());
    		loginPage.checkIfCoursePresent(browser, editedCourseName).then(function(status) {
    			editedCourseNameStatus = status;
    			if (editedCourseNameStatus) {
    				loginPage.launchACourse(userType, editedCourseName, browser, done);
    			} else {
    				console.log(report.reportHeader() +
    					report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
    					report.reportFooter());
    				userSignOut.signOutFromSSO(userType, browser).then(function() {
    					pageLoadingTime = 0;
    					takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
    				});
    			}
    		});
    	});

    	it(". Navigate on GradeBook page if any duplicate course(edited course name) is present", function(done) {
    		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
    		if (editedCourseNameStatus) {
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
    		} else {
    			console.log(report.reportHeader() +
    				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", editedCourseNameStatus, "success") +
    				report.reportFooter());
    			done();
    		}
    	});

    	it(". Navigate to student's detailed GradeBook view and drop the student if any student is registered on duplicate course", function(done) {
    		if (editedCourseNameStatus) {
    			if (courseAggregatedStatus) {
    				loginPage.getUserNameOfNewStudent(firstname, lastname);
    				console.log(loginPage.getUserNameOfNewStudent(firstname, lastname));
    				instructorGradebookNavigationPage.checkIfStudentIsPresent(browser, loginPage.getUserNameOfNewStudent(firstname, lastname)).then(function(studentNamePresentStatus) {
    					if (studentNamePresentStatus) {
    						instructorGradebookNavigationPage.navigateToStudentDetailedPageOnGradebook(browser, loginPage.getUserNameOfNewStudent(firstname, lastname)).then(function() {
    							instructorGradebookForDropStudent.clickOnDropStudentButton(browser).then(function() {
    								instructorGradebookForDropStudent.clickOnYesUnderDialogueBox(browser).text().then(function(mainGradebookPageText) {
    									userSignOut.userSignOut(browser, done);
    								});
    							});
    						});
    					} else {
    						console.log(report.reportHeader() +
    							report.stepStatusWithData("Student name is not present on instructor's gradebook", editedCourseNameStatus, "success") +
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
    		} else {
    			console.log(report.reportHeader() +
    				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", editedCourseNameStatus, "success") +
    				report.reportFooter());
    			done();
    		}
    	});

    	it(". Login to 4LTR Platform as instructor", function(done) {
    		this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
    		userType = "instructor";
    		data = loginPage.setLoginData(userType);
    		console.log(report.printLoginDetails(data.userId, data.password));
    		loginPage.loginToApplicationForUSRegion(userType, browser, done);
    	});

    	it(". Select a Product", function(done) {
    		brainPage.selectProduct(product, browser, done);
    	});

    	it(". Click on manage my course", function(done) {
    		if (courseNameStatus || editedCourseNameStatus) {
    			createNewCoursepo.clickOnManageMyCourse(browser).then(function() {
    				done();
    			});
    		} else {
    			console.log(report.reportHeader() +
    				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus || editedCourseNameStatus, "success") +
    				report.reportFooter());
    			done();
    		}
    	});

    	it(". Select the newly created course and delete it as part of cleanup", function(done) {
    		this.timeout(courseHelper.getElevatedTimeout());
    		basicpo.getUrl(browser).then(function(currentLocationUrl) {
    			currentUrl = currentLocationUrl;
    		});
    		if (courseNameStatus) {
    			clearAllSavedContent.clearCreatedCourse(browser, done, courseName);
    		} else {
    			console.log(report.reportHeader() +
    				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus, "success") +
    				report.reportFooter());
    			done();
    		}
    	});

    	it(". Navigate to Instructor SSO", function(done) {
    		if (editedCourseNameStatus) {
    			basicpo.navigateToInstructorDashboard(browser).then(function() {
    				pageLoadingTime = 0;
    				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
    			});
    		} else {
    			console.log(report.reportHeader() +
    				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus || editedCourseNameStatus, "success") +
    				report.reportFooter());
    			done();
    		}
    	});

    	it(". Refresh the page and Wait for page load", function(done) {
    		if (editedCourseNameStatus) {
    			// browser.sleep(5000).get(currentUrl).then(function(){
    			browser.refresh().then(function() {
    				pageLoadingTime = 0;
    				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
    			});
    		} else {
    			console.log(report.reportHeader() +
    				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus || editedCourseNameStatus, "success") +
    				report.reportFooter());
    			done();
    		}
    	});

    	it(". Click on manage my course", function(done) {
    		if (editedCourseNameStatus) {
    			createNewCoursepo.clickOnManageMyCourse(browser).then(function() {
    				pageLoadingTime = 0;
    				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
    			});
    		} else {
    			console.log(report.reportHeader() +
    				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus || editedCourseNameStatus, "success") +
    				report.reportFooter());
    			done();
    		}
    	});

    	it(". Select the newly created course and delete it as part of cleanup", function(done) {
    		this.timeout(courseHelper.getElevatedTimeout());
    		if (editedCourseNameStatus) {
    			clearAllSavedContent.clearCreatedCourse(browser, done, editedCourseName);
    		} else {
    			console.log(report.reportHeader() +
    				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", editedCourseNameStatus, "success") +
    				report.reportFooter());
    			done();
    		}
    	});

    	it(". Navigate to Instructor SSO", function(done) {
    		if (courseNameStatus || editedCourseNameStatus) {
    			basicpo.navigateToInstructorDashboard(browser).then(function() {
    				pageLoadingTime = 0;
    				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
    			});
    		} else {
    			console.log(report.reportHeader() +
    				report.stepStatusWithData("Duplicate course is not present on instructor dashboard", courseNameStatus || editedCourseNameStatus, "success") +
    				report.reportFooter());
    			done();
    		}
    	});

    	it(". Click on create course link", function(done) {
    		createNewCoursepo.clickOnCreateCourseLink(browser).then(function() {
    			done();
    		});
    	});

    	it(". Select radio button to create a new course and click on continue button", function(done) {
    		createNewCoursepo.selectRadioForCourseType(browser).then(function() {
    			done();
    		});
    	});

    	it(". Fill in the new Course name and section", function(done) {
    		createNewCoursepo.enterCourseName(browser, courseName).then(function() {
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

    	it(". Fill the section name of the class", function(done) {
    		createNewCoursepo.enterSectionName(browser, "A").then(function() {
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
    					console.log("Nirmal   outside" + courseCreationStatus + courseCGI);
    					done();
    				}
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

    	if (courseAggregationStatus !== "success") {
    		console.log("in aggregated");

    		it(". EULA :: Click on cancel Button under EULA", function(done) {
    			if (courseAggregationStatus !== "failure") {
    				createNewCoursepo.clickOnCancelButtonUnderEula(browser).then(function() {
    					done();
    				});
    			} else {
    				done();
    			}
    		});

    		it(". Wait for page load", function(done) {
    			pageLoadingTime = 0;
    			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
    		});

    		it(". Validate Instructor is logged out when user clicks on 'Cancel' button under Eula", function(done) {
    			dropCourseFromStudent.checkIfStudentLoggedOut(browser).text().then(function(newStudentUserText) {
    				if (newStudentUserText === testData.DropCourseStudent.dropCourseFromStudent.dashboardTextIfNoCoursePresent) {
    					console.log(report.reportHeader() +
    						report.stepStatusWithData("Student is logged out of 4LTR online course and text displayed as :: ", newStudentUserText, "success") +
    						report.reportFooter());
    					done();
    				} else {
    					console.log(report.reportHeader() +
    						report.stepStatusWithData("Student is logged out of 4LTR online course and text displayed as  :: ", newStudentUserText, "failure") +
    						report.reportFooter());
    				}
    			});
    		});

    		it(". Login as Instructor again", function(done) {
    			userType = "instructor";
    			data = loginPage.setLoginData(userType);
    			console.log(report.printLoginDetails(data.userId, data.password));
    			loginPage.loginToApplicationForUSRegion(userType, browser, done);
    		});

    		it(". Select a Product", function(done) {
    			brainPage.selectProduct(product, browser, done);
    		});

    		it(". Validate created course name is present on instructor SSO dashboard", function(done) {
    			loginPage.validateCourseName(userType, courseName, browser).then(function(courseNameOnStudentStatus) {
    				if (courseNameOnStudentStatus) {
    					console.log(report.reportHeader() +
    						report.stepStatusWithData("Created course is present on student SSO dashboard", courseNameOnStudentStatus, "success") +
    						report.reportFooter());
    					done();
    				} else {
    					console.log(report.reportHeader() +
    						report.stepStatusWithData("Created course name is present on student SSO dashboard", courseNameOnStudentStatus, "failure") +
    						report.reportFooter());
    				}
    			});
    		});

    		it(". Select a Course and launch", function(done) {
    			this.timeout(courseHelper.getElevatedTimeout());
    			loginPage.launchACourse(userType, courseName, browser, done);
    		});

    		it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
    			loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
    		});

    		it(". Handle EULA(End User License Agreement )", function(done) {
    			if (courseAggregationStatus !== "failure") {
    				createNewCoursepo.handleEula(browser).then(function() {
    					done();
    				});
    			} else {
    				done();
    			}
    		});

    		it(". Click on 'GOT IT!' button", function(done) {
    			createNewCoursepo.clickOnGotItButton(browser).then(function() {
    				done();
    			});
    		});

    		it(". Validate the created course name should be reflect under manage my course page", function(done) {
    			createNewCoursepo.verifyEditedCourseNameUnderManageMyCourse(browser).text().then(function(createdCourseName) {
    				basicpo.getSectionName(browser).text().then(function(createdCourseSectionName) {
    					var courseNameOnDropDown = stringutil.returnValueAfterSplit(createdCourseName, "\n", 0);
    					if (courseNameOnDropDown === courseName && createdCourseSectionName === "SECTION: A") {
    						console.log(report.reportHeader() +
    							report.stepStatusWithData("Created course name " + courseNameOnDropDown + " and Section A are compared against the course displayed under manage my course dropdown", courseName + " and " + createdCourseSectionName, "success") +
    							report.reportFooter());
    						done();
    					} else {
    						console.log(report.reportHeader() +
    							report.stepStatusWithData("Created course name " + courseNameOnDropDown + " and Section A are compared against the course displayed under manage my course dropdown", courseName + " and " + createdCourseSectionName, "failure") +
    							report.reportFooter());
    					}
    				});
    			});
    		});

    		it(". Log out as Instructor", function(done) {
    			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
    			userSignOut.userSignOut(browser, done);
    		});

    		it(". Login to 4LTR Platform", function(done) {
    			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
    			userType = "mycengage";
    			data = loginPage.setLoginData(userType);
    			console.log(report.printLoginDetails(data.userId, data.password));
    			loginPage.loginToApplicationForUSRegion(userType, browser, done);
    		});

    		it(". Wait for page load", function(done) {
    			pageLoadingTime = 0;
    			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
    		});

    		it(". Validate the for US region My Cengage dashboard is displaying", function(done) {
    			myCengageDashboardpo.verifyMyCengageDashboard(browser).then(function(myCengagePageStatus) {
    				if (myCengagePageStatus) {
    					console.log(report.reportHeader() +
    						report.stepStatusWithData("My cengage dashboard is appearing for US region students", myCengagePageStatus, "success") +
    						report.reportFooter());
    					done();
    				} else {
    					console.log(report.reportHeader() +
    						report.stepStatusWithData("My cengage dashboard is appearing for US region students", myCengagePageStatus, "failure") +
    						report.reportFooter());
    				}
    			});
    		});


    		it(". Register the course key of newly created course", function(done) {
    			if (courseAggregationStatus !== "failure") {
    				basicpo.getUrl(browser).then(function(currentLocationUrl) {
    					currentUrl = currentLocationUrl;
    				});
    				myCengageDashboardpo.clickOnAddCourseLink(browser).then(function() {
    					myCengageDashboardpo.enterCourseKey(browser, coursekey).then(function() {
    						myCengageDashboardpo.clickOnSubmitBtn(browser).then(function() {
    							myCengageDashboardpo.enterTheNewCourse(browser, currentUrl).then(function() {
    								pageLoadingTime = 0;
    								takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
    							});
    						});
    					});
    				});
    			} else {
    				console.log("inside course aggregation not equal to success");
    				done();
    			}
    		});

    		it(". Validate created course name is present on student SSO dashboard", function(done) {
    			myCengageDashboardpo.validateCourseName(userType, courseName, browser).then(function(courseNameOnStudentStatus) {
    				if (courseNameOnStudentStatus) {
    					console.log(report.reportHeader() +
    						report.stepStatusWithData("Created course is present on student SSO dashboard", courseNameOnStudentStatus, "success") +
    						report.reportFooter());
    					done();
    				} else {
    					console.log(report.reportHeader() +
    						report.stepStatusWithData("Created course name is present on student SSO dashboard", courseNameOnStudentStatus, "failure") +
    						report.reportFooter());
    				}
    			});
    		});

    		it(". Select a Course and launch", function(done) {
    			this.timeout(courseHelper.getElevatedTimeout());
    			userType = "mycengage";
    			loginPage.launchACourseOfMyCengage(userType, courseName, browser, done);
    		});

    		it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
    			loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
    		});

    		it(". Handle EULA", function(done) {
    			createNewCoursepo.handleEula(browser).then(function() {
    				done();
    			});
    		});

    		it(". Click on 'GOT IT!' button", function(done) {
    			createNewCoursepo.clickOnGotItButton(browser).then(function() {
    				done();
    			});
    		});

    		it(". Log out as Student", function(done) {
    			userSignOut.userSignOut(browser, done);
    		});

    		it(". Log in as Instructor again", function(done) {
    			userType = "instructor";
    			data = loginPage.setLoginData(userType);
    			console.log(report.printLoginDetails(data.userId, data.password));
    			loginPage.loginToApplicationForUSRegion(userType, browser, done);
    		});

    		it(". Click on manage my course", function(done) {
    			createNewCoursepo.clickOnManageMyCourse(browser).then(function() {
    				pageLoadingTime = 0;
    				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
    			});
    		});

    		it(". Click on edit course under manage my course", function(done) {
    			console.log(editedCourseName);
    			console.log(courseName);
    			this.timeout(courseHelper.getElevatedTimeout());
    			copyCoursePage.clickOnEditIcon(browser, courseName).then(function() {
    				pageLoadingTime = 0;
    				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
    			});
    		});

    		it(". Edit Course name and section under manage my course", function(done) {
    			this.timeout(courseHelper.getElevatedTimeout());
    			createNewCoursepo.editCourseName(browser, editedCourseName).then(function() {
    				createNewCoursepo.editSectionName(browser, "B").then(function() {
    					done();
    				});
    			});
    		});

    		it(". Save the course details", function(done) {
    			createNewCoursepo.saveTheCourseDetail(browser).then(function() {
    				done();
    			});
    		});

    		it(". Launch a Course under manage course", function(done) {
    			this.timeout(courseHelper.getElevatedTimeout());
    			loginPage.launchCourseOnManageCourse(browser, editedCourseName, done);
    		});
    		// issue LTR-4776
    		it(". LTR-4776 : Validate the edited course name should be reflect under manage my course page", function(done) {
    			createNewCoursepo.verifyEditedCourseNameUnderManageMyCourse(browser).text().then(function(editedCourseNameOnManageCourse) {
    				basicpo.getSectionName(browser).text().then(function(editedCourseSectionName) {
    					var editedCourseNameOnDropDown = stringutil.returnValueAfterSplit(editedCourseNameOnManageCourse, "\n", 0);
    					if (editedCourseNameOnDropDown === editedCourseName && editedCourseSectionName === "SECTION: B") {
    						console.log(report.reportHeader() +
    							report.stepStatusWithData("Created course name " + editedCourseNameOnDropDown + " and Section B are compared against the course displayed under manage my course dropdown", editedCourseName + " and " + editedCourseSectionName, "success") +
    							report.reportFooter());
    						done();
    					} else {
    						console.log(report.reportHeader() +
    							report.stepStatusWithData("Created course name " + editedCourseNameOnDropDown + " and Section B are compared against the course displayed under manage my course dropdown", editedCourseName + " and " + editedCourseSectionName, "failure") +
    							report.reportFooter());
    						this.skip();
    					}
    				});
    			});
    		});

    		it(". Log out as Instructor", function(done) {
    			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
    			userSignOut.userSignOut(browser, done);
    		});

    		it(". Login to 4LTR Platform", function(done) {
    			this.timeout(courseHelper.getElevatedTimeout("additionalLoadTimeFeature"));
    			userType = "mycengage";
    			data = loginPage.setLoginData(userType);
    			console.log(report.printLoginDetails(data.userId, data.password));
    			loginPage.loginToApplicationForUSRegion(userType, browser, done);
    		});

    		it(". Validate edited course name is present on student SSO dashboard", function(done) {
    			myCengageDashboardpo.validateEditedCourseName(userType, editedCourseName, browser).then(function(courseNameOnStudentStatus) {
    				if (courseNameOnStudentStatus) {
    					console.log(report.reportHeader() +
    						report.stepStatusWithData("Created course is present on student SSO dashboard", courseNameOnStudentStatus, "success") +
    						report.reportFooter());
    					done();
    				} else {
    					console.log(report.reportHeader() +
    						report.stepStatusWithData("Created course name is not present on student SSO dashboard", courseNameOnStudentStatus, "failure") +
    						report.reportFooter());
    				}
    			});
    		});

    		it(". Click On Course", function(done) {
    			myCengageDashboardpo.clcikOnCourse(browser, editedCourseName).then(function() {
    				done();
    			});
    		});

    		it(". Select a Course and launch", function(done) {
    			this.timeout(courseHelper.getElevatedTimeout());
    			userType = "mycengage";
    			//   loginPage.launchACourseOfMyCengage(userType, editedCourseName, browser, done);
    			// issue at the time of executing scripts
    			loginPage.launchACourseOfMyCengageNow(userType, courseName, editedCourseName, browser, done);
    		});

    		it(". Wait for page load", function(done) {
    			pageLoadingTime = 0;
    			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
    		});

    		it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
    			loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
    		});

    		it(". Validate 'Drop Course' option is available in the profile drop-down list and click on drop down course option", function(done) {
    			dropCourseFromStudent.clickOnProfileDropdownList(browser).then(function() {
    				dropCourseFromStudent.checkIfDropCourseOptionIsAvailable(browser).text().then(function(dropCourseOptionText) {
    					dropCourseFromStudent.clickOnDropCourseOption(browser).then(function() {
    						if (dropCourseOptionText === testData.DropCourseStudent.dropCourseFromStudent.dropCourseOptionText) {
    							console.log(report.reportHeader() +
    								report.stepStatusWithData("Text of the Drop course option is displayed as :: ", dropCourseOptionText, "success") +
    								report.reportFooter());
    							done();
    						} else {
    							console.log(report.reportHeader() +
    								report.stepStatusWithData("Text of the Drop course option is displayed as :: ", dropCourseOptionText, "failure") +
    								report.reportFooter());
    						}
    					});
    				});
    			});
    		});

    		it(". Validate dialogue box contains 'Are you sure you want to drop this course?' ", function(done) {
    			dropCourseFromStudent.checkIfdialogueBoxContainsText(browser).text().then(function(dropCourseDialogboxText) {
    				if (dropCourseDialogboxText === testData.DropCourseStudent.dropCourseFromStudent.dialogueBoxContainsText) {
    					console.log(report.reportHeader() +
    						report.stepStatusWithData("Text on the dialogue box is :: ", dropCourseDialogboxText, "success") +
    						report.reportFooter());
    					done();
    				} else {
    					console.log(report.reportHeader() +
    						report.stepStatusWithData("Text on the dialogue box is :: ", dropCourseDialogboxText, "failure") +
    						report.reportFooter());
    				}
    			});
    		});

    		it(". Validate 'Yes' and 'Cancel' buttons text appears on dialogue box", function(done) {
    			dropCourseFromStudent.checkIfCancelButtonIsPresentOnDialogueBox(browser).then(function() {
    				dropCourseFromStudent.checkIfYesButtonIsPresentOnDialogueBox(browser).then(function() {
    					done();
    				});
    			});
    		});

    		it(". Validate after clicking yes then a dialogue window appears with confirmation text", function(done) {
    			dropCourseFromStudent.checkIfcourseIsDroppedanddialogueBoxAppears(browser).text().then(function(dialogBoxAfterCoursedropped) {
    				if (dialogBoxAfterCoursedropped === testData.DropCourseStudent.dropCourseFromStudent.dialogueBoxAfterCourseDroppedText) {
    					console.log(report.reportHeader() +
    						report.stepStatusWithData("::Dialogue window contains text as ", dialogBoxAfterCoursedropped, "success") +
    						report.reportFooter());
    					done();
    				} else {
    					console.log(report.reportHeader() +
    						report.stepStatusWithData(" :: Dialogue window contains text as ", dialogBoxAfterCoursedropped, "failure") +
    						report.reportFooter());
    				}
    			});
    		});

    		it(". Validate student is logged out when user clicks on 'OK' button", function(done) {
    			dropCourseFromStudent.checkIfOkButtonIsPresentOnDialogueBoxAfterCourseDropped(browser).then(function() {
    				dropCourseFromStudent.clickOnOkPresentOndialogueBox(browser).then(function() {
    					dropCourseFromStudent.checkIfStudentLoggedOut(browser).text().then(function(newStudentUserText) {
    						if (newStudentUserText === testData.DropCourseStudent.dropCourseFromStudent.dashboardTextIfNoCoursePresent) {
    							console.log(report.reportHeader() +
    								report.stepStatusWithData("Student is logged out of 4LTR online course and text displayed as :: ", newStudentUserText, "success") +
    								report.reportFooter());
    							done();
    						} else {
    							console.log(report.reportHeader() +
    								report.stepStatusWithData("Student is logged out of 4LTR online course and text displayed as  :: ", newStudentUserText, "failure") +
    								report.reportFooter());
    						}
    					});
    				});
    			});
    		});

    		it(". Login as student", function(done) {
    			userType = "mycengage";
    			data = loginPage.setLoginData(userType);
    			console.log(report.printLoginDetails(data.userId, data.password));
    			loginPage.loginToApplicationForUSRegion(userType, browser, done);
    		});

    		it(". Validate dropped course is not present on student dashboard", function(done) {
    			myCengageDashboardpo.validateEditedCourseName(userType, editedCourseName, browser).then(function(courseNameOnStudentStatus) {
    				if (!courseNameOnStudentStatus) {
    					console.log(report.reportHeader() +
    						report.stepStatusWithData("Student : Course is no longer available on dashboard ", courseNameOnStudentStatus, "success") +
    						report.reportFooter());
    					done();
    				} else {
    					console.log(report.reportHeader() +
    						report.stepStatusWithData("Student :Course is no longer available on dashboard ", courseNameOnStudentStatus, "failure") +
    						report.reportFooter());
    				}
    			});
    		});

    		it(". Validate logout button present on Student SSO dashboard", function() {
    			myCengageDashboardpo.validateLogoutButtonStatusOnSSO(userType, browser).then(function(logoutButtonStatus) {
    				if (logoutButtonStatus) {
    					console.log(report.reportHeader() +
    						report.stepStatusWithData("Logout button status on student SSO dashboard", logoutButtonStatus, "success") +
    						report.reportFooter());
    					done();
    				} else {
    					console.log(report.reportHeader() +
    						report.stepStatusWithData("Logout button status on student SSO dashboard", logoutButtonStatus, "failure") +
    						report.reportFooter());
    				}
    			});
    		});

    		it(". Logout as an student", function() {
    			myCengageDashboardpo.signOutFromSSO(userType, browser).then(function() {
    				pageLoadingTime = 0;
    				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
    			});
    		});
    	} else {
    		console.log(report.reportHeader() +
    			report.stepStatusWithData("Created course not aggregated with status " + courseAggregationStatus + "", "please check", "failure") +
    			report.reportFooter());
    	}

    	it(". Refresh the page and Wait for page load", function(done) {
    		browser.refresh().then(function() {
    			pageLoadingTime = 0;
    			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
    		});
    	});

    	it(". Log in as Instructor again", function(done) {
    		userType = "instructor";
    		data = loginPage.setLoginData(userType);
    		console.log(report.printLoginDetails(data.userId, data.password));
    		loginPage.loginToApplicationForUSRegion(userType, browser, done);
    	});

    	it(". Select a Product", function(done) {
    		brainPage.selectProduct(product, browser, done);
    	});

    	it(". Validate edited course name is present on instructor SSO dashboard", function(done) {
    		if (courseAggregationStatus !== "success") {
    			this.skip();
    		}
    		loginPage.validateCourseName(userType, editedCourseName, browser).then(function(courseNameOnStudentStatus) {
    			if (courseNameOnStudentStatus) {
    				console.log(report.reportHeader() +
    					report.stepStatusWithData("Created course is present on student SSO dashboard", courseNameOnStudentStatus, "success") +
    					report.reportFooter());
    				done();
    			} else {
    				console.log(report.reportHeader() +
    					report.stepStatusWithData("Created course name is present on student SSO dashboard", courseNameOnStudentStatus, "failure") +
    					report.reportFooter());
    				it.skip();
    			}
    		});
    	});

    	it(". Click on manage my course", function(done) {
    		createNewCoursepo.clickOnManageMyCourse(browser).then(function() {
    			done();
    		});
    	});

    	it(". Select the newly created course and delete it as part of cleanup", function(done) {
    		if (courseAggregationStatus === "success") {
    			clearAllSavedContent.clearCreatedCourse(browser, done, editedCourseName);
    		} else {
    			clearAllSavedContent.clearCreatedCourse(browser, done, courseName);
    		}
    	});

    	it(". Refresh the page and Wait for page load", function(done) {
    		if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString()) === "firefox") {
    			browser.sleep(3000).then(function() {
    				basicpo.getUrl(browser).then(function(currentLocationUrl) {
    					currentUrl = currentLocationUrl;
    					browser.sleep(5000).get(currentUrl).then(function() {
    						pageLoadingTime = 0;
    						takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
    					});
    				});
    			});
    		} else {
    			browser.refresh().then(function() {
    				pageLoadingTime = 0;
    				takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loaded");
    			});
    		}
    	});

    	it(". SSOFD-279 : Validate page is appearing without any error on refreshing the page after deleting the created courses", function(done) {
    		createNewCoursepo.validateErrorMessageStatusOnSSO(browser).then(function(errorMessageStatus) {
    			errorMessageStatusSSO = errorMessageStatus;
    			if (!errorMessageStatusSSO) {
    				console.log(report.reportHeader() +
    					report.stepStatusWithData("Page is appearing without any error ", errorMessageStatusSSO, "success") +
    					report.reportFooter());
    				done();
    			} else {
    				console.log(report.reportHeader() +
    					report.stepStatusWithData("Error message is appearing on page ", !errorMessageStatusSSO, "failure") +
    					report.reportFooter());
    			}
    		});
    	});

    	it(". Logout as an student", function() {
    		userSignOut.signOutFromSSO(userType, browser).then(function() {
    			pageLoadingTime = 0;
    			takeQuizpo.pollingPageLoad(pageLoadingTime, browser, done, "Page is loading");
    		});
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
