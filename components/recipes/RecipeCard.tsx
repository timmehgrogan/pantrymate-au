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
import { getFoodEmoji } from '@/constants/foodEmojis';

interface Props {
  recipe: RecipeWithMatch;
  theme: Record<string, string>;
}

// Hero background colours cycle for visual variety
const HERO_BG_COLORS = [
  '#E8F0E8', '#E8EEF5', '#F5EEE8', '#EEE8F5',
  '#F0EAE0', '#E8F5EE', '#F5E8EE', '#EAF0E0',
];

function getHeroBg(id: string): string {
  const index = id.charCodeAt(id.length - 1) % HERO_BG_COLORS.length;
  return HERO_BG_COLORS[index];
}

function StarRating({ score, color }: { score: number; color: string }) {
  // Convert match score to a 1–5 star rating
  const stars = Math.max(2.5, Math.min(5, 2.5 + (score / 100) * 2.5));
  const fullStars = Math.floor(stars);
  const hasHalf = stars - fullStars >= 0.4;

  return (
    <View style={ratingStyles.row}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={
            i <= fullStars
              ? 'star'
              : i === fullStars + 1 && hasHalf
              ? 'star-half'
              : 'star-outline'
          }
          size={13}
          color="#E8A020"
        />
      ))}
      <Text style={[ratingStyles.value, { color }]}>
        {(stars).toFixed(1)}
      </Text>
    </View>
  );
}

const ratingStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  value: { fontSize: 12, fontWeight: '700', marginLeft: 4 },
});

export function RecipeCard({ recipe, theme }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { addItem } = useShopping();

  const totalIngredients = recipe.ingredients.filter((i) => !i.optional).length;
  const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes;
  const heroBg = getHeroBg(recipe.id);
  const heroEmoji = getFoodEmoji(recipe.name);

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
        style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}
        onPress={() => setExpanded(true)}
        activeOpacity={0.85}
      >
        {/* Hero image area */}
        <View style={[styles.hero, { backgroundColor: heroBg }]}>
          <Text style={styles.heroEmoji}>{heroEmoji}</Text>
          {recipe.is_ai_generated && (
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={10} color="#fff" />
              <Text style={styles.aiBadgeText}>AI</Text>
            </View>
          )}
        </View>

        {/* Card body */}
        <View style={styles.body}>
          <Text style={[styles.name, { color: theme.text }]}>{recipe.name}</Text>

          <Text style={[styles.meta, { color: theme.textSecondary }]}>
            Prep: {recipe.prep_time_minutes} min  |  Cook: {recipe.cook_time_minutes} min  |  Serves: {recipe.servings}
          </Text>

          <StarRating score={recipe.matchScore} color={theme.textSecondary} />

          <View style={styles.matchRow}>
            <Text style={[styles.matchLabel, { color: theme.tint }]}>
              Pantry Matches: {recipe.matchedIngredients.length}/{totalIngredients}
            </Text>
          </View>

          {recipe.missingIngredients.length > 0 && (
            <Text style={[styles.missing, { color: theme.textSecondary }]}>
              Missing: {recipe.missingIngredients.length}
              {' ('}
              {recipe.missingIngredients.slice(0, 2).join(', ')}
              {recipe.missingIngredients.length > 2
                ? `, +${recipe.missingIngredients.length - 2} more`
                : ''}
              {')'}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Recipe detail modal */}
      <Modal visible={expanded} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: theme.background }]}>
          {/* Modal hero */}
          <View style={[styles.modalHero, { backgroundColor: heroBg }]}>
            <Text style={styles.modalHeroEmoji}>{heroEmoji}</Text>
            <TouchableOpacity
              style={[styles.modalClose, { backgroundColor: theme.surface }]}
              onPress={() => setExpanded(false)}
            >
              <Ionicons name="close" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{recipe.name}</Text>
            <Text style={[styles.modalDescription, { color: theme.textSecondary }]}>
              {recipe.description}
            </Text>

            {/* Meta chips */}
            <View style={styles.metaRow}>
              {[
                { icon: 'time-outline', text: `${recipe.prep_time_minutes}m prep` },
                { icon: 'flame-outline', text: `${recipe.cook_time_minutes}m cook` },
                { icon: 'people-outline', text: `${recipe.servings} serves` },
              ].map(({ icon, text }) => (
                <View key={text} style={[styles.metaChip, { backgroundColor: theme.surface }]}>
                  <Ionicons name={icon as never} size={13} color={theme.textSecondary} />
                  <Text style={[styles.metaChipText, { color: theme.textSecondary }]}>{text}</Text>
                </View>
              ))}
            </View>

            {/* Pantry match summary */}
            <View style={[styles.matchSummary, { backgroundColor: `${theme.tint}12` }]}>
              <Text style={[styles.matchSummaryText, { color: theme.tint }]}>
                ✅  Pantry Matches: {recipe.matchedIngredients.length}/{totalIngredients}
              </Text>
              {recipe.missingIngredients.length > 0 && (
                <Text style={[styles.matchSummaryMissing, { color: theme.textSecondary }]}>
                  Missing: {recipe.missingIngredients.join(', ')}
                </Text>
              )}
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
                    color={inPantry ? theme.tint : theme.textSecondary}
                  />
                  <Text style={[styles.ingredientText, { color: theme.text }]}>
                    {ing.amount} {ing.unit} {ing.name}
                    {ing.optional ? <Text style={{ color: theme.textSecondary }}> (optional)</Text> : null}
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
                <Ionicons name="cart-outline" size={18} color="#fff" />
                <Text style={styles.addMissingText}>
                  Add {recipe.missingIngredients.length} missing items to shopping
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
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  hero: {
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroEmoji: { fontSize: 56 },
  aiBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5B7A5A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  aiBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  body: { padding: 14, gap: 5 },
  name: { fontSize: 17, fontWeight: '800' },
  meta: { fontSize: 12 },
  matchRow: { flexDirection: 'row', alignItems: 'center' },
  matchLabel: { fontSize: 13, fontWeight: '700' },
  missing: { fontSize: 12 },
  // Modal
  modal: { flex: 1 },
  modalHero: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeroEmoji: { fontSize: 72 },
  modalClose: {
    position: 'absolute',
    top: 48,
    right: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 6 },
  modalDescription: { fontSize: 14, lineHeight: 20, marginBottom: 14 },
  metaRow: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  metaChipText: { fontSize: 12 },
  matchSummary: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 4,
  },
  matchSummaryText: { fontSize: 14, fontWeight: '700' },
  matchSummaryMissing: { fontSize: 12 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10, marginTop: 4 },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
  },
  ingredientText: { flex: 1, fontSize: 14 },
  stepRow: { flexDirection: 'row', gap: 12, marginBottom: 14, alignItems: 'flex-start' },
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
  modalFooter: { padding: 16, borderTopWidth: 1 },
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
