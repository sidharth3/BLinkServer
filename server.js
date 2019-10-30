const express = require('express');
const config = require('./src/constants/config');
const path = require('path');
const app = express();
const bodyParse = require('body-parser');
const firebase = require('firebase-admin');
const serviceAccount = require('./credentials/blink-4df57-firebase-adminsdk-0wo3v-abda4aeb6e.json');
const DBUsers = require('./src/db/dbusers');
const DBEvents = require('./src/db/dbevents');
const DBInit = require('./src/db/dbinit');
const Respond = require('./src/helpers/Respond');
const Responses = require('./src/constants/responses');
const Errors = require('./src/constants/errors');

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://blink-4df57.firebaseio.com"
});

const firestore = firebase.firestore();

// const dbinit = new DBInit(firestore);
// dbinit.initializeDB();
const dbusers = new DBUsers(firestore);
const dbevents = new DBEvents(firestore);

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

app.post('/register', async (req,res)=> {
    let username = req.body.username;
    let password = req.body.password;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let birth_year = req.body.birth_year;

    try {
        let payload = {username, first_name, last_name, email, password, birth_year};
        CheckRequiredFields(payload);        

        let success = await dbusers.createUser(payload);
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

app.post('/getProfile', async (req,res)=> {

});

app.listen(config.port,()=>{
    console.log(`Server started on port ${config.port}`);
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


