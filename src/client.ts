import { join } from "path";

import TGClient from "models/telegram-client";
import { rootPath } from "helpers/utils";

const apiId = Bun.env.API_ID as string;
const apiHash = Bun.env.API_HASH as string;

let client: TGClient;

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
} catch (error) {
  console.log(error);
  process.exit(1);
}

export default client;
