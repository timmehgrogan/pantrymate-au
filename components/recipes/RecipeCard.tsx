import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { RecipeWithMatch } from '@/types';
import { useShopping } from '@/hooks/useShopping';
import { usePantry } from '@/hooks/usePantry';
import { findLocalSubstitute } from '@/lib/substitutions';
import { findSubstituteWithAI } from '@/lib/claudeApi';

interface Props {
  recipe: RecipeWithMatch;
  theme: Record<string, string>;
}

// Gradient pairs for recipe hero cards
const GRADIENTS: [string, string][] = [
  ['#1B5E20', '#43A047'],
  ['#BF360C', '#EF6C00'],
  ['#4A148C', '#7B1FA2'],
  ['#0D47A1', '#1565C0'],
  ['#004D40', '#00796B'],
  ['#880E4F', '#AD1457'],
  ['#1A237E', '#283593'],
  ['#33691E', '#558B2F'],
];

function getGradient(id: string): [string, string] {
  const index = id.charCodeAt(id.length - 1) % GRADIENTS.length;
  return GRADIENTS[index];
}

function StarRating({ score, color }: { score: number; color: string }) {
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
      <Text style={[ratingStyles.value, { color }]}>{stars.toFixed(1)}</Text>
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
  const { items: pantryItems } = usePantry();

  // Substitute state: maps ingredient name → suggestion text
  const [substitutes, setSubstitutes] = useState<Record<string, string>>({});
  const [loadingSubstitute, setLoadingSubstitute] = useState<string | null>(null);

  const totalIngredients = recipe.ingredients.filter((i) => !i.optional).length;
  const gradient = getGradient(recipe.id);

  async function handleFindSubstitute(ingredientName: string) {
    if (loadingSubstitute) return;
    setLoadingSubstitute(ingredientName);

    try {
      const pantryNames = pantryItems.map((p) => p.name);

      // 1. Try local substitution DB first
      const local = findLocalSubstitute(ingredientName, pantryNames);
      if (local) {
        const msg = local.inPantry
          ? `✅ Use ${local.substitute} — already in your pantry!`
          : `💡 Try ${local.substitute}`;
        setSubstitutes((prev) => ({ ...prev, [ingredientName]: msg }));
        return;
      }

      // 2. Fall back to Claude AI
      const aiSuggestion = await findSubstituteWithAI(ingredientName, pantryItems);
      setSubstitutes((prev) => ({
        ...prev,
        [ingredientName]: aiSuggestion ?? '❌ No substitute found',
      }));
    } catch {
      setSubstitutes((prev) => ({
        ...prev,
        [ingredientName]: '❌ Could not find a substitute right now',
      }));
    } finally {
      setLoadingSubstitute(null);
    }
  }

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
        {/* Gradient hero */}
        <LinearGradient colors={gradient} style={styles.hero}>
          <Text style={styles.heroTitle} numberOfLines={2}>{recipe.name}</Text>
          {recipe.is_ai_generated && (
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={10} color="#fff" />
              <Text style={styles.aiBadgeText}>AI</Text>
            </View>
          )}
        </LinearGradient>

        {/* Card body */}
        <View style={styles.body}>
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
          {/* Modal gradient hero */}
          <LinearGradient colors={gradient} style={styles.modalHero}>
            <Text style={styles.modalHeroTitle} numberOfLines={2}>{recipe.name}</Text>
            <TouchableOpacity
              style={[styles.modalClose, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
              onPress={() => setExpanded(false)}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
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
              const isMissing = !inPantry && !ing.optional;
              const substituteText = substitutes[ing.name];
              const isLoadingThis = loadingSubstitute === ing.name;

              return (
                <View key={i}>
                  <View style={[styles.ingredientRow, { borderBottomColor: isMissing && !substituteText ? 'transparent' : theme.border }]}>
                    <Ionicons
                      name={inPantry ? 'checkmark-circle' : 'ellipse-outline'}
                      size={18}
                      color={inPantry ? theme.tint : theme.textSecondary}
                    />
                    <Text style={[styles.ingredientText, { color: theme.text }]}>
                      {ing.amount} {ing.unit} {ing.name}
                      {ing.optional ? <Text style={{ color: theme.textSecondary }}> (optional)</Text> : null}
                    </Text>

                    {/* Find Substitute button for missing non-optional items */}
                    {isMissing && !substituteText && (
                      <TouchableOpacity
                        style={[styles.subBtn, { borderColor: theme.accent ?? '#C4A352', backgroundColor: `${theme.accent ?? '#C4A352'}15` }]}
                        onPress={() => handleFindSubstitute(ing.name)}
                        disabled={!!loadingSubstitute}
                      >
                        {isLoadingThis ? (
                          <ActivityIndicator size={10} color={theme.accent ?? '#C4A352'} />
                        ) : (
                          <Text style={[styles.subBtnText, { color: theme.accent ?? '#C4A352' }]}>
                            Sub?
                          </Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Substitute suggestion inline */}
                  {substituteText && (
                    <View style={[styles.substituteRow, { backgroundColor: `${theme.accent ?? '#C4A352'}10`, borderBottomColor: theme.border }]}>
                      <Text style={[styles.substituteText, { color: theme.text }]}>
                        {substituteText}
                      </Text>
                      <TouchableOpacity onPress={() => setSubstitutes((prev) => { const n = { ...prev }; delete n[ing.name]; return n; })}>
                        <Ionicons name="close-circle" size={16} color={theme.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  )}
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
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    padding: 14,
    position: 'relative',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  aiBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  aiBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  body: { padding: 14, gap: 5 },
  meta: { fontSize: 12 },
  matchRow: { flexDirection: 'row', alignItems: 'center' },
  matchLabel: { fontSize: 13, fontWeight: '700' },
  missing: { fontSize: 12 },
  // Modal
  modal: { flex: 1 },
  modalHero: {
    height: 160,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    padding: 20,
  },
  modalHeroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    maxWidth: '85%',
  },
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
  subBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 38,
    alignItems: 'center',
  },
  subBtnText: { fontSize: 11, fontWeight: '700' },
  substituteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 7,
    borderBottomWidth: 1,
    gap: 8,
  },
  substituteText: { flex: 1, fontSize: 12, fontStyle: 'italic' },
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
