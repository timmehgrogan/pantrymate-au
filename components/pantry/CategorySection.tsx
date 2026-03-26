import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PantryItem, PantryCategory } from '@/types';

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
}

function getDaysUntilExpiry(expiryDate?: string): number | null {
  if (!expiryDate) return null;
  return Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function ExpiryBadge({ daysLeft, theme }: { daysLeft: number | null; theme: Record<string, string> }) {
  if (daysLeft === null) return null;

  let color: string;
  let label: string;

  if (daysLeft < 0) {
    color = theme.expired;
    label = 'Expired';
  } else if (daysLeft === 0) {
    color = theme.expired;
    label = 'Expires today';
  } else if (daysLeft <= 3) {
    color = theme.expirySoon;
    label = `${daysLeft}d left`;
  } else {
    color = theme.fresh;
    label = `${daysLeft}d`;
  }

  return (
    <View style={[styles.badge, { backgroundColor: `${color}20`, borderColor: color }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function CategorySection({ category, items, onRemove, onUpdateQuantity, theme }: Props) {
  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>{category.icon}</Text>
        <Text style={[styles.sectionTitle, { color: category.color }]}>{category.label}</Text>
        <View style={[styles.countBadge, { backgroundColor: category.color }]}>
          <Text style={styles.countText}>{items.length}</Text>
        </View>
      </View>

      {items.map((item) => {
        const daysLeft = getDaysUntilExpiry(item.expiry_date);
        return (
          <View
            key={item.id}
            style={[styles.itemCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <View style={styles.itemLeft}>
              <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
              {item.brand && (
                <Text style={[styles.itemBrand, { color: theme.textSecondary }]}>{item.brand}</Text>
              )}
              <ExpiryBadge daysLeft={daysLeft} theme={theme} />
            </View>

            <View style={styles.itemRight}>
              <View style={styles.qtyControls}>
                <TouchableOpacity
                  style={[styles.qtyBtn, { borderColor: theme.border }]}
                  onPress={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                >
                  <Ionicons name="remove" size={14} color={theme.tint} />
                </TouchableOpacity>
                <Text style={[styles.qtyText, { color: theme.text }]}>
                  {item.quantity} {item.unit}
                </Text>
                <TouchableOpacity
                  style={[styles.qtyBtn, { borderColor: theme.border }]}
                  onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
                >
                  <Ionicons name="add" size={14} color={theme.tint} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 16 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  sectionIcon: { fontSize: 18 },
  sectionTitle: { fontSize: 14, fontWeight: '700', letterSpacing: 0.5, flex: 1 },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  itemLeft: { flex: 1, gap: 3 },
  itemName: { fontSize: 15, fontWeight: '600' },
  itemBrand: { fontSize: 12 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 2,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  itemRight: { alignItems: 'flex-end', gap: 6 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: { fontSize: 13, fontWeight: '600', minWidth: 40, textAlign: 'center' },
  deleteBtn: { padding: 2 },
});
