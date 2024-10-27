import clc from "cli-color";
import fs from "fs";
import readline from "readline";
import sdk, { ClientEvent, EventType, MsgType, RoomEvent } from "matrix-js-sdk";
import { KnownMembership } from "matrix-js-sdk/lib/@types/membership.js";

const myHomeServer = `https://${process.env.HOMESERVER_URL}` || "http://localhost:8008";
const myUserId = `@${process.env.HOMESERVER_USER}:${process.env.HOMESERVER_URL}`;
const myAccessToken = process.env.HOMESERVER_TOKEN;

let policyRepo = ''

var matrixClient = sdk.createClient({
    baseUrl: myHomeServer,
    accessToken: myAccessToken,
    userId: myUserId,
});

matrixClient.on(RoomEvent.MyMembership, (room, membership, prevMember) => {
    if (membership === KnownMembership.Invite) {
        matrixClient.joinRoom(room.roomId).then(function () {
            console.log("Auto-joined %s", room.roomId);
            policyRepo = ''
            matrixClient.sendTextMessage(room.roomId, "Please set a policy git reposity url with the command !setpolicyrepo <repo url>");
        });
    }
    if (membership === KnownMembership.Leave) {
        console.log("Left %s", room.roomId);
        policyRepo = ''
    }
});  

matrixClient.on(RoomEvent.Timeline, (event, room, toStartOfTimeline) => {
    if (event.getType() === EventType.RoomMessage && event.getContent().msgtype === MsgType.Text) {
        const sender = event.getSender();
        const roomId = event.getRoomId();
        const content = event.getContent();
        const body = content.body;
        const formattedTime = event.getDate().toLocaleString();
        console.log(clc.green(`[${formattedTime}] ${sender}: ${body}`));
        if (body.startsWith("!setpolicyrepo")) {
            policyRepo = body.split(" ")[1];
            matrixClient.sendTextMessage(roomId, `The policy repo has been set to ${policyRepo}`);
            console.log(clc.green(`The policy repo has been set to ${policyRepo}`));
        }
        if (body.startsWith("!getpolicyrepo")) {
            matrixClient.sendTextMessage(roomId, `The current policy repo is ${policyRepo}`);
        }
    }
})

matrixClient.startClient();
