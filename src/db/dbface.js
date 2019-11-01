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
                library[user.username] = JSON.parse(user.face_encoding);                
            }
        }
        return library;
    }

    async loadFaceEncodingLibrary()
    {
        try {
            let face_encoding_library = await this.getFaceEncodingLibrary();
            let data = JSON.stringify(face_encoding_library);
            await Files.WriteFile(Paths.FACE_ENCODING_LIBRARY_PATH, data);
            console.log("=====FACE ENCODINGS LOADED=====");        
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Adds the user's face encoding to the local library     
     * @param {*} username 
     * @param {*} face_encoding 
     */
    async appendFaceEncodingToLibrary(username, face_encoding)
    {
        try {            
            let data = await Files.ReadFile(Paths.FACE_ENCODING_LIBRARY_PATH);
            let face_encodings = JSON.parse(data);
            face_encodings[username] = face_encoding;
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = DBFace;