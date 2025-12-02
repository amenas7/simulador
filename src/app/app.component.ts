import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamService } from './services/exam.service';
import { UploadComponent } from './components/upload/upload.component';
import { QuestionComponent } from './components/question/question.component';
import { ResultComponent } from './components/result/result.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, UploadComponent, QuestionComponent, ResultComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private examService = inject(ExamService);
  
  hasQuestions = computed(() => this.examService.hasQuestions());
  isExamFinished = this.examService.isExamFinished;
}
