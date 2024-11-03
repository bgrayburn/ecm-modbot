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

export type PolicyCheckResponse = {
  policyId: string,
  actions: BotAction[],
}

export type BotAction =  {
  type: string,
  message?: string,
  eventId?: string,
  userId?: string
}
