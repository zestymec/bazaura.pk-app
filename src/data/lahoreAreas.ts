export interface LahoreDeliveryZone {
  id: string;
  name: string;
  postalCode: string;
  estimatedMinutes: number; // e.g. 45 to 110 mins
  isExpressAvailable: boolean;
  hubLocation: string;
}

export const LAHORE_DELIVERY_ZONES: LahoreDeliveryZone[] = [
  { id: 'gulberg', name: 'Gulberg (I, II, III, Main Market)', postalCode: '54660', estimatedMinutes: 45, isExpressAvailable: true, hubLocation: 'Central Lahore Hub' },
  { id: 'dha_phase1_5', name: 'DHA (Phase 1, 2, 3, 4, 5)', postalCode: '54792', estimatedMinutes: 50, isExpressAvailable: true, hubLocation: 'DHA Express Hub' },
  { id: 'dha_phase6_8', name: 'DHA (Phase 6, 7, 8, Raya)', postalCode: '54793', estimatedMinutes: 65, isExpressAvailable: true, hubLocation: 'DHA Express Hub' },
  { id: 'model_town', name: 'Model Town (Blocks A to M)', postalCode: '54700', estimatedMinutes: 50, isExpressAvailable: true, hubLocation: 'Central Lahore Hub' },
  { id: 'johar_town', name: 'Johar Town (Phase 1 & 2)', postalCode: '54770', estimatedMinutes: 55, isExpressAvailable: true, hubLocation: 'West Lahore Hub' },
  { id: 'cantt', name: 'Lahore Cantt & Saddar', postalCode: '54810', estimatedMinutes: 60, isExpressAvailable: true, hubLocation: 'Cantt Express Hub' },
  { id: 'faisal_town', name: 'Faisal Town & Garden Town', postalCode: '54600', estimatedMinutes: 45, isExpressAvailable: true, hubLocation: 'Central Lahore Hub' },
  { id: 'bahria_town', name: 'Bahria Town (Sectors A to F)', postalCode: '53720', estimatedMinutes: 85, isExpressAvailable: true, hubLocation: 'South Lahore Hub' },
  { id: 'wapda_town', name: 'Wapda Town & PCSIR', postalCode: '54770', estimatedMinutes: 65, isExpressAvailable: true, hubLocation: 'West Lahore Hub' },
  { id: 'lake_city', name: 'Lake City & Raiwind Road', postalCode: '55150', estimatedMinutes: 90, isExpressAvailable: true, hubLocation: 'South Lahore Hub' },
  { id: 'allama_iqbal_town', name: 'Allama Iqbal Town & Wahdat Rd', postalCode: '54570', estimatedMinutes: 60, isExpressAvailable: true, hubLocation: 'West Lahore Hub' },
  { id: 'shadman', name: 'Shadman & Jail Road', postalCode: '54000', estimatedMinutes: 40, isExpressAvailable: true, hubLocation: 'Central Lahore Hub' },
  { id: 'mall_road', name: 'Mall Road & Anarkali', postalCode: '54000', estimatedMinutes: 55, isExpressAvailable: true, hubLocation: 'Central Lahore Hub' },
];

export const OTHER_MAJOR_PAKISTAN_CITIES = [
  { name: 'Karachi', deliveryDays: '2-3 Days', province: 'Sindh' },
  { name: 'Islamabad', deliveryDays: '1-2 Days', province: 'Federal' },
  { name: 'Rawalpindi', deliveryDays: '1-2 Days', province: 'Punjab' },
  { name: 'Faisalabad', deliveryDays: '1-2 Days', province: 'Punjab' },
  { name: 'Multan', deliveryDays: '2 Days', province: 'Punjab' },
  { name: 'Peshawar', deliveryDays: '2-3 Days', province: 'KPK' },
  { name: 'Quetta', deliveryDays: '3-4 Days', province: 'Balochistan' },
  { name: 'Sialkot', deliveryDays: '1-2 Days', province: 'Punjab' },
  { name: 'Gujranwala', deliveryDays: '1-2 Days', province: 'Punjab' },
];
