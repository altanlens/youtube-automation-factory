import axios from 'axios'; // DÜZELTME: 'fs' yerine 'axios' import edildi.
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.ELEVENLABS_API_KEY) {
  console.warn('WARNING: ELEVENLABS_API_KEY is not set in .env file');
}

export class ElevenLabsAPI {
  private apiKey: string;
  private baseUrl: string = 'https://api.elevenlabs.io/v1';

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || '';
  }

  async listVoices() {
    try {
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });
      return response.data.voices;
    } catch (error) {
      console.error('Error listing ElevenLabs voices:', error);
      throw error;
    }
  }

  async generateSpeech(text: string, voiceId: string = '21m00Tcm4TlvDq8ikWAM', outputPath: string) {
    try {
      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/text-to-speech/${voiceId}`,
        data: {
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        },
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        responseType: 'arraybuffer'
      });

      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(outputPath, response.data);
      return {
        success: true,
        path: outputPath,
        duration: null
      };
    } catch (error) {
      console.error('Error generating speech with ElevenLabs:', error);
      throw error;
    }
  }
}

export default new ElevenLabsAPI();
