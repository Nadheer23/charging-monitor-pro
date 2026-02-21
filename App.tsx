import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, NativeModules } from 'react-native';
import Tts from 'react-native-tts';

const { BatteryModule } = NativeModules;

const App = () => {
  const [voltage, setVoltage] = useState(0);
  const [current, setCurrent] = useState(0);
  const [wattage, setWattage] = useState(0);
  const [debugInfo, setDebugInfo] = useState('جارٍ الفحص...');

  const isSpeakingRef = useRef(false);

  useEffect(() => {
    Tts.setDefaultLanguage('ar-SA');
    Tts.addEventListener('tts-start', () => { isSpeakingRef.current = true; });
    Tts.addEventListener('tts-finish', () => { isSpeakingRef.current = false; });
    Tts.addEventListener('tts-cancel', () => { isSpeakingRef.current = false; });

    const interval = setInterval(async () => {
      try {
        const stats = await BatteryModule.getBatteryStats();
        setDebugInfo(JSON.stringify(stats)); 

        if (stats) {
          setVoltage(stats.voltage || 0);
          setCurrent(stats.current || 0);
          setWattage((stats.voltage || 0) * (Math.abs(stats.current || 0) / 1000));

          const currentLevel = stats.level || 100;
          
          if (currentLevel >= 100) {
            if (!isSpeakingRef.current) {
              Tts.speak('سيدي، البطارية ممتلئة، يرجى فصل الشاحن الآن');
            }
          } else {
            Tts.stop();
          }
        }
      } catch (e) {
        setDebugInfo("خطأ من الحساس: " + e.message);
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      Tts.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Charging Monitor Pro ⚡</Text>

      <View style={styles.card}>
        <Text style={styles.label}>الفولتية الحقيقية</Text>
        <Text style={styles.value}>{voltage.toFixed(2)} V</Text>
        <View style={styles.divider} />
        <Text style={styles.label}>التيار (Amperes)</Text>
        <Text style={styles.value}>{current.toFixed(0)} mA</Text>
        <View style={styles.divider} />
        <Text style={styles.label}>قدرة الشحن (Wattage)</Text>
        <Text style={styles.wattValue}>{wattage.toFixed(2)} W</Text>
      </View>

      <Text style={styles.debugText}>بيانات المعالج: {debugInfo}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#00ffcc', marginBottom: 30 },
  card: { backgroundColor: '#1e1e1e', padding: 20, borderRadius: 15, width: '100%', elevation: 5 },
  label: { color: '#aaaaaa', fontSize: 16, marginTop: 10 },
  value: { color: '#ffffff', fontSize: 28, fontWeight: 'bold' },
  wattValue: { color: '#ffeb3b', fontSize: 32, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#333333', marginVertical: 15 },
  debugText: { color: '#ff5555', marginTop: 30, fontSize: 14, textAlign: 'center', paddingHorizontal: 10 },
});

export default App;
