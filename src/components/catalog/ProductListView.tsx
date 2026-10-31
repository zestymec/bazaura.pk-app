import React, { useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text, TextInput } from '../common/AppText';
import { EmptyState } from '../common/ui';
import { ArrowUpDown, Search, SlidersHorizontal, X } from '../icons';
import { ProductGrid } from './ProductGrid';
import { FilterSheet, ListFilters, SortSheet, SORTS, countFilters } from './FilterSheet';
import { useProducts } from '../../api/hooks';
import { errorMessage } from '../../api/client';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import type { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii } from '../../theme/spacing';

/**
 * Search + filter + sort + infinite grid (FRONTEND.md §7.4).
 * `q` is sent only once it has 2+ characters, debounced 300 ms.
 */
export const ProductListView: React.FC<{
  initialFilters?: ListFilters;
  header?: React.ReactElement | null;
  /** Shown above results instead of the grid when there is no query (e.g. category tiles). */
  idleContent?: React.ReactElement | null;
  autoFocus?: boolean;
}> = ({ initialFilters = {}, header, idleContent, autoFocus }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [text, setText] = useState(initialFilters.q ?? '');
  const [filters, setFilters] = useState<ListFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const q = useDebouncedValue(text.trim(), 300);
  const query = useMemo<ListFilters>(() => ({ ...filters, q: q.length >= 2 ? q : undefined }), [filters, q]);
  const idle = !!idleContent && !query.q && countFilters(filters) === 0;

  const list = useProducts(query, !idle);
  const active = countFilters(filters);
  const sortLabel = SORTS.find((s) => s.value === (filters.sort ?? 'newest'))?.label ?? 'Newest';

  const toolbar = (
    <View>
      {header}
      <View style={styles.searchRow}>
        <View style={styles.search}>
          <Search size={18} color={colors.neutral[400]} />
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Search hoodies, jackets, shirts…"
            placeholderTextColor={colors.neutral[400]}
            style={styles.input}
            returnKeyType="search"
            autoFocus={autoFocus}
            autoCorrect={false}
          />
          {!!text && (
            <TouchableOpacity onPress={() => setText('')} hitSlop={10} accessibilityLabel="Clear search">
              <X size={16} color={colors.neutral[500]} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {text.trim().length === 1 && <Text style={styles.hint}>Type at least 2 letters to search</Text>}
      {!idle && (
        <View style={styles.tools}>
          <Text style={styles.count}>{list.isFetching && !list.isFetchingNextPage ? 'Loading…' : `${list.total} items`}</Text>
          <View style={styles.toolBtns}>
            <TouchableOpacity style={styles.toolBtn} onPress={() => setShowSort(true)}>
              <ArrowUpDown size={15} color={colors.neutral[800]} />
              <Text style={styles.toolText}>{sortLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.toolBtn, active > 0 && styles.toolBtnOn]} onPress={() => setShowFilters(true)}>
              <SlidersHorizontal size={15} color={active ? colors.neutral.white : colors.neutral[800]} />
              <Text style={[styles.toolText, active > 0 && { color: colors.neutral.white }]}>
                Filter{active ? ` · ${active}` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {idle && idleContent}
    </View>
  );

  return (
    <>
      <ProductGrid
        products={idle ? [] : list.items}
        loading={!idle && (list.isLoading || (list.isPlaceholderData && list.isFetching))}
        loadingMore={list.isFetchingNextPage}
        onEndReached={() => list.hasNextPage && !list.isFetchingNextPage && list.fetchNextPage()}
        refreshing={list.isRefetching && !list.isFetchingNextPage && !list.isPlaceholderData}
        onRefresh={idle ? undefined : () => list.refetch()}
        header={toolbar}
        empty={
          idle ? null : list.isError ? (
            <EmptyState title="Couldn't load products" message={errorMessage(list.error)} actionLabel="Try again" onAction={() => list.refetch()} />
          ) : (
            <EmptyState
              icon={Search}
              title="Nothing found"
              message="Try another search or clear filters. Can't find it? We can arrange it for you."
              actionLabel="Request it"
              onAction={() => navigation.navigate('RequestForm', { type: 'CUSTOM_ITEM', itemName: text.trim() || undefined })}
            />
          )
        }
      />
      <FilterSheet visible={showFilters} value={filters} onApply={setFilters} onClose={() => setShowFilters(false)} />
      <SortSheet
        visible={showSort}
        value={filters.sort ?? 'newest'}
        onChange={(sort) => setFilters((f) => ({ ...f, sort }))}
        onClose={() => setShowSort(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  searchRow: { paddingHorizontal: 16, paddingTop: 12 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.neutral[100],
    borderRadius: radii.full,
    paddingHorizontal: 14,
    height: 46,
  },
  input: { flex: 1, fontSize: 15, color: colors.neutral[900], paddingVertical: 0 },
  hint: { fontSize: 12, color: colors.neutral[500], paddingHorizontal: 30, marginTop: 6 },
  tools: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  count: { fontSize: 13, color: colors.neutral[500], fontWeight: typography.weight.semibold },
  toolBtns: { flexDirection: 'row', gap: 8 },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radii.full,
    paddingHorizontal: 12,
    height: 36,
    backgroundColor: colors.neutral.white,
  },
  toolBtnOn: { backgroundColor: colors.neutral[900], borderColor: colors.neutral[900] },
  toolText: { fontSize: 13, fontWeight: typography.weight.semibold, color: colors.neutral[800] },
});
