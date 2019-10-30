const Errors = require('../constants/errors');

class DBEvents {
    constructor(firestore)
    {
        this.firestore = firestore;
    }

    collection()
    {
        return this.firestore.collection("events");
    }

    async getEvents()
    {
        var events = [];
        try {
            var snapshot = await this.collection().get();
            snapshot.forEach((event)=> {
                events.push(event.data());
            })    
        } catch (error) {
            console.log(Errors.EVENTS.ERROR_EVENTS_RETRIEVAL_FAILED);
        }
    
        return events;       
    }

    async getEventDetail(event_id)
    {
        try {
            var event = await this.collection().doc(event_id).get();
            if(event.exists)
            {
                return event.data();
            }
            else
            {
                throw Errors.EVENTS.ERROR_EVENT_DOESNT_EXIST;
            }
        } catch (error) {
            throw error;
        }   
    }

    async creatEvent()
    {

    }    
}

module.exports = DBEvents;