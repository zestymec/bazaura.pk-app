import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text } from '../../components/common/AppText';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ScreenHeader } from '../../components/common/ui';
import { showToast } from '../../components/common/Toast';
import { useUpdateMe } from '../../api/hooks';
import { ApiError, errorMessage, fieldErrors } from '../../api/client';
import { useAuthStore } from '../../store/auth';
import { formatPhone } from '../../utils/formatters';
import { colors } from '../../theme/colors';

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const update = useUpdateMe();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const save = () => {
    setErrors({});
    setFormError(null);
    update.mutate(
      { fullName: fullName.trim() || null, email: email.trim() || null, city: city.trim() || null },
      {
        onSuccess: () => {
          showToast('Profile updated');
          navigation.goBack();
        },
        onError: (err) => {
          if (err instanceof ApiError && err.code === 'EMAIL_TAKEN') setErrors({ email: err.message });
          else {
            setErrors(fieldErrors(err));
            if (!Object.keys(fieldErrors(err)).length) setFormError(errorMessage(err));
          }
        },
      },
    );
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Edit profile" />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Input label="Full name" value={fullName} onChangeText={setFullName} autoCapitalize="words" error={errors.fullName} />
        <Input label="Email (optional)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
        <Input label="City" value={city} onChangeText={setCity} placeholder="e.g. Lahore" helperText="Used to show express delivery when available" error={errors.city} />
        <Input label="Mobile number" value={formatPhone(user?.phone)} editable={false} helperText="Your login number can't be changed" />
        {!!formError && <Text style={styles.error}>{formError}</Text>}
        <Button title="Save" size="lg" loading={update.isPending} onPress={save} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.neutral.white },
  body: { padding: 16 },
  error: { color: colors.error.DEFAULT, textAlign: 'center', marginBottom: 12 },
});
