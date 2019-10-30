const express = require('express');
const config = require('./config');
const path = require('path');
const app = express();
const bodyParse = require('body-parser');

app.use(bodyParse.json());
app.use(bodyParse.urlencoded({extended: false }));
app.set('json spaces', 2);

app.get('/', (req,res)=>{
    res.send("Hello World");
})

app.listen(config.port,()=>{
    console.log(`Server started on port ${config.port}`);
})
