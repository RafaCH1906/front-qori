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
import { uploadProfilePhoto } from '@/lib/api/upload';
import { spacing, fontSize, fontWeight, borderRadius, ThemeColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthProvider';

interface ProfilePhotoSelectorProps {
  onPhotoUploaded: (url: string) => void;
}

export default function ProfilePhotoSelector({ onPhotoUploaded }: ProfilePhotoSelectorProps) {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { user } = useAuth();
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

            // Abrir editor de imagen antes de subir
            try {
              const blobUrl = URL.createObjectURL(blob);
              const editedUrl = await openWebImageEditor(blobUrl);
              await uploadImage(editedUrl);
            } catch (error: any) {
              if (error.message !== 'Edición cancelada') {
                console.error('[ProfilePhotoSelector] Editor error:', error);
                showToast('Error al editar la imagen', 'error');
              }
            }
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

  // Editor de imagen para web
  const openWebImageEditor = (imageUrl: string) => {
    return new Promise<string>((resolve, reject) => {
      // Crear modal para el editor
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
      `;

      // Crear canvas y contexto
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      // Variables para el editor
      let scale = 1;
      let offsetX = 0;
      let offsetY = 0;
      let isDragging = false;
      let startX = 0;
      let startY = 0;

      // Configurar canvas
      canvas.width = 400;
      canvas.height = 400;
      canvas.style.cssText = `
        border: 2px solid #FDB81E;
        border-radius: 8px;
        cursor: move;
        max-width: 90vw;
        max-height: 60vh;
      `;

      const drawImage = () => {
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);

        const imgAspect = img.width / img.height;
        const canvasAspect = canvas.width / canvas.height;
        let drawWidth, drawHeight, drawX, drawY;

        if (imgAspect > canvasAspect) {
          drawHeight = canvas.height / scale;
          drawWidth = drawHeight * imgAspect;
          drawX = (canvas.width / scale - drawWidth) / 2;
          drawY = 0;
        } else {
          drawWidth = canvas.width / scale;
          drawHeight = drawWidth / imgAspect;
          drawX = 0;
          drawY = (canvas.height / scale - drawHeight) / 2;
        }

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
      };

      img.onload = () => {
        drawImage();
      };
      img.src = imageUrl;

      // Controles
      const controlsContainer = document.createElement('div');
      controlsContainer.style.cssText = `
        margin-top: 20px;
        display: flex;
        flex-direction: column;
        gap: 15px;
        align-items: center;
      `;

      // Slider de zoom
      const zoomContainer = document.createElement('div');
      zoomContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
      `;

      const zoomLabel = document.createElement('span');
      zoomLabel.textContent = 'Zoom:';
      zoomLabel.style.cssText = 'color: white; font-size: 14px; min-width: 50px;';

      const zoomSlider = document.createElement('input');
      zoomSlider.type = 'range';
      zoomSlider.min = '1';
      zoomSlider.max = '3';
      zoomSlider.step = '0.1';
      zoomSlider.value = '1';
      zoomSlider.style.cssText = 'width: 200px;';

      zoomSlider.oninput = (e: any) => {
        scale = parseFloat(e.target.value);
        drawImage();
      };

      zoomContainer.appendChild(zoomLabel);
      zoomContainer.appendChild(zoomSlider);

      // Botones
      const buttonsContainer = document.createElement('div');
      buttonsContainer.style.cssText = `
        display: flex;
        gap: 15px;
      `;

      const saveButton = document.createElement('button');
      saveButton.textContent = 'Guardar';
      saveButton.style.cssText = `
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

      // Event listeners para arrastrar
      canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - offsetX;
        startY = e.clientY - offsetY;
      });

      canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
          offsetX = e.clientX - startX;
          offsetY = e.clientY - startY;
          drawImage();
        }
      });

      canvas.addEventListener('mouseup', () => {
        isDragging = false;
      });

      canvas.addEventListener('mouseleave', () => {
        isDragging = false;
      });

      // Touch events para móvil
      canvas.addEventListener('touchstart', (e) => {
        isDragging = true;
        const touch = e.touches[0];
        startX = touch.clientX - offsetX;
        startY = touch.clientY - offsetY;
      });

      canvas.addEventListener('touchmove', (e) => {
        if (isDragging) {
          const touch = e.touches[0];
          offsetX = touch.clientX - startX;
          offsetY = touch.clientY - startY;
          drawImage();
        }
      });

      canvas.addEventListener('touchend', () => {
        isDragging = false;
      });

      saveButton.onclick = () => {
        canvas.toBlob((blob) => {
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            document.body.removeChild(modal);
            resolve(blobUrl);
          } else {
            document.body.removeChild(modal);
            reject(new Error('Error al procesar la imagen'));
          }
        }, 'image/jpeg', 0.9);
      };

      cancelButton.onclick = () => {
        document.body.removeChild(modal);
        reject(new Error('Edición cancelada'));
      };

      // Instrucciones
      const instructions = document.createElement('div');
      instructions.style.cssText = `
        color: white;
        text-align: center;
        margin-bottom: 15px;
        font-size: 14px;
      `;
      instructions.textContent = 'Arrastra para mover • Usa el slider para hacer zoom';

      buttonsContainer.appendChild(saveButton);
      buttonsContainer.appendChild(cancelButton);
      controlsContainer.appendChild(instructions);
      controlsContainer.appendChild(canvas);
      controlsContainer.appendChild(zoomContainer);
      controlsContainer.appendChild(buttonsContainer);
      modal.appendChild(controlsContainer);
      document.body.appendChild(modal);
    });
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

        // Abrir editor de imagen
        try {
          const blobUrl = URL.createObjectURL(file);
          const editedUrl = await openWebImageEditor(blobUrl);
          await uploadImage(editedUrl);
        } catch (error: any) {
          if (error.message !== 'Edición cancelada') {
            console.error('[ProfilePhotoSelector] Editor error:', error);
            showToast('Error al editar la imagen', 'error');
          }
        }
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

  // Eliminar foto actual (solo actualiza localmente, no llama al backend)
  const deletePhoto = () => {
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
          onPress: () => {
            // Solo actualizar el estado local para volver a la foto por defecto
            onPhotoUploaded('');
            showToast('Foto de perfil eliminada', 'success');
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

      {/* Botón de eliminar foto (solo si hay foto actual) */}
      {user?.profilePhotoUrl && (
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
