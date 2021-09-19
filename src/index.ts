import * as env from "dotenv";
import * as discord from "discord.js";
import CommandList from "./commands";
import * as http from "http";

// Read Token from .env file
env.config();
const TOKEN = process.env.TOKEN;

const client = new discord.Client();
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", msg => {
    let message = msg.content;

    // console.log(msg.member.displayName);
    // if (msg.member.displayName === "UNMC") {
    //     msg.channel.send("You lapsap");
    //     return;
    // }

    // Filter out non-commands
    if (!message.startsWith("!")) return;
    message = message.substring(1);
    let commandType = message.split(" ")[0];
    let args = message.replace(commandType + " ", "");

    if (message.length === commandType.length) {
        args = "";
    }

    console.log(`Command: ${commandType}`);
    console.log(`Arguments: ${args}`);

    CommandList.map(command => {
        if (command._name === commandType) {
            console.log(`Command matched: ${command._name}`);
            command._execute(msg, args);
        }
    });
});

client.login(TOKEN);
