import {
  CommandsRegistry,
  registerCommand,
  runCommand,
  handlerLogin,
  handlerRegister,
  handlerReset,
  handlerUsers,
  handlerAgg,
  handlerAddFeed,
  handlerFeeds,
  handlerFollowing,
  handlerFollow,
  middlewareLoggedIn,
  handlerUnfollow
} from "./CommandHandler";
async function main() {
    
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("No command provided.");
    process.exit(1);
  }

  const [cmdName, ...cmdArgs] = args;

  const registry: CommandsRegistry = {};
  registerCommand(registry, "reset", handlerReset);
  registerCommand(registry, "login", handlerLogin);
  registerCommand(registry, "register", handlerRegister);
  registerCommand(registry, "users", handlerUsers);
  registerCommand(registry, "agg", handlerAgg);
   registerCommand(registry, "feeds", handlerFeeds);
  registerCommand(registry, "addfeed", middlewareLoggedIn(handlerAddFeed));
  registerCommand(registry, "follow", middlewareLoggedIn(handlerFollow));
  registerCommand(registry, "following", middlewareLoggedIn(handlerFollowing));
  registerCommand(registry, "unfollow", middlewareLoggedIn(handlerUnfollow));

  try {
    await runCommand(registry, cmdName, ...cmdArgs);
  } catch (err: any) {
   console.log(err.message);
    process.exit(1);
  }

  process.exit(0);
}

main();