const Errors = require('../constants/errors');

class DBRegistrations {
    constructor(firestore) {
        this.firestore = firestore;
    }

    collection() {
        return this.firestore.collection("registration");
    }

    async registerUserForEvent(username, event_id) {
        console.log(`registering ${username} for event with id: ${event_id}`);
        let event_registrations = await this.collection().doc(event_id).get();

        if (event_registrations.exists) {
            let event_registration_data = event_registrations.data();

            event_registration_data[username] = {
                username: username,
                status: false,
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
                    status: false,
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
                    status: true,
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
}

module.exports = DBRegistrations;