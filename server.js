const express = require('express');
const config = require('./config');
const path = require('path');
const app = express();
const bodyParse = require('body-parser');
const firebase = require('firebase-admin');
const serviceAccount = require('./credentials/blink-4df57-firebase-adminsdk-0wo3v-abda4aeb6e.json');
const DBUsers = require('./src/db/dbusers');
const DBEvents = require('./src/db/dbevents');
const Respond = require('./src/helpers/Respond');
const Responses = require('./src/constants/responses');
const Errors = require('./src/constants/errors');


firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://blink-4df57.firebaseio.com"
});

const firestore = firebase.firestore();

const dbusers = new DBUsers(firestore);
const dbevents = new DBEvents(firestore);

dbusers.login("mooselliot", "12345").then((loginSuccess)=> console.log(loginSuccess));
// getUsers().then((users)=>{
//     console.log(users);
// });

/* Prepare different collections and documents, there'll be 4 collections 
 #1 Users 
 #2 Event
 #3 Event Users 
 #4 Connections */

//Setting up Collection 1: Users, Document: USernames, Field: User/Userid/Email/password/Events attended
let colRef_users = firestore.collection('users');
let users_list = ["sean"];
for (let i of users_list){
    let docRef_users = colRef_users.doc(i);
    let set_users = docRef_users.set({
        first_name: '',
        last_name: '',
        email:'',
        password:'',
        birth_year:''
    });
}

console.log("users loaded");


//Setting up Collection 2 : Events, Document : UUIDs, Field: Event Name, Date, Organiser UUID, Price
let colRef_events = firestore.collection('events');
let events_list = ["123"];
for (let i of events_list){
    let docRef_events = colRef_events.doc(i);
    let set_events = docRef_events.set({
        event_name : '',
        date: '', //in DDMMYY
        organiser_id: '',
        price: '' 
    }) 
}

console.log("events loaded");


//Setting up collection 3: organisers, Document: UUIDs, Field : USer/User ID/Email/PAssword/ORganisation/Events organised
let colRef_organisers = firestore.collection('organisers');
let organisers_list = ["ustd"];
for (let i of organisers_list){
    let docRef_organisers = colRef_organisers.doc(i);
    let set_organisers = docRef_organisers.set({
        first_name : '',
        last_name :'',
        email:'',
        password:'',
        organisation_name:'',
        events_organised: '',
    }) 
}

console.log("organisers loaded");

//Setting up collection 4: Connection. Document: Random number. Field: User A: USer B
let colRef_connections = firestore.collection('connections');
let connections_num = ["0"];
let userA_list = ["viet"]
let userB_list = ["jie lin"]
for (let i=0; i < connections_num.length; i++){
    let docRef_connections = colRef_connections.doc(connections_num[i]);
    let set_connections = docRef_connections.set({
        0 : [userA_list[i],userB_list[i]]
    })
}
console.log("connections loaded");



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

        if(success)
        {
            Respond.Success(Responses.LOGIN_SUCCESS, res);
        }
        else
        {
            throw Errors.ERROR_WRONG_PASSWORD;
        }
    } catch (error) {
        Respond.Error(error, res);
    }
});

app.listen(config.port,()=>{
    console.log(`Server started on port ${config.port}`);
});


async function getUsers(){
    var collection_users = firestore.collection("users");
    var users = [];
    try {
        var snapshot = await collection_users.get();
        snapshot.forEach((user)=> {
            users.push(user.data());
        })    
    } catch (error) {
        console.log(error);        
    }

    return users;        
}