import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useShopping } from '@/hooks/useShopping';
import { ShoppingItem } from '@/types';
import { getFoodEmoji, getAisleCategory, AisleCategory } from '@/constants/foodEmojis';

const AISLE_ORDER: AisleCategory[] = [
  'Produce',
  'Meat & Seafood',
  'Dairy & Eggs',
  'Bakery',
  'Pantry Staples',
  'Frozen',
  'Other',
];

const AISLE_ICONS: Record<AisleCategory, string> = {
  'Produce': '🥬',
  'Meat & Seafood': '🥩',
  'Dairy & Eggs': '🥛',
  'Bakery': '🍞',
  'Pantry Staples': '🥫',
  'Frozen': '❄️',
  'Other': '🛒',
};

interface AisleSection {
  title: AisleCategory;
  items: ShoppingItem[];
}

export default function ShoppingScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { items, addItem, toggleItem, removeItem, clearChecked } = useShopping();

  const [newItemName, setNewItemName] = useState('');
  const [showAddRow, setShowAddRow] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const uncheckedCount = items.filter((i) => !i.is_checked).length;
  const checkedCount = items.filter((i) => i.is_checked).length;

  const aisleGroups: AisleSection[] = useMemo(() => {
    const map: Record<string, ShoppingItem[]> = {};
    items.forEach((item) => {
      const aisle = getAisleCategory(item.name);
      if (!map[aisle]) map[aisle] = [];
      map[aisle].push(item);
    });
    return AISLE_ORDER
      .filter((a) => map[a]?.length > 0)
      .map((a) => ({ title: a, items: map[a] }));
  }, [items]);

  function toggleSection(title: string) {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  }

  function handleAdd() {
    if (!newItemName.trim()) return;
    addItem({ name: newItemName.trim(), quantity: 1, unit: 'pcs' });
    setNewItemName('');
    setShowAddRow(false);
  }

  function handleClearChecked() {
    if (checkedCount === 0) return;
    Alert.alert(
      'Clear checked items?',
      `Remove ${checkedCount} checked item${checkedCount > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearChecked },
      ]
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Title bar */}
      <View style={[styles.titleBar, { backgroundColor: theme.surface }]}>
        <View style={styles.titleRow}>
          <Text style={[styles.screenTitle, { color: theme.text }]}>Shopping List</Text>
          <View style={styles.titleActions}>
            {checkedCount > 0 && (
              <TouchableOpacity
                style={[styles.clearBtn, { borderColor: theme.border }]}
                onPress={handleClearChecked}
              >
                <Ionicons name="checkmark-done-outline" size={15} color={theme.textSecondary} />
                <Text style={[styles.clearBtnText, { color: theme.textSecondary }]}>
                  Clear {checkedCount}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: theme.tint }]}
              onPress={() => setShowAddRow((v) => !v)}
            >
              <Ionicons name={showAddRow ? 'close' : 'add'} size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={[styles.statChip, { backgroundColor: `${theme.tint}14` }]}>
            <Text style={[styles.statNum, { color: theme.tint }]}>{uncheckedCount}</Text>
            <Text style={[styles.statLabel, { color: theme.tint }]}>remaining</Text>
          </View>
          {checkedCount > 0 && (
            <View style={[styles.statChip, { backgroundColor: `${theme.textSecondary}14` }]}>
              <Ionicons name="checkmark-circle" size={13} color={theme.textSecondary} />
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                {checkedCount} done
              </Text>
            </View>
          )}
        </View>

        {/* Inline add row */}
        {showAddRow && (
          <View style={[styles.addRow, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <TextInput
              style={[styles.addInput, { color: theme.text }]}
              placeholder="Add item..."
              placeholderTextColor={theme.textSecondary}
              value={newItemName}
              onChangeText={setNewItemName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleAdd}
            />
            <TouchableOpacity
              style={[styles.addConfirm, { backgroundColor: theme.tint }]}
              onPress={handleAdd}
            >
              <Text style={styles.addConfirmText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* List */}
      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Shopping list is empty</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Add items manually or generate them from a recipe on the Recipes tab.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {aisleGroups.map(({ title, items: sectionItems }) => {
            const isCollapsed = collapsedSections.has(title);
            const doneCount = sectionItems.filter((i) => i.is_checked).length;
            return (
              <View key={title} style={styles.section}>
                {/* Section header */}
                <TouchableOpacity
                  style={[styles.sectionHeader, { backgroundColor: theme.surface }]}
                  onPress={() => toggleSection(title)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sectionIcon}>{AISLE_ICONS[title]}</Text>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
                  <Text style={[styles.sectionCount, { color: theme.textSecondary }]}>
                    ({sectionItems.length} {sectionItems.length === 1 ? 'Item' : 'Items'}
                    {doneCount > 0 ? `, ${doneCount} done` : ''})
                  </Text>
                  <Ionicons
                    name={isCollapsed ? 'chevron-down' : 'chevron-up'}
                    size={16}
                    color={theme.textSecondary}
                    style={styles.chevron}
                  />
                </TouchableOpacity>

                {/* Items */}
                {!isCollapsed && sectionItems.map((item) => {
                  const emoji = getFoodEmoji(item.name);
                  return (
                    <View
                      key={item.id}
                      style={[styles.itemCard, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}
                    >
                      {/* Emoji circle */}
                      <View style={[styles.emojiCircle, { backgroundColor: theme.background, opacity: item.is_checked ? 0.5 : 1 }]}>
                        <Text style={styles.emojiText}>{emoji}</Text>
                      </View>

                      {/* Name + meta */}
                      <View style={styles.itemMiddle}>
                        <Text
                          style={[
                            styles.itemName,
                            { color: theme.text },
                            item.is_checked && styles.strikethrough,
                          ]}
                        >
                          {item.name}
                        </Text>
                        <Text style={[styles.itemMeta, { color: theme.textSecondary }]}>
                          {item.quantity} {item.unit}
                          {item.recipe_name ? (
                            <Text style={[styles.recipeSource, { color: theme.textSecondary }]}>
                              {' · for '}
                              <Text style={{ fontStyle: 'italic' }}>{item.recipe_name}</Text>
                            </Text>
                          ) : null}
                        </Text>
                      </View>

                      {/* Right: delete + checkbox */}
                      <View style={styles.itemRight}>
                        <TouchableOpacity
                          onPress={() => removeItem(item.id)}
                          style={styles.deleteBtn}
                        >
                          <Ionicons name="trash-outline" size={14} color={theme.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.checkbox,
                            { borderColor: item.is_checked ? theme.tint : theme.border },
                            item.is_checked && { backgroundColor: theme.tint },
                          ]}
                          onPress={() => toggleItem(item.id)}
                        >
                          {item.is_checked && (
                            <Ionicons name="checkmark" size={13} color="#fff" />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.scanBtn, { backgroundColor: theme.accent }]}
          onPress={() => router.push('/(tabs)/scan')}
          activeOpacity={0.85}
        >
          <Ionicons name="barcode-outline" size={18} color="#fff" />
          <Text style={styles.scanBtnText}>GO TO SCANNER</Text>
        </TouchableOpacity>
      </View>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  screenTitle: { fontSize: 22, fontWeight: '800' },
  titleActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  clearBtnText: { fontSize: 12, fontWeight: '600' },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', gap: 8 },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statNum: { fontSize: 14, fontWeight: '800' },
  statLabel: { fontSize: 12, fontWeight: '600' },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  addInput: { flex: 1, fontSize: 14 },
  addConfirm: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addConfirmText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 8 },
  section: { marginBottom: 4 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 8,
  },
  sectionIcon: { fontSize: 18 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  sectionCount: { fontSize: 12 },
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
  itemMiddle: { flex: 1, gap: 2 },
  itemName: { fontSize: 15, fontWeight: '600' },
  strikethrough: { textDecorationLine: 'line-through', opacity: 0.45 },
  itemMeta: { fontSize: 12 },
  recipeSource: { fontSize: 12 },
  itemRight: { alignItems: 'center', gap: 6 },
  deleteBtn: { padding: 3 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  scanBtnText: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
});
