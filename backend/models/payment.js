const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    invoiceNumber :{
        type: String
    } ,
    date : {
        type : String
    } ,
    amount :{
        type : Number
    },
    status : {
        type : String
    },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true }

});

module.exports  = new mongoose.model("Payment" , paymentSchema);