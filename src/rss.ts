import { XMLParser } from "fast-xml-parser";

export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

export type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};



export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  const res = await fetch(feedURL, {
    headers: {
      "User-Agent": "gator",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch feed: ${res.status}`);
  }

  const xml = await res.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
  });

  const parsed = parser.parse(xml);

  if (!parsed?.rss?.channel) {
    throw new Error("Invalid RSS feed: missing channel");
  }

  const channel = parsed.rss.channel;

  const title = channel.title;
  const link = channel.link;
  const description = channel.description;

  if (
    typeof title !== "string" ||
    typeof link !== "string" ||
    typeof description !== "string"
  ) {
    throw new Error("Invalid RSS channel metadata");
  }

  let items: any[] = [];

  if (channel.item) {
    items = Array.isArray(channel.item)
      ? channel.item
      : [channel.item];
  }

  const parsedItems = items
    .map((item) => {
      const { title, link, description, pubDate } = item;

      if (
        typeof title !== "string" ||
        typeof link !== "string" ||
        typeof description !== "string" ||
        typeof pubDate !== "string"
      ) {
        return null;
      }

      return { title, link, description, pubDate };
    })
     .filter((item): item is RSSItem => item !== null);

  return {
    channel: {
      title,
      link,
      description,
      item: parsedItems,
    },
  };
}