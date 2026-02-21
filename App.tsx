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
        if (charging && Math.round(level * 100) >= 100) {
          Tts.speak('عُذراً أُستاذ نَذير، البَطَّارِيَّة مُمْتَلِئَة، يُرْجَى فَصْلُ الشَّاحِنِ الآن');
        }
      } catch (e) {}
      await sleep(delay);
    }
  });
};

const App = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [isPlugged, setIsPlugged] = useState(false);

  useEffect(() => {
    Tts.setDefaultLanguage('ar-SA');
    Tts.setDefaultRate(0.4);

    const init = async () => {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      }
      update();
    };
    init();

    const update = async () => {
      const level = await DeviceInfo.getBatteryLevel();
      const charging = await DeviceInfo.isPowerConnected();
      setBatteryLevel(Math.round(level * 100));
      setIsPlugged(charging);
      setIsRunning(BackgroundService.isRunning());
    };

    const interval = setInterval(update, 1000); // تحديث كل ثانية
    return () => clearInterval(interval);
  }, []);

  const toggle = async () => {
    if (BackgroundService.isRunning()) {
      await BackgroundService.stop();
      setIsRunning(false);
    } else {
      await BackgroundService.start(backgroundTask, {
        taskName: 'Battery', taskTitle: 'رادار نذير نشط 🛡️',
        taskDesc: 'يحرس البطارية الآن', taskIcon: {name: 'ic_launcher', type: 'mipmap'},
        color: '#0f172a', parameters: {delay: 3000},
      });
      setIsRunning(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>System Radar ⚡</Text>
      <View style={[styles.circle, isPlugged ? styles.active : styles.normal]}>
        <Text style={styles.text}>{batteryLevel >= 0 ? batteryLevel : '--'}%</Text>
        <Text style={styles.sub}>{isPlugged ? 'جاري الشحن 🔌' : 'مفصول 🔋'}</Text>
      </View>
      <TouchableOpacity style={[styles.btn, isRunning ? styles.btnRed : styles.btnBlue]} onPress={toggle}>
        <Text style={styles.btnTxt}>{isRunning ? 'إيقاف الحارس 🛑' : 'تشغيل الحارس 🚀'}</Text>
      </TouchableOpacity>
      <View style={styles.dev}>
        <Text style={styles.devName}>👑 نَـذِيــر الأَلـوسِــي 👑</Text>
        <Text style={styles.devSub}>System Administrator</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#f8fafc', marginBottom: 40 },
  circle: { width: 180, height: 180, borderRadius: 90, borderWidth: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e293b', marginBottom: 40 },
  active: { borderColor: '#10b981' },
  normal: { borderColor: '#64748b' },
  text: { fontSize: 50, fontWeight: 'bold', color: '#f8fafc' },
  sub: { fontSize: 16, color: '#94a3b8' },
  btn: { paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30 },
  btnBlue: { backgroundColor: '#3b82f6' },
  btnRed: { backgroundColor: '#ef4444' },
  btnTxt: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  dev: { marginTop: 50, alignItems: 'center' },
  devName: { color: '#fbbf24', fontSize: 24, fontWeight: 'bold' },
  devSub: { color: '#cbd5e1', fontSize: 14, fontStyle: 'italic' }
});

export default App;
