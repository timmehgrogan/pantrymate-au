import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useShopping } from '@/hooks/useShopping';
import { ShoppingItem, AddShoppingItemInput } from '@/types';

export default function ShoppingScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { items, addItem, toggleItem, removeItem, clearChecked } = useShopping();

  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('pcs');
  const [showAddRow, setShowAddRow] = useState(false);

  const unchecked = items.filter((i) => !i.is_checked);
  const checked = items.filter((i) => i.is_checked);

  function handleAdd() {
    if (!newItemName.trim()) return;
    addItem({
      name: newItemName.trim(),
      quantity: parseFloat(newItemQty) || 1,
      unit: newItemUnit.trim() || 'pcs',
    });
    setNewItemName('');
    setNewItemQty('1');
  }

  function handleClearChecked() {
    if (checked.length === 0) return;
    Alert.alert(
      'Clear checked items?',
      `Remove ${checked.length} checked item${checked.length > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearChecked },
      ]
    );
  }

  const renderItem = ({ item }: { item: ShoppingItem }) => (
    <View style={[styles.itemRow, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <TouchableOpacity
        style={[
          styles.checkbox,
          { borderColor: theme.tint },
          item.is_checked && { backgroundColor: theme.tint },
        ]}
        onPress={() => toggleItem(item.id)}
      >
        {item.is_checked && <Ionicons name="checkmark" size={14} color="#fff" />}
      </TouchableOpacity>

      <View style={styles.itemContent}>
        <Text
          style={[
            styles.itemName,
            { color: theme.text },
            item.is_checked && { textDecorationLine: 'line-through', color: theme.textSecondary },
          ]}
        >
          {item.name}
        </Text>
        <Text style={[styles.itemMeta, { color: theme.textSecondary }]}>
          {item.quantity} {item.unit}
          {item.recipe_name ? ` · for ${item.recipe_name}` : ''}
        </Text>
      </View>

      <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={18} color={theme.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Summary banner */}
      <View style={[styles.banner, { backgroundColor: theme.tint }]}>
        <Text style={styles.bannerText}>
          {unchecked.length} item{unchecked.length !== 1 ? 's' : ''} remaining
        </Text>
        {checked.length > 0 && (
          <TouchableOpacity onPress={handleClearChecked}>
            <Text style={styles.bannerAction}>Clear {checked.length} done</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Quick add row */}
      {showAddRow ? (
        <View style={[styles.addRow, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <TextInput
            style={[styles.addNameInput, { color: theme.text, borderColor: theme.border }]}
            placeholder="Item name..."
            placeholderTextColor={theme.textSecondary}
            value={newItemName}
            onChangeText={setNewItemName}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleAdd}
          />
          <TextInput
            style={[styles.addQtyInput, { color: theme.text, borderColor: theme.border }]}
            placeholder="Qty"
            placeholderTextColor={theme.textSecondary}
            value={newItemQty}
            onChangeText={setNewItemQty}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.addUnitInput, { color: theme.text, borderColor: theme.border }]}
            placeholder="Unit"
            placeholderTextColor={theme.textSecondary}
            value={newItemUnit}
            onChangeText={setNewItemUnit}
          />
          <TouchableOpacity
            style={[styles.addConfirmBtn, { backgroundColor: theme.tint }]}
            onPress={handleAdd}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowAddRow(false)} style={styles.addCancelBtn}>
            <Ionicons name="close" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.addTrigger, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => setShowAddRow(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color={theme.tint} />
          <Text style={[styles.addTriggerText, { color: theme.tint }]}>Add item</Text>
        </TouchableOpacity>
      )}

      {/* Items list */}
      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Shopping list is empty</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Items added from recipes will appear here, or tap "+ Add item" above.
          </Text>
        </View>
      ) : (
        <FlatList
          data={[...unchecked, ...checked]}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: theme.border, marginLeft: 54 }} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  bannerText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  bannerAction: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  addTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  addTriggerText: { fontSize: 14, fontWeight: '600' },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    borderBottomWidth: 1,
  },
  addNameInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
  },
  addQtyInput: {
    width: 52,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    textAlign: 'center',
  },
  addUnitInput: {
    width: 60,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    textAlign: 'center',
  },
  addConfirmBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCancelBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemContent: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '500' },
  itemMeta: { fontSize: 12, marginTop: 2 },
  deleteButton: { padding: 6 },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
