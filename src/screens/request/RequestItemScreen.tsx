import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Sparkles,
  Zap,
  UploadCloud,
  CheckCircle2,
  Clock,
  ChevronRight,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  Link2,
} from 'lucide-react-native';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { CATEGORIES } from '../../data/categories';
import { useRequestStore } from '../../store/useRequestStore';
import { useUserStore } from '../../store/useUserStore';
import { RequestStatus } from '../../types/request';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, shadows } from '../../theme/spacing';
import { formatPKR, formatDateTime } from '../../utils/formatters';
import { isValidPakistaniPhone } from '../../utils/validation';
import { haptic } from '../../utils/haptics';

export const RequestItemScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { requests, submitRequest, acceptQuote } = useRequestStore();
  const { user } = useUserStore();

  const [activeTab, setActiveTab] = useState<'NEW_REQUEST' | 'MY_REQUESTS'>('NEW_REQUEST');

  // Form State
  const [itemName, setItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].name);
  const [brandOrModel, setBrandOrModel] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'LAHORE_2HR_EXPRESS' | 'STANDARD_NATIONWIDE'>('LAHORE_2HR_EXPRESS');
  const [contactPhone, setContactPhone] = useState(user.phone || '03001234567');
  const [deliveryAddress, setDeliveryAddress] = useState(
    user.addresses[0]?.addressLine1 ? `${user.addresses[0].addressLine1}, ${user.addresses[0].area}` : 'Main Boulevard, Gulberg III'
  );
  const [city, setCity] = useState(user.selectedCity || 'Lahore');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const samplePhotoUrls = [
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&auto=format&fit=crop&q=80',
  ];

  const handleSimulatePhotoUpload = () => {
    haptic.selection();
    const randomImg = samplePhotoUrls[Math.floor(Math.random() * samplePhotoUrls.length)];
    setAttachedImage(randomImg);
  };

  const handleSubmit = () => {
    if (!itemName.trim()) {
      Alert.alert('Required Field', 'Please enter the item name or description you want us to source.');
      return;
    }

    if (!contactPhone.trim() || !isValidPakistaniPhone(contactPhone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid Pakistani contact phone number (e.g. 03001234567).');
      return;
    }

    if (!deliveryAddress.trim()) {
      Alert.alert('Required Address', 'Please provide your delivery address.');
      return;
    }

    setIsSubmitting(true);
    haptic.medium();

    setTimeout(() => {
      submitRequest({
        itemName: itemName.trim(),
        category: selectedCategory,
        brandOrModel: brandOrModel.trim() || undefined,
        expectedPrice: expectedPrice ? parseFloat(expectedPrice) : undefined,
        referenceUrl: referenceUrl.trim() || undefined,
        description: description.trim() || 'Custom item requested via Bazaura Sourcing Concierge.',
        imageUris: attachedImage ? [attachedImage] : [],
        urgency,
        contactPhone: contactPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        city,
      });

      setIsSubmitting(false);
      setItemName('');
      setBrandOrModel('');
      setExpectedPrice('');
      setReferenceUrl('');
      setDescription('');
      setAttachedImage(null);

      setActiveTab('MY_REQUESTS');
    }, 600);
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'SUBMITTED':
        return <Badge label="Received" variant="outline" size="sm" />;
      case 'SOURCING_IN_PROGRESS':
        return <Badge label="Sourcing..." variant="warning" size="sm" />;
      case 'PRICE_QUOTED':
        return <Badge label="Quote Ready" variant="express" size="sm" />;
      case 'CONFIRMED':
        return <Badge label="Confirmed" variant="success" size="sm" />;
      case 'OUT_FOR_DELIVERY':
        return <Badge label="Dispatched" variant="express" size="sm" />;
      case 'DELIVERED':
        return <Badge label="Delivered" variant="success" size="sm" />;
      default:
        return <Badge label={status} variant="outline" size="sm" />;
    }
  };

  return (
    <View style={[styles.screenContainer, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Sourcing Concierge</Text>
          <Text style={styles.headerSubtitle}>We source & deliver unlisted products</Text>
        </View>

        {/* Segmented Tab Control */}
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              haptic.selection();
              setActiveTab('NEW_REQUEST');
            }}
            style={[
              styles.segmentBtn,
              activeTab === 'NEW_REQUEST' && styles.segmentBtnActive,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                activeTab === 'NEW_REQUEST' && styles.segmentTextActive,
              ]}
            >
              New Request
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              haptic.selection();
              setActiveTab('MY_REQUESTS');
            }}
            style={[
              styles.segmentBtn,
              activeTab === 'MY_REQUESTS' && styles.segmentBtnActive,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                activeTab === 'MY_REQUESTS' && styles.segmentTextActive,
              ]}
            >
              My Requests ({requests.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* NEW REQUEST FORM */}
        {activeTab === 'NEW_REQUEST' && (
          <View style={styles.formCard}>
            {/* Minimalist Info Row */}
            <View style={styles.infoBanner}>
              <Sparkles size={14} color={colors.secondary[700]} />
              <Text style={styles.infoText}>
                Describe any product. Our Lahore procurement team will check wholesalers and send you a verified PKR quote.
              </Text>
            </View>

            {/* Input: Item Name */}
            <Input
              label="Item Name & Specification"
              placeholder="e.g. Sony PS5 DualSense Edge, Dyson Airwrap..."
              value={itemName}
              onChangeText={setItemName}
              required
              leftIcon={<FileText size={16} color={colors.neutral[400]} />}
            />

            {/* Category Selector Chips */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    activeOpacity={0.75}
                    onPress={() => {
                      haptic.selection();
                      setSelectedCategory(cat.name);
                    }}
                    style={[
                      styles.categoryPill,
                      selectedCategory === cat.name && styles.categoryPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryPillText,
                        selectedCategory === cat.name && styles.categoryPillTextActive,
                      ]}
                    >
                      {cat.name.split('&')[0].trim()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Brand & Expected Price */}
            <View style={styles.rowFields}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Input
                  label="Brand / Model (Optional)"
                  placeholder="e.g. Sony, Nike"
                  value={brandOrModel}
                  onChangeText={setBrandOrModel}
                />
              </View>

              <View style={{ flex: 1, marginLeft: 6 }}>
                <Input
                  label="Target Budget (PKR)"
                  placeholder="e.g. 25000"
                  keyboardType="numeric"
                  value={expectedPrice}
                  onChangeText={setExpectedPrice}
                  leftIcon={<DollarSign size={14} color={colors.neutral[400]} />}
                />
              </View>
            </View>

            {/* Reference URL */}
            <Input
              label="Reference URL / Link (Optional)"
              placeholder="Paste Amazon, Daraz, or product link..."
              value={referenceUrl}
              onChangeText={setReferenceUrl}
              leftIcon={<Link2 size={16} color={colors.neutral[400]} />}
            />

            {/* Photo Upload Area */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Photo / Reference Screenshot</Text>
              {attachedImage ? (
                <View style={styles.previewBox}>
                  <Image source={{ uri: attachedImage }} style={styles.previewImage} />
                  <TouchableOpacity
                    onPress={() => setAttachedImage(null)}
                    style={styles.removeBtn}
                  >
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={handleSimulatePhotoUpload}
                  style={styles.uploadBox}
                >
                  <UploadCloud size={20} color={colors.neutral[500]} />
                  <Text style={styles.uploadText}>Attach sample photo or screenshot</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Delivery Urgency Segmented Selector */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Sourcing & Delivery Urgency</Text>
              <View style={styles.urgencySegmentRow}>
                {/* 2-Hour Lahore */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    haptic.selection();
                    setUrgency('LAHORE_2HR_EXPRESS');
                  }}
                  style={[
                    styles.urgencySegment,
                    urgency === 'LAHORE_2HR_EXPRESS' && styles.urgencySegmentActive,
                  ]}
                >
                  <Zap size={14} color={urgency === 'LAHORE_2HR_EXPRESS' ? colors.primary[500] : colors.neutral[500]} fill={urgency === 'LAHORE_2HR_EXPRESS' ? colors.primary[500] : 'transparent'} />
                  <View style={{ marginLeft: 6 }}>
                    <Text style={[styles.urgencyTitle, urgency === 'LAHORE_2HR_EXPRESS' && styles.urgencyTitleActive]}>
                      2-Hour Lahore
                    </Text>
                    <Text style={styles.urgencySub}>Priority express</Text>
                  </View>
                </TouchableOpacity>

                {/* Nationwide Standard */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    haptic.selection();
                    setUrgency('STANDARD_NATIONWIDE');
                  }}
                  style={[
                    styles.urgencySegment,
                    urgency === 'STANDARD_NATIONWIDE' && styles.urgencySegmentActive,
                  ]}
                >
                  <Clock size={14} color={urgency === 'STANDARD_NATIONWIDE' ? colors.primary[500] : colors.neutral[500]} />
                  <View style={{ marginLeft: 6 }}>
                    <Text style={[styles.urgencyTitle, urgency === 'STANDARD_NATIONWIDE' && styles.urgencyTitleActive]}>
                      2-3 Days
                    </Text>
                    <Text style={styles.urgencySub}>Standard courier</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Contact Phone & Address */}
            <Input
              label="Contact Phone"
              placeholder="03001234567"
              keyboardType="phone-pad"
              value={contactPhone}
              onChangeText={setContactPhone}
              required
              leftIcon={<Phone size={16} color={colors.neutral[400]} />}
            />

            <Input
              label="Delivery Address"
              placeholder="House, Street, Area, City"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              required
              leftIcon={<MapPin size={16} color={colors.neutral[400]} />}
            />

            {/* Submit Button */}
            <Button
              title="Submit Sourcing Request"
              onPress={handleSubmit}
              loading={isSubmitting}
              size="lg"
              variant="primary"
              style={{ marginTop: 6 }}
            />
          </View>
        )}

        {/* MY REQUESTS LIST */}
        {activeTab === 'MY_REQUESTS' && (
          <View>
            {requests.length === 0 ? (
              <View style={styles.emptyCard}>
                <Sparkles size={32} color={colors.neutral[300]} />
                <Text style={styles.emptyTitle}>No Requests Yet</Text>
                <Text style={styles.emptySub}>
                  Submit a request for any custom product and track quotes here.
                </Text>
                <Button
                  title="Make a Request"
                  onPress={() => setActiveTab('NEW_REQUEST')}
                  size="md"
                  variant="primary"
                  style={{ marginTop: 14 }}
                />
              </View>
            ) : (
              <View>
                {requests.map((req) => (
                  <View key={req.id} style={styles.requestCard}>
                    <View style={styles.reqHeader}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.reqName}>{req.itemName}</Text>
                        <Text style={styles.reqCategory}>{req.category} • {formatDateTime(req.createdAt)}</Text>
                      </View>
                      {getStatusBadge(req.status)}
                    </View>

                    {req.quote && (
                      <View style={styles.quoteBox}>
                        <View style={styles.quoteRow}>
                          <Text style={styles.quoteTitle}>Bazaura Price Quote</Text>
                          <Text style={styles.quotePrice}>{formatPKR(req.quote.quotedPrice)}</Text>
                        </View>
                        <Text style={styles.quoteNotes}>{req.quote.notes}</Text>

                        {req.status === 'PRICE_QUOTED' && (
                          <Button
                            title="Accept Quote & Order"
                            onPress={() => acceptQuote(req.id)}
                            size="sm"
                            variant="primary"
                            icon={<CheckCircle2 size={14} color={colors.neutral.white} />}
                            style={{ marginTop: 8 }}
                          />
                        )}
                      </View>
                    )}

                    {/* Minimal Timeline */}
                    <View style={styles.timelineList}>
                      {req.statusTimeline.map((step, sIdx) => (
                        <View key={sIdx} style={styles.timelineRow}>
                          <View style={styles.timelineDot} />
                          <View style={styles.timelineContent}>
                            <View style={styles.timelineTitleRow}>
                              <Text style={styles.timelineStepLabel}>{step.label}</Text>
                              <Text style={styles.timelineTimestamp}>{step.timestamp}</Text>
                            </View>
                            <Text style={styles.timelineStepDesc}>{step.description}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.surface.background,
  },
  topHeader: {
    backgroundColor: colors.neutral.white,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  headerTitleRow: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: typography.weight.black,
    color: colors.neutral[900],
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.neutral[500],
    marginTop: 1,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: radii.md,
    padding: 2,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
  },
  segmentBtnActive: {
    backgroundColor: colors.neutral.white,
    ...shadows.subtle,
  },
  segmentText: {
    fontSize: 11,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[600],
  },
  segmentTextActive: {
    color: colors.neutral[900],
    fontWeight: typography.weight.bold,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 28,
  },
  formCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadows.subtle,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.secondary[50],
    padding: 10,
    borderRadius: radii.md,
    gap: 8,
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    color: colors.neutral[700],
    lineHeight: 15,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[700],
    marginBottom: 6,
  },
  categoryScroll: {
    gap: 6,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.neutral[100],
    borderRadius: radii.full,
  },
  categoryPillActive: {
    backgroundColor: colors.neutral[900],
  },
  categoryPillText: {
    fontSize: 11,
    color: colors.neutral[700],
    fontWeight: typography.weight.medium,
  },
  categoryPillTextActive: {
    color: colors.neutral.white,
  },
  rowFields: {
    flexDirection: 'row',
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: radii.md,
    padding: 12,
    gap: 6,
  },
  uploadText: {
    fontSize: 11,
    color: colors.neutral[600],
    fontWeight: typography.weight.medium,
  },
  previewBox: {
    height: 100,
    borderRadius: radii.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.neutral[100],
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radii.xs,
  },
  removeText: {
    color: colors.neutral.white,
    fontSize: 10,
    fontWeight: typography.weight.bold,
  },
  urgencySegmentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  urgencySegment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: radii.md,
    padding: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  urgencySegmentActive: {
    backgroundColor: colors.neutral.white,
    borderColor: colors.primary[500],
    ...shadows.subtle,
  },
  urgencyTitle: {
    fontSize: 11,
    fontWeight: typography.weight.bold,
    color: colors.neutral[800],
  },
  urgencyTitleActive: {
    color: colors.primary[600],
  },
  urgencySub: {
    fontSize: 9,
    color: colors.neutral[400],
  },
  emptyCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: typography.weight.bold,
    color: colors.neutral[800],
    marginTop: 8,
  },
  emptySub: {
    fontSize: 11,
    color: colors.neutral[400],
    textAlign: 'center',
    marginTop: 4,
  },
  requestCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: radii.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surface.border,
    marginBottom: 12,
    ...shadows.subtle,
  },
  reqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reqName: {
    fontSize: 13,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  reqCategory: {
    fontSize: 10,
    color: colors.neutral[400],
    marginTop: 2,
  },
  quoteBox: {
    backgroundColor: colors.success.light,
    borderRadius: radii.md,
    padding: 10,
    marginBottom: 10,
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quoteTitle: {
    fontSize: 11,
    fontWeight: typography.weight.bold,
    color: colors.success.dark,
  },
  quotePrice: {
    fontSize: 14,
    fontWeight: typography.weight.black,
    color: colors.success.dark,
  },
  quoteNotes: {
    fontSize: 10,
    color: colors.success.dark,
    marginTop: 2,
  },
  timelineList: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    paddingTop: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  timelineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary[500],
    marginTop: 4,
    marginRight: 8,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineStepLabel: {
    fontSize: 11,
    fontWeight: typography.weight.bold,
    color: colors.neutral[800],
  },
  timelineTimestamp: {
    fontSize: 9,
    color: colors.neutral[400],
  },
  timelineStepDesc: {
    fontSize: 10,
    color: colors.neutral[500],
  },
});
