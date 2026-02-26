import { db } from "..";
import { users } from "../../schema";
import { eq } from "drizzle-orm"; 




export async function createUser(name: string) {
   console.log("createUser called with:", name);
  const existingUser = await db.select().from(users).where(eq(users.name, name));
  console.log("Existing users found:", existingUser);
  if (existingUser.length > 0) {
    throw new Error(`User "${name}" already exists.`);
  }

  const [result] = await db.insert(users).values({ name }).returning();
   console.log("Inserted result:", result);
  return result;
}

export async function getUserByName(name: string) {
  const [user] = await db.select().from(users).where(eq(users.name, name));
  return user;
}
export async function resetUsers(): Promise<void> {
  // Delete all users
  await db.delete(users);
}
export async function getUsers(): Promise<{ name: string }[]> {
  return db.select().from(users);
}
