import { Message, VoiceConnection } from "discord.js";
import internal from "stream";

abstract class ServiceBase {

    joinChannel = async (msg: Message): Promise<{isSuccess: boolean, connection?: VoiceConnection}> => {
        let voiceChannel = msg.member.voice.channel;

        // Check if user is in a valid voice channel.
        // Voice channel null means user is not in any voice channel
        if (!voiceChannel) {
            let errorMessage = "You are not in any voice channel! Please join one and try again!";
            msg.channel.send(errorMessage);
            return { isSuccess: false, connection: null };
        }

        // Attempt join voice channel and report back if success
        let connection = await voiceChannel.join();
        if (connection.status === 0) {
            console.log(`Joined channel ${connection.channel.name}`);
            return { isSuccess: true, connection };
        } else {
            console.log(`Channel ${connection.channel.name} not joined with status ${ connection.status}`);
            return { isSuccess: false, connection: null };
        }
    }

    leaveChannel = async (msg: Message) => {
        let voiceChannel = msg.member.voice.channel;

        // Check if user is in a valid voice channel
        if (!voiceChannel) {
            let errorMessage = "You are not in any voice channel!";
            msg.channel.send(errorMessage);
            return;
        }

        // Leave voice channel
        voiceChannel.leave();
        let message = `I have been disconnected from ${voiceChannel.name}`;
        msg.channel.send(message);
    }

    playItem = async (msg: Message, streamItem: internal.Readable) => {
        let voiceChannel = msg.member.voice.channel;

        // Check if user is in a valid voice channel
        if (!voiceChannel) {
            let connection = await this.joinChannel(msg);
        }
    } 

    abstract searchItem(msg: Message, query: string): Promise<string>;

}

class DemoService extends ServiceBase {
    searchItem = async (msg: Message, query: string) : Promise<string> => {
        return "Test";
    }
}

export default ServiceBase;