const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema({
    name :{
        type : String
    },
    role :{
        type : String
    },
    number : {
        type :String
    },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true }

}) ;

module.exports = mongoose.model("Worker",workerSchema);