import {
    View,
    Text,
    StatusBar,
    Image,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator
  } from 'react-native';
  import React, { useState, useEffect } from 'react';
  import Icon from 'react-native-vector-icons/Ionicons';
  import firestore from '@react-native-firebase/firestore';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  
  export default function LoginScreen({ navigation }) {
    const [password, setPassword] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
  
    // Vérifie si un user existe déjà en local
    useEffect(() => {
      const checkUser = async () => {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          navigation.replace('Home');
        }
      };
      checkUser();
    }, []);
  
    const handleLogin = async () => {
      if (!email || !password) {
        Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
        return;
      }
  
      setLoading(true);
  
      try {
        const snapshot = await firestore()
          .collection('users')
          .where('email', '==', email.trim().toLowerCase())
          .get();
  
        if (snapshot.empty) {
          Alert.alert('Erreur', 'Aucun utilisateur trouvé avec cet email.');
          setLoading(false);
          return;
        }
  
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();
  
        if (userData.password !== password) {
          Alert.alert('Erreur', 'Mot de passe incorrect.');
          setLoading(false);
          return;
        }
  
        // Stocker en local
        await AsyncStorage.setItem('user', JSON.stringify(userData));
  
        // Rediriger vers Home
        navigation.replace('Home');
      } catch (error) {
        console.error(error);
        Alert.alert('Erreur', "Une erreur est survenue lors de la connexion.");
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <View style={{ flex: 1, alignItems: 'center' }}>
        <StatusBar backgroundColor="#087a5d" barStyle="light-content" />
        <View style={{ flex: 1, backgroundColor: '#087a5d', width: '100%' }}>
          <View style={{ flex: 0.11, justifyContent: 'center', alignItems: 'center' }}>
            <Image resizeMode="contain" style={{ width: 48, height: 48, borderRadius: 24 }} source={require('../assets/images/logo.png')} />
          </View>
          <View style={{ flex: 1, backgroundColor: '#0bcb95', borderTopLeftRadius: 37, borderTopRightRadius: 37 }}>
            <View style={{ flex: 0.16, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 24, color: 'white', fontFamily: 'Rubik Medium' }}>Connectez vous</Text>
              <Text style={{ fontSize: 12, color: 'white', fontFamily: 'Poppins Medium' }}>
                Connectez-vous et recevez des soins chez vous
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#ffffff', padding: 32, alignItems: 'center', borderTopLeftRadius: 37, borderTopRightRadius: 37 }}>
              <View style={{ marginBottom: 24, width: '100%' }}>
                <Text style={{ fontSize: 12, color: 'black', fontFamily: 'Poppins Medium', marginBottom: 8 }}>Email</Text>
                <TextInput
                  placeholder="example@gmail.com"
                  value={email}
                  onChangeText={setEmail}
                  style={{ width: '100%', height: 45, backgroundColor: '#f3f3f3', color: 'black' }}
                />
              </View>
  
              <View style={{ marginBottom: 24, width: '100%' }}>
                <Text style={{ fontSize: 12, color: 'black', fontFamily: 'Poppins Medium', marginBottom: 8 }}>Mot de passe</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f3f3', borderRadius: 8 }}>
                  <TextInput
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={secureTextEntry}
                    style={{ flex: 1, height: 45, paddingHorizontal: 10, color: 'black' }}
                  />
                  <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)} style={{ padding: 10 }}>
                    <Icon name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'} size={20} color="gray" />
                  </TouchableOpacity>
                </View>
              </View>
  
              <View style={{ width: '100%', marginTop: 12 }}>
                <TouchableOpacity
                  onPress={handleLogin}
                  style={{
                    width: '100%',
                    height: 45,
                    backgroundColor: '#0bcb95',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 8,
                  }}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={{ color: 'white', fontSize: 18, fontFamily: 'Rubik Medium' }}>Se connecter</Text>
                  )}
                </TouchableOpacity>
              </View>
  
              <View style={{ width: '100%', flex: 0.2, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                <Text style={{ color: 'black', fontSize: 14, fontFamily: 'Rubik Medium' }}>Pas encore de compte ? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('signin')}>
                  <Text style={{ color: '#0bcb95', fontSize: 14, fontFamily: 'Rubik Medium', textDecorationLine: 'underline' }}>S'inscrire</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }
  