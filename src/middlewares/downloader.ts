import { Composer } from "grammy";

import type { UserContext } from "types/type";

import handlePinterest from "middlewares/services/pinterest";
import handleYoutube from "middlewares/services/youtube";
import handleYTMusic from "middlewares/services/youtube-muisc";
import handleTiktok from "middlewares/services/tiktok";
import handleInstagram from "./services/instagram";

import { youtubeFormatsList } from "middlewares/services/youtube";

const downloader = new Composer<UserContext>();

downloader.use(async (ctx, next) => {
  const media = ctx.session.user?.media!;
  switch (media.type) {
    case "pin":
      await handlePinterest(ctx, media.url);
      break;

    case "ytm":
      await handleYTMusic(ctx, media.url);
      break;

    case "tt":
      await handleTiktok(ctx, media.url);
      break;

    case "ig":
      await handleInstagram(ctx, media.url);
      break;

    case "yt":
      if (ctx.callbackQuery) {
        return next();
      }
      await youtubeFormatsList(ctx, media.url);
      break;
  }
});

downloader.callbackQuery(/^format_(\d+)$/, async (ctx) => {
  const url = ctx.session.user!.media?.url!;
  const format = ctx.match[1];
  await ctx.deleteMessage();
  await handleYoutube(ctx, url, format);
});

downloader.callbackQuery(/^format_mp3$/, async (ctx) => {
  const url = ctx.session.user!.media?.url!;
  await ctx.deleteMessage();
  await handleYoutube(ctx, url, "mp3");
});

export default downloader;
