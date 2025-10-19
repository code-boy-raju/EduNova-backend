const axios = require("axios");
const { quizModel } = require("../models/quizModel.js");
const { lessonModel } = require("../models/lessonModel.js");
require("dotenv").config();

/**
 * Generate quiz questions using Google Gemini 2.5 Flash API
 */
const generateQuizFromText = async (text, apiKey, numQuestions = 5) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

  const prompt = `
Create ${numQuestions} multiple-choice quiz questions (each with 4 options and 1 correct answer)
based strictly on the following lesson content:

${text}

Respond ONLY with a valid JSON array of this structure:
[
  { "question": "string", "choices": ["option1", "option2", "option3", "option4"], "answerIndex": number }
]
  `;

  try {
    const res = await axios.post(
      url,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
      }
    );

    // ✅ Extract the model's generated text
    const content = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) throw new Error("Empty response from Gemini API");

    // ✅ Extract JSON array from response text
    const jsonStart = content.indexOf("[");
    const jsonEnd = content.lastIndexOf("]");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonStr = content.slice(jsonStart, jsonEnd + 1);
      return JSON.parse(jsonStr);
    }

    throw new Error("Invalid JSON structure in AI response");
  } catch (err) {
    console.error("❌ AI generation failed:", err.response?.data || err.message);

    // Return fallback structure — used to detect failed response later
    return [
      {
        question: "AI generation failed to produce questions. Please try again later.",
        choices: ["OK"],
        answerIndex: 0,
      },
    ];
  }
};

/**
 * Controller: Generate quiz for a lesson
 */
const generateQuiz = async (req, res) => {
  try {
    const { courseId, lessonId, numQuestions } = req.body;

    const lesson = await lessonModel.findById(lessonId);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    // Use lesson content, description, or title as quiz source
    const sourceText = lesson.content || lesson.description || lesson.title;
    if (!sourceText)
      return res.status(400).json({ message: "Lesson content missing" });

    const questions = await generateQuizFromText(
      sourceText,
      process.env.GOOGLE_GEN_API_KEY,
      numQuestions || 5
    );

    // ✅ Validation: Don't save if AI failed to generate questions
    const isFailedResponse =
      questions.length === 1 &&
      questions[0].question.includes("AI generation failed");

    if (isFailedResponse) {
      return res.status(400).json({
        success: false,
        message:
          "AI failed to generate quiz questions. Please try again later.",
      });
    }

    // ✅ Save valid quiz
    const quiz = new quizModel({
      course: courseId,
      lesson: lessonId,
      generatedBy: "AI",
      questions,
    });

    await quiz.save();
    res.json({ success: true, quiz });
  } catch (err) {
    console.error("❌ Quiz generation error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Controller: Get quiz by ID
 */
const getQuiz = async (req, res) => {
  try {
    const quiz = await quizModel.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: "Error fetching quiz" });
  }
};

module.exports = { generateQuiz, getQuiz };
