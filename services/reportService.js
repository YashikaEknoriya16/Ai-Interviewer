const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "v1beta",
  },
});

const generateFinalReport = async (interview, averageScore) => {
  const answers = interview.questions.map((item, index) => ({
    questionNumber: index + 1,
    question: item.question,
    category: item.category,
    answer: item.answer,
    score: item.score,
    feedback: item.feedback,
  }));

  const prompt = `
You are an expert interview evaluator.

Analyze the candidate's complete interview performance.

Average Score: ${averageScore}/10

Interview Answers:
${JSON.stringify(answers, null, 2)}

Generate:
1. Overall interview feedback.
2. Candidate's strengths.
3. Areas that need improvement.
4. Final recommendation.

Return valid JSON only in this format:

{
  "overallFeedback": "Overall performance summary",
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Improvement 1", "Improvement 2"],
  "recommendation": "Final recommendation"
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const result = JSON.parse(response.text);

  if (
    typeof result.overallFeedback !== "string" ||
    !Array.isArray(result.strengths) ||
    !Array.isArray(result.improvements) ||
    typeof result.recommendation !== "string"
  ) {
    throw new Error("Invalid final report response");
  }

  return result;
};

module.exports = { generateFinalReport };
