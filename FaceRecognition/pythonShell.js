const {PythonShell} = require('python-shell');

const options = {
    mode: 'text',
    pythonPath: './python_venv_ubuntu/bin/python3',
    pythonOptions: ['-u'], // get print results in real-time
    scriptPath: './python_scripts',
  };


const pythonShellHandler = (err, results) => {
    if (err) {
        console.log("Error!", err);
        return;
    }

    console.log("Results:", results);
}

PythonShell.run('python_test.py', options, pythonShellHandler);