import { getCurrentUser } from "./config";
import { createFeed } from "./db/creatfeed";
import { getUserByName } from "./db/queries/users";
import { printFeed } from "../src/print";

export async function handlerAddFeed(
  cmdName: string,
  ...args: string[]
) {
  if (args.length < 2) {
    throw new Error("Usage: gator addfeed <name> <url>");
  }

  const [name, url] = args;

  const currentUserName = getCurrentUser();
  if (!currentUserName) {
    throw new Error("Not logged in");
  }

  const user = await getUserByName(currentUserName);
  if (!user) {
    throw new Error("Current user not found");
  }

  const feed = await createFeed(name, url, user.id);

  printFeed(feed, user);
}