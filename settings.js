import { config } from "dotenv";

config();

export const GUILD_ID = process.env.GUILD_ID;
export const STATS_CHAT_ID = process.env.STATS_CHAT_ID;
export const LADDER_MESSAGE_ID = process.env.LADDER_MESSAGE_ID;
export const TOKEN = process.env.TOKEN;

export const STATS_FILE_PATH = process.env.STATS_FILE_PATH || "./stats.json";
export const TRACK_INTERVAL_SECONDS = Number(process.env.TRACK_INTERVAL_SECONDS) || 5;
export const FILE_SYNC_SECONDS = Number(process.env.FILE_SYNC_SECONDS) || 60 * 10;
export const DISCORD_STATS_UPDATE_SECONDS = Number(process.env.DISCORD_STATS_UPDATE_SECONDS) || 10;
