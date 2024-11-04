import { z } from "zod";
import { Message, Policy, PromptTemplateVariables, ActionSchema } from "./types";
import { getAssistantResponse } from "./util/openAIUtil";
import promptTemplate from "./util/openAIPrompt"

const PolicyCheckResponseSchema = z.object({
  is_policy_compliant: z.boolean(),
  non_compliant_reasons: z.array(z.object({
    policy: z.string(),
    reason: z.string()
  })).optional(),
  suggested_actions: z.array(ActionSchema)
}).strict();

export type PolicyCheckResponse = z.infer<typeof PolicyCheckResponseSchema>;

export default class PolicyChecker {

  async checkMessageAgainstPolicies(message: Message, policies: Policy[], actionOptions: string[]): Promise<PolicyCheckResponse> {
    const promptTemplateVariables: PromptTemplateVariables = {
      message: JSON.stringify(message),
      policies: policies,
      actions: actionOptions
    }
    return await getAssistantResponse(promptTemplateVariables, PolicyCheckResponseSchema, promptTemplate)
  }
}
