import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { Task } from "../../../types";
import {
  borderRadius,
  colors,
  fontSize,
  spacing,
} from "../../../constants/theme";

interface CardProps {
  task: Task;
  completed: boolean;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const frequencyLabel: Record<Task["frequency"], string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

export function Card({
  task,
  completed,
  onToggleComplete,
  onEdit,
  onDelete,
}: CardProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onToggleComplete(task.id)}
        style={styles.checkbox}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completed }}
      >
        <Ionicons
          name={completed ? "checkbox" : "square-outline"}
          size={24}
          color={completed ? colors.green : colors.borderColor}
        />
      </TouchableOpacity>

      <View style={styles.info}>
        <Text
          style={[styles.title, completed && styles.titleCompleted]}
          numberOfLines={1}
        >
          {task.title}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{frequencyLabel[task.frequency]}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {menuVisible && (
          <>
            <TouchableOpacity
              hitSlop={8}
              onPress={() => {
                setMenuVisible(false);
                onEdit(task);
              }}
            >
              <FontAwesome
                name="pencil-square-o"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              hitSlop={8}
              onPress={() => {
                setMenuVisible(false);
                onDelete(task.id);
              }}
            >
              <FontAwesome name="trash" size={24} color={colors.primary} />
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity
          hitSlop={8}
          onPress={() => setMenuVisible((v) => !v)}
          accessibilityLabel="Opções"
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.icons} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  checkbox: {
    padding: spacing.xs,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.primary,
  },
  titleCompleted: {
    textDecorationLine: "line-through",
    color: colors.icons,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.backgroundGreen,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: fontSize.sm,
    color: colors.green,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
});
