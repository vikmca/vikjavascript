/**
 * Created by nbalasundaram on 10/1/15.
 */

module.exports = {


    removeBoundaryQuotes: function (value) {
        var stringCount = value.length - 1;
        var newString = value.slice(1, stringCount);
        return newString;
    },

    returnValueAfterSplit: function(string, delimeter ,index){
    	var x = string.split(delimeter)[index];
    	return x;
    },

    returnSubstring: function(string, start, end){
      var subString= string.substr(start, end);
      return subString;
    },
    returnreplacedstring : function(str, substr, newstr){
      var subString= str.replace(substr, newstr);
      return subString;
    },
    returnStringIndex: function(string,subString){
      var endPoint= string.indexOf(subString);
      return endPoint;
    },
    getTextOnAssignmentDetailedViewOnGragebook: function(attemptCount, score){
      return "Attempt "+attemptCount+" - "+score+"%";
    },

    getPlatform: function(){
      if(this.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString())=="mobile"){
        return "mobile";
      }else if(this.removeBoundaryQuotes(process.env.RUN_IN_PLATFORM.toString())=="iOS"){
          return "iOS";
      } else {
        return "web";
      }
    },

    getEnvironment: function(){
      if(this.removeBoundaryQuotes(process.env.RUN_ENV.toString())=="production"){
        return "production";
      }else if(this.removeBoundaryQuotes(process.env.RUN_ENV.toString())=="staging"){
        return "staging";
      }else {
        return "integration";
      }
    }

};
