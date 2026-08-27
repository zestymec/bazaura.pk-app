import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { CATEGORIES } from '../../data/categories';
import { Category } from '../../types/product';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';
import { haptic } from '../../utils/haptics';

interface CategoryChipsProps {
  selectedCategoryId: string | null;
  onSelectCategory: (category: Category | null) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* "All" Chip */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => {
            haptic.selection();
            onSelectCategory(null);
          }}
          style={[
            styles.chip,
            selectedCategoryId === null && styles.activeChip,
          ]}
        >
          <Text
            style={[
              styles.chipText,
              selectedCategoryId === null && styles.activeChipText,
            ]}
          >
            All Items
          </Text>
        </TouchableOpacity>

        {/* Category Chips */}
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.75}
              onPress={() => {
                haptic.selection();
                onSelectCategory(cat);
              }}
              style={[
                styles.chip,
                isSelected && styles.activeChip,
              ]}
            >
              <Image source={{ uri: cat.image }} style={styles.chipThumbnail} />
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.activeChipText,
                ]}
                numberOfLines={1}
              >
                {cat.name.split('&')[0].trim()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  activeChip: {
    backgroundColor: colors.neutral[900],
  },
  chipThumbnail: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 5,
  },
  chipText: {
    fontSize: 11,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[700],
  },
  activeChipText: {
    color: colors.neutral.white,
  },
});
