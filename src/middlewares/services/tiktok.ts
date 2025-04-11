import { InputFile } from "grammy";

import type { UserContext } from "types/type";

import Tiktok from "models/tiktok";
import { waitList, waitForDownload } from "helpers/utils";

async function handleTiktok(ctx: UserContext, url: string) {
  let ytdlp: Tiktok;
  const instance = waitList.get(url);

  if (instance) ytdlp = instance as Tiktok;
  else {
    ytdlp = new Tiktok(url);
    waitList.set(url, ytdlp);
  }

  const msg = await ctx.reply("⬇️ Downloading...");

  try {
    if (ytdlp.status == "INACTIVE") await ytdlp.downloadVideo();
    else await waitForDownload(ytdlp);

    await ctx.api.sendChatAction(ctx.chatId!, "upload_video");
    await ctx.replyWithVideo(new InputFile(ytdlp.filePath));
    await ctx.api.deleteMessage(msg.chat.id, msg.message_id);
    await ytdlp.clean();
  } catch (error) {
    console.log(error);
    return ctx.reply("Download operation has been failed. 😭");
  }

  waitList.delete(url);
}

export default handleTiktok;
