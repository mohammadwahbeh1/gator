import { setUser, readConfig } from "./config";
import { createUser, getUserByName } from "./db/queries/users";
import { users } from "./schema";
import { resetUsers } from "./db/queries/users";
import { getUsers } from "./db/queries/users";
import { getCurrentUser } from "./config";
import { createFeed } from "./db/creatfeed";
import { printFeed } from "../src/print";
import { getFeedsWithUsers } from "./db/creatfeed";
import { fetchFeed } from "../src/rss";
import { getFeedByUrl } from "./db/queries/feeds";
import { createFeedFollow } from "./db/queries/feedFollows";
import { getFeedFollowsForUser } from "./db/queries/feedFollows";
import { deleteFeedFollowByUserAndUrl } from "./db/queries/deletefeedfollow";
import { User } from "./schema";
export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;
export type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

export function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler
): void {
  registry[cmdName] = handler;
}

// Handlers
// login command
export async function handlerLogin(cmdName: string, ...args: string[]) {
  // 1. Require username
  if (args.length === 0) {
    throw new Error("Username is required. Usage: gator login <username>");
  }

  const username = args[0];

  // 2. Fetch user from DB
  const user = await getUserByName(username);

  if (!user) {
    // ❌ User does not exist → fail
    throw new Error(`User "${username}" does not exist`);
  }

  // 3. Try to update config
  try {
    setUser(user.name);
  } catch (err: any) {
    console.error("⚠ Failed to update config:", err.message || err);
    // Optional: do not throw, still allow login
  }

  // 4. Success message
  console.log(`✅ Logged in as "${user.name}"`);
}

export const handlerRegister: CommandHandler = async (cmdName, ...args) => {
  if (args.length === 0) throw new Error("Username is required.");
  const username = args[0];

  // ONLY check if user exists in database
  const existingUser = await getUserByName(username);

  if (existingUser) {
    // User exists in database → fail
    throw new Error(`User "${username}" already exists.`);
  }

  // User does NOT exist in database → create them
  const newUser = await createUser(username);
  setUser(newUser.name);
  console.log(`✅ User created:`, newUser);
};

export async function runCommand(
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const handler = registry[cmdName];

  if (!handler) {
    throw new Error(`Command "${cmdName}" not found.`);
  }

  await handler(cmdName, ...args);
}
export const handlerReset: CommandHandler = async () => {
  try {
    await resetUsers();
    console.log("✅ Database reset successful. All users deleted.");
  } catch (err: any) {
    console.log("❌ Failed to reset database:", err.message);
    process.exit(1);
  }
};

export const handlerUsers: CommandHandler = async () => {
  const allUsers = await getUsers();
  const currentUser = getCurrentUser(); // get currently logged-in username

  allUsers.forEach((user) => {
    if (user.name === currentUser) {
      console.log(`* ${user.name} (current)`);
    } else {
      console.log(`* ${user.name}`);
    }
  });
};


export async function handlerAgg() {
  const feed = await fetchFeed("https://www.wagslane.dev/index.xml");
  for (const item of feed.channel.item) {
  console.log(item.title);
   if (item.title.includes("Optimize For Simplicity")) {
      console.log("Optimize for simplicity");
    }
}
}
export async function handlerAddFeed(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  if (args.length < 2) {
    throw new Error("Usage: gator addfeed <name> <url>");
  }

  const [name, url] = args;

  const feed = await createFeed(name, url, user.id);
  await createFeedFollow(user.id, feed.id);

  printFeed(feed, user);
}


export async function handlerFeeds() {
  const allFeeds = await getFeedsWithUsers();

  for (const feed of allFeeds) {
    console.log(
      `${feed.feedName} (${feed.feedUrl}) by ${feed.userName}`
    );
  }
}
export async function handlerFollow(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  if (args.length < 1) {
    throw new Error("Usage: gator follow <url>");
  }

  const url = args[0];

  const feed = await getFeedByUrl(url);
  if (!feed) throw new Error("Feed not found");

  const follow = await createFeedFollow(user.id, feed.id);

  console.log(`${follow.feedName} followed by ${follow.userName}`);
}


export async function handlerFollowing() {
  const currentUserName = getCurrentUser();
  if (!currentUserName) throw new Error("Not logged in");

  const user = await getUserByName(currentUserName);
  if (!user) throw new Error("User not found");

  const follows = await getFeedFollowsForUser(user.id);

  for (const follow of follows) {
    console.log(follow.feedName);
  }
}




export function middlewareLoggedIn(
  handler: UserCommandHandler
): CommandHandler {
  return async (cmdName: string, ...args: string[]) => {
    const currentUserName = getCurrentUser();
    if (!currentUserName) {
      throw new Error("Not logged in");
    }

    const user = await getUserByName(currentUserName);
    if (!user) {
      throw new Error(`User ${currentUserName} not found`);
    }

    return handler(cmdName, user, ...args);
  };
}
export async function handlerUnfollow(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  if (args.length < 1) {
    throw new Error("Usage: gator unfollow <url>");
  }

  const url = args[0];

  const result = await deleteFeedFollowByUserAndUrl(user.id, url);

  if (result.deletedCount === 0) {
    console.log(`${user.name} was not following "${result.feedName}"`);
  } else {
    console.log(`${user.name} unfollowed "${result.feedName}"`);
  }
}
