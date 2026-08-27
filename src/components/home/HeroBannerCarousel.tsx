import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { PROMO_BANNERS, PromoBanner } from '../../data/banners';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, shadows } from '../../theme/spacing';
import { haptic } from '../../utils/haptics';

interface HeroBannerCarouselProps {
  onBannerPress: (banner: PromoBanner) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 32;

export const HeroBannerCarousel: React.FC<HeroBannerCarouselProps> = ({
  onBannerPress,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    if (index !== activeIndex && index >= 0 && index < PROMO_BANNERS.length) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={PROMO_BANNERS}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => {
              haptic.light();
              onBannerPress(item);
            }}
            style={[styles.bannerCard, { width: BANNER_WIDTH }]}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.bannerImage}
              resizeMode="cover"
            />

            {/* Clean Vignette Overlay */}
            <View style={styles.gradientOverlay}>
              <View>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>{item.tag}</Text>
                </View>
                <Text style={styles.titleText}>{item.title}</Text>
                <Text style={styles.subtitleText} numberOfLines={2}>
                  {item.subtitle}
                </Text>
              </View>

              <View style={styles.ctaButton}>
                <Text style={styles.ctaText}>{item.ctaText}</Text>
                <ChevronRight size={13} color={colors.neutral.white} />
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Clean Pagination Dots */}
      <View style={styles.paginationRow}>
        {PROMO_BANNERS.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              idx === activeIndex ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 4,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  bannerCard: {
    height: 155,
    borderRadius: radii.xl,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.neutral[900],
    ...shadows.subtle,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradientOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: 14,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tagBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radii.xs,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  tagText: {
    fontSize: 9,
    fontWeight: typography.weight.bold,
    color: colors.neutral.white,
    letterSpacing: 0.3,
  },
  titleText: {
    fontSize: 16,
    fontWeight: typography.weight.black,
    color: colors.neutral.white,
    letterSpacing: 0.2,
  },
  subtitleText: {
    fontSize: 11,
    color: colors.neutral[200],
    marginTop: 2,
    maxWidth: '85%',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[500],
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.full,
    gap: 4,
  },
  ctaText: {
    fontSize: 11,
    fontWeight: typography.weight.bold,
    color: colors.neutral.white,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  activeDot: {
    width: 14,
    backgroundColor: colors.neutral[800],
  },
  inactiveDot: {
    width: 4,
    backgroundColor: colors.neutral[300],
  },
});
