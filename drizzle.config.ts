import { defineConfig } from "drizzle-kit";
import { readConfig } from "./src/config"; // our CLI config reader

const cfg = readConfig();

export default defineConfig({
  schema: "src/schema.ts",      
  out: "src/db/migrations",     
  dialect: "postgresql",
  dbCredentials: {
    url: cfg.dbUrl,             
  },
});