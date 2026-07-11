import { Client, Account, Databases } from "appwrite";

const client = new Client()
    .setEndpoint("https://sgp.cloud.appwrite.io/v1")
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

const account = new Account(client);
const databases = new Databases(client);

export const APPWRITE_DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DB_ID || "";
export const CLASSROOMS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_CLASSROOMS_COLLECTION_ID || "";
export const STUDENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_STUDENTS_COLLECTION_ID || "";

export { client, account, databases };
