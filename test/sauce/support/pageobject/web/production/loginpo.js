var intTestData = require("../../../../../../test_data/int.json");
var intSelfStudyTestData = require("../../../../../../test_data/intselfstudy.json");
var prodSelfStudyTestData = require("../../../../../../test_data/prodselfstudy.json");
var stageSelfStudyTestData = require("../../../../../../test_data/stageselfstudy.json");
var stagingTestData = require("../../../../../../test_data/staging.json");
var prodTestData = require("../../../../../../test_data/prod.json");
var stageTestDataForGateway = require("../../../../../../test_data/gatewayintegration.json");
var productData = require("../../../../../../test_data/products.json");
var testData = require("../../../../../../test_data/data.json");
var report = require("../../../../support/reporting/reportgenerator");
var stringutil = require("../../../../util/stringUtil");
var mathutil = require("../../../../util/mathUtil");
var dateutil = require("../../../../util/date-utility");
var _ = require('underscore');
var wd = require('wd');
var asserters = wd.asserters;

var data = {
    urlForLogin: "default",
    userId: "default",
    password: "default",
    firstname: "default",
    lastname: "default"
};

var cengageBrain;
var cengageBrainUrl;
var currentUserType;
var listOfUsersIndex = Object.keys(intTestData.users.instructor);
var differenceOfIndexListAndGivenIndex = [];
var randomIndexForDifferentInstructor;

