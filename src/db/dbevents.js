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

    }

    async getEventDetail(event_id)
    {

    }

    async creatEvent()
    {

    }    
}

module.exports = DBEvents;