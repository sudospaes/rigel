import { join } from "path";

import db from "database";

import TGClient from "models/telegram-client";
import { rootPath } from "helpers/utils";

const adminId = Bun.env.ADMIN_ID as string;
const botToken = Bun.env.BOT_TOKEN as string;
const apiId = Bun.env.API_ID as string;
const apiHash = Bun.env.API_HASH as string;
const channelId = Bun.env.CHANNEL_ID as string;
const caption = Bun.env.CAPTION as string;

let client: TGClient;

if (!adminId) {
  console.log("Admin id isn't provided");
  process.exit(1);
}

if (!botToken) {
  console.log("Bot token isn't provided");
  process.exit(1);
}

if (!apiId) {
  console.log("API id isn't provided");
  process.exit(1);
}

if (!apiHash) {
  console.log("API hash isn't provided");
  process.exit(1);
}

if (!channelId) {
  console.log("Channel id isn't provided");
  process.exit(1);
}

try {
  //? Create admin if it isn't exist
  const admin = await db.user.findUnique({ where: { id: adminId } });
  if (!admin) {
    await db.user.create({
      data: { id: adminId, role: "ADMIN" },
    });
    console.log("Admin has been added to database.");
  }
} catch (error) {
  console.log(error);
  process.exit(1);
}

try {
  let session: string = "";
  const sessionFile = Bun.file(join(rootPath(), "session"));
  if (await sessionFile.exists()) {
    session = await sessionFile.text();
  }
  if (session) {
    client = new TGClient(+apiId, apiHash, session);
  } else {
    client = new TGClient(+apiId, apiHash);
  }
  await client.start();
  if (!session) {
    await client.saveSession();
  }
} catch (error) {
  console.log(error);
  process.exit(1);
}

export { client, channelId, caption };
