import api from './axios';

export interface FileUploadResponse {
  url: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  message: string;
}

export const uploadProfilePhoto = async (
  uri: string,
  fileName: string = 'photo.jpg',
  mimeType: string = 'image/jpeg'
): Promise<FileUploadResponse> => {
  try {
    const formData = new FormData();
    
    formData.append('file', {
      uri,
      name: fileName,
      type: mimeType,
    } as any);

    console.log('[Upload API] Uploading photo:', { uri, fileName, mimeType });

    const response = await api.post<FileUploadResponse>(
      '/user/upload-photo',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      }
    );

    console.log('[Upload API] Photo uploaded successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[Upload API] Error uploading photo:', error.response?.data || error.message);
    
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    
    throw new Error('Error al subir la foto. Por favor, intenta nuevamente.');
  }
};

export const deleteProfilePhoto = async (): Promise<{ message: string }> => {
  try {
    const response = await api.delete('/user/delete-photo');
    console.log('[Upload API] Photo deleted successfully');
    return response.data;
  } catch (error: any) {
    console.error('[Upload API] Error deleting photo:', error.response?.data || error.message);
    throw new Error('Error al eliminar la foto');
  }
};
