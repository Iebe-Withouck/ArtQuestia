import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  confirmText?: string;
}

export default function CustomAlert({
  visible,
  title,
  message,
  type = 'info',
  onClose,
  confirmText = 'OK',
}: CustomAlertProps) {
  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return '#1AF7A2';
      case 'error':
        return '#ff4444';
      default:
        return '#FF7700';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.alertContainer}>
              <View style={[styles.titleBar, { backgroundColor: getTypeColor() }]} />
              
              <View style={styles.contentContainer}>
                <Text style={styles.title}>{title}</Text>
                
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: getTypeColor() }]}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>{confirmText}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: moderateScale(15),
    width: width * 0.85,
    maxWidth: scale(400),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  titleBar: {
    height: verticalScale(4),
    width: '100%',
  },
  contentContainer: {
    padding: scale(20),
  },
  title: {
    fontSize: moderateScale(22),
    fontFamily: 'Impact',
    color: '#fff',
    marginBottom: verticalScale(12),
    textAlign: 'center',
  },
  button: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(30),
    borderRadius: moderateScale(25),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontFamily: 'Impact',
    fontWeight: 'bold',
  },
});
