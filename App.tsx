import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, NativeModules, PermissionsAndroid, Platform } from 'react-native';

const { BatteryModule } = NativeModules;

const App = () => {
  const [voltage, setVoltage] = useState(0);
  const [current, setCurrent] = useState(0);
  const [wattage, setWattage] = useState(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const stats = await BatteryModule.getBatteryStats();
        setVoltage(stats.voltage);
        setCurrent(stats.current);
        // حساب الواطية: فولت × أمبير (التيار بالملي أمبير نحوله لأمبير)
        setWattage(stats.voltage * (Math.abs(stats.current) / 1000));
      } catch (e) {
        console.error(e);
      }
    }, 1000);

    return () => clearInterval(interval);
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
      
      <Text style={styles.footer}>قراءات مباشرة من الحساسات 🔋</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, color: '#fff', fontWeight: 'bold', marginBottom: 30 },
  card: { backgroundColor: '#111', padding: 30, borderRadius: 20, width: '90%', borderWeight: 1, borderColor: '#333', borderWidth: 1 },
  label: { color: '#888', fontSize: 16, textAlign: 'center' },
  value: { color: '#22c55e', fontSize: 40, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  wattValue: { color: '#38bdf8', fontSize: 50, fontWeight: 'bold', textAlign: 'center' },
  divider: { height: 1, backgroundColor: '#222', marginVertical: 15 },
  footer: { color: '#444', marginTop: 30, fontSize: 12 }
});

export default App;
