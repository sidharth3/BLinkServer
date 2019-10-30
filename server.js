const express = require('express');
const config = require('./config');
const path = require('path');
const app = express();
const bodyParse = require('body-parser');
const firebase = require('firebase-admin');
const serviceAccount = require('./credentials/blink-4df57-firebase-adminsdk-0wo3v-abda4aeb6e.json');

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://blink-4df57.firebaseio.com"
});

const firestore = firebase.firestore();

getUsers().then((users)=>{
    console.log(users);
});


app.use(bodyParse.json());
app.use(bodyParse.urlencoded({extended: false }));
app.set('json spaces', 2);

app.get('/', (req,res)=>{
    res.send("Hello World");
})

app.listen(config.port,()=>{
    console.log(`Server started on port ${config.port}`);
})


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