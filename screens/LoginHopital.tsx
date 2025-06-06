import {
    View,
    Text,
    StatusBar,
    Image,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    StyleSheet
  } from 'react-native';
  import React, { useState, useEffect } from 'react';
  import Icon from 'react-native-vector-icons/Ionicons';
  import auth from '@react-native-firebase/auth';
  import firestore from '@react-native-firebase/firestore';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  
  export default function LoginHopitalScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      const checkUser = async () => {
        const user = await AsyncStorage.getItem('user');
        const space = await AsyncStorage.getItem('space');
        if (user && space === 'Hospital') {
          navigation.replace('HomeHopital');
        }
      };
      checkUser();
  
      const unsubscribe = auth().onAuthStateChanged(user => {
        if (user) {
          fetchUserData(user.uid);
        }
      });
      return unsubscribe;
    }, []);
  
    const fetchUserData = async (uid) => {
      try {
        const doc = await firestore().collection('users').doc(uid).get();
        if (doc.exists) {
          const userData = doc.data();
          if (userData.role === 'Admin') {
            await AsyncStorage.setItem('user', JSON.stringify({ uid, ...userData }));
            await AsyncStorage.setItem('space', 'Hospital');
            navigation.replace('HomeHopital');
          } else {
            Alert.alert('Accès refusé', 'Ce compte n\'est pas un administrateur hospitalier.');
            await auth().signOut();
          }
        }
      } catch (error) {
        console.error("Erreur récupération données:", error);
      }
    };
  
    const handleLogin = async () => {
      if (!email || !password) {
        Alert.alert('Erreur', 'Email et mot de passe requis');
        return;
      }
  
      setLoading(true);
      try {
        const { user } = await auth().signInWithEmailAndPassword(email, password);
        await fetchUserData(user.uid);
      } catch (error) {
        handleAuthError(error);
      } finally {
        setLoading(false);
      }
    };
  
    const handleAuthError = (error) => {
      console.error(error);
      let message = "Échec de la connexion";
      switch(error.code) {
        case 'auth/user-not-found':
          message = "Aucun compte avec cet email"; break;
        case 'auth/wrong-password':
          message = "Mot de passe incorrect"; break;
        case 'auth/invalid-email':
          message = "Format d'email invalide"; break;
      }
      Alert.alert('Erreur', message);
    };
  
    return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor={'transparent'} barStyle={'light-content'} />      
        <View style={styles.header}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.logo} 
          />
        </View>
  
        <View style={styles.formContainer}>
          <Text style={styles.title}>Connexion Hôpital</Text>
          <Text style={styles.subtitle}>Administrateur uniquement</Text>
  
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="admin@hopital.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>
  
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.passwordInput}>
              <TextInput
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secureTextEntry}
                style={styles.passwordField}
              />
              <TouchableOpacity 
                onPress={() => setSecureTextEntry(!secureTextEntry)}
                style={styles.eyeIcon}
              >
                <Icon 
                  name={secureTextEntry ? 'eye-off' : 'eye'} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
          </View>
  
          <TouchableOpacity
            onPress={handleLogin}
            style={styles.button}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Se connecter</Text>
            )}
          </TouchableOpacity>
  
          <View style={styles.signupLink}>
            <Text style={styles.signupText}>Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('signup')}>
              <Text style={styles.signupLinkText}>S'inscrire</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#087a5d'
    },
    header: {
      paddingVertical: 30,
      alignItems: 'center'
    },
    logo: {
      width: 70,
      height: 70,
      borderRadius: 35
    },
    formContainer: {
      flex: 1,
      backgroundColor: 'white',
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      paddingHorizontal: 25,
      paddingTop: 40
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#087a5d',
      textAlign: 'center',
      marginBottom: 5
    },
    subtitle: {
      color: '#666',
      textAlign: 'center',
      marginBottom: 30
    },
    inputGroup: {
      marginBottom: 20
    },
    label: {
      color: '#333',
      marginBottom: 8,
      fontWeight: '500'
    },
    input: {
      backgroundColor: '#f5f5f5',
      padding: 15,
      borderRadius: 10,
      fontSize: 16
    },
    passwordInput: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
      borderRadius: 10
    },
    passwordField: {
      flex: 1,
      padding: 15,
      fontSize: 16
    },
    eyeIcon: {
      padding: 15
    },
    button: {
      backgroundColor: '#0bcb95',
      padding: 16,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10
    },
    buttonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold'
    },
    signupLink: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 25
    },
    signupText: {
      color: '#666'
    },
    signupLinkText: {
      color: '#0bcb95',
      fontWeight: 'bold'
    }
  });
  