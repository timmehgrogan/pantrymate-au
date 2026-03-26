import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Modal,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { PantryCategory, PantryItem } from '@/types';
import { usePantry } from '@/hooks/usePantry';
import { CategorySection } from '@/components/pantry/CategorySection';
import { AddItemModal } from '@/components/pantry/AddItemModal';

const CATEGORIES: { key: PantryCategory; label: string; icon: string; color: string }[] = [
  { key: 'fridge', label: 'Fridge', icon: '🌡️', color: '#3B82F6' },
  { key: 'freezer', label: 'Freezer', icon: '❄️', color: '#6366F1' },
  { key: 'pantry', label: 'Pantry', icon: '🥫', color: '#F59E0B' },
];

export default function PantryScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { items, addItem, removeItem, updateQuantity } = usePantry();

  const [selectedCategory, setSelectedCategory] = useState<PantryCategory | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const itemsByCategory = CATEGORIES.reduce<Record<PantryCategory, PantryItem[]>>(
    (acc, cat) => {
      acc[cat.key] = filteredItems.filter((i) => i.category === cat.key);
      return acc;
    },
    { fridge: [], freezer: [], pantry: [] }
  );

  const totalItems = items.length;
  const expiringSoon = items.filter((item) => {
    if (!item.expiry_date) return false;
    const daysLeft = Math.ceil(
      (new Date(item.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysLeft <= 3 && daysLeft >= 0;
  }).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Stats banner */}
      <View style={[styles.statsBanner, { backgroundColor: theme.tint }]}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalItems}</Text>
          <Text style={styles.statLabel}>Items</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, expiringSoon > 0 && styles.statWarning]}>
            {expiringSoon}
          </Text>
          <Text style={styles.statLabel}>Expiring Soon</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{CATEGORIES.length}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
      </View>

      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="search" size={18} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search pantry..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        <TouchableOpacity
          style={[
            styles.filterPill,
            { borderColor: theme.border, backgroundColor: theme.surface },
            selectedCategory === 'all' && { backgroundColor: theme.tint, borderColor: theme.tint },
          ]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text
            style={[
              styles.filterPillText,
              { color: theme.textSecondary },
              selectedCategory === 'all' && { color: '#fff' },
            ]}
          >
            All ({totalItems})
          </Text>
        </TouchableOpacity>
        {CATEGORIES.map((cat) => {
          const count = items.filter((i) => i.category === cat.key).length;
          const isActive = selectedCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.filterPill,
                { borderColor: cat.color, backgroundColor: theme.surface },
                isActive && { backgroundColor: cat.color },
              ]}
              onPress={() => setSelectedCategory(cat.key)}
            >
              <Text style={styles.filterPillEmoji}>{cat.icon}</Text>
              <Text
                style={[
                  styles.filterPillText,
                  { color: isActive ? '#fff' : cat.color },
                ]}
              >
                {cat.label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Items list */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {selectedCategory === 'all' ? (
          CATEGORIES.map((cat) =>
            itemsByCategory[cat.key].length > 0 ? (
              <CategorySection
                key={cat.key}
                category={cat}
                items={itemsByCategory[cat.key]}
                onRemove={removeItem}
                onUpdateQuantity={updateQuantity}
                theme={theme}
              />
            ) : null
          )
        ) : (
          <CategorySection
            category={CATEGORIES.find((c) => c.key === selectedCategory)!}
            items={filteredItems}
            onRemove={removeItem}
            onUpdateQuantity={updateQuantity}
            theme={theme}
          />
        )}

        {filteredItems.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🥬</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {searchQuery ? 'No items found' : 'Pantry is empty'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              {searchQuery
                ? `No items match "${searchQuery}"`
                : 'Add items by tapping + or scanning a barcode'}
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.tint }]}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add Item Modal */}
      <AddItemModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addItem}
        theme={theme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsBanner: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: '800', color: '#fff' },
  statWarning: { color: '#FEF08A' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.3)' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  filterScroll: { maxHeight: 52 },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 4,
  },
  filterPillEmoji: { fontSize: 14 },
  filterPillText: { fontSize: 13, fontWeight: '600' },
  scrollView: { flex: 1 },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
