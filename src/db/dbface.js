const path = require('path');
const Files = require('../helpers/Files');
const Errors = require('../constants/errors');
const Paths = require('../helpers/Paths');

class DBFace
{
    constructor(firestore)
    {
        this.firestore = firestore;
    }

     /**
     * Returns a list of all users
     */
    async getUsers(){        
        var users = [];
        try {
            var snapshot = await this.firestore.collection("users").get();
            snapshot.forEach((user)=> {
                users.push(user.data());
            })    
        } catch (error) {
            console.log(Errors.USERS.ERROR_USER_RETRIEVAL_FAILED);
        }    
        return users;        
    }    

    async getFaceEncodingLibrary(){
        let users = await this.getUsers();        
        let library = {};
        for(let user of users)
        {
            if(user.username && user.face_encoding)
            {
                library[user.username] = user.face_encoding;
                
            }
        }
        return library;
    }

    async loadFaceEncodingLibrary()
    {
        try {
            let face_encoding_library = await this.getFaceEncodingLibrary();
            let filepath = Paths.FACE_ENCODING_LIBRARY_PATH;
            let data = JSON.stringify(face_encoding_library);
            await Files.WriteFile(filepath, data);
            console.log("=====FACE ENCODINGS LOADED=====");        
        } catch (error) {
            console.log(error);
        }
    }

    async appendFaceEncodingToLibrary()
    {
        try {
            Files.ReadFile()
        } catch (error) {
            
        }
    }
}

module.exports = DBFace;