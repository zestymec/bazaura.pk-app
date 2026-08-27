import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { STORY_ITEMS, StoryItem } from '../../data/banners';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';
import { haptic } from '../../utils/haptics';

interface StoryBarProps {
  onStoryPress: (story: StoryItem) => void;
}

export const StoryBar: React.FC<StoryBarProps> = ({ onStoryPress }) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {STORY_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            onPress={() => {
              haptic.light();
              onStoryPress(item);
            }}
            style={styles.storyItem}
          >
            <View
              style={[
                styles.avatarRing,
                item.hasUnseen && styles.unseenRing,
              ]}
            >
              <View style={styles.avatarInner}>
                <Image source={{ uri: item.imageUrl }} style={styles.avatarImage} />
              </View>
            </View>

            <Text style={styles.titleText} numberOfLines={1}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  storyItem: {
    alignItems: 'center',
    width: 60,
  },
  avatarRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    padding: 2,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  unseenRing: {
    borderColor: colors.primary[500],
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: radii.full,
    overflow: 'hidden',
    backgroundColor: colors.neutral[100],
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  titleText: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: typography.weight.medium,
    color: colors.neutral[700],
    textAlign: 'center',
  },
});
