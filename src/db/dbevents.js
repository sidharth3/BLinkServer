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

    async eventExists(event_id){
        var event = await this.collection().doc(event_id).get();
        return event.exists;
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

    async createEvent(payload)
    {
        let eventIDDoc = this.collection().doc(payload.event_id);
        let eventID = await eventIDDoc.get();
        if (eventID.exists){
            throw Errors.EVENTS.ERROR_EVENT_ID_TAKEN;
        }
        else{
            eventIDDoc.set({
                event_id : payload.event_id,
                event_name : payload.event_name,
                date : payload.date,
                org_username : payload.username,
                price : payload.price
            });
            return true;
        }        

        //TODO: append to event organisers created events
    }    
}

module.exports = DBEvents;