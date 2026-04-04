import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../constants/theme";

export default function Profile() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
  },
});
