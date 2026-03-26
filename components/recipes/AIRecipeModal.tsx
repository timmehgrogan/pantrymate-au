import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PantryItem } from '@/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  pantryItems: PantryItem[];
  onGenerate: (prompt: string) => Promise<void>;
  isGenerating: boolean;
  theme: Record<string, string>;
}

export function AIRecipeModal({ visible, onClose, pantryItems, onGenerate, isGenerating, theme }: Props) {
  const [prompt, setPrompt] = useState('');
  const [usePantryItems, setUsePantryItems] = useState(true);

  const pantryList = pantryItems.map((i) => i.name).slice(0, 12);

  async function handleGenerate() {
    const pantryContext = usePantryItems && pantryList.length > 0
      ? `Using these pantry items: ${pantryList.join(', ')}. `
      : '';
    const fullPrompt = `${pantryContext}${prompt || 'Suggest a delicious Aussie family recipe.'}`;
    await onGenerate(fullPrompt);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>✨ AI Recipe Generator</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Powered by Claude AI
            </Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={26} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
          {/* Pantry toggle */}
          {pantryList.length > 0 && (
            <View style={[styles.toggleRow, { borderColor: theme.border }]}>
              <View style={styles.toggleLeft}>
                <Text style={[styles.toggleTitle, { color: theme.text }]}>
                  Use my pantry ingredients
                </Text>
                <Text style={[styles.toggleSub, { color: theme.textSecondary }]}>
                  {pantryList.slice(0, 5).join(', ')}{pantryList.length > 5 ? '...' : ''}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  { backgroundColor: usePantryItems ? theme.tint : theme.border },
                ]}
                onPress={() => setUsePantryItems((v) => !v)}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    { transform: [{ translateX: usePantryItems ? 20 : 2 }] },
                  ]}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Prompt input */}
          <Text style={[styles.label, { color: theme.textSecondary }]}>ADDITIONAL INSTRUCTIONS</Text>
          <TextInput
            style={[styles.textarea, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
            placeholder="e.g. Make it kid-friendly, gluten-free, or use the lamb chops in my fridge..."
            placeholderTextColor={theme.textSecondary}
            value={prompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Suggestions */}
          <Text style={[styles.label, { color: theme.textSecondary }]}>QUICK IDEAS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              'Quick weeknight dinner',
              'Kids lunch idea',
              'Healthy low-carb',
              'Use leftover roast',
              'Aussie BBQ',
              'Easy baking',
            ].map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.suggChip, { borderColor: theme.border, backgroundColor: theme.surface }]}
                onPress={() => setPrompt(s)}
              >
                <Text style={[styles.suggText, { color: theme.text }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={{ height: 40 }} />
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.generateBtn, { backgroundColor: theme.tint }, isGenerating && { opacity: 0.7 }]}
            onPress={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="sparkles" size={20} color="#fff" />
            )}
            <Text style={styles.generateText}>
              {isGenerating ? 'Generating...' : 'Generate Recipe'}
            </Text>
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 56,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerSubtitle: { fontSize: 12, marginTop: 2 },
  body: { flex: 1, padding: 20 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 20,
  },
  toggleLeft: { flex: 1, marginRight: 12 },
  toggleTitle: { fontSize: 15, fontWeight: '600' },
  toggleSub: { fontSize: 12, marginTop: 2 },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  textarea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    marginBottom: 20,
  },
  suggChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  suggText: { fontSize: 13 },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  generateText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
