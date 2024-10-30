import Bot from "./bot";
import { PolicyRepoConfig, RoomConfig } from "./types";


const policyRepo = ''
const homeserver = `https://${process.env.HOMESERVER_URL}` || "http://localhost:8008";
const userId = `@${process.env.HOMESERVER_USER}:${process.env.HOMESERVER_URL}`;
const accessToken = process.env.HOMESERVER_TOKEN;
const roomId = process.env.HOMESERVER_ROOM_ID;

const roomConfig: RoomConfig = { homeserver, userId, accessToken, roomId }

const policyRepoUrl = process.env.POLICY_REPO_URL || "";
const policyRepoToken = process.env.POLICY_REPO_TOKEN || "";
const policyRepoConfig: PolicyRepoConfig = { url: policyRepoUrl, accessToken: policyRepoToken }

const bot = new Bot(roomConfig, policyRepoConfig)

// matrixClient.on(RoomEvent.Timeline, (event, room, toStartOfTimeline) => {
//     if (event.getType() === EventType.RoomMessage && event.getContent().msgtype === MsgType.Text) {
//         const sender = event.getSender();
//         const roomId = event.getRoomId();
//         const content = event.getContent();
//         const body = content.body;
//         const formattedTime = event.getDate().toLocaleString();
//         console.log(clc.green(`[${formattedTime}] ${sender}: ${body}`));
//         if (body.startsWith("!setpolicyrepo")) {
//             policyRepo = body.split(" ")[1];
//             matrixClient.sendTextMessage(roomId, `The policy repo has been set to ${policyRepo}`);
//             console.log(clc.green(`The policy repo has been set to ${policyRepo}`));
//         }
//         if (body.startsWith("!getpolicyrepo")) {
//             matrixClient.sendTextMessage(roomId, `The current policy repo is ${policyRepo}`);
//         }
//     }
// })

// matrixClient.startClient();
