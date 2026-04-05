import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { colors, spacing, fontSize } from "../../constants/theme";
import api from "../../services/api";
import { useRouter } from "expo-router";
import { Task, UserStreakResponse } from "../../types";
import { useEffect, useRef, useState } from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import { Card } from "./_components/Card";

const now = new Date();

const dayOfWeek = now
  .toLocaleDateString("en-US", { weekday: "long" })
  .toUpperCase();

const formattedDate = now.toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const LIMIT = 2;

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const [streakDays, setStreakDays] = useState(0);
  const [dailyTasks, setDailyTasks] = useState<Task[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const isFetching = useRef(false);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    getUserStreakDays(user.id);
    fetchTasks(0, true);
  }, [user]);

  async function getUserStreakDays(userId: string) {
    try {
      const response = await api.get<UserStreakResponse>(
        `/users/streak/${userId}`,
      );
      setStreakDays(response.data.streak);
    } catch (error) {
      console.log("Failed to fetch streak:", error);
    }
  }

  async function fetchTasks(currentOffset: number, reset = false) {
    if (isFetching.current) return;
    isFetching.current = true;
    if (!reset) setLoadingMore(true);

    try {
      const response = await api.get<Task[]>("/tasks", {
        params: { limit: LIMIT, offset: currentOffset, status: "all" },
      });

      const fetched = response.data;

      setDailyTasks((prev) => (reset ? fetched : [...prev, ...fetched]));
      setOffset(currentOffset + fetched.length);
      setHasMore(fetched.length === LIMIT);
    } catch (error) {
      console.log("Failed to fetch daily tasks", error);
    } finally {
      isFetching.current = false;
      setLoadingMore(false);
    }
  }

  function handleLoadMore() {
    if (hasMore && !isFetching.current) {
      fetchTasks(offset);
    }
  }

  async function handleToggleComplete(id: string) {
    setDailyTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );

    try {
      await api.post<Task>("/tasks/complete", { id: id });
      getUserStreakDays(user!.id);
      fetchTasks(0, true);
    } catch (error) {
      setDailyTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
      );
      console.log("Failed to toggle task completion", error);
    }
  }

  function handleEdit(task: Task) {
    console.log("Edit task:", task.id);
  }

  function handleDelete(id: string) {
    console.log("Delete task:", id);
  }

  const ListHeader = (
    <>
      <View style={styles.header}>
        <Text style={styles.dayOfWeek}>{dayOfWeek}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>

      <View style={styles.streakContainer}>
        <View style={styles.streakIcon}>
          <FontAwesome5 name="fire" size={32} color={colors.green} />
        </View>
        <Text style={styles.streakTitle}>{streakDays} Day Streak!</Text>
        <Text style={styles.streakSubtitle}>
          You're on fire, {user?.fullName}!
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Today's Focus</Text>
    </>
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.listContent}
      data={dailyTasks}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={ListHeader}
      renderItem={({ item }) => (
        <Card
          task={item}
          completed={item.completed}
          onToggleComplete={handleToggleComplete}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator
            size="small"
            color={colors.icons}
            style={styles.footer}
          />
        ) : hasMore ? (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={handleLoadMore}
          >
            <Text style={styles.loadMoreText}>Load more</Text>
          </TouchableOpacity>
        ) : null
      }
      ListEmptyComponent={<Text style={styles.empty}>No tasks for today!</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  dayOfWeek: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    letterSpacing: 1.5,
    color: colors.icons,
  },
  date: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.primary,
    marginTop: spacing.xs,
  },
  streakContainer: {
    marginTop: spacing.md,
    alignItems: "center",
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  streakTitle: {
    fontSize: fontSize.xxl,
    fontWeight: "700",
    color: colors.primary,
  },
  streakSubtitle: {
    fontSize: fontSize.md,
    fontWeight: "500",
    color: colors.icons,
    marginTop: spacing.xs,
  },
  streakIcon: {
    backgroundColor: colors.backgroundGreen,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  separator: {
    height: spacing.sm,
  },
  footer: {
    marginVertical: spacing.md,
  },
  loadMoreButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    backgroundColor: colors.green,
    borderColor: colors.borderColor,
    borderRadius: 8,
  },
  loadMoreText: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.primary,
  },
  empty: {
    textAlign: "center",
    color: colors.icons,
    marginTop: spacing.lg,
    fontSize: fontSize.md,
  },
});
