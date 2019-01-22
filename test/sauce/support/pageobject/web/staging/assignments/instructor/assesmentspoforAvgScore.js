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
    },

     getAvgPointsFromPercentage : function(percentage1, percentage2){
         var score1 = (((parseInt(percentage1)) * 30) / 100 );
         var score2 = (((parseInt(percentage2)) * 30) / 100 );
         var averagePoints = ((score1 + score2) / 2 );
         return averagePoints;
     },

    getAvgScoreAfterDropLowestScore: function(correctQuestionCount){
      var scoreValue = (correctQuestionCount * 30)/3;
        return scoreValue;
    },

    getAvgScoreAfterDropLowestScoreIf5Questions: function(correctQuestionCount){
      var scoreValue = (correctQuestionCount * 30)/5;
        return scoreValue;
    }
};
