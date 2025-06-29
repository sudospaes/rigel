import { Composer } from "grammy";

import type { UserContext } from "types/type";

const checker = new Composer<UserContext>();

checker.use((ctx, next) => {
  if (ctx.callbackQuery && ctx.session.user!.media) return next();
  ctx.session.user!.media = undefined;
  next();
});

checker.on("message", (ctx, next) => {
  const user = ctx.session.user;
  const link = ctx.message?.text as string;

  if (!link || !link.match(/^https?:\/\//)) {
    return ctx.reply("Need a link to download media.");
  }

  const domain = link.match(/https?:\/\/(?:www\.)?([^\/]+)/i)?.at(1);

  if (domain == "youtu.be" || domain == "youtube.com") {
    if (link.includes("list=")) {
      return ctx.reply("Playlist is not support currently.");
    }
    user!.media = { type: "yt", url: link };
  } else if (domain == "music.youtube.com") {
    if (link.includes("list=")) {
      return ctx.reply("Playlist is not support currently.");
    }
    user!.media = { type: "ytm", url: link };
  } else if (domain == "pin.it" || domain == "pinterest.com") {
    user!.media = { type: "pin", url: link };
  } else if (domain == "vm.tiktok.com" || domain == "tiktok.com") {
    user!.media = { type: "tt", url: link };
  } else if (domain == "instagram.com") {
    user!.media = { type: "ig", url: link };
  } else if (domain == "soundcloud.com" || domain == "on.soundcloud.com") {
    user!.media = { type: "sc", url: link };
  } else return ctx.reply("Unsupported platform! ❌");

  next();
});

export default checker;
