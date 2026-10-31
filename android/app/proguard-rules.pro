# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Add any project specific keep options here:
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.reactnativecommunity.netinfo.** { *; }
-keep class com.imagepicker.** { *; }
-keep class com.mkuczera.** { *; }
-dontwarn com.facebook.react.**
# New-architecture classes reached via JNI / reflection (react-native-screens reads FabricUIManager.mBinding)
-keep class com.facebook.react.fabric.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.swmansion.rnscreens.** { *; }
-keep class com.swmansion.gesturehandler.** { *; }
-keep class com.th3rdwave.safeareacontext.** { *; }
-keep class com.horcrux.svg.** { *; }
-keep class com.reactnativecommunity.asyncstorage.** { *; }
-keep class com.oblador.keychain.** { *; }
