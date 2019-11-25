const uuid = require('uuid');
const bcrypt = require('bcrypt');
const config = require('../constants/config');

 /**
 * Hashes and salts password
 * @param {string} password 
 */
const hashedpassword = (password) =>
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
/* Prepare different collections and documents, there'll be 4 collections 
 #1 Users 
 #2 Event
 #3 Event Users 
 #4 Registration
 #5 Connections */
class DBInit {
    constructor(firestore) {
        this.firestore = firestore;
    }

    initializeDB()
    {
        this.initUsers();
        this.initConnections();
        this.initEvents();
        this.initOrganisers();
        this.initRegistration();
    }

    async initUsers() {
        console.log("Initializing Users...");
        let password = await hashedpassword('12345');
        //Setting up Collection 1: Users, Document: Usernames, Field: User/Userid/Email/password/Events attended
        let colRef_users = this.firestore.collection('users');
        let users_list = [{
            username : "seanmlim",
            password: password,
            displayname: "Sean Michael Lim",            
            email:'seanmlim@gmail.com',                                
            face_encoding: '',
            bio : `Hi come for RockAFall`,
            position : 'CEO',
            company : 'Veggie Wraps Inc.',
            facebook : `facebook.com/seanmlim`,
            instagram : `@bgourd`,
            linkedin : `linkedin.com/in/seanmlim`,
            status : 'ACTIVE',

        }, {
            username : "mooselliot",
            password: password,
            displayname: "Elliot Koh",            
            email: 'kyzelliot@gmail.com',                                
            face_encoding: '',
            bio : `I love to code`,
            position : 'Software Developer',
            company : 'MooseDev',
            facebook : `facebook.com/mooselliot`,
            instagram : `@mooselliot`,
            linkedin : `linkedin.com/in/mooselliot`,
            status : 'ACTIVE',

        }];

        for (let user of users_list) {
            let docRef_users = colRef_users.doc(user.username);
            docRef_users.set(user);
        }
    }

    initEvents() {
        console.log("Initializing Events...");

        //Setting up Collection 2 : Events, Document : UUIDs, Field: Event Name, Date, Organiser UUID, Price
        let colRef_events = this.firestore.collection('events');
        let events_list = [{
            event_id: "event_a",
            event_name: 'Industry Night 2019',
            date: '25/12/19', //in DDMMYY
            org_username: 'SUTD',
            description: 'YO this event is gon be LIT',
            address: '8 Somapah Road',
            time: '7pm - 10pm',
            price: 'FREE'
        }, {
            event_id: "event_b",
            event_name: 'Interview Workshop',
            date: '23/12/19', //in DDMMYY
            org_username: 'Google',
            description: 'YO this event is gon be LIT',
            address: '8 Somapah Road',
            time: '6pm - 9pm',
            price: 'FREE'
        }, {
            event_id: "event_c",
            event_name: 'Recruitment Talk',
            date: '07/01/20', //in DDMMYY
            org_username: 'MasterCard',
            description: 'YO this event is gon be LIT',
            address: '8 Somapah Road',
            time: '10am - 2pm',
            price: 'FREE'
        }, {
            event_id: "event_d",
            event_name: 'Information Session',
            date: '28/12/19', //in DDMMYY
            org_username: 'Facebook',
            description: 'YO this event is gon be LIT',
            address: '8 Somapah Road',
            time: '2pm - 3pm',
            price: 'FREE'
        }, {
            event_id: "event_e",
            event_name: 'Interview Workshop',
            date: '21/01/20', //in DDMMYY
            org_username: 'SUTD',
            description: 'YO this event is gon be LIT',
            address: '8 Somapah Road',
            time: '7pm - 10pm',
            price: 'FREE'
        }];


        for (let event of events_list) {
            let docRef_events = colRef_events.doc(event.event_id);
            docRef_events.set(event);
        }   
    }

    initOrganisers() {
        console.log("Initializing Organisers...");

        //Setting up collection 3: organisers, Document: UUIDs, Field : USer/User ID/Email/PAssword/ORganisation/Events organised
        let colRef_organisers = this.firestore.collection('organisers');
        let organisers_list = ["ustd"];
        for (let i of organisers_list) {
            let docRef_organisers = colRef_organisers.doc(i);
            let set_organisers = docRef_organisers.set({
                org_username: i,
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                organisation_name: '',
                events_organised: []
            })
        }
    }

    initRegistration() {
        console.log("Initializing Registration...");

        //Setting up collection 4: registation, Document: event UUIDs, Field : USername : { status : , date: } ID/Email/PAssword/ORganisation/Events organised
        let colRef_registration = this.firestore.collection('registrations');
        
        let registration_list = [{
            attended : false,
            dateAttended : "0",
            dateRegistered : Date.now().toString(),
            username: "seanmlim",
            event_id: "event_a"
        }, {
            attended : false,
            dateAttended : "0",
            dateRegistered : Date.now().toString(),
            username: "mooselliot",
            event_id: "event_b"
        }, {
            attended : true,
            dateAttended : "0",
            dateRegistered : Date.now().toString(),
            username: "mooselliot",
            event_id: "event_c"
        },{
            attended : false,
            dateAttended : "0",
            dateRegistered : Date.now().toString(),
            username: "seanmlim",
            event_id: "event_d"
        }];

        for (let registration of registration_list) {
            let registration_id = uuid.v1().toString();
            let docRef_registration = colRef_registration.doc(registration_id);
            docRef_registration.set(registration);
        }
    }

    initConnections() {
        console.log("Initializing Connections...");

        //Setting up collection 5: Connection. Document: Random number. Field: User A: USer B
        let colRef_connections = this.firestore.collection('connections');
        let connections = [{
            connection_id: "e3bf7a70-0fb7-11ea-b8c1-831b43a9a941",
            usernames: ["seanmlim", "mooselliot"],                
            time: Date.now().toString(),
            image_id: ""
        }];        

        for(let connection of connections) {
            // let connection_id = uuid.v1().toString();
            // console.log(connection_id);
            let docRef_connections = colRef_connections.doc(connection.connection_id);        
            docRef_connections.set(connection);
        }
    }
}

module.exports = DBInit