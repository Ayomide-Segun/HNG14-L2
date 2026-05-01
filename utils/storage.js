const fs = require("fs");
const path = require("path");

const dir = path.join(process.env.HOME || process.env.USERPROFILE, ".insighta");
const file = path.join(dir, "credentials.json");

function saveTokens(data) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    fs.writeFileSync(file, JSON.stringify(data));
}

function getTokens() {
    if (!fs.existsSync(file)) return null;

    return JSON.parse(fs.readFileSync(file));
}

function clearTokens() {
    if (fs.existsSync(file)) fs.unlinkSync(file);
}

module.exports = { saveTokens, getTokens, clearTokens };