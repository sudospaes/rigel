import { Composer } from "grammy";

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
    return ctx.reply("I could not execute this command.");
  }
});

commands.command("add", async (ctx) => {
  const user = ctx.session.user;
  if (user?.role != "ADMIN") {
    return ctx.reply("Sorry you aren't admin.");
  }
  const text = ctx.match.trim().match(/(\d+)\s+(\S+)/);
  const id = text?.[1] as string;
  const username = text?.[2];

  const isUserExist = await db.user.findUnique({ where: { id } });
  if (isUserExist) {
    return ctx.reply(`${isUserExist.id} is already exist.`);
  }

  try {
    await db.user.create({
      data: { id, username },
    });
    return ctx.reply(`${id} has been added to users list.`);
  } catch (error) {
    console.log(error);
    return ctx.reply("I could not execute this command.");
  }
});

commands.command("remove", async (ctx) => {
  const user = ctx.session.user;
  if (user?.role != "ADMIN") {
    return ctx.reply("Sorry you aren't admin.");
  }
  const id = ctx.match.trim();
  try {
    await db.user.delete({ where: { id } });
    if (await db.session.findUnique({ where: { key: id } })) {
      await db.session.delete({ where: { key: id } });
    }
    return ctx.reply(`${id} has been removed.`);
  } catch (error) {
    console.log(error);
    return ctx.reply("User is not exist or can not execute this command.");
  }
});

commands.command("users", async (ctx) => {
  const user = ctx.session.user;
  if (user?.role != "ADMIN") {
    return ctx.reply("Sorry you aren't admin.");
  }
  const users = await db.user.findMany({ where: { id: { not: user.id } } });
  const body =
    `Users count: ${users.length}\n` +
    users.map((u) => `${u.id} ${u.username}`).join("\n");
  return ctx.reply(body);
});

export default commands;
