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

export type PolicyRepoConfig = {
   basePath: string,
}

export enum ActionOptions {
  SendMessage = 'sendMessage',
  RedactMessage = 'redactMessage',
  KickUser = 'kickUser',
  BanUser = 'banUser'
}

export const ActionSchema = z.object({
  type: z.nativeEnum(ActionOptions),
  message: z.string().optional(),
  eventId: z.string().optional(),
  userId: z.string().optional()
})

export type Action = z.infer<typeof Action>

export type PromptTemplateVariables = {
  policies: Policy[],
  actions: string[],
  message: string
}
