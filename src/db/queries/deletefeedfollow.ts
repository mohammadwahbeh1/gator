import { db } from "..";
import { feedFollows, feeds } from "../../schema";
import { eq, and } from "drizzle-orm";

export async function deleteFeedFollowByUserAndUrl(
  userId: string,
  feedUrl: string
) {
  // Find the feed first
  const [feed] = await db.select().from(feeds).where(eq(feeds.url, feedUrl));

  if (!feed) throw new Error("Feed not found");

  // Delete the follow record
  const deletedRows = await db
    .delete(feedFollows)
    .where(and(eq(feedFollows.userId, userId), eq(feedFollows.feedId, feed.id)))
    .returning({ id: feedFollows.id }); // returning deleted rows

  return {
    feedName: feed.name,
    userId,
    deletedCount: deletedRows.length, //  number of deleted rows
  };
}