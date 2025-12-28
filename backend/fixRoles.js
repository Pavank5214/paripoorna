const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const User = require("./models/User");

dotenv.config();

const fixRoles = async () => {
    try {
        await connectDB();

        // Find users with invalid 'manager' role
        const invalidUsers = await User.find({ role: 'manager' });

        console.log(`Found ${invalidUsers.length} users with invalid role 'manager'.`);

        if (invalidUsers.length > 0) {
            const result = await User.updateMany(
                { role: 'manager' },
                { $set: { role: 'project_manager' } }
            );
            console.log(`Updated ${result.modifiedCount} users to 'project_manager'.`);
        } else {
            console.log("No invalid roles found.");
        }

        process.exit();
    } catch (error) {
        console.error("Error fixing roles:", error);
        process.exit(1);
    }
};

fixRoles();
