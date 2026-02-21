import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform } from 'react-native';
import Tts from 'react-native-tts';
import DeviceInfo from 'react-native-device-info';
import BackgroundService from 'react-native-background-actions';

const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

const backgroundTask = async (taskDataArguments) => {
  const { delay } = taskDataArguments;
  await new Promise(async (resolve) => {
    while (BackgroundService.isRunning()) {
      try {
        const level = await DeviceInfo.getBatteryLevel();
        const charging = await DeviceInfo.isPowerConnected();
        const currentPercentage = Math.round(level * 100);

        if (charging && currentPercentage >= 100) {
          Tts.speak('عُذراً أُستاذ نَذير، البَطَّارِيَّة مُمْتَلِئَة، يُرْجَى فَصْلُ الشَّاحِنِ الآن');
        }
      } catch (e) { console.log(e); }
      await sleep(delay);
    }
  });
};

const options = {
  taskName: 'BatteryRadar',
  taskTitle: 'رادار نذير نشط 🛡️',
  taskDesc: 'حارس البطارية يعمل في الخلفية',
  taskIcon: { name: 'ic_launcher', type: 'mipmap' },
  color: '#0f172a',
  linkingURI: 'chargingmonitorpro://', // ضروري للأندرويد الحديث
  parameters: { delay: 5000 },
};

const App = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [isPlugged, setIsPlugged] = useState(false);

  useEffect(() => {
    Tts.setDefaultLanguage('ar-SA');
    Tts.setDefaultRate(0.4);

    const requestPermission = async () => {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      }
    };
    requestPermission();

    const updateStatus = async () => {
      const level = await DeviceInfo.getBatteryLevel();
      const charging = await DeviceInfo.isPowerConnected();
      setBatteryLevel(Math.round(level * 100));
      setIsPlugged(charging);
      setIsRunning(BackgroundService.isRunning());
    };

    const interval = setInterval(updateStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const toggleService = async () => {
    if (BackgroundService.isRunning()) {
      await BackgroundService.stop();
      setIsRunning(false);
    } else {
      try {
        await BackgroundService.start(backgroundTask, options);
        setIsRunning(true);
      } catch (e) {
        console.log("Error starting service:", e);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>System Radar ⚡</Text>
      <View style={styles.circleContainer}>
        <View style={[styles.circle, isPlugged ? styles.circleActive : styles.circleNormal]}>
          <Text style={styles.circleText}>{batteryLevel >= 0 ? batteryLevel : '--'}%</Text>
          <Text style={styles.circleLabel}>{isPlugged ? 'جاري الشحن 🔌' : 'مفصول 🔋'}</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.button, isRunning ? styles.buttonStop : styles.buttonStart]} onPress={toggleService}>
        <Text style={styles.buttonText}>{isRunning ? 'إيقاف الحارس 🛑' : 'تشغيل الحارس 🚀'}</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.label}>حالة الرادار</Text>
        <Text style={styles.value}>{isRunning ? 'يعمل كشبح في النظام 👻' : 'متوقف حالياً 💤'}</Text>
      </View>

      <View style={styles.developerContainer}>
        <Text style={styles.devName}>👑 نَـذِيــر الأَلـوسِــي 👑</Text>
        <Text style={styles.devEng}>System Administrator</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#f8fafc', marginBottom: 40 },
  circleContainer: { marginBottom: 30 },
  circle: { width: 180, height: 180, borderRadius: 90, borderWidth: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e293b' },
  circleActive: { borderColor: '#10b981' },
  circleNormal: { borderColor: '#64748b' },
  circleText: { fontSize: 50, fontWeight: 'bold', color: '#f8fafc' },
  circleLabel: { fontSize: 16, color: '#94a3b8' },
  button: { paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, marginBottom: 30 },
  buttonStart: { backgroundColor: '#3b82f6' },
  buttonStop: { backgroundColor: '#ef4444' },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  card: { backgroundColor: '#1e293b', padding: 20, borderRadius: 20, width: '100%' },
  label: { color: '#94a3b8', fontSize: 14 },
  value: { color: '#f8fafc', fontSize: 18, fontWeight: 'bold' },
  developerContainer: { marginTop: 'auto', marginBottom: 30, alignItems: 'center' },
  devName: { color: '#fbbf24', fontSize: 24, fontWeight: 'bold' },
  devEng: { color: '#cbd5e1', fontSize: 14, fontStyle: 'italic' },
});

export default App;
