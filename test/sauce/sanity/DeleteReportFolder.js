require('colors');
var wd = require('wd');
var _ = require('underscore');
var asserters = wd.asserters;
var fs = require('fs');
var csv = require('fast-csv');
var chaiAsPromised = require("chai-as-promised");
var path = require('path');
var dataUtil = require("../util/date-utility");
var stringutil = require("../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var brainPage = require("../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var basicpo = require("../support/pageobject/" + pageobject + "/" + envName + "/basicpo");
var menuPage = require("../support/pageobject/" + pageobject + "/" + envName + "/menupo");
var calendarNavigation = require("../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/navigationpo");
var assessmentsPage = require("../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assessmentspo");
var assignmentAvgScore = require("../support/pageobject/" + pageobject + "/" + envName + "/assignments/instructor/assesmentspoforAvgScore");
var studentAssessmentsPage = require("../support/pageobject/" + pageobject + "/" + envName + "/assignments/student/studentassesmentspo");
var casPage = require("../support/pageobject/" + pageobject + "/" + envName + "/casTestPage");
var userSignOut = require("../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var mainGradebookView = require("../support/pageobject/" + pageobject + "/" + envName + "/gradebook/instructor/mainGradebookView");
var assessmentData = require("../../../test_data/assignments/assessments.json");
var managemydocspo = require("..//support/pageobject/" + pageobject + "/" + envName + "/managemydocspo");
var session = require("../support/setup/browser-session");
var testData = require("../../../test_data/data.json");
var courseHelper = require("../support/helpers/courseHelper");
var report = require("../support/reporting/reportgenerator");
var mathutil = require("../util/mathUtil");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'DELETE ALL MOCHA AWESOME HTML REPORTS', function() {
	var browser;
	var allPassed = true;
	var userType;
	var setDate;
	var courseName;
	var studentAssignmentCompletionStatus = "failure";
	var assignmentCreationStatus = "failure";
	var product;
	var scoreFromStudentGradebook;
	var pointsFromStudentGradebook;
	var totalPointsGainedByStudent;
	var totalsudentcount;
	var questionsCorrect1stattemptFromCAS;
	var questionsCorrect2ndattemptFromCAS;
	var questionsCorrect3rdattemptFromCAS;
	var exportedFile;
	var totalTime;
	var data;
	var temp;
	var FileText = [];
	var productData;
	var x;
	var userName;
	var filename;
	var downloadedFile;
	var productNameInDownloadedFile;
	var productNameAfterSplit;
	var serialNumber = 0;
	var reports = [];

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
			courseName = product + " " + courseHelper.getUniqueCourseName();
		}
		data = loginPage.setLoginData(userType);
		productData = loginPage.getProductData();
		totalTime = 0;
		console.log(report.formatTestScriptFileName("***DeleteReportFolder.js***"));
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

	it(". Delete the report files", function(done) {

		var htmlfile1 = '././././mochawesome-reports/GF_MediaQuiz_result.html';
		var jsonfile1 = '././././mochawesome-reports/GF_MediaQuiz_result.json';
		var htmlfile2 = '././././mochawesome-reports/GF_e2e_assignment_validation_Result.html';
		var jsonfile2 = '././././mochawesome-reports/GF_e2e_assignment_validation_Result.json';
		var htmlfile3 = '././././mochawesome-reports/Gruntfile_sanity_cengage_course_service.html';
		var jsonfile3 = '././././mochawesome-reports/Gruntfile_sanity_cengage_course_service.json';
		var htmlfile4 = '././././mochawesome-reports/GF_Smoke_Validation.html';
		var jsonfile4 = '././././mochawesome-reports/GF_Smoke_Validation.json';
		var htmlfile5 = '././././mochawesome-reports/GF_StudyBoardFeature_result.html';
		var jsonfile5 = '././././mochawesome-reports/GF_StudyBoardFeature_result.json';
		var htmlfile6 = '././././mochawesome-reports/GF_4LTR_Additional_features_validation.html';
		var jsonfile6 = '././././mochawesome-reports/GF_4LTR_Additional_features_validation.json';


		// var font1 = '././././mochawesome-reports/fonts/*.eot';
		// var font2 = '././././mochawesome-reports/fonts/*.svg';
		// var font3 = '././././mochawesome-reports/fonts/*.ttf';
		// var font4 = '././././mochawesome-reports/fonts/*.woff';
		fs.exists(htmlfile1, function(exists) {
			if (exists) {
				fs.unlink(htmlfile1, function(err) {
					if (err) {
						return console.error(err);
					}
					console.log("File deleted successfully!");
				});
			} else {
				console.log("No file to delete!");
			}
		});
		fs.exists(htmlfile2, function(exists) {
			if (exists) {
				fs.unlink(htmlfile2, function(err) {
					if (err) {
						return console.error(err);
					}
					console.log("File deleted successfully!");
				});
			} else {
				console.log("No file to delete!");
			}
		});
		fs.exists(htmlfile3, function(exists) {
			if (exists) {
				fs.unlink(htmlfile3, function(err) {
					if (err) {
						return console.error(err);
					}
					console.log("File deleted successfully!");
				});
			} else {
				console.log("No file to delete!");
			}
		});
		fs.exists(htmlfile4, function(exists) {
			if (exists) {
				fs.unlink(htmlfile4, function(err) {
					if (err) {
						return console.error(err);
					}
					console.log("File deleted successfully!");
				});
			} else {
				console.log("No file to delete!");
			}
		});
		fs.exists(htmlfile5, function(exists) {
			if (exists) {
				fs.unlink(htmlfile5, function(err) {
					if (err) {
						return console.error(err);
					}
					console.log("File deleted successfully!");
				});
			} else {
				console.log("No file to delete!");
			}
		});
		fs.exists(htmlfile6, function(exists) {
			if (exists) {
				fs.unlink(htmlfile6, function(err) {
					if (err) {
						return console.error(err);
					}
					console.log("File deleted successfully!");
				});
			} else {
				console.log("No file to delete!");
			}
		});
		fs.exists(jsonfile1, function(exists) {
			if (exists) {
				fs.unlink(jsonfile1, function(err) {
					if (err) {
						return console.error(err);
					}
					console.log("File deleted successfully!");
				});
			} else {
				console.log("No file to delete!");
			}
		});
		fs.exists(jsonfile2, function(exists) {
			if (exists) {
				fs.unlink(jsonfile2, function(err) {
					if (err) {
						return console.error(err);
					}
					console.log("File deleted successfully!");
				});
			} else {
				console.log("No file to delete!");
			}
		});
		fs.exists(jsonfile3, function(exists) {
			if (exists) {
				fs.unlink(jsonfile3, function(err) {
					if (err) {
						return console.error(err);
					}
					console.log("File deleted successfully!");
				});
			} else {
				console.log("No file to delete!");
			}
		});
		fs.exists(jsonfile4, function(exists) {
			if (exists) {
				fs.unlink(jsonfile4, function(err) {
					if (err) {
						return console.error(err);
					}
					console.log("File deleted successfully!");
				});
			} else {
				console.log("No file to delete!");
			}
		});
		fs.exists(jsonfile5, function(exists) {
			if (exists) {
				fs.unlink(jsonfile5, function(err) {
					if (err) {
						return console.error(err);
					}
					console.log("File deleted successfully!");
				});
			} else {
				console.log("No file to delete!");
			}
		});
		fs.exists(jsonfile6, function(exists) {
			if (exists) {
				fs.unlink(jsonfile6, function(err) {
					if (err) {
						return console.error(err);
					}
					console.log("File deleted successfully!");
				});
			} else {
				console.log("No file to delete!");
			}
		});
		// fs.exists(font1, function(exists) {
		// 	if (exists) {
		// 		fs.unlink(font1, function(err) {
		// 			if (err) {
		// 				return console.error(err);
		// 			}
		// 			console.log("File deleted successfully!");
		// 		});
		// 	} else {
		// 		console.log("No file to delete!");
		// 	}
		// });
		// fs.exists(font2, function(exists) {
		// 	if (exists) {
		// 		fs.unlink(font2, function(err) {
		// 			if (err) {
		// 				return console.error(err);
		// 			}
		// 			console.log("File deleted successfully!");
		// 		});
		// 	} else {
		// 		console.log("No file to delete!");
		// 	}
		// });
		// fs.exists(font3, function(exists) {
		// 	if (exists) {
		// 		fs.unlink(font3, function(err) {
		// 			if (err) {
		// 				return console.error(err);
		// 			}
		// 			console.log("File deleted successfully!");
		// 		});
		// 	} else {
		// 		console.log("No file to delete!");
		// 	}
		// });
		// fs.exists(font4, function(exists) {
		// 	if (exists) {
		// 		fs.unlink(font4, function(err) {
		// 			if (err) {
		// 				return console.error(err);
		// 			}
		// 			console.log("File deleted successfully!");
		// 		});
		// 	} else {
		// 		console.log("No file to delete!");
		// 	}
		// });
		data = loginPage.setLoginData(userType);
		//Reports
		console.log(report.printLoginDetails(data.userId, data.password));
		loginPage.loginToApplication(browser, userType, done);
	});

});
