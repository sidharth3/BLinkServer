const { PythonShell } = require('python-shell');
const Errors = require('../constants/errors');

const face_encodings = (image_file) => {

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

                    results = results.map((r) => JSON.parse(r));
                    return resolve(results)
                });
        }
    );
}

module.exports = {face_encodings};