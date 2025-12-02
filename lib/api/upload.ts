import api from './axios';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export interface FileUploadResponse {
  url: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  message: string;
}

export const validateImageFile = (file: { uri: string; type?: string; size?: number }): void => {
  if (!file || !file.uri) {
    throw new Error('No se seleccionó ningún archivo');
  }

  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Tipo de archivo no permitido. Solo se permiten imágenes JPG y PNG');
  }

  if (file.size && file.size > MAX_FILE_SIZE) {
    throw new Error(`El archivo es demasiado grande. Tamaño máximo: ${MAX_FILE_SIZE / (1024 * 1024)} MB`);
  }
};

export const uploadProfilePhoto = async (fileUri: string, fileName: string, fileType: string): Promise<FileUploadResponse> => {
  try {
    console.log('[Upload API] Starting photo upload:', { fileUri, fileName, fileType });

    // Validate file before upload
    validateImageFile({ uri: fileUri, type: fileType });

    const formData = new FormData();
    
    // Handle web vs native differently
    if (typeof window !== 'undefined' && fileUri.startsWith('blob:')) {
      // Web: fetch the blob and append it
      console.log('[Upload API] Web platform detected, fetching blob...');
      const response = await fetch(fileUri);
      const blob = await response.blob();
      formData.append('file', blob, fileName || 'profile-photo.jpg');
    } else {
      // Native: use the uri object format
      // @ts-ignore - FormData in React Native accepts objects with uri, name, type
      formData.append('file', {
        uri: fileUri,
        name: fileName || 'profile-photo.jpg',
        type: fileType || 'image/jpeg',
      });
    }

    console.log('[Upload API] FormData prepared, sending request...');

    const response = await api.post<FileUploadResponse>('/user/upload-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 seconds for file upload
    });

    console.log('[Upload API] Upload successful:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[Upload API] Error uploading photo:', error.response?.data || error.message);
    
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    
    throw new Error('Error al subir la foto. Por favor, intenta de nuevo.');
  }
};

export const deleteProfilePhoto = async (): Promise<void> => {
  try {
    console.log('[Upload API] Deleting profile photo...');
    
    const response = await api.delete('/user/delete-photo');
    
    console.log('[Upload API] Photo deleted successfully:', response.data);
  } catch (error: any) {
    console.error('[Upload API] Error deleting photo:', error.response?.data || error.message);
    
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    
    throw new Error('Error al eliminar la foto');
  }
};
