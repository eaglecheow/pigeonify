import * as env from "dotenv";
import fetch from "node-fetch";
import * as querystring from "querystring";
import axios, { AxiosRequestConfig } from "axios";

export class SpotifyAuthHelper {

    private static instance: SpotifyAuthHelper;
    public static getInstance(): SpotifyAuthHelper {
        if (!SpotifyAuthHelper.instance) {
            SpotifyAuthHelper.instance = new SpotifyAuthHelper();
        }

        return SpotifyAuthHelper.instance;
    }
    
    private _accessToken: string;
    private _clientId: string;
    private _clientSecret: string;
    private _tokenExpiresAt: number;

    private loadCredentialsFromEnv = () => {
        // Get client ID and client secret from .env file
        env.config();
        this._clientId = process.env.SPOTIFY_CLIENT_ID;
        this._clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    }

    private requestAccessToken = async (authApiResourceLink: string, id: string, secret: string) => {
        const headers: AxiosRequestConfig = {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            auth: {
                username: id,
                password: secret
            }
        };

        const data = {
            grant_type: "client_credentials"
        };

        try {
            const response = await axios.post(authApiResourceLink, querystring.stringify(data), headers);
            console.log(response.data);
            this._accessToken = response.data.access_token;
            this._tokenExpiresAt = Math.floor(Date.now() / 1000) + 3600;
        } catch (err) {
            console.log(err);
        }
    }

    getAccessToken = async () => {
        console.log(this._tokenExpiresAt);
        // Request access token if expired
        let currentTime = Math.floor(Date.now() / 1000);
        if (currentTime > this._tokenExpiresAt || !this._tokenExpiresAt) {
            this.loadCredentialsFromEnv();
            await this.requestAccessToken("https://accounts.spotify.com/api/token", this._clientId, this._clientSecret);
        }
        
        console.log(`Access Token: ${this._accessToken}`);

        return this._accessToken;
    }

    
}

class SpotifyServiceHelper {
    static searchForTitle = async (queryString: string): Promise<string> => {
        let accessToken = await SpotifyAuthHelper.getInstance().getAccessToken();
        try {
            let response = await axios.get("https://api.spotify.com/v1/search", {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                },
                params: {
                    q: queryString,
                    type: "track",
                }
            });
    
            console.log(response.data);

            let itemList: any[] = response.data.tracks.items;
            
            if (itemList.length < 1) {
                return "";
            }

            return itemList[0].name;
            
        } catch (err) {
            console.log(err);
        }
    }
}

export default SpotifyServiceHelper;