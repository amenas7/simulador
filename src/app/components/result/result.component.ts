import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamService } from '../../services/exam.service';
import { ExamResult } from '../../models/exam.model';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result.component.html',
  styleUrl: './result.component.scss'
})
export class ResultComponent implements OnInit {
  private examService = inject(ExamService);
  
  result = signal<ExamResult | null>(null);

  ngOnInit(): void {
    this.result.set(this.examService.getExamResult());
  }

  restartExam(): void {
    this.examService.resetExam();
  }

  goToHome(): void {
    this.examService.clearExam();
  }

  getStatusClass(): string {
    const percentage = this.result()?.percentage || 0;
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'regular';
    return 'poor';
  }

  getStatusMessage(): string {
    const percentage = this.result()?.percentage || 0;
    if (percentage >= 80) return 'Excelente';
    if (percentage >= 60) return 'Bien';
    if (percentage >= 40) return 'Regular';
    return 'Necesitas mejorar';
  }

  isAlternativeCorrect(altId: string, correctAnswer: string | string[]): boolean {
    if (Array.isArray(correctAnswer)) {
      return correctAnswer.includes(altId);
    }
    return altId === correctAnswer;
  }

  isAlternativeSelected(altId: string, selectedAnswer: string | string[]): boolean {
    if (Array.isArray(selectedAnswer)) {
      return selectedAnswer.includes(altId);
    }
    return altId === selectedAnswer;
  }

  isAlternativeWrong(altId: string, selectedAnswer: string | string[], correctAnswer: string | string[]): boolean {
    return this.isAlternativeSelected(altId, selectedAnswer) && !this.isAlternativeCorrect(altId, correctAnswer);
  }
}