module.exports = {

    setLoginData: function (userType) {
        currentUserType = userType;
        if (process.env.RUN_ENV.toString() === "\"integration\"") {
                data.urlForLogin = intTestData.integration_url;
                data.urlForCookies = intTestData.urlForCookies;
                data.cengageBrainUrl = intTestData.cengagebrain;

            } else if (process.env.RUN_ENV.toString() === "\"staging\"") {
                data.urlForLogin = stagingTestData.staging_url;
                data.urlForCookies = stagingTestData.urlForCookies;
                 data.cengageBrainUrl = stagingTestData.cengagebrain;

            } else if (process.env.RUN_ENV.toString() === "\"production\"") {
                data.urlForLogin = prodTestData.prod_url;
                data.urlForCookies = prodTestData.urlForCookies;
                data.cengageBrainUrl = prodTestData.cengagebrain;
            }

        if (userType === "instructor") {

            if (typeof process.env.RUN_FOR_INSTRUCTOR_USERID != 'undefined') {

                if (stringutil.removeBoundaryQuotes(process.env.RUN_FOR_INSTRUCTOR_USERID.toString()) != 'default') {
                    //console.log("Overriding the test config instructor with a runtime instructor" + process.env.RUN_FOR_INSTRUCTOR_USERID.toString());
                    data.userId = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_INSTRUCTOR_USERID.toString());
                    data.password = "T3sting";
                    return data;
                }
            }
            if (typeof process.env.RUN_INDEX != 'undefined') {
                //console.log("Overriding the test config instructor with a runtime instructor index" + process.env.RUN_INDEX.toString());
                if (process.env.RUN_ENV.toString() === "\"integration\"") {

                    data.userId = intTestData.users.instructor[process.env.RUN_INDEX].credentials.username;
                    data.password = intTestData.users.instructor[process.env.RUN_INDEX].credentials.password;

                } else if (process.env.RUN_ENV.toString() === "\"staging\"") {

                    data.userId = stagingTestData.users.instructor[process.env.RUN_INDEX].credentials.username;
                    data.password = stagingTestData.users.instructor[process.env.RUN_INDEX].credentials.password;

                } else if (process.env.RUN_ENV.toString() === "\"production\"") {

                    data.userId = prodTestData.users.instructor[process.env.RUN_INDEX].credentials.username;
                    data.password = prodTestData.users.instructor[process.env.RUN_INDEX].credentials.password;
                }
                return data;
            }

            if (process.env.RUN_ENV.toString() === "\"integration\"") {

                data.userId = intTestData.users.instructor[0].credentials.username;
                data.password = intTestData.users.instructor[0].credentials.password;

            } else if (process.env.RUN_ENV.toString() === "\"staging\"") {

                data.userId = stagingTestData.users.instructor[0].credentials.username;
                data.password = stagingTestData.users.instructor[0].credentials.password;

            } else if (process.env.RUN_ENV.toString() === "\"production\"") {

                data.userId = prodTestData.users.instructor[0].credentials.username;
                data.password = prodTestData.users.instructor[0].credentials.password;
            }

        } else if (userType == "differentInstructor") {

            if (process.env.RUN_ENV.toString() === "\"integration\"") {

                data.userId = intTestData.users.instructor[3].credentials.username;
                data.password = intTestData.users.instructor[3].credentials.password;

            } else if (process.env.RUN_ENV.toString() === "\"staging\"") {

                data.userId = stagingTestData.users.instructor[2].credentials.username;
                data.password = stagingTestData.users.instructor[2].credentials.password;

            } else if (process.env.RUN_ENV.toString() === "\"production\"") {

                data.userId = prodTestData.users.instructor[4].credentials.username;
                data.password = prodTestData.users.instructor[4].credentials.password;
                // listOfUsersIndex = Object.keys(prodTestData.users.instructor);
                // differenceOfIndexListAndGivenIndex = _.difference(listOfUsersIndex, [process.env.RUN_INDEX]);
                // console.log(differenceOfIndexListAndGivenIndex);
                // randomIndexForDifferentInstructor = differenceOfIndexListAndGivenIndex[Math.floor(Math.random()*differenceOfIndexListAndGivenIndex.length)];
                // console.log("randomIndexForDifferentInstructor"+randomIndexForDifferentInstructor);
                //
                // data.userId = prodTestData.users.instructor[randomIndexForDifferentInstructor].credentials.username;
                // data.password = prodTestData.users.instructor[randomIndexForDifferentInstructor].credentials.password;
            }
        }
        else if (userType == "newStudent") {
            if (process.env.RUN_ENV.toString() === "\"integration\"") {

                data.userId = this.generateStudentId();
                data.password = "T3sting";
                data.firstname = "TestBot";
                data.lastname = "Robo";

            } else if (process.env.RUN_ENV.toString() === "\"staging\"") {

                data.userId = this.generateStudentId();
                data.password = "T3sting";
                data.firstname = "TestBot";
                data.lastname = "Robo";

            } else if (process.env.RUN_ENV.toString() === "\"production\"") {

                data.userId = this.generateStudentId();
                data.password = "T3sting";
                data.firstname = "TestBot";
                data.lastname = "Robo";

            }


        }
        else if (userType == "studentA" || userType == "studentB") {
          var index;
          if(userType == "studentA"){
            index = 0
          }else {
            index = 1;
          }
            if (process.env.RUN_ENV.toString() === "\"integration\"") {

                data.userId = intTestData.custom.students.multipleInSingleCourse[index].credentials.username;
                data.password = intTestData.custom.students.multipleInSingleCourse[index].credentials.password;
                data.firstname = intTestData.custom.students.multipleInSingleCourse[index].credentials.firstname;
                data.lastname = intTestData.custom.students.multipleInSingleCourse[index].credentials.lastname;

            } else if (process.env.RUN_ENV.toString() === "\"staging\"") {

              data.userId = stagingTestData.custom.students.multipleInSingleCourse[index].credentials.username;
              data.password = stagingTestData.custom.students.multipleInSingleCourse[index].credentials.password;
              data.firstname = stagingTestData.custom.students.multipleInSingleCourse[index].credentials.firstname;
              data.lastname = stagingTestData.custom.students.multipleInSingleCourse[index].credentials.lastname;

            } else if (process.env.RUN_ENV.toString() === "\"production\"") {

              data.userId = prodTestData.custom.students.multipleInSingleCourse[index].credentials.username;
              data.password = prodTestData.custom.students.multipleInSingleCourse[index].credentials.password;
              data.firstname = prodTestData.custom.students.multipleInSingleCourse[index].credentials.firstname;
              data.lastname = prodTestData.custom.students.multipleInSingleCourse[index].credentials.lastname;

            }


        }

        else if (userType == "mycengage") {
            if (process.env.RUN_ENV.toString() === "\"integration\"") {

                data.userId = intTestData.custom.students.mycengage[0].credentials.username;
                data.password = intTestData.custom.students.mycengage[0].credentials.password;
                data.firstname = intTestData.custom.students.mycengage[0].credentials.firstname;
                data.lastname = intTestData.custom.students.mycengage[0].credentials.lastname;

            } else if (process.env.RUN_ENV.toString() === "\"staging\"") {

              data.userId = stagingTestData.custom.students.mycengage[0].credentials.username;
              data.password = stagingTestData.custom.students.mycengage[0].credentials.password;
              data.firstname = stagingTestData.custom.students.mycengage[0].credentials.firstname;
              data.lastname = stagingTestData.custom.students.mycengage[0].credentials.lastname;

            } else if (process.env.RUN_ENV.toString() === "\"production\"") {

              data.userId = prodTestData.custom.students.mycengage[0].credentials.username;
              data.password = prodTestData.custom.students.mycengage[0].credentials.password;
              data.firstname = prodTestData.custom.students.mycengage[0].credentials.firstname;
              data.lastname = prodTestData.custom.students.mycengage[0].credentials.lastname;

            }


        }

        else if (userType == "TA" || userType == "student_ToRegister" || userType == "studentTA") {
            var index;
            if(userType == "TA"){
              index = 0
            }else if(userType == "student_ToRegister") {
              index = 1;
            }else {
              index = 2;
            }
            if (process.env.RUN_ENV.toString() === "\"integration\"") {

              data.userId = intTestData.custom.students.TA[index].credentials.username;
              data.password = intTestData.custom.students.TA[index].credentials.password;
              data.firstname = intTestData.custom.students.TA[index].credentials.firstname;
              data.lastname = intTestData.custom.students.TA[index].credentials.lastname;

            } else if (process.env.RUN_ENV.toString() === "\"staging\"") {

              data.userId = stagingTestData.custom.students.TA[index].credentials.username;
              data.password = stagingTestData.custom.students.TA[index].credentials.password;
              data.firstname = stagingTestData.custom.students.TA[index].credentials.firstname;
              data.lastname = stagingTestData.custom.students.TA[index].credentials.lastname;

            } else if (process.env.RUN_ENV.toString() === "\"production\"") {

              data.userId = prodTestData.custom.students.TA[index].credentials.username;
              data.password = prodTestData.custom.students.TA[index].credentials.password;
              data.firstname = prodTestData.custom.students.TA[index].credentials.firstname;
              data.lastname = prodTestData.custom.students.TA[index].credentials.lastname;
            }
        }
        else if (userType == "studentforProductSpecific") {

            if (process.env.RUN_ENV.toString() === "\"integration\"") {

              data.userId = intTestData.custom.students.productSpecific[0].credentials.username;
              data.password = intTestData.custom.students.productSpecific[0].credentials.password;
              data.firstname = intTestData.custom.students.productSpecific[0].credentials.firstname;
              data.lastname = intTestData.custom.students.productSpecific[0].credentials.lastname;

            } else if (process.env.RUN_ENV.toString() === "\"staging\"") {

              data.userId = stagingTestData.custom.students.productSpecific[0].credentials.username;
              data.password = stagingTestData.custom.students.productSpecific[0].credentials.password;
              data.firstname = stagingTestData.custom.students.productSpecific[0].credentials.firstname;
              data.lastname = stagingTestData.custom.students.productSpecific[0].credentials.lastname;

            } else if (process.env.RUN_ENV.toString() === "\"production\"") {
              data.userId = prodTestData.custom.students.productSpecific[0].credentials.username;
              data.password = prodTestData.custom.students.productSpecific[0].credentials.password;
              data.firstname = prodTestData.custom.students.productSpecific[0].credentials.firstname;
              data.lastname = prodTestData.custom.students.productSpecific[0].credentials.lastname;
            }
        } else if (userType == "studentforDropCourse") {

            if (process.env.RUN_ENV.toString() === "\"integration\"") {

              data.userId = intTestData.custom.students.dropCourse[0].credentials.username;
              data.password = intTestData.custom.students.dropCourse[0].credentials.password;
              data.firstname = intTestData.custom.students.dropCourse[0].credentials.firstname;
              data.lastname = intTestData.custom.students.dropCourse[0].credentials.lastname;

            } else if (process.env.RUN_ENV.toString() === "\"staging\"") {
              data.userId = stagingTestData.custom.students.dropCourse[0].credentials.username;
              data.password = stagingTestData.custom.students.dropCourse[0].credentials.password;
              data.firstname = stagingTestData.custom.students.dropCourse[0].credentials.firstname;
              data.lastname = stagingTestData.custom.students.dropCourse[0].credentials.lastname;

            } else if (process.env.RUN_ENV.toString() === "\"production\"") {
              data.userId = prodTestData.custom.students.dropCourse[0].credentials.username;
              data.password = prodTestData.custom.students.dropCourse[0].credentials.password;
              data.firstname = prodTestData.custom.students.dropCourse[0].credentials.firstname;
              data.lastname = prodTestData.custom.students.dropCourse[0].credentials.lastname;
            }
        }
        else if (userType == "studentforDropStudent") {

            if (process.env.RUN_ENV.toString() === "\"integration\"") {

              data.userId = intTestData.custom.students.dropCourse[1].credentials.username;
              data.password = intTestData.custom.students.dropCourse[1].credentials.password;
              data.firstname = intTestData.custom.students.dropCourse[1].credentials.firstname;
              data.lastname = intTestData.custom.students.dropCourse[1].credentials.lastname;

            } else if (process.env.RUN_ENV.toString() === "\"staging\"") {
              data.userId = stagingTestData.custom.students.dropCourse[1].credentials.username;
              data.password = stagingTestData.custom.students.dropCourse[1].credentials.password;
              data.firstname = stagingTestData.custom.students.dropCourse[1].credentials.firstname;
              data.lastname = stagingTestData.custom.students.dropCourse[1].credentials.lastname;

            } else if (process.env.RUN_ENV.toString() === "\"production\"") {
              data.userId = prodTestData.custom.students.dropCourse[1].credentials.username;
              data.password = prodTestData.custom.students.dropCourse[1].credentials.password;
              data.firstname = prodTestData.custom.students.dropCourse[1].credentials.firstname;
              data.lastname = prodTestData.custom.students.dropCourse[1].credentials.lastname;
            }
        }
        else if (userType === "student") {

            if (typeof process.env.RUN_FOR_STUDENT_USERID != 'undefined') {

                if (stringutil.removeBoundaryQuotes(process.env.RUN_FOR_STUDENT_USERID.toString()) != 'default') {
                    // console.log("Overriding the test config student with a custom student" + process.env.RUN_FOR_STUDENT_USERID.toString());
                    data.userId = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_STUDENT_USERID.toString());
                    data.password = "T3sting";
                    data.firstname = "TestBot";
                    data.lastname = "Robo";
                    return data;
                }
            }

            if (typeof process.env.RUN_INDEX != 'undefined') {
                if (process.env.RUN_ENV.toString() === "\"integration\"") {

                    data.userId = intTestData.users.student[process.env.RUN_INDEX].credentials.username;
                    data.password = intTestData.users.student[process.env.RUN_INDEX].credentials.password;
                    data.firstname = intTestData.users.student[process.env.RUN_INDEX].credentials.firstname;
                    data.lastname = intTestData.users.student[process.env.RUN_INDEX].credentials.lastname;

                } else if (process.env.RUN_ENV.toString() === "\"staging\"") {

                    data.userId = stagingTestData.users.student[process.env.RUN_INDEX].credentials.username;
                    data.password = stagingTestData.users.student[process.env.RUN_INDEX].credentials.password;
                    data.firstname = stagingTestData.users.student[process.env.RUN_INDEX].credentials.firstname;
                    data.lastname = stagingTestData.users.student[process.env.RUN_INDEX].credentials.lastname;

                } else if (process.env.RUN_ENV.toString() === "\"production\"") {

                    data.userId = prodTestData.users.student[process.env.RUN_INDEX].credentials.username;
                    data.password = prodTestData.users.student[process.env.RUN_INDEX].credentials.password;
                    data.firstname = prodTestData.users.student[process.env.RUN_INDEX].credentials.firstname;
                    data.lastname = prodTestData.users.student[process.env.RUN_INDEX].credentials.lastname;

                }
                return data;

            }


            if (process.env.RUN_ENV.toString() === "\"integration\"") {

                data.userId = intTestData.users.student[0].credentials.username;
                data.password = intTestData.users.student[0].credentials.password;
                data.firstname = intTestData.users.student[0].credentials.firstname;
                data.lastname = intTestData.users.student[0].credentials.lastname;

            } else if (process.env.RUN_ENV.toString() === "\"staging\"") {

                data.userId = stagingTestData.users.student[0].credentials.username;
                data.password = stagingTestData.users.student[0].credentials.password;
                data.firstname = stagingTestData.users.student[0].credentials.firstname;
                data.lastname = stagingTestData.users.student[0].credentials.lastname;

            } else if (process.env.RUN_ENV.toString() === "\"production\"") {

                data.userId = prodTestData.users.student[0].credentials.username;
                data.password = prodTestData.users.student[0].credentials.password;
                data.firstname = prodTestData.users.student[0].credentials.firstname;
                data.lastname = prodTestData.users.student[0].credentials.lastname;
            }

        }
        else if (userType === "selfstudy") {

            if (typeof process.env.RUN_FOR_STUDENT_USERID != 'undefined') {
                if (stringutil.removeBoundaryQuotes(process.env.RUN_FOR_STUDENT_USERID.toString()) != 'default') {
                    // console.log("Overriding the test config student with a custom student" + process.env.RUN_FOR_STUDENT_USERID.toString());
                    data.userId = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_STUDENT_USERID.toString());
                    data.password = "T3sting";
                    data.firstname = "TestBot";
                    data.lastname = "Robo";
                    return data;
                }
            }

            if (process.env.RUN_ENV.toString() === "\"integration\"") {

                data.userId = intSelfStudyTestData.users.student[0].credentials.username;
                data.password = intSelfStudyTestData.users.student[0].credentials.password;
                data.firstname = intSelfStudyTestData.users.student[0].credentials.firstname;
                data.lastname = intSelfStudyTestData.users.student[0].credentials.lastname;
            }
            else if (process.env.RUN_ENV.toString() === "\"production\"") {

                data.userId = prodSelfStudyTestData.users.student[0].credentials.username;
                data.password = prodSelfStudyTestData.users.student[0].credentials.password;
                data.firstname = prodSelfStudyTestData.users.student[0].credentials.firstname;
                data.lastname = prodSelfStudyTestData.users.student[0].credentials.lastname;
            }
            else if (process.env.RUN_ENV.toString() === "\"staging\"") {

                data.userId = stageSelfStudyTestData.users.student[0].credentials.username;
                data.password = stageSelfStudyTestData.users.student[0].credentials.password;
                data.firstname = stageSelfStudyTestData.users.student[0].credentials.firstname;
                data.lastname = stageSelfStudyTestData.users.student[0].credentials.lastname;
            }

        }
        else if (userType === "custom") {
            if (process.env.RUN_ENV.toString() === "\"production\"") {
                data.userId = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_USERID.toString());
                data.password = "T3sting";
            }
        }

        return data;
    },

