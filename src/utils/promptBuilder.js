export default function buildPrompt(skillsets, experience) {
  return `
Generate exactly 6 diverse interview questions for a candidate with the following profile:

- Skillset: ${skillsets}
- Experience: ${experience} years
- Tone: Formal and industry-ready.
- Focus: Problem-solving, Communication, Confidence, and Time Management.

Format the output in JSON with this schema:
{
  "total": 6,
  "questions": [
    {
      "id": <number>,              // Sequential ID from 1 to 6
      "question": "<string>",      // The question text
      "category": "<string>",      // Category (e.g., JavaScript, Time Management)
      "type": "<string>"           // One of: "Technical", "Scenario-Based", "Soft Skill"
    }
  ]
}

Distribution of questions:
- 3 Technical Questions:
  - Cover core concepts, tools, and best practices based on the skillset.
- 2 Scenario-Based Questions:
  - Real-world decision-making, troubleshooting, and practical challenges.
- 1 Soft Skill Question:
  - Choose one from: Time Management, Communication, or Confidence.

Ensure all questions are relevant, non-repetitive, and appropriate for the candidate's experience level.
`;
}
