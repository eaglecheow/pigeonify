import { Message } from "discord.js";

class BotCommand {
    _name: string;
    _description: string;
    _execute: (msg: Message, args: string) => boolean;

    constructor(name: string, description: string, execute: (msg: Message, args: string) => boolean) {
        this._name = name;
        this._description = description;
        this._execute = execute;
    }
}

export default BotCommand;