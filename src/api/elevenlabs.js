import axios from 'axios';

const base = 'https://api.elevenlabs.io/v1';
const headers = {
  'Accept': 'audio/mpeg',
  'Content-Type': 'application/json',
  'xi-api-key': 'sk_a36cf48b18267cb52d1a861bda592227e582eec79e608500',
};
const model = 'eleven_flash_v2_5'; // Updated model ID

/**
 * Function to interact with the ElevenLabs Text-to-Speech API.
 * @param {string} text - The text to convert to speech.
 * @param {string} voice - The voice ID to use for the TTS conversion.
 * @returns {Promise<Blob>} - Returns a Blob of the audio data.
 */
export const tts11 = async (text, voice) => {
  try {
    const response = await axios.post(
      `${base}/text-to-speech/${voice}`,
      {
        model_id: model,
        text: text,
        voice_settings: {
          stability: 0.15,
          similarity_boost: 0.75,
        },
      },
      {
        headers: headers,
        responseType: 'arraybuffer',
      }
    );

    return new Blob([response.data], { type: 'audio/mpeg' });
  } catch (error) {
    console.error('Error with ElevenLabs TTS API:', error);
    throw new Error('Failed to fetch TTS audio.');
  }
};
