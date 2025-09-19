const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/BTP').then(()=>{
    console.log("Connected to DB");
}).catch((e)=>{
    console.log("Failed connection to DB");
})