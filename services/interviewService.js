const fallbackQuestions = (resume) => {
  const skills = Array.isArray(resume.skills) ? resume.skills : [];
  const projects = Array.isArray(resume.projects) ? resume.projects : [];

  const questions = [];

  // Technical questions based on resume skills
  const skillQuestions = {
    HTML: [
      "What is the difference between HTML elements and attributes?",
      "What is semantic HTML and why is it important?",
      "How do forms work in HTML?",
      "What are HTML5 features?",
    ],
    CSS: [
      "Explain the CSS box model.",
      "What is the difference between Flexbox and Grid?",
      "What are CSS selectors?",
      "What is the difference between relative and absolute positioning?",
    ],
    JavaScript: [
      "What is the difference between var, let and const?",
      "Explain promises and async/await in JavaScript.",
      "What is the difference between == and ===?",
      "What is event bubbling in JavaScript?",
      "What is the difference between map and forEach?",
    ],
    React: [
      "What are React components and props?",
      "What is the use of useState and useEffect?",
      "What is the Virtual DOM?",
      "What is prop drilling in React?",
      "What is the difference between controlled and uncontrolled components?",
    ],
    "Node.js": [
      "What is Node.js and how does it work?",
      "How do you handle errors in Node.js?",
      "What is the event loop in Node.js?",
      "What is the difference between synchronous and asynchronous operations?",
    ],
    "Express.js": [
      "What is Express.js?",
      "What is middleware in Express.js?",
      "How do you handle routes in Express?",
      "How does error-handling middleware work?",
    ],
    MongoDB: [
      "What is MongoDB and how is it different from SQL?",
      "What are collections and documents in MongoDB?",
      "What is Mongoose?",
      "What is the difference between find and findOne?",
    ],
    MySQL: [
      "What is the difference between primary key and foreign key?",
      "Explain SQL joins.",
      "What is database normalization?",
      "What is the difference between DELETE and TRUNCATE?",
    ],
    Java: [
      "Explain the four pillars of OOP.",
      "What is the difference between an interface and an abstract class?",
      "What is method overloading and overriding?",
      "What is exception handling in Java?",
    ],
    Python: [
      "What are Python lists and tuples?",
      "What is the difference between a list and a dictionary?",
      "What are Python decorators?",
      "What is the difference between == and is?",
    ],
    Git: [
      "What is Git and why is it used?",
      "Explain the difference between git pull and git fetch.",
      "What is a Git branch?",
      "How do you resolve merge conflicts?",
    ],
  };

  // Collect skill-based questions
  skills.forEach((skill) => {
    const matchedSkill = Object.keys(skillQuestions).find(
      (key) => key.toLowerCase() === String(skill).toLowerCase(),
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

  // Additional technical questions
  const defaultTechnical = [
    "What is the difference between frontend and backend development?",
    "What is a REST API?",
    "How do you handle errors in an application?",
    "Explain the importance of database management.",
    "What is authentication and authorization?",
    "How does an API request work?",
    "What is the difference between monolithic and microservices architecture?",
    "How do you debug an application?",
  ];

  defaultTechnical.forEach((question) => {
    questions.push({
      question,
      category: "Technical",
      difficulty: "Easy",
    });
  });

  // Project-based questions
  projects.forEach((project) => {
    const projectName =
      typeof project === "string"
        ? project
        : project.name || project.title || "your project";

    questions.push(
      {
        question: `Explain ${projectName}. What was your contribution?`,
        category: "Project-Based",
        difficulty: "Medium",
      },
      {
        question: `What technologies did you use in ${projectName} and why?`,
        category: "Project-Based",
        difficulty: "Medium",
      },
      {
        question: `What was the biggest challenge in ${projectName}?`,
        category: "Project-Based",
        difficulty: "Medium",
      },
    );
  });

  // HR questions
  const hrQuestions = [
    "Tell me about yourself.",
    "What are your strengths and weaknesses?",
    "Why should we hire you?",
    "Where do you see yourself in five years?",
    "How do you handle pressure and deadlines?",
    "Why do you want to work with our company?",
    "Tell me about a time you worked in a team.",
  ];

  hrQuestions.forEach((question) => {
    questions.push({
      question,
      category: "HR",
      difficulty: "Easy",
    });
  });

  // Remove duplicate questions
  const uniqueQuestions = [
    ...new Map(
      questions.map((item) => [item.question.toLowerCase(), item]),
    ).values(),
  ];

  // Randomize question selection and order
  const shuffledQuestions = [...uniqueQuestions];

  for (let i = shuffledQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffledQuestions[i], shuffledQuestions[j]] = [
      shuffledQuestions[j],
      shuffledQuestions[i],
    ];
  }

  return {
    questions: shuffledQuestions.slice(0, 10),
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

    console.log("10 randomized interview questions generated successfully.");

    return result;
  } catch (error) {
    console.error("Interview question generation failed:", error.message);
    throw error;
  }
};

module.exports = {
  generateInterviewQuestions,
};
