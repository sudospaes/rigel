import { InputFile } from "grammy";

import type { UserContext } from "types/type";

import SoundCloud from "models/soundcloud";
import { waitList, waitForDownload } from "helpers/utils";

async function handleSoundCloud(ctx: UserContext, url: string) {
  let ytdlp: SoundCloud;
  const instance = waitList.get(url);

  if (instance) ytdlp = instance as SoundCloud;
  else {
    ytdlp = new SoundCloud(url);
    waitList.set(url, ytdlp);
  }

  const msg = await ctx.reply("⬇️ Downloading...");

  try {
    if (ytdlp.status == "INACTIVE") await ytdlp.downloadAudio();
    else await waitForDownload(ytdlp);

    await ctx.api.sendChatAction(ctx.chatId!, "upload_document");
    await ctx.replyWithAudio(new InputFile(ytdlp.filePath));
    await ctx.api.deleteMessage(msg.chat.id, msg.message_id);
    await ytdlp.clean();
  } catch (error) {
    console.log(error);
    return ctx.reply("Download operation has been failed. 😭");
  }

  waitList.delete(url);
}

export default handleSoundCloud;
