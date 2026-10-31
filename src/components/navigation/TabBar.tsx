import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../common/AppText';
import { Heart, House, LayoutGrid, LucideIcon, ShoppingBag, User } from '../icons';
import { useCartStore, selectCartCount } from '../../store/cart';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { haptic } from '../../utils/haptics';

const TABS: Record<string, { label: string; icon: LucideIcon }> = {
  HomeTab: { label: 'Home', icon: House },
  ShopTab: { label: 'Shop', icon: LayoutGrid },
  WishlistTab: { label: 'Wishlist', icon: Heart },
  BagTab: { label: 'Bag', icon: ShoppingBag },
  AccountTab: { label: 'Account', icon: User },
};

export const TabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();
  const cartCount = useCartStore(selectCartCount);

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const tab = TABS[route.name];
        const Icon = tab.icon;
        const color = focused ? colors.primary[500] : colors.neutral[400];
        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={tab.label}
            activeOpacity={0.7}
            style={styles.tab}
            onPress={() => {
              haptic.selection();
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            }}
          >
            <View>
              <Icon size={23} color={color} strokeWidth={focused ? 2.3 : 1.8} />
              {route.name === 'BagTab' && cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, { color }, focused && styles.labelOn]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.surface.divider,
    paddingTop: 8,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  label: { fontSize: 10.5, fontWeight: typography.weight.semibold },
  labelOn: { fontWeight: typography.weight.extrabold },
  badge: {
    position: 'absolute',
    top: -4,
    right: -9,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.neutral.white,
  },
  badgeText: { color: colors.neutral.white, fontSize: 9, fontWeight: typography.weight.extrabold },
});
