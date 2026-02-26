import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./../schema"; 
import { readConfig } from "../config";

const config = readConfig();


const conn = postgres(config.dbUrl, { debug: true });
export const db = drizzle(conn, { schema });