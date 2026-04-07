import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import {
  borderRadius,
  colors,
  fontSize,
  spacing,
} from "../../../constants/theme";
import api from "../../../services/api";
import { Frequency, Task } from "../../../types";

const FREQUENCY_OPTIONS: Frequency[] = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"];

interface FormTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task?: Task | null;
}

export function FormTaskModal({
  visible,
  onClose,
  onSuccess,
  task,
}: FormTaskModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("DAILY");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setCategory(task.category ?? "");
      setFrequency(task.frequency);
    } else {
      setTitle("");
      setCategory("");
      setFrequency("DAILY");
    }
  }, [task, visible]);

  async function handleSubmit() {
    if (!title.trim()) {
      Alert.alert("Attention", "Please fill in the title");
      return;
    }

    try {
      setLoading(true);
      if (task) {
        await api.patch<Task>(`/tasks/${task.id}`, {
          title,
          category,
          frequency,
        });
      } else {
        await api.post<Task>("/tasks", { title, category, frequency });
      }
      onSuccess();
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to save task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView style={styles.overlay} behavior="padding">
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{task ? "Edit Task" : "New Task"}</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.form}>
              <Input
                label="Title"
                placeholder="Enter task title..."
                placeholderTextColor={colors.icons}
                value={title}
                onChangeText={setTitle}
              />

              <Input
                label="Category"
                placeholder="Enter category..."
                placeholderTextColor={colors.icons}
                value={category}
                onChangeText={setCategory}
              />

              <View>
                <Text style={styles.label}>Frequency</Text>
                <View style={styles.frequencyRow}>
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[
                        styles.frequencyOption,
                        frequency === opt && styles.frequencyOptionSelected,
                      ]}
                      onPress={() => setFrequency(opt)}
                    >
                      <Text
                        style={[
                          styles.frequencyText,
                          frequency === opt && styles.frequencyTextSelected,
                        ]}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Button
                title={task ? "Update Task" : "Create Task"}
                loading={loading}
                onPress={handleSubmit}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.primary,
  },
  form: {
    gap: spacing.md,
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderColor: colors.borderColor,
    borderWidth: 0.5,
    marginBottom: spacing.md,
  },
  label: {
    color: colors.primary,
    fontSize: fontSize.lg,
    marginBottom: spacing.sm,
  },
  frequencyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  frequencyOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderColor,
    backgroundColor: colors.backgroundInput,
  },
  frequencyOptionSelected: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  frequencyText: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.icons,
  },
  frequencyTextSelected: {
    color: colors.primary,
  },
});
