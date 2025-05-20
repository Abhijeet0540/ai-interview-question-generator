CREATE TABLE IF NOT EXISTS public.interview_questions (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  skillset VARCHAR(255) NOT NULL,
  experience_level VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES public.interview_questions(id),
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  score INTEGER,
  feedback TEXT,
  session_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);