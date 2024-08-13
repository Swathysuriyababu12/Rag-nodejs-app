const { OpenAI } = require("openai");

async function createEmbedings(text) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
    });

    const embeddings = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
      encoding_format: "float",
    });
    return embeddings;
    console.log(embeddings);
  } catch (error) {
    throw new Error(error);
  }
}
module.exports = { createEmbedings };
