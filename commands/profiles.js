const axios = require("axios");
const fs = require("fs");
const { getTokens } = require("../utils/storage");

const BASE_URL = "http://localhost:5000/api";

module.exports = async function (action, args) {
    const tokens = getTokens();

    if (!tokens) {
        return console.log("Please login first");
    }

    const res = await axios.get(`${BASE_URL}/profiles`, {
        headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            "X-API-Version": "1"
        }
    });
    console.log(res.data);
};

