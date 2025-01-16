import * as z from "zod";

export type RoomConfig = {
   homeserver: string,
   accessToken: string,
   userId: string,
   roomId: string
}

// TODO: add denied status
export enum PolicyStatus {
  Approved = 'approved',
  Proposed = 'proposed',
};

export interface PolicyFile {
  content: string
  createdAt: string
  updatedAt: string
  approvedAt?: string
  votes: boolean[]
  author: string
}

export interface Policy extends PolicyFile {
  name: string
  status: PolicyStatus
}

export type Message = {
  id: string
  content: string
  author: string
}

export type MessageContext = {
  roomTopic: string
  chatHistory: Message[]
}

export type PolicyRepoConfig = {
   basePath: string,
}

export enum ActionOptions {
  SendMessage = 'sendMessage',
  RedactMessage = 'redactMessage',
  KickUser = 'kickUser',
  BanUser = 'banUser'
}

export const SendMessageActionSchema = z.object({
  type: z.literal(ActionOptions.SendMessage),
  message: z.string(),
  userId: z.string()
})

export const RedactMessageActionSchema = z.object({
  type: z.literal(ActionOptions.RedactMessage),
  eventId: z.string(),
})

export const KickUserActionSchema = z.object({
  type: z.literal(ActionOptions.KickUser),
  userId: z.string()
})

export const BanUserActionSchema = z.object({
  type: z.literal(ActionOptions.BanUser),
  userId: z.string()
})

export const ActionSchema = z.discriminatedUnion("type", [
  SendMessageActionSchema,
  RedactMessageActionSchema,
  KickUserActionSchema,
  BanUserActionSchema
])

export type Action = z.infer<typeof ActionSchema>
