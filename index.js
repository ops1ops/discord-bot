require('dotenv').config();

const { Client, Intents } = require('discord.js');
const fs = require("fs");

const { ladderToText } = require("./utils");

const clientId = '993958182735052841';


const GUILD_ID =  process.env.GUILD_ID;
const STATS_CHAT_ID =  process.env.STATS_CHAT_ID;
const MESSAGE_ID =  process.env.MESSAGE_ID;
const STATS_FILE_PATH =  process.env.STATS_FILE_PATH || "./stats.json";

const token = process.env.TOKEN;

const PING_INTERVAL_SECONDS = Number(process.env.PING_INTERVAL_SECONDS) || 5;
const FILE_SYNC_SECONDS = Number(process.env.FILE_SYNC_SECONDS) || 60 * 10;
const DISCORD_STATS_UPDATE_SECONDS = Number(process.env.DISCORD_STATS_UPDATE_SECONDS) || 10;

const initConfig = [GUILD_ID, STATS_CHAT_ID, MESSAGE_ID, token, PING_INTERVAL_SECONDS, FILE_SYNC_SECONDS,DISCORD_STATS_UPDATE_SECONDS ];

if (!initConfig.every(config => !!config)) {
  console.log("One of the configs was not explicitly set. Using default values.");
  console.log(initConfig);
}

if(!fs.existsSync(STATS_FILE_PATH)) {
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

client.login(token);

client.once('ready', async () => {
  const clientGuild = await client.guilds.fetch({ guild: GUILD_ID });
  const statsChat = clientGuild.channels.cache.get(STATS_CHAT_ID);
  const prevMessage = await statsChat.messages.fetch(MESSAGE_ID);

  let ladder = [];

  const membersTime = JSON.parse(fs.readFileSync(STATS_FILE_PATH).toString());

  const trackMembersStats = async () => {
    try {
      const members = await clientGuild.members.fetch();

      const voiceMembers = members
        .filter(({ voice }) => voice.channel)
        .map(({ user, voice, displayName }) => ({ channelId: voice.channelId, username: displayName, id: user.id }));

      voiceMembers.forEach(({id, username}) => {
        const item = membersTime[id] || {
          time: 0,
        };

        item.time += PING_INTERVAL_SECONDS;
        item.username = username;

        membersTime[id] = item;
      });

      const sortedMembersTime = Object
        .entries(membersTime)
        .sort(([, {time: timeA}], [, {time: timeB}]) => timeB - timeA);

      ladder = sortedMembersTime.map(([id, item]) => ({ ...item, id }));
    } catch (error) {
      console.log(new Date(), error)
    }
  };

  await trackMembersStats();

  setInterval(trackMembersStats, PING_INTERVAL_SECONDS * 1_000);

  setInterval(() => {
    console.log(new Date(), "Saving ", membersTime);

    fs.writeFileSync(STATS_FILE_PATH, JSON.stringify(membersTime));
  }, FILE_SYNC_SECONDS * 1_000);

  setInterval(() => {
    prevMessage.edit(ladderToText(ladder));
  }, DISCORD_STATS_UPDATE_SECONDS * 1_000);
});
