package com.amura.collector.scanner;

import com.getcapacitor.JSObject;
import com.getcapacitor.JSArray;
import android.graphics.Point;
import android.graphics.Rect;

public class BarcodeResult {
    private String rawValue;
    private String format;
    private Rect boundingBox;
    private Point[] cornerPoints;
    private long timestamp;
    private String scannerType;

    public BarcodeResult(String rawValue, String format, Rect boundingBox, Point[] cornerPoints) {
        this.rawValue = rawValue;
        this.format = format;
        this.boundingBox = boundingBox;
        this.cornerPoints = cornerPoints;
        this.timestamp = System.currentTimeMillis();
        this.scannerType = "MLKIT";
    }

    public JSObject toJSObject() {
        JSObject obj = new JSObject();
        obj.put("rawValue", this.rawValue != null ? this.rawValue : "");
        obj.put("format", this.format != null ? this.format : "UNKNOWN");
        obj.put("timestamp", this.timestamp);
        obj.put("scannerType", this.scannerType);
        
        if (this.boundingBox != null) {
            JSObject box = new JSObject();
            box.put("left", this.boundingBox.left);
            box.put("top", this.boundingBox.top);
            box.put("right", this.boundingBox.right);
            box.put("bottom", this.boundingBox.bottom);
            box.put("width", this.boundingBox.width());
            box.put("height", this.boundingBox.height());
            obj.put("boundingBox", box);
        }

        if (this.cornerPoints != null) {
            JSArray corners = new JSArray();
            for (Point p : this.cornerPoints) {
                JSObject point = new JSObject();
                point.put("x", p.x);
                point.put("y", p.y);
                corners.put(point);
            }
            obj.put("cornerPoints", corners);
        }

        return obj;
    }
}
