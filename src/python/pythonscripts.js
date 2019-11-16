const { PythonShell } = require('python-shell');
const Errors = require('../constants/errors');

const face_encoding = (image_file) => {
    return new Promise(
        (resolve, reject) => {
            PythonShell.run("face_encoding.py", {
                mode: 'text',
                pythonOptions: ['-u'], // get print results in real-time,
                scriptPath: './FaceRecognition/python_scripts',
                args: [`./FaceRecognition/images/${image_file.filename}`]
            },
                (err, results) => {
                    if (err) {
                        console.log(err);
                        return reject(Errors.PYTHON.ERROR_FACE_ENCODING_FAILED);
                    }

                    if (results[0] == "FAILED_BAD_IMAGE_NOFACE" || results[0] == "FAILED_BAD_IMAGE_FILE")
                    {
                        return reject(Errors.PYTHON.MALFORMED_FACE_IMAGE)
                    }
                    else
                    {
                        results = results.map((r) => JSON.parse(r));
                        return resolve(results[0])
                    }   
                });
        }
    );
}

const get_face_usernames = (image_file) => {
    return new Promise(
        (resolve, reject) => {
            PythonShell.run("face_usernames.py", {
                mode: 'text',
                pythonOptions: ['-u'], // get print results in real-time                
                scriptPath: './FaceRecognition/python_scripts',
                args: [`./FaceRecognition/images/${image_file.filename}`,`./FaceRecognition/python_scripts/face_encoding_library.json` ]
            },
                (err, results) => {
                    if (err) {
                        console.log(err);
                        return reject({...Errors.PYTHON.ERROR_FACE_ENCODING_FAILED, data: err});
                    }                    

                    results = results.map((r) => JSON.parse(r));
                    return resolve(results[0])
                });
        }
    );
}
module.exports = {face_encoding, get_face_usernames};