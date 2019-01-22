# 4LTR Automation

4LTR Automation using Sauce Labs

## Getting Started

### Run Tests on one browser

```
grunt test:sauce:chrome
grunt test:sauce:firefox
grunt test:sauce:explorer
```

## Installation

Install nodejs https://nodejs.org/en/download/
node v4.4.3 or above
npm install -g grunt-cli
npm install --global mocha
JDK 1.6 or above
Install Atom from https://atom.io/
Install selenium server standalone jar file form http://docs.seleniumhq.org/download/


### Run Parallel Tests

```
grunt test:sauce:parallel
```

## Execution ::

For execution of scripts on Chrome or Internet explorer you need to have executable files for both drivers respectively.
You can download these executable files from below links
Chrome:  https://sites.google.com/a/chromium.org/chromedriver/ or https://drive.google.com/file/d/0B4FqnK04LJRnNWZFOEE3Wjd4aFk/view
Interner Explorer: https://www.seleniumhq.org/download/ or  https://drive.google.com/file/d/0B4FqnK04LJRnbi1nUkc0YzlYUkU/view
GeckoDriver : https://github.com/mozilla/geckodriver/

UP selenium server ::: java -Dwebdriver.chrome.driver="chromedriver.exe" -Dwebdriver.ie.driver="IEDriverServer.exe" -Dwebdriver.gecko.driver="geckodriver.exe" -jar "selenium-server-standalone".jar

Note : It may be possible the different versions of selenium server support Chrome, FF and IE browsers. In that case you have to up selenium server with specific browser's driver separately  

Please follow the instructions to execute the tests on local:

Checkout the code from STASH

To Execute the single test suite grunt --gruntfile "gruntfilename".js --target=environment --product="productName" --course="CourseName" ----grid=http://"ipAddress":4444/wd/hub --browser="browserName" --index="user credential index"

Result Files:

The Test Execution Results will be stored in the following directory once the test has completed
./4ltrAutomatedTests/mochawesome-reports/js/GF_servicesETE_result.html (for complete test suite)

## Documentation

Grunt :: https://gruntjs.com/
Mocha :: https://mochajs.org/
Nodejs :: https://nodejs.org/en/
Underscore :: http://underscorejs.org/
Chai Assertion Library :: http://chaijs.com/plugins/chai-as-promised/

_Steps_For_Uses_Of_4LTR_Project_Automation_And_Debugging_

1. Clone the project code  from clone url"http://stash.corp.web:7990/scm/fourltr/4ltr-automated-tests.git"
2. use command "npm install" at the place of package.json and package-lock.json files location for installing all dependencies
3. Grunt files have been created according to the features:
	a. GF_CreateMultipleStudentsFromASpecifiedCourseKey.js :: it contains two files which validate the course creation and copy course Features
  b. GF_e2e_assignment_validation.js :: It contains all class files related to assignments validation(Assessment, Chapter Content and Document and Links)
	c. GF_all_remaining_feature_validation.js : it contains all files related to addition features like multi student, TA and switch and drop course and Drop students
	d. GF_MediaQuiz.js :: It contains all class files which are validation media quiz.(Now this feature is working only for ORGB title so we need to execute this grunt file only for ORGB title)
	Note :: We execute this in smoke job but if any of the class of GF_servicesETE.js will fail then we need to execute locally
	e. GF_servicesETE.js :: This grunt file is for validating smoke feature
	f. GF_StudyBoardFeature.js :: it contains all class files related to Studyboard Features(This time we have added the class files for Students for common features validation among student and instructor )
	g. GF_cas_validation.js :: We execute this grunt file at the time of analytics Release
	h. GF_ccs.js :: We can execute this grunt file at the time of CCS release(Course creation related files)
4. Execute the grunt files on Win7/8.1 and Mac :: by using command :: grunt --gruntfile "gruntfilename".js --target=environment --product="productName" --course="CourseName" ----grid=http://"ipAddress":4444/wd/hub --browser="browserName" --index="user credential index"
		a. gruntfile name :: Where gruntfile name in listed in step 3
		b. Product :: Product name will be like MKTG9, PSYCH4, ORGB
		c. Course name:: Course name will be created course name for the selected product and user(index value)
		d. ip address :: ip address will be the ip of the targeted machine
		e. index :: index will be the user in environment.json file where environment value is integration, staging and production
5. Execute the grunt files on Android ::
	grunt --gruntfile GF_MediaQuiz.js --target="integration" --product="ORGB5" --course="Automation : ORGB" --grid=http://#SystemIP:4723/wd/hub --platform="mobile" --udid=#device_UDID" -- deviceName="#device_name"--platformVersion=="#platformVersion_Of_Device"  --platformName="Android" --browser="chrome" --index=1
	a. #SystemIP :: system ip will be the ip of the desktop where device is connected
	b. udid :: is udid of the device
	c. platformVersion :: Version of Android device
	d. deviceName :: Name of the mobile device
6. Execute the grunt files on iPhone ::
		grunt --gruntfile GF_MediaQuiz.js --target="integration" --product="ORGB5" --course="Automation : ORGB" --grid=http://#SystemIP:4723/wd/hub --iosplatformName="iOS" --platform="mobile" --bundleId=#created_bundleId" -- deviceName="#device_name"--platformVersion=="#platformVersion_Of_Device"  --iosbrowser="safari" --index=1
		a. #SystemIP :: system ip will be the ip of the desktop where device is connected
		c. iosplatformName :: Version of iPhone device
		d. deviceName :: Name of the mobile device
		e. bundleId:: Created bundle id by XCode
		Note:: Example has been mentioned in browser-session.js
7. For starting mobile automation refer the doc :: https://docs.google.com/document/d/1NDUgUSG2J1s1jNO8ZjyJv1yppGOFgoKkuO6SJ0EoieQ/edit?usp=sharing


## Examples

_4LTR project Framework Introduction_
1. Basic information of the Framework structure ::  4LTR java script framework is divided into 4 parts
	a. sanity : It contains all test class Files
	b. support : It is divided into 5 parts
		i. helpers : it contains dynamic time out value
		ii. pagefactory :: it contains the locators which was used repeatedly
 		iii. pageobject :: It contains all the action files according to platform and environments
		IV. Reporting : It contains custom report which is created by Nirmal
		V. Setup : it contains browser session initiator file.
 			In browser-session.js file creates the browser session with their platform dependencies. We can pass the dependencies value from command line arguments. Location :: test>sauce>Support>sauce>setup>test\sauce\support\setup\browser-session.js
	c. util : It contains utility functions
	d. test data: It contains test data which is using in our framework and implemented in .json format

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

_Also, please don't edit files in the "dist" subdirectory as they are generated via Grunt. You'll find source code in the "lib" subdirectory!_

## Release History
_(Nothing yet)_

## License
Copyright (c) 2014 Nirmal Balasundaram  
Licensed under the MIT license.
