import { convertTextToAudioCoqui, cleanElevenLabsInput } from '../services/ttsCoquiService.js';
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

                // Use standard transcription (streaming not implemented yet)
                try {
                    finalTranscript = await transcribeAudio(audioBuffer, finalMimeType);
                    console.log(`Rev AI transcript: ${finalTranscript}`);
                } catch (revAiError) {
                    console.error('Rev AI transcription error:', revAiError);
                    throw new Error('Transcription service failed');
                }
            } catch (transcriptionError) {
                console.error('Transcription error:', transcriptionError);
                // Return error response immediately without saving to database
                return res.status(200).json({
                    transcript: "I couldn't transcribe the audio. Please try again with clearer audio.",
                    evaluation: {
                        isCorrect: false,
                        score: 0,
                        feedback: "Audio transcription failed. Please try recording again with clearer audio or type your answer manually."
                    },
                    transcriptionFailed: true // Flag to indicate transcription failure
                });
            }
        } else {
            return res.status(400).json({ error: 'Either audio data or transcript is required' });
        }

        // Check if transcription returned an error message instead of actual transcript
        if (finalTranscript.includes("I couldn't transcribe the audio")) {
            console.log('Transcription service returned error message - not saving to database');
            return res.status(200).json({
                transcript: finalTranscript,
                evaluation: {
                    isCorrect: false,
                    score: 0,
                    feedback: "Audio transcription failed. Please try recording again with clearer audio or type your answer manually."
                },
                transcriptionFailed: true // Flag to indicate transcription failure
            });
        }

        // Only proceed with evaluation and database saving for successful transcriptions
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

        // Save to database only for successful transcriptions
        try {
            await saveUserAnswer(
                questionId,
                finalTranscript,
                evaluation.isCorrect,
                sessionId,
                evaluation.score,
                evaluation.feedback
            );
            console.log(`Answer saved successfully for successful transcription`);
        } catch (dbError) {
            console.error('Database error while saving answer:', dbError);
            return res.status(500).json({
                error: 'Failed to save answer to database',
                transcript: finalTranscript,
                evaluation
            });
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


// 