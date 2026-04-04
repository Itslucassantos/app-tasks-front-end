import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { colors, spacing, fontSize } from "../../../constants/theme";

type TabConfig = {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
};

const tabs: TabConfig[] = [
  {
    name: "dashboard",
    label: "Dashboard",
    icon: "home-outline",
    iconFocused: "home",
  },
  {
    name: "library",
    label: "Library",
    icon: "book-outline",
    iconFocused: "book",
  },
  {
    name: "profile",
    label: "Profile",
    icon: "person-outline",
    iconFocused: "person",
  },
];

export function Menu({ state, navigation, insets }: BottomTabBarProps) {
  return (
    <View
      style={[styles.container, { paddingBottom: insets.bottom + spacing.sm }]}
    >
      {state.routes.map((route, index) => {
        const tab = tabs.find((t) => t.name === route.name);
        if (!tab) return null;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isFocused ? tab.iconFocused : tab.icon}
              size={24}
              color={isFocused ? colors.green : colors.icons}
            />
            <Text style={[styles.label, isFocused && styles.labelFocused]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderColor,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.icons,
  },
  labelFocused: {
    color: colors.green,
    fontWeight: "600",
  },
});
