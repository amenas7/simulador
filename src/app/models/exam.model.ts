export interface Question {
  numeroPregunta: number;
  pregunta: string;
  alternativas: Alternative[];
  respuestaCorrecta: string;
}

export interface Alternative {
  id: string;
  texto: string;
}

export interface UserAnswer {
  questionNumber: number;
  questionText: string;
  alternatives: Alternative[];
  selectedAnswer: string;
  isCorrect: boolean;
  correctAnswer: string;
}

export interface ExamResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  percentage: number;
  details: UserAnswer[];
}

