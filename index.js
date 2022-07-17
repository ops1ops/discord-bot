import  { Client, Intents } from 'discord.js';
import fs from "fs";

import {
  GUILD_ID,
  STATS_CHAT_ID,
  LADDER_MESSAGE_ID,
  TOKEN,
  TRACK_INTERVAL_SECONDS,
  FILE_SYNC_SECONDS,
  DISCORD_STATS_UPDATE_SECONDS,
  STATS_FILE_PATH
} from "./settings.js";

import { ladderToText, shouldCountUserStats, validateInitialConfig } from './utils.js';

validateInitialConfig();

if (!fs.existsSync(STATS_FILE_PATH)) {
  fs.writeFileSync(STATS_FILE_PATH, JSON.stringify({}));
}

const client = new Client(
  {
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MEMBERS,
      Intents.FLAGS.GUILD_VOICE_STATES
    ],
  });

client.login(TOKEN);

client.once('ready', async () => {
  const clientGuild = await client.guilds.fetch({guild: GUILD_ID});
  const statsChat = clientGuild.channels.cache.get(STATS_CHAT_ID);
  const prevMessage = await statsChat.messages.fetch(LADDER_MESSAGE_ID);

  let ladder = [];

  const membersTime = JSON.parse(fs.readFileSync(STATS_FILE_PATH).toString());

  const trackMembersStats = async () => {
    try {
      const members = await clientGuild.members.fetch();

      const voiceMembers = members
        .filter(({voice}) => voice.channel)
        .map(({user, voice, displayName, nickname}) =>
          ({channelId: voice.channelId, username: displayName, id: user.id, nickname}));

      voiceMembers.forEach(({id, username, nickname}) => {
        if (!shouldCountUserStats(nickname || username)) {
          return;
        }

        const item = membersTime[id] || {
          time: 0,
        };

        item.time += TRACK_INTERVAL_SECONDS;
        item.username = username;

        membersTime[id] = item;
      });

      const sortedMembersTime = Object
        .entries(membersTime)
        .sort(([, {time: timeA}], [, {time: timeB}]) => timeB - timeA);

      ladder = sortedMembersTime.map(([id, item]) => ({...item, id}));
    } catch (error) {
      console.log(new Date(), error);
    }
  };

  await trackMembersStats();

  setInterval(trackMembersStats, TRACK_INTERVAL_SECONDS * 1_000);

  setInterval(() => {
    console.log(new Date(), "Saving ", membersTime);

    fs.writeFileSync(STATS_FILE_PATH, JSON.stringify(membersTime));
  }, FILE_SYNC_SECONDS * 1_000);

  setInterval(() => {
    prevMessage.edit(ladderToText(ladder));
  }, DISCORD_STATS_UPDATE_SECONDS * 1_000);
});
