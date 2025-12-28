const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Project = require("./models/Project");

dotenv.config();

const seedMap = async () => {
    try {
        await connectDB();

        const project = await Project.findOne();

        if (project) {
            // Set coordinates to Bangalore (approx)
            project.coordinates = {
                lat: 12.9716,
                lng: 77.5946
            };
            project.location = "Bangalore, India";
            project.status = "active";

            await project.save();
            console.log(`Updated project '${project.name}' with coordinates.`);
        } else {
            console.log("No projects found to update.");
        }

        process.exit();
    } catch (error) {
        console.error("Error seeding map:", error);
        process.exit(1);
    }
};

seedMap();
