// import OpenAI from "openai";

// const openapiKey = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
// console.log("OpenAI API Key:", openapiKey);

// const openai = new OpenAI({
//   apiKey: openapiKey,
//   dangerouslyAllowBrowser: true,
//   baseURL: "https://models.github.ai/inference",
// });

// export const openAIChat = async (message) => {
//   try {
//     const response = await openai.chat.completions.create({
//       model: "openai/gpt-4.1",
//       messages: [
//         {
//           role: "system",
//           content:
//             "You are a terse bot in a conversation responding to questions with 1-2 sentences answers.",
//         },
//         {
//           role: "user",
//           content: message,
//         },
//       ],
//     });

//     const { choices } = response;

//     return choices[0].message.content;
//   } catch (error) {
//     console.error("Error in OpenAI API call:", error);
//     throw error;
//   }
// };
