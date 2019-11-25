//Server
const express = require('express');
const config = require('./src/constants/config');
const app = express();
const bodyParse = require('body-parser');
const uuid = require('uuid');
//path
const path = require('path');
const fs = require('fs');
//DB
const DBUsers = require('./src/db/dbusers');
const DBEvents = require('./src/db/dbevents');
const DBRegistrations = require('./src/db/dbregistrations');
const DBConnections = require('./src/db/dbconnections');
const DBFace = require('./src/db/dbface');
const DBInit = require('./src/db/dbinit');
const DBOrgs = require('./src/db/dborg');
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
const dbregistrations = new DBRegistrations(firestore);
const dbconnections = new DBConnections(firestore);
const dborgs = new DBOrgs(firestore);

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
        
        let user = await dbusers.login(username, password);
        if (user !== undefined) {            
            Respond.Success(user, res);
        }
        else {
            throw Errors.LOGIN.ERROR_WRONG_PASSWORD;
        }
    } catch (error) {
        Respond.Error(error, res);
    }
});

app.post('/loginOrg', async (req,res)=>{
    let org_username = req.body.org_username;
    let password = req.body.password;

    try {
        CheckRequiredFields({org_username, password});        

        let success = await dborgs.login(org_username, password);
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

//user end 
app.post('/register', async (req,res)=> {
    let username = req.body.username;
    let password = req.body.password;
    let displayname = req.body.displayname;    
    let email = req.body.email;        

    try {
        let payload = {username, displayname, email, password};
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
        //create user account        
        let user = await dbusers.createUser({username, displayname, email, password});
        
        if (user !== undefined) {            
            Respond.Success(user, res);
        }
        else {
            throw Errors.REGISTRATION.ERROR_REGISTRATION_FAILED;
        }
        
    } catch (error) {
        console.log(error);
        Respond.Error(error, res);
    }    
});

app.post('/registerMoreInfo', async (req,res)=> {

    let username = req.body.username;;
    let company = req.body.company; //optional    
    let position = req.body.position; //optional    
    let bio = req.body.bio; //optional    
    let facebook = req.body.facebook; //optional    
    let instagram = req.body.instagram; //optional    
    let linkedin = req.body.linkedin; //optional   
    
    try {
        CheckRequiredFields({username, bio});        
        let payload = {company: company || "", position: position || "", bio: bio, facebook: facebook || "", instagram: instagram || "", linkedin: linkedin || ""};        
        
        //create user account        
        let user = await dbusers.addMoreInfoForUser(payload, username);
        
        if (user !== undefined) {            
            Respond.Success(user, res);
        }
        else {
            throw Errors.REGISTRATION.ERROR_REGISTRATION_FAILED;
        }
        
    } catch (error) {
        console.log(error);
        Respond.Error(error, res);
    }    
})

app.post('/registerOrg', async (req,res)=> {
    let username = req.body.username;
    let password = req.body.password;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let organisation_name = req.body.organisation_name;        

    try {
        let payload = {username, first_name, last_name, email, password, organisation_name};
        CheckRequiredFields(payload);        

        try {
            await dborgs.getOrg(username);
            //if this does not fail, the user exists
            throw Errors.REGISTRATION.ERROR_USERNAME_TAKEN;
        } catch (error) {
            if(error != Errors.USERS.ERROR_USER_DOESNT_EXIST)
            {
                throw error;
            }    
        }
        //create user account        
        let success = await dborgs.createOrg({username, first_name, last_name, email, password, organisation_name});
        
        if (success) {            
            Respond.Success(Responses.REGISTER_SUCCESS, res);
        }
        else {
            throw Errors.REGISTRATION.ERROR_REGISTRATION_FAILED;
        }
        
    } catch (error) {
        console.log(error);
        Respond.Error(error, res);
    }    
});

app.post('/registerFace', upload.single('image_file'), async (req,res)=>{    
    let image_file = req.file;
    let username = req.body.username;

    try {
        CheckRequiredFields({username, image_file});     
        let face_encoding = await PythonScripts.face_encoding(image_file);      
        let face_encoding_string = JSON.stringify(face_encoding);
        let success = await dbusers.addFaceEncodingForUser(face_encoding_string, username);
        if(success)
        {            
            await dbface.appendFaceEncodingToLibrary(username, face_encoding);
            //if created user successfully, move the image to profile pictures  
            Files.MoveImage(image_file.path,Paths.PROFILE_IMAGE_PATH(username)); 
            Respond.Success(Responses.REGISTER_SUCCESS, res);
        }
        else
        {
            throw Errors.FACE.ERROR_COULD_NOT_ASSIGN_FACE;
        }
        
    } catch (error) {
        if(image_file)
        {
            Files.DeleteFile(image_file.path);
        }

        console.log(error);
        Respond.Error(error, res);
    }
})

app.post('/getEvents', async (req,res)=> {

    let username = req.body.username;

    try {        
        //if no username, all events are explore            
        let events = await dbevents.getEvents();
        if(!username) {
            Respond.Success(events,res);
            return;
        }

        let eventsForUser = await dbregistrations.getUserRegisteredEventIds(username);
        let upcoming_ids = eventsForUser.unattended_event_ids;
        let past_ids = eventsForUser.attended_event_ids;

        let output = {
            upcoming : [],
            past : [],
            explore : []
        }
        for(let event of events) {
            if (past_ids.indexOf(event.event_id) != -1 ) {
                output.past.push(event);
            }
            else if (upcoming_ids.indexOf(event.event_id) != -1 ){                
                output.upcoming.push(event);
            }
            else {                
                output.explore.push(event);
            }
        }
        
        Respond.Success(output, res);        
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
    let username = req.body.username;
    let event_id = req.body.event_id;
    
    try {
        CheckRequiredFields({username, event_id});
        let exists = await dbusers.userExists(username);
        if(!exists){
            throw Errors.USERS.ERROR_USER_DOESNT_EXIST;
        }
        await dbregistrations.registerUserForEvent(username, event_id);        
        Respond.Success(Responses.REGISTER_SUCCESS, res);
    } catch (error) {
        console.log(error);
        Respond.Error(error, res);
    }
});

app.post('/markAttendanceForEvent', async (req,res)=> {
    let username = req.body.username;
    let event_id = req.body.event_id;

    try {
        CheckRequiredFields({username, event_id});
        let exists = await dbusers.userExists(username);
        if(!exists){
            throw Errors.USERS.ERROR_USER_DOESNT_EXIST;
        }
        await dbregistrations.markUserAttendanceForEvent(username, event_id);        
        Respond.Success(Responses.REGISTER_SUCCESS, res);
    } catch (error) {
        Respond.Error(error, res);
    }
});

app.post('/registrationsForEvent', async (req,res)=> {
    let event_id = req.body.event_id;

    try {
        CheckRequiredFields({event_id});
        let registrations = await dbregistrations.registrationsForEvent(event_id);        
        Respond.Success(registrations, res);
    } catch (error) {
        Respond.Error(error, res);
    }
});


// not checking for org_username because only organiser can use this page
app.post('/createEvent', async (req,res)=> {
    let username = req.body.username; 
    let event_id = req.body.event_id;
    let event_name = req.body.event_name;
    let date = req.body.date;
    let price = req.body.price;

    try {
        let payload = {org_username: username, event_id,event_name,date,price};
        CheckRequiredFields(payload);        
        let exists = await dborgs.orgExists(username);
        if(!exists){
            throw Errors.USERS.ERROR_USER_DOESNT_EXIST;
        }
        await dbevents.createEvent({username, event_id,event_name,date,price});
        Respond.Success(Responses.REGISTER_SUCCESS, res);
    } catch (error) {
        console.log(error);
        Respond.Error(error, res);
    }
});

app.post('/getProfile', async (req,res)=> {
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

app.post('/getConnectionsSummary', async (req,res) => {
    let username = req.body.username;

    try {
        CheckRequiredFields({username});        

        //1: Get the recent connection users
        //2 Get the suggested Users

        let connections = await dbconnections.getRecentConnectionsForUser(username);

        let recent = [];
        let recommended = [];
        let all = [];
        let allusers = await dbusers.getUsers();

        for(let user of allusers) {
            //if this user is a connection
            let connection = connections.find((x => x.username == user.username));
            //if cannot find, recommend this user
            if (connection == undefined && user.username != username) { 
                user.password = undefined;
                user.face_encoding = undefined;
                recommended.push(user);                
            }            
        }
        
        for(let connection of connections) {
            let userData = allusers.find(x => {                                
                return x.username == connection.username;
            });
            if (userData != undefined && userData.username != username) {                
                userData.password = undefined;
                userData.face_encoding = undefined;

                const sevenDays = 60*60*24*7*1000;                
                if((Date.now() - parseInt(connection.time)) < sevenDays){
                    recent.push(userData);                
                }

                all.push(userData);
            }
        }


        Respond.Success({
            recent,            
            recommended,
            all
        }, res);        
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
        console.log(event_id);
        Respond.Error(error,res);
    }
});

/**
 * Takes in an image, and connects users in the image
 */
app.post('/connect', upload.single('image_file'), async (req,res)=>{
    let image_file = req.file;
    let username = req.body.username;
    
    try {
        CheckRequiredFields({username, image_file});
        let time = Date.now();
        let usernames = await PythonScripts.get_face_usernames(image_file);        
        let after = Date.now();

        if(usernames.indexOf(username) == -1)
        {
            throw Errors.FACE.ERROR_USER_NOT_IN_IMAGE;
        }

        if(usernames.length <= 1)
        {
            throw Errors.FACE.ERROR_NOT_ENOUGH_FACES;
        }        
        
        console.log(`Time taken to process connection: ${after - time}`);
        
        let image_id = uuid.v1().toString();
        await dbconnections.connectUsers(usernames, image_id);
        Files.MoveImage(image_file.path,Paths.PROFILE_IMAGE_PATH(image_id)); 
        Respond.Success(usernames, res);        
    } catch (error) {
        if(image_file !== undefined)
        {
            Files.DeleteFile(image_file.path); //remove images after processing
        }
        
        console.log(error);
        Respond.Error(error, res);
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

