import matrixSDK, { ClientEvent, EventTimeline, EventType, KnownMembership, MatrixClient, MsgType, RoomEvent } from "matrix-js-sdk";
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

    this.joinRoom(this.roomId);
    this.listenForMessages(newMessageHandler);
    this.matrixClient.startClient({ initialSyncLimit: 0 });
  }

  listenForClientEvents() {
    this.matrixClient.on(ClientEvent.Event, (event) => {
      console.log(event.getType())
    })
  }

  listenForRoomInvitations() {
    this.matrixClient.on(RoomEvent.MyMembership, (room, membership, prevMembership) => {
      if (membership === KnownMembership.Invite) {
        console.log(`got an invite to room ${room.roomId}`)
        this.matrixClient.joinRoom(room.roomId).then((state) => {
          console.log("Joined room " + room.roomId);
        }).catch((err) => {
          console.log("Error joining room " + room.roomId + ": " + err);
        });
      }
    })
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
        if (msg.author !== this.userId) {
          this.matrixClient.sendReadReceipt(event)
        }
        newMessageHandler(msg)
      }
    });
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

  getRoomTopic(): string {
    const room = this.matrixClient.getRoom(this.roomId);
    const currentState = room.getLiveTimeline().getState(EventTimeline.FORWARDS);
    return currentState.getStateEvents("m.room.topic", "")[0]?.getContent().topic || "";
  }
}
