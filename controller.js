const Profile = require("./model");
const axios = require("axios");
const { v7 : uuidv7 } = require('uuid');
const countryLib = require("i18n-iso-countries");
countryLib.registerLocale(require("i18n-iso-countries/langs/en.json"));

exports.addProfile = async(req, res) => {
    const { name } = req.body;
    
    try {
        let profile;
        
        if(typeof name !== "string"){
            return res.status(422).json({
                status: "error",
                message: "Unprocessable Entity"
            })
        };
        if(!name || name.trim() === ""){
            return res.status(400).json({
                status: "error",
                message: "Bad request"
            })
        };

        const normalizedName = name.trim().toLowerCase();
        const nameExists = await Profile.findOne({ name: normalizedName });
        if(nameExists){
            const {_id, __v, ...cleanProfile} = nameExists.toObject();
            return res.status(200).json({
                status: "success",
                message: "Profile already exists",
                data: cleanProfile
            })
        }

        const [genderizeResponse,  agifyResponse, nationalizeResponse] =
        await Promise.all([
            axios.get(`https://api.genderize.io?name=${normalizedName}`, { timeout: 5000 }),
            axios.get(`https://api.agify.io?name=${normalizedName}`, { timeout: 5000 }),
            axios.get(`https://api.nationalize.io?name=${normalizedName}`, { timeout: 5000 })
        ]);
        

        const {gender, probability, count} = genderizeResponse.data;
        if(gender === null || count === 0){
            return res.status(502).json({
                status: "error",
                message: "Genderize returned an invalid response"
            })
        }
        const gender_probability = probability;
        const sample_size = count;

        const {age} = agifyResponse.data;
        if(age === null){
            return res.status(502).json({
                status: "error",
                message: "Agify returned an invalid response"
            })
        }       
        
        let age_group;
        if(age >= 0 && age <= 12){
            age_group = "child";
        } else if(age >= 13 && age <= 19){
            age_group = "teenager"
        } else if(age >= 20 && age <= 59){
            age_group = "adult"
        } else{
            age_group = "senior"
        }


        const countries = nationalizeResponse.data.country;
        if(!countries || countries.length === 0){
            return res.status(502).json({
                status: "error",
                message: "nationalize returned an invalid response"
            })
        };

        const topCountry = countries.reduce((max, curr) =>
            curr.probability > max.probability ? curr : max
        );
        const {country_id} = topCountry;
        const country_probability = topCountry.probability;

        profile = await Profile.create({
            name: normalizedName,
            id: uuidv7(),
            gender,
            gender_probability,
            sample_size,
            age,
            age_group,
            country_id,
            country_probability
        })

        const {_id, __v, ...cleanProfile} = profile.toObject();
        
        res.status(201).json({
            status: "success",
            data: cleanProfile
        })

    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            status: "error",
            message: error.message || "Internal server error"
        })
    }
}


exports.getProfileUsingParams = async(req, res) => {
    const {id} = req.params;
    try {
        const profile = await Profile.findOne({id});
        if (!profile) {
            return res.status(404).json({
                status: "error",
                message: "Profile not found"
            });
        }
        const {_id, __v, ...cleanProfile} = profile.toObject();
        res.status(200).json({
            status: "success",
            data: cleanProfile
        })
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message || "Unable to retrieve profile"
        })
    }
}

