import Bot from "./bot";
import { PolicyRepoConfig, RoomConfig } from "./types";


const policyRepo = ''
const homeserver = `https://${process.env.HOMESERVER_URL}` || "http://localhost:8008";
const userId = `@${process.env.HOMESERVER_USER}:${process.env.HOMESERVER_URL}`;
const accessToken = process.env.HOMESERVER_TOKEN;
const roomId = process.env.HOMESERVER_ROOM_ID;
console.log(`roomId: ${roomId}`)

const roomConfig: RoomConfig = { homeserver, userId, accessToken, roomId }

const policyRepoPath = process.env.POLICY_REPO_PATH || "./data";
const policyRepoConfig: PolicyRepoConfig = { basePath: policyRepoPath }

const bot = new Bot(roomConfig, policyRepoConfig)
