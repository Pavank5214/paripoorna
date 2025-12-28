const mongoose = require("mongoose");


const taskSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    taskName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'In Progress', 'Completed']
    },
    priority: {
        type: String,
        default: 'Medium',
        enum: ['High', 'Medium', 'Low']
    },
    dueDate: {
        type: Date
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },


})

module.exports = mongoose.model("Task", taskSchema);