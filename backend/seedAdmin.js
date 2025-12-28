const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const User = require("./models/User");
const { USER_ROLES } = require("./models/User");

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = "admin@example.com";
        const adminPassword = "123456";

        let user = await User.findOne({ email: adminEmail });

        if (user) {
            console.log("Admin user already exists. Updating role...");
            user.role = USER_ROLES.SUPER_ADMIN; // Give super admin to be sure
            user.isActive = true;
            // Note: Password won't be re-hashed here unless we explicitly set it. 
            // If we want to RESET password to 123456, we should execute:
            // user.password = adminPassword; 
            // But usually we don't want to reset pass if account exists.
            // However, user EXPLICITLY asked for these details.
            user.password = adminPassword;
            await user.save();
            console.log("Admin user updated successfully.");
        } else {
            console.log("Creating new admin user...");
            user = new User({
                name: "System Admin",
                email: adminEmail,
                password: adminPassword,
                role: USER_ROLES.SUPER_ADMIN,
                department: "Not Assigned",
                phone: "0000000000",
                isActive: true
            });
            await user.save();
            console.log("Admin user created successfully.");
        }

        process.exit();
    } catch (error) {
        console.error("Error seeding admin:", error);
        process.exit(1);
    }
};

seedAdmin();
