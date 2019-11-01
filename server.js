//Server
const express = require('express');
const config = require('./src/constants/config');
const app = express();
const bodyParse = require('body-parser');
//path
const path = require('path');
const fs = require('fs');
//DB
const DBUsers = require('./src/db/dbusers');
const DBEvents = require('./src/db/dbevents');
const DBFace = require('./src/db/dbface');
const DBInit = require('./src/db/dbinit');
//Helpers
const Respond = require('./src/helpers/Respond');
const Files = require('./src/helpers/Files');
//Constants
const Paths = require('./src/helpers/Paths');
const Responses = require('./src/constants/responses');
const Errors = require('./src/constants/errors');
const PythonScripts = require('./src/python/pythonscripts');
const FACE_IMAGE_PATH = './FaceRecognition/images';
//Firebase
const firebase = require('firebase-admin');
const serviceAccount = require(Paths.CREDENTIALS_PATH);

const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, FACE_IMAGE_PATH);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
})

const upload = multer({storage});

JSON.parse(`["x"]`)

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://blink-4df57.firebaseio.com"
});

const firestore = firebase.firestore();

// const dbinit = new DBInit(firestore);
// dbinit.initializeDB();
const dbusers = new DBUsers(firestore);
const dbevents = new DBEvents(firestore);

const dbface = new DBFace(firestore);
dbface.loadFaceEncodingLibrary();

app.use(bodyParse.json());
app.use(bodyParse.urlencoded({extended: false }));
app.set('json spaces', 2);

app.get('/', (req,res)=>{
    res.send("Hello World");
});

app.post('/login', async (req,res)=>{
    let username = req.body.username;
    let password = req.body.password;

    try {
        CheckRequiredFields({username, password});        

        let success = await dbusers.login(username, password);
        if (success) {
            Respond.Success(Responses.LOGIN_SUCCESS, res);
        }
        else {
            throw Errors.LOGIN.ERROR_WRONG_PASSWORD;
        }
    } catch (error) {
        Respond.Error(error, res);
    }
});

app.post('/register', upload.single('faceimage'), async (req,res)=> {
    let username = req.body.username;
    let password = req.body.password;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let birth_year = req.body.birth_year;
    let image_file = req.file;

    try {
        let payload = {username, first_name, last_name, email, password, birth_year, image_file};
        CheckRequiredFields(payload);        

        try {
            await dbusers.getUser(username);
            //if this does not fail, the user exists
            throw Errors.REGISTRATION.ERROR_USERNAME_TAKEN;
        } catch (error) {
            if(error != Errors.USERS.ERROR_USER_DOESNT_EXIST)
            {
                throw error;
            }    
        }
        
        let face_encoding = await PythonScripts.face_encoding(image_file);        
        
        //create user account
        let face_encoding_string = JSON.stringify(face_encoding);
        let success = await dbusers.createUser({username, first_name, last_name, email, password, birth_year, face_encoding_string});
        await dbface.appendFaceEncodingToLibrary(username, face_encoding);

        if (success) {
            //if created user successfully, move the image to profile pictures            
            Files.MoveImage(image_file.path,Paths.PROFILE_IMAGE_PATH(username));
            Respond.Success(Responses.REGISTER_SUCCESS, res);
        }
        else {
            throw Errors.REGISTRATION.ERROR_REGISTRATION_FAILED;
        }
        
    } catch (error) {
        Files.DeleteFile(image_file.path);
        console.log(error);
        Respond.Error(error, res);
    }    
});

app.get('/getEvents', async (req,res)=> {

    try {
        let events = await dbevents.getEvents();
        Respond.Success(events, res);        
    } catch (error) {
        console.log(error);
        Respond.Error(error, res);
    }
});

app.get('/getEventDetail', async (req,res)=> {
    let event_id = req.body.event_id;

    try {
        CheckRequiredFields({event_id});        
        let eventDetail = await dbevents.getEventDetail(event_id);
        Respond.Success(eventDetail, res);        
    } catch (error) {
        console.log(error);
        Respond.Error(error, res);
    }
});

app.post('/registerForEvent', async (req,res)=> {
    
});

app.get('/getProfile', async (req,res)=> {
    let username = req.body.username;

    try {
        CheckRequiredFields({username});        
        let userData = await dbusers.getUser(username);
        Respond.Success(userData, res);        
    } catch (error) {
        console.log(error);
        Respond.Error(error, res);
    }
});

app.get('/getProfileImage/:username', (req, res) => {
    var username = req.params.username;

    try {
        CheckRequiredFields({username});
        var imagePath = Paths.PROFILE_IMAGE_PATH(username);
        if (fs.existsSync(imagePath)) {
            res.sendFile(imagePath);
        }
        else {
            throw Errors.RESOURCE.ERROR_RESOURCE_NOT_FOUND;
        }
        
    } catch (error) {
        console.log(error);
        Respond.Error(error,res);
    }
});

app.get('/getEventImage/:event_id', (req, res) => {
    var event_id = req.params.event_id;

    try {
        CheckRequiredFields({event_id});
        var imagePath = Paths.EVENT_IMAGE_PATH(event_id);
        if (fs.existsSync(imagePath)) {
            res.sendFile(imagePath);
        }
        else {
            throw Errors.RESOURCE.ERROR_RESOURCE_NOT_FOUND;
        }
        
    } catch (error) {
        console.log(error);
        Respond.Error(error,res);
    }
});

/**
 * Takes in an image, and connects users in the image
 */
app.post('/connect', upload.single('selfieimage'), async (req,res)=>{
    let selfie_image = req.file;

    try {
        CheckRequiredFields({selfie_image});
        let usernames = await PythonScripts.get_face_usernames(selfie_image);
        await dbusers.connectUsers(usernames);
        Respond.Success(usernames, res);        
    } catch (error) {
        console.log(error);
        Respond.Error(error, res);
    } finally {
        Files.DeleteFile(selfie_image.path); //remove images after processing
    }
});

app.listen(config.port,()=>{
    console.log(`=====SERVER STARTED ON PORT: ${config.port}=====`);
});

function CheckRequiredFields(object)
{
    let missing_fields = [];
    for(let key in object)
    {
        if(object[key] === undefined || object[key] === null)
        {            
            missing_fields.push(key);
        }
    }

    if(missing_fields.length != 0)
    {
        throw {
            status: Errors.INVALID_REQUEST_ERROR.status,
            statusText: Errors.INVALID_REQUEST_ERROR.statusText,
            message: Errors.INVALID_REQUEST_ERROR.message + `. Missing Fields: ${missing_fields.join(', ')}`
        };
    }
}


