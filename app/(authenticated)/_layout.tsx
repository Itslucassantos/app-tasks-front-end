import { Stack } from "expo-router";

export default function AuthenticatedLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
