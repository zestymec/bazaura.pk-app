import React from 'react';
import { Alert, Image, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/common/AppText';
import { Button } from '../../components/common/Button';
import { Card, Row } from '../../components/common/ui';
import { Gift, LogOut, MapPin, MessageCircle, Package, Pencil, Phone, Sparkles } from '../../components/icons';
import { useMe } from '../../api/hooks';
import { useAuthStore } from '../../store/auth';
import { logout } from '../../store/session';
import { env } from '../../config/env';
import type { RootStackParamList } from '../../types/navigation';
import { formatPhone } from '../../utils/formatters';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const MARK = require('../../../assets/brand/mark.png');

export const AccountScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);
  useMe(); // keep the cached profile fresh

  const guard = (go: () => void, reason: string, then?: Parameters<typeof navigation.navigate>[0]) => {
    if (isLoggedIn) go();
    else navigation.navigate('Login', { reason, then: then as never });
  };

  const whatsapp = async () => {
    const text = encodeURIComponent('Hi Bazaura, I need help with');
    const app = `whatsapp://send?phone=${env.SUPPORT_WHATSAPP}&text=${text}`;
    try {
      await Linking.openURL((await Linking.canOpenURL(app)) ? app : `https://wa.me/${env.SUPPORT_WHATSAPP}?text=${text}`);
    } catch {
      Alert.alert('WhatsApp', `Message us on ${env.SUPPORT_PHONE}`);
    }
  };

  const confirmLogout = () =>
    Alert.alert('Log out?', 'Your bag stays saved on this phone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout() },
    ]);

  const initials = (user?.fullName ?? '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || 'B';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 32 }}>
      <Text style={styles.title}>Account</Text>

      {isLoggedIn && user ? (
        <Card style={styles.profile}>
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.initials}>{initials}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user.fullName || 'Add your name'}</Text>
            <Text style={styles.meta}>{formatPhone(user.phone)}</Text>
            {!!user.email && <Text style={styles.meta}>{user.email}</Text>}
          </View>
          <Button title="Edit" variant="secondary" size="sm" icon={<Pencil size={13} color={colors.neutral[900]} />} onPress={() => navigation.navigate('EditProfile')} />
        </Card>
      ) : (
        <Card style={styles.guest}>
          <Image source={MARK} style={styles.mark} resizeMode="contain" />
          <Text style={styles.guestTitle}>Welcome to Bazaura</Text>
          <Text style={styles.guestSub}>Log in to track orders, save addresses and request items.</Text>
          <Button title="Log in / Sign up" size="lg" onPress={() => navigation.navigate('Login')} style={{ alignSelf: 'stretch', marginTop: 14 }} />
        </Card>
      )}

      <Card style={styles.group}>
        <Row icon={Package} title="My orders" onPress={() => guard(() => navigation.navigate('Orders'), 'Log in to see your orders.', { name: 'Orders' } as never)} />
        <Row icon={MapPin} title="Addresses" onPress={() => guard(() => navigation.navigate('Addresses'), 'Log in to manage addresses.', { name: 'Addresses' } as never)} />
        <Row icon={Sparkles} title="My requests" subtitle="Custom items & gifts" onPress={() => guard(() => navigation.navigate('Requests'), 'Log in to see your requests.', { name: 'Requests' } as never)} />
      </Card>

      <Card style={styles.group}>
        <Row icon={Gift} title="Send a gift" onPress={() => navigation.navigate('RequestForm', { type: 'GIFT' })} />
        <Row icon={Sparkles} title="Request an item" subtitle="Can't find it? We'll arrange it" onPress={() => navigation.navigate('RequestForm', { type: 'CUSTOM_ITEM' })} />
      </Card>

      <Card style={styles.group}>
        <Row icon={MessageCircle} title="WhatsApp us" subtitle="Quick help with orders" onPress={whatsapp} />
        <Row
          icon={Phone}
          title="Call support"
          subtitle={env.SUPPORT_PHONE}
          onPress={() => Linking.openURL(`tel:${env.SUPPORT_PHONE.replace(/\s/g, '')}`).catch(() => {})}
        />
      </Card>

      {isLoggedIn && (
        <Card style={styles.group}>
          <Row icon={LogOut} title="Log out" danger onPress={confirmLogout} />
        </Card>
      )}

      <Text style={styles.version}>Bazaura v{env.APP_VERSION}{env.USE_MOCK_API ? ' · Demo data' : ''}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface.background },
  title: { fontSize: 28, fontWeight: typography.weight.bold, color: colors.neutral[900], paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 },
  profile: { marginHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.neutral[100] },
  avatarFallback: { backgroundColor: colors.primary[100], alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 20, fontWeight: typography.weight.bold, color: colors.primary[700] },
  name: { fontSize: 17, fontWeight: typography.weight.bold, color: colors.neutral[900] },
  meta: { fontSize: 13, color: colors.neutral[500], marginTop: 2 },
  guest: { marginHorizontal: 16, alignItems: 'center', backgroundColor: colors.secondary[100], borderColor: colors.secondary[200] },
  mark: { width: 44, height: 54, marginBottom: 8 },
  guestTitle: { fontSize: 20, fontWeight: typography.weight.bold, color: colors.neutral[900] },
  guestSub: { fontSize: 13.5, color: colors.neutral[600], textAlign: 'center', marginTop: 4, lineHeight: 19 },
  group: { marginHorizontal: 16, marginTop: 14, paddingVertical: 2 },
  version: { textAlign: 'center', fontSize: 12, color: colors.neutral[400], marginTop: 24 },
});
