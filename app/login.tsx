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
import { useAuth } from "../contexts/AuthContext";
import { Input } from "../components/Input";
import { borderRadius, colors, fontSize, spacing } from "../constants/theme";
import { Button } from "../components/Button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Attention", "Please fill in all the fields");
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);

      router.replace("/(authenticated)/dashboard");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Error logging in");
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

            <Text style={styles.brandText}>Welcome Back</Text>

            <Text style={styles.brandSubtitle}>
              Manage your tasks efficiently
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Input
              label="Email"
              placeholder="Enter your email..."
              placeholderTextColor={colors.icons}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <Input
              label="Password"
              placeholder="Enter your password..."
              placeholderTextColor={colors.icons}
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
            />

            <Button title="Sign In" loading={loading} onPress={handleLogin} />
          </View>

          <Text style={styles.footerText}>
            Don{"'"}t have an account?{" "}
            <Text
              style={styles.footerLink}
              onPress={() => router.replace("/register")}
            >
              Create an account
            </Text>
          </Text>
        </ScrollView>
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
    justifyContent: "center",
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
  },
  brandContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  brandImage: {
    width: 60,
    height: 60,
    marginBottom: spacing.md,
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
  },
  footerLink: {
    color: colors.green,
    fontWeight: "bold",
  },
});
