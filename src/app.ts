import "preload"; //* running preload

import { Bot } from "grammy";

import type { UserContext } from "types/type";

import auth from "middlewares/auth";
import commands from "middlewares/commands";
import checker from "middlewares/checker";
import downloader from "middlewares/downloader";

const token = Bun.env.BOT_TOKEN as string;
const localApi = Bun.env.LOCAL_API as string;

const bot = new Bot<UserContext>(token, { client: { apiRoot: localApi } });

bot.use(auth);
bot.use(commands);
bot.use(checker);
bot.use(downloader);

bot.start({
  onStart: () => console.log("Bot is running..."),
});
