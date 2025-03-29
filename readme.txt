# Project

Automated CV Submission Script via Rest API using Node.JS.

## Requirements

* NodeJS version v22.13.1
* NMP version 10.9.2
* NVM can be used for node version installation and dependencies (optional)

## Installation

* Run `npm install` to install dependencies (required modules).

## Usage

* Run `npm start` or `node index.js` to start and run the solution.

## Notes

* The solution has the following libraries and modules installed for usage.
    * `adm-zip` (for uploading zip file)
    * `axios` (to make HTTP requests from a Node.js environment)
    * `base-64` (for base64Encode - basic authetication set)
    * `fs` (for File System and upload file)
* The solution generates and populates a dictionary.txt file for password character mapping.
* The solution uses ES module as a type defined in the ECMAScript standard.
* To regenerate the dictionary.txt file (when running the solution), clean the file to refill the permutated values before running the script.
* Make sure that your CV is available in the main root and has the name as `CV.pdf`.
* The solution contains the following files:
    * `index.js`
    * `dictionary.txt`
    * `package.json`
    * `readme.txt` (this file)
* No test specified at the current stage for this solution but Jest or Jasmine can be used for this purpose (Unit tests).
* The script generates a package.json if it doesn't exist (additional)
* By knowing the **rate limit** of the API call, a **batch calls** can be set to optimize the API call for authetication and control how many requests can be sent in parallel (uisng Promise.allSettled). 
* Helper functions can be moved to a separate file call utils.js, authetication.js, upload.js, ... for better code maintainability, since there are multiple files to be uploaded already, the code provided is kept in one index.js file.
