# Gator CLI

`gator` is a command-line RSS feed aggregator. Users can register, login, add feeds, follow/unfollow feeds, and view feed updates.

---

## Prerequisites

- Node.js v18+  
- npm  
- PostgreSQL running locally or remotely  

---

## Setup

1. **Clone the repo:**

```bash
git clone https://github.com/your-username/gator.git
cd gator

Install dependencies:

npm install

Create config file at ~/.gatorconfig.json:

{
  "db_url": "postgres://username:password@localhost:5432/gator?sslmode=disable",
  "current_user_name": ""
}

Run migrations:

npx drizzle-kit migrate
Running the CLI
npm start <command> [args]
Commands
Command	Description
register <username>	Create user & log in
login <username>	Log in
reset	Reset database
users	List users
addfeed <name> <url>	Add a feed & follow it
feeds	List all feeds
follow <url>	Follow a feed
unfollow <url>	Unfollow a feed
following	List your followed feeds
agg	Fetch latest items

addfeed, follow, unfollow, following require a logged-in user.

Example
npm start register kahya
npm start addfeed "Hacker News RSS" "https://hnrss.org/newest"
npm start follow "https://www.wagslane.dev/index.xml"
npm start following
npm start unfollow "https://hnrss.org/newest"
Notes

Adding a feed auto-follows it.

Multiple users can follow the same feed.

Deleting a user or feed removes related follows.

