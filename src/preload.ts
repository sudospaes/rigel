import db from "database";

const adminId = Bun.env.ADMIN_ID as string;
const botToken = Bun.env.BOT_TOKEN as string;

if (adminId == "") {
  console.log("Admin id not provided");
  process.exit(1);
}

if (botToken == "") {
  console.log("Bot token not provided");
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
