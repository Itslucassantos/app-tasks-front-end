import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { LoginResponse, User } from "../types";
import api from "../services/api";

interface AuthProviderProps {
  children: React.ReactNode;
}

interface AuthContextData {
  user: User | null;
  signed: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updatedUser: User) => Promise<void>;
}

const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [signed, setSigned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadData() {
      await loadStorageData();
    }

    loadData();
  }, []);

  async function loadStorageData() {
    try {
      setLoading(true);
      const storedToken = await AsyncStorage.getItem("@token:tasks");
      const storedUser = await AsyncStorage.getItem("@user:tasks");

      if (storedToken && storedUser) {
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        setUser(JSON.parse(storedUser));
        setSigned(true);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const response = await api.post<LoginResponse>("/auth", {
        email: email,
        password: password,
      });

      const { token, ...userData } = response.data;

      await AsyncStorage.setItem("@token:tasks", token);
      await AsyncStorage.setItem("@user:tasks", JSON.stringify(userData));

      setUser(userData);
    } catch (error) {
      console.log(error);
    }
  }

  async function signOut() {
    try {
      await AsyncStorage.removeItem("@token:tasks");
      await AsyncStorage.removeItem("@user:tasks");

      setUser(null);
    } catch (error) {
      console.log(error);
    }
  }

  async function updateUser(updatedUser: User) {
    try {
      await AsyncStorage.setItem("@user:tasks", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <AuthContext
      value={{
        signed: !!user,
        loading,
        signIn,
        user,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("Context not found");
  }

  return context;
}
