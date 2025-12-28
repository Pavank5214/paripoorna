const express = require("express");
const Worker = require("../models/worker");
const router = express.Router();

router.post("/:projectId", async (req,res)=>{
    try {
        const {projectId} = req.params;
        const {name,role,number} = req.body;
        if(!name && !role&& !number){
            return res.status(404).json({message: "All fields are required"});
        }
        const workers = new Worker({
            projectId,
            name,
            role,
            number
        })
        const createdWorker = await workers.save();
        res.json(createdWorker)
    } catch (error) {
        console.error(error.message);
        res.status(404).json({message:"Server error"});
    }
});

router.get("/:projectId",async(req,res)=>{
    try {
        const workers = await Worker.find({projectId:req.params.projectId}).populate("projectId");
        if(!workers){
            return res.status(404).json({message :"No workers found"});
        }
        res.json(workers);
    } catch (error) {
        console.error(error.message);
        res.status(404).json({message:"Server error"})
    }
});

// router.get("/:id",async(req,res)=>{
//     try {
//         const workers = await Worker.findById(req.params.id);
//         if(!workers){
//             return res.status(404).json({message :"No workers found"});
//         }
//         res.json(workers);
//     } catch (error) {
//         console.error(error.message);
//         res.status(404).json({message:"Server error"})
//     }
// })

router.put("/:id",async(req,res)=>{
    try {
        const {name,role,number} = req.body;
        const worker = await Worker.findById(req.params.id);
        if(!worker){
            return res.status(404).json({message : "worker not found"})
        }
        worker.name = name || worker.name,
        worker.role = role || worker.role,
        worker.number = number || worker.number

        const updatedWorker = await worker.save();
        res.json(updatedWorker);
    } catch (error) {
        console.error(error.message);
        res.status(404).json({message:"Server error"})
    }
});

router.delete("/:id",async(req,res)=>{
    try {
        const worker = await Worker.findByIdAndDelete(req.params.id);
        if(!worker){
            return res.status(404).json({message : "worker not found"})
        } 
        res.json({message : "Worker deleted"});
    } catch (error) {
        console.error(error.message);
        res.status(404).json({message:"Server error"})
    }
})
module.exports = router;