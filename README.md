# Interview Question Generator

A powerful API service that generates tailored interview questions based on skillsets and experience levels.

## Description

This project provides a RESTful API that leverages large language models to create relevant and challenging interview questions for technical interviews. Simply provide the required skillsets and experience level, and the service will generate a comprehensive set of questions suitable for your interview process.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- API keys for the LLM service

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

### Running the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm run build
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
  "total": 10,
  "questions": {
    "interview_questions": [
      {
        "question": "Explain the concept of closures in JavaScript and provide a practical example.",
        "expected_answer": "A closure is...",
        "difficulty": "medium"
      },
      // More questions...
    ]
  }
}
```

## Project Structure

```
├── src/
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── routes/           # API routes
│   ├── models/           # Data models
│   └── utils/            # Helper functions
├── .env.example          # Example environment variables
├── .gitignore            # Git ignore file
└── package.json          # Project dependencies
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to the LLM providers for their powerful APIs
- Inspired by the need for better technical interview preparation


