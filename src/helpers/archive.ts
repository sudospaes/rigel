import db from "database";

import type { UserContext } from "types/type";
import type { FileMessage } from "types/interface";

export async function sendFromArchive(ctx: UserContext, key: string, msgId?: string) {
  const archive = await db.archive.findUnique({ where: { key } });
  if (!archive) return null;

  try {
    const msg = await ctx.api.copyMessage(ctx.chatId!, archive.chatId, +archive.msgId, {
      reply_parameters: { message_id: msgId ? +msgId : ctx.msgId! },
    });
    return msg;
  } catch (error) {
    await db.archive.delete({ where: { key: archive.key } });
    return null;
  }
}

export async function addToArchive(url: string, file: FileMessage) {
  await db.archive.create({
    data: { key: url, chatId: file.chatId, msgId: file.msgId.toString() },
  });
}
