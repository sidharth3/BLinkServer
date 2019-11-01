const path = require('path');

const __projectDir = `${__dirname}/../../`;
const FACE_ENCODING_LIBRARY_PATH = path.resolve(__projectDir + `FaceRecognition/python_scripts/face_encoding_library.json`);

const PROFILE_IMAGE_PATH = (username)=>{
    return path.resolve(__projectDir + `/public/profileimages/${username}.jpg`);
};

const EVENT_IMAGE_PATH = (event_id)=>{
    // return __projectDir + `public/eventimages/${event_id}.jpg`;
    return path.resolve(__dirname + '/../../public/eventimages/'  +`${event_id}.jpg`);
};

module.exports = { 
    FACE_ENCODING_LIBRARY_PATH, 
    PROFILE_IMAGE_PATH,
    EVENT_IMAGE_PATH
};