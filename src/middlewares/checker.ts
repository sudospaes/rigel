import { Composer } from "grammy";

import type { UserContext } from "types/type";

const checker = new Composer<UserContext>();

checker.use((ctx, next) => {
  if (!ctx.callbackQuery) ctx.session.user!.media = undefined;
  if (ctx.callbackQuery && ctx.session.user!.media) next();
  next();
});

checker.on("message", async (ctx, next) => {
  if (ctx.callbackQuery && ctx.session.user!.media) next();

  const user = ctx.session.user;
  const link = ctx.message?.text as string;

  if (!link || !link.match(/^https?:\/\//))
    return ctx.reply("I need a link! 😠");

  const domain = link.match(/https?:\/\/([^\/]+)/)?.at(1) as string;

  if (domain == "pin.it" || domain == "pinterest.com")
    user!.media = { type: "pin", url: link };
  else if (domain == "youtu.be" || domain == "youtube.com")
    user!.media = { type: "yt", url: link };
  else if (domain == "music.youtube.com")
    user!.media = { type: "ytm", url: link };
  else if (domain == "vm.tiktok.com" || domain == "tiktok.com")
    user!.media = { type: "tt", url: link };
  else return ctx.reply("Unsupported platform! ❌");

  next();
});

export default checker;
