# Interview Question Generator

A powerful API service that generates tailored interview questions based on skillsets and experience levels, with speech-to-text capabilities for interactive interviews.

## Description

This project provides a RESTful API that leverages Google's Gemini AI to create relevant and challenging interview questions for technical interviews. It includes:

- Question generation based on skillsets and experience level
- Speech-to-text processing for verbal answers
- AI-powered evaluation of candidate responses
- Text-to-speech for reading questions aloud
- Session management for tracking interview progress

## Features

- **AI-Generated Questions**: Create tailored questions based on specific skills and experience levels
- **Voice Interaction**: Record and transcribe verbal answers
- **Automated Evaluation**: Get AI feedback on answer quality with scoring
- **Interactive UI**: Web interface for conducting mock interviews
- **Session Management**: Track and review interview performance

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database
- API keys for:
  - Google Gemini AI
  - Text-to-speech service (Google or ElevenLabs)
  - Speech recognition service

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/interview-question-generator.git
   cd interview-question-generator
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file and add your API keys and configuration.

4. Initialize the database
   ```bash
   npm run init-db
   ```

### Running the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

## API Usage

### Generate Interview Questions

**Endpoint:** `POST /api/questions`

**Request Body:**
```json
{
  "skilsets": ["JavaScript", "React", "Node.js"],
  "experience": "senior"
}
```

**Response:**
```json
{
  "total": 6,
  "questions": {
    "questions": [
      {
        "id": 1,
        "question": "Explain the concept of closures in JavaScript and provide a practical example.",
        "category": "JavaScript",
        "type": "Technical"
      },
      // More questions...
    ]
  }
}
```

### Process User Speech/Answer

**Endpoint:** `POST /api/questions/speech/:questionId`

**Request Body:**
```json
{
  "audio": "base64-encoded-audio-data",
  // OR
  "transcript": "Typed answer text if not using audio",
  "sessionId": "unique-session-identifier"
}
```

**Response:**
```json
{
  "transcript": "User's transcribed answer",
  "evaluation": {
    "isCorrect": true,
    "score": 90,
    "feedback": "Detailed feedback on the answer",
    "correctPoints": ["Point 1", "Point 2"],
    "missingPoints": ["Missing point 1"]
  }
}
```

### Generate Audio for Questions

**Endpoint:** `POST /api/questions/audio`

**Request Body:**
```json
{
  "text": "Question text to convert to speech"
}
```

**Response:** Audio file or base64-encoded audio data

### Get Session Results

**Endpoint:** `GET /api/questions/results/:sessionId`

**Response:**
```json
{
  "sessionId": "session-id",
  "totalQuestions": 6,
  "averageScore": 85,
  "results": [
    {
      "question": "Question text",
      "userAnswer": "User's answer",
      "isCorrect": true,
      "score": 90,
      "feedback": "Feedback on the answer"
    },
    // More results...
  ]
}
```

## Project Structure

```
├── src/
│   ├── controllers/      # Request handlers
│   │   ├── questionController.js  # Question generation
│   │   ├── audioController.js     # Audio processing
│   │   └── dataController.js      # Data retrieval
│   ├── services/         # Business logic
│   │   ├── llmService.js          # AI integration
│   │   ├── evaluationService.js   # Answer evaluation
│   │   └── dbService.js           # Database operations
│   ├── routes/           # API routes
│   │   ├── questionRoutes.js      # Question endpoints
│   │   └── dataRoutes.js          # Data endpoints
│   ├── utils/            # Helper functions
│   │   ├── promptBuilder.js       # AI prompt construction
│   │   └── promptEvaluation.js    # Evaluation prompts
│   ├── config/           # Configuration
│   │   └── db.postgres.config.js  # Database config
│   └── app.js            # Express application
├── views/                # EJS templates
│   └── questions.ejs     # Interview UI
├── server.js             # Application entry point
├── .env.example          # Example environment variables
├── .gitignore            # Git ignore file
└── package.json          # Project dependencies
```

## Deployment

### Deploying to Render.com

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the service:
   - Build Command: Not required for Node.js apps
   - Start Command: `npm start`
4. Add environment variables in the Render dashboard
5. Deploy the service

### Using with a React Frontend

To use this API with a React frontend:

1. Make API requests to your deployed endpoint:
   ```javascript
   const response = await fetch('https://your-render-app.onrender.com/api/questions', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ skilsets: skillsets, experience })
   });
   ```

2. Handle responses and errors appropriately
3. Implement UI for recording audio and displaying results

## Technologies Used

- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **AI Services**: 
  - Google Gemini AI for question generation and evaluation
  - Text-to-speech for reading questions
  - Speech-to-text for processing answers
- **Frontend**: EJS templates (included), or connect to your own React frontend

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini AI for powering the question generation and evaluation
- Text-to-speech and speech-to-text services for enabling voice interaction
- Inspired by the need for better technical interview preparation


