import * as z from "zod";
import { zodResponseFormat } from "openai/helpers/zod"
import OpenAI from "openai";

const fillPromptTemplate = (promptTemplate: string, variables: {}) => {
  return promptTemplate.replace(/\{\{(\w+)\}\}/g, (_, key) => JSON.stringify(variables[key]));
};

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Function to get a response conforming to the specified JSON schema
export async function getAssistantResponse<T extends z.ZodRawShape>(
  promptTemplateVariables: {},
  responseSchema: z.ZodObject<T>,
  promptTemplate: string
) {
  try {
    const prompt = fillPromptTemplate(promptTemplate, promptTemplateVariables)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: prompt }
      ],
      response_format: zodResponseFormat(responseSchema, "response_schema")
    });

    const response = responseSchema.parse(
        JSON.parse(completion.choices[0].message.content)
    );
    return response;
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}
