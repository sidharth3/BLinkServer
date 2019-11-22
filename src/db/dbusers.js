const Errors = require('../constants/errors');
const bcrypt = require('bcrypt');
const config = require('../constants/config');
const uuidv1 = require('uuid/v1');

/*
type User =
{
    username : string,
    password : string,
    email : string,
    displayname : string,
    position : string, 
    company : string,
    bio : string,
    facebook : string,
    linkedin : string,
    instagram : string,
    face_encoding : string,
    status: string //PENDING or ACTIVE
}
*/

class DBUsers {
    constructor(firestore)
    {
        this.firestore = firestore;
    }

    collection()
    {
        return this.firestore.collection("users");
    }

    NewUser()
    {

    }

    async userExists(username){
        var user = await this.collection().doc(username).get();
        return user.exists;
    }   
    /**
     * Returns a list of all users
     */
    async getUsers(){        
        var users = [];
        try {
            var snapshot = await this.collection().get();
            snapshot.forEach((user)=> {
                users.push(user.data());
            })    
        } catch (error) {
            console.log(Errors.USERS.ERROR_USER_RETRIEVAL_FAILED);
        }
    
        return users;        
    }    

    /**
     * 
     * @param {*} username 
     * @returns {Promise<User>} returns a user
     */
    async getUser(username)
    {
        try {
            var user = await this.collection().doc(username).get();
            if(user.exists)
            {
                let userData = user.data()
                userData.password = undefined;
                return userData;
            }
            else
            {
                throw Errors.USERS.ERROR_USER_DOESNT_EXIST;
            }
        } catch (error) {
            throw error;
        }   
    }

    /**
     * Registers a new user, assuming username is not already taken
     * @throws
     * @returns {Promise<{username, displayname, email, bio, company, position, instagram, linkedin,facebook, face_encoding,status}>} if successfully registered
     * @param {{username, displayname, password, email}} payload 
     */
    async createUser(payload)
    {
        if(payload.username == "" || payload.password == "" || payload.displayname == "" || payload.email == "") {
            throw Errors.REGISTRATION.ERROR_EMPTY_REGISTRATION_DETAILS;
        }

        let userDoc = this.collection().doc(payload.username);
        let user = await userDoc.get();
        if(user.exists)
        {
            throw Errors.REGISTRATION.ERROR_USERNAME_TAKEN;
        }
        else
        {
            
            //hash password
            let hashedPassword = await this.hashedpassword(payload.password);
            let userData = {
                username : payload.username,
                password : hashedPassword,
                displayname : payload.displayname,
                email : payload.email,
                bio : "",
                company : "",
                position : "",                
                instagram: "",
                linkedin: "",
                facebook: "",
                face_encoding: "[]",
                status: "PENDING"
            };
                                    
            //update db
            await userDoc.set(userData);            

            //dont send password to user
            userData.password = undefined;
            return userData;
        }
    
    }

    
    async addFaceEncodingForUser(face_encoding_string, username)
    {
        let userDoc = this.collection().doc(username);
        let user = await userDoc.get();
        if(!user.exists)
        {
            throw Errors.USERS.ERROR_USER_DOESNT_EXIST;
        }
        else
        {    
            let userData = user.data();        
            userData.status = 'ACTIVE'; //user only becomes active after uploading face
            userData.face_encoding = face_encoding_string;
            await userDoc.set(userData)            ;
            userData.password = undefined;
            return userData;
        }
    }


    /**
     * 
     * @param {{bio, company, position, facebook, instagram, linkedin}} payload 
     * @param {*} username 
     * @returns {Promise<{username, displayname, email, bio, company, position, instagram, linkedin, facebook, face_encoding,status}>}
     */
    async addMoreInfoForUser(payload,username)
    {
        let userDoc = this.collection().doc(username);
        let user = await userDoc.get();
        if(!user.exists)
        {
            throw Errors.USERS.ERROR_USER_DOESNT_EXIST;
        }
        else
        {    
            let userData = user.data();                    
            userData.bio = payload.bio;
            userData.company = payload.company;
            userData.position = payload.position;
            userData.facebook = payload.facebook;
            userData.instagram = payload.instagram;
            userData.linkedin = payload.linkedin;            
            await userDoc.set(userData);            
            userData.password = undefined;
            return userData;
        }
    }

    /**
     * 
     * @param {Array.<String>} usernames 
     */
    async connectUsers(usernames)
    {
        // let connections = [];
        let connections_collection = this.firestore.collection('connections');
        
        for(let i=0; i<usernames.length;i++)
        {   
            let username = usernames[i];
            //image is not taken 
            if(username == "UNKNOWN")        
            {
                continue;
            }
            
            let userDoc = this.collection().doc(username);
            let user = await userDoc.get();        
            
            if(!user.exists)
            {
                throw Errors.USERS.ERROR_USER_DOESNT_EXIST;
            }
            
            for (let j = i + 1; j < usernames.length; j++) {
                // connections.push([usernames[i], usernames[j]]);
                let connection = [usernames[i], usernames[j]];                
                //so that retrieval is easy, connection sorted
                connection.sort();
                let id = uuidv1().toString();
                await connections_collection.doc(id).set({0: connection[0], 1: connection[1]});
            }
        }                
    }

    /**
     * Verifies user credentials against database
     * @param {string} username 
     * @param {string} password 
     * @returns {Promise<User>} successful log in or not
     * @throws 
     */
    async login(username, password)
    {
        try {
            if(username == "" || password == "") {
                throw Errors.LOGIN.ERROR_EMPTY_LOGIN_DETAILS;
            }

            let user = await this.collection().doc(username).get();
            
            //user exists && verify hashed password
            if(user.exists)
            {
                let userData = user.data();                                
                //userData password is hashed, must use bcrypt to compare
                let validPassword = await bcrypt.compare(password, userData.password);
                if(validPassword)
                {
                    userData.password = undefined;
                    return userData;
                }
                else
                {
                    throw Errors.LOGIN.ERROR_WRONG_PASSWORD;
                }
            }
            else
            {
                throw Errors.LOGIN.ERROR_USER_DOESNT_EXIST;
            }
        } catch (error) {            
            if(error == Errors.LOGIN.ERROR_USER_DOESNT_EXIST || error == Errors.LOGIN.ERROR_WRONG_PASSWORD)
            {
                throw error;
            }
            else
            {
                console.log(error);
                throw Errors.INTERNAL_SERVER_ERROR;
            }
        }
    }

    /**
     * Hashes and salts password
     * @param {string} password 
     */
    hashedpassword(password)
    {
        return new Promise((resolve,reject)=>{
            bcrypt.hash(password, config.SALT_ROUNDS, (error,hash)=>{
                if (error)
                {
                    reject(error);
                }
    
                resolve(hash);
            });
        })
    }
}

module.exports = DBUsers;