loginToApplication: function (browser, userType, done) {
    if (process.env.RUN_IN_BROWSER.toString() === "\"internet explorer\"") {
        return browser
            .get(data.urlForCookies)
            .sleep(4000)
            // .waitForElementByXPath("//option[@value='ASI']", asserters.isDisplayed, 60000)
            .waitForElementByXPath("//option[@value='"+stringutil.removeBoundaryQuotes(process.env.RUN_FOR_REGION.toString())+"']", asserters.isDisplayed, 60000)
            .click()
            .waitForElementByXPath("//a[@class='medium_green_button']", asserters.isDisplayed, 60000)
            .click()
            .sleep(4000)
            .get(data.urlForLogin)
            // .setWindowSize(1800, 1200)
            .sleep(1000)
            .hasElementByXPath("//*[@aria-labelledby='ui-dialog-title-tempConfirmationBox' and contains(@style,'block')]").then(function(displaystatus){
                 if(displaystatus){
                    console.log(report.reportHeader()
                    + report.stepStatusWithData("Unwanted popup appears on login page", displaystatus, "failure")
                    + report.reportFooter());
                     return browser
                      .refresh()
                      .sleep(6000)
                 }
             })
            .waitForElementByCss("#loginFormId input[id='emailId']", asserters.isDisplayed, 60000)
            .type(data.userId)
            .sleep(1000)
            .waitForElementByCss("#password", asserters.isDisplayed, 60000)
            .type(data.password)
            .sleep(1000)
            .waitForElementByCss("button[value='Sign In']", asserters.isDisplayed, 60000)
            // .waitForElementByXPath("//input[contains(@value,'Sign In')]", asserters.isDisplayed, 60000)
            .click()
            .sleep(5000)
            .hasElementByXPath("//*[@aria-labelledby='ui-dialog-title-tempConfirmationBox' and contains(@style,'block')]").then(function(displaystatus){
                 if(displaystatus){
                    console.log(report.reportHeader()
                    + report.stepStatusWithData("Unwanted popup appears on login page", displaystatus, "failure")
                    + report.reportFooter());
                     return browser
                      .refresh()
                      .sleep(6000)
                 }
             })
            .waitForElementByXPath("//a[contains(text(),'Out')]", asserters.isDisplayed, 60000)
            .nodeify(done);
          }
          else{
            return browser
                .get(data.urlForCookies)
                .sleep(4000)
                // .waitForElementByXPath("//option[@value='ASI']", asserters.isDisplayed, 60000)
                .waitForElementByXPath("//option[@value='"+stringutil.removeBoundaryQuotes(process.env.RUN_FOR_REGION.toString())+"']", asserters.isDisplayed, 60000)
                .click()
                .waitForElementByXPath("//a[@class='medium_green_button']", asserters.isDisplayed, 60000)
                .click()
                .sleep(4000)
                .get(data.urlForLogin)
              //   .maximize()
                .sleep(1000)
                .hasElementByXPath("//div[@id='instructor_opt_reminder' and contains(@style,'width')]").then(function(displaystatus){
                     if(displaystatus){
                        console.log(report.reportHeader()
                        + report.stepStatusWithData("Unwanted popup appears on login page", displaystatus, "failure")
                        + report.reportFooter());
                         return browser
                          .refresh()
                          .sleep(6000)
                     }
                 })
                .waitForElementByCss("#loginFormId input[id='emailId']", asserters.isDisplayed, 60000)
                // .waitForElementByCss("#loginFormId input[id='email']", asserters.isDisplayed, 60000)
                .type(data.userId)
                .sleep(1000)
                // .waitForElementByCss("#fmPassword", asserters.isDisplayed, 60000)
                .waitForElementByCss("#password", asserters.isDisplayed, 60000)
                .type(data.password)
                .sleep(1000)
                .waitForElementByCss("button[value='Sign In']", asserters.isDisplayed, 60000)
                // .waitForElementByCss("#loginFormId .greenWhiteButton", asserters.isDisplayed, 60000)
                // .waitForElementByXPath("//input[contains(@value,'Sign In')]", asserters.isDisplayed, 60000)
                .click()
                .sleep(7000)
                .hasElementByXPath("//*[@aria-labelledby='ui-dialog-title-tempConfirmationBox' and contains(@style,'block')]").then(function(displaystatus){
                             if(displaystatus){
                                console.log(report.reportHeader()
                                + report.stepStatusWithData("Unwanted popup appears on login page", displaystatus, "failure")
                                + report.reportFooter());
                                 return browser
                                  .refresh()
                                  .sleep(6000)
                             }
                 })
                .then(function(){
                            if(stringutil.removeBoundaryQuotes(process.env.RUN_FOR_REGION.toString()) == "ASI" || userType === "instructor"){
                                return browser
                                    .waitForElementByXPath("//a[contains(text(),'Out')]", asserters.isDisplayed, 60000)
                                    .nodeify(done);
                            }else{
                                return browser
                                    .waitForElementByXPath("//a[contains(text(),'Hello')]", asserters.isDisplayed, 60000)
                                    .nodeify(done);
                            }
                        });
          }
    },

    launchACourse: function (userType, courseName, browser, done) {
      if (userType === "instructor") {
        if(stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString())==="safari"|| stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString())==="internet explorer"){
          browser
              .hasElementByCss(".scroller", 30000).then(function (scrollelement) {
                  if (scrollelement) {
                      return browser
                          .waitForElementByCss(".closeBtn", asserters.isDisplayed, 20000)
                          .click();
                  }
              })
              .waitForElementByXPath("//a[contains(@data-track-ext,'" + courseName + "')]", asserters.isDisplayed, 20000).then(function(course){
                browser
                  .getLocationInView(course)
                  .execute("window.scrollBy(0,140)")
                  .sleep(1000);
              })
              .execute("var x = document.evaluate(\"//a[contains(@data-track-ext,'" + courseName + "')]\",document.body,null, XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;x.setAttribute('target','');")
              .waitForElementByXPath("//a[contains(@data-track-ext,'" + courseName + "')]", asserters.isDisplayed, 10000)
              .click()
              .waitForElementByCss(".icon-studyboard-blue", asserters.isDisplayed, 90000)
              .nodeify(done);
        }else {
              browser
                  .hasElementByCss(".scroller", 30000).then(function (scrollelement) {
                      if (scrollelement) {
                          return browser
                              .waitForElementByCss(".closeBtn", asserters.isDisplayed, 20000)
                              .click();
                      }
                  })
                  .waitForElementByXPath("//a[contains(@data-track-ext,'" + courseName + "')]", asserters.isDisplayed, 30000)
                  .click()
                  .sleep(1000)
                  .windowHandles().then(function (handles) {
                    var cengageBrain = handles[1];
                      return  browser
                          .window(handles[0])
                          .sleep(3000)
                          .close().then(function(){
                            return browser
                              .sleep(2000)
                              .window(handles[1])
                              .waitForElementByCss(".icon-studyboard-blue", asserters.isDisplayed, 90000)
                              .nodeify(done);
                          });
                });
        }
        }
        else {
            if(stringutil.removeBoundaryQuotes(process.env.RUN_FOR_REGION.toString()) == "ASI"){
                browser
                  .hasElementByXPath("//ul//span[contains(text(),'" + courseName + "')]").then(function(courseStatusOnFirstPage){
                    if(!courseStatusOnFirstPage){
                      browser
                      .waitForElementByXPath("//a[contains(text(),'Next')]", asserters.isDisplayed, 20000)
                      .click();
                    }
                  });
              if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString())==="safari") {
               if (userType === "student_ToRegister" || userType === "studentA" || userType === "studentB" ||  userType === "studentforProductSpecific" || userType === "studentforDropCourse" || userType === "TA") {
                      browser
                          .waitForElementByXPath("//span[contains(text(),'" + courseName + "')]/..//following-sibling::li/a[contains(text(),'Open')]", asserters.isDisplayed, 60000)
                          .click()
                          .then(
                          function () {
                              browser
                                     .waitForElementByCss(".gracePeriodBtn", asserters.isDisplayed, 60000)
                                     .sleep(3000)
                                     .execute("var x = document.evaluate(\"//div[contains(@class,'gracePeriodContent')]//input[@id='courseURL']\",document.body,null, XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;"
                                         + "var url= x.getAttribute('value');"
                                         + "location.assign(url)")
                                     .waitForElementByCss(".icon-studyboard-blue", asserters.isDisplayed, 90000)
                                     .nodeify(done);
                          });
                    }else {
                        browser
                            .waitForElementByXPath("//ul//span[contains(text(),'" + courseName + "')]", asserters.isDisplayed, 20000)
                            .execute("var x = document.evaluate(\"//ul//span[contains(text(),'" + courseName + "')]/parent::li/parent::ul//a\",document.body,null, XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;"
                                + "var url= x.getAttribute('onclick'); url = url.split('(');var fin = url[5].split(',');"
                                + "var l = fin[0].length;var final = fin[0].substring(1,(l-1));location.assign(final)")
                            .waitForElementByCss(".icon-studyboard-blue", asserters.isDisplayed, 90000)
                            .nodeify(done);
                    }
                 }else {
                     browser
                         .waitForElementByXPath("//span[contains(text(),'" + courseName + "')]/..//following-sibling::li/a[contains(text(),'Open')]", asserters.isDisplayed, 60000)
                         .click()
                         .windowHandle()
                         .then(
                         function (handle) {
                             browser
                                 .hasElementByCss(".gracePeriodBtn").then(function(courseAccessStatus){
                                   if(courseAccessStatus){
                                     browser
                                     .waitForElementByCss(".gracePeriodBtn", asserters.isDisplayed, 60000)
                                     .click()
                                     .sleep(1000)
                                     .windowHandles().then(function (handles) {
                                         console.log(handles);
                                         console.log(_.size(handles));
                                         browser
                                            .sleep(5000)
                                            .window(handles[0])
                                            .close().then(function(){
                                              browser
                                              .sleep(1000)
                                              .window(handles[1])
                                              .nodeify(done);
                                            });
                                     });
                                   }else {
                                     browser
                                     .sleep(1000)
                                     .windowHandles().then(function (handles) {
                                       var cengageBrain = handles[1];
                                         return  browser
                                             .window(handles[0])
                                             .sleep(5000)
                                             .close().then(function(){
                                               return browser
                                                 .sleep(2000)
                                                 .window(handles[1])
                                                 .waitForElementByCss(".icon-studyboard-blue", asserters.isDisplayed, 90000)
                                                 .nodeify(done);
                                             });
                                   });
                                   }
                                 });

                         });
                 }
            }else{
            // browser
            //   .hasElementByXPath("//ul//span[contains(text(),'" + courseName + "')]").then(function(courseStatusOnFirstPage){
            //     if(!courseStatusOnFirstPage){
            //       browser
            //       .waitForElementByXPath("//a[contains(text(),'Next')]", asserters.isDisplayed, 20000)
            //       .click();
            //     }
            //   });
          if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString())==="safari") {
           if (userType === "student_ToRegister" || userType === "studentA" || userType === "studentB" ||  userType === "studentforProductSpecific" || userType === "studentforDropCourse" || userType === "mycengage") {
                  browser
                      .waitForElementByXPath("//span[contains(text(),'" + courseName + "')]/..//following-sibling::li/a[contains(text(),'Open')]", asserters.isDisplayed, 60000)
                      .click()
                      .then(
                      function () {
                          browser
                                 .waitForElementByCss(".gracePeriodBtn", asserters.isDisplayed, 60000)
                                 .sleep(3000)
                                 .execute("var x = document.evaluate(\"//div[contains(@class,'gracePeriodContent')]//input[@id='courseURL']\",document.body,null, XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;"
                                     + "var url= x.getAttribute('value');"
                                     + "location.assign(url)")
                                 .waitForElementByCss(".icon-studyboard-blue", asserters.isDisplayed, 90000)
                                 .nodeify(done);
                      });
                }else {
                    browser
                        .waitForElementByXPath("//ul//span[contains(text(),'" + courseName + "')]", asserters.isDisplayed, 20000)
                        .execute("var x = document.evaluate(\"//ul//span[contains(text(),'" + courseName + "')]/parent::li/parent::ul//a\",document.body,null, XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;"
                            + "var url= x.getAttribute('onclick'); url = url.split('(');var fin = url[5].split(',');"
                            + "var l = fin[0].length;var final = fin[0].substring(1,(l-1));location.assign(final)")
                        .waitForElementByCss(".icon-studyboard-blue", asserters.isDisplayed, 90000)
                        .nodeify(done);
                }
             }else {
                    browser
       .waitForElementByXPath("//h2[text()='"+courseName+"']", asserters.isDisplayed, 60000)
       .click()
       .windowHandle()
       .then(
       function (handle) {
           browser
               .sleep(3000)
               .hasElementByCss(".authCmError.ng-binding").then(function(courseAccessStatus){
                 if(courseAccessStatus){
                           console.log(report.reportHeader()
                           + report.stepStatusWithData("Course free access days is now 0 ", courseAccessStatus, "failure")
                           + report.reportFooter());
                 }else {
                   browser
                   .waitForElementByXPath("//button[@class='btn btn-success open']", asserters.isDisplayed, 60000)
                   .click()
                   .sleep(1000)
                   .windowHandles().then(function (handles) {
                     var cengageBrain = handles[1];
                       return  browser
                           .window(handles[0])
                           .sleep(5000)
                           .close().then(function(){
                             return browser
                               .sleep(2000)
                               .window(handles[1])
                               .waitForElementByCss(".icon-studyboard-blue", asserters.isDisplayed, 90000)
                               .nodeify(done);
                           });
                 });
                 }
               });

       });
             }
        }
          //   browser
          //     .hasElementByXPath("//ul//span[contains(text(),'" + courseName + "')]").then(function(courseStatusOnFirstPage){
          //       if(!courseStatusOnFirstPage){
          //         browser
          //         .waitForElementByXPath("//a[contains(text(),'Next')]", asserters.isDisplayed, 20000)
          //         .click();
          //       }
          //     });
          // if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString())==="safari" || stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString())==="internet explorer") {
          //  if (userType === "student_ToRegister" || userType === "studentA" || userType === "studentB" ||  userType === "studentforProductSpecific" || userType === "studentforDropCourse" || userType === "mycengage") {
          //         browser
          //             .waitForElementByXPath("//span[contains(text(),'" + courseName + "')]/..//following-sibling::li/a[contains(text(),'Open')]", asserters.isDisplayed, 60000)
          //             .click()
          //             .then(
          //             function () {
          //                 browser
          //                        .waitForElementByCss(".gracePeriodBtn", asserters.isDisplayed, 60000)
          //                        .sleep(3000)
          //                        .execute("var x = document.evaluate(\"//div[contains(@class,'gracePeriodContent')]//input[@id='courseURL']\",document.body,null, XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;"
          //                            + "var url= x.getAttribute('value');"
          //                            + "location.assign(url)")
          //                        .waitForElementByCss(".icon-studyboard-blue", asserters.isDisplayed, 90000)
          //                        .nodeify(done);
          //             });
          //       }else {
          //           browser
          //               .waitForElementByXPath("//ul//span[contains(text(),'" + courseName + "')]", asserters.isDisplayed, 20000)
          //               .execute("var x = document.evaluate(\"//ul//span[contains(text(),'" + courseName + "')]/parent::li/parent::ul//a\",document.body,null, XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;"
          //                   + "var url= x.getAttribute('onclick'); url = url.split('(');var fin = url[5].split(',');"
          //                   + "var l = fin[0].length;var final = fin[0].substring(1,(l-1));location.assign(final)")
          //               .waitForElementByCss(".icon-studyboard-blue", asserters.isDisplayed, 90000)
          //               .nodeify(done);
          //       }
          //    }else {
          //        browser
          //            .waitForElementByXPath("//span[contains(text(),'" + courseName + "')]/..//following-sibling::li/a[contains(text(),'Open')]", asserters.isDisplayed, 60000)
          //            .click()
          //            .windowHandle()
          //            .then(
          //            function (handle) {
          //                browser
          //                    .hasElementByCss(".gracePeriodBtn").then(function(courseAccessStatus){
          //                      if(courseAccessStatus){
          //                        browser
          //                        .waitForElementByCss(".gracePeriodBtn", asserters.isDisplayed, 60000)
          //                        .click()
          //                        .sleep(1000)
          //                        .windowHandles().then(function (handles) {
          //                            console.log(handles);
          //                            console.log(_.size(handles));
          //                            browser
          //                               .sleep(5000)
          //                               .window(handles[0])
          //                               .close().then(function(){
          //                                 browser
          //                                 .sleep(1000)
          //                                 .window(handles[1])
          //                                 .nodeify(done);
          //                               });
          //                        });
          //                      }else {
          //                        browser
          //                        .sleep(1000)
          //                        .windowHandles().then(function (handles) {
          //                          var cengageBrain = handles[1];
          //                            return  browser
          //                                .window(handles[0])
          //                                .sleep(5000)
          //                                .close().then(function(){
          //                                  return browser
          //                                    .sleep(2000)
          //                                    .window(handles[1])
          //                                    .waitForElementByCss(".icon-studyboard-blue", asserters.isDisplayed, 90000)
          //                                    .nodeify(done);
          //                                });
          //                      });
          //                      }
          //                    });
          //
          //            });
          //    }
        }

    },

    getCengageBrainHandle: function () {
        return cengageBrain;
    },

    getCurrentUsertype: function () {
        return currentUserType;
    },

    getProductData: function () {
        var allproducts = productData.products;
        var myproduct;
        for (var i = 0, len = allproducts.length; i < len; ++i) {
            var productDetails = allproducts[i];

            if (stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString()) === productDetails.productid) {
                myproduct = productDetails;

            }

        }

        return myproduct;
    },

    getUserName: function () {

        return data.lastname + ", " + data.firstname;
    },

    getUserNameOfNewStudent: function (firstname, lastname) {
        return lastname + ", " + firstname;
    },

    getUserId: function () {

        return data.userId;
    },

    getUserPwd: function () {

        return data.password;
    },

    generateStudentId: function () {
        return "qa.student." + stringutil.removeBoundaryQuotes(process.env.RUN_ENV.toString()) + "." + mathutil.getRandomInt(0, 100) + dateutil.getCurrentDate() + "@cengage.com";
    },
    generateStudentAccount: function (browser, username, count) {
          // var count = counts+1;
          firstname = "TestBot"+count;
          lastname = "Robo"+count;
          password = "T3sting";
          security = "4LTR";
          zipcode = "02148";

        return browser
            // .get(data.urlForLogin)
            // .maximize()
            // .setWindowSize(1366, 1024)
            .get(data.urlForCookies)
            .sleep(4000)
            .waitForElementByXPath("//option[@value='ASI']", asserters.isDisplayed, 60000)
            .click()
            .waitForElementByXPath("//a[@class='medium_green_button']", asserters.isDisplayed, 60000)
            .click()
            .sleep(4000)
            // .get(data.urlForLogin)
            .setWindowSize(1800, 1200)
            .sleep(1000)
            // .waitForElementByLinkText("New Student User? »", asserters.isDisplayed, 60000).elementByLinkText("New Student User? »")
            // .click()
            // .waitForElementById("showNewUserReg", asserters.isDisplayed, 60000).elementById("showNewUserReg")
            // .click()
            .waitForElementByCss("#registerForm #standaloneRegistration #email", asserters.isDisplayed, 60000).waitForElementByCss("#registerForm #standaloneRegistration #email")
            .click()
            .type(username)
            .type(wd.SPECIAL_KEYS.Enter)
            .sleep(3000)
            .hasElementByCss(".input-group.error")
            .then(function(alreadyUsedId){
              if(alreadyUsedId == false)
               {
                  return browser
            .waitForElementById("fname", asserters.isDisplayed, 60000).elementById("fname")
            .type(firstname)
            .waitForElementById("lname", asserters.isDisplayed, 60000).elementById("lname")
            .type(lastname)
            .waitForElementById("password", asserters.isDisplayed, 60000).elementById("password")
            .type(password)
            .waitForElementById("confirmPassword", asserters.isDisplayed, 60000).elementById("confirmPassword")
            .type(password)
            .waitForElementById("questionSelectBoxItText", asserters.isDisplayed, 60000).elementById("questionSelectBoxItText")
            .click()
            .waitForElementByLinkText("What is the name of your high school?", asserters.isDisplayed, 60000).elementByLinkText("What is the name of your high school?")
            .click()
            .waitForElementById("answer", asserters.isDisplayed, 60000).elementById("answer")
            .type(security)
            .waitForElementById("acceptEULA", asserters.isDisplayed, 60000).elementById("acceptEULA")
            .click()
            .waitForElementByClassName("greenWhiteButton", asserters.isDisplayed, 60000).elementByClassName("greenWhiteButton")
            .click()
            .waitForElementById("locationSelectBoxItText", asserters.isDisplayed, 60000).elementById("locationSelectBoxItText")
            .click()
            .waitForElementByLinkText("United States", asserters.isDisplayed, 60000).elementByLinkText("United States")
            .click()
            .sleep(3000)
            .waitForElementById("institutionTypeSelectBoxItText", asserters.isDisplayed, 60000).elementById("institutionTypeSelectBoxItText")
            .click()
            .waitForElementByLinkText("2 Year College", asserters.isDisplayed, 60000).elementByLinkText("2 Year College")
            .click()
            .waitForElementById("zipcode", asserters.isDisplayed, 60000).elementById("zipcode")
            .type(zipcode)
            .waitForElementByClassName("greenWhiteButton", asserters.isDisplayed, 60000).elementByClassName("greenWhiteButton")
            .click()
            .waitForElementByCss("input[id='6412']", asserters.isDisplayed, 60000).elementByCss("input[id='6412']")
            .click()
            .waitForElementByClassName("greenWhiteButton", asserters.isDisplayed, 60000).elementByClassName("greenWhiteButton")
            .click();
          }
          else
          {
           return;
          }
       });
    },


    setLoginDataForGateway: function (userType) {
        currentUserType = userType;
        data.urlForLogin = stageTestDataForGateway.stageGatewayIntegration_url;

        if (userType === "instructor") {

            data.userId = stageTestDataForGateway.users.instructor[process.env.RUN_INDEX].credentials.username;
            data.password = stageTestDataForGateway.users.instructor[process.env.RUN_INDEX].credentials.password;
            data.firstname = stageTestDataForGateway.users.student[process.env.RUN_INDEX].credentials.firstname;
            data.lastname = stageTestDataForGateway.users.student[process.env.RUN_INDEX].credentials.lastname;

        }else if(userType === "student"){

          data.userId = stageTestDataForGateway.users.student[process.env.RUN_INDEX].credentials.username;
          data.password = stageTestDataForGateway.users.student[process.env.RUN_INDEX].credentials.password;
          data.firstname = stageTestDataForGateway.users.student[process.env.RUN_INDEX].credentials.firstname;
          data.lastname = stageTestDataForGateway.users.student[process.env.RUN_INDEX].credentials.lastname;

        }
        return data;
    },

    loginToApplicationThroughGateway: function (browser, done) {
        browser
            .sleep(3000)
            .get(data.urlForLogin)
            .sleep(3000)
            .setWindowSize(1366, 1024)
            .waitForElementByCss("#user_id", asserters.isDisplayed, 60000)
            .type(data.userId)
            .sleep(1000)
            .waitForElementByCss("#password", asserters.isDisplayed, 60000)
            .type(data.password)
            .sleep(1000)
            .waitForElementByCss(".submit.button-1", asserters.isDisplayed, 60000)
            .click()
            .waitForElementByCss("#global-nav-link", asserters.isDisplayed, 60000)
            .nodeify(done);
    },

    clickOnCourse: function (browser, courseName) {
        return browser
            .waitForElementByXPath("//ul[contains(@class,'portletList-img')]//li/a[contains(text(),'" + courseName + "')]", asserters.isDisplayed, 60000)
            .click();
    },


    launchTheCourseForGatewayIntegration: function (browser, course, product) {
        return  browser
            .waitForElementByXPath("//ul[@id='content_listContainer']//a//span[contains(text(),'" + course + "')]//parent::a", asserters.isDisplayed, 60000)
            .click()
            .sleep(5000)
            .windowHandles()
            .then(
            function (handle) {
                var cengageBrain = handle[1];
                return  browser
                    .window(cengageBrain)
                    .waitForElementByXPath("//div[contains(@class,'icon-home-blue')]//parent::a[contains(text(),'" + product + "')]", asserters.isDisplayed, 60000)
                    .window(handle[0])
            });
    },
    switchParentToChildWindow: function (browser) {
        return  browser
            .windowHandles()
            .then(
            function (handle) {
                var cengageBrain = handle[1];
                return  browser
                    .window(cengageBrain);
            });
    },
    switchChildToParentWindow: function (browser) {
        return  browser
            .windowHandles()
            .then(
            function (handle) {
                var cengageBrain = handle[0];
                return  browser
                    .window(cengageBrain);
            });
    },
    checkIfCoursePresent: function (browser,courseName) {
        return  browser
        .hasElementByXPath("//a[contains(@data-track-ext,'" + courseName + "')]", asserters.isDisplayed, 10000)
        // .then(function(scrollIntoLoc){
        //  .waitForElementByXPath("//a[contains(@data-track-ext,'" + courseName + "')]", asserters.isDisplayed, 10000)
        //   return browser
        //   .getLocationInView(scrollIntoLoc)
        //   .execute("window.scrollBy(0,300)")
        //   .hasElementByXPath("//a[contains(@data-track-ext,'" + courseName + "')]", asserters.isDisplayed, 10000);
        // });

    },

      launchCourseOnManageCourse: function(browser, courseName, done){
        browser
            .waitForElementByXPath("//td[contains(.,'"+courseName+"')]//a", asserters.isDisplayed, 30000)
            .click()
            .sleep(1000)
            .windowHandles().then(function (handles) {
              var cengageBrain = handles[1];
                return  browser
                    .window(handles[0])
                    .sleep(3000)
                    .close().then(function(){
                      return browser
                        .sleep(2000)
                        .window(handles[1])
                        .waitForElementByCss(".icon-studyboard-blue", asserters.isDisplayed, 90000)
                        .nodeify(done);
                    });
              });
      },

      validateCourseName: function(userType, courseName, browser){
          if (userType === "instructor") {
              return browser
                  .hasElementByXPath("//a[contains(@data-track-ext,'" + courseName + "')]");
          }
          else {
               return browser
                   .sleep(2000)
                   .hasElementByXPath("//ul//span[contains(text(),'" + courseName + "')]");
          }
      },

     loginToApplicationForUSRegion: function (userType, browser, done) {
        if (userType === "instructor") {
         if (process.env.RUN_IN_BROWSER.toString() === "\"internet explorer\"") {
             return browser
                 .get(data.urlForCookies)
                 .sleep(4000)
                 .waitForElementByXPath("//option[@value='USA']", asserters.isDisplayed, 60000)
                 .click()
                 .waitForElementByXPath("//a[@class='medium_green_button']", asserters.isDisplayed, 60000)
                 .click()
                 .sleep(4000)
                 .get(data.urlForLogin)
                 .setWindowSize(1800, 1200)
                 .sleep(1000)
                 .hasElementByXPath("//*[@aria-labelledby='ui-dialog-title-tempConfirmationBox' and contains(@style,'block')]").then(function(displaystatus){
                      if(displaystatus){
                         console.log(report.reportHeader()
                         + report.stepStatusWithData("Unwanted popup appears on login page", displaystatus, "failure")
                         + report.reportFooter());
                          return browser
                           .refresh()
                           .sleep(6000)
                      }
                  })
                 .waitForElementByCss("#loginFormId input[id='emailId']", asserters.isDisplayed, 60000)
                 .type(data.userId)
                 .sleep(1000)
                 .waitForElementByCss("#password", asserters.isDisplayed, 60000)
                 .type(data.password)
                 .sleep(1000)
                 .waitForElementByCss("button[value='Sign In']", asserters.isDisplayed, 60000)
                 // .waitForElementByXPath("//input[contains(@value,'Sign In')]", asserters.isDisplayed, 60000)
                 .click()
                 .sleep(5000)
                 .hasElementByXPath("//*[@aria-labelledby='ui-dialog-title-tempConfirmationBox' and contains(@style,'block')]").then(function(displaystatus){
                      if(displaystatus){
                         console.log(report.reportHeader()
                         + report.stepStatusWithData("Unwanted popup appears on login page", displaystatus, "failure")
                         + report.reportFooter());
                          return browser
                           .refresh()
                           .sleep(6000)
                      }
                  })
                 .waitForElementByXPath("//a[contains(text(),'Sign')]", asserters.isDisplayed, 60000)
                 .nodeify(done);
               }
               else{
                 return browser
                     .get(data.urlForCookies)
                     .sleep(4000)
                     .waitForElementByXPath("//option[@value='USA']", asserters.isDisplayed, 60000)
                     .click()
                     .waitForElementByXPath("//a[@class='medium_green_button']", asserters.isDisplayed, 60000)
                     .click()
                     .sleep(4000)
                     .get(data.urlForLogin)
                   //   .maximize()
                     .sleep(1000)
                     .hasElementByXPath("//div[@id='instructor_opt_reminder' and contains(@style,'width')]").then(function(displaystatus){
                          if(displaystatus){
                             console.log(report.reportHeader()
                             + report.stepStatusWithData("Unwanted popup appears on login page", displaystatus, "failure")
                             + report.reportFooter());
                              return browser
                               .refresh()
                               .sleep(6000)
                          }
                      })
                     .waitForElementByCss("#loginFormId input[id='emailId']", asserters.isDisplayed, 60000)
                     .type(data.userId)
                     .sleep(1000)
                     .waitForElementByCss("#password", asserters.isDisplayed, 60000)
                     .type(data.password)
                     .sleep(1000)
                     .waitForElementByCss("button[value='Sign In']", asserters.isDisplayed, 60000)
                     // .waitForElementByXPath("//input[contains(@value,'Sign In')]", asserters.isDisplayed, 60000)
                     .click()
                     .sleep(7000)
                     .hasElementByXPath("//*[@aria-labelledby='ui-dialog-title-tempConfirmationBox' and contains(@style,'block')]").then(function(displaystatus){
                                  if(displaystatus){
                                     console.log(report.reportHeader()
                                     + report.stepStatusWithData("Unwanted popup appears on login page", displaystatus, "failure")
                                     + report.reportFooter());
                                      return browser
                                       .refresh()
                                       .sleep(6000)
                                  }
                      })
                     .waitForElementByXPath("//a[contains(text(),'Sign')]", asserters.isDisplayed, 60000)
                     .nodeify(done);
               }
        }else {
            if (process.env.RUN_IN_BROWSER.toString() === "\"internet explorer\"") {
                return browser
                    .get(data.urlForCookies)
                    .sleep(4000)
                    .waitForElementByXPath("//option[@value='USA']", asserters.isDisplayed, 60000)
                    .click()
                    .waitForElementByXPath("//a[@class='medium_green_button']", asserters.isDisplayed, 60000)
                    .click()
                    .sleep(4000)
                    .get(data.urlForLogin)
                    .setWindowSize(1800, 1200)
                    .sleep(1000)
                    .hasElementByXPath("//*[@aria-labelledby='ui-dialog-title-tempConfirmationBox' and contains(@style,'block')]").then(function(displaystatus){
                         if(displaystatus){
                            console.log(report.reportHeader()
                            + report.stepStatusWithData("Unwanted popup appears on login page", displaystatus, "failure")
                            + report.reportFooter());
                             return browser
                              .refresh()
                              .sleep(6000)
                         }
                     })
                    .waitForElementByCss("#loginFormId input[id='emailId']", asserters.isDisplayed, 60000)
                    .type(data.userId)
                    .sleep(1000)
                    .waitForElementByCss("#password", asserters.isDisplayed, 60000)
                    .type(data.password)
                    .sleep(1000)
                    .waitForElementByCss("button[value='Sign In']", asserters.isDisplayed, 60000)
                    // .waitForElementByXPath("//input[contains(@value,'Sign In')]", asserters.isDisplayed, 60000)
                    .click()
                    .sleep(5000)
                    .hasElementByXPath("//*[@aria-labelledby='ui-dialog-title-tempConfirmationBox' and contains(@style,'block')]").then(function(displaystatus){
                         if(displaystatus){
                            console.log(report.reportHeader()
                            + report.stepStatusWithData("Unwanted popup appears on login page", displaystatus, "failure")
                            + report.reportFooter());
                             return browser
                              .refresh()
                              .sleep(6000)
                         }
                     })
                    .waitForElementByXPath("//a[contains(text(),'Sign')]", asserters.isDisplayed, 60000)
                    .nodeify(done);
                  }
                  else{
                    return browser
                        .get(data.urlForCookies)
                        .sleep(4000)
                        .waitForElementByXPath("//option[@value='USA']", asserters.isDisplayed, 60000)
                        .click()
                        .waitForElementByXPath("//a[@class='medium_green_button']", asserters.isDisplayed, 60000)
                        .click()
                        .sleep(4000)
                        .get(data.urlForLogin)
                      //   .maximize()
                        .sleep(1000)
                        .hasElementByXPath("//div[@id='instructor_opt_reminder' and contains(@style,'width')]").then(function(displaystatus){
                             if(displaystatus){
                                console.log(report.reportHeader()
                                + report.stepStatusWithData("Unwanted popup appears on login page", displaystatus, "failure")
                                + report.reportFooter());
                                 return browser
                                  .refresh()
                                  .sleep(6000)
                             }
                         })
                        .waitForElementByCss("#loginFormId input[id='emailId']", asserters.isDisplayed, 60000)
                        .type(data.userId)
                        .sleep(1000)
                        .waitForElementByCss("#password", asserters.isDisplayed, 60000)
                        .type(data.password)
                        .sleep(1000)
                        .waitForElementByCss("button[value='Sign In']", asserters.isDisplayed, 60000)
                        // .waitForElementByXPath("//input[contains(@value,'Sign In')]", asserters.isDisplayed, 60000)
                        .click()
                        .sleep(7000)
                        .hasElementByXPath("//*[@aria-labelledby='ui-dialog-title-tempConfirmationBox' and contains(@style,'block')]").then(function(displaystatus){
                                     if(displaystatus){
                                        console.log(report.reportHeader()
                                        + report.stepStatusWithData("Unwanted popup appears on login page", displaystatus, "failure")
                                        + report.reportFooter());
                                         return browser
                                          .refresh()
                                          .sleep(6000)
                                     }
                         })
                        .waitForElementByXPath("//a[contains(@class,'dropdown-toggle')]", asserters.isDisplayed, 60000)
                        .click()
                        .waitForElementByXPath("//a[contains(text(),'Sign')]", asserters.isDisplayed, 60000)
                        .waitForElementByXPath("//a[contains(@class,'dropdown-toggle')]", asserters.isDisplayed, 60000)
                        .click()
                        .nodeify(done);
                  }
        }
     },

    launchACourseOfMyCengage: function (userType, courseName, browser, done) {
      if (userType === "instructor") {
        console.log(report.reportHeader()
        + report.stepStatusWithData("instructor is not integrated with my cengage as now", "success")
        + report.reportFooter());
        }
        else {
            browser
              .sleep(3000)
              .hasElementByXPath("//p[contains(text(),'" + courseName + "')]").then(function(courseStatusOnFirstPage){
                if(!courseStatusOnFirstPage){
                    console.log(report.reportHeader()
                    + report.stepStatusWithData("Course is not present", courseStatusOnFirstPage, "failure")
                    + report.reportFooter());
                }
              });
          if (stringutil.removeBoundaryQuotes(process.env.RUN_IN_BROWSER.toString())==="safari") {
           if (userType === "student_ToRegister" || userType === "studentA" || userType === "studentB" ||  userType === "studentforProductSpecific" || userType === "studentforDropCourse" || userType === "mycengage") {
                  browser
                      .waitForElementByXPath("//span[contains(text(),'" + courseName + "')]/..//following-sibling::li/a[contains(text(),'Open')]", asserters.isDisplayed, 60000)
                      .click()
                      .then(
                      function () {
                          browser
                                 .waitForElementByCss(".gracePeriodBtn", asserters.isDisplayed, 60000)
                                 .sleep(3000)
                                 .execute("var x = document.evaluate(\"//div[contains(@class,'gracePeriodContent')]//input[@id='courseURL']\",document.body,null, XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;"
                                     + "var url= x.getAttribute('value');"
                                     + "location.assign(url)")
                                 .waitForElementByCss(".icon-studyboard-blue", asserters.isDisplayed, 90000)
                                 .nodeify(done);
                      });
                }else {
                    browser
                        .waitForElementByXPath("//ul//span[contains(text(),'" + courseName + "')]", asserters.isDisplayed, 20000)
                        .execute("var x = document.evaluate(\"//ul//span[contains(text(),'" + courseName + "')]/parent::li/parent::ul//a\",document.body,null, XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;"
                            + "var url= x.getAttribute('onclick'); url = url.split('(');var fin = url[5].split(',');"
                            + "var l = fin[0].length;var final = fin[0].substring(1,(l-1));location.assign(final)")
                        .waitForElementByCss(".icon-studyboard-blue", asserters.isDisplayed, 90000)
                        .nodeify(done);
                }
             }else {
                    browser
                     .hasElementByXPath("//p[contains(text(),'"+courseName+"')]/parent::div//button[@class='btn btn-success open']").then(function(courseStatus){
                        if(courseStatus){
                            browser
                            .waitForElementByXPath("//p[contains(text(),'"+courseName+"')]/parent::div//button[@class='btn btn-success open']",asserters.isDisplayed, 40000)
                            .click()
                            .sleep(1000)
                            .windowHandles().then(function (handles) {
                               console.log(handles);
                              var cengageBrain = handles[1];
                                return  browser
                                    .window(handles[0])
                                    .sleep(5000)
                                    .close().then(function(){
                                      return browser
                                        .sleep(2000)
                                        .window(handles[1])
                                        .waitForElementByCss(".icon-studyboard-blue", asserters.isDisplayed, 90000)
                                        .nodeify(done);
                                    });
                          });
                        }else {
                            browser
                            .waitForElementByXPath("//h2[contains(text(),'"+courseName+"')]",asserters.isDisplayed, 40000)
                            .click()
                            .sleep(1000)
                            .waitForElementByXPath("//p[contains(text(),'"+courseName+"')]/parent::div//button[@class='btn btn-success open']",asserters.isDisplayed, 40000)
                            .click()
                            .sleep(1000)
                            .windowHandles().then(function (handles) {
                               console.log(handles);
                              var cengageBrain = handles[1];
                                return  browser
                                    .window(handles[0])
                                    .sleep(5000)
                                    .close().then(function(){
                                      return browser
                                        .sleep(2000)
                                        .window(handles[1])
                                        .waitForElementByCss(".icon-studyboard-blue", asserters.isDisplayed, 90000)
                                        .nodeify(done);
                                    });
                          });
                        }
                     })

             }
        }

    },

    launchACourseOfMyCengageNow: function (userType, courseName, editedCourseName, browser, done) {
                browser
               //  .waitForElementByXPath("//h2[contains(text(),'"+editedCourseName+"')]",asserters.isDisplayed, 40000)
               //  .click()
                .sleep(1000)
                .waitForElementByXPath("//p[contains(text(),'"+courseName+"')]/parent::div//button[@class='btn btn-success open']",asserters.isDisplayed, 40000)
                // .waitForElementByXPath("//button[@class='btn btn-success open']",asserters.isDisplayed, 40000)
                .click()
                .sleep(1000)
                .windowHandles().then(function (handles) {
                   console.log(handles);
                  var cengageBrain = handles[1];
                    return  browser
                        .window(handles[0])
                        .sleep(5000)
                        .close().then(function(){
                          return browser
                            .sleep(2000)
                            .window(handles[1])
                            .waitForElementByCss(".icon-studyboard-blue", asserters.isDisplayed, 90000)
                            .nodeify(done);
                        });
              });

    },

        validateCourseLaunchNotNavigateToLoginPage: function(browser, done){
           return browser
              .url().then(function(urlOfPage){
                  if(urlOfPage.indexOf(data.cengageBrainUrl)>-1){
                   console.log(report.reportHeader()
                   + report.stepStatusWithData("Page navigate to login page(i.e. cengage brain page) the url is "+urlOfPage+" is compared with ", data.cengageBrainUrl, "failure")
                   + report.reportFooter());
               }else{
                  return browser
                   .url().then(function(urlOfPage1){
                       if(urlOfPage1.indexOf("https://4ltrpressonline.cengage.com/products")>-1){
                           console.log(report.reportHeader()
                           + report.stepStatusWithData("Page navigate to product page the url is "+urlOfPage1+" is compared with ", "https://4ltrpressonline.cengage.com/products", "success")
                           + report.reportFooter());
                           done();
                        }else{
                           console.log(report.reportHeader()
                           + report.stepStatusWithData("Page navigate to product page the url is "+urlOfPage1+" is compared with ", "https://4ltrpressonline.cengage.com/products", "failure")
                           + report.reportFooter());
                        }
                   });
               }
           });
       },

      launchACoursePrintLink: function (userType, courseName, browser, done) {
                  return browser
                      .hasElementByCss(".scroller", 30000).then(function (scrollelement) {
                          if (scrollelement) {
                              return browser
                                  .waitForElementByCss(".closeBtn", asserters.isDisplayed, 20000)
                                  .click();
                          }
                      })
                      .sleep(1000)
                      .waitForElementByXPath("//a[contains(@data-track-ext,'" + courseName + "')]//parent::span//following-sibling::a[contains(text(),'Print')]", asserters.isDisplayed, 30000)
                      .click()
                      .sleep(1000)
                      .windowHandles().then(function (handles) {
                        var windowsSize = handles;
                        return browser
                        .waitForElementByXPath("//a[contains(@data-track-ext,'" + courseName + "')]", asserters.isDisplayed, 30000)
                        .click()
                        .sleep(1000)
                        .windowHandles().then(function (handles1) {
                        var windowsSizeAfterCourseLaunch = handles1;
                        console.log(handles.length)
                        if(windowsSizeAfterCourseLaunch.length == handles.length + 1){
                            console.log(report.reportHeader()
                            + report.stepStatusWithData("LTR-5041 :: Course is launched successfully ", "success", "success")
                            + report.reportFooter());
                            return  browser
                                  .window(handles[2])
                                  .sleep(3000)
                                  .close().then(function(){
                                    return browser
                                      .sleep(2000)
                                      .window(handles[1])
                                      .sleep(3000)
                                      .close().then(function(){
                                       return browser
                                          .window(handles[0])
                                          .sleep(3000)
                                          .nodeify(done);
                                    });
                                  });
                         }else{
                                console.log(report.reportHeader()
                                + report.stepStatusWithData("LTR-5041::Course is not launching when print course window is opened ", "failure", "failure")
                                + report.reportFooter());
                                return  browser
                                      .windowHandles().then(function (handles2) {
                                      console.log("handles2"+handles2);
                                       return  browser
                                          .window(handles2[2])
                                          .sleep(3000)
                                          .close()
                                          .sleep(3000)
                                          .window(handles[0])
                                          .sleep(3000)
                                          .nodeify(done);
                                    });
                            }
                    });
                });
            }
};
