import db from "database";

const adminId = Bun.env.ADMIN_ID as string;
const botToken = Bun.env.BOT_TOKEN as string;
const localApi = Bun.env.LOCAL_API as string;

if (!adminId) {
  console.log("Admin id isn't provided");
  process.exit(1);
}

if (!botToken) {
  console.log("Bot token isn't provided");
  process.exit(1);
}

if (!localApi) {
  console.log("Local API isn't provided");
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
