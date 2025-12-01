import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/context/theme-context';
import { useToast } from '@/context/toast-context';
import { uploadProfilePhoto } from '@/lib/api/upload';
import { spacing, fontSize, fontWeight, borderRadius, ThemeColors } from '@/constants/theme';

interface ProfilePhotoSelectorProps {
  onPhotoUploaded: (url: string) => void;
}

export default function ProfilePhotoSelector({ onPhotoUploaded }: ProfilePhotoSelectorProps) {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);

  // Solicitar permisos
  const requestPermissions = async () => {
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
    return true;
  };

  // Validar imagen
  const validateImage = (uri: string, fileSize?: number): boolean => {
    // Validar extensión
    const validExtensions = ['.jpg', '.jpeg', '.png'];
    const hasValidExtension = validExtensions.some(ext => 
      uri.toLowerCase().endsWith(ext)
    );

    if (!hasValidExtension) {
      showToast('Solo se permiten archivos JPG y PNG', 'error');
      return false;
    }

    // Validar tamaño (5MB máximo)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB en bytes
    if (fileSize && fileSize > MAX_SIZE) {
      showToast('La imagen es muy grande. Tamaño máximo: 5MB', 'error');
      return false;
    }

    return true;
  };

  // Subir imagen al servidor
  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);
      showToast('Subiendo foto...', 'info');

      // Determinar nombre y tipo
      const fileName = uri.split('/').pop() || 'photo.jpg';
      const mimeType = fileName.toLowerCase().endsWith('.png') 
        ? 'image/png' 
        : 'image/jpeg';

      console.log('[ProfilePhotoSelector] Uploading:', { uri, fileName, mimeType });

      // Subir al servidor
      const response = await uploadProfilePhoto(uri, fileName, mimeType);

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
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('[ProfilePhotoSelector] Camera result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        if (!validateImage(asset.uri, asset.fileSize)) {
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
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('[ProfilePhotoSelector] Gallery result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        if (!validateImage(asset.uri, asset.fileSize)) {
          return;
        }

        await uploadImage(asset.uri);
      }
    } catch (error) {
      console.error('[ProfilePhotoSelector] Gallery error:', error);
      showToast('Error al seleccionar la foto', 'error');
    }
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
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary.DEFAULT }]}
          onPress={takePhoto}
          disabled={uploading}
        >
          <Ionicons name="camera" size={24} color={colors.primary.foreground} />
          <Text style={[styles.buttonText, { color: colors.primary.foreground }]}>
            Tomar Foto
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent.DEFAULT }]}
          onPress={pickFromGallery}
          disabled={uploading}
        >
          <Ionicons name="images" size={24} color={colors.accent.foreground} />
          <Text style={[styles.buttonText, { color: colors.accent.foreground }]}>
            Elegir de Galería
          </Text>
        </TouchableOpacity>
      </View>

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
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  buttonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
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
