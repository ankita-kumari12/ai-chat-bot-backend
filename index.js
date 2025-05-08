import 'dotenv/config';
import express from "express";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";

const apiKey = process.env.GEMINI_API_KEY;

const app = express();  
const port = process.env.PORT || 5000;


app.use(cors({
  origin: process.env.CORS_ORIGIN,
}));
app.use(express.json());

if (!apiKey) {
  console.error("GEMINI_API_KEY environment variable not set.");
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: apiKey });

// Basic route for testing
app.get('/', (req, res) => {
  res.send('AI Chat Backend is running!');
});

// route for normal chat
app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;
  
  if(!req.body) {
    console.log("body not present");
    return;
  }
  if(!userMessage) {
    console.log("Prompt required.");
    return;
  }

  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // console.log('Received user message:', userMessage);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: userMessage,
      // config: {
      //   systemInstruction: "You are a coding helper, you name is Code-Bro, and whenever you are asked outside of coding, reject politely."
      // }
    });

    const aiResponse = response.text;

    // console.log('Gemini response:', aiResponse);
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Error communicating with Gemini:', error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

// route for streaming chat
app.post('/api/chat-stream', async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required' });
  }

  console.log('Received user message:', userMessage);

  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents: userMessage,
    });

    for await (const chunk of response) {
      console.log(chunk.text);
    }

    const aiResponse = chunk.text;

    console.log('Gemini response:', aiResponse);
    res.json({ response: aiResponse });

  } catch (error) {
    console.error('Error communicating with Gemini:', error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at port:${port}`);
});
