const fs = require('fs');
const path = require('path');
const Errors = require('../constants/errors');

const CleanDirectory = (directory) => {
    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlink(path.join(directory, file), err => {
                if (err) throw err;
            });
        }
    });
}

const DeleteFile = (filepath) => {
    fs.unlink(filepath, err => {
        if (err) throw err;
    });
}

const MoveImage = (from_path, to_path) => {
    fs.rename(from_path, to_path, (error) => {
        if (error) {
            console.log(error);
            throw {
                ...Errors.INTERNAL_SERVER_ERROR,
                data: error
            };
        }
    });
}

const ReadFile = (path) => {
    return new Promise((resolve,reject)=>{
        fs.readFile(path,function(error, data){
            if(error) {
                reject(error);
            }        
            else
            {
                resolve(data);
            }
        })        
    });
}

const WriteFile = (path, data) => {
    return new Promise((resolve,reject)=>{
        fs.writeFile(path, data, function(error) {    
            if(error) {
                reject(error);
            }        
            else
            {
                resolve();
            }
        }); 
    });
}

module.exports = { DeleteFile, CleanDirectory, MoveImage, ReadFile, WriteFile }