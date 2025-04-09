import { InputFile } from "grammy";

import type { UserContext } from "types/type";

import Pinterest from "models/pinterest";
import { waitList, waitForDownload } from "helpers/utils";

async function handlePinterest(ctx: UserContext, url: string) {
  let ytdlp: Pinterest;
  const instance = waitList.get(url);

  if (instance !== undefined) ytdlp = instance as Pinterest;
  else {
    ytdlp = new Pinterest(url);
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
    return ctx.reply("😭 Something is wrong! tell admin about that.");
  }

  waitList.delete(url);
}

export default handlePinterest;
