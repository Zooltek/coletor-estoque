package com.amura.collector.scanner;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import androidx.camera.core.Camera;

public class TorchController implements SensorEventListener {
    private Camera camera;
    private SensorManager sensorManager;
    private Sensor lightSensor;
    private boolean autoTorchEnabled = true;
    private boolean isTorchOn = false;
    private static final float DARK_THRESHOLD_LUX = 8.0f;
    private static final float LIGHT_THRESHOLD_LUX = 20.0f;

    public TorchController(Context context) {
        sensorManager = (SensorManager) context.getSystemService(Context.SENSOR_SERVICE);
        if (sensorManager != null) {
            lightSensor = sensorManager.getDefaultSensor(Sensor.TYPE_LIGHT);
        }
    }

    public void setCamera(Camera camera) {
        this.camera = camera;
    }

    public void startAutoTorch() {
        if (lightSensor != null && autoTorchEnabled) {
            sensorManager.registerListener(this, lightSensor, SensorManager.SENSOR_DELAY_NORMAL);
            CameraUtils.logDebug("AutoTorch: Sensor de luminosidade registrado");
        }
    }

    public void stopAutoTorch() {
        if (sensorManager != null) {
            sensorManager.unregisterListener(this);
        }
    }

    public void toggleTorch(boolean on) {
        stopAutoTorch();
        setTorchState(on);
    }

    private void setTorchState(boolean on) {
        if (camera != null && camera.getCameraInfo().hasFlashUnit()) {
            camera.getCameraControl().enableTorch(on);
            isTorchOn = on;
            CameraUtils.logDebug("TorchController: Lanterna alterada para " + on);
        }
    }

    public boolean isTorchOn() {
        return isTorchOn;
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_LIGHT) {
            float lux = event.values[0];
            if (lux < DARK_THRESHOLD_LUX && !isTorchOn) {
                CameraUtils.logDebug("AutoTorch: Ambiente escuro detectado (" + lux + " lux), ligando lanterna");
                setTorchState(true);
            } else if (lux > LIGHT_THRESHOLD_LUX && isTorchOn) {
                CameraUtils.logDebug("AutoTorch: Luz suficiente (" + lux + " lux), desligando lanterna");
                setTorchState(false);
            }
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
    }
}
