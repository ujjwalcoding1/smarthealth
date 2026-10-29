package com.smarthealth.app;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Vibrator;
import android.speech.tts.TextToSpeech;
import android.telephony.SmsManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import java.util.Locale;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private Vibrator vibrator;
    private TextToSpeech tts;
    private static final int PERMISSION_REQ_CODE = 101;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);

        // Initialize Android TTS
        tts = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                tts.setLanguage(Locale.US);
            }
        });

        // Request runtime permissions for direct Phone Calling, SMS, Location
        checkPermissions();

        // Setup WebView
        webView = findViewById(R.id.webView);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setGeolocationEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        // Attach Native Android Bridge
        webView.addJavascriptInterface(new AndroidBridge(this), "AndroidNative");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url == null) return false;
                if (url.startsWith("tel:")) {
                    try {
                        Intent intent;
                        if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED) {
                            intent = new Intent(Intent.ACTION_CALL, Uri.parse(url));
                        } else {
                            intent = new Intent(Intent.ACTION_DIAL, Uri.parse(url));
                        }
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        return false;
                    }
                } else if (url.startsWith("mailto:") || url.startsWith("sms:") || url.startsWith("geo:") || url.startsWith("whatsapp://")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        Toast.makeText(MainActivity.this, "No supported app found for link", Toast.LENGTH_SHORT).show();
                        return true;
                    }
                } else if (url.contains("wa.me") || url.contains("maps.google.com") || url.contains("google.com/maps") || (url.startsWith("http") && !url.contains("localhost") && !url.contains("127.0.0.1") && !url.contains("10.0.2.2"))) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        return false;
                    }
                }
                return false;
            }
        });
        webView.setWebChromeClient(new WebChromeClient());

        // Load bundled mobile web application (or cloud URL)
        webView.loadUrl("file:///android_asset/www/index.html");
    }

    private void checkPermissions() {
        String[] permissions = {
            Manifest.permission.CALL_PHONE,
            Manifest.permission.SEND_SMS,
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.VIBRATE
        };

        boolean needRequest = false;
        for (String perm : permissions) {
            if (ContextCompat.checkSelfPermission(this, perm) != PackageManager.PERMISSION_GRANTED) {
                needRequest = true;
                break;
            }
        }

        if (needRequest) {
            ActivityCompat.requestPermissions(this, permissions, PERMISSION_REQ_CODE);
        }
    }

    // Android Native Bridge Exposed to JavaScript
    public class AndroidBridge {
        Context mContext;

        AndroidBridge(Context c) {
            mContext = c;
        }

        @JavascriptInterface
        public void dialEmergency(String phoneNumber) {
            runOnUiThread(() -> {
                try {
                    Toast.makeText(mContext, "Emergency SOS: Dialing " + phoneNumber, Toast.LENGTH_LONG).show();
                    Intent callIntent;
                    if (ContextCompat.checkSelfPermission(mContext, Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED) {
                        callIntent = new Intent(Intent.ACTION_CALL, Uri.parse("tel:" + phoneNumber));
                    } else {
                        callIntent = new Intent(Intent.ACTION_DIAL, Uri.parse("tel:" + phoneNumber));
                    }
                    callIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    mContext.startActivity(callIntent);
                } catch (Exception e) {
                    Toast.makeText(mContext, "Error dialing: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface
        public void sendSms(String phoneNumber, String message) {
            runOnUiThread(() -> {
                try {
                    SmsManager smsManager = SmsManager.getDefault();
                    smsManager.sendTextMessage(phoneNumber, null, message, null, null);
                    Toast.makeText(mContext, "SOS SMS dispatched with GPS coordinates", Toast.LENGTH_SHORT).show();
                } catch (Exception e) {
                    // Fallback to SMS Intent
                    Intent smsIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("sms:" + phoneNumber));
                    smsIntent.putExtra("sms_body", message);
                    smsIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    mContext.startActivity(smsIntent);
                }
            });
        }

        @JavascriptInterface
        public void vibrateAlert(int ms) {
            if (vibrator != null) {
                vibrator.vibrate(ms);
            }
        }

        @JavascriptInterface
        public void speakVoice(String text) {
            if (tts != null) {
                tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, null);
            }
        }

        @JavascriptInterface
        public void showToast(String msg) {
            runOnUiThread(() -> Toast.makeText(mContext, msg, Toast.LENGTH_SHORT).show());
        }

        @JavascriptInterface
        public void openExternalUrl(String url) {
            runOnUiThread(() -> {
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    mContext.startActivity(intent);
                } catch (Exception e) {
                    Toast.makeText(mContext, "Error opening link: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface
        public void openWhatsApp(String phone, String text) {
            runOnUiThread(() -> {
                try {
                    String cleanPhone = phone.replaceAll("[^0-9]", "");
                    String url = "https://wa.me/" + cleanPhone + "?text=" + Uri.encode(text);
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    mContext.startActivity(intent);
                } catch (Exception e) {
                    Toast.makeText(mContext, "Cannot open WhatsApp: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
        super.onDestroy();
    }
}
