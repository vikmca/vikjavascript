'use strict';

var _ = require('lodash');
var config = require('./config.json');
var runner = require('./runconfig');

var gruntConfig = {
	env: {
		options: {


		}
	},
	simplemocha: {
		ltr: {
			options: {
            reporter: 'mochawesome',
                  reporterOptions: {
                     reportName: 'GF_e2e_assignment_validation_Result'
                   },
            timeout: 120000,
            colors: true,
            summery: true,
            captureFile: 'GF_e2e_assignment_validation_Result.html', // Optionally capture the reporter output to a file
            quiet: false, // Optionally suppress output to standard out (defaults to false)
            clearRequireCache: true

            },


			src: [
				'test/sauce/sanity/DeleteReportFolder.js',
				"test/sauce/sanity/editCourseDetails.js",
				'test/sauce/sanity/assignment/assessment/validateAssessmentAlternativeScenarios.js', //fail on IE //pass on safari except drag //fail 14 //fail FF56
				'test/sauce/sanity/assignment/assessment/validateIWCAssessmentWithDifferentDueDate.js',//pass on safari
				'test/sauce/sanity/assignment/assessment/validateAssesmentsForAvgScore.js',//pass on Android safari //fail on refresh after change due date on mobile
				'test/sauce/sanity/assignment/chapterContent/validateAssignmentdraggingAndDueDate.js',//pass on Android and fail on drag assignment //fail FF56
				'test/sauce/sanity/assignment/assessment/validateIWillChooseQuestionAndDropLowestStrategyForAssessment.js',//pass on Android safari
				'test/sauce/sanity/assignment/assessment/editAssignmentAndResumeQuiz.js',//pass on Android safari
				'test/sauce/sanity/assignment/assessment/validateCreateAndEditCompleteAssignmentForCFM.js',//pass on Android safari
				'test/sauce/sanity/assignment/assessment/validateCreateAndEditCompleteAssignmentForIWC.js',// Pass today  on Android and safari
				'test/sauce/sanity/assignment/assessment/validateAssessmentRevealOnStudentAssignmentCalendarView.js',//pass on Android safari
				'test/sauce/sanity/assignment/docsAndLinks/validateDocsAndLinksAssignmentRevealOnStudentAssignmentCalendarView.js',//pass on Android safari// fail on mobile
				'test/sauce/sanity/assignment/chapterContent/validateChapterContentAssignmentRevealOnStudentAssignmentCalendarView.js',//pass on Android safari
				'test/sauce/sanity/assignment/validateAssignmentOrderingOnInstructorStudentCalendar.js',//pass on Android safari
				'test/sauce/sanity/assignment/addAssignmentFromListView.js',//pass on Android safari
				'test/sauce/sanity/assignment/assessment/validateAssessmentForHighScore.js',//pass on Android safar //fail 2
				'test/sauce/sanity/assignment/assessment/validateGradesOnFutureDateAssignments.js',//pass on safari
				'test/sauce/sanity/assignment/assessment/validateAssessmentForDifferentScoreStrategy.js',
				'test/sauce/sanity/assignment/assessment/ValidateInstructorAndStudentAssignmentCalender.js',//continued fixing this class file
			]
		}
	},
	jshint: {
		options: {
			jshintrc: '.jshintrc'
		},
		// gruntfile: {
		//     src: 'Gruntfile.js'
		// },
		test: {
			options: {
				jshintrc: 'test/.jshintrc'
			},
			//src: ['test/sauce/sanity/validateAssesmentsForAvgScore.js']
		}
	},
	concurrent: {
		'test-sauce': [] // dynamically filled
	},
	watch: {
		gruntfile: {
			files: '<%= jshint.gruntfile.src %>',
			tasks: ['jshint:gruntfile']
		},
		test: {
			files: '<%= jshint.test.src %>',
			tasks: ['jshint:test']
		}
	},

	exec: {
		generate_report: {
			cmd: function() {
				return 'xmljade -o reportjade.html report.jade jadexml.xml';
			}
		}
	}


};


