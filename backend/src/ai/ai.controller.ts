import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body('message') message: string) {
    if (!message) {
      return { success: false, reply: 'Pesan tidak boleh kosong.' };
    }
    
    const reply = await this.aiService.chatWithKOPI(message);
    return { success: true, reply };
  }
}
