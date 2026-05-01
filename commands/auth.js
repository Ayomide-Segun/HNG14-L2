const axios = require("axios");
const { saveTokens, getTokens, clearTokens  } = require("../utils/storage");
const open = (...args) => import("open").then(mod => mod.default(...args));
const readline = require("readline")

const BASE_URL = "http://localhost:5000/api";

async function login() {
    try {
        console.log("Opening GitHub login...");

        const server = http.createServer((req, res) => {
            const parsedUrl = url.parse(req.url, true);
            const pathname = parsedUrl.pathname;
            const query = parsedUrl.query;

            if (pathname === "/cli-callback") {
                const access_token = query.access_token;
                const refresh_token = query.refresh_token;

                saveTokens({ access_token, refresh_token });

                res.end("✅ Login successful! You can close this window.");

                console.log("🎉 Tokens saved successfully!");

                server.close();
            }
        });
        
        server.listen(5454);

        await open(`${BASE_URL}/auth/github`);

        console.log("Login via browser");

    } catch (err) {
        console.log("Login failed");
        console.log(err)
    }
}

async function whoami() {
    const tokens = getTokens();

    if (!tokens) {
        console.log("Not logged in");
        return;
    }

    try {
        const res = await axios.get(`${BASE_URL}/profiles`, {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
                "X-API-Version": "1"
            }
        });

        console.log("✅ You are logged in as:");
        console.log(res.data);
    } catch (err) {
        console.log("❌ Token invalid or expired");
    }
}

function logout() {
    clearTokens();
    console.log("Logged out");
}

module.exports = { login, whoami, logout };