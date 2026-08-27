import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Home,
  Compass,
  Sparkles,
  ShoppingBag,
  User,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, shadows } from '../../theme/spacing';
import { useCartStore } from '../../store/useCartStore';
import { useRequestStore } from '../../store/useRequestStore';
import { haptic } from '../../utils/haptics';

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { getItemCount } = useCartStore();
  const { requests } = useRequestStore();

  const cartCount = getItemCount();
  const activeRequestsCount = requests.filter(
    (r) => r.status === 'SUBMITTED' || r.status === 'SOURCING_IN_PROGRESS' || r.status === 'PRICE_QUOTED'
  ).length;

  const getTabIcon = (routeName: string, isFocused: boolean) => {
    const color = isFocused ? colors.primary[500] : colors.neutral[400];
    const size = 22;

    switch (routeName) {
      case 'HomeTab':
        return <Home size={size} color={color} strokeWidth={isFocused ? 2.4 : 1.8} />;
      case 'ExploreTab':
        return <Compass size={size} color={color} strokeWidth={isFocused ? 2.4 : 1.8} />;
      case 'RequestItemTab':
        return (
          <View style={styles.centerBtn}>
            <Sparkles size={19} color={colors.neutral.white} strokeWidth={2.2} />
          </View>
        );
      case 'CartTab':
        return <ShoppingBag size={size} color={color} strokeWidth={isFocused ? 2.4 : 1.8} />;
      case 'ProfileTab':
        return <User size={size} color={color} strokeWidth={isFocused ? 2.4 : 1.8} />;
      default:
        return <Home size={size} color={color} />;
    }
  };

  const getTabLabel = (routeName: string) => {
    switch (routeName) {
      case 'HomeTab':
        return 'Home';
      case 'ExploreTab':
        return 'Explore';
      case 'RequestItemTab':
        return 'Request';
      case 'CartTab':
        return 'Bag';
      case 'ProfileTab':
        return 'Profile';
      default:
        return routeName;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      <View style={styles.barInner}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const isCenterTab = route.name === 'RequestItemTab';

          const onPress = () => {
            haptic.selection();

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={`tab-${route.name}`}
              onPress={onPress}
              activeOpacity={0.7}
              style={[
                styles.tabItem,
                isCenterTab && styles.centerTabItem,
              ]}
            >
              <View style={styles.iconWrapper}>
                {getTabIcon(route.name, isFocused)}

                {/* Cart Badge */}
                {route.name === 'CartTab' && cartCount > 0 && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>
                      {cartCount > 9 ? '9+' : cartCount}
                    </Text>
                  </View>
                )}

                {/* Request Indicator */}
                {route.name === 'RequestItemTab' && activeRequestsCount > 0 && (
                  <View style={styles.requestDot}>
                    <Text style={styles.requestDotText}>{activeRequestsCount}</Text>
                  </View>
                )}
              </View>

              {!isCenterTab && (
                <Text
                  style={[
                    styles.tabLabel,
                    isFocused ? styles.activeTabLabel : styles.inactiveTabLabel,
                  ]}
                >
                  {getTabLabel(route.name)}
                </Text>
              )}

              {isCenterTab && (
                <Text
                  style={[
                    styles.tabLabel,
                    styles.centerLabel,
                    isFocused && styles.activeTabLabel,
                  ]}
                >
                  Request
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  barInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 6,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  centerTabItem: {
    top: -8,
  },
  centerBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 3,
    fontWeight: typography.weight.medium,
  },
  centerLabel: {
    marginTop: 2,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[700],
  },
  activeTabLabel: {
    color: colors.primary[500],
    fontWeight: typography.weight.bold,
  },
  inactiveTabLabel: {
    color: colors.neutral[400],
  },
  badgeContainer: {
    position: 'absolute',
    top: -3,
    right: -8,
    backgroundColor: colors.primary[500],
    minWidth: 15,
    height: 15,
    borderRadius: 7.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.neutral.white,
  },
  badgeText: {
    color: colors.neutral.white,
    fontSize: 9,
    fontWeight: typography.weight.bold,
  },
  requestDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.secondary[500],
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: colors.neutral.white,
  },
  requestDotText: {
    color: colors.neutral.white,
    fontSize: 8,
    fontWeight: typography.weight.black,
  },
});
