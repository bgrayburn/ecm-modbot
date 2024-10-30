import matrixSDK, { EventType, MatrixClient, MsgType, RoomEvent } from "matrix-js-sdk";
import { Message, RoomConfig } from "./types";

export default class Room {
  homeserver: string;
  accessToken: string;
  userId: string;
  roomId: string;
  matrixClient: MatrixClient

  constructor(roomConfig: RoomConfig, newMessageHandler: (msg: Message) => void) {
    this.homeserver = roomConfig.homeserver;
    this.accessToken = roomConfig.accessToken;
    this.userId = roomConfig.userId;
    this.roomId = roomConfig.roomId;
    this.matrixClient = matrixSDK.createClient({
      baseUrl: this.homeserver,
      accessToken: this.accessToken,
      userId: this.userId
    });

    // check if already in room
    if (this.matrixClient.getRoom(this.roomId) === undefined) {
      this.joinRoom(this.roomId)
    } else {
      console.log(JSON.stringify(this.matrixClient.getRoom(this.roomId)))
    }
    this.listenForMessages(newMessageHandler);
  }

  sendMessage(message: string) {
    this.matrixClient.sendTextMessage(this.roomId, message);
  }

  redactMessage(eventId: string) {
    this.matrixClient.redactEvent(this.roomId, eventId);
  }

  kickUser(userId: string) {
    this.matrixClient.kick(this.roomId, userId);
  }

  banUser(userId: string) {
    this.matrixClient.ban(this.roomId, userId);
  }

  joinRoom(roomId: string) {
    this.matrixClient.joinRoom(roomId).then(function(state) {
      console.log("Joined room " + roomId);
    }).catch(function(err) {
      console.log("Error joining room " + roomId + ": " + err);
    });
  }

  listenForMessages(newMessageHandler: (msg: Message) => void) {
    this.matrixClient.on(RoomEvent.Timeline, (event, room, toStartOfTimeline) => {
      if (event.getType() === EventType.RoomMessage && event.getContent().msgtype === MsgType.Text) {
        const body = event.getContent().body;
        const msg: Message = {
          id: event.getId(),
          content: body,
          author: event.getSender()
        }
        console.log('about to handle new message: ', JSON.stringify(msg))
        newMessageHandler(msg)
      }
    });
  }
}
