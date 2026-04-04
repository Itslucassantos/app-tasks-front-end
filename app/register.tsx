import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../services/api";
import { Input } from "../components/Input";
import { borderRadius, colors, fontSize, spacing } from "../constants/theme";
import { Button } from "../components/Button";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRegister() {
    if (
      !fullName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert("Attention", "Please fill in all the fields");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 8 characters and contain uppercase, lowercase, and a special character",
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Attention", "Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await api.post("/users", { fullName, email, password });

      Alert.alert("Success", "Account created successfully", [
        { text: "Sign In", onPress: () => router.replace("/login") },
      ]);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Error creating account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={"padding"}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brandContainer}>
            <Image
              source={require("../assets/brand.png")}
              style={styles.brandImage}
              resizeMode="contain"
            />

            <Text style={styles.brandText}>Create Account</Text>

            <Text style={styles.brandSubtitle}>
              Start managing your tasks today
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Input
              label="Full Name"
              placeholder="Enter your full name..."
              placeholderTextColor={colors.icons}
              value={fullName}
              onChangeText={setFullName}
            />

            <Input
              label="Email"
              placeholder="Enter your email..."
              placeholderTextColor={colors.icons}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Password"
              placeholder="Enter your password..."
              placeholderTextColor={colors.icons}
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password..."
              placeholderTextColor={colors.icons}
              secureTextEntry={true}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <Button
              title="Create Account"
              loading={loading}
              onPress={handleRegister}
            />
          </View>
        </ScrollView>

        <Text style={styles.footerText}>
          Already have an account?{" "}
          <Text
            style={styles.footerLink}
            onPress={() => router.replace("/login")}
          >
            Sign in
          </Text>
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  brandContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  brandImage: {
    width: 60,
    height: 60,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  brandText: {
    fontSize: 34,
    fontWeight: "bold",
    color: colors.primary,
  },
  brandSubtitle: {
    color: colors.paragraph,
    fontSize: fontSize.lg,
  },
  formContainer: {
    gap: spacing.md,
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderColor: colors.borderColor,
    borderWidth: 0.5,
  },
  footerText: {
    color: colors.paragraph,
    fontSize: fontSize.md,
    textAlign: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  footerLink: {
    color: colors.green,
    fontWeight: "bold",
  },
});
