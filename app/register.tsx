
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../src/auth/AuthContext';
import { useRouter } from 'expo-router';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    try {
      await register(name, email, password);
      // On successful registration, you might want to automatically log them in
      // and navigate to the main part of the app.
      // For now, we'll just log the success and let the AuthProvider handle the state change.
      console.log('Registration successful!');
    } catch (error: any) {
      alert(`Registration failed: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create Account</Text>
      <Text style={styles.subtitle}>Get started with your personal finance tracker.</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
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

      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>

      <View style={styles.loginPromptContainer}>
        <Text style={styles.loginPromptText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.loginLink}>Log in</Text>
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
  registerButton: {
    backgroundColor: '#059669', // emerald-600
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginPromptContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginPromptText: {
    fontSize: 14,
    color: '#475569', // slate-600
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669', // emerald-600
  },
});

export default RegisterScreen;
