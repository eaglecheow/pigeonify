import BotCommand from "../classes/BotCommand";
import SpotifyServiceHelper, { SpotifyAuthHelper} from "../services/spotify";
import YouTubeHelper from "../services/youtube";

let commandList: BotCommand[] = [
    new BotCommand("help", "Show all commands", (msg, args) => {
        console.log("Help command called");

        let availableCommandList = commandList.map(command => [command._name, command._description]);
        let message = "Here are the available commands: \n";
        availableCommandList.forEach(availableCommand => {
            message = message + `!${availableCommand[0]}: ${availableCommand[1]}\n`
        });

        msg.channel.send(message);
        return true;
    }),

    new BotCommand("play", "Play a music", (msg, args) => {
        console.log("Play command called");

        YouTubeHelper.getInstance().searchAndPlay(msg, args);

        return true;
    }),

    new BotCommand("stop", "Stop playing music", (msg, args) => {
        console.log("Stop command called");

        YouTubeHelper.getInstance().stopMusic(msg);

        return true;
    }),

    new BotCommand("disconnect", "Disconnect from voice channel", msg => {
        console.log("Disconnect command called");

        YouTubeHelper.getInstance().leaveChannel(msg);

        return true;
    }),

    new BotCommand("test", "Test Command", (msg, args) => {
        console.log("Test command called");

        SpotifyServiceHelper.searchForTitle(args);

        return true;
    })

];

export default commandList;