import * as env from "dotenv";
import * as ytdl from "ytdl-core";
import { Message, VoiceConnection } from "discord.js";
import fetch from "node-fetch";
import NoResultException from "../../classes/exception/NoResultException";
// import { raw } from "youtube-dl-exec";
// import {
//     createAudioPlayer,
//     createAudioResource,
//     entersState,
//     VoiceConnectionStatus,
// } from "@discordjs/voice";

class YouTubeHelper {

    private static instance: YouTubeHelper;
    public static getInstance(): YouTubeHelper {
        if (!YouTubeHelper.instance) {
            YouTubeHelper.instance = new YouTubeHelper();
        }

        return YouTubeHelper.instance;
    }


    searchAndPlay = async (msg: Message, args: string) => {
        // Check for empty arguments
        if (!args || args === "") {
            console.log("Invalid arguments");
            msg.channel.send("Oops, are you sure there's anything here?");
            return;
        }

        // Try query if is a valid url link
        let isValidYoutubeUrl = ytdl.validateURL(args);
        if (isValidYoutubeUrl) {
            // Directly stream ausio to channel
            this.streamAudio(msg, args);
        } else {
            // Query the string using Youtube API, then select the first result to stream
            try {
                let playUrl = await this.searchVideo(args);
                this.streamAudio(msg, playUrl);
            } catch (err) {
                if (err instanceof NoResultException) {
                    msg.channel.send("We found nothing!");
                } else {
                    msg.channel.send(`Something went very wrong! \n${err}`);
                }
            }
        }
    };

    stopMusic = async (msg: Message) => {
        let connection = msg.guild.voice.connection;

        if (!connection) {
            msg.channel.send("I'm not in a voice channel!");
            return;
        }

        connection.play("");

        // console.log(connection);
    };

    joinChannel = async (
        msg: Message
    ): Promise<{ isSuccess: boolean; connection?: VoiceConnection }> => {
        let voiceChannel = msg.member.voice.channel;
        if (!voiceChannel) {
            msg.channel.send(
                "You are not in any voice channel! Please join one and try again!"
            );
            return { isSuccess: false, connection: null };
        }

        let connection = await voiceChannel.join();
        if (connection.status === 0) {
            console.log(`Joined channel ${connection.channel.name}`);
            return { isSuccess: true, connection: connection };
        } else {
            console.log(
                `Channel ${connection.channel.name} not joined with status ${connection.status}`
            );
            return { isSuccess: false, connection: null };
        }
    };

    leaveChannel = async (msg: Message) => {
        let voiceChannel = msg.member.voice.channel;
        if (!voiceChannel) {
            msg.channel.send("You are not in any voice channel!");
            return;
        }

        voiceChannel.leave();
        msg.channel.send(`I have been disconnected from ${voiceChannel.name}`);
    };

    private searchVideo = async (query: string) => {
        // Load API key from env file
        env.config();
        const YOUTUBE_API = process.env.YOUTUBE_API;

        // Construct Youtube search url
        let params = new URLSearchParams({
            q: query,
            type: "video",
            part: "snippet",
            maxResults: "10",
            key: YOUTUBE_API,
        });
        let url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;

        // Query for first result and construct YouTube watch url
        let response = await fetch(url);
        if (response.status !== 200) {
            console.log(`STATUS: ${response.status}, ${response.statusText}`);
            throw new Error(
                `Unable to get valid response from Google API server. ${response.status}: ${response.statusText}`
            );
        }
        let responseResult = await response.json();
        let result = responseResult["items"];
        if (result.length <= 0) {
            console.log(`No result reported. ${responseResult}`);
            throw new NoResultException("No result in YouTube search");
        }
        let youtubeUrl = `https://youtu.be/${result[0].id.videoId}`;
        return youtubeUrl;
    };

    private streamAudio = async (msg: Message, link: string) => {
        // Join voice channel
        let joinChannelResult = await this.joinChannel(msg);
        if (!joinChannelResult.isSuccess) return;

        let connection = joinChannelResult.connection;

        // let ytDownload = raw;
        // const ytprocess = ytDownload(
        //   link,
        //   {
        //     o: "-",
        //     q: "",
        //     f: "bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio",
        //     r: "100K",
        //   },
        //   { stdio: ["ignore", "pipe", "ignore"] }
        // );

        // Stream Youtube link to voice channel
        // TODO: Make stream options configurable
        const streamOptions = {
            seek: 0,
            volume: 1,
        };
        // const stream = ytdl(link, { filter: "audioonly" });
        const streamInfo = await ytdl.getInfo(link);

        // let dispatcher = connection.play(streamInfo.formats[0].url);

        const stream = () => {
            if (streamInfo.videoDetails.isLiveContent) {
                const format = ytdl.chooseFormat(streamInfo.formats, {
                    quality: [128, 127, 120, 96, 95, 94, 93],
                });
                return format.url;
            } else {
                return ytdl.downloadFromInfo(streamInfo, {
                    filter: "audioonly",
                    highWaterMark: 1 << 25,
                }); // highWaterMark is a workaround for connection reset err
            }
        };

        const dispatcher = connection.play(stream(), streamOptions);

        // dispatcher = connection.play(ytprocess.stdout, streamOptions);

        dispatcher.on("start", () => {
            console.log(
                `Playing audio from ${link} at ${connection.channel.name}`
            );
            msg.channel.send(`Currently playing from: ${link}`);
        });

        dispatcher.on("finish", () => {
            console.log(`Audio playing at ${connection.channel.name} ended`);
        });

        dispatcher.on("error", (err) => {
            msg.channel.send(
                `Whoops! Something's not right. \n${err.name} \n${err.message}\n${err.stack}`
            );
            connection.channel.leave();
        });
    };
}

export default YouTubeHelper;
