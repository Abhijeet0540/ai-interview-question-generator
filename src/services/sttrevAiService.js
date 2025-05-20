import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';
import revai from 'revai-node-sdk';

dotenv.config();

const REV_API_KEY = process.env.REV_API_KEY;

// Standard file-based transcription
export const transcribeAudio = async (audioBuffer, mimeType = 'audio/webm') => {
  try {
    console.log(`Transcribing audio using Rev AI (${mimeType}, length: ${audioBuffer.length})`);
    console.log(`Audio buffer size (bytes): ${audioBuffer.length}`);
    

    const tempFilePath = path.join(os.tmpdir(), `audio-${uuidv4()}.webm`);
    fs.writeFileSync(tempFilePath, audioBuffer);

    const client = new revai.RevAiApiClient(REV_API_KEY);
    const job = await client.submitJobLocalFile(tempFilePath, {
      metadata: "Interview question response",
      skip_diarization: false,
      skip_punctuation: false,
      remove_disfluencies: true,
      filter_profanity: false,
      speaker_channels_count: 1,
      language: "en"
    });

    console.log(`Rev AI job submitted with ID: ${job.id}`);

    let transcriptData = null;
    for (let attempts = 0; attempts < 30; attempts++) {
      const jobDetails = await client.getJobDetails(job.id);

      if (jobDetails.status === 'transcribed') {
        transcriptData = await client.getTranscriptObject(job.id);
        break;
      } else if (jobDetails.status === 'failed') {
        throw new Error(`Rev AI transcription failed: ${jobDetails.failure_detail}`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    fs.unlinkSync(tempFilePath);

    if (!transcriptData) throw new Error('Transcription timed out');

    const transcript = transcriptData.monologues
      .flatMap(monologue => monologue.elements)
      .map(e => e.value)
      .join(' ')
      .trim()
      .replace(/\s+/g, ' ');

    if (!transcript) throw new Error('No transcript returned');

    return transcript;

  } catch (error) {
    console.error('Rev AI transcription error:', error.message || error);

    if (error.response) {
      console.error('Response:', error.response.data, error.response.status);
    }

    return "I couldn't transcribe the audio. Please try again with clearer audio.";
  }
};
