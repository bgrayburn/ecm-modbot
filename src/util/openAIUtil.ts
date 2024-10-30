import OpenAI from "openai";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// TODO: complete prompt
const prompt =
  "";

// TODO: complete functions for this application
const functions = [
  {
    name: "getInstructionResponse",
    description:
      "Provides a voxdocs instruction response in a structured JSON format",
    parameters: {
      type: "object",
      properties: {
        document: {
          type: "string",
          description: "The text of the updated document",
        },
        message: {
          type: "string",
          description: "The message to the user",
        },
      },
      required: ["document", "message"],
    },
  },
];

// Function to get a response conforming to the specified JSON schema
export async function getAssistantResponse(jsonInput: object) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: prompt },
        { role: "user", content: JSON.stringify(jsonInput) },
      ],
      functions: functions,
      function_call: { name: "getInstructionResponse" },
    });

    if (completion.choices[0].message.tool_calls) {
      // Extract the function call arguments (structured JSON)
      const functionArgs =
        completion.choices[0].message.tool_calls[0].function.arguments;
      const response = JSON.parse(functionArgs);

      return response;
    } else {
      throw new Error("No function call on return object.");
    }
  } catch (error) {
    console.error("Error generating response:", error);
    return { error: "Failed to generate a valid JSON response." };
  }
}
