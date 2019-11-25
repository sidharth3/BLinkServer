const uuid = require('uuid');

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

    initUsers() {
        console.log("Initializing Users...");

        //Setting up Collection 1: Users, Document: Usernames, Field: User/Userid/Email/password/Events attended
        let colRef_users = this.firestore.collection('users');
        let users_list = ["sean"];
        for (let name of users_list) {
            let docRef_users = colRef_users.doc(name);
            let set_users = docRef_users.set({
                username : name,
                password: '12345',
                displayname: name + 'lim',            
                email: name + '@gmail.com',                                
                face_encoding: '',
                bio : `I am ${name}`,
                position : 'CEO',
                company : 'some company',
                facebook : `facebook.com/${name}`,
                instagram : `@${name}`,
                linkedin : `linkedin.com/in/${name}`,
                status : 'ACTIVE',

            });
        }
    }

    initEvents() {
        console.log("Initializing Events...");

        //Setting up Collection 2 : Events, Document : UUIDs, Field: Event Name, Date, Organiser UUID, Price
        let colRef_events = this.firestore.collection('events');
        let events_list = ["some_event_id"];
        for (let i of events_list) {
            let docRef_events = colRef_events.doc(i);
            let set_events = docRef_events.set({
                event_id: i,
                event_name: '',
                date: '', //in DDMMYY
                org_username: '',
                price: ''
            })
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
        let event_id = "some_event_id"
        let registration_list = ["sean"];
        for (let i of registration_list) {

            let registration_id = uuid.v1().toString();
            let docRef_registration = colRef_registration.doc(registration_id);
            let set_registration = docRef_registration.set({
                attended : false,
                dateAttended : "0",
                dateRegistered : Date.now().toString(),
                username: i,
                event_id: event_id
            })
        }
    }

    initConnections() {
        console.log("Initializing Connections...");

        //Setting up collection 5: Connection. Document: Random number. Field: User A: USer B
        let colRef_connections = this.firestore.collection('connections');
        let connections_num = ["0"];
        let userA_list = ["viet"]
        let userB_list = ["jie lin"]
        for (let i = 0; i < connections_num.length; i++) {
            let docRef_connections = colRef_connections.doc(connections_num[i]);
            let set_connections = docRef_connections.set({
                0: [userA_list[i], userB_list[i]]
            })
        }
    }
}

module.exports = DBInit