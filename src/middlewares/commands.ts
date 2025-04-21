import { Composer } from "grammy";

import type { UserContext } from "types/type";

import db from "database";

const commands = new Composer<UserContext>();

commands.command("start", (ctx) => {
  ctx.reply(`Wellcome to @${Bun.env.ADMIN_UN} personal downloader bot.
it support currently:
    📌 Pinterest (Video)
    📺 Youtube (Video / Audio)
    🎧 Youtube Music
    👯 Tiktok (Video)
    📸 Instagram (Video)
    ☁️ SoundCloud`);
});

commands.use((ctx, next) => {
  const user = ctx.session.user;
  if (user?.role != "ADMIN") {
    return ctx.reply("Sorry you aren't admin.");
  }
  next();
});

commands.command("clean", async (ctx) => {
  try {
    await db.user.deleteMany({ where: { role: { not: "ADMIN" } } });
    await db.session.deleteMany();
    return ctx.reply("Users cleantion has been successful.");
  } catch (error) {
    console.log(error);
    return ctx.reply("I could not execute this command.");
  }
});

commands.command("add", async (ctx) => {
  const text = ctx.match.trim().match(/(\d+)\s+(\S+)/);
  const id = text?.[1];
  const username = text?.[2];

  if (!id || !username) {
    return ctx.reply("User id and user name is required.");
  }

  const isUserExist = await db.user.findUnique({ where: { id } });
  if (isUserExist) {
    return ctx.reply(`${isUserExist.id} is already exist.`);
  }

  try {
    await db.user.create({ data: { id, username } });
    return ctx.reply(`${id} has been added to users list.`);
  } catch (error) {
    console.log(error);
    return ctx.reply("I could not execute this command.");
  }
});

commands.command("remove", async (ctx) => {
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

commands.command("destroy", async (ctx) => {
  try {
    await db.archive.deleteMany();
    return ctx.reply("Archive destroy has been successful.");
  } catch (error) {
    console.log(error);
    return ctx.reply("I could not execute this command.");
  }
});

commands.command("users", async (ctx) => {
  const users = await db.user.findMany({ where: { role: { not: "ADMIN" } } });
  const body = `Users count: ${users.length}\n` + users.map((u) => `${u.id} ${u.username}`).join("\n");
  return ctx.reply(body);
});

export default commands;
