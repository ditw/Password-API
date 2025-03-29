/***
 * Index.js main script
 * Import the required modules
 */
import fs from "fs";
import axios from "axios";
import AdmZip from "adm-zip";
import base64 from "base-64"; // Buffer can be used also as an alternative

/**
 * Define the parameters in use (constants and variables)
 */
const API_URL = "http://recruitment.warpdevelopment.co.za/api/authenticate"; // API URL to be used for authentication
const USERNAME = "John"; // Username provided by the request
const CV_FILE = "CV.pdf"; // CV file
const SSCRIPT_FILE = "index.js"; // Main script file for the solution
const DICTIONARY_FILE = "dictionary.txt"; // Dictionary file
const DEPENDENCIES_FILE = "package.json"; // Package.json (dependencies) file for the solution
const README_FILE = "readme.txt"; // Documentation file (Readme.md)
const ZIP_FILE = "assessment.zip"; // Upload zip file name for the solution
const MAX_ZIP_FILE_SIZE = 5 * 1024 * 1024; // 5MB size limit
const RATE_LIMIT = 10; // To control how many requests are sent in parallel - Not in use

/**
 * Function to
 * Generates all possible substitutions (matching) of "password" with character replacements.
 * Inner with Upper functions
 * @param {string} word 
 * @returns array
 */
function generatePasswordSubstitutions(word) {
    /**
     * Permutations and possible character replacements
     */
    const replacements = {
        'a': ['a', 'A', '@'],
        's': ['s', 'S', '5'],
        'o': ['o', 'O', '0'],
        'p': ['p', 'P'],
        'w': ['w', 'W'],
        'r': ['r', 'R'],
        'd': ['d', 'D']
    };

    /**
     * Inner function
     * @param {string} word 
     * @returns array
     */
    function generateCombinations(word) {
        if (word.length === 0) return [""];

        const firstChar = word[0];
        // Recursive call until the word characters end
        const combinations = generateCombinations(word.slice(1));
        const variations = replacements[firstChar] || [firstChar];
    
        return variations.flatMap(variant => combinations.map(suffix => variant + suffix));
    }

    return generateCombinations(word);
}

/**
 * Authenticate (login) function using generated passwords.
 * @param {string} apiUrl 
 * @param {string} username 
 * @param {string} passwords
 * @returns void
 */
async function authenticate(apiUrl, username, passwords) {
    for (let password of passwords) {
        // Encoding using base64Encode mecanism
        let credentials = base64.encode(`${username}:${password}`);
        try {
            // API call
            let response = await axios.get(apiUrl, {
                headers: { Authorization: `Basic ${credentials}` },
                validateStatus: false
            });

            if (response.status === 200) {
                console.log(`Success! Requested password found: ${password}`);
                // Return upload URL for submission
                return response.data;
            }
        } catch (error) {
            console.error(`Failure! Error trying password ${password}:`, error.message);
        }
    }
    return null;
}

/**
 * Creates a ZIP file containing the CV, program, dictionary, and readme file.
 * Ensures the ZIP file does not exceed 5MB in term of size.
 * @param {string} cvFile 
 * @param {string} programFile
 * @param {string} programFile
 * @param {string} dependenciesFile  
 * @param {string} readmeFile 
 * @param {string} zipFile 
 * @returns void
 */
function createZipFile(cvFile, programFile, dependenciesFile, dictionaryFile, readmeFile, zipFile) {
    // Generate zip file and attach the required files to the zip
    const zip = new AdmZip();
    zip.addLocalFile(cvFile);
    zip.addLocalFile(programFile);
    zip.addLocalFile(dependenciesFile);
    zip.addLocalFile(dictionaryFile);
    zip.addLocalFile(readmeFile);
    zip.writeZip(zipFile);

    // Check the size of the zip file
    const zipSize = fs.statSync(zipFile).size;
    console.log(`ZIP File Size: ${(zipSize / 1024 / 1024).toFixed(2)} MB`);

    if (zipSize > MAX_ZIP_FILE_SIZE) {
        console.error("Error occured! ZIP file exceeds 5MB limit");
        return null; // No further execution, ending
    }

    return fs.readFileSync(zipFile);
}

/**
 * Uploads the CV ZIP file in Base64 encoding.
 * @param {string} uploadUrl 
 * @param {string} cvFile
 * @param {string} programFile
 * @param {string} dictionaryFile
 * @param {string} dependenciesFile  
 * @param {string} readmeFile 
 * @param {string} zipFile 
 * @returns void
 */
async function upload(uploadUrl, cvFile, programFile, dictionaryFile, dependenciesFile, readmeFile, zipFile) {
    const zipData = createZipFile(cvFile, programFile, dictionaryFile, dependenciesFile, readmeFile, zipFile);
    
    if (!zipData) {
        console.error("Error! Upload failed due to file size limit.");
        return;
    }

    const base64Zip = zipData.toString("base64");
    const payload = {
        Data: base64Zip,
        Name: "NAME",
        Surname: "SURNAME",
        Email: "email@domain.ext"
    };

    try {
        // API call to submit the zip file via POST request using axios
        let response = await axios.post(uploadUrl, payload, {
            headers: { "Content-Type": "application/json" }
        });

        console.log("Success! Upload Response:", response.data);
    } catch (error) {
        console.error("Error! Upload Failed:", error.message);
    }
}

/*** Main Script Execution (Default) ***/

/**
 * Generate package.json if it doesn't exist (additional)
 */
if (!fs.existsSync(DEPENDENCIES_FILE)) {
    const packageJson = {
        name: "password-api",
        version: "1.0.0",
        description: "Automated CV Submission Script",
        dependencies: {
            "adm-zip": "^0.5.16",
            "axios": "^1.7.9",
            "base-64": "^1.0.0",
            "fs": "^0.0.1-security"
        },
        type: "module"
    };
    fs.writeFileSync(DEPENDENCIES_FILE, JSON.stringify(packageJson, null, 2), "utf8");
}

/**
 * Generate passwords - Get all possible permutated password values according to the request
 */
const passwords = generatePasswordSubstitutions("password");
/**
 * Populate the Dictionary file with the generated passwords
 * Each value is provided in a new line
 */
fs.writeFileSync(DICTIONARY_FILE, passwords.join("\n"), "utf8");
/**
 * Authenticate to get the URL upload 
 */
const uploadUrl = await authenticate(API_URL, USERNAME, passwords);

if (uploadUrl) {
    /**
     * Authentication success
     * Upload the CV with the solution
     */
    await upload(uploadUrl, CV_FILE, SSCRIPT_FILE, DICTIONARY_FILE, DEPENDENCIES_FILE, README_FILE, ZIP_FILE);
} else {
    /**
     * Authentication error
     */
    console.log("Error! Failed to authenticate.");
}
