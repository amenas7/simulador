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
}

