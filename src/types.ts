export type RoomConfig = {
   homeserver: string,
   accessToken: string,
   userId: string,
   roomId: string
}

export type PolicyStatus = Enumerator<"approved" | "pending" | "denied">;

export type Policy = {
  name: string
  status: PolicyStatus
  content: string
  createdAt: string
  updatedAt: string
  appliedAt: string
  author: string
}

export type Message = {
  id: string
  content: string
  author: string
}

export type PolicyRepoConfig = {
   url: string,
   accessToken: string,
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
