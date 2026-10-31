import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { Text } from '../common/AppText';
import { Button } from '../common/Button';
import { Chip, Sheet } from '../common/ui';
import type { ProductFilters } from '../../api/endpoints';
import type { ProductSort, Season } from '../../api/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export type ListFilters = Omit<ProductFilters, 'page' | 'limit'>;

const SIZES = ['S', 'M', 'L', 'XL', '30', '32', '34', '36'];
const COLORS = ['Black', 'White', 'Grey', 'Navy', 'Beige', 'Olive', 'Maroon'];
const PRICES: { label: string; min?: number; max?: number }[] = [
  { label: 'Under Rs. 2,000', max: 1999 },
  { label: 'Rs. 2,000 – 4,000', min: 2000, max: 4000 },
  { label: 'Rs. 4,000 – 7,000', min: 4000, max: 7000 },
  { label: 'Over Rs. 7,000', min: 7000 },
];
const SEASONS: { label: string; value: Season }[] = [
  { label: 'Summer', value: 'SUMMER' },
  { label: 'Winter', value: 'WINTER' },
  { label: 'All season', value: 'ALL_SEASON' },
];

export const SORTS: { label: string; value: ProductSort }[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Popular', value: 'popular' },
  { label: 'Price: low to high', value: 'price_asc' },
  { label: 'Price: high to low', value: 'price_desc' },
  { label: 'Top rated', value: 'rating' },
];

/** Number of active filters, for the badge on the Filter button. */
export function countFilters(f: ListFilters) {
  return (
    (f.size?.length ?? 0) +
    (f.color?.length ?? 0) +
    (f.minPrice != null || f.maxPrice != null ? 1 : 0) +
    (f.season ? 1 : 0) +
    (f.express ? 1 : 0) +
    (f.inStock ? 1 : 0) +
    (f.onSale ? 1 : 0)
  );
}

const toggle = (list: string[] | undefined, v: string) =>
  list?.includes(v) ? list.filter((x) => x !== v) : [...(list ?? []), v];

export const FilterSheet: React.FC<{
  visible: boolean;
  value: ListFilters;
  onApply: (f: ListFilters) => void;
  onClose: () => void;
}> = ({ visible, value, onApply, onClose }) => {
  const [draft, setDraft] = useState<ListFilters>(value);
  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const set = (patch: Partial<ListFilters>) => setDraft((d) => ({ ...d, ...patch }));
  const reset = () =>
    setDraft((d) => ({ category: d.category, q: d.q, sort: d.sort, gender: d.gender, featured: d.featured }));

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Filters"
      footer={
        <View style={styles.footer}>
          <Button title="Clear" variant="outline" onPress={reset} style={styles.footerBtn} />
          <Button
            title="Show results"
            onPress={() => {
              onApply(draft);
              onClose();
            }}
            style={[styles.footerBtn, { flex: 2 }]}
          />
        </View>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Size</Text>
        <View style={styles.wrap}>
          {SIZES.map((sz) => (
            <Chip key={sz} label={sz} selected={draft.size?.includes(sz)} onPress={() => set({ size: toggle(draft.size, sz) })} />
          ))}
        </View>

        <Text style={styles.label}>Colour</Text>
        <View style={styles.wrap}>
          {COLORS.map((c) => (
            <Chip key={c} label={c} selected={draft.color?.includes(c)} onPress={() => set({ color: toggle(draft.color, c) })} />
          ))}
        </View>

        <Text style={styles.label}>Price</Text>
        <View style={styles.wrap}>
          {PRICES.map((p) => {
            const on = draft.minPrice === p.min && draft.maxPrice === p.max;
            return (
              <Chip
                key={p.label}
                label={p.label}
                selected={on}
                onPress={() => set(on ? { minPrice: undefined, maxPrice: undefined } : { minPrice: p.min, maxPrice: p.max })}
              />
            );
          })}
        </View>

        <Text style={styles.label}>Season</Text>
        <View style={styles.wrap}>
          {SEASONS.map((sn) => (
            <Chip
              key={sn.value}
              label={sn.label}
              selected={draft.season === sn.value}
              onPress={() => set({ season: draft.season === sn.value ? undefined : sn.value })}
            />
          ))}
        </View>

        {(
          [
            ['express', 'Express delivery only'],
            ['inStock', 'In stock only'],
            ['onSale', 'On sale'],
          ] as const
        ).map(([key, label]) => (
          <View key={key} style={styles.switchRow}>
            <Text style={styles.switchLabel}>{label}</Text>
            <Switch
              value={!!draft[key]}
              onValueChange={(v) => set({ [key]: v || undefined })}
              trackColor={{ true: colors.primary[500], false: colors.neutral[200] }}
              thumbColor={colors.neutral.white}
            />
          </View>
        ))}
        <View style={{ height: 12 }} />
      </ScrollView>
    </Sheet>
  );
};

export const SortSheet: React.FC<{
  visible: boolean;
  value: ProductSort;
  onChange: (s: ProductSort) => void;
  onClose: () => void;
}> = ({ visible, value, onChange, onClose }) => (
  <Sheet visible={visible} onClose={onClose} title="Sort by">
    <View style={{ paddingBottom: 8 }}>
      {SORTS.map((s) => (
        <Chip
          key={s.value}
          label={s.label}
          selected={value === s.value}
          onPress={() => {
            onChange(s.value);
            onClose();
          }}
          style={styles.sortChip}
        />
      ))}
    </View>
  </Sheet>
);

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: typography.weight.bold, color: colors.neutral[900], marginTop: 8, marginBottom: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  switchLabel: { fontSize: 14, fontWeight: typography.weight.semibold, color: colors.neutral[800] },
  footer: { flexDirection: 'row', gap: 10, paddingTop: 12 },
  footerBtn: { flex: 1 },
  sortChip: { justifyContent: 'center', marginBottom: 8, height: 46 },
});
