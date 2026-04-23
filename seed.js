const mongoose = require('mongoose');
const Profile = require('./models/Profile');
const data = require('./profiles.json'); // your dataset
const { v7: uuidv7 } = require('uuid');
require('dotenv').config();
const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected 🚀");
        for (let item of data) {
            await Profile.updateOne(
                { name: item.name.toLowerCase() }, // prevent duplicates
                {
                    $setOnInsert: {
                        id: uuidv7(),
                        name: item.name.toLowerCase(),
                        gender: item.gender?.toLowerCase(),
                        gender_probability: item.gender_probability,
                        age: item.age,
                        age_group: item.age_group?.toLowerCase(),
                        country_id: item.country_id,
                        country_name: item.country_name?.toLowerCase(), // ✅ DIRECT FROM DATA
                        country_probability: item.country_probability,
                        created_at: new Date()
                    }
                },
                { upsert: true }
            );
        }
        
        console.log("Total seeded:", await Profile.countDocuments());
        console.log("Seeding complete ✅");
        process.exit();
    } catch (error) {
        if (error.code === 11000) {
            return; // skip duplicate
        }
        console.log(`Failed`, error.message);
        process.exit(1);
    }
}
seedDB();
