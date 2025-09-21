
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Platform, ActivityIndicator, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList, LoginScreenProps } from '../types';
import { useAuth } from '../auth/AuthContext';

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const result = await signIn(email, password);
    setIsLoading(false);

    if (result.success) {
      // Navigation handled by auth state
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.authContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.authScrollContainer}>
        <View style={styles.authHeader}>
          <Ionicons name="wallet" size={60} color="#2f95dc" />
          <Text style={styles.authTitle}>Cash Collection Tracker</Text>
          <Text style={styles.authSubtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.authForm}>
          <View style={styles.authInputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.authInputIcon} />
            <TextInput
              style={styles.authInput}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.authInputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.authInputIcon} />
            <TextInput
              style={styles.authInput}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.authButton, isLoading && styles.authDisabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.authButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.authLink}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.authLinkText}>
              Don't have an account? <Text style={styles.authLinkHighlight}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  authContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  authScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2f95dc',
    marginTop: 15,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  authForm: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  authInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  authInputIcon: {
    marginRight: 10,
  },
  authInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  authButton: {
    backgroundColor: '#2f95dc',
    borderRadius: 5,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  authDisabledButton: {
    opacity: 0.7,
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  authLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  authLinkText: {
    color: '#666',
  },
  authLinkHighlight: {
    color: '#2f95dc',
    fontWeight: 'bold',
  },
});
