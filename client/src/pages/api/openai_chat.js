import OpenAI from "openai";

const openapiKey = process.env.GITHUB_TOKEN;
console.log("OpenAI API Key:", openapiKey);

const openai = new OpenAI({
  apiKey: openapiKey,
  dangerouslyAllowBrowser: true,
  baseURL: "https://models.github.ai/inference",
});

export default async function openAIChat(req, res) {
  try {
    console.log("Received request:", req.body);

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4.1",
      messages: [
        {
          role: "system",
          content:
            "You are a terse bot in a conversation responding to questions with 1-2 sentences answers.",
        },
        {
          role: "user",
          content: req.body.message,
        },
      ],
    });

    const { choices } = response;

    const message = choices[0].message.content;

    res.status(200).json({ message });
  } catch (error) {
    console.error("Error in OpenAI API call:", error);
    throw error;
  }
}
