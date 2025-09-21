
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Platform, ActivityIndicator, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList, SignUpScreenProps } from '../types';
import { useAuth } from '../auth/AuthContext';

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    const result = await signUp(name, email, password, confirmPassword);
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
          <Text style={styles.authTitle}>Create Account</Text>
          <Text style={styles.authSubtitle}>Sign up to get started</Text>
        </View>

        <View style={styles.authForm}>
          <View style={styles.authInputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.authInputIcon} />
            <TextInput
              style={styles.authInput}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
            />
          </View>

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

          <View style={styles.authInputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.authInputIcon} />
            <TextInput
              style={styles.authInput}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.authButton, isLoading && styles.authDisabledButton]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.authButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.authLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.authLinkText}>
              Already have an account? <Text style={styles.authLinkHighlight}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;

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
