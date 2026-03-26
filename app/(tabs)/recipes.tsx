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
import { Recipe, RecipeWithMatch } from '@/types';
import { usePantry } from '@/hooks/usePantry';
import { useRecipes } from '@/hooks/useRecipes';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { AIRecipeModal } from '@/components/recipes/AIRecipeModal';

const DIFFICULTY_LABELS = { easy: '🟢 Easy', medium: '🟡 Medium', hard: '🔴 Hard' };
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
      const ingredientNames = recipe.ingredients.map((i) => i.name.toLowerCase());
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
        matchScore: Math.round((matched.length / ingredientNames.length) * 100),
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

    if (sortBy === 'match') {
      result = [...result].sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'time') {
      result = [...result].sort(
        (a, b) => a.prep_time_minutes + a.cook_time_minutes - (b.prep_time_minutes + b.cook_time_minutes)
      );
    }
    return result;
  }, [recipesWithMatch, searchQuery, selectedTag, sortBy]);

  const canMake = filteredRecipes.filter((r) => r.matchScore >= 80).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header stats */}
      <View style={[styles.headerBanner, { backgroundColor: theme.tint }]}>
        <View style={styles.bannerLeft}>
          <Text style={styles.bannerTitle}>{canMake} recipes</Text>
          <Text style={styles.bannerSubtitle}>you can make right now</Text>
        </View>
        <TouchableOpacity
          style={styles.aiButton}
          onPress={() => setShowAIModal(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="sparkles" size={16} color={theme.tint} />
          <Text style={[styles.aiButtonText, { color: theme.tint }]}>AI Recipe</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="search" size={18} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search recipes..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Sort pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {(['match', 'name', 'time'] as const).map((sort) => (
          <TouchableOpacity
            key={sort}
            style={[
              styles.sortPill,
              { borderColor: theme.border, backgroundColor: theme.surface },
              sortBy === sort && { backgroundColor: theme.tint, borderColor: theme.tint },
            ]}
            onPress={() => setSortBy(sort)}
          >
            <Text
              style={[
                styles.sortPillText,
                { color: theme.textSecondary },
                sortBy === sort && { color: '#fff' },
              ]}
            >
              {sort === 'match' ? '✅ Best Match' : sort === 'name' ? '🔤 A–Z' : '⏱ Quickest'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tag filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {TAGS.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[
              styles.tagPill,
              { borderColor: theme.border, backgroundColor: theme.surface },
              selectedTag === tag && { backgroundColor: theme.accent, borderColor: theme.accent },
            ]}
            onPress={() => setSelectedTag(tag)}
          >
            <Text
              style={[
                styles.tagPillText,
                { color: theme.textSecondary },
                selectedTag === tag && { color: '#fff' },
              ]}
            >
              {tag === 'all' ? 'All' : tag.charAt(0).toUpperCase() + tag.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Recipe list */}
      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <RecipeCard recipe={item} theme={theme} />
        )}
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

      {/* AI Recipe Modal */}
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
  headerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  bannerLeft: {},
  bannerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  bannerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 5,
  },
  aiButtonText: { fontSize: 13, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  filterScroll: { maxHeight: 48 },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
    flexDirection: 'row',
  },
  sortPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  sortPillText: { fontSize: 12, fontWeight: '600' },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  tagPillText: { fontSize: 12, fontWeight: '600' },
  listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100 },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
