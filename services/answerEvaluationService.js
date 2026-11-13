const evaluateAnswer = async (question, answer, category, difficulty) => {
  try {
    if (!answer || !answer.trim()) {
      return {
        score: 0,
        feedback: "Please provide an answer to evaluate.",
      };
    }

    const cleanAnswer = answer.toLowerCase().trim();
    const cleanQuestion = question.toLowerCase();

    const words = cleanAnswer.split(/\s+/).filter(Boolean);

    const wordCount = words.length;

    // Extract important keywords from question
    const stopWords = [
      "what",
      "why",
      "how",
      "when",
      "where",
      "which",
      "who",
      "explain",
      "describe",
      "tell",
      "about",
      "your",
      "you",
      "the",
      "and",
      "for",
      "with",
      "from",
      "this",
      "that",
      "are",
      "was",
      "were",
      "have",
      "has",
      "does",
      "did",
      "can",
      "could",
      "would",
      "should",
      "into",
      "used",
    ];

    const questionKeywords = cleanQuestion
      .replace(/[^a-z0-9+#.]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.includes(word));

    const uniqueKeywords = [...new Set(questionKeywords)];

    // Check keyword matching
    const matchedKeywords = uniqueKeywords.filter((keyword) =>
      cleanAnswer.includes(keyword),
    );

    const keywordScore = uniqueKeywords.length
      ? (matchedKeywords.length / uniqueKeywords.length) * 4
      : 0;

    // Answer length score
    let lengthScore = 0;

    if (wordCount >= 10) lengthScore = 1;
    if (wordCount >= 30) lengthScore = 2;
    if (wordCount >= 60) lengthScore = 3;

    // Structure score
    let structureScore = 0;

    if (wordCount >= 15) structureScore += 0.5;

    if (
      cleanAnswer.includes("because") ||
      cleanAnswer.includes("therefore") ||
      cleanAnswer.includes("for example") ||
      cleanAnswer.includes("such as")
    ) {
      structureScore += 1;
    }

    if (
      cleanAnswer.includes("example") ||
      cleanAnswer.includes("project") ||
      cleanAnswer.includes("implementation")
    ) {
      structureScore += 0.5;
    }

    // Basic relevance check
    const relevanceScore = matchedKeywords.length > 0 ? 1 : 0;

    let score = keywordScore + lengthScore + structureScore + relevanceScore;

    score = Math.min(10, Math.max(0, Math.round(score)));

    // Generate feedback
    let feedback = "";

    if (wordCount < 10) {
      feedback =
        "Your answer is too short. Explain the concept in more detail and provide a practical example.";
    } else if (matchedKeywords.length === 0) {
      feedback =
        "Your answer may not directly address the question. Focus on the main topic and explain relevant concepts.";
    } else if (score >= 8) {
      feedback =
        "Good answer! You covered relevant keywords and provided a reasonable explanation. Try adding more practical examples to make it even stronger.";
    } else if (score >= 5) {
      feedback =
        "Your answer covers some relevant points. Improve it by explaining the concepts more clearly and including practical examples.";
    } else {
      feedback =
        "Your answer needs improvement. Focus on the key concepts mentioned in the question and explain them step by step.";
    }

    if (category === "HR") {
      feedback +=
        " For HR questions, include personal experiences and specific examples.";
    }

    if (difficulty === "Hard" && score < 8) {
      feedback +=
        " Since this is a difficult question, include deeper technical details.";
    }

    return {
      score,
      feedback,
    };
  } catch (error) {
    console.error("Answer Evaluation Error:", error.message);

    return {
      score: 0,
      feedback: "Unable to evaluate this answer. Please try again.",
    };
  }
};

module.exports = {
  evaluateAnswer,
};