//console.log(gruntConfig);

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig(gruntConfig);

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-env');
	grunt.loadNpmTasks('grunt-simple-mocha');
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-exec');

	var target = grunt.option('target') || config.target;
	var product = grunt.option('product') || config.product;
	var course = grunt.option('course') || config.course;
	var student_userid = grunt.option('student_userid') || config.student_userid;
	var instructor_userid = grunt.option('instructor_userid') || config.instructor_userid;
	var coursekey = grunt.option('coursekey') || config.coursekey;
	var cs = grunt.option('cs') || config.cs;
	var rc = grunt.option('rc') || config.rc;
	var sel_grid = grunt.option('grid') || config.grid;
	var browser = grunt.option('browser') || config.browser;
	var index = grunt.option('index') || config.index;
	var courseindex = grunt.option('courseindex') || config.courseindex;
	var coursetype = grunt.option('type') || config.type;
	var screenshot = grunt.option('screenshot') || config.screenshot;
	var noOfStudent = grunt.option('noOfStudent') || config.noOfStudent;
	var keyWordForId = grunt.option('keyWordForId') || config.keyWordForId;
	var region = grunt.option('region') || config.region;
	//for mobile android device
	var platform = grunt.option('platform') || config.platform;
	var platformName = grunt.option('platformname') || config.platformName;
	var udid = grunt.option('udid') || config.udid;
	var deviceName = grunt.option('deviceName') || config.deviceName;
	var platformVersion = grunt.option('platformVersion') || config.platformVersion;
//for iOS
	var iosbrowser = grunt.option('iosbrowser') || config.iosbrowser;
	var iosplatformName = grunt.option('iosplatformName') || config.iosplatformName;
	var bundleId = grunt.option('bundleId') || config.bundleId;
	var iosdeviceName = grunt.option('iosdeviceName') || config.iosdeviceName;
	var iosplatformVersion = grunt.option('iosplatformVersion') || config.iosplatformVersion;
	var automationName = grunt.option('automationName') || config.automationName;
	var practiceQuizAttemptCount = grunt.option('practiceQuizAttemptCount') || config.practiceQuizAttemptCount;
	gruntConfig.env.common = {

		RUNNER: JSON.stringify(runner),
		RUN_ENV: JSON.stringify(target),
		RUN_IN_GRID: JSON.stringify(sel_grid),
		RUN_IN_BROWSER: JSON.stringify(browser),
		RUN_FOR_PRODUCT: JSON.stringify(product),
		RUN_FOR_COURSE: JSON.stringify(course),
		RUN_FOR_STUDENT_USERID: JSON.stringify(student_userid),
		RUN_FOR_INSTRUCTOR_USERID: JSON.stringify(instructor_userid),
		PRACTICE_QUIZ_ATTEMPT_COUNT: JSON.stringify(practiceQuizAttemptCount),
		RUN_FOR_COURSEKEY: JSON.stringify(coursekey),
		CREATE_STUDENT: JSON.stringify(cs),
		REGISTER_COURSE: JSON.stringify(rc),
		RUN_INDEX: JSON.stringify(index),
		COURSE_INDEX: JSON.stringify(courseindex),
		COURSE_TYPE: JSON.stringify(coursetype),
		SCREENSHOT_STATUS: JSON.stringify(screenshot),
		RUN_IN_PLATFORM: JSON.stringify(platform),
		RUN_IN_PLATFORMNAME: JSON.stringify(platformName),
		RUN_IN_UDID: JSON.stringify(udid),
		RUN_IN_DEVICENAME: JSON.stringify(deviceName),
		RUN_IN_NOOFSTUDENT: JSON.stringify(noOfStudent),
		RUN_IN_KEYWORDFORID: JSON.stringify(keyWordForId),
		RUN_FOR_REGION: JSON.stringify(region),
		RUN_FOR_PLATFORMVERSION: JSON.stringify(platformVersion),
		RUN_IN_IOS_BROWSER: JSON.stringify(iosbrowser),
		RUN_IN_IOS_PLATFORMNAME: JSON.stringify(iosplatformName),
		RUN_IN_BUNDLEID: JSON.stringify(bundleId),
		RUN_IN_IOS_DEVICENAME: JSON.stringify(iosdeviceName),
		RUN_FOR_IOS_PLATFORMVERSION: JSON.stringify(iosplatformVersion),
		RUN_FOR_AUTOMATIONNAME: JSON.stringify(automationName)

	};


	grunt.registerTask('default', ['jshint:test', 'env:common', 'simplemocha:ltr']);
};
