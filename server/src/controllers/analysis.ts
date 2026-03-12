import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { model } from '../lib/gemini.js';

export const analyzeMeeting = async (req: AuthRequest, res: Response) => {
  const { roomId, transcript } = req.body;

  try {
    const prompt = `
      Analyze the following lecture transcript and provide:
      1. A concise summary.
      2. Key concepts discussed.
      3. Important questions asked by students or teacher.
      4. Action items (e.g., assignments, deadlines).
      5. Revision notes for students.
      6. 5 Flashcards (front/back).

      Transcript:
      ${transcript}

      Return JSON: { "summary": "string", "concepts": ["string"], "questions": ["string"], "actionItems": ["string"], "revisionNotes": "string", "flashcards": [{"front": "string", "back": "string"}] }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      summary: "Lecture analysis completed.",
      concepts: [],
      questions: [],
      actionItems: [],
      revisionNotes: "No notes generated.",
      flashcards: []
    };

    res.json(analysis);
  } catch (error) {
    console.error('AI Analysis Error:', error);
    res.status(500).json({ message: 'AI Analysis failed' });
  }
};

