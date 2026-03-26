import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AddPantryItemInput, PantryCategory } from '@/types';
import { identifyFoodFromPhoto } from '@/lib/claudeApi';

const CATEGORIES: { key: PantryCategory; label: string; icon: string; color: string }[] = [
  { key: 'fridge', label: 'Fridge', icon: '🌡️', color: '#3B82F6' },
  { key: 'freezer', label: 'Freezer', icon: '❄️', color: '#6366F1' },
  { key: 'pantry', label: 'Pantry', icon: '🥫', color: '#F59E0B' },
];

const COMMON_UNITS = ['pcs', 'g', 'kg', 'ml', 'L', 'cup', 'tbsp', 'tsp', 'bunch', 'pack'];

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (item: AddPantryItemInput) => void;
  theme: Record<string, string>;
}

export function AddItemModal({ visible, onClose, onAdd, theme }: Props) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<PantryCategory>('pantry');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [expiryDate, setExpiryDate] = useState('');
  const [isIdentifying, setIsIdentifying] = useState(false);

  async function handleTakePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Needed',
        'Allow camera access so Claude can identify your food item.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (result.canceled || !result.assets[0]?.base64) return;

    setIsIdentifying(true);
    try {
      const identified = await identifyFoodFromPhoto(result.assets[0].base64);
      if (identified) {
        setName(identified.name);
        setCategory(identified.category);
        setQuantity(String(identified.quantity));
        setUnit(identified.unit);
      } else {
        Alert.alert('Could not identify', 'Please enter the item name manually.');
      }
    } catch {
      Alert.alert('Identification failed', 'Check your Claude API key in .env and restart the server.');
    } finally {
      setIsIdentifying(false);
    }
  }

  function handleAdd() {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      brand: brand.trim() || undefined,
      category,
      quantity: parseFloat(quantity) || 1,
      unit: unit.trim() || 'pcs',
      expiry_date: expiryDate.trim() || undefined,
    });
    resetForm();
    onClose();
  }

  function resetForm() {
    setName('');
    setBrand('');
    setCategory('pantry');
    setQuantity('1');
    setUnit('pcs');
    setExpiryDate('');
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Add Item</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={26} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">

          {/* ── Take Photo to identify ── */}
          <TouchableOpacity
            style={[styles.photoBtn, { backgroundColor: `${theme.tint}14`, borderColor: theme.tint }]}
            onPress={handleTakePhoto}
            disabled={isIdentifying}
          >
            {isIdentifying ? (
              <>
                <ActivityIndicator size="small" color={theme.tint} />
                <Text style={[styles.photoBtnText, { color: theme.tint }]}>Identifying with Claude AI...</Text>
              </>
            ) : (
              <>
                <Ionicons name="camera" size={20} color={theme.tint} />
                <Text style={[styles.photoBtnText, { color: theme.tint }]}>
                  Take Photo to Identify
                </Text>
                <Text style={[styles.photoBtnSub, { color: theme.tint }]}>
                  Claude AI will pre-fill the form
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Name */}
          <Text style={[styles.label, { color: theme.textSecondary }]}>ITEM NAME *</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
            placeholder="e.g. Milk, Eggs, Chicken..."
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
          />

          {/* Brand */}
          <Text style={[styles.label, { color: theme.textSecondary }]}>BRAND (optional)</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
            placeholder="e.g. Woolworths, Coles Brand..."
            placeholderTextColor={theme.textSecondary}
            value={brand}
            onChangeText={setBrand}
          />

          {/* Category */}
          <Text style={[styles.label, { color: theme.textSecondary }]}>CATEGORY</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryPill,
                  { borderColor: cat.color, backgroundColor: theme.surface },
                  category === cat.key && { backgroundColor: cat.color },
                ]}
                onPress={() => setCategory(cat.key)}
              >
                <Text style={styles.catEmoji}>{cat.icon}</Text>
                <Text style={[styles.catLabel, { color: category === cat.key ? '#fff' : cat.color }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quantity + Unit */}
          <Text style={[styles.label, { color: theme.textSecondary }]}>QUANTITY & UNIT</Text>
          <View style={styles.qtyRow}>
            <TextInput
              style={[styles.qtyInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
              placeholder="1"
              placeholderTextColor={theme.textSecondary}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.unitInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
              placeholder="pcs"
              placeholderTextColor={theme.textSecondary}
              value={unit}
              onChangeText={setUnit}
            />
          </View>

          {/* Common units */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitsScroll}>
            {COMMON_UNITS.map((u) => (
              <TouchableOpacity
                key={u}
                style={[
                  styles.unitChip,
                  { borderColor: theme.border, backgroundColor: theme.surface },
                  unit === u && { backgroundColor: theme.tint, borderColor: theme.tint },
                ]}
                onPress={() => setUnit(u)}
              >
                <Text style={[styles.unitChipText, { color: theme.textSecondary }, unit === u && { color: '#fff' }]}>
                  {u}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Expiry date */}
          <Text style={[styles.label, { color: theme.textSecondary }]}>EXPIRY DATE (optional)</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
            placeholder="YYYY-MM-DD e.g. 2025-03-15"
            placeholderTextColor={theme.textSecondary}
            value={expiryDate}
            onChangeText={setExpiryDate}
            keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
          />

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.tint }, !name.trim() && { opacity: 0.5 }]}
            onPress={handleAdd}
            disabled={!name.trim()}
          >
            <Ionicons name="basket-outline" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Add to Pantry</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    paddingTop: 56,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  body: { flex: 1, padding: 20 },
  photoBtn: {
    borderWidth: 1.5,
    borderRadius: 12,
    borderStyle: 'dashed',
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  photoBtnText: { fontSize: 15, fontWeight: '700' },
  photoBtnSub: { fontSize: 11, opacity: 0.7 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginTop: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
  },
  categoryRow: { flexDirection: 'row', gap: 10 },
  categoryPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 5,
  },
  catEmoji: { fontSize: 16 },
  catLabel: { fontSize: 13, fontWeight: '600' },
  qtyRow: { flexDirection: 'row', gap: 10 },
  qtyInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
  },
  unitInput: {
    flex: 1.5,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
  },
  unitsScroll: { marginTop: 8, marginBottom: 4 },
  unitChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 6,
  },
  unitChipText: { fontSize: 12, fontWeight: '600' },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
