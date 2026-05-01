const { Parser } = require("json2csv");
const Profile = require("../models/model");

exports.exportProfiles = async(req, res) => {
    try {
        let { gender, country_id, age_group } = req.query;
        const filter = {};

        if (gender) filter.gender = gender.toLowerCase();
        if (country_id) filter.country_id = country_id.toUpperCase();
        if (age_group) filter.age_group = age_group.toLowerCase();

        const profiles = await Profile.find(filter)
        const fields = [
            "id",
            "name",
            "gender",
            "gender_probability",
            "age",
            "age_group",
            "country_id",
            "country_name",
            "country_probability",
            "created_at"
        ];

        const parser = new Parser({fields});
        const csv = parser.parse(profiles);

        res.header("Content-Type", "text/csv");
        res.attachment(`profiles_${Date.now()}.csv`);
        return res.send(csv);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: "error",
            message: error.message
        });
    }
}