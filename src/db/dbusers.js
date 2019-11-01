const Errors = require('../constants/errors');
const bcrypt = require('bcrypt');
const config = require('../constants/config');

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

    async connectUsers(username_a, username_b)
    {
        let userDocA = this.collection().doc(username_a);
        let user_a = await userDocA.get();
        let userDocB = this.collection().doc(username_b);
        let user_b = await userDocB.get();

        if(!user_a.exists || !user_b.exists)
        {
            throw Errors.USERS.ERROR_USER_DOESNT_EXIST;
        }

        let connections_collection = this.firestore.collection('connections')
        let uuid = "1234";
        connections_collection.doc(uuid).set([username_b, username_b]);
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