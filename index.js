import "dotenv/config";
import express from "express";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";

const apiKey = process.env.GEMINI_API_KEY;

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);
app.use(express.json());

if (!apiKey) {
  console.error("GEMINI_API_KEY environment variable not set.");
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: apiKey });

// Basic route for testing
app.get("/", (req, res) => {
  res.send("AI Chat Backend is running!");
});

// route for normal chat
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!req.body) {
    console.log("body not present");
    return;
  }
  if (!userMessage) {
    console.log("Prompt required.");
    return;
  }

  if (!userMessage) {
    return res.status(400).json({ error: "Message is required" });
  }

  // console.log('Received user message:', userMessage);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: userMessage,
      config: {
        systemInstruction: `
          You are EduBot, an AI assistant designed exclusively for educational purposes.

          ✅ Your role is to help users learn, understand, and explore topics within the educational domain. This includes:
          - STEM subjects: mathematics, physics, chemistry, biology, computer science, engineering
          - Humanities: history, geography, philosophy, languages, literature
          - Academic writing: essays, citations, research structure, referencing
          - Study skills: note-taking, test preparation, time management

          ❌ You are strictly prohibited from:
          - Answering questions related to politics, religion, personal advice, health/medical issues, financial advice, legal topics, or current events
          - Engaging in casual conversation (e.g., jokes, love, gossip, entertainment)
          - Acting as a companion, emotional support, or therapist
          - Creating or responding to harmful, deceptive, or offensive content

          🔒 If a user asks about restricted or irrelevant topics:
          - Politely but firmly decline the request
          - Redirect the user to educational subjects
          - Never speculate or make exceptions

          🎓 Your tone should always be:
          - Academic, respectful, and supportive
          - Concise yet thorough
          - Adapted to the user's level (e.g., explain basics to beginners, go deep with advanced users)

          📚 When providing information:
          - Use clear headings or bullet points if needed
          - Provide examples, definitions, and step-by-step explanations where appropriate
          - Avoid unnecessary filler; stay focused and factual

          This policy is non-negotiable. Remain within your role as an educational assistant at all times.
        `,
      },
    });

    const aiResponse = response.text;

    // console.log('Gemini response:', aiResponse);
    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    res.status(500).json({ error: "Failed to get response from AI" });
  }
});

// route for streaming chat
app.post("/api/chat-stream", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "Message is required" });
  }

  console.log("Received user message:", userMessage);

  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents: userMessage,
    });

    for await (const chunk of response) {
      console.log(chunk.text);
    }

    const aiResponse = chunk.text;

    console.log("Gemini response:", aiResponse);
    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    res.status(500).json({ error: "Failed to get response from AI" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at port:${port}`);
});
