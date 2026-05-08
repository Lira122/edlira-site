import axios from 'axios'
import FormData from 'form-data'

/**
 * Transcreve áudio usando Groq Whisper
 * Aceita base64 ou URL do áudio
 */
export async function transcribeAudio({ base64, url }) {
  try {
    let audioBuffer

    if (base64) {
      audioBuffer = Buffer.from(base64, 'base64')
    } else if (url) {
      const response = await axios.get(url, { responseType: 'arraybuffer' })
      audioBuffer = Buffer.from(response.data)
    } else {
      throw new Error('Nenhuma fonte de áudio fornecida')
    }

    const form = new FormData()
    form.append('file', audioBuffer, {
      filename: 'audio.ogg',
      contentType: 'audio/ogg'
    })
    form.append('model', 'whisper-large-v3')
    form.append('language', 'pt')
    form.append('response_format', 'json')

    const res = await axios.post(
      'https://api.groq.com/openai/v1/audio/transcriptions',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        }
      }
    )

    const transcript = res.data?.text?.trim()
    console.log('[Groq] Transcrição:', transcript)
    return transcript || null

  } catch (err) {
    console.error('[Groq] Erro na transcrição:', err.response?.data || err.message)
    return null
  }
}
