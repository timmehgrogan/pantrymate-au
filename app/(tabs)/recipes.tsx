import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { AUSSIE_RECIPES } from '@/constants/recipes';
import { RecipeWithMatch } from '@/types';
import { usePantry } from '@/hooks/usePantry';
import { useRecipes } from '@/hooks/useRecipes';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { AIRecipeModal } from '@/components/recipes/AIRecipeModal';

const TAGS = ['all', 'family', 'quick', 'vegetarian', 'bbq', 'baking', 'chicken', 'beef', 'seafood'];

export default function RecipesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { items: pantryItems } = usePantry();
  const { aiRecipes, generateAIRecipe, isGenerating } = useRecipes();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [showAIModal, setShowAIModal] = useState(false);
  const [sortBy, setSortBy] = useState<'match' | 'name' | 'time'>('match');

  const pantryIngredientNames = pantryItems.map((i) => i.name.toLowerCase());

  const recipesWithMatch: RecipeWithMatch[] = useMemo(() => {
    const allRecipes = [...AUSSIE_RECIPES, ...aiRecipes];
    return allRecipes.map((recipe) => {
      const required = recipe.ingredients.filter((i) => !i.optional);
      const ingredientNames = required.map((i) => i.name.toLowerCase());
      const matched = ingredientNames.filter((name) =>
        pantryIngredientNames.some((p) => p.includes(name) || name.includes(p))
      );
      const missing = ingredientNames.filter(
        (name) => !pantryIngredientNames.some((p) => p.includes(name) || name.includes(p))
      );
      return {
        ...recipe,
        matchedIngredients: matched,
        missingIngredients: missing,
        matchScore: Math.round((matched.length / Math.max(ingredientNames.length, 1)) * 100),
      };
    });
  }, [pantryItems, aiRecipes]);

  const filteredRecipes = useMemo(() => {
    let result = recipesWithMatch.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag === 'all' || r.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
    if (sortBy === 'match') result = [...result].sort((a, b) => b.matchScore - a.matchScore);
    else if (sortBy === 'name') result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    else result = [...result].sort((a, b) => (a.prep_time_minutes + a.cook_time_minutes) - (b.prep_time_minutes + b.cook_time_minutes));
    return result;
  }, [recipesWithMatch, searchQuery, selectedTag, sortBy]);

  const canMakeCount = filteredRecipes.filter((r) => r.matchScore >= 80).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Screen title */}
      <View style={[styles.titleBar, { backgroundColor: theme.surface }]}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Recipe Suggestions</Text>

        {/* Search */}
        <View style={[styles.searchBar, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <Ionicons name="search" size={16} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search recipes..."
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

      {/* Sort + tag filters */}
      <View style={[styles.filterBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {(['match', 'name', 'time'] as const).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.pill, { borderColor: theme.border, backgroundColor: theme.background }, sortBy === s && { backgroundColor: theme.tint, borderColor: theme.tint }]}
              onPress={() => setSortBy(s)}
            >
              <Text style={[styles.pillText, { color: theme.textSecondary }, sortBy === s && { color: '#fff' }]}>
                {s === 'match' ? '✅ Best Match' : s === 'name' ? '🔤 A–Z' : '⏱ Quickest'}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={[styles.pillDivider, { backgroundColor: theme.border }]} />
          {TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[styles.pill, { borderColor: theme.border, backgroundColor: theme.background }, selectedTag === tag && { backgroundColor: theme.accent, borderColor: theme.accent }]}
              onPress={() => setSelectedTag(tag)}
            >
              <Text style={[styles.pillText, { color: theme.textSecondary }, selectedTag === tag && { color: '#fff' }]}>
                {tag === 'all' ? 'All' : tag.charAt(0).toUpperCase() + tag.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <RecipeCard recipe={item} theme={theme} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No recipes found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Try a different search or generate one with AI
            </Text>
          </View>
        }
      />

      {/* Bottom generate button */}
      <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.generateBtn, { backgroundColor: theme.tint }]}
          onPress={() => setShowAIModal(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="sparkles" size={18} color="#fff" />
          <Text style={styles.generateBtnText}>GENERATE RECIPE</Text>
        </TouchableOpacity>
      </View>

      <AIRecipeModal
        visible={showAIModal}
        onClose={() => setShowAIModal(false)}
        pantryItems={pantryItems}
        onGenerate={generateAIRecipe}
        isGenerating={isGenerating}
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
  filterBar: { borderBottomWidth: 1 },
  filterRow: { paddingHorizontal: 14, paddingVertical: 10, gap: 7, flexDirection: 'row', alignItems: 'center' },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  pillText: { fontSize: 12, fontWeight: '600' },
  pillDivider: { width: 1, height: 20, marginHorizontal: 2 },
  listContent: { padding: 16, paddingBottom: 100 },
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
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
  generateBtnText: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
});
