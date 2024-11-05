import * as z from "zod";
import { getAssistantResponse } from "./util/openAIUtil";
import promptTemplate from './prompts/policyUpdatePrompt'

type PromptTemplateVariables = {
  update_instructions: string
  policy_text: string
}

const PolicyUpdateResponseSchema = z.object({
  policy_text: z.string()
})

export type PolicyUpdateResponse = z.infer<typeof PolicyUpdateResponseSchema>

export const getUpdatedPolicyText = async (updateInstructions: string, policyText: string): Promise<PolicyUpdateResponse> => {
   const promptTemplateVariables: PromptTemplateVariables = {
     update_instructions: updateInstructions,
     policy_text: policyText
   }
   return getAssistantResponse(promptTemplateVariables, PolicyUpdateResponseSchema, promptTemplate)
}
