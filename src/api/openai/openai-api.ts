import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  console.warn('WARNING: OPENAI_API_KEY is not set in .env file');
}

export class OpenAIAPI {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateScript(topic: string, outline: string[], tone: string = 'informative', maxWords: number = 500): Promise<string> {
    try {
      const outlineText = outline.map(item => `- ${item}`).join('\n');
      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a professional YouTube script writer. Your task is to create engaging scripts with a ${tone} tone. The script should be clear, concise, and optimized for video content.`
          },
          {
            role: 'user',
            content: `Write a script for a YouTube video about "${topic}".
            Here's the outline:
            ${outlineText}

            Keep it under ${maxWords} words. Make it engaging and easy to follow when narrated.`
          }
        ],
        max_tokens: 1500
      });
      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Error generating script with OpenAI:', error);
      throw error;
    }
  }

  async generateOutline(topic: string, pointCount: number = 5): Promise<string[]> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a content strategy expert. Generate clear, educational outlines for YouTube videos.'
          },
          {
            role: 'user',
            content: `Create a ${pointCount}-point outline for a YouTube video about "${topic}". Make each point concise but descriptive.`
          }
        ],
        max_tokens: 500
      });
      const content = response.choices[0].message.content || '';
      const points = content
        .split('\n')
        .filter(line => line.trim().match(/^\d+\.\s+/))
        .map(line => line.replace(/^\d+\.\s+/, '').trim());
      return points;
    } catch (error) {
      console.error('Error generating outline with OpenAI:', error);
      throw error;
    }
  }
}

export default new OpenAIAPI();
