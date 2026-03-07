// Cloudinary audio upload. Write once, never edit again.
const CLOUD_NAME    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

export async function uploadAudio(audioBlob: Blob, userId: string): Promise<string> {
  const formData = new FormData()
  formData.append('file', audioBlob, 'voice.webm')
  formData.append('upload_preset', UPLOAD_PRESET!)
  formData.append('folder', 'wishpr/voice')
  formData.append('tags', `voice,user_${userId}`)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) throw new Error('Audio upload failed')
  const data = await res.json()
  return data.secure_url as string
}
