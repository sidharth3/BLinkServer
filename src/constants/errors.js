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
        }
    },
    EVENTS: {
        ERROR_EVENTS_RETRIEVAL_FAILED : {
            status: "ERROR_EVENTS_RETRIEVAL_FAILED",
            statusText : "Error",
            message : "Failed to load events"        
        },
        ERROR_USER_NOT_REGISTERED : {
            status: "ERROR_USER_NOT_REGISTERED",
            statusText : "Error",
            message : "This user is not registered for this event"         
        },
        ERROR_EVENT_REGISTER_FAILED : {
            status: "ERROR_EVENT_REGISTER_FAILED",
            statusText : "Error",
            message : "Failed to register for event"         
        },
        ERROR_EVENT_DOESNT_EXIST : {
            status: "ERROR_EVENT_DOESNT_EXIST",
            statusText : "Error",
            message : "Event does not exist"                     
        },
        ERROR_EVENT_ID_TAKEN : {
            status: "ERROR_EVENT_ID_TAKEN",
            statusText : "Error",
            message : "Event ID has already been taken"                     
        }
    },
    USERS: {
        ERROR_USER_RETRIEVAL_FAILED : {
            status: "ERROR_USER_RETRIEVAL_FAILED",
            statusText : "Error",
            message : "Failed to load users"        
        },
        ERROR_USER_DOESNT_EXIST : {            
            status: "ERROR_USER_DOESNT_EXIST",
            statusText : "Error",
            message : "The user you are looking for does not exist"        
        }
    },   
    FACE : {
        ERROR_NOT_ENOUGH_FACES : {
            status: "ERROR_NOT_ENOUGH_FACES",
            statusText : "Error",
            message : "The connection cannot be made because not enough faces were detected"
        },
        ERROR_USER_NOT_IN_IMAGE : {
            status: "ERROR_USER_NOT_IN_IMAGE",
            statusText : "Error",
            message : "The connection cannot be made because the requesting user is not in the image"            
        },
        ERROR_COULD_NOT_ASSIGN_FACE :{
            status: "ERROR_COULD_NOT_ASSIGN_FACE",
            statusText : "Error",
            message : "The image could not be assigned to this user. Please try again later"            
        }
    },
    PYTHON : {
        ERROR_FACE_ENCODING_FAILED : {            
            status: "ERROR_FACE_ENCODING_FAILED",
            statusText : "Error",
            message : "Face encoding failed"        
        },
        MALFORMED_FACE_IMAGE : {            
            status: "MALFORMED_FACE_IMAGE",
            statusText : "Error",
            message : "The image did not present a valid face"        
        }
    },
    RESOURCE : {
        ERROR_RESOURCE_NOT_FOUND : {
            status : "ERROR_RESOURCE_NOT_FOUND",
            statusText : "Missing Resource",
            message: "The resource you are looking for does not exist"
        }
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