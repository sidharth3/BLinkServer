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

dbusers.login("mooselliot", "12345").then((loginSuccess)=> console.log(loginSuccess));

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
        let success = await dbusers.login(username, password);
        if (success) {
            Respond.Success(Responses.LOGIN_SUCCESS, res);
        }
        else {
            throw Errors.ERROR_WRONG_PASSWORD;
        }
    } catch (error) {
        Respond.Error(error, res);
    }
});

app.post('/register', async (req,res)=> {

});

app.listen(config.port,()=>{
    console.log(`Server started on port ${config.port}`);
});


