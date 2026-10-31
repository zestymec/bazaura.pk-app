import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
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
import { optimizeImageUrl } from '../../utils/images';

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
          <Image source={{ uri: optimizeImageUrl(item.mobileImageUrl ?? item.imageUrl, cardWidth) }} style={StyleSheet.absoluteFill} />
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
  card: { height: 190, borderRadius: radii['2xl'], overflow: 'hidden', backgroundColor: colors.neutral[800] },
  overlay: { flex: 1, padding: 18, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.28)' },
  tag: { color: colors.neutral.white, fontSize: 11, fontWeight: typography.weight.extrabold, letterSpacing: 1, marginBottom: 6 },
  title: { color: colors.neutral.white, fontSize: 22, fontWeight: typography.weight.bold, lineHeight: 27 },
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
