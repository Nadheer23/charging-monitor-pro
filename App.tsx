import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
        const charging = await DeviceInfo.isBatteryCharging();
        const currentPercentage = Math.round(level * 100);

        if (charging && currentPercentage >= 100) {
          Tts.speak('عُذراً أُستاذ نَذير، البَطَّارِيَّة مُمْتَلِئَة، يُرْجَى فَصْلُ الشَّاحِنِ الآن');
        } else {
          Tts.stop();
        }
      } catch (e) {
        console.log(e);
      }
      await sleep(delay);
    }
  });
};

const options = {
  taskName: 'BatteryRadar',
  taskTitle: 'رادار البطارية نشط ⚡',
  taskDesc: 'تطبيق 👑 نذير الألوسي 👑 يحرس هاتفك في الخلفية',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#0f172a',
  parameters: {
    delay: 4000,
  },
};

const App = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(0);

  useEffect(() => {
    Tts.setDefaultLanguage('ar-SA');
    Tts.setDefaultRate(0.4);

    const interval = setInterval(async () => {
      const level = await DeviceInfo.getBatteryLevel();
      setBatteryLevel(Math.round(level * 100));
      setIsRunning(BackgroundService.isRunning());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const toggleBackgroundService = async () => {
    if (BackgroundService.isRunning()) {
      await BackgroundService.stop();
      setIsRunning(false);
    } else {
      await BackgroundService.start(backgroundTask, options);
      setIsRunning(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>System Radar ⚡</Text>

      <View style={styles.circleContainer}>
        <View style={[styles.circle, isRunning ? styles.circleActive : styles.circleNormal]}>
          <Text style={styles.circleText}>{batteryLevel}%</Text>
          <Text style={styles.circleLabel}>{isRunning ? 'الرادار نشط 🛡️' : 'الرادار متوقف 💤'}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.button, isRunning ? styles.buttonStop : styles.buttonStart]} 
        onPress={toggleBackgroundService}
      >
        <Text style={styles.buttonText}>
          {isRunning ? 'إيقاف حارس الخلفية 🛑' : 'تشغيل حارس الخلفية 🚀'}
        </Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.label}>حالة النظام</Text>
        <Text style={styles.value}>
          {isRunning ? 'مُحصّن: يعمل حتى لو تم مسح التطبيق 👻' : 'عادي: يعمل فقط داخل التطبيق 📱'}
        </Text>
      </View>

      <View style={styles.developerContainer}>
        <Text style={styles.devLabel}>Developed By</Text>
        <Text style={styles.devName}>👑 نَـذِيــر الأَلـوسِــي 👑</Text>
        <Text style={styles.devEng}>System Administrator</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#f8fafc', marginBottom: 40, letterSpacing: 1 },
  circleContainer: { marginBottom: 30, alignItems: 'center', justifyContent: 'center' },
  circle: { width: 180, height: 180, borderRadius: 90, borderWidth: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e293b', elevation: 15 },
  circleActive: { borderColor: '#10b981', shadowColor: '#10b981', shadowRadius: 20 },
  circleNormal: { borderColor: '#64748b', shadowColor: '#000000', shadowRadius: 0 },
  circleText: { fontSize: 50, fontWeight: 'bold', color: '#f8fafc' },
  circleLabel: { fontSize: 16, color: '#94a3b8', marginTop: 5 },
  button: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30, marginBottom: 30, elevation: 5 },
  buttonStart: { backgroundColor: '#3b82f6' },
  buttonStop: { backgroundColor: '#ef4444' },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  card: { backgroundColor: '#1e293b', padding: 25, borderRadius: 20, width: '100%', elevation: 5 },
  label: { color: '#94a3b8', fontSize: 14, marginTop: 5 },
  value: { color: '#f8fafc', fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  developerContainer: { marginTop: 'auto', marginBottom: 30, alignItems: 'center', padding: 15, backgroundColor: '#1e293b', borderRadius: 15, width: '90%', borderWidth: 1, borderColor: '#334155' },
  devLabel: { color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 2 },
  devName: { color: '#fbbf24', fontSize: 24, fontWeight: 'bold', marginTop: 5, textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  devEng: { color: '#cbd5e1', fontSize: 14, marginTop: 3, fontStyle: 'italic', letterSpacing: 1 },
});

export default App;
