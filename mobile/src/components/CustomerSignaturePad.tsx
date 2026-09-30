import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  GestureResponderEvent,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';
import { PenTool, Trash2, Check, Camera, Image as ImageIcon } from 'lucide-react-native';

interface CustomerSignaturePadProps {
  onSignatureCaptured?: (signatureData: string) => void;
  onPhotoCaptured?: () => void;
}

export function CustomerSignaturePad({
  onSignatureCaptured,
  onPhotoCaptured,
}: CustomerSignaturePadProps) {
  const { t } = useSettingsStore();
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isSigned, setIsSigned] = useState(false);
  const [photoSnapped, setPhotoSnapped] = useState(false);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt: GestureResponderEvent) => {
      const { locationX, locationY } = evt.nativeEvent;
      setCurrentPath(`M ${locationX} ${locationY}`);
    },
    onPanResponderMove: (evt: GestureResponderEvent) => {
      const { locationX, locationY } = evt.nativeEvent;
      setCurrentPath((prev) => `${prev} L ${locationX} ${locationY}`);
    },
    onPanResponderRelease: () => {
      if (currentPath) {
        setPaths((prev) => [...prev, currentPath]);
        setCurrentPath('');
        setIsSigned(true);
        if (onSignatureCaptured) onSignatureCaptured('signature_svg_captured');
      }
    },
  });

  const clearSignature = () => {
    setPaths([]);
    setCurrentPath('');
    setIsSigned(false);
  };

  const handleSimulatePhoto = () => {
    setPhotoSnapped(true);
    if (onPhotoCaptured) onPhotoCaptured();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <PenTool size={16} color="#00E5FF" />
          <Text style={styles.title}>{t.customerSignaturePad}</Text>
        </View>
        {paths.length > 0 && (
          <TouchableOpacity onPress={clearSignature} style={styles.clearBtn}>
            <Trash2 size={14} color="#EF4444" />
            <Text style={styles.clearText}>{t.clearSign}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Signature Canvas */}
      <View style={styles.canvasWrapper} {...panResponder.panHandlers}>
        <Svg style={styles.svgCanvas}>
          {paths.map((p, index) => (
            <Path
              key={index}
              d={p}
              stroke="#FFFFFF"
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {currentPath !== '' && (
            <Path
              d={currentPath}
              stroke="#00E5FF"
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </Svg>

        {paths.length === 0 && currentPath === '' && (
          <View style={styles.placeholder} pointerEvents="none">
            <Text style={styles.placeholderText}>✍️ وقع هنا بإصبعك للتأكيد</Text>
            <Text style={styles.placeholderSub}>Digital Signature Pad</Text>
          </View>
        )}

        <View style={styles.signatureBaseline} pointerEvents="none" />
      </View>

      {/* Proof of Delivery Photo Simulator */}
      <View style={styles.photoSection}>
        <TouchableOpacity
          style={[styles.photoButton, photoSnapped && styles.photoButtonSuccess]}
          onPress={handleSimulatePhoto}
          activeOpacity={0.8}
        >
          {photoSnapped ? (
            <>
              <Check size={16} color="#00E676" />
              <Text style={styles.photoSuccessText}>{t.podPhotoCaptured}</Text>
            </>
          ) : (
            <>
              <Camera size={16} color="#FFFFFF" />
              <Text style={styles.photoButtonText}>التقاط صورة لإثبات التسليم (POD)</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121622',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#1E2638',
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  clearText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
  },
  canvasWrapper: {
    height: 130,
    backgroundColor: '#090C14',
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#1E2638',
    position: 'relative',
    overflow: 'hidden',
  },
  svgCanvas: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 35,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  placeholderSub: {
    fontSize: 10,
    color: '#4B5563',
    marginTop: 4,
  },
  signatureBaseline: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    borderStyle: 'dashed',
  },
  photoSection: {
    marginTop: SPACING.sm,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E2638',
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  photoButtonSuccess: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderColor: '#00E676',
  },
  photoButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  photoSuccessText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00E676',
  },
});
