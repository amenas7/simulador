import { Injectable, signal } from '@angular/core';
import { Question, UserAnswer, ExamResult } from '../models/exam.model';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private questions = signal<Question[]>([]);
  private currentQuestionIndex = signal<number>(0);
  private userAnswers = signal<UserAnswer[]>([]);
  private examFinished = signal<boolean>(false);

  getQuestions = this.questions.asReadonly();
  getCurrentQuestionIndex = this.currentQuestionIndex.asReadonly();
  getUserAnswers = this.userAnswers.asReadonly();
  isExamFinished = this.examFinished.asReadonly();

  loadQuestions(questionsData: Question[]): void {
    this.questions.set(questionsData);
    this.currentQuestionIndex.set(0);
    this.userAnswers.set([]);
    this.examFinished.set(false);
  }

  getCurrentQuestion(): Question | null {
    const questions = this.questions();
    const index = this.currentQuestionIndex();
    return questions.length > 0 && index < questions.length ? questions[index] : null;
  }

  submitAnswer(selectedAnswer: string | string[]): boolean {
    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion) return false;

    const isMultipleChoice = Array.isArray(currentQuestion.respuestaCorrecta);
    let isCorrect = false;

    if (isMultipleChoice && Array.isArray(selectedAnswer)) {
      // Comparar arrays: deben tener los mismos elementos
      const correctAnswers = (currentQuestion.respuestaCorrecta as string[]).sort();
      const userAnswers = selectedAnswer.sort();
      isCorrect = correctAnswers.length === userAnswers.length &&
                  correctAnswers.every((ans, index) => ans === userAnswers[index]);
    } else if (!isMultipleChoice && typeof selectedAnswer === 'string') {
      // Comparar strings
      isCorrect = selectedAnswer === currentQuestion.respuestaCorrecta;
    }
    
    const userAnswer: UserAnswer = {
      questionNumber: currentQuestion.numeroPregunta,
      questionText: currentQuestion.pregunta,
      alternatives: currentQuestion.alternativas,
      selectedAnswer,
      isCorrect,
      correctAnswer: currentQuestion.respuestaCorrecta,
      isMultipleChoice
    };

    this.userAnswers.update(answers => [...answers, userAnswer]);
    return isCorrect;
  }

  nextQuestion(): void {
    const questions = this.questions();
    const currentIndex = this.currentQuestionIndex();
    
    if (currentIndex < questions.length - 1) {
      this.currentQuestionIndex.update(index => index + 1);
    } else {
      this.examFinished.set(true);
    }
  }

  getExamResult(): ExamResult {
    const answers = this.userAnswers();
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const totalQuestions = this.questions().length;
    const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers,
      percentage: Math.round(percentage * 100) / 100,
      details: answers
    };
  }

  resetExam(): void {
    this.currentQuestionIndex.set(0);
    this.userAnswers.set([]);
    this.examFinished.set(false);
  }

  clearExam(): void {
    this.questions.set([]);
    this.currentQuestionIndex.set(0);
    this.userAnswers.set([]);
    this.examFinished.set(false);
  }

  hasQuestions(): boolean {
    return this.questions().length > 0;
  }
}

