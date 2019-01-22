var wd = require('wd');
var asserters = wd.asserters;
var _ = require('underscore');
var assessment = require('./assessmentspo');

module.exports = {

    selectAvgScore: function (browser) {
        return browser
            .waitForElementByXPath("//div[@class='score-type-radio ng-isolate-scope']//label[contains(text(),'Average Score')]|//label[contains(text(),'Average Score')]", asserters.isDisplayed, 10000)
            .click();
    },

    getRoboPointScore: function (correctanswers1stattempt, correctanswers2ndattempt, correctanswers3rdattempt) {
        var systempoints = ((parseInt(assessment.getAssignmentPoints()) / (parseInt(assessment.getMaxAssignmentQuestions()) * 3)) * ((parseInt(correctanswers1stattempt) + parseInt(correctanswers2ndattempt) + parseInt(correctanswers3rdattempt)))) ;
        return systempoints.toString();
    },

    getRoboPointForAverageScoreForAllScoreStrategy: function (correctanswers1stattempt, correctanswers2ndattempt) {
        var systempoints = ((parseInt(assessment.getAssignmentPoints()) / (parseInt(assessment.getMaxAssignmentQuestionsForAllScoreStrategy()) * 2)) * ((parseInt(correctanswers1stattempt) + parseInt(correctanswers2ndattempt)))) ;
        return systempoints.toString();
    }
};
