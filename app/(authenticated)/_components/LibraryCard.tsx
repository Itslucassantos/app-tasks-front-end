import { View, Text, StyleSheet } from "react-native";
import {
  borderRadius,
  colors,
  fontSize,
  spacing,
} from "../../../constants/theme";
import { Task } from "../../../types";

const frequencyLabel: Record<Task["frequency"], string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

interface LibraryCardProps {
  task: Task;
}

export function LibraryCard({ task }: LibraryCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title} numberOfLines={1}>
        {task.title}
      </Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{frequencyLabel[task.frequency]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  title: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.primary,
    marginRight: spacing.sm,
  },
  badge: {
    backgroundColor: colors.backgroundGreen,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: fontSize.sm,
    color: colors.green,
    fontWeight: "600",
  },
});
