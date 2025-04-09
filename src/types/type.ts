import type { Context, SessionFlavor } from "grammy";

import type { UserSessionData } from "types/interface";

export type UserContext = Context & SessionFlavor<UserSessionData>;
