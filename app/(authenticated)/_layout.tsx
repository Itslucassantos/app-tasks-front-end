import { Tabs } from "expo-router";
import { Menu } from "./_components/Menu";

export default function AuthenticatedLayout() {
  return (
    <Tabs
      tabBar={(props) => <Menu {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="library" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
