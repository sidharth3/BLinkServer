const Errors = require('../constants/errors');
const bcrypt = require('bcrypt');
const config = require('../constants/config');
const uuidv1 = require('uuid/v1');

class DBUsers {
    constructor(firestore)
    {
        this.firestore = firestore;
    }

    collection()
    {
        return this.firestore.collection("users");
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
     * @returns {Promise<boolean>} if successfully registered
     * @param {{username, first_name, last_name, email, password, birth_year, face_encoding_string}} payload 
     */
    async createUser(payload)
    {
        let userDoc = this.collection().doc(payload.username);
        let user = await userDoc.get();
        if(user.exists)
        {
            throw Errors.REGISTRATION.ERROR_USERNAME_TAKEN;
        }
        else
        {
            let hashedPassword = await this.hashedpassword(payload.password);
            this.collection().doc(payload.username);
            userDoc.set({
                username : payload.username,
                first_name: payload.first_name,
                last_name: payload.last_name,
                email: payload.email,
                password: hashedPassword,
                birth_year: payload.birth_year,
                face_encoding: payload.face_encoding_string
            });

            return true;
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
                connections_collection.doc(id).set({0: connection[0], 1: connection[1]});
            }
        }                
    }

    /**
     * Verifies user credentials against database
     * @param {string} username 
     * @param {string} password 
     * @returns {Promise<boolean>} successful log in or not
     * @throws 
     */
    async login(username, password)
    {
        try {
            let user = await this.collection().doc(username).get();
            
            //user exists && verify hashed password
            if(user.exists)
            {
                let userData = user.data();                                
                //userData password is hashed, must use bcrypt to compare
                let validPassword = await bcrypt.compare(password, userData.password);
                if(validPassword)
                {
                    return true;
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