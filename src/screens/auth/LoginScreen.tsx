import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, TextInput } from '../../components/common/AppText';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Phone, ShieldCheck, X } from '../../components/icons';
import { api } from '../../api/endpoints';
import { ApiError, errorMessage } from '../../api/client';
import { completeLogin } from '../../store/session';
import { useAuthStore } from '../../store/auth';
import { env } from '../../config/env';
import type { RootStackParamList } from '../../types/navigation';
import { haptic } from '../../utils/haptics';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';

const CODE_LENGTH = 6;
const LOGO = require('../../../assets/brand/logo.png');

type Step = 'phone' | 'code' | 'name';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'Login'>>();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [needsNewCode, setNeedsNewCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const codeRef = useRef<RNTextInput>(null);
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const finish = () => {
    navigation.goBack();
    const then = params?.then;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (then) setTimeout(() => (navigation.navigate as any)(then.name, then.params), 50);
  };

  const doShake = () => {
    haptic.error();
    Animated.sequence(
      [10, -10, 8, -8, 0].map((toValue) => Animated.timing(shake, { toValue, duration: 50, useNativeDriver: true })),
    ).start();
  };

  const sendCode = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Enter a valid Pakistani mobile number');
      return;
    }
    setError(null);
    setNeedsNewCode(false);
    setLoading(true);
    try {
      const res = await api.requestOtp({ phone: phone.trim() });
      setResendIn(res.resendAvailableInSeconds);
      setCode('');
      setStep('code');
      setTimeout(() => codeRef.current?.focus(), 250);
    } catch (e) {
      haptic.error();
      // OTP_COOLDOWN / OTP_RATE_LIMITED messages say how long to wait.
      setError(e instanceof ApiError && e.code === 'VALIDATION_ERROR' ? 'Enter a valid Pakistani mobile number' : errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const verify = async (value = code) => {
    if (value.length < 4) return;
    setError(null);
    setLoading(true);
    try {
      const result = await api.verifyOtp({ phone: phone.trim(), code: value });
      await completeLogin(result);
      haptic.success();
      if (result.isNewUser || !result.user.fullName) setStep('name');
      else finish();
    } catch (e) {
      setCode('');
      doShake();
      const c = e instanceof ApiError ? e.code : '';
      if (c === 'OTP_INVALID') setError('Incorrect code');
      else if (c === 'OTP_EXPIRED') {
        setError('This code has expired.');
        setNeedsNewCode(true);
      } else if (c === 'OTP_LOCKED') {
        setError('Too many attempts. Request a new code.');
        setNeedsNewCode(true);
      } else setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const saveName = async () => {
    if (!fullName.trim()) {
      finish();
      return;
    }
    setLoading(true);
    try {
      await api.updateMe({ fullName: fullName.trim() });
      const me = await api.me();
      useAuthStore.getState().setUser(me);
    } catch {
      // Name can be added later from Account → Edit profile.
    } finally {
      setLoading(false);
      finish();
    }
  };

  const onCodeChange = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(digits);
    setError(null);
    if (digits.length === CODE_LENGTH) verify(digits);
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        {step !== 'name' && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.close} hitSlop={10} accessibilityLabel="Close">
            <X size={20} color={colors.neutral[800]} />
          </TouchableOpacity>
        )}
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />

        {step === 'phone' && (
          <>
            <Text style={styles.title}>Log in or sign up</Text>
            <Text style={styles.sub}>{params?.reason ?? 'We’ll text you a code to confirm your number.'}</Text>
            <View style={styles.form}>
              <Input
                label="Mobile number"
                value={phone}
                onChangeText={(t) => {
                  setPhone(t);
                  setError(null);
                }}
                placeholder="03XX XXXXXXX"
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                autoComplete="tel"
                maxLength={16}
                leftIcon={<Phone size={16} color={colors.neutral[500]} />}
                onSubmitEditing={sendCode}
                autoFocus
              />
              {!!error && <Text style={styles.error}>{error}</Text>}
              <Button title="Send code" size="lg" loading={loading} onPress={sendCode} />
            </View>
          </>
        )}

        {step === 'code' && (
          <>
            <Text style={styles.title}>Enter the code</Text>
            <Text style={styles.sub}>Sent by SMS to {phone}</Text>
            <View style={styles.form}>
              <Animated.View style={{ transform: [{ translateX: shake }] }}>
                <TouchableOpacity activeOpacity={1} onPress={() => codeRef.current?.focus()} style={styles.boxes}>
                  {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                    <View key={i} style={[styles.box, i < code.length && styles.boxFilled, i === code.length && styles.boxActive, !!error && styles.boxError]}>
                      <Text style={styles.digit}>{code[i] ?? ''}</Text>
                    </View>
                  ))}
                </TouchableOpacity>
              </Animated.View>
              <TextInput
                ref={codeRef}
                value={code}
                onChangeText={onCodeChange}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                maxLength={CODE_LENGTH}
                style={styles.hidden}
                caretHidden
              />
              {env.USE_MOCK_API && <Text style={styles.demo}>Demo mode: the code is 123456</Text>}
              {!!error && <Text style={styles.error}>{error}</Text>}
              {needsNewCode ? (
                <Button title="Send a new code" size="lg" loading={loading} onPress={sendCode} />
              ) : (
                <Button title="Verify" size="lg" loading={loading} disabled={code.length < CODE_LENGTH} onPress={() => verify()} />
              )}
              <View style={styles.links}>
                <TouchableOpacity disabled={resendIn > 0 || loading} onPress={sendCode}>
                  <Text style={[styles.link, resendIn > 0 && styles.linkOff]}>{resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setStep('phone');
                    setError(null);
                  }}
                >
                  <Text style={styles.link}>Change number</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {step === 'name' && (
          <>
            <Text style={styles.title}>What's your name?</Text>
            <Text style={styles.sub}>So we know who to deliver to.</Text>
            <View style={styles.form}>
              <Input label="Full name" value={fullName} onChangeText={setFullName} placeholder="e.g. Ayesha Khan" autoCapitalize="words" autoFocus onSubmitEditing={saveName} />
              <Button title="Continue" size="lg" loading={loading} onPress={saveName} />
              <Button title="Skip for now" variant="ghost" onPress={finish} style={{ marginTop: 6 }} />
            </View>
          </>
        )}

        <View style={styles.trust}>
          <ShieldCheck size={14} color={colors.success.DEFAULT} />
          <Text style={styles.trustText}>We never share your number.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.neutral.white },
  container: { paddingHorizontal: 24, flexGrow: 1 },
  close: { alignSelf: 'flex-end', width: 36, height: 36, borderRadius: 18, backgroundColor: colors.neutral[100], alignItems: 'center', justifyContent: 'center' },
  logo: { width: 110, height: 110, alignSelf: 'center', marginTop: 8, marginBottom: 20 },
  title: { fontSize: 26, fontWeight: typography.weight.bold, color: colors.neutral[900], textAlign: 'center' },
  sub: { fontSize: 14, color: colors.neutral[500], textAlign: 'center', marginTop: 6, lineHeight: 20 },
  form: { marginTop: 28 },
  error: { color: colors.error.DEFAULT, fontSize: 13, fontWeight: typography.weight.semibold, textAlign: 'center', marginBottom: 12 },
  boxes: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  box: {
    width: 46,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.neutral[100],
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: { backgroundColor: colors.neutral.white, borderColor: colors.neutral[300] },
  boxActive: { backgroundColor: colors.neutral.white, borderColor: colors.primary[500] },
  boxError: { borderColor: colors.error.DEFAULT },
  digit: { fontSize: 22, fontWeight: typography.weight.bold, color: colors.neutral[900] },
  hidden: { position: 'absolute', opacity: 0, width: 1, height: 1 },
  demo: {
    fontSize: 12.5,
    color: colors.primary[700],
    backgroundColor: colors.primary[50],
    textAlign: 'center',
    paddingVertical: 8,
    borderRadius: radii.sm,
    overflow: 'hidden',
    marginBottom: 12,
  },
  links: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  link: { fontSize: 13.5, fontWeight: typography.weight.bold, color: colors.primary[500] },
  linkOff: { color: colors.neutral[400] },
  trust: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 'auto', paddingTop: 32 },
  trustText: { fontSize: 12, color: colors.neutral[500] },
});
