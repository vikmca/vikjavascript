/**
 * Created by nbalasundaram on 10/2/15.
 */
var wd = require('wd');
var testData = require("../../../../test_data/data.json");

module.exports = {

    getCourseTimeOut: function () {
        var timeOut = 20000;
        if (process.env.RUN_ENV.toString() === "\"integration\"") {
            timeOut = testData.courseCreationTimeOut.integration;

        } else if (process.env.RUN_ENV.toString() === "\"staging\"") {
            timeOut = testData.courseCreationTimeOut.staging;

        } else if (process.env.RUN_ENV.toString() === "\"production\"") {
            timeOut = testData.courseCreationTimeOut.production;

        }
        return timeOut;
    },

    getCourseAggregationTimeOut: function () {
        var timeOut = 20000;
        if (process.env.RUN_ENV.toString() === "\"integration\"") {
            timeOut = testData.courseAggregationTimeOut.integration;

        } else if (process.env.RUN_ENV.toString() === "\"staging\"") {
            timeOut = testData.courseAggregationTimeOut.staging;

        } else if (process.env.RUN_ENV.toString() === "\"production\"") {
            timeOut = testData.courseAggregationTimeOut.production;

        }
        return timeOut;
    },
    getElevatedTimeout: function (page) {
        var timeOut = 75000;
        if (process.env.RUN_ENV.toString() === "\"integration\"") {
            timeOut = testData.timeout.default.integration;

        } else if (process.env.RUN_ENV.toString() === "\"staging\"") {
            timeOut = testData.timeout.default.staging;

        } else if (process.env.RUN_ENV.toString() === "\"production\"") {
            timeOut = testData.timeout.default.production;

        }
        if (page === "quiz") {
            timeOut = testData.timeout.quiz;
        } else if (page === "concepttracker") {
            timeOut = testData.timeout.concepttracker;
        } else if (page === "topicNavigation") {
            timeOut = testData.timeout.topicNavigation;
        } else if (page === "newStudentRegistration") {
            timeOut = testData.timeout.newStudentRegistration;
        } else if (page === "searchFeature") {
            timeOut = testData.timeout.searchFeature;
        } else if (page === "gradebook") {
            timeOut = testData.timeout.gradebook;
        } else if (page === "additionalLoadTimeFeature") {
            timeOut = testData.timeout.additionalLoadTimeFeature;
        } else if (page === "timeoutForDependentFeature") {
            timeOut = testData.timeout.timeoutForDependentFeature;
        } else if (page === "publisherFlashCardReviewDeck") {
            timeOut = testData.timeout.publisherFlashCardReviewDeck;
        }

        return timeOut;
    },

    getUniqueCourseName: function () {
        return  "Robot-Created : " + new Date();
    },
    getUniqueTACourseName: function () {
        return  "TA Course Robot-Created : " + new Date();
    }

};
