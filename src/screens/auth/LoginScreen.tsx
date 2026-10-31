import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput as RNTextInput,
} from 'react-native';
import { Text, TextInput } from '../../components/common/AppText';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, ShieldCheck, Phone } from 'lucide-react-native';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { authService } from '../../api/services/auth';
import { getErrorMessage } from '../../api/errors';
import { login } from '../../store/session';
import { env } from '../../config/env';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';
import { isValidPakistaniPhone } from '../../utils/validation';
import { haptic } from '../../utils/haptics';

const OTP_LENGTH = 6;
const LOGO = require('../../../assets/brand/logo.png');

/** Normalises 0300-1234567 / +92 300 1234567 → 03001234567. */
function normalisePhone(raw: string) {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('92') && digits.length === 12) return `0${digits.slice(2)}`;
  return digits;
}

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'Login'>>();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const otpRef = useRef<RNTextInput>(null);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const sendCode = async () => {
    const clean = normalisePhone(phone);
    if (!isValidPakistaniPhone(clean)) {
      haptic.error();
      setError('Enter a valid Pakistani mobile number, e.g. 03001234567');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await authService.requestOtp(clean);
      setPhone(clean);
      setResendIn(res.resend_available_in_seconds);
      setStep('otp');
      haptic.success();
      setTimeout(() => otpRef.current?.focus(), 250);
    } catch (e) {
      haptic.error();
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const verify = async (code = otp) => {
    if (code.length < 4) {
      setError('Enter the code we sent by SMS');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(phone, code, fullName.trim() || undefined);
      haptic.success();
      navigation.goBack();
    } catch (e) {
      haptic.error();
      setError(getErrorMessage(e));
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const onOtpChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setOtp(digits);
    if (digits.length === OTP_LENGTH) verify(digits);
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeBtn}
          hitSlop={10}
          accessibilityLabel="Close"
        >
          <X size={20} color={colors.neutral[800]} />
        </TouchableOpacity>

        <Image source={LOGO} style={styles.logo} resizeMode="contain" />

        <Text style={styles.title}>{step === 'phone' ? 'Welcome to Bazaura' : 'Verify your number'}</Text>
        <Text style={styles.subtitle}>
          {step === 'phone'
            ? route.params?.reason || 'Log in with your mobile number to place orders and track deliveries.'
            : `Enter the ${OTP_LENGTH}-digit code sent to ${phone}`}
        </Text>

        {step === 'phone' ? (
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
              returnKeyType="next"
              onSubmitEditing={sendCode}
              autoFocus
            />
            <Input
              label="Full name (new customers)"
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. Ayesha Khan"
              autoCapitalize="words"
              textContentType="name"
              autoComplete="name"
              returnKeyType="done"
              onSubmitEditing={sendCode}
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <Button title="Send code" onPress={sendCode} loading={loading} size="lg" />
          </View>
        ) : (
          <View style={styles.form}>
            <TouchableOpacity activeOpacity={1} onPress={() => otpRef.current?.focus()} style={styles.otpRow}>
              {Array.from({ length: OTP_LENGTH }).map((_, i) => {
                const filled = i < otp.length;
                const active = i === otp.length;
                return (
                  <View key={i} style={[styles.otpBox, filled && styles.otpBoxFilled, active && styles.otpBoxActive]}>
                    <Text style={styles.otpDigit}>{otp[i] ?? ''}</Text>
                  </View>
                );
              })}
            </TouchableOpacity>
            {/* Hidden input drives the boxes; supports SMS autofill on both platforms. */}
            <TextInput
              ref={otpRef}
              value={otp}
              onChangeText={onOtpChange}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              maxLength={OTP_LENGTH}
              style={styles.hiddenInput}
              caretHidden
            />

            {env.USE_MOCK_API && <Text style={styles.demoHint}>Demo mode: any 4–6 digit code works.</Text>}
            {error && <Text style={styles.error}>{error}</Text>}

            <Button title="Verify & continue" onPress={() => verify()} loading={loading} size="lg" />

            <View style={styles.resendRow}>
              <TouchableOpacity disabled={resendIn > 0 || loading} onPress={sendCode}>
                <Text style={[styles.resendText, resendIn > 0 && styles.resendDisabled]}>
                  {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setStep('phone');
                  setOtp('');
                  setError(null);
                }}
              >
                <Text style={styles.resendText}>Change number</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.trustRow}>
          <ShieldCheck size={14} color={colors.success.DEFAULT} />
          <Text style={styles.trustText}>We never share your number. No spam, ever.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  container: {
    paddingHorizontal: 24,
    flexGrow: 1,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  form: {
    marginTop: 28,
  },
  error: {
    color: colors.error.DEFAULT,
    fontSize: 12.5,
    fontWeight: typography.weight.semibold,
    marginBottom: 12,
    textAlign: 'center',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  otpBox: {
    width: 46,
    height: 54,
    borderRadius: radii.md,
    backgroundColor: colors.neutral[100],
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFilled: {
    backgroundColor: colors.neutral.white,
    borderColor: colors.neutral[300],
  },
  otpBoxActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.neutral.white,
  },
  otpDigit: {
    fontSize: 22,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },
  demoHint: {
    fontSize: 12,
    color: colors.primary[700],
    backgroundColor: colors.primary[50],
    textAlign: 'center',
    paddingVertical: 8,
    borderRadius: radii.sm,
    overflow: 'hidden',
    marginBottom: 12,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  resendText: {
    fontSize: 13,
    fontWeight: typography.weight.bold,
    color: colors.primary[500],
  },
  resendDisabled: {
    color: colors.neutral[400],
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 'auto',
    paddingTop: 32,
  },
  trustText: {
    fontSize: 12,
    color: colors.neutral[500],
  },
});
