const Errors = require('../constants/errors');

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
            console.log(Errors.ERROR_USER_RETRIEVAL_FAILED);
        }
    
        return users;        
    }

    async creatUser()
    {

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
                if(userData.password == this.hashedpassword(password))
                {
                    return true;
                }
                else
                {
                    throw Errors.ERROR_WRONG_PASSWORD;
                }
            }
            else
            {
                throw Errors.ERROR_USER_DOESNT_EXIST;
            }
        } catch (error) {            
            if(error == Errors.ERROR_USER_DOESNT_EXIST || error == Errors.ERROR_WRONG_PASSWORD)
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
        return password;
    }
}

module.exports = DBUsers;