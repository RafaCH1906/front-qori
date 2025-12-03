import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useTheme } from '@/context/theme-context';
import { useToast } from '@/context/toast-context';
import { uploadProfilePhoto, deleteProfilePhoto } from '@/lib/api/upload';
import { spacing, fontSize, fontWeight, borderRadius, ThemeColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthProvider';

interface ProfilePhotoSelectorProps {
  onPhotoUploaded: (url: string) => void;
}

export default function ProfilePhotoSelector({ onPhotoUploaded }: ProfilePhotoSelectorProps) {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { user, refreshUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  // Solicitar permisos
  const requestPermissions = async () => {
    console.log('[ProfilePhotoSelector] Requesting permissions, platform:', Platform.OS);
    
    if (Platform.OS !== 'web') {
      // Permiso para cámara
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraPermission.status !== 'granted') {
        Alert.alert(
          'Permiso Requerido',
          'Necesitamos acceso a la cámara para tomar fotos.',
          [{ text: 'OK' }]
        );
        return false;
      }

      // Permiso para galería
      const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaLibraryPermission.status !== 'granted') {
        Alert.alert(
          'Permiso Requerido',
          'Necesitamos acceso a tu galería para seleccionar fotos.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    console.log('[ProfilePhotoSelector] Permissions granted');
    return true;
  };

  // Validar imagen
  const validateImage = (uri: string, fileSize?: number, mimeType?: string): boolean => {
    console.log('[ProfilePhotoSelector] Validating image:', { uri, fileSize, mimeType, platform: Platform.OS });
    
    // En web, los blobs no tienen extensión, validamos por mimeType
    if (Platform.OS === 'web') {
      // Para blobs, confiar en el mimeType si está disponible
      if (mimeType) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(mimeType)) {
          console.log('[ProfilePhotoSelector] Invalid mime type:', mimeType);
          showToast('Solo se permiten archivos JPG y PNG', 'error');
          return false;
        }
      }
    } else {
      // En mobile, validar por extensión
      const validExtensions = ['.jpg', '.jpeg', '.png'];
      const hasValidExtension = validExtensions.some(ext => 
        uri.toLowerCase().endsWith(ext)
      );

      if (!hasValidExtension) {
        showToast('Solo se permiten archivos JPG y PNG', 'error');
        return false;
      }
    }

    // Validar tamaño (5MB máximo)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB en bytes
    if (fileSize && fileSize > MAX_SIZE) {
      showToast('La imagen es muy grande. Tamaño máximo: 5MB', 'error');
      return false;
    }

    return true;
  };

  // Procesar y comprimir imagen
  // Nota: La edición (crop/rotate) ya se hace con allowsEditing: true en launchCameraAsync/launchImageLibraryAsync
  // Esta función solo comprime la imagen antes de subirla
  const processImage = async (uri: string) => {
    try {
      if (Platform.OS === 'web') {
        // En web, retornar la URI directamente
        return uri;
      }

      // En mobile, comprimir la imagen para optimizar la subida
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [], // Sin manipulaciones adicionales, solo compresión
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      return result.uri;
    } catch (error) {
      console.error('[ProfilePhotoSelector] Processing error:', error);
      return uri; // Si falla, usar la URI original
    }
  };

  // Subir imagen al servidor
  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);
      showToast('Subiendo foto...', 'info');

      // Procesar y comprimir imagen antes de subir
      const processedUri = await processImage(uri);

      // Determinar nombre y tipo
      const fileName = processedUri.split('/').pop() || 'photo.jpg';
      const mimeType = fileName.toLowerCase().endsWith('.png')
        ? 'image/png'
        : 'image/jpeg';

      console.log('[ProfilePhotoSelector] Uploading:', { uri: processedUri, fileName, mimeType });

      // Subir al servidor
      const response = await uploadProfilePhoto(processedUri, fileName, mimeType);

      console.log('[ProfilePhotoSelector] Upload successful:', response);

      // Notificar al componente padre
      onPhotoUploaded(response.url);

      showToast('Foto de perfil actualizada exitosamente', 'success');
    } catch (error: any) {
      console.error('[ProfilePhotoSelector] Upload error:', error);
      showToast(error.message || 'Error al subir la foto', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Tomar foto con cámara
  const takePhoto = async () => {
    console.log('[ProfilePhotoSelector] takePhoto called');
    
    // En web, usar getUserMedia para acceder a la cámara
    if (Platform.OS === 'web') {
      console.log('[ProfilePhotoSelector] Using web camera');
      
      try {
        // Solicitar permiso de cámara
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' }, 
          audio: false 
        });
        
        console.log('[ProfilePhotoSelector] Camera permission granted');
        
        // Crear elementos para capturar la foto
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        video.srcObject = stream;
        video.autoplay = true;
        
        // Crear modal para mostrar la cámara
        const modal = document.createElement('div');
        modal.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        `;
        
        video.style.cssText = `
          max-width: 90%;
          max-height: 70vh;
          border-radius: 8px;
          transform: scaleX(-1);
        `;
        
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = `
          display: flex;
          gap: 16px;
          margin-top: 20px;
        `;
        
        const captureButton = document.createElement('button');
        captureButton.textContent = 'Capturar Foto';
        captureButton.style.cssText = `
          padding: 12px 24px;
          background: #FDB81E;
          color: #1E293B;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        `;
        
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancelar';
        cancelButton.style.cssText = `
          padding: 12px 24px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        `;
        
        buttonsContainer.appendChild(captureButton);
        buttonsContainer.appendChild(cancelButton);
        modal.appendChild(video);
        modal.appendChild(buttonsContainer);
        document.body.appendChild(modal);
        
        // Función para cerrar y limpiar
        const cleanup = () => {
          stream.getTracks().forEach(track => track.stop());
          document.body.removeChild(modal);
        };
        
        // Capturar foto
        captureButton.onclick = async () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');

          // Voltear horizontalmente para efecto espejo
          if (ctx) {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0);
          }

          canvas.toBlob(async (blob) => {
            if (!blob) {
              showToast('Error al capturar la foto', 'error');
              cleanup();
              return;
            }

            console.log('[ProfilePhotoSelector] Photo captured:', {
              size: blob.size,
              type: blob.type,
            });

            // Validar
            if (!validateImage(URL.createObjectURL(blob), blob.size, blob.type)) {
              cleanup();
              return;
            }

            cleanup();

            // Subir imagen directamente sin editor
            const blobUrl = URL.createObjectURL(blob);
            await uploadImage(blobUrl);
          }, 'image/jpeg', 0.8);
        };
        
        // Cancelar
        cancelButton.onclick = () => {
          cleanup();
        };
        
      } catch (error: any) {
        console.error('[ProfilePhotoSelector] Camera error:', error);
        if (error.name === 'NotAllowedError') {
          showToast('Permiso de cámara denegado', 'error');
        } else if (error.name === 'NotFoundError') {
          showToast('No se encontró ninguna cámara', 'error');
        } else {
          showToast('Error al acceder a la cámara', 'error');
        }
      }
      return;
    }
    
    // Mobile: usar expo-image-picker
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, // Muestra editor nativo para recortar/mover la imagen
        aspect: [1, 1], // Proporción cuadrada 1:1 para fotos de perfil
        quality: 0.8,
        cameraType: ImagePicker.CameraType.front, // Usar cámara frontal con efecto espejo
      });

      console.log('[ProfilePhotoSelector] Camera result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        if (!validateImage(asset.uri, asset.fileSize, asset.mimeType)) {
          return;
        }

        await uploadImage(asset.uri);
      }
    } catch (error) {
      console.error('[ProfilePhotoSelector] Camera error:', error);
      showToast('Error al tomar la foto', 'error');
    }
  };

  // Seleccionar de galería
  const pickFromGallery = async () => {
    console.log('[ProfilePhotoSelector] pickFromGallery called');

    // En web, usar input file HTML directamente
    if (Platform.OS === 'web') {
      console.log('[ProfilePhotoSelector] Using web file input');
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/jpg,image/png';

      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) {
          console.log('[ProfilePhotoSelector] No file selected');
          return;
        }

        console.log('[ProfilePhotoSelector] File selected:', {
          name: file.name,
          size: file.size,
          type: file.type,
        });

        // Validar
        if (!validateImage(URL.createObjectURL(file), file.size, file.type)) {
          return;
        }

        // Subir imagen directamente sin editor
        const blobUrl = URL.createObjectURL(file);
        await uploadImage(blobUrl);
      };

      input.click();
      return;
    }
    
    // Mobile: usar expo-image-picker
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.log('[ProfilePhotoSelector] Permission denied');
      return;
    }

    try {
      console.log('[ProfilePhotoSelector] Launching image library...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, // Muestra editor nativo para recortar/mover la imagen después de seleccionarla
        aspect: [1, 1], // Proporción cuadrada 1:1 para fotos de perfil
        quality: 0.8,
      });

      console.log('[ProfilePhotoSelector] Gallery result:', JSON.stringify(result, null, 2));

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        if (!validateImage(asset.uri, asset.fileSize, asset.mimeType)) {
          return;
        }

        await uploadImage(asset.uri);
      }
    } catch (error) {
      console.error('[ProfilePhotoSelector] Gallery error:', error);
      showToast('Error al seleccionar la foto', 'error');
    }
  };

  // Eliminar foto actual
  const deletePhoto = async () => {
    if (!user?.profilePhotoUrl) {
      showToast('No hay foto de perfil para eliminar', 'info');
      return;
    }

    Alert.alert(
      'Eliminar Foto de Perfil',
      '¿Estás seguro de que deseas eliminar tu foto de perfil actual?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setUploading(true);
              showToast('Eliminando foto...', 'info');

              // Llamar al backend para eliminar la foto
              await deleteProfilePhoto();

              // Refrescar los datos del usuario desde el servidor
              await refreshUser();

              // Actualizar el estado local para volver a la foto por defecto
              onPhotoUploaded('');
              showToast('Foto de perfil eliminada exitosamente', 'success');
            } catch (error: any) {
              console.error('[ProfilePhotoSelector] Delete error:', error);
              showToast(error.message || 'Error al eliminar la foto', 'error');
            } finally {
              setUploading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Mostrar opciones
  const showOptions = () => {
    Alert.alert(
      'Foto de Perfil',
      'Elige una opción',
      [
        {
          text: 'Tomar Foto',
          onPress: takePhoto,
        },
        {
          text: 'Elegir de Galería',
          onPress: pickFromGallery,
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  if (uploading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card.DEFAULT }]}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        <Text style={[styles.uploadingText, { color: colors.muted.foreground }]}>
          Subiendo foto...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card.DEFAULT }]}>
      <Text style={[styles.title, { color: colors.foreground }]}>
        Foto de Perfil
      </Text>
      
      <View style={[styles.buttonsContainer, isDesktop && styles.buttonsContainerDesktop]}>
        <TouchableOpacity
          style={[styles.button, isDesktop && styles.buttonDesktop, { backgroundColor: colors.primary.DEFAULT }]}
          onPress={takePhoto}
          disabled={uploading}
        >
          <Ionicons name="camera" size={isDesktop ? 28 : 24} color={colors.primary.foreground} />
          <Text style={[styles.buttonText, isDesktop && styles.buttonTextDesktop, { color: colors.primary.foreground }]}>
            Tomar Foto
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isDesktop && styles.buttonDesktop, { backgroundColor: colors.accent.DEFAULT }]}
          onPress={pickFromGallery}
          disabled={uploading}
        >
          <Ionicons name="images" size={isDesktop ? 28 : 24} color={colors.accent.foreground} />
          <Text style={[styles.buttonText, isDesktop && styles.buttonTextDesktop, { color: colors.accent.foreground }]}>
            Elegir de Galería
          </Text>
        </TouchableOpacity>
      </View>

      {/* Botón de eliminar foto (solo si hay foto actual y no es web) */}
      {user?.profilePhotoUrl && Platform.OS !== 'web' && (
        <TouchableOpacity
          style={[styles.deleteButton, isDesktop && styles.deleteButtonDesktop, { backgroundColor: colors.destructive.DEFAULT }]}
          onPress={deletePhoto}
          disabled={uploading}
        >
          <Ionicons name="trash-outline" size={isDesktop ? 24 : 20} color={colors.destructive.foreground} />
          <Text style={[styles.deleteButtonText, isDesktop && styles.deleteButtonTextDesktop, { color: colors.destructive.foreground }]}>
            Eliminar Foto Actual
          </Text>
        </TouchableOpacity>
      )}

      <Text style={[styles.hint, { color: colors.muted.foreground }]}>
        Solo archivos JPG o PNG • Máximo 5MB
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  buttonsContainerDesktop: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  buttonDesktop: {
    padding: spacing.lg,
    minHeight: 60,
  },
  buttonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  buttonTextDesktop: {
    fontSize: fontSize.base,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  deleteButtonDesktop: {
    padding: spacing.md,
    minHeight: 50,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  deleteButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  deleteButtonTextDesktop: {
    fontSize: fontSize.base,
  },
  hint: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  uploadingText: {
    fontSize: fontSize.base,
    marginTop: spacing.sm,
  },
});
