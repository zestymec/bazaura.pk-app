import React, { useCallback, useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Text } from '../common/AppText';
import { ChevronRight } from '../icons';
import type { ContentBlockOut } from '../../api/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';
import { RemoteImage, Shade } from '../common/RemoteImage';

export const BannerCarousel: React.FC<{ banners: ContentBlockOut[]; onPress: (b: ContentBlockOut) => void }> = React.memo(
  ({ banners, onPress }) => {
    const { width } = useWindowDimensions();
    const cardWidth = width - 32;
    const [index, setIndex] = useState(0);

    const onScroll = useCallback(
      (e: NativeSyntheticEvent<NativeScrollEvent>) => setIndex(Math.round(e.nativeEvent.contentOffset.x / (cardWidth + 12))),
      [cardWidth],
    );

    const renderItem = useCallback(
      ({ item }: ListRenderItemInfo<ContentBlockOut>) => (
        <TouchableOpacity activeOpacity={0.92} onPress={() => onPress(item)} style={[styles.card, { width: cardWidth }]}>
          <RemoteImage uri={item.mobileImageUrl ?? item.imageUrl} width={cardWidth} quality={75} style={StyleSheet.absoluteFill} />
          <Shade from={0.85} to={0.05} />
          <View style={styles.overlay}>
            {!!item.tag && <Text style={styles.tag}>{item.tag}</Text>}
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            {!!item.subtitle && (
              <Text style={styles.subtitle} numberOfLines={2}>
                {item.subtitle}
              </Text>
            )}
            {!!item.ctaText && (
              <View style={styles.cta}>
                <Text style={styles.ctaText}>{item.ctaText}</Text>
                <ChevronRight size={14} color={colors.neutral[900]} />
              </View>
            )}
          </View>
        </TouchableOpacity>
      ),
      [cardWidth, onPress],
    );

    if (!banners.length) return null;
    return (
      <View>
        <FlatList
          data={banners}
          horizontal
          keyExtractor={(b) => b.id}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardWidth + 12}
          decelerationRate="fast"
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          onMomentumScrollEnd={onScroll}
        />
        {banners.length > 1 && (
          <View style={styles.dots}>
            {banners.map((b, i) => (
              <View key={b.id} style={[styles.dot, i === index && styles.dotOn]} />
            ))}
          </View>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16 },
  card: { height: 220, borderRadius: radii['2xl'], overflow: 'hidden', backgroundColor: colors.neutral[800] },
  overlay: { flex: 1, padding: 20, justifyContent: 'flex-end' },
  tag: { alignSelf: 'flex-start', overflow: 'hidden', backgroundColor: colors.primary[500], paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.full, color: colors.neutral.white, fontSize: 10.5, fontWeight: typography.weight.extrabold, letterSpacing: 1, marginBottom: 6 },
  title: { color: colors.neutral.white, fontSize: 24, fontWeight: typography.weight.bold, lineHeight: 29 },
  subtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 4, lineHeight: 18 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
    backgroundColor: colors.neutral.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    marginTop: 12,
  },
  ctaText: { fontSize: 13, fontWeight: typography.weight.bold, color: colors.neutral[900] },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.neutral[300] },
  dotOn: { width: 18, backgroundColor: colors.primary[500] },
});
