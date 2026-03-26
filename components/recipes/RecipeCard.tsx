import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RecipeWithMatch } from '@/types';
import { useShopping } from '@/hooks/useShopping';

interface Props {
  recipe: RecipeWithMatch;
  theme: Record<string, string>;
}

const DIFFICULTY_COLOR = { easy: '#10B981', medium: '#F59E0B', hard: '#EF4444' };

export function RecipeCard({ recipe, theme }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { addItem } = useShopping();

  const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes;
  const difficultyColor = DIFFICULTY_COLOR[recipe.difficulty];

  function handleAddMissing() {
    recipe.missingIngredients.forEach((name) => {
      const ingredient = recipe.ingredients.find(
        (i) => i.name.toLowerCase() === name.toLowerCase()
      );
      if (ingredient) {
        addItem({
          name: ingredient.name,
          quantity: parseFloat(ingredient.amount) || 1,
          unit: ingredient.unit,
          recipe_id: recipe.id,
          recipe_name: recipe.name,
        });
      }
    });
    setExpanded(false);
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={() => setExpanded(true)}
        activeOpacity={0.8}
      >
        {/* Match score badge */}
        <View
          style={[
            styles.matchBadge,
            {
              backgroundColor:
                recipe.matchScore >= 80
                  ? '#10B98120'
                  : recipe.matchScore >= 50
                  ? '#F59E0B20'
                  : '#EF444420',
              borderColor:
                recipe.matchScore >= 80
                  ? '#10B981'
                  : recipe.matchScore >= 50
                  ? '#F59E0B'
                  : '#EF4444',
            },
          ]}
        >
          <Text
            style={[
              styles.matchText,
              {
                color:
                  recipe.matchScore >= 80
                    ? '#10B981'
                    : recipe.matchScore >= 50
                    ? '#F59E0B'
                    : '#EF4444',
              },
            ]}
          >
            {recipe.matchScore}% match
          </Text>
        </View>

        <Text style={[styles.name, { color: theme.text }]}>{recipe.name}</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
          {recipe.description}
        </Text>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={13} color={theme.textSecondary} />
            <Text style={[styles.metaText, { color: theme.textSecondary }]}>{totalTime} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={13} color={theme.textSecondary} />
            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
              {recipe.servings} servings
            </Text>
          </View>
          <View style={[styles.difficultyBadge, { backgroundColor: `${difficultyColor}20` }]}>
            <Text style={[styles.difficultyText, { color: difficultyColor }]}>
              {recipe.difficulty}
            </Text>
          </View>
        </View>

        {recipe.missingIngredients.length > 0 && (
          <Text style={[styles.missing, { color: theme.textSecondary }]}>
            Missing: {recipe.missingIngredients.slice(0, 3).join(', ')}
            {recipe.missingIngredients.length > 3
              ? ` +${recipe.missingIngredients.length - 3} more`
              : ''}
          </Text>
        )}
      </TouchableOpacity>

      {/* Recipe detail modal */}
      <Modal visible={expanded} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]} numberOfLines={2}>
              {recipe.name}
            </Text>
            <TouchableOpacity onPress={() => setExpanded(false)}>
              <Ionicons name="close" size={26} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Meta row */}
            <View style={styles.metaRow}>
              <View style={[styles.metaChip, { backgroundColor: theme.surface }]}>
                <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
                <Text style={[styles.metaChipText, { color: theme.textSecondary }]}>
                  {recipe.prep_time_minutes}m prep
                </Text>
              </View>
              <View style={[styles.metaChip, { backgroundColor: theme.surface }]}>
                <Ionicons name="flame-outline" size={14} color={theme.textSecondary} />
                <Text style={[styles.metaChipText, { color: theme.textSecondary }]}>
                  {recipe.cook_time_minutes}m cook
                </Text>
              </View>
              <View style={[styles.metaChip, { backgroundColor: theme.surface }]}>
                <Ionicons name="people-outline" size={14} color={theme.textSecondary} />
                <Text style={[styles.metaChipText, { color: theme.textSecondary }]}>
                  {recipe.servings} serves
                </Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>INGREDIENTS</Text>
            {recipe.ingredients.map((ing, i) => {
              const inPantry = recipe.matchedIngredients.some(
                (m) => m.toLowerCase() === ing.name.toLowerCase()
              );
              return (
                <View key={i} style={[styles.ingredientRow, { borderBottomColor: theme.border }]}>
                  <Ionicons
                    name={inPantry ? 'checkmark-circle' : 'ellipse-outline'}
                    size={18}
                    color={inPantry ? '#10B981' : theme.textSecondary}
                  />
                  <Text style={[styles.ingredientText, { color: theme.text }]}>
                    {ing.amount} {ing.unit} {ing.name}
                    {ing.optional ? ' (optional)' : ''}
                  </Text>
                </View>
              );
            })}

            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>METHOD</Text>
            {recipe.instructions.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={[styles.stepNum, { backgroundColor: theme.tint }]}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <Text style={[styles.stepText, { color: theme.text }]}>{step}</Text>
              </View>
            ))}

            <View style={{ height: 40 }} />
          </ScrollView>

          {recipe.missingIngredients.length > 0 && (
            <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
              <TouchableOpacity
                style={[styles.addMissingBtn, { backgroundColor: theme.tint }]}
                onPress={handleAddMissing}
              >
                <Ionicons name="cart-outline" size={20} color="#fff" />
                <Text style={styles.addMissingText}>
                  Add {recipe.missingIngredients.length} missing to shopping
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  matchBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  matchText: { fontSize: 11, fontWeight: '700' },
  name: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  description: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 12 },
  difficultyBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  difficultyText: { fontSize: 11, fontWeight: '600' },
  missing: { fontSize: 12, marginTop: 2 },
  // Modal
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    paddingTop: 56,
    gap: 10,
  },
  modalTitle: { flex: 1, fontSize: 20, fontWeight: '800', lineHeight: 26 },
  modalBody: { flex: 1, padding: 20 },
  metaRow: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  metaChipText: { fontSize: 12 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  ingredientText: { flex: 1, fontSize: 14 },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  stepText: { flex: 1, fontSize: 14, lineHeight: 21 },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
  },
  addMissingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addMissingText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
