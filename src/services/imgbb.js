const IMGBB_API_KEY = '568b683a11e73bdd458c72bc9be43364'

/**
 * Uploads an image file to ImgBB and returns the direct image URL.
 * @param {File} file The image file to upload
 * @returns {Promise<string>} The direct URL of the uploaded image
 */
export async function uploadImageToImgBB(file) {
  if (!file) throw new Error('No file provided')

  const formData = new FormData()
  formData.append('image', file)

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`)
    }

    const data = await response.json()
    if (data.success) {
      return data.data.url // This is the direct image URL
    } else {
      throw new Error(data.error?.message || 'Unknown error from ImgBB')
    }
  } catch (error) {
    console.error('Error uploading image to ImgBB:', error)
    throw error
  }
}
