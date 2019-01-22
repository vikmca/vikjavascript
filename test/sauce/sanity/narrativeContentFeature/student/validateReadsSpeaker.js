require('colors');
var wd = require('wd');
var testData = require("../../../../../test_data/data.json");
var session = require("../../../support/setup/browser-session");
var stringutil = require("../../../util/stringUtil");
var pageobject = stringutil.getPlatform();
var envName = stringutil.getEnvironment();
var loginPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/loginpo");
var basicpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/basicpo.js");
var tocPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/tocpo");
var brainPage = require("../../../support/pageobject/" + pageobject + "/" + envName + "/brianpo");
var readerSpeakerpo = require("../../../support/pageobject/" + pageobject + "/" + envName + "/readerSpeakerpo.js");
var userSignOut = require("../../../support/pageobject/" + pageobject + "/" + envName + "/userSignOut");
var report = require("../../../support/reporting/reportgenerator");
var courseHelper = require("../../../support/helpers/courseHelper");
var path = require('path');
var scriptName = path.basename(__filename);
describe(scriptName + 'READER SPEAKER VALIDATION', function() {
	var browser;
	var allPassed = true;
	var userType;
	var courseName;
	var product;
	var data;
	var productData;
	var totalTime;
	var serialNumber = 0;

	before(function(done) {
		browser = session.create(done);
		userType = "student";
		product = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_PRODUCT.toString());
		if (product === "default") {
			product = testData.existingCourseDetails.product;
		}
		courseName = stringutil.removeBoundaryQuotes(process.env.RUN_FOR_COURSE.toString());
		if (courseName === "default") {
			courseName = testData.existingCourseDetails.coursename;
		}
		data = loginPage.setLoginData(userType);
		productData = loginPage.getProductData();
		totalTime = 0;
		//Reports
		console.log(report.formatTestName("READER SPEAKER VALIDATION"));
		console.log(report.formatTestData(data.urlForLogin, data.userId, product, courseName));
		console.log(report.formatTestScriptFileName("***Student/validateReaderSpeaker.js***"));
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

	if (process.env.RUN_IN_PLATFORM.toString() === "\"mobile\"" || process.env.RUN_IN_PLATFORM.toString() === "\"iOS\"") {
		console.log(report.reportHeader() +
			report.stepStatusWithData("ReadSpeaker functionality is not avalable for ", "mobile devices", "success") +
			report.reportFooter());
	} else {
		it(". Login to 4LTR platform as student", function(done) {
			this.timeout(courseHelper.getElevatedTimeout());
			data = loginPage.setLoginData(userType);
			//Reports
			console.log(report.printLoginDetails(data.userId, data.password));
			loginPage.loginToApplication(browser, userType, done);
		});

		it(". Select a Course and launch", function(done) {
			this.timeout(courseHelper.getElevatedTimeout());
			loginPage.launchACourse(userType, courseName, browser, done);
		});

	it(". LTR-5453 :: Validate that course should be launched successfully and should not be navigated to login page", function(done) {
		loginPage.validateCourseLaunchNotNavigateToLoginPage(browser, done);
	});

		it(". Click on List view", function(done) {
			tocPage.selectListView(browser).then(function() {
				done();
			});
		});

		it(". Navigate to a Chapter", function(done) {
			var chapternavigation = productData.chapter.topic.casassignments.chapter;
			tocPage.navigateToAChapterByListView(productData.chapter.id, browser, chapternavigation);
			done();
		});

		it(". Navigate to a topic", function(done) {
			tocPage.navigateToATopicByListView(browser, done, productData.chapter.topic.casassignments.topic, 0);
		});

		it(". Validate that on clicking on Readerpeaker button, Reader speaker tray should be expanded", function(done) {
			readerSpeakerpo.clickOnReaderSpeakerButton(browser).then(function() {
				readerSpeakerpo.validateReaderSpeakerTrayExpanded(browser).then(function(expandedReaderSpeakerStatus) {
					if (expandedReaderSpeakerStatus) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Reader Speaker tray expanded", expandedReaderSpeakerStatus, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Reader Speaker tray expanded", expandedReaderSpeakerStatus, "failure") +
							report.reportFooter());
					}
				});
			});
		});

		it(". Validate that Reader Speaker icon should present on narrative view", function(done) {
			tocPage.readerSpeakerImageIcon(browser).then(function(icon) {
				if (icon.indexOf('player2') > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Readerpeaker icon is present", icon, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Readerpeaker icon is present", icon, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Validate that Reader Speaker is in play state when user clicks on Reads Speaker Icon", function(done) {
			readerSpeakerpo.validatePlayButtonPresentOnReaderSpeakerTray(browser).then(function(playButton) {
				readerSpeakerpo.validateStopButtonPresentOnReaderSpeakerTray(browser).then(function(pauseButton) {
					readerSpeakerpo.validateReadSpeakerMode(browser, "Pause").then(function(playModeStatus) {
						readerSpeakerpo.clickOnPauseButton(browser).then(function() {
							readerSpeakerpo.validateReadSpeakerMode(browser, "Play").then(function(pauseModeStatus) {
								if (playButton && pauseButton && playModeStatus && pauseModeStatus) {
									console.log(report.reportHeader() +
										report.stepStatusWithData("Play Button status : " + playButton + ", Pause Button status : " + pauseButton + ", Play Mode status : " + playModeStatus + ", Pause Mode status ", pauseModeStatus, "success") +
										report.reportFooter());
									done();
								} else {
									console.log(report.reportHeader() +
										report.stepStatusWithData("Play Button status : " + playButton + ", Pause Button status : " + pauseButton + ", Play Mode status : " + playModeStatus + ", Pause Mode status ", pauseModeStatus, "failure") +
										report.reportFooter());
								}
							});
						});
					});
				});
			});
		});

		it(". Validate that Progress bar and volume button should be present", function(done) {
			readerSpeakerpo.validateProgressBar(browser).then(function(progressBarStatus) {
				readerSpeakerpo.validateVolumeButton(browser).then(function(volumeButtonStatus) {
					if (progressBarStatus && volumeButtonStatus) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Progress Bar status :" + progressBarStatus + ", Volume Button status", volumeButtonStatus, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Progress Bar status :" + progressBarStatus + ", Volume Button status", volumeButtonStatus, "failure") +
							report.reportFooter());
					}
				});
			});
		});

		it(". Validate that volume increase/decrese bar should not be present without clicking on volume icon", function(done) {
			readerSpeakerpo.statusOfIncreseOrDecreaseVolumeButton(browser).then(function(statusOfIncreseOrDecreaseVolumeButtons) {
				if (!statusOfIncreseOrDecreaseVolumeButtons) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Volume Increase/Decrease bar should not be present without clicking on volume icon :", !statusOfIncreseOrDecreaseVolumeButtons, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Volume Increase/Decrease bar should not be present without clicking on volume icon :", !statusOfIncreseOrDecreaseVolumeButtons, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Validate that volume increase/decrese bar should  be present after clicking on volume icon", function(done) {
			readerSpeakerpo.clickOnVolumeButton(browser).then(function(statusOfIncreseOrDecreaseVolumeButton) {
				readerSpeakerpo.statusOfIncreseOrDecreaseVolumeButton(browser).then(function(statusOfIncreseOrDecreaseVolumeButton) {
					readerSpeakerpo.validateVolumeSlider(browser).then(function(statusOfIncreseOrDecreaseVolumeSlider) {
						readerSpeakerpo.clickOnVolumeButton(browser).then(function(statusOfIncreseOrDecreaseVolumeButton) {
							if (statusOfIncreseOrDecreaseVolumeButton && statusOfIncreseOrDecreaseVolumeSlider) {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Volume Increase/Decrease bar and slider should be present after clicking on volume icon :", statusOfIncreseOrDecreaseVolumeButton && statusOfIncreseOrDecreaseVolumeSlider, "success") +
									report.reportFooter());
								done();
							} else {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Volume Increase/Decrease bar and slider should be present after clicking on volume icon :", statusOfIncreseOrDecreaseVolumeButton && statusOfIncreseOrDecreaseVolumeSlider, "failure") +
									report.reportFooter());
							}
						});
					});
				});
			});
		});

		it(". Validate that setting button should be present on expanded view and settting button window should be not displayed without clicking on setting icon", function(done) {
			readerSpeakerpo.validateSettingButtonPresenceStatus(browser).then(function(settingButtonStatus) {
				readerSpeakerpo.settingWindowDisplayedStatus(browser).then(function(settingWindowDisplayedNoneStatus) {
					if (settingButtonStatus && !settingWindowDisplayedNoneStatus) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Setting icon presence status :" + settingButtonStatus + " and setting window presence status without clicking on icon", !settingWindowDisplayedNoneStatus, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Setting icon presence status :" + settingButtonStatus + " and setting window presence status without clicking on icon", !settingWindowDisplayedNoneStatus, "failure") +
							report.reportFooter());
					}
				});
			});
		});

		it(". Click on settting button and validate that setting window should be displayed", function(done) {
			readerSpeakerpo.clickOnSetting(browser).then(function() {
				readerSpeakerpo.settingWindowDisplayedStatus(browser).then(function(settingWindowDisplayedStatus) {
					if (settingWindowDisplayedStatus) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Setting window presence status after clicking on setting icon", settingWindowDisplayedStatus, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Setting window presence status after clicking on setting icon", settingWindowDisplayedStatus, "failure") +
							report.reportFooter());
					}
				});
			});
		});

		it(". Validate that Reader Speaker Logo on reader speaker setting window ", function(done) {
			readerSpeakerpo.validateReaderSpeakerLogo(browser).then(function(readerSpeakerLogo) {
				if (readerSpeakerLogo) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Reader Speaker logo present status", readerSpeakerLogo, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Reader Speaker logo present status", readerSpeakerLogo, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Validate that reader speaker listen present on reader speaker setting window ", function(done) {
			readerSpeakerpo.validateReaderSpeakerListenOnSettingWindow(browser).text().then(function(readerSpeakerListenText) {
				if (readerSpeakerListenText.indexOf(testData.readerSpeaker.readerSpeakerListen) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Reader Speaker " + testData.readerSpeaker.readerSpeakerListen + " is compared against ", readerSpeakerListenText, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Reader Speaker " + testData.readerSpeaker.readerSpeakerListen + " is compared against ", readerSpeakerListenText, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Validate that reader speaker heading text should be present on reader speaker setting window ", function(done) {
			readerSpeakerpo.getHeadingTextOfSettingWindow(browser).text().then(function(readerSpeakerHeadingText) {
				if (readerSpeakerHeadingText.indexOf(testData.readerSpeaker.readerSpeakerHeading) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Reader Speaker heading text " + testData.readerSpeaker.readerSpeakerHeading + " is compared against ", readerSpeakerHeadingText, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Reader Speaker heading text " + testData.readerSpeaker.readerSpeakerHeading + " is compared against ", readerSpeakerHeadingText, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Validate that Speed, popup and restore menu present on reader speaker setting window ", function(done) {
			readerSpeakerpo.validateSpeedFieldPresent(browser).then(function() {
				readerSpeakerpo.validatePopUpButtonPresent(browser).then(function() {
					readerSpeakerpo.validateReStoreButtonPresent(browser).then(function() {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Speed, popup and restore menu present on reader speaker setting window", "success", "success") +
							report.reportFooter());
						done();
					});
				});
			});
		});

		it(". Validate that Close button should prsent on reader speaker setting window", function(done) {
			readerSpeakerpo.closeButtonOnSettingPopUp(browser).text().then(function(closeBtnText) {
				if (closeBtnText.indexOf(testData.readerSpeaker.closeButtonText) > -1) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Reader Speaker Close button text " + testData.readerSpeaker.closeButtonText + " is compared against ", closeBtnText, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Reader Speaker Close button text " + testData.readerSpeaker.closeButtonText + " is compared against ", closeBtnText, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Validate cross button present on reader speaker setting window for closing", function(done) {
			readerSpeakerpo.validateCrossButtonPresent(browser, testData.readerSpeaker.closeButtonText).then(function(closeBtnText) {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Reader Speaker Close button text ", testData.readerSpeaker.closeButtonText, "success") +
					report.reportFooter());
				done();
			});
		});

		it(". Validate that the labels under Reading panel on reader speaker setting window", function(done) {
			readerSpeakerpo.verifyLabelsOnReadingPanel(browser, 1, testData.readerSpeaker.readinglabel1).then(function() {
				readerSpeakerpo.verifyLabelsOnReadingPanel(browser, 2, testData.readerSpeaker.readinglabel2).then(function() {
					readerSpeakerpo.verifyLabelsOnReadingPanel(browser, 3, testData.readerSpeaker.readinglabel3).then(function() {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Labels ",
								testData.readerSpeaker.readinglabel1 + "," +
								testData.readerSpeaker.readinglabel2 + "," +
								testData.readerSpeaker.readinglabel3,
								" under Reading panel on reader speaker setting window", "success") +
							report.reportFooter());
						done();
					});
				});
			});
		});

		it(". Validate that the labels under General panel on reader speaker setting window", function(done) {
			readerSpeakerpo.verifyLabelsOnGeneralPanel(browser, 1, testData.readerSpeaker.generallabel1).then(function() {
				readerSpeakerpo.verifyLabelsOnGeneralPanel(browser, 2, testData.readerSpeaker.generallabel2).then(function() {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Labels ",
							testData.readerSpeaker.generallabel1 + "," +
							testData.readerSpeaker.generallabel2,
							" under General panel on reader speaker setting window", "success") +
						report.reportFooter());
					done();
				});
			});
		});

		it(". Validate that the buttons and labels under Restore default setting panel on reader speaker setting window", function(done) {
			readerSpeakerpo.verifyLabelsOnRestoreSettingPanel(browser, testData.readerSpeaker.restorelabel1).then(function() {
				readerSpeakerpo.verifyButtonOnRestoreSettingPanel(browser).getAttribute('value').then(function(buttonText) {
					if (buttonText.indexOf(testData.readerSpeaker.restoreButtonText) > -1) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Reader Speaker Restore button text " + testData.readerSpeaker.restoreButtonText + " is compared against ", buttonText, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Reader Speaker Restore button text " + testData.readerSpeaker.restoreButtonText + " is compared against ", buttonText, "failure") +
							report.reportFooter());
					}
				});
			});
		});

		it(". Validate that checkbox state should be changed after clicking on slow label checkbox under setting window ", function(done) {
			readerSpeakerpo.verifyCheckedStatus(browser).then(function(checkedLabelByDefault) {
				readerSpeakerpo.clickOnslowcheckbox(browser).then(function() {
					readerSpeakerpo.verifyCheckedStatus(browser).then(function(checkedLabel) {
						if (checkedLabel.indexOf(testData.readerSpeaker.selectedCheckboxLabel) > -1) {
							console.log(report.reportHeader() +
								report.stepStatusWithData("After clicking on slow checkbox the bael is changed now  " + testData.readerSpeaker.selectedCheckboxLabel + " is compared against ", checkedLabel, "success") +
								report.reportFooter());
							done();
						} else {
							console.log(report.reportHeader() +
								report.stepStatusWithData("After clicking on slow checkbox the bael is changed now  " + testData.readerSpeaker.selectedCheckboxLabel + " is compared against ", checkedLabel, "failure") +
								report.reportFooter());
						}
					});
				});
			});
		});

		it(". Validate that on clicking on restore default setting button, default checkbox should be selected and setting window should be closed", function(done) {
			readerSpeakerpo.verifyButtonOnRestoreSettingPanel(browser).click().then(function() {
				readerSpeakerpo.clickOnCloseButton(browser).then(function() {
					readerSpeakerpo.clickOnSetting(browser).then(function() {
						readerSpeakerpo.verifyCheckedStatus(browser).then(function(checkedLabel) {
							if (checkedLabel.indexOf(testData.readerSpeaker.selectedCheckboxLabelAfterRestore) > -1) {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Default checkbox is selected" + testData.readerSpeaker.selectedCheckboxLabelAfterRestore + " is compared against ", checkedLabel, "success") +
									report.reportFooter());
								done();
							} else {
								console.log(report.reportHeader() +
									report.stepStatusWithData("Default checkbox is selected" + testData.readerSpeaker.selectedCheckboxLabelAfterRestore + " is compared against ", checkedLabel, "failure") +
									report.reportFooter());
							}
						});
					});
				});
			});
		});

		it(". Validate that on clicking on close button setting window should be closed", function(done) {
			readerSpeakerpo.clickOnCloseButton(browser).then(function() {
				readerSpeakerpo.settingWindowDisplayedStatus(browser).then(function(settingWindowDisplayedNoneStatus) {
					if (!settingWindowDisplayedNoneStatus) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Setting window presence status without clicking on icon", !settingWindowDisplayedNoneStatus, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Setting window presence status without clicking on icon", !settingWindowDisplayedNoneStatus, "failure") +
							report.reportFooter());
					}
				});
			});
		});

		it(". Validate that on reader speaker tray should be in expanded view after closing the setting window", function(done) {
			readerSpeakerpo.validateReaderSpeakerTrayExpanded(browser).then(function(expandedReaderSpeakerStatus) {
				if (expandedReaderSpeakerStatus) {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Reader Speaker tray expanded", expandedReaderSpeakerStatus, "success") +
						report.reportFooter());
					done();
				} else {
					console.log(report.reportHeader() +
						report.stepStatusWithData("Reader Speaker tray expanded", expandedReaderSpeakerStatus, "failure") +
						report.reportFooter());
				}
			});
		});

		it(". Validate that Close button prsent on Reader Speaker tray", function(done) {
			readerSpeakerpo.closePlayer(browser, testData.readerSpeaker.textOfClosePlayer).then(function() {
				console.log(report.reportHeader() +
					report.stepStatusWithData("Reader Speaker Close button text ", testData.readerSpeaker.textOfClosePlayer, "success") +
					report.reportFooter());
				done();
			});
		});

		it(". Validate that Reader Speaker should be un-expanded after clicking on close player button", function(done) {
			readerSpeakerpo.clickOnClosePlayer(browser).then(function() {
				readerSpeakerpo.validateReaderSpeakerTrayExpanded(browser).then(function(unExpandedReaderSpeakerStatus) {
					if (!unExpandedReaderSpeakerStatus) {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Reader Speaker tray un-expanded", !unExpandedReaderSpeakerStatus, "success") +
							report.reportFooter());
						done();
					} else {
						console.log(report.reportHeader() +
							report.stepStatusWithData("Reader Speaker tray un-expanded", !unExpandedReaderSpeakerStatus, "failure") +
							report.reportFooter());
					}
				});
			});
		});

		it(". Log out as Student", function(done) {
			this.timeout(courseHelper.getElevatedTimeout());
			userSignOut.userSignOut(browser, done);
		});

	}
});
