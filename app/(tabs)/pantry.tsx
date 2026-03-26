import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { PantryCategory, PantryItem } from '@/types';
import { usePantry } from '@/hooks/usePantry';
import { CategorySection } from '@/components/pantry/CategorySection';
import { AddItemModal } from '@/components/pantry/AddItemModal';
import { getFoodEmoji } from '@/constants/foodEmojis';

const CATEGORIES: { key: PantryCategory; label: string; icon: string; color: string }[] = [
  { key: 'fridge', label: 'Fridge', icon: '🌡️', color: '#3B82F6' },
  { key: 'freezer', label: 'Freezer', icon: '❄️', color: '#6366F1' },
  { key: 'pantry', label: 'Pantry', icon: '🥫', color: '#5B7A5A' },
];

function getDaysUntilExpiry(expiryDate?: string): number | null {
  if (!expiryDate) return null;
  return Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function ExpiringItemCard({
  item,
  theme,
}: {
  item: PantryItem;
  theme: Record<string, string>;
}) {
  const daysLeft = getDaysUntilExpiry(item.expiry_date)!;
  const emoji = getFoodEmoji(item.name);
  const isExpired = daysLeft < 0;
  const isToday = daysLeft === 0;
  const isSoon = daysLeft <= 3;

  let badgeColor = theme.expirySoon;
  let badgeLabel = `${daysLeft} days`;
  if (isExpired) { badgeColor = theme.expired; badgeLabel = 'Expired'; }
  else if (isToday || isSoon) { badgeColor = theme.expired; badgeLabel = 'Expiring soon'; }

  return (
    <View style={[styles.expiringCard, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}>
      <View style={[styles.expiringEmoji, { backgroundColor: theme.background }]}>
        <Text style={styles.expiringEmojiText}>{emoji}</Text>
      </View>
      <View style={styles.expiringMiddle}>
        <Text style={[styles.expiringName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.expiringQty, { color: theme.textSecondary }]}>
          ({item.quantity}{item.unit})
        </Text>
      </View>
      <View style={styles.expiringRight}>
        {isSoon || isExpired || isToday ? (
          <View style={styles.expiringSoonRow}>
            <View style={[styles.expiringSoonDot, { backgroundColor: badgeColor }]} />
            <Text style={[styles.expirySoonText, { color: badgeColor }]}>{badgeLabel}</Text>
          </View>
        ) : (
          <View style={[styles.daysChip, { backgroundColor: `${badgeColor}18` }]}>
            <Ionicons name="calendar-outline" size={11} color={badgeColor} />
            <Text style={[styles.daysChipText, { color: badgeColor }]}>{badgeLabel}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function PantryScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { items, addItem, removeItem, updateQuantity } = usePantry();

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = searchQuery
    ? items.filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : items;

  // Items expiring within 7 days (for the pinned top section)
  const expiringItems = items
    .filter((item) => {
      const d = getDaysUntilExpiry(item.expiry_date);
      return d !== null && d <= 7;
    })
    .sort((a, b) => {
      const da = getDaysUntilExpiry(a.expiry_date) ?? 999;
      const db = getDaysUntilExpiry(b.expiry_date) ?? 999;
      return da - db;
    });

  const itemsByCategory = CATEGORIES.reduce<Record<PantryCategory, PantryItem[]>>(
    (acc, cat) => {
      acc[cat.key] = filteredItems.filter((i) => i.category === cat.key);
      return acc;
    },
    { fridge: [], freezer: [], pantry: [] }
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Screen title + search */}
      <View style={[styles.titleBar, { backgroundColor: theme.surface }]}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Your Kitchen Pantry</Text>
        <View style={[styles.searchBar, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <Ionicons name="search" size={16} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Expiring soon section */}
        {expiringItems.length > 0 && !searchQuery && (
          <View style={styles.expiringSection}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              USE SOON
            </Text>
            {expiringItems.map((item) => (
              <ExpiringItemCard key={item.id} item={item} theme={theme} />
            ))}
          </View>
        )}

        {/* Category accordions */}
        {CATEGORIES.map((cat) => (
          <CategorySection
            key={cat.key}
            category={cat}
            items={itemsByCategory[cat.key]}
            onRemove={removeItem}
            onUpdateQuantity={updateQuantity}
            theme={theme}
            defaultExpanded={cat.key === 'pantry'}
          />
        ))}

        {filteredItems.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🥬</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {searchQuery ? 'No items found' : 'Your pantry is empty'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              {searchQuery
                ? `Nothing matches "${searchQuery}"`
                : 'Tap + Add Item or scan a barcode to get started'}
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom action bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.bottomBtn, { backgroundColor: theme.tint }]}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.bottomBtnText}>ADD ITEM</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomBtn, { backgroundColor: theme.accent }]}
          onPress={() => router.push('/(tabs)/scan')}
          activeOpacity={0.85}
        >
          <Ionicons name="barcode-outline" size={18} color="#fff" />
          <Text style={styles.bottomBtnText}>BARCODE SCAN</Text>
        </TouchableOpacity>
      </View>

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
  titleBar: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 10,
  },
  screenTitle: { fontSize: 22, fontWeight: '800' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14 },
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 12 },
  expiringSection: { marginBottom: 8, paddingHorizontal: 16 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },
  expiringCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    gap: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  expiringEmoji: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expiringEmojiText: { fontSize: 24 },
  expiringMiddle: { flex: 1, gap: 2 },
  expiringName: { fontSize: 15, fontWeight: '600' },
  expiringQty: { fontSize: 12 },
  expiringRight: { alignItems: 'flex-end' },
  expiringSoonRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  expiringSoonDot: { width: 7, height: 7, borderRadius: 4 },
  expirySoonText: { fontSize: 11, fontWeight: '600' },
  daysChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  daysChipText: { fontSize: 11, fontWeight: '600' },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    gap: 10,
  },
  bottomBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 7,
  },
  bottomBtnText: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
});
