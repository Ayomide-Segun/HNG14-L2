const User = require("../models/user");
const { v7: uuidv7 } = require("uuid");
const {generateAccessToken, generateRefreshToken} = require("../utils/token");
const axios = require("axios");
require("dotenv").config();


exports.githubRedirect = (req, res) => {
    try {
        const url = `https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=user`;
        res.redirect(url);
    } catch (error) {
        console.log(error)
    }   
};

exports.githubCallback = async(req, res) => {
    try {
    const code = req.query.code;

    // 1. Exchange code for access token
    const tokenRes = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            code
        },
        {
            headers: { Accept: "application/json" }
        }
    );

    const {access_token} = tokenRes.data;

    // 2. Get user info from GitHub
    const userRes = await axios.get("https://api.github.com/user", {
        headers: {
            Authorization: `Bearer ${access_token}`
        }
    });

    const githubUser = userRes.data;
    const username = githubUser.login;

    // 3. Find or create user
    let user = await User.findOne({ username });

    if (!user) {
        user = await User.create({
            id: uuidv7(),
            username,
            github_id: githubUser.id
        });
    }

    // 4. Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: false, // true in production (HTTPS)
        maxAge: 3 * 60 * 1000
    });

    res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: false,
        maxAge: 5 * 60 * 1000
    });

    return res.send(`
        <script>
            window.location.href = "http://localhost:5454/cli-callback?access_token=${accessToken}&refresh_token=${refreshToken}";
        </script>
    `);

    } catch (error) {
        console.log(error.response?.data || error.message);
        res.status(500).json({
            status: "error",
            message: "GitHub login failed"
        });
    }
}