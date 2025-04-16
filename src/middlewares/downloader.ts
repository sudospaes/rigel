import { Composer } from "grammy";

import type { UserContext } from "types/type";

import handlePinterest from "middlewares/services/pinterest";
import handleYoutube from "middlewares/services/youtube";
import handleYTMusic from "middlewares/services/youtube-muisc";
import handleTiktok from "middlewares/services/tiktok";
import handleInstagram from "./services/instagram";
import handleSoundCloud from "./services/soundcloud";

import { youtubeFormatsList } from "middlewares/services/youtube";

import { runDetached } from "helpers/utils";

const downloader = new Composer<UserContext>();

downloader.use((ctx, next) => {
  const media = ctx.session.user?.media!;
  switch (media.type) {
    case "pin":
      runDetached(() => handlePinterest(ctx, media.url));
      break;

    case "ytm":
      runDetached(() => handleYTMusic(ctx, media.url));
      break;

    case "tt":
      runDetached(() => handleTiktok(ctx, media.url));
      break;

    case "ig":
      runDetached(() => handleInstagram(ctx, media.url));
      break;

    case "sc":
      runDetached(() => handleSoundCloud(ctx, media.url));
      break;

    case "yt":
      if (ctx.callbackQuery) {
        return next();
      }
      runDetached(() => youtubeFormatsList(ctx, media.url));
      break;
  }
});

downloader.on("callback_query:data", (ctx) => {
  const url = ctx.session.user!.media?.url!;
  const data = JSON.parse(ctx.callbackQuery.data!);
  ctx.deleteMessage();
  runDetached(() => handleYoutube(ctx, url, data.format, data.msgId));
});

export default downloader;
