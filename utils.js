import * as initConfig from "./settings.js";

const secondsToDhms = (seconds) => {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor(seconds % (3600 * 24) / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);

  const dDisplay = d > 0 ? d + (d === 1 ? " day " : " days ") : "";
  const hDisplay = h > 0 ? h + (h === 1 ? " hour " : " hours ") : "";
  const mDisplay = m > 0 ? m + (m === 1 ? " minute " : " minutes ") : "";
  const sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : "";

  return dDisplay + hDisplay + mDisplay + sDisplay;
};

export const ladderToText = (ladder) => {
  return ladder.reduce((accumulator, item, index) => {
    return accumulator + `${index + 1}: ${item.username} - ${secondsToDhms(item.time)} \n`
  }, "Online statistic:\n")
};

export const validateInitialConfig = () => {
  const undefinedSettings = Object.entries(initConfig).filter(([, value]) => !value).map(([key]) => key);

  if (undefinedSettings.length > 0) {
    console.log("One of the configs was not explicitly set.");
    console.log(undefinedSettings);
    process.exit(9);
  }
};

const botsRegExp = /(bot|бот)/;
const potentialBotRole = "998658028922470461"

export const shouldCountUserStats = ({name, roles}) => {
  const isBot = botsRegExp.test(name.toLowerCase());

  if (roles.cache.get(potentialBotRole)) {
    return false;
  }

  return !isBot;
};
