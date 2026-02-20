package com.chargingmonitorpro.battery;

import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.BatteryManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

public class BatteryModule extends ReactContextBaseJavaModule {
    BatteryModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "BatteryModule";
    }

    @ReactMethod
    public void getBatteryStats(com.facebook.react.bridge.Promise promise) {
        try {
            Context context = getReactApplicationContext();
            IntentFilter ifilter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
            Intent batteryStatus = context.registerReceiver(null, ifilter);

            // الفولتية بالملي فولت
            int voltage = batteryStatus.getIntExtra(BatteryManager.EXTRA_VOLTAGE, -1);
            
            // التيار بالمايكرو أمبير
            BatteryManager bm = (BatteryManager) context.getSystemService(Context.BATTERY_SERVICE);
            int currentNow = bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CURRENT_NOW);

            WritableMap map = Arguments.createMap();
            map.putDouble("voltage", voltage / 1000.0); // تحويل لفولت
            map.putDouble("current", currentNow / 1000.0); // تحويل لملي أمبير
            promise.resolve(map);
        } catch (Exception e) {
            promise.reject("Error", e.getMessage());
        }
    }
}
