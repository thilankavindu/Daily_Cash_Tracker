
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../src/auth/AuthContext';
import { useRouter } from 'expo-router';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter both email and password.');
      return;
    }
    try {
      await login(email, password);
      // The AuthProvider will handle the navigation to the main app
      console.log('Login successful!');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'An unknown error occurred.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome Back</Text>
      <Text style={styles.subtitle}>Log in to manage your finances.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Log In</Text>
      </TouchableOpacity>

      <View style={styles.registerPromptContainer}>
        <Text style={styles.registerPromptText}>No account yet? </Text>
        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={styles.registerLink}>Register here</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8fafc', // slate-50
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#047857', // emerald-700
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#64748b', // slate-500
    marginBottom: 32,
  },
  input: {
    height: 50,
    borderColor: '#cbd5e1', // slate-300
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#059669', // emerald-600
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerPromptContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerPromptText: {
    fontSize: 14,
    color: '#475569', // slate-600
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669', // emerald-600
  },
});

export default LoginScreen;
