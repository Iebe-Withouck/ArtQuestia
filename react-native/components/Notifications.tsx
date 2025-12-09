import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import NextIcon from '../assets/icons/next_yellow.png';
import Delete from "../assets/icons/delete.png";

const { width, height } = Dimensions.get('window');

const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

interface NotificationsProps {
  onClose: () => void;
}

interface Notification {
  id: number;
  title: string;
  description: string;
}

export default function Notifications({ onClose }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'Nieuwe prestatie behaald!',
      description: 'Je hebt de "Eerste Stap" prestatie verdiend door je eerste artwork te scannen.',
    },
    {
      id: 2,
      title: 'Thema route voltooid',
      description: 'Gefeliciteerd! Je hebt alle artworks in de "Oorlog" thema route gevonden.',
    },
    {
      id: 3,
      title: 'Nieuw artwork in de buurt',
      description: 'Er is een nieuw artwork toegevoegd binnen 500 meter van jouw locatie.',
    },
  ]);

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity style={styles.infoButton} onPress={onClose}>
        <Image source={NextIcon} style={styles.infoIcon} />
      </TouchableOpacity>

      <ThemedText style={styles.title}>Notificaties</ThemedText>

      <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
        {notifications.map((notification) => (
          <View key={notification.id} style={styles.notificationCard}>
            <View style={styles.notificationContent}>
              <ThemedText style={styles.notificationTitle}>{notification.title}</ThemedText>
              <ThemedText style={styles.notificationDescription}>{notification.description}</ThemedText>
            </View>
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => handleDelete(notification.id)}
            >
              <Image source={Delete} style={styles.deleteIcon} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: verticalScale(100),
  },
  infoButton: {
    position: 'absolute',
    top: verticalScale(95),
    left: scale(20),
    width: moderateScale(35),
    height: moderateScale(35),
    borderRadius: moderateScale(30),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  infoIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  title: {
    fontSize: moderateScale(28),
    fontFamily: 'Impact',
    color: '#fff',
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: scale(20),
    marginTop: verticalScale(20),
  },
  notificationCard: {
    backgroundColor: '#292929',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationContent: {
    flex: 1,
    paddingRight: scale(10),
  },
  notificationTitle: {
    fontSize: moderateScale(16),
    fontFamily: 'LeagueSpartan-Bold',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: verticalScale(6),
  },
  notificationDescription: {
    fontSize: moderateScale(14),
    fontFamily: 'LeagueSpartan-Regular',
    fontWeight: 'regular',
    color: '#fff',
    lineHeight: moderateScale(18),
  },
  deleteButton: {
    width: moderateScale(30),
    height: moderateScale(30),
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    width: moderateScale(30),
    height: moderateScale(30),
    resizeMode: 'contain',
  },
});
