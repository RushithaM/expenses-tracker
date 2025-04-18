import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiAssistantService } from '../../services/ai-assistant.service';

interface ChatMessage {
  content: string;
  isUser: boolean;
  timestamp: Date;
}
@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-assistant.component.html',
  styleUrls: ['./ai-assistant.component.css']
})

export class AiAssistantComponent {
  messages: ChatMessage[] = [];
  userInput: string = '';
  isLoading: boolean = false;
  isChatOpen: boolean = false;

  constructor(private aiService: AiAssistantService) {
    this.messages = [{
      content: 'Hello! I\'m your AI financial assistant. How can I help you with your expenses today?',
      isUser: false,
      timestamp: new Date()
    }];
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
  }

  sendMessage(): void {
    if (!this.userInput.trim()) return;

    const userMessage = this.userInput;
    this.messages.push({
      content: userMessage,
      isUser: true,
      timestamp: new Date()
    });

    this.userInput = '';
    this.isLoading = true;

    this.aiService.generateResponse(userMessage).subscribe({
      next: (response) => {
        this.messages.push({
          content: response,
          isUser: false,
          timestamp: new Date()
        });
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error:', error);
        this.isLoading = false;
      }
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }, 100);
  }
}