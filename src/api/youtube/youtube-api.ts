import { google, youtube_v3 } from 'googleapis';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube'];
const TOKEN_PATH = path.join(process.cwd(), 'config', 'youtube-token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'config', 'youtube-credentials.json');

export class YouTubeAPI {
  private youtube: youtube_v3.Youtube | null = null;
  private auth: any = null;

  async authenticate() {
    try {
      if (process.env.YOUTUBE_API_KEY) {
        this.youtube = google.youtube({
          version: 'v3',
          auth: process.env.YOUTUBE_API_KEY
        });
        return;
      }
      const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
      const { client_secret, client_id, redirect_uris } = credentials.installed;
      const oauth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]
      );
      if (fs.existsSync(TOKEN_PATH)) {
        const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
        oauth2Client.setCredentials(token);
        this.auth = oauth2Client;
        this.youtube = google.youtube({ version: 'v3', auth: oauth2Client });
      } else {
        throw new Error('No YouTube API token found. Please run the authentication script first.');
      }
    } catch (error) {
      console.error('Error authenticating with YouTube API:', error);
      throw error;
    }
  }

  async uploadVideo(videoPath: string, metadata: {
    title: string;
    description: string;
    tags?: string[];
    categoryId?: string;
    privacyStatus?: 'public' | 'private' | 'unlisted';
  }) {
    if (!this.youtube) {
      await this.authenticate();
    }
    try {
      const res = await this.youtube!.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: metadata.title,
            description: metadata.description,
            tags: metadata.tags,
            categoryId: metadata.categoryId || '22'
          },
          status: {
            privacyStatus: metadata.privacyStatus || 'private'
          }
        },
        media: {
          body: fs.createReadStream(videoPath)
        }
      });
      return res.data;
    } catch (error) {
      console.error('Error uploading video to YouTube:', error);
      throw error;
    }
  }

  async setThumbnail(videoId: string, thumbnailPath: string) {
    if (!this.youtube) {
      await this.authenticate();
    }
    try {
      const res = await this.youtube!.thumbnails.set({
        videoId,
        media: {
          body: fs.createReadStream(thumbnailPath)
        }
      });
      return res.data;
    } catch (error) {
      console.error('Error setting thumbnail:', error);
      throw error;
    }
  }
}

export default new YouTubeAPI();
