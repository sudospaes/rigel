import { InputFile } from "grammy";

import type { UserContext } from "types/type";

import YTMusic from "models/youtube-music";
import { waitList, waitForDownload } from "helpers/utils";

async function handleYTMusic(ctx: UserContext, url: string) {
  let ytdlp: YTMusic;
  const instance = waitList.get(url);

  if (instance) ytdlp = instance as YTMusic;
  else {
    ytdlp = new YTMusic(url);
    waitList.set(url, ytdlp);
  }

  const msg = await ctx.reply("⬇️ Downloading...");

  try {
    if (ytdlp.status == "INACTIVE") await ytdlp.downloadAudio();
    else await waitForDownload(ytdlp);

    await ctx.api.sendChatAction(ctx.chatId!, "upload_document");
    await ctx.replyWithAudio(new InputFile(ytdlp.filePath));
    await ctx.api.deleteMessage(msg.chat.id, msg.message_id);
  } catch (error) {
    console.log(error);
    return ctx.reply("Download operation has been failed. 😭");
  } finally {
    await ytdlp.clean();
  }

  waitList.delete(url);
}

export default handleYTMusic;
