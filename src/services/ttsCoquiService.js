// src/services/ttsCoquiService.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export async function convertTextToAudioCoqui(text, language = 'en', emotion = 'neutral', slow = false) {
    // Using the new TTS API from render.com instead of ElevenLabs
    const apiUrl = process.env.TTS_API_URL;

    try {
        console.log(`Generating speech using TTS API: ${apiUrl}`);
        console.log(`Text: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
        console.log(`Parameters: language=${language}, emotion=${emotion}, slow=${slow}`);

        const response = await axios({
            method: 'post',
            url: apiUrl,
            data: {
                text,
                language,
                emotion,
                slow
            },
            responseType: 'arraybuffer'
        });

        console.log('Speech generated successfully from TTS API');
        return response.data;
    } catch (error) {
        console.error('TTS API error:', error.response?.status
            ? `Status: ${error.response.status}, Message: ${error.message}`
            : error.message
        );
        throw new Error(`Failed to generate speech: ${error.message}`);
    }
}


export function cleanElevenLabsInput(text) {
    return text
        .replace(/As an AI.*?\n/, '')
        .replace(/\s+/g, ' ')
        .replace(/^\d+\.\s*/gm, match => match.trim())
        .trim();
}
