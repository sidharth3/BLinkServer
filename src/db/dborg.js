const Errors = require('../constants/errors');
const bcrypt = require('bcrypt');
const config = require('../constants/config');
const uuidv1 = require('uuid/v1');

class DBOrgs {
    constructor(firestore)
    {
        this.firestore = firestore;
    }

    collection()
    {
        return this.firestore.collection("ogranisers");
    }

    async orgExists(org_username){
        var user = await this.collection().doc(org_username).get();
        return user.exists;
    }   
    /**
     * Returns a list of all users
     */  

    async getOrg(org_username)
    {
        try {
            var user = await this.collection().doc(org_username).get();
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
     * @param {{username, first_name, last_name, email, password, birth_year}} payload 
     */
    async createOrg(payload)
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
            userDoc.set({
                org_username : payload.org_username,
                first_name: payload.first_name,
                last_name: payload.last_name,
                email: payload.email,
                password: hashedPassword,
                organisation_name: payload.organisation_name,
                events_organised : [],
                status: 'PENDING'                
            });

            return true;
        }

        return false;
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
            let user = await this.collection().doc(org_username).get();
            
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

module.exports = DBOrgs;