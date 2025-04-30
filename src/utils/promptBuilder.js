export default function buildPrompt(skillsets, experience) {
   return `
 Generate exactly 100 interview questions for a candidate with the following profile:
 
 - Skillset: ${skillsets}
 - Experience: ${experience} years
 
 Structure the questions in JSON format with the following schema:
 {
   "total": 100,
   "questions": [
     {
       "id": <number>,              // Sequential ID from 1 to 100
       "question": "<string>",      // The question text
       "category": "<string>",      // Category of the question (e.g., JavaScript, Node.js, Time Management)
       "type": "<string>"           // One of: "Technical", "Scenario-Based", "Soft Skill"
     },
     ...
   ]
 }
 
 Distribution of questions:
 - 60 Technical Questions:
   - Role-specific, core concepts, tools, and best practices from the given skillset
 - 25 Scenario-Based Questions:
   - Focused on real-world problem-solving, decision-making, and troubleshooting
 - 15 Soft Skill Questions:
   - 5 each on:
     - Time Management
     - Problem-Solving
     - Communication
     - Confidence
 
 Ensure all 100 questions are diverse, non-repetitive, and relevant to the provided skillset and experience.
 `;
}
