
export interface User {
  uid: string; // Firebase User ID
  email: string | null;
  name: string | null;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  joinDate: Date;
  initialAmount: number;
  interestRate: number;
  totalCollected: number;
  dueAmount: number;
  lastPayment: Date | null;
  userId: string; // Add userId to link members to users
}

export interface Transaction {
  id: string;
  memberId: string;
  amount: number;
  description: string;
  date: Date;
  userId: string;
  type?: string; // Add userId to link transactions to users
  category?: string;
  createdAt?: string;
}

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type RootStackParamList = {
  MainApp: undefined;
  Login: undefined;
  SignUp: undefined;
};

import { StackNavigationProp } from '@react-navigation/stack';

export interface LoginScreenProps {
  navigation: StackNavigationProp<AuthStackParamList, 'Login'>;
}

export interface SignUpScreenProps {
  navigation: StackNavigationProp<AuthStackParamList, 'SignUp'>;
}
