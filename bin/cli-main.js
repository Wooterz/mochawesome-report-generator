'use strict';

/* eslint-disable no-console */
var path = require('path');
var fs = require('fs-extra');
var report = require('../lib/main');

var JsonErrRegex = /^Unexpected token .* in JSON/;
var fileExtRegex = /\.[^.]*?$/;
var ERRORS = {
  NO_FILE: 'You must supply a mochawesome data file to create a report.',
  BAD_JSON: 'There was a problem parsing mochawesome data. Please ensure the JSON file is valid.',
  GENERIC: 'There was a problem loading mochawesome data.'
};

/**
 * Validate the data file
 *
 */
function validateInFile(dataInFile) {
  var dataIn = void 0;
  // Was a JSON file provided?
  if (!dataInFile) {
    return { err: ERRORS.NO_FILE };
  }

  // Try to read and parse the file
  try {
    dataIn = JSON.parse(fs.readFileSync(dataInFile, 'utf-8'));
  } catch (err) {
    if (err.code === 'ENOENT') {
      return { err: 'The data file: ' + dataInFile + ' could not be found.' };
    } else if (JsonErrRegex.test(err.message)) {
      return { err: ERRORS.BAD_JSON };
    }
    return { err: ERRORS.GENERIC };
  }

  return dataIn;
}

/**
 * Get options to send to report generator
 *
 */
function getOptions(args) {
  var reportFilename = args.reportFilename,
      reportDir = args.reportDir,
      reportTitle = args.reportTitle,
      reportPageTitle = args.reportPageTitle,
      inlineAssets = args.inlineAssets,
      enableCharts = args.enableCharts,
      enableCode = args.enableCode,
      dev = args.dev;

  var filename = reportFilename.replace(fileExtRegex, '') + '.html';
  return {
    reportHtmlFile: path.join(reportDir, filename),
    reportTitle: reportTitle,
    reportPageTitle: reportPageTitle,
    inlineAssets: inlineAssets,
    enableCharts: enableCharts,
    enableCode: enableCode,
    dev: dev
  };
}

/**
 * Main CLI Program
 *
 */
function mareport(processArgs) {
  var args = processArgs || { _: [] };

  // Try to load the test data
  var reportData = validateInFile(args._[0]);

  // Check for error in data load
  /* istanbul ignore else */
  if (reportData && reportData.err) {
    console.log(reportData.err);
    process.exitCode = 1;
    return;
  }

  // Good so far, now generate the report
  report.createSync(reportData, getOptions(args));
}

module.exports = mareport;