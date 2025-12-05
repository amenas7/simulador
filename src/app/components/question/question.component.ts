import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamService } from '../../services/exam.service';
import { Question } from '../../models/exam.model';

@Component({
  selector: 'app-question',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './question.component.html',
  styleUrl: './question.component.scss'
})
export class QuestionComponent implements OnInit {
  private examService = inject(ExamService);
  
  currentQuestion = signal<Question | null>(null);
  selectedAnswers = signal<string[]>([]);
  answered = signal<boolean>(false);
  isCorrect = signal<boolean>(false);
  showFeedback = signal<boolean>(false);

  ngOnInit(): void {
    this.loadCurrentQuestion();
  }

  loadCurrentQuestion(): void {
    this.currentQuestion.set(this.examService.getCurrentQuestion());
    this.selectedAnswers.set([]);
    this.answered.set(false);
    this.showFeedback.set(false);
  }

  isMultipleChoice(): boolean {
    const question = this.currentQuestion();
    return question ? Array.isArray(question.respuestaCorrecta) : false;
  }

  isSelected(alternativeId: string): boolean {
    return this.selectedAnswers().includes(alternativeId);
  }

  selectAnswer(alternativeId: string): void {
    if (this.answered()) return;

    if (this.isMultipleChoice()) {
      // Selección múltiple: toggle
      this.selectedAnswers.update(selected => {
        if (selected.includes(alternativeId)) {
          return selected.filter(id => id !== alternativeId);
        } else {
          return [...selected, alternativeId];
        }
      });
    } else {
      // Selección única: reemplazar
      this.selectedAnswers.set([alternativeId]);
    }
  }

  submitAnswer(): void {
    const selected = this.selectedAnswers();
    if (selected.length === 0 || this.answered()) return;

    const answer = this.isMultipleChoice() ? selected : selected[0];
    const correct = this.examService.submitAnswer(answer);
    this.isCorrect.set(correct);
    this.answered.set(true);
    this.showFeedback.set(true);
  }

  nextQuestion(): void {
    this.examService.nextQuestion();
    this.loadCurrentQuestion();
  }

  getProgress(): string {
    const total = this.examService.getQuestions().length;
    const current = this.examService.getCurrentQuestionIndex() + 1;
    return `${current} / ${total}`;
  }

  goToHome(): void {
    if (confirm('¿Estás seguro de que quieres salir? Se perderá el progreso actual.')) {
      this.examService.clearExam();
    }
  }

  getCorrectAnswersText(): string {
    const question = this.currentQuestion();
    if (!question) return '';
    
    const correctAnswer = question.respuestaCorrecta;
    if (Array.isArray(correctAnswer)) {
      return correctAnswer.sort().join(', ');
    }
    return correctAnswer;
  }

  isAlternativeCorrect(altId: string): boolean {
    const question = this.currentQuestion();
    if (!question || !this.answered()) return false;

    const correctAnswer = question.respuestaCorrecta;
    if (Array.isArray(correctAnswer)) {
      return correctAnswer.includes(altId);
    }
    return altId === correctAnswer;
  }

  isAlternativeIncorrect(altId: string): boolean {
    if (!this.answered()) return false;
    return this.isSelected(altId) && !this.isAlternativeCorrect(altId);
  }
}

