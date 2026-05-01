#!/usr/bin/env node

const command = process.argv[2];
const subCommand = process.argv[3];

console.log("Insighta CLI running...");

// TEMP: route commands
if (command === "login") {
  require("../commands/auth").login();
}

else if (command === "logout") {
  require("../commands/auth").logout();
}

else if (command === "whoami") {
  require("../commands/auth").whoami();
}

else if (command === "profiles") {
  require("../commands/profiles")(subCommand, process.argv.slice(4));
}

else {
  console.log("Unknown command");
}