import {
  Alert,
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
import { FontAwesome5, Feather } from "@expo/vector-icons";
import { Card } from "./_components/Card";
import { FormTaskModal } from "./_components/FormTaskModal";

const now = new Date();

const dayOfWeek = now
  .toLocaleDateString("en-US", { weekday: "long" })
  .toUpperCase();

const formattedDate = now.toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const LIMIT = 10;

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const [streakDays, setStreakDays] = useState(0);
  const [dailyTasks, setDailyTasks] = useState<Task[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const isFetching = useRef(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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
    setEditingTask(task);
    setModalVisible(true);
  }

  function handleDelete(id: string) {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/tasks/${id}`);
            fetchTasks(0, true);
          } catch (error) {
            Alert.alert("Error", "Failed to delete task");
          }
        },
      },
    ]);
  }

  const completedCount = dailyTasks.filter((t) => t.completed).length;
  const totalCount = dailyTasks.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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

      <View style={styles.goalContainer}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>Daily Goal</Text>
          <Text style={styles.goalPercent}>{progressPercent}%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
          />
        </View>
        <Text style={styles.goalSubtitle}>
          {completedCount} of {totalCount} tasks completed
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Today's Focus</Text>
    </>
  );

  return (
    <View style={styles.wrapper}>
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
        ListEmptyComponent={
          <Text style={styles.empty}>No tasks for today!</Text>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditingTask(null);
          setModalVisible(true);
        }}
      >
        <Feather name="plus" size={28} color={colors.primary} />
      </TouchableOpacity>

      <FormTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={() => fetchTasks(0, true)}
        task={editingTask}
      />
    </View>
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
  wrapper: {
    flex: 1,
  },
  goalContainer: {
    marginTop: spacing.md,
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  goalTitle: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.primary,
  },
  goalPercent: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.green,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.backgroundGreen,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.green,
    borderRadius: 4,
  },
  goalSubtitle: {
    fontSize: fontSize.sm,
    color: colors.icons,
  },
  fab: {
    position: "absolute",
    bottom: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.green,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
