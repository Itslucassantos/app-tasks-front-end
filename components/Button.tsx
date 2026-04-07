import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { borderRadius, colors, fontSize, spacing } from "../constants/theme";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
}

export function Button({
  title,
  loading = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled === true || loading;

  return (
    <TouchableOpacity
      disabled={isDisabled}
      style={[styles.button, isDisabled && styles.buttonDisabled, style]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={colors.background} />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.green,
  },
  buttonDisabled: {
    backgroundColor: colors.backgroundGreen,
  },
  buttonText: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: "600",
  },
});
