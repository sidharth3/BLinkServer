module.exports = {
    LOGIN : {
        ERROR_WRONG_PASSWORD : {
            status: "ERROR_WRONG_PASSWORD",
            statusText : "Error",
            message : "The username/password you have entered is incorrect"        
        },
        ERROR_USER_DOESNT_EXIST : {
            status: "ERROR_USER_DOESNT_EXIST",
            statusText : "Error",
            message : "This user does not exist"        
        },
    },
    REGISTRATION : {
        ERROR_USERNAME_TAKEN : {
            status: "ERROR_USERNAME_TAKEN",
            statusText : "Error",
            message : "This username is already taken"        
        },
        ERROR_REGISTRATION_FAILED : {
            status: "ERROR_REGISTRATION_FAILED",
            statusText : "Error",
            message : "Registration Failed"        
        },
    },
    EVENTS: {
        ERROR_EVENTS_RETRIEVAL_FAILED : {
            status: "ERROR_EVENTS_RETRIEVAL_FAILED",
            statusText : "Error",
            message : "Failed to load events"        
        },
    },
    USERS: {
        ERROR_USER_RETRIEVAL_FAILED : {
            status: "ERROR_USER_RETRIEVAL_FAILED",
            statusText : "Error",
            message : "Failed to load users"        
        },
    },    
    INVALID_REQUEST_ERROR : {
        status: "INVALID_REQUEST_ERROR",
        statusText : "Error",
        message : "Requested variables were not provided"        
    },
    INTERNAL_SERVER_ERROR : {
        status: "INTERNAL_SERVER_ERROR",
        statusText : "Internal Server Error",
        message : "Please try again later"        
    }
}