import { Composer } from "grammy";
import type { ChatFullInfo } from "grammy/types";

import type { UserContext } from "types/type";

import db from "database";

const commands = new Composer<UserContext>();

commands.command("start", (ctx) => {
  ctx.reply(`Wellcome to @${Bun.env.ADMIN_UN} personal downloader bot.
it support currently:
    ✨ Pinterest
    🎞️ Youtube
    🎧 Youtube Music
    👯 TikTok`);
});

commands.command("clean", async (ctx) => {
  const user = ctx.session.user;
  if (user?.role != "ADMIN") {
    return ctx.reply("Sorry you aren't admin.");
  }
  try {
    await db.user.deleteMany({ where: { id: { not: user.id } } });
    await db.session.deleteMany();
    return ctx.reply("Users cleantion was successful.");
  } catch (error) {
    console.log(error);
    return ctx.reply(
      "I could not execute this command. Please check logs in the server."
    );
  }
});

commands.command("add", async (ctx) => {
  const user = ctx.session.user;
  if (user?.role != "ADMIN") {
    return ctx.reply("Sorry you aren't admin.");
  }
  const newUserId = ctx.match.trim();
  let profile: ChatFullInfo;
  try {
    profile = await ctx.api.getChat(newUserId);
  } catch (error) {
    return ctx.reply(`${newUserId} is not a Telegram user.`);
  }
  const isUserExist = await db.user.findUnique({ where: { id: newUserId } });
  if (isUserExist) {
    return ctx.reply(`${isUserExist.id} is already exist.`);
  }
  try {
    await db.user.create({
      data: { id: newUserId, username: profile.username },
    });
    return ctx.reply(`${newUserId} has been added to users list.`);
  } catch (error) {
    console.log(error);
    return ctx.reply(
      "I could not execute this command. Please check logs in the server."
    );
  }
});

commands.command("remove", async (ctx) => {
  const user = ctx.session.user;
  if (user?.role != "ADMIN") {
    return ctx.reply("Sorry you aren't admin.");
  }
  const targetUser = ctx.match.trim();
  try {
    await db.user.delete({ where: { id: targetUser } });
    await db.session.delete({ where: { key: targetUser.toString() } });
    return ctx.reply(`${targetUser} has been removed.`);
  } catch (error) {
    console.log(error);
    return ctx.reply(
      "I could not execute this command. Please check logs in the server."
    );
  }
});

commands.command("users", async (ctx) => {
  const user = ctx.session.user;
  if (user?.role != "ADMIN") {
    return ctx.reply("Sorry you aren't admin.");
  }
  try {
    const users = db.user.findMany({ where: { id: { not: user.id } } });
    const body =
      `Users count: ${(await users).length}\n` +
      (await users).map((u) => `${u.id} @${u.username}`).join("\n");
    return ctx.reply(body);
  } catch (error) {
    console.log(error);
    console.log(error);
    return ctx.reply(
      "I could not execute this command. Please check logs in the server."
    );
  }
});

export default commands;
