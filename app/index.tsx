import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { colors } from "../constants/theme";

export default function Index() {
  const { loading, signed } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(authenticated)";

    if (!signed && inAuthGroup) {
      router.replace("/login");
    } else if (signed && !inAuthGroup) {
      router.replace("/(authenticated)/dashboard");
    } else if (!signed) {
      router.replace("/login");
    }
  }, [loading, signed, router]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.green} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
});
