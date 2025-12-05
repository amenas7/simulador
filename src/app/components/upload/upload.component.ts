import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamService } from '../../services/exam.service';
import { Question } from '../../models/exam.model';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss'
})
export class UploadComponent {
  private examService = inject(ExamService);
  
  errorMessage = signal<string | null>(null);
  fileName = signal<string | null>(null);
  isDragging = signal<boolean>(false);
  loadingExam = signal<number | null>(null);

  predefinedExams = [
    { id: 1, name: 'Examen 1', file: '1.json' },
    { id: 2, name: 'Examen 2', file: '2.json' },
    { id: 3, name: 'Examen 3', file: '3.json' },
    { id: 4, name: 'Examen 4', file: '4.json' }
  ];

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.processFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validar que sea un archivo JSON
    if (!file.name.endsWith('.json')) {
      this.errorMessage.set('Por favor, selecciona un archivo JSON válido');
      return;
    }

    this.processFile(file);
  }

  private processFile(file: File): void {
    this.fileName.set(file.name);
    this.errorMessage.set(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const questions = JSON.parse(content) as Question[];
        
        // Validación básica
        if (!Array.isArray(questions) || questions.length === 0) {
          throw new Error('El archivo JSON debe contener un array de preguntas');
        }

        // Validar estructura de cada pregunta
        questions.forEach((q, index) => {
          if (!q.numeroPregunta || !q.pregunta || !q.alternativas || !q.respuestaCorrecta) {
            throw new Error(`La pregunta ${index + 1} tiene una estructura inválida`);
          }
        });

        this.examService.loadQuestions(questions);
      } catch (error) {
        this.errorMessage.set(`Error al cargar el archivo: ${error instanceof Error ? error.message : 'formato inválido'}`);
        this.fileName.set(null);
      }
    };

    reader.onerror = () => {
      this.errorMessage.set('Error al leer el archivo');
      this.fileName.set(null);
    };

    reader.readAsText(file);
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput?.click();
  }

  async loadPredefinedExam(examId: number, fileName: string): Promise<void> {
    this.loadingExam.set(examId);
    this.errorMessage.set(null);
    this.fileName.set(fileName);

    try {
      const response = await fetch(`preguntas/${fileName}`);
      
      if (!response.ok) {
        throw new Error(`No se pudo cargar el archivo ${fileName}`);
      }

      const questions = await response.json() as Question[];

      // Validación básica
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('El archivo JSON debe contener un array de preguntas');
      }

      // Validar estructura de cada pregunta
      questions.forEach((q, index) => {
        if (!q.numeroPregunta || !q.pregunta || !q.alternativas || !q.respuestaCorrecta) {
          throw new Error(`La pregunta ${index + 1} tiene una estructura inválida`);
        }
      });

      this.examService.loadQuestions(questions);
    } catch (error) {
      this.errorMessage.set(`Error al cargar el examen: ${error instanceof Error ? error.message : 'archivo no encontrado'}`);
      this.fileName.set(null);
    } finally {
      this.loadingExam.set(null);
    }
  }
}

