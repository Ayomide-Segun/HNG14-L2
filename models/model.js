const mongoose = require('mongoose');
const profileSchema = mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
            required: true
        },
        id: {
            type: String,
            unique: true,
            required: true
        },
        gender: {
            type: String,
            enum: ['male', 'female']
        },
        gender_probability: Number,
        sample_size: Number,
        age: Number,
        age_group: {
            type: String,
            enum: ['child', 'teenager', 'adult', 'senior']
        },
        country_id: String,
        country_name: String,
        country_probability: Number,
        created_at: {
            type: Date,
            default: Date.now
        } 
    }
);

module.exports = mongoose.model("Profile", profileSchema);