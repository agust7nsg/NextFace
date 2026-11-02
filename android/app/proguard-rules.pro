# Capacitor / WebView — keep all bridge interfaces and plugin classes
-keep class com.getcapacitor.** { *; }
-keep class com.nextface.app.** { *; }
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep WebView-related classes
-keep class android.webkit.** { *; }
-keep class org.apache.cordova.** { *; }

# Supabase — not heavily used natively, but keep for safety
-keep class io.supabase.** { *; }

# Preserve line numbers for crash reports
-keepattributes SourceFile,LineNumberTable

# Remove logging calls in release
-assumenosideeffects class android.util.Log {
    public static *** v(...);
    public static *** d(...);
    public static *** i(...);
}
