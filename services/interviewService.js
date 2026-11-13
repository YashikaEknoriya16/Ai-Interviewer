const fallbackQuestions = (resume) => {
  const skills = Array.isArray(resume.skills) ? resume.skills : [];

  const projects = Array.isArray(resume.projects) ? resume.projects : [];

  const questions = [];

  // Technical questions based on resume skills
  const skillQuestions = {
    HTML: [
      "What is the difference between HTML elements and attributes?",
      "What is semantic HTML and why is it important?",
    ],
    CSS: [
      "Explain the CSS box model.",
      "What is the difference between Flexbox and Grid?",
    ],
    JavaScript: [
      "What is the difference between var, let and const?",
      "Explain promises and async/await in JavaScript.",
      "What is the difference between == and ===?",
    ],
    React: [
      "What are React components and props?",
      "What is the use of useState and useEffect?",
      "What is the Virtual DOM?",
    ],
    "Node.js": [
      "What is Node.js and how does it work?",
      "How do you handle errors in Node.js?",
    ],
    "Express.js": ["What is Express.js?", "What is middleware in Express.js?"],
    MongoDB: [
      "What is MongoDB and how is it different from SQL?",
      "What are collections and documents in MongoDB?",
    ],
    MySQL: [
      "What is the difference between primary key and foreign key?",
      "Explain SQL joins.",
    ],
    Java: [
      "Explain the four pillars of OOP.",
      "What is the difference between an interface and an abstract class?",
    ],
    Python: [
      "What are Python lists and tuples?",
      "What is the difference between a list and a dictionary?",
    ],
    Git: [
      "What is Git and why is it used?",
      "Explain the difference between git pull and git fetch.",
    ],
  };

  // Select questions matching candidate skills
  skills.forEach((skill) => {
    const matchedSkill = Object.keys(skillQuestions).find(
      (key) => key.toLowerCase() === skill.toLowerCase(),
    );

    if (matchedSkill) {
      skillQuestions[matchedSkill].forEach((question) => {
        questions.push({
          question,
          category: "Technical",
          difficulty: "Medium",
        });
      });
    }
  });

  // Default technical questions
  const defaultTechnical = [
    "What is the difference between frontend and backend development?",
    "What is a REST API?",
    "How do you handle errors in an application?",
    "Explain the importance of database management.",
  ];

  defaultTechnical.forEach((question) => {
    questions.push({
      question,
      category: "Technical",
      difficulty: "Easy",
    });
  });

  // Project-based questions
  projects.slice(0, 3).forEach((project) => {
    const projectName =
      typeof project === "string"
        ? project
        : project.name || project.title || "your project";

    questions.push({
      question: `Explain ${projectName}. What was your contribution?`,
      category: "Project-Based",
      difficulty: "Medium",
    });
  });

  questions.push(
    {
      question: "What challenges did you face while developing your project?",
      category: "Project-Based",
      difficulty: "Medium",
    },
    {
      question: "How would you improve your project in the future?",
      category: "Project-Based",
      difficulty: "Medium",
    },
    {
      question: "Tell me about yourself.",
      category: "HR",
      difficulty: "Easy",
    },
    {
      question: "What are your strengths and weaknesses?",
      category: "HR",
      difficulty: "Easy",
    },
    {
      question: "Why should we hire you?",
      category: "HR",
      difficulty: "Easy",
    },
  );

  // Remove duplicate questions and return exactly 10
  const uniqueQuestions = [
    ...new Map(
      questions.map((item) => [item.question.toLowerCase(), item]),
    ).values(),
  ];

  return {
    questions: uniqueQuestions.slice(0, 10),
  };
};

// Generate Interview Questions Without External API
const generateInterviewQuestions = async (resume) => {
  try {
    if (!resume) {
      throw new Error("Resume data is required");
    }

    const result = fallbackQuestions(resume);

    if (!Array.isArray(result.questions) || result.questions.length !== 10) {
      throw new Error("Could not generate 10 interview questions");
    }

    console.log("Interview questions generated successfully.");

    return result;
  } catch (error) {
    console.error("Interview question generation failed:", error.message);

    throw error;
  }
};

module.exports = {
  generateInterviewQuestions,
};
