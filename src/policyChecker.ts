import { z } from "zod";
import { Message, Policy, ActionSchema, MessageContext } from "./types";
import { getAssistantResponse } from "./util/openAIUtil";
import promptTemplate from "./prompts/policyCheckPrompt"

type PromptTemplateVariables = {
  policies: Policy[],
  actions: string[],
  message: string,
  roomTopic: string,
  chatHistory: string
}

const PolicyCheckResponseSchema = z.object({
  is_policy_compliant: z.boolean(),
  non_compliant_reasons: z.array(z.object({
    policy: z.string(),
    reason: z.string()
  })).optional(),
  suggested_actions: z.array(ActionSchema)
}).strict();

export type PolicyCheckResponse = z.infer<typeof PolicyCheckResponseSchema>;

export const checkMessageAgainstPolicies = async (
  message: Message,
  policies: Policy[],
  actionOptions: string[],
  {roomTopic, chatHistory}: MessageContext
): Promise<PolicyCheckResponse>  => {
  const promptTemplateVariables: PromptTemplateVariables = {
    message: JSON.stringify(message),
    policies,
    actions: actionOptions,
    roomTopic,
    chatHistory: JSON.stringify(chatHistory)
  }
  return await getAssistantResponse(promptTemplateVariables, PolicyCheckResponseSchema, promptTemplate)
}
