package com.amura.collector.scanner;

import com.google.mlkit.vision.barcode.common.Barcode;

public class BarcodeMapper {
    public static BarcodeResult map(Barcode barcode) {
        if (barcode == null) return null;
        
        String formatString = formatToString(barcode.getFormat());
        return new BarcodeResult(
            barcode.getRawValue(),
            formatString,
            barcode.getBoundingBox(),
            barcode.getCornerPoints()
        );
    }

    private static String formatToString(int format) {
        switch (format) {
            case Barcode.FORMAT_CODE_128: return "CODE_128";
            case Barcode.FORMAT_CODE_39: return "CODE_39";
            case Barcode.FORMAT_CODE_93: return "CODE_93";
            case Barcode.FORMAT_CODABAR: return "CODABAR";
            case Barcode.FORMAT_DATA_MATRIX: return "DATA_MATRIX";
            case Barcode.FORMAT_EAN_13: return "EAN_13";
            case Barcode.FORMAT_EAN_8: return "EAN_8";
            case Barcode.FORMAT_ITF: return "ITF";
            case Barcode.FORMAT_QR_CODE: return "QR_CODE";
            case Barcode.FORMAT_UPC_A: return "UPC_A";
            case Barcode.FORMAT_UPC_E: return "UPC_E";
            case Barcode.FORMAT_PDF417: return "PDF417";
            case Barcode.FORMAT_AZTEC: return "AZTEC";
            default: return "UNKNOWN";
        }
    }
}
