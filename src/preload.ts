import db from "database";
import client from "client";

const adminId = Bun.env.ADMIN_ID as string;
const botToken = Bun.env.BOT_TOKEN as string;
const apiId = Bun.env.API_ID as string;
const apiHash = Bun.env.API_HASH as string;
const channelId = Bun.env.CHANNEL_ID as string;

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
  await client.saveSession();
} catch (error) {
  console.log(error);
  process.exit(1);
}
