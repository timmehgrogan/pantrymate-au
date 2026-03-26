import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PantryItem, PantryCategory } from '@/types';
import { getFoodEmoji } from '@/constants/foodEmojis';

interface CategoryMeta {
  key: PantryCategory;
  label: string;
  icon: string;
  color: string;
}

interface Props {
  category: CategoryMeta;
  items: PantryItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  theme: Record<string, string>;
  defaultExpanded?: boolean;
}

function getDaysUntilExpiry(expiryDate?: string): number | null {
  if (!expiryDate) return null;
  return Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function ExpiryBadge({ daysLeft, theme }: { daysLeft: number | null; theme: Record<string, string> }) {
  if (daysLeft === null) return null;

  if (daysLeft < 0) {
    return (
      <View style={styles.expiryBadgeRow}>
        <View style={[styles.expiryDot, { backgroundColor: theme.expired }]} />
        <Text style={[styles.expiryBadgeText, { color: theme.expired }]}>Expired</Text>
      </View>
    );
  }
  if (daysLeft === 0) {
    return (
      <View style={styles.expiryBadgeRow}>
        <View style={[styles.expiryDot, { backgroundColor: theme.expired }]} />
        <Text style={[styles.expiryBadgeText, { color: theme.expired }]}>Expiring soon</Text>
      </View>
    );
  }
  if (daysLeft <= 3) {
    return (
      <View style={styles.expiryBadgeRow}>
        <View style={[styles.expiryDot, { backgroundColor: theme.expired }]} />
        <Text style={[styles.expiryBadgeText, { color: theme.expired }]}>Expiring soon</Text>
      </View>
    );
  }

  const color = daysLeft <= 7 ? theme.expirySoon : theme.fresh;
  return (
    <View style={[styles.daysBadge, { backgroundColor: `${color}18` }]}>
      <Ionicons name="calendar-outline" size={11} color={color} />
      <Text style={[styles.daysBadgeText, { color }]}>{daysLeft} days</Text>
    </View>
  );
}

export function CategorySection({ category, items, onRemove, onUpdateQuantity, theme, defaultExpanded = true }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      {/* Accordion header */}
      <TouchableOpacity
        style={[styles.accordionHeader, { backgroundColor: theme.surface }]}
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.7}
      >
        <Text style={styles.categoryIcon}>{category.icon}</Text>
        <Text style={[styles.categoryLabel, { color: theme.text }]}>{category.label}</Text>
        <Text style={[styles.categoryCount, { color: theme.textSecondary }]}>
          ({items.length} {items.length === 1 ? 'Item' : 'Items'})
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={theme.textSecondary}
          style={styles.chevron}
        />
      </TouchableOpacity>

      {/* Items */}
      {expanded && items.map((item) => {
        const daysLeft = getDaysUntilExpiry(item.expiry_date);
        const emoji = getFoodEmoji(item.name);
        return (
          <View
            key={item.id}
            style={[styles.itemCard, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}
          >
            {/* Food photo or emoji */}
            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                style={[styles.emojiCircle, styles.itemPhoto]}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.emojiCircle, { backgroundColor: theme.background }]}>
                <Text style={styles.emojiText}>{emoji}</Text>
              </View>
            )}

            {/* Name + brand + qty */}
            <View style={styles.itemMiddle}>
              <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.itemQty, { color: theme.textSecondary }]}>
                ({item.quantity}{item.unit})
                {item.brand ? ` · ${item.brand}` : ''}
              </Text>
            </View>

            {/* Expiry + controls */}
            <View style={styles.itemRight}>
              <ExpiryBadge daysLeft={daysLeft} theme={theme} />
              <View style={styles.qtyControls}>
                <TouchableOpacity
                  style={[styles.qtyBtn, { borderColor: theme.border }]}
                  onPress={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                >
                  <Ionicons name="remove" size={13} color={theme.tint} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.qtyBtn, { borderColor: theme.border }]}
                  onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
                >
                  <Ionicons name="add" size={13} color={theme.tint} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={14} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 4 },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  categoryIcon: { fontSize: 20 },
  categoryLabel: { fontSize: 15, fontWeight: '700' },
  categoryCount: { fontSize: 13 },
  chevron: { marginLeft: 'auto' },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 14,
    gap: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  emojiCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emojiText: { fontSize: 24 },
  itemPhoto: { borderRadius: 22, overflow: 'hidden' },
  itemMiddle: { flex: 1, gap: 2 },
  itemName: { fontSize: 15, fontWeight: '600' },
  itemQty: { fontSize: 12 },
  itemRight: { alignItems: 'flex-end', gap: 6 },
  expiryBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  expiryDot: { width: 7, height: 7, borderRadius: 4 },
  expiryBadgeText: { fontSize: 11, fontWeight: '600' },
  daysBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  daysBadgeText: { fontSize: 11, fontWeight: '600' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  qtyBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: { padding: 2, marginLeft: 2 },
});