exports.getProfileUsingQuery = async(req, res) => {
    let { 
            gender,
            country_id,
            age_group,
            min_age,
            max_age,
            min_gender_probability,
            min_country_probability,
            sort_by,
            order,
            page = 1,
            limit = 10
        } = req.query;

    try {
        const filter = {};

        // Apply filters if they exist
        if (gender) filter.gender = gender.toLowerCase();
        if (country_id) filter.country_id = country_id.toUpperCase();
        if (age_group) filter.age_group = age_group.toLowerCase();

        if (min_age && isNaN(min_age)) {
            return res.status(422).json({
                status: "error",
                message: "Invalid query parameters"
            });
        }
        if( min_age || max_age ) {
            filter.age = {};
            if (min_age) filter.age.$gte = Number(min_age);
            if (max_age) filter.age.$lte = Number(max_age);
        }

        if (min_gender_probability && isNaN(min_gender_probability)) {
            return res.status(422).json({
                status: "error",
                message: "Invalid query parameters"
            });
        }
        if(min_gender_probability) {
            filter.gender_probability = {$gte: Number(min_gender_probability)}
        }

        if (min_country_probability && isNaN(min_country_probability)) {
            return res.status(422).json({
                status: "error",
                message: "Invalid query parameters"
            });
        }
        if(min_country_probability) {
            filter.country_probability = {$gte: Number(min_country_probability)}
        }

        // Sorting
        let sort = {};
        if (sort_by) {
            const allowed = ["age", "created_at", "gender_probability"];
            if (!allowed.includes(sort_by)) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid query parameters"
                });
            }
            sort[sort_by] = order === "desc" ? -1 : 1;
        }

        // Pagination
        page = Math.max(1, parseInt(page));
        limit = Math.max(1, parseInt(limit));

        if (limit > 50) limit = 50;
        const skip = (page - 1) * limit;
        const total = await Profile.countDocuments(filter);
        const data = await Profile.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            status: "success",
            page,
            limit,
            total,
            data
        });
        
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message || "Unable to retrieve profile"
        })
    }
}

exports.naturalLanguageQuery = async (req, res) => {
    try {
        let filter = {};
        let interpreted = false;

        if (!q) {
            return res.status(400).json({
                status: "error",
                message: "Invalid query parameters"
            });
        }

        if (q.includes("male") && q.includes("female")) {
            // no gender filter → means both
            interpreted = true;
        } else if (q.includes("female")) {
            filter.gender = "female";
            interpreted = true;
        } else if (q.includes("male")) {
            filter.gender = "male";
            interpreted = true;
        }

        let ageFilter = {};
        const aboveMatch = q.match(/above (\d+)/);
        const belowMatch = q.match(/below (\d+)/);
        
        if (q.includes("young")) {
            ageFilter.$gte = 16;
            ageFilter.$lte = 24;
            interpreted = true;
        }
        if (aboveMatch) {
            ageFilter.$gte = parseInt(aboveMatch[1]);
            interpreted = true;
        }
        if (belowMatch) {
            ageFilter.$lte = parseInt(belowMatch[1]);
            interpreted = true;
        }
        if (Object.keys(ageFilter).length > 0) {
            filter.age = ageFilter;
        }

        if (q.includes("child")) {
            filter.age_group = "child";
            interpreted = true;
        }
        if (q.includes("teenager")) {
            filter.age_group = "teenager";
            interpreted = true;
        }
        if (q.includes("adult")) {
            filter.age_group = "adult";
            interpreted = true;
        }
        if (q.includes("senior")) {
            filter.age_group = "senior";
            interpreted = true;
        }

        const normalizedQ = q.replace(/\s+/g, "");
        let code = countryLib.getAlpha2Code(normalizedQ, "en");

        if(!code){
            const words = q.split(" ");
            for (let word of words) {
                code = countryLib.getAlpha2Code(word, "en");
                if (code) break;
            }
        }
        if (code) {
            filter.country_id = code;
            interpreted = true;
        }

        if (!interpreted) {
            return res.status(400).json({
                status: "error",
                message: "Unable to interpret query"
            });
        }

        let { page = 1, limit = 10 } = req.query;
        page = Math.max(1, parseInt(page));
        limit = Math.max(1, parseInt(limit));

        if (limit > 50) limit = 50;
        const skip = (page - 1) * limit;
        const total = await Profile.countDocuments(filter);

        const data = await Profile.find(filter)
            .skip(skip)
            .limit(limit);

        res.json({
            status: "success",
            page,
            limit,
            total,
            data
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
};

exports.deleteProfiles = async(req, res) => {
    const {id} = req.params;
    try {
        const profile = await Profile.findOne({id});

        if (!profile) {
            return res.status(404).json({
                status: "error",
                message: "Profile not found"
            });
        }
        const deletedProfile = await Profile.findOneAndDelete({id});

        return res.status(204).send();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
}