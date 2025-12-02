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
  selectedAnswer = signal<string | null>(null);
  answered = signal<boolean>(false);
  isCorrect = signal<boolean>(false);
  showFeedback = signal<boolean>(false);

  ngOnInit(): void {
    this.loadCurrentQuestion();
  }

  loadCurrentQuestion(): void {
    this.currentQuestion.set(this.examService.getCurrentQuestion());
    this.selectedAnswer.set(null);
    this.answered.set(false);
    this.showFeedback.set(false);
  }

  selectAnswer(alternativeId: string): void {
    if (!this.answered()) {
      this.selectedAnswer.set(alternativeId);
    }
  }

  submitAnswer(): void {
    const selected = this.selectedAnswer();
    if (!selected || this.answered()) return;

    const correct = this.examService.submitAnswer(selected);
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
}

