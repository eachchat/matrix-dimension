import * as config from "config";

export interface DimensionConfig {
    web: {
        port: number;
        address: string;
    };
    homeserver: {
        name: string;
        accessToken: string;
        clientServerUrl: string;
        federationUrl: string;
        mediaUrl: string;
    };
    widgetBlacklist: string[];
    database: {
        file: string;
        botData: string;
        uri: string;
    };
    admins: string[];
    goneb: {
        avatars: {
            [botType: string]: string; // mxc
        };
    };
    telegram: {
        botToken: string;
    };
    bigbluebutton: {
        apiBaseUrl: string;
        sharedSecret: string;
        widgetName: string;
        widgetTitle: string;
        widgetAvatarUrl: string;
    };
    stickers: {
        enabled: boolean;
        stickerBot: string;
        managerUrl: string;
    };
    dimension: {
        publicUrl: string;
    };
    defaultState: {
        Widgets: boolean
        Bots: {
            stata: boolean
            bots: {
                UserId: string
                Description: string
                name: string
                AvatarURL: string
                AccessToken: string
                isPublic: true
                isEnabled: true
            }[]
        }
        Bridges: boolean
        Sticker: boolean
    }
}

//TODO: We should better use the .get function from node config
export default config as unknown as DimensionConfig;
