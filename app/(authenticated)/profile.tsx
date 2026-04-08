import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, fontSize, spacing } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { useState } from "react";
import { Feather } from "@expo/vector-icons";
import api from "../../services/api";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

export default function Profile() {
  const { user, signOut, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const initials = (user?.fullName || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handlePickAvatar() {
    if (Platform.OS !== "web") {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please allow access to your photo library.",
        );
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: Platform.OS !== "web",
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setPreviewUri(asset.uri);

    const filename = asset.uri.split("/").pop() ?? "avatar.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    const formData = new FormData();
    if (Platform.OS === "web") {
      const res = await fetch(asset.uri);
      const blob = await res.blob();
      formData.append("file", blob, filename);
    } else {
      formData.append("file", { uri: asset.uri, name: filename, type } as any);
    }

    setAvatarLoading(true);
    try {
      const response = await api.post("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedUser = { ...user!, ...response.data };
      if (updatedUser.avatar) {
        updatedUser.avatar = `${updatedUser.avatar}?t=${Date.now()}`;
      }
      await updateUser(updatedUser);
    } catch (error) {
      setPreviewUri(null);
      Alert.alert("Error", "Failed to upload avatar. Please try again.");
    } finally {
      setAvatarLoading(false);
    }
  }

  async function handleSubmit() {
    if (!user) return;
    setLoading(true);
    try {
      const response = await api.patch(`/users/${user.id}`, { fullName });
      await updateUser({ ...user, ...response.data });
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: signOut },
    ]);
  }

  function handleDeleteAccount() {
    Alert.alert(
      "Delete Account",
      "This action is permanent and cannot be undone. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!user) return;
            try {
              await api.delete(`/users/${user.id}`);
              await signOut();
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to delete account. Please try again.",
              );
            }
          },
        },
      ],
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.avatarCard}>
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={handlePickAvatar}
          disabled={avatarLoading}
        >
          {previewUri || user?.avatar ? (
            <Image
              source={{ uri: previewUri ?? user!.avatar! }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}
          <View style={styles.avatarEditBadge}>
            <Feather name="camera" size={14} color={colors.primary} />
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarName}>{user?.fullName}</Text>
        <Text style={styles.avatarEmail}>{user?.email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Personal Info</Text>
        <Input
          label="Full Name"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter your full name"
        />
        <View style={styles.buttonWrapper}>
          <Button
            title={"Save Changes"}
            loading={loading}
            onPress={handleSubmit}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account</Text>
        <Button
          title={"Logout"}
          onPress={handleLogout}
          style={styles.logoutButton}
        />
        <View style={styles.buttonWrapper}>
          <Button
            title={"Delete Account"}
            onPress={handleDeleteAccount}
            style={styles.deleteButton}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  avatarCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.lg,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: spacing.sm,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.backgroundGreen,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarInitials: {
    fontSize: fontSize.xxl,
    fontWeight: "700",
    color: colors.primary,
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.green,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarName: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.primary,
    marginTop: spacing.xs,
  },
  avatarEmail: {
    fontSize: fontSize.sm,
    color: colors.icons,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.md,
  },
  buttonWrapper: {
    marginTop: spacing.sm,
  },
  logoutButton: {
    backgroundColor: colors.backgroundGreen,
  },
  deleteButton: {
    backgroundColor: "#fa9999",
  },
});
