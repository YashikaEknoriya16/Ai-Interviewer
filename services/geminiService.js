const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { apiVersion: "v1beta" },
});

// Fallback Resume Analysis
const fallbackResumeAnalysis = (resumeText) => {
  const knownSkills = [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Node.js",
    "Express.js",
    "MongoDB",
    "MySQL",
    "Java",
    "Python",
    "C++",
    "C",
    "Git",
    "GitHub",
    "REST API",
    "JWT",
    "Bootstrap",
    "Tailwind",
    "TypeScript",
    "SQL",
    "Redux",
    "Next.js",
    "AWS",
    "Docker",
    "Linux",
  ];

  const skills = knownSkills.filter((skill) =>
    new RegExp(skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(
      resumeText,
    ),
  );

  const lines = resumeText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const findSection = (keywords) => {
    const index = lines.findIndex((line) =>
      keywords.some((keyword) => line.toLowerCase().includes(keyword)),
    );

    if (index === -1) return "";

    return lines.slice(index + 1, index + 5).join(" ");
  };

  const education = findSection(["education", "academic"]);

  const experience = findSection(["experience", "internship", "work history"]);

  const projectSection = findSection(["projects", "personal projects"]);

  const projects = projectSection
    ? [
        {
          name: "Resume Project",
          description: projectSection,
        },
      ]
    : [];

  const strengths = [];

  if (skills.length) {
    strengths.push(`Technical skills identified: ${skills.join(", ")}`);
  }

  if (education) {
    strengths.push("Education details identified in resume.");
  }

  if (experience) {
    strengths.push("Experience details identified in resume.");
  }

  return {
    skills,
    education,
    experience,
    projects,
    strengths,
  };
};

// Main Resume Analysis Function
const analyzeResume = async (resumeText) => {
  try {
    const prompt = `
Analyze this candidate resume.

Resume:
${resumeText}

Return valid JSON only:
{
  "skills": ["Java", "React"],
  "education": "Education details",
  "experience": "Experience details",
  "projects": [
    {
      "name": "Project name",
      "description": "Project description"
    }
  ],
  "strengths": ["Strength 1", "Strength 2"]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const result = JSON.parse(response.text);

    return {
      skills: Array.isArray(result.skills) ? result.skills : [],

      education: result.education || "",

      experience: result.experience || "",

      projects: Array.isArray(result.projects)
        ? result.projects
            .filter((p) => p && typeof p === "object")
            .map((p) => ({
              name: p.name || "Untitled Project",
              description: p.description || "",
            }))
        : [],

      strengths: Array.isArray(result.strengths) ? result.strengths : [],
    };
  } catch (error) {
    const status = error.status || error.code;
    const message = error.message || "";

    // Gemini quota and temporary server errors
    const shouldUseFallback =
      Number(status) === 429 ||
      Number(status) === 503 ||
      /quota|resource_exhausted|limit exceeded|high demand|unavailable|overloaded/i.test(
        message,
      );

    if (shouldUseFallback) {
      console.log(`Gemini error (${status}). Using fallback resume analysis.`);

      return fallbackResumeAnalysis(resumeText);
    }

    console.error("Resume analysis failed:", message);

    throw error;
  }
};

module.exports = {
  analyzeResume,
};
