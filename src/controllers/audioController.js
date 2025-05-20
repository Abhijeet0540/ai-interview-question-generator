import {convertTextToAudioCoqui , cleanElevenLabsInput } from '../services/ttsCoquiService.js';
import { transcribeAudio } from '../services/sttrevAiService.js';
import { saveUserAnswer } from '../services/dbService.js';
import { evaluateAnswer } from '../services/evaluationService.js';
// import { generateSpeechFromExternalApi } from '../services/ttsService.js';


export const generateAudio = async (req, res) => {
    const { text, language, emotion, slow } = req.body;
    try {
        const cleanedText = cleanElevenLabsInput(text);

        // Pass additional parameters to the TTS API if provided
        const audioBuffer = await convertTextToAudioCoqui(
            cleanedText,
            language || 'en',
            emotion || 'neutral',
            slow || false
        );

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length
        });

        res.send(audioBuffer);
    } catch (error) {
        console.error('Error generating audio:', error.message);
        res.status(500).json({ error: 'Failed to generate audio' });
    }
};



export const processUserSpeech = async (req, res) => {
    const { questionId } = req.params;
    const { audio, transcript, sessionId, mimeType, usedBrowserRecognition, useStreaming } = req.body;

    console.log(`Question ID: ${questionId}`);
    console.log(`Session ID: ${sessionId}`);
    console.log(`Transcript provided: ${!!transcript}`);
    if (audio) console.log(`Audio length (base64): ${audio.length}`);
    console.log(`MIME type: ${mimeType}`);
    console.log(`Used browser recognition: ${usedBrowserRecognition}`);
    console.log(`Use streaming: ${useStreaming}`);

    try {
        let finalTranscript = '';

        // If transcript is directly provided (manual input), use it
        if (transcript) {
            console.log(`Using provided transcript: ${transcript}`);
            finalTranscript = transcript;
        } else if (audio) {
            try {
                const finalMimeType = mimeType || 'audio/webm';
                const audioBuffer = Buffer.from(audio, 'base64');
                console.log(`Audio buffer size (bytes): ${audioBuffer.length}`);

                // Use streaming or standard transcription based on request
                try {
                    if (useStreaming) {
                        finalTranscript = await transcribeAudioStream(audioBuffer, finalMimeType);
                        console.log(`Rev AI streaming transcript: ${finalTranscript}`);
                    } else {
                        finalTranscript = await transcribeAudio(audioBuffer, finalMimeType);
                        console.log(`Rev AI transcript: ${finalTranscript}`);
                    }
                } catch (revAiError) {
                    console.error('Rev AI transcription error:', revAiError);
                    console.log('Falling back to Deepgram transcription service...');

                    // Try Deepgram as fallback
                    try {
                        finalTranscript = await deepgramTranscribe(audioBuffer, finalMimeType);
                        console.log(`Deepgram fallback transcript: ${finalTranscript}`);
                    } catch (deepgramError) {
                        console.error('Deepgram fallback error:', deepgramError);
                        throw new Error('All transcription services failed');
                    }
                }
            } catch (transcriptionError) {
                console.error('Transcription error:', transcriptionError);
                finalTranscript = "I couldn't transcribe the audio. Please try again with clearer audio or type your answer manually.";
            }
        } else {
            return res.status(400).json({ error: 'Either audio data or transcript is required' });
        }

        let evaluation;
        try {
            evaluation = await evaluateAnswer(questionId, finalTranscript);
            console.log(`Evaluation:`, evaluation);
        } catch (evaluationError) {
            console.error('Evaluation error:', evaluationError);
            evaluation = {
                isCorrect: false,
                score: 0,
                feedback: "Evaluation failed. Please try again."
            };
        }

        try {
            await saveUserAnswer(
                questionId,
                finalTranscript,
                evaluation.isCorrect,
                sessionId,
                evaluation.score,
                evaluation.feedback
            );
            console.log(`Answer saved successfully`);
        } catch (dbError) {
            console.error('Database error while saving answer:', dbError);
        }

        res.status(200).json({
            transcript: finalTranscript,
            evaluation
        });
    } catch (error) {
        console.error('Unhandled error during speech processing:', error);
        res.status(500).json({
            error: 'Unexpected error during processing',
            transcript: "I couldn't process your speech.",
            evaluation: {
                isCorrect: false,
                score: 0,
                feedback: "Unexpected technical error occurred."
            }
        });
    }
};
