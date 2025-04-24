import { Composer, session } from "grammy";
import { PrismaAdapter } from "@grammyjs/storage-prisma";

import type { UserContext } from "types/type";

import db from "database";

const auth = new Composer<UserContext>();

auth.use(
  session({
    initial: () => ({ user: null }),
    storage: new PrismaAdapter(db.session),
  })
);

auth.use(async (ctx, next) => {
  if (ctx.session.user) {
    return next();
  }
  if (!ctx.from) return;
  const user = await db.user.findUnique({ where: { id: ctx.from.id.toString() } });
  if (!user) return;
  ctx.session.user = user;
  next();
});

export default auth;
