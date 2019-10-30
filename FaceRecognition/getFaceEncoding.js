const {PythonShell} = require('python-shell');

let options = {
    mode: 'text',
    pythonPath: './FaceRecognition/python_venv_ubuntu/bin/python3',
    pythonOptions: ['-u'], // get print results in real-time
    scriptPath: './FaceRecognition/python_scripts',
  };


const getFaceEncoding = (filename) => {
    return new Promise(
        (resolve, reject) => {

            options = {...options, args : [`./FaceRecognition/images/${filename}`] }

            PythonShell.run("face_encoding.py", options, 
                (err, results) => {
                    if (err) {
                        return reject(err);
                    }

                    results = results.map((r)=>JSON.parse(r));

                    return resolve(results)
                });
        }
    );
}

module.exports = getFaceEncoding;

// getFaceEncoding('sean.jpg')
// .then((result) => {console.log(result)})
// .catch((err) => {console.log(err)});