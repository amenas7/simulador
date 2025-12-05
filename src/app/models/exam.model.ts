export interface Question {
  numeroPregunta: number;
  pregunta: string;
  alternativas: Alternative[];
  respuestaCorrecta: string | string[]; // Soporta selección única o múltiple
}

export interface Alternative {
  id: string;
  texto: string;
}

export interface UserAnswer {
  questionNumber: number;
  questionText: string;
  alternatives: Alternative[];
  selectedAnswer: string | string[]; // Soporta selección única o múltiple
  isCorrect: boolean;
  correctAnswer: string | string[];
  isMultipleChoice: boolean;
}

export interface ExamResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  percentage: number;
  details: UserAnswer[];
}

