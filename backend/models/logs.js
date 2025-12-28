const mongoose = require("mongoose");

const logsSchema = new mongoose.Schema({
    note:{
        type: String
    },
    date: {
        type : String
    },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true }

})

module.exports = mongoose.model("Logs" , logsSchema)