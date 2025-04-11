import { InputFile } from "grammy";

import type { UserContext } from "types/type";

import Instagram from "models/instagram";
import { waitList, waitForDownload } from "helpers/utils";

async function handleInstagram(ctx: UserContext, url: string) {
  let ytdlp: Instagram;
  const instance = waitList.get(url);

  if (instance) ytdlp = instance as Instagram;
  else {
    ytdlp = new Instagram(url);
    waitList.set(url, ytdlp);
  }

  const msg = await ctx.reply("⬇️ Downloading...");

  try {
    if (ytdlp.status == "INACTIVE") await ytdlp.downloadVideo();
    else await waitForDownload(ytdlp);

    await ctx.api.sendChatAction(ctx.chatId!, "upload_video");
    await ctx.replyWithVideo(new InputFile(ytdlp.filePath));
    await ctx.api.deleteMessage(msg.chat.id, msg.message_id);
  } catch (error) {
    console.log(error);
    return ctx.reply("Download operation has been failed. 😭");
  } finally {
    await ytdlp.clean();
  }

  waitList.delete(url);
}

export default handleInstagram;
