import { InputFile } from "grammy";

import type { UserContext } from "types/type";

import Instagram from "models/instagram";
import { waitList, waitForDownload, waitForArchiving } from "helpers/ytdlp";
import { sendFromArchive, addToArchive } from "helpers/archive";
import { getMetadata, getThumbnail } from "helpers/ffmpeg";
import { removeFile } from "helpers/utils";

const caption = Bun.env.CAPTION as string;

async function handleInstagram(ctx: UserContext, url: string) {
  const archive = await sendFromArchive(ctx, url);
  if (archive) return;

  let ytdlp: Instagram;
  const instance = waitList.get(url);

  if (instance) ytdlp = instance as Instagram;
  else {
    ytdlp = new Instagram(url);
    waitList.set(url, ytdlp);
  }

  try {
    const msg = await ctx.reply("⬇️ Downloading on the server...", {
      reply_parameters: { message_id: ctx.msgId! },
    });

    if (ytdlp.status == "INACTIVE") await ytdlp.downloadVideo();
    else {
      await waitForDownload(ytdlp);
      await waitForArchiving(ytdlp);
      ctx.api.editMessageText(
        ctx.chatId!,
        msg.message_id,
        "⬆️ Uploading to Telegram..."
      );
      await sendFromArchive(ctx, url);
      ctx.api.deleteMessage(msg.chat.id, msg.message_id);
      return;
    }

    ctx.api.editMessageText(
      ctx.chatId!,
      msg.message_id,
      "⬆️ Uploading to Telegram..."
    );

    const { duration, width, height } = await getMetadata(ytdlp.filePath);
    const thumbnail = await getThumbnail(width, height, ytdlp.filePath);

    const file = await ctx.replyWithVideo(new InputFile(ytdlp.filePath), {
      reply_parameters: { message_id: ctx.msgId! },
      duration,
      supports_streaming: true,
      width,
      height,
      thumbnail: new InputFile(thumbnail),
      caption,
    });

    await removeFile(thumbnail);

    ctx.api.deleteMessage(msg.chat.id, msg.message_id);

    await addToArchive(url, {
      chatId: file.chat.id.toString(),
      msgId: file.message_id,
    });
  } catch (error) {
    console.log(error);

    return ctx.reply("An internal operation has been failed.", {
      reply_parameters: { message_id: ctx.msgId! },
    });
  } finally {
    await ytdlp.clean();
  }

  waitList.delete(url);
}

export default handleInstagram;
