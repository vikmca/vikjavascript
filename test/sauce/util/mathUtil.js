/**
 * Created by nbalasundaram on 10/1/15.
 */
var _ = require('underscore');
module.exports = {

    getRandomInt: function (min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    },

    isEmpty: function(val){

      return (val === undefined || val == null || val.length == 0) ? true : false;
    },
    getScorePercentage: function(correctQuestionCount, totalQuestionCount){
      return ((parseInt(correctQuestionCount)*100)/totalQuestionCount);
    },
    getRoboClassAverage: function (firstitem,secondItem,thirdItem){
      var classAverage =  Math.round((firstitem+secondItem+thirdItem)/3);
      return classAverage;
    },
    getMaximum: function (numbers) {
      return _.max(numbers);
    },

    getScoreUptoOneDecimal: function(score){
      var systempoints = Math.round((score)*10)/10;
      return systempoints.toString();
    },

    getAverageScoreUptoOneDecimal: function(firstitem,secondItem,thirdItem){
      var systempoints = Math.round(((firstitem+secondItem+thirdItem)/3)*10)/10;
      return systempoints.toString();
    },

    getScoreOnOverride: function(maxPoint,totalQuestion,overridenScore){
      var systempoints = Math.round(((totalQuestion/maxPoint)*overridenScore)*10)/10;
      return systempoints.toString();
    }



};
