import { Feed, User } from "./schema";

export function printFeed(feed: Feed, user: User) {
  console.log(`Feed created:`);
  console.log(`  ID: ${feed.id}`);
  console.log(`  Name: ${feed.name}`);
  console.log(`  URL: ${feed.url}`);
  console.log(`  User: ${user.name}`);
}