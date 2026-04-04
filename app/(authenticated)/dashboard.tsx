import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { colors, spacing, fontSize } from "../../constants/theme";
import api from "../../services/api";
import { useRouter } from "expo-router";
import { UserStreakResponse } from "../../types";
import { useEffect, useState } from "react";
import { FontAwesome5 } from "@expo/vector-icons";

const now = new Date();

const dayOfWeek = now
  .toLocaleDateString("en-US", { weekday: "long" })
  .toUpperCase();

const formattedDate = now.toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default function Dashboard() {
  const router = useRouter();
  const { signOut, user } = useAuth();

  const [streakDays, setStreakDays] = useState(0);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }

    getUserStreakDays(user!.id);
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

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
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
});
