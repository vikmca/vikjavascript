var wd = require('wd');
var asserters = wd.asserters;
var commonutil = require("../../../../util/commonUtility.js");
var basicpo =  require("./basicpo.js");
module.exports = {

  clickOnCreateCourseLink : function (browser) {
      return  browser
       .sleep(2000)
       .execute("return document.evaluate(\"//a[contains(@data-track,'Create Course:')]\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()");
      // .waitForElementByCss(".courseManage>a:first-child", asserters.isDisplayed, 10000)
      // .click();
  },
  verifyTextOnCreateCoursePage : function (browser,createCourseQuestionLabel) {
      return  browser
      .waitForElementByCss("#columnMain>h3", asserters.isDisplayed, 10000)
      .text()
      .should.eventually.include(createCourseQuestionLabel);
  },
  selectRadioForCourseType : function (browser) {
      return  browser
      .waitForElementByCss("#createNewCourse",asserters.isDisplayed, 10000)
      .click()
      .sleep(1000)
      .waitForElementByXPath("//a[contains(text(),'Continue')]", asserters.isDisplayed, 10000)
      .click();
  },

  closePopupWindow: function(browser){
    return browser
      .hasElementByXPath("//div[contains(@class,'QSIPopOver')]//img[contains(@src,'close')]").then(function(popupWindowStatus){
      if(popupWindowStatus){
        return browser
            .waitForElementByXPath("//div[contains(@class,'QSIPopOver')]//img[contains(@src,'close')]", asserters.isDisplayed, 10000)
            .click();
      }
    });
  },

  verifyCourseInformationLabel : function (browser,CourseInformationLabel) {
      return  browser
      .waitForElementByCss(".courseInfoHeader", asserters.isDisplayed, 10000)
      .text()
      .should.eventually.include(CourseInformationLabel);
  },
  enterCourseName : function (browser,newCourseName) {
      return  browser
      .waitForElementByCss("#courseName", asserters.isDisplayed, 10000)
      .click()
      .type(newCourseName);
  },
  fillTheStartDate : function(browser){
    return  browser
    .waitForElementByCss("#calendar1", asserters.isDisplayed, 10000)
    .click()
    // .sleep(3000)
    .sleep(1000)
    //setting today's date
    .waitForElementByCss(".ui-state-focus.ui-state-active", asserters.isDisplayed, 10000)
    .click();
  },
  enterTheEndData : function(browser, setDate){
    return browser
    .waitForElementByCss("#endDate", asserters.isDisplayed, 10000)
    .clear()
    // .sleep(3000)
    .sleep(1000)
    .waitForElementByCss("#endDate", asserters.isDisplayed, 10000)
    .type(setDate)
    // .waitForElementByCss("#timeZone option:nth-child(12)", asserters.isDisplayed, 10000)
      // .waitForElementByXPath("//option[@value='America/New_York']", asserters.isDisplayed, 10000)
     .waitForElementByXPath("//option[@value='Asia/Calcutta']", asserters.isDisplayed, 10000)
    .click();
  },
  saveTheCourseDetail : function(browser){
    return browser
      // .execute("window.scrollTo(500,0)")
      // .sleep(2000)
      // .waitForElementByXPath("//a[contains(text(),'Create Course')]", asserters.isDisplayed, 10000)
      // .click();
       .execute("return document.evaluate(\"//div[@class='btns_lt']/a[@class='button']\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()");
  },
  getCourseKey : function(browser){
    return browser
    .waitForElementByCss(".distributionOptions a[target='_blank']", asserters.isDisplayed, 10000)
    .isDisplayed()
    .should.become(true)
    .waitForElementByCss(".distributionOptions a[target='_blank']", asserters.isDisplayed, 10000)
    // .execute("return document.getElementsByClassName('distributionOptions')[0].getElementsByTagName('a')[0].text.split('course/')[1]")
    .text();

  },
  launchTheCreatedCourse : function(browser){
    if (process.env.RUN_IN_BROWSER.toString() === "\"internet explorer\"") {
      return browser
        .waitForElementByXPath("(//div[contains(@class,'stepContent')]//a)[1]", asserters.isDisplayed, 40000)
        .execute("document.getElementsByClassName('stepContent')[0].getElementsByTagName('a')[0].click();")
        .windowHandles()
        .then(
        function (handle) {
            cengageBrain = handle[1];
            return  browser
                .window(cengageBrain);
      });
    }else {
      return browser
      .execute("var x = document.evaluate(\"(//div[contains(@class,'stepContent')]//a)[1]\",document.body,null, XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;x.setAttribute('target','');")
      .waitForElementByXPath("(//div[contains(@class,'stepContent')]//a)[1]", asserters.isDisplayed, 40000)
      .click();
    }
  },
  handleEula : function(browser){
    this.closePopupWindow(browser);
    return browser
        .sleep(1000)
        .waitForElementByCss(".read-terms-start-modal.ng-scope", asserters.isDisplayed, 10000)
        .isDisplayed()
        .should.become(true)
        .waitForElementByCss("button[class='welcome-button']", asserters.isDisplayed, 10000)
        .click()
        .waitForElementByCss(".welcome-accept-terms.ng-scope", asserters.isDisplayed, 10000)
        .click()
        .waitForElementByCss("button[class='welcome-button']", asserters.isDisplayed, 10000)
        .click();
  },
  eulaIconCount : function(browser){
    return browser
        .waitForElementsByCss(".item span:nth-child(1).icon", asserters.isDisplayed, 50000);
  },
  eulaIconRespectiveText : function(browser){
    return browser
        .waitForElementsByCss(".body span:nth-child(1)", asserters.isDisplayed, 50000);
  },
  clickOnGotItButton : function(browser){
    this.closePopupWindow(browser);
    return browser
    .waitForElementByCss(".welcome-modal.ng-scope .accept-button.ng-scope", 3000)
    .click();
  },
  textOfGotItButton : function(browser){
    return browser
    .waitForElementByCss(".welcome-modal.ng-scope .accept-button.ng-scope", 3000);
  },
  clickOnCloseButtonOnNarrativeForFirstUser : function(browser){
    return browser
        .sleep(2000)
        .waitForElementByCss(".icon-close-x-pink.close-modal", asserters.isDisplayed, 90000)
        .click();
  },
  clickOnTextForCreateStudybit : function(browser, textid){
    return browser
    .sleep(1000)
          .waitForElementByCss("#"+textid+" span:nth-child(1)", asserters.isDisplayed, 50000).then(function (StudybitLocation) {
            return browser
                .getLocationInView(StudybitLocation)
                .execute("window.scrollBy(0,-140)")
                .waitForElementByCss("#" + textid + " span:nth-child(1)", asserters.isDisplayed, 90000)
                .click();
              });
  },
  firstTimeUserSBTextCountsOnEula : function(browser){
    return browser
        .elementsByCssSelector("div>.item", asserters.isDisplayed, 50000);
  },
  closefirstTimeUserSBWindow :  function(browser){
    return browser
        .waitForElementByCss(".close.pull-right.ng-scope", asserters.isDisplayed, 50000);
  },
  clickOnClosefirstTimeQuizSBWindow :  function(browser){
    return browser
        //.waitForElementByXPath("//button[contains(text(),'GOT IT!')]", asserters.isDisplayed, 50000)
      .waitForElementByCss("div[class='modal-bg-container modal-container'] button", asserters.isDisplayed, 60000)
      .click();
  },
  clickOnClosefirstTimeUserSBWindow :  function(browser){
    return browser
    .execute("return document.evaluate(\"//button[contains(text(),'GOT IT!')][1]\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()");

  },

  clickOnCancelButtonUnderEula : function(browser){
    return browser
    .sleep(1000)
    .waitForElementByCss("button[class='welcome-button']", asserters.isDisplayed, 10000)
    .click()
    .waitForElementByCss(".welcome-deny-terms.cancel.ng-scope", asserters.isDisplayed, 10000)
    .click();

  },

  firstTimeUserPracticeQuizWindow :  function(browser){
    return browser
        .waitForElementByCss(".modal#quiz", asserters.isDisplayed, 60000);
  },
  firstTimeUserPracticeQuizMsg :  function(browser){
    return browser
        .waitForElementByCss(".modal-bg-container #quiz h1", asserters.isDisplayed, 60000);
  },
  firstTimeUserMessageOnWindow : function(browser){
    return browser
        .waitForElementByCss(".modal-bg-container #filter", asserters.isDisplayed, 60000);
  },
  firstTimeUserMessageOnFilter : function(browser){
    return browser
        .waitForElementByCss(".modal-bg-container #filter h1", asserters.isDisplayed, 60000);
  },
  checkIffirstTimeUserMessageOnFilterPresent : function(browser){
    return browser
        .hasElementByXPath("//div[@class='modal-bg-container modal-container' and @ng-show='showFilterModal']//section//h1", asserters.isDisplayed, 60000);
  },

  clickOnManageMyCourse : function(browser){
    return browser
        // .waitForElementByCss(".courseManage>a:nth-child(2)", asserters.isDisplayed, 30000)
        // .click();
        .execute("return document.evaluate(\"//a[contains(@data-track,'Manage Courses:')]\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()");
  },
  selectCopyCourse : function(browser,courseName){
    return browser
        .waitForElementByCss("#copyExistingCourse", asserters.isDisplayed, 60000)
        .click().then(function () {
          return  browser
                .waitForElementByCss("#select_location", asserters.isDisplayed, 60000)
                .type(courseName)
                .elementByXPathSelectorWhenReady("//a[contains(text(),'Continue')]", 3000)
                .click();
        });
  },

  selectCopyCourseFromAnotherInstructorsCourse : function(browser,courseKey){
    return browser
        .waitForElementByCss("#copyInstructorsCourse", asserters.isDisplayed, 60000)
        .click().then(function () {
          return  browser
                .waitForElementByCss("#instructorCourseKey", asserters.isDisplayed, 60000)
                .type(courseKey)
                .sleep(1000)
                // .elementByXPathSelectorWhenReady("//a[contains(text(),'Continue')]", 3000)
                // .click();
                .execute("return document.evaluate(\"//a[contains(text(),'Continue')]\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()");
        });
  },

  enterSectionName: function(browser, section){
    return browser
            .execute(" return document.getElementById('section').value = '"+section+"'");
  },

  editSectionName: function(browser, section){
    return browser
            .execute(" return document.getElementById('section').value = '"+section+"'");
  },

  validateErrorMessageStatusOnSSO: function(browser){
    return browser
      .hasElementByXPath("//div[@class='errormsglg']");
  },

  verifyEditedCourseNameUnderManageMyCourse :  function (browser) {
    basicpo.clickOnMenu(browser);
    return browser
          .waitForElementByCss(".manage-dropdown>.dropdown>.dropdown-link.ng-binding", asserters.isDisplayed, 60000)
          .click()
          .waitForElementByCss("li #course-name", asserters.isDisplayed, 60000);
    },

    editCourseName : function (browser,courseName) {
        return  browser
        .waitForElementByCss("#courseName", asserters.isDisplayed, 10000)
        .clear()
        .waitForElementByCss("#courseName", asserters.isDisplayed, 10000)
        .click()
        .type(courseName);
    },

    closePopupWindow: function(browser){
      return browser
        .hasElementByCss(".QSIPopOver.SI_efH9LFdAPEJTF8p_PopOverContainer").then(function(popupWindowStatus){
        if(popupWindowStatus){
          console.log(report.reportHeader()
          + report.stepStatusWithData("Feedback popup appears on assignment page", popupWindowStatus, "failure")
          + report.reportFooter());
          return browser
              //.waitForElementByXPath("//div[contains(@class,'QSIPopOver')]//img[contains(@src,'close')]", asserters.isDisplayed, 10000)
              .execute("return document.querySelector('[src*=IM_3pUwl6ck8t3V8oI]').click()")
              // .click();
        }
      });
    },

    activeCoursesLinksOnManageMyCourse: function(browser){
      return browser
        .sleep(2000)
        .waitForElementsByCss("#manageCourseForm .parentSectionName a", asserters.isDisplayed, 30000);
    },

    presenceStatusOfGotItBtn: function(browser){
      return browser
        .sleep(2000)
        .hasElementByCss(".welcome-modal.ng-scope .accept-button.ng-scope");
    },

    verifyPresenceOfCopyCourse : function(browser,courseName, courseKey){
            return browser
                .hasElementByCss("#copyExistingCourse");
    },

    verifyPresenceOfCopyCourseDiffInst : function(browser,courseName, courseKey){
            return browser
                .hasElementByCss("#copyInstructorsCourse");
    }
};
