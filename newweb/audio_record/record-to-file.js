// Imports modules.

const fs = require('fs');
const path = require('path');
const AudioRecorder = require('./index.js');
// Constants.
const DIRECTORY = './audio_record/examples-recordings';

// Initialize recorder and file stream.
const audioRecorder = new AudioRecorder({
    program: 'sox',
    silence: 0
}, console);

// Create path to write recordings to.
if (!fs.existsSync(DIRECTORY)) {
    fs.mkdirSync(DIRECTORY);
}
// Create file path with random name.
const fnameForReturn = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 4).concat('.wav');
const fileName = path.join(DIRECTORY, fnameForReturn);
console.log('Writing new recording file at: ', fileName);

var fileStream;

// Keep process alive.
process.stdin.resume();

var startRec = function() {
    // Create write stream.
    fileStream = fs.createWriteStream(fileName, {encoding: 'binary'});
    // Start and write to the file.
    audioRecorder.start().stream().pipe(fileStream);
}

var endRec = function () {
    // Log information on the following events
    audioRecorder.stream();
    audioRecorder.stop();
}

module.exports = {
    startRec : startRec,
    endRec : endRec,
    fileName : fnameForReturn
}