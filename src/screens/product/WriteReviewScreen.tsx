import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/common/AppText';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Chip, ScreenHeader } from '../../components/common/ui';
import { showToast } from '../../components/common/Toast';
import { Star } from '../../components/icons';
import { useCreateReview } from '../../api/hooks';
import { ApiError, errorMessage, fieldErrors } from '../../api/client';
import type { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { haptic } from '../../utils/haptics';

export const WriteReviewScreen: React.FC = () => {
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<RootStackParamList, 'WriteReview'>>();
  const insets = useSafeAreaInsets();
  const create = useCreateReview(params.slug);

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [size, setSize] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const submit = () => {
    const e: Record<string, string> = {};
    if (rating < 1) e.rating = 'Tap a star to rate';
    if (comment.trim().length < 3) e.comment = 'Write at least 3 characters';
    setErrors(e);
    setFormError(null);
    if (Object.keys(e).length) return;

    create.mutate(
      { rating, title: title.trim() || null, comment: comment.trim(), sizePurchased: size },
      {
        onSuccess: () => {
          showToast('Thanks for your review!');
          navigation.goBack();
        },
        onError: (err) => {
          haptic.error();
          if (err instanceof ApiError && err.code === 'REVIEW_EXISTS') setFormError("You've already reviewed this product.");
          else {
            setErrors(fieldErrors(err));
            setFormError(errorMessage(err));
          }
        },
      },
    );
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Write a review" />
      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">
        <Text style={styles.product} numberOfLines={2}>
          {params.title}
        </Text>

        <Text style={styles.label}>Your rating</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((n) => (
            <TouchableOpacity
              key={n}
              onPress={() => {
                haptic.selection();
                setRating(n);
              }}
              hitSlop={6}
              accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`}
            >
              <Star size={36} color="#F59E0B" fill={n <= rating ? '#F59E0B' : 'transparent'} />
            </TouchableOpacity>
          ))}
        </View>
        {!!errors.rating && <Text style={styles.error}>{errors.rating}</Text>}

        {params.sizes.length > 0 && (
          <>
            <Text style={styles.label}>Size you bought (optional)</Text>
            <View style={styles.chips}>
              {params.sizes.map((s) => (
                <Chip key={s} label={s} selected={size === s} onPress={() => setSize(size === s ? null : s)} />
              ))}
            </View>
          </>
        )}

        <Input label="Title (optional)" value={title} onChangeText={setTitle} maxLength={120} placeholder="Sum it up" error={errors.title} />
        <Input
          label="Your review"
          value={comment}
          onChangeText={setComment}
          maxLength={2000}
          multiline
          placeholder="How's the fit, fabric and quality?"
          inputStyle={{ minHeight: 120, textAlignVertical: 'top' }}
          error={errors.comment}
        />

        {!!formError && <Text style={styles.formError}>{formError}</Text>}
        <Button title="Post review" size="lg" loading={create.isPending} onPress={submit} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.neutral.white },
  body: { padding: 16 },
  product: { fontSize: 16, fontWeight: typography.weight.bold, color: colors.neutral[900], marginBottom: 16 },
  label: { fontSize: 13, fontWeight: typography.weight.bold, color: colors.neutral[700], marginBottom: 10, marginTop: 4 },
  stars: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  error: { fontSize: 12, color: colors.error.DEFAULT, marginBottom: 12 },
  formError: { fontSize: 13, color: colors.error.DEFAULT, textAlign: 'center', marginBottom: 12, fontWeight: typography.weight.semibold },
});
