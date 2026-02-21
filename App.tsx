import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, NativeModules } from 'react-native';
import Tts from 'react-native-tts';

const { BatteryModule } = NativeModules;

const App = () => {
  const [voltage, setVoltage] = useState(0);
  const [current, setCurrent] = useState(0);
  const [wattage, setWattage] = useState(0);

  // مرجع لمعرفة إذا كانت الفتاة تتحدث حالياً حتى لا تتداخل الأصوات
  const isSpeakingRef = useRef(false);

  useEffect(() => {
    // تجهيز اللغة (صوت أنثوي عربي قياسي من نظام أندرويد)
    Tts.setDefaultLanguage('ar-SA');
    
    // مراقبة حالة النطق
    Tts.addEventListener('tts-start', () => { isSpeakingRef.current = true; });
    Tts.addEventListener('tts-finish', () => { isSpeakingRef.current = false; });
    Tts.addEventListener('tts-cancel', () => { isSpeakingRef.current = false; });

    const interval = setInterval(async () => {
      try {
        const stats = await BatteryModule.getBatteryStats();
        
        setVoltage(stats.voltage);
        setCurrent(stats.current);
        
        // حساب الواطية
        setWattage(stats.voltage * (Math.abs(stats.current) / 1000));

        // نفترض أن النسبة تأتي من stats.level، والتيار الموجب يعني الشاحن متصل
        const currentLevel = stats.level || 100; // تأكد من إضافة level في الجافا إذا لم تكن موجودة
        const isCharging = stats.current > 0; // إذا كان التيار موجب يعني يتم الشحن

        // الشرط: النسبة 100% والشاحن متصل
        if (currentLevel >= 100 && isCharging) {
          // إذا لم تكن تتحدث حالياً، اجعلها تنطق الجملة
          if (!isSpeakingRef.current) {
            Tts.speak('سيدي، البطارية ممتلئة، يرجى فصل الشاحن الآن');
          }
        } else if (!isCharging) {
          // إذا تم فصل الشاحن (التيار أصبح سالب أو صفر)، أوقف الصوت فوراً
          Tts.stop();
        }

      } catch (e) {
        console.error(e);
      }
    }, 2000); // الفحص يتم كل ثانيتين لتخفيف الضغط على المعالج

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

      <Text style={styles.footer}>قراءات مباشرة من الحساسات 🔋</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ffcc',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    elevation: 5,
  },
  label: {
    color: '#aaaaaa',
    fontSize: 16,
    marginTop: 10,
  },
  value: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  wattValue: {
    color: '#ffeb3b',
    fontSize: 32,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#333333',
    marginVertical: 15,
  },
  footer: {
    color: '#666666',
    marginTop: 30,
    fontSize: 12,
  },
});

export default App;
