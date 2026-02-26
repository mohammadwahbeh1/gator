
import fs from "fs";
import os from "os";
import path from "path";

const isWSL = process.env.WSL_DISTRO_NAME !== undefined;
const homeDir = isWSL ? "/home/mohammadw" : os.homedir();
const configPath = path.join(homeDir, ".gatorconfig.json");
export type Config = {
  dbUrl: string;
  currentUserName?: string;
};


function getConfigFilePath(): string {
  return path.join(os.homedir(), ".gatorconfig.json");
}


function writeConfig(cfg: Config): void {
  
  if (!cfg.dbUrl) {
    throw new Error("dbUrl cannot be empty");
  }
  const json = JSON.stringify({
    db_url: cfg.dbUrl,
    current_user_name: cfg.currentUserName ?? undefined,
  }, null, 2);
  fs.writeFileSync(getConfigFilePath(), json, "utf-8");
}


function validateConfig(rawConfig: any): Config {
  if (!rawConfig || typeof rawConfig !== "object") {
    throw new Error("Config must be an object");
  }
  if (typeof rawConfig.db_url !== "string") {
    throw new Error("db_url must be a string");
  }
  return {
    dbUrl: rawConfig.db_url,
    currentUserName: typeof rawConfig.current_user_name === "string"
      ? rawConfig.current_user_name
      : undefined,
  };
}



export function readConfig(): Config {
  const filePath = getConfigFilePath();
  if (!fs.existsSync(filePath)) {
    throw new Error(`Config file not found at ${filePath}`);
  }


  let rawJson = fs.readFileSync(filePath, "utf-8");

  // Clean BOM and whitespace
  rawJson = rawJson.replace(/^\uFEFF/, "").trim();

 
  const parsed = JSON.parse(rawJson);
  return validateConfig(parsed);
}


export function setUser(username: string): void {
  try {
    let config = { db_url: "postgres://postgres:postgres@localhost:5432/gator?sslmode=disable", current_user_name: username };

    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
      const existing = JSON.parse(raw);
      config.db_url = existing.db_url || config.db_url;
      config.current_user_name = username;
    }

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to update config:", err);
    throw err;
  }
}


const CONFIG_PATH = path.join(process.env.HOME || process.env.USERPROFILE || ".", ".gatorconfig.json");

export function getCurrentUser(): string | null {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
    const config = JSON.parse(raw);
    return config.current_user_name || null;
  } catch (err) {
    console.error("Failed to read config:", err);
    return null;
  }
}
