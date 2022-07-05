require('dotenv').config();

const { Client, Intents } = require('discord.js');
const fs = require("fs");

const { ladderToText } = require("./utils");

const clientId = '993958182735052841';
const guildId = '499325755357003798';
const statsChatId = "994027085712605224";
const dataBaseMessageId = "994029146797772820";
const token = process.env.TOKEN;

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
  const clientGuild = await client.guilds.fetch({ guild: guildId });
  const statsChat = clientGuild.channels.cache.get(statsChatId);
  const prevMessage = await statsChat.messages.fetch(dataBaseMessageId);
  const prevStatsMessageText = prevMessage.content;

  let ladder = [];

  const membersTime = JSON.parse(fs.readFileSync("./stats.json").toString());

  const trackMembersStats = async () => {
    const members = await clientGuild.members.fetch();

    const voiceMembers = members
      .filter(({ voice }) => voice.channel)
      .map(({ user, voice, displayName }) => ({ channelId: voice.channelId, username: displayName, id: user.id }));

    voiceMembers.forEach(({id, username}) => {
      const item = membersTime[id] || {
        time: 0,
      };

      item.time += 1;
      item.username = username;

      membersTime[id] = item;
    });

    const sortedMembersTime = Object
      .entries(membersTime)
      .sort(([, {time: timeA}], [, {time: timeB}]) => timeB - timeA);

    ladder = sortedMembersTime.map(([id, item]) => ({ ...item, id }));
  };

  await trackMembersStats();

  setInterval(trackMembersStats, 1_000);

  setInterval(() => {
    console.log(new Date(), "Saving ", membersTime);

    fs.writeFileSync("./stats.json", JSON.stringify(membersTime));
  }, 60_000 * 10);

  setInterval(() => {
    prevMessage.edit(ladderToText(ladder));
  }, 10_000);
});
