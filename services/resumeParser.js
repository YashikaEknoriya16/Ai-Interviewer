const fs = require("fs");
const pdf = require("pdf-parse");

const extractResumeText = async (filePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);

    const data = await pdf(fileBuffer);

    if (!data.text || !data.text.trim()) {
      throw new Error("No readable text found in PDF");
    }

    return data.text;
  } catch (error) {
    throw new Error("Resume text extraction failed: " + error.message);
  }
};

module.exports = extractResumeText;
