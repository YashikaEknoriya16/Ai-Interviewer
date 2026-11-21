const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "v1beta",
  },
});

// Parse Gemini Evaluation
const parseEvaluation = (response) => {
  const responseText = response.text || "";

  console.log("Gemini Raw Response:", responseText);
  console.log("Gemini Finish Reason:", response.candidates?.[0]?.finishReason);

  try {
    const cleaned = responseText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const result = JSON.parse(cleaned);

    const score = Number(result.score);

    if (!Number.isFinite(score) || score < 0 || score > 10) {
      throw new Error("Invalid score returned by Gemini.");
    }

    return {
      score: Math.round(score),
      feedback:
        typeof result.feedback === "string" && result.feedback.trim()
          ? result.feedback.trim()
          : "Answer evaluated successfully.",
    };
  } catch (error) {
    console.error("Evaluation Parsing Error:", error.message);
    return null;
  }
};

// Evaluate Answer
const evaluateAnswer = async (question, answer, category, difficulty) => {
  const startTime = Date.now();

  try {
    if (!answer || !answer.trim()) {
      throw new Error("Candidate answer is empty.");
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing.");
    }

    const prompt = `
You are a professional technical interviewer.

Evaluate the candidate's answer fairly.

Question: ${question}
Candidate Answer: ${answer}
Category: ${category || "Technical"}
Difficulty: ${difficulty || "Medium"}

Evaluate:
- Technical correctness
- Relevance to the question
- Understanding of the concept
- Important missing information

Rules:
- Correct and relevant answers should receive appropriate marks.
- Do not give 0 to a correct answer.
- Do not judge grammar or accent.
- Do not reward length or keywords alone.
- Give 0 only if the answer is completely incorrect or unrelated.
- Give partial marks when the answer is partially correct.

Scoring:
0-2: Completely incorrect or unrelated
3-4: Very poor understanding
5-6: Partially correct
7-8: Good understanding
9-10: Excellent answer

Feedback must be short and helpful, maximum 12 words.

Return ONLY valid JSON in this exact format:
{"score":7,"feedback":"Correct answer with some missing details."}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        temperature: 0,
        maxOutputTokens: 256,
        responseMimeType: "application/json",
      },
    });

    const result = parseEvaluation(response);

    // Do not save a fake score if Gemini evaluation fails
    if (!result) {
      throw new Error("Gemini returned an invalid evaluation.");
    }

    console.log("Final Evaluation:", result);

    console.log(
      "Answer Evaluation Time:",
      ((Date.now() - startTime) / 1000).toFixed(2),
      "seconds",
    );

    return result;
  } catch (error) {
    console.error("Gemini Answer Evaluation Error:", error.message);

    console.log(
      "Failed Evaluation Time:",
      ((Date.now() - startTime) / 1000).toFixed(2),
      "seconds",
    );

    throw error;
  }
};

module.exports = { evaluateAnswer };
