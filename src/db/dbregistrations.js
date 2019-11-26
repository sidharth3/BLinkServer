const Errors = require('../constants/errors');

class DBRegistrations {
    constructor(firestore) {
        this.firestore = firestore;
    }

    collection() {
        return this.firestore.collection("registrations");
    }

    async registerUserForEvent(username, event_id) {
        console.log(`registering ${username} for event with id: ${event_id}`);
        let event_registrations = await this.collection().doc(event_id).get();

        if (event_registrations.exists) {
            let event_registration_data = event_registrations.data();

            event_registration_data[username] = {
                username: username,
                attended: false,
                dateRegistered: Date.now().toString(),
                dateAttended: 0
            }

            await this.collection().doc(event_id).set(event_registration_data);
        }
        else //if the event hasnt had any registrations yet
        {
            let event_registration_data = {
                [username]: {
                    username: username,
                    attended: false,
                    dateRegistered: Date.now().toString(),
                    dateAttended: 0
                }
            };

            await this.collection().doc(event_id).set(event_registration_data);
        }

    }

    async markUserAttendanceForEvent(username, event_id) {
        let event_registrations = await this.collection().doc(event_id).get();

        if (event_registrations.exists) {
            let event_registration_data = event_registrations.data();
            if (event_registration_data[username] === undefined) {
                throw Errors.EVENTS.ERROR_USER_NOT_REGISTERED;
            }
            else {
                event_registration_data[username] = {
                    ...event_registration_data[username],
                    attended: true,
                    dateAttended: Date.now().toString(),
                }
                await this.collection().doc(event_id).set(event_registration_data);
            }
        }
        else //if the event hasnt had any registrations yet
        {
            throw Errors.EVENTS.ERROR_EVENT_DOESNT_EXIST;
        }


    }

    async registrationsForEvent(event_id) {
        let event_registrations = await this.collection().doc(event_id).get();

        if (event_registrations.exists) {
            let event_registration_data = event_registrations.data();
            let registrations = Object.keys(event_registration_data).map((key)=>event_registration_data[key]);
            return registrations;
        }
        else
        {
            throw Errors.EVENTS.ERROR_EVENT_DOESNT_EXIST;
        }
    }    

    async getUserRegisteredEventIds(username) { 
        let output = {            
            attended_event_ids: [],
            unattended_event_ids: [],            
        }

        let snapshot = await this.collection().where("username", "==", username).get();
        snapshot.forEach(function(doc) {            
            let record = doc.data();

            if(record.attended == false){
                output.unattended_event_ids.push(record.event_id);
            }
            else {                
                output.attended_event_ids.push(record.event_id);
            }
        });
        
        return output;
    }

    async userEventRelationship(username, event_id) {
        let event_registrations = await this.collection().doc(event_id).get();

        if (event_registrations.exists) {
            let event_registration_data = event_registrations.data();
            let isRegisteredData = event_registration_data[username];

            if(isRegisteredData === undefined) {
                return 0; //not registered
            }
            else if (isRegisteredData[status] == false) {
                return 1; //registered but not attended yet
            }
            else {
                return 2;
            }
        }
        else
        {
            throw Errors.EVENTS.ERROR_EVENT_DOESNT_EXIST;
        }
    }   
}

module.exports = DBRegistrations;