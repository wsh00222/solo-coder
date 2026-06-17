const fs = require('fs');
const path = require('path');

const SURVEYS_FILE = path.join(__dirname, '..', 'data', 'surveys.json');
const RESPONSES_FILE = path.join(__dirname, '..', 'data', 'responses.json');

function readJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    return [];
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function readSurveys() {
  return readJSON(SURVEYS_FILE);
}

function writeSurveys(surveys) {
  writeJSON(SURVEYS_FILE, surveys);
}

function readResponses() {
  return readJSON(RESPONSES_FILE);
}

function writeResponses(responses) {
  writeJSON(RESPONSES_FILE, responses);
}

module.exports = {
  readSurveys,
  writeSurveys,
  readResponses,
  writeResponses,
  SURVEYS_FILE,
  RESPONSES_FILE
};
