import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { borderRadius, colors, fontSize, spacing } from "../../constants/theme";
import { Frequency, Task } from "../../types";
import api from "../../services/api";
import { LibraryCard } from "./_components/LibraryCard";

const PAGE_SIZE = 4;

const SECTIONS: { frequency: Frequency; label: string }[] = [
  { frequency: "DAILY", label: "Daily Tasks" },
  { frequency: "WEEKLY", label: "Weekly Tasks" },
  { frequency: "MONTHLY", label: "Monthly Tasks" },
  { frequency: "YEARLY", label: "Yearly Tasks" },
];

interface TaskSectionProps {
  frequency: Frequency;
  label: string;
  searchQuery: string;
  refreshKey: number;
}

function TaskSection({
  frequency,
  label,
  searchQuery,
  refreshKey,
}: TaskSectionProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(
    async (currentPage: number, query: string) => {
      setLoading(true);
      try {
        const response = await api.get<Task[]>("/tasks", {
          params: {
            frequency,
            status: "all",
            limit: PAGE_SIZE + 1,
            offset: currentPage * PAGE_SIZE,
            ...(query ? { q: query } : {}),
          },
        });
        setHasNext(response.data.length > PAGE_SIZE);
        setTasks(response.data.slice(0, PAGE_SIZE));
      } catch (error) {
        console.log(`Failed to fetch ${frequency} tasks`, error);
      } finally {
        setLoading(false);
      }
    },
    [frequency],
  );

  useEffect(() => {
    setPage(0);
    fetchTasks(0, searchQuery);
  }, [searchQuery, refreshKey, fetchTasks]);

  function handlePrev() {
    const newPage = page - 1;
    setPage(newPage);
    fetchTasks(newPage, searchQuery);
  }

  function handleNext() {
    const newPage = page + 1;
    setPage(newPage);
    fetchTasks(newPage, searchQuery);
  }

  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.title}>{label}</Text>

      {loading ? (
        <ActivityIndicator
          size="small"
          color={colors.icons}
          style={sectionStyles.loader}
        />
      ) : tasks.length === 0 ? (
        <Text style={sectionStyles.empty}>No tasks found.</Text>
      ) : (
        tasks.map((task, index) => (
          <View key={task.id}>
            <LibraryCard task={task} />
            {index < tasks.length - 1 && (
              <View style={sectionStyles.separator} />
            )}
          </View>
        ))
      )}

      <View style={sectionStyles.pagination}>
        <TouchableOpacity
          onPress={handlePrev}
          disabled={page === 0 || loading}
          style={[
            sectionStyles.arrowBtn,
            (page === 0 || loading) && sectionStyles.arrowBtnDisabled,
          ]}
        >
          <Ionicons
            name="chevron-back"
            size={18}
            color={page === 0 || loading ? colors.borderColor : colors.primary}
          />
        </TouchableOpacity>

        <Text style={sectionStyles.pageText}>Page {page + 1}</Text>

        <TouchableOpacity
          onPress={handleNext}
          disabled={!hasNext || loading}
          style={[
            sectionStyles.arrowBtn,
            (!hasNext || loading) && sectionStyles.arrowBtnDisabled,
          ]}
        >
          <Ionicons
            name="chevron-forward"
            size={18}
            color={!hasNext || loading ? colors.borderColor : colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  loader: {
    marginVertical: spacing.md,
  },
  empty: {
    fontSize: fontSize.sm,
    color: colors.paragraph,
    marginVertical: spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderColor,
    opacity: 0.3,
    marginVertical: spacing.xs,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  pageText: {
    fontSize: fontSize.sm,
    color: colors.paragraph,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderColor,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowBtnDisabled: {
    borderColor: colors.borderColor,
    opacity: 0.4,
  },
});

export default function Library() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((k) => k + 1);
    }, []),
  );

  function handleSearchChange(text: string) {
    setSearchQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(text);
    }, 400);
  }

  function clearSearch() {
    setSearchQuery("");
    setDebouncedQuery("");
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons
          name="search"
          size={18}
          color={colors.icons}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title or category..."
          placeholderTextColor={colors.borderColor}
          value={searchQuery}
          onChangeText={handleSearchChange}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.icons} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {SECTIONS.map(({ frequency, label }) => (
          <TaskSection
            key={frequency}
            frequency={frequency}
            label={label}
            searchQuery={debouncedQuery}
            refreshKey={refreshKey}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    height: 44,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.primary,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
});
