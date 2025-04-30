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
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js'; // Import de CryptoJS

const SECRET_KEY = 'votre_clef_secrete_ici'; // Changez ceci par une clé forte et gardez-la secrète

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !phone || !email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);

    try {
      const snapshot = await firestore()
        .collection('users')
        .where('email', '==', email.trim().toLowerCase())
        .get();

      if (!snapshot.empty) {
        Alert.alert('Erreur', 'Un compte avec cet email existe déjà.');
        setLoading(false);
        return;
      }

      // Chiffrer le mot de passe
      const encryptedPassword = CryptoJS.AES.encrypt(password, SECRET_KEY).toString();

      const userData = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        password: encryptedPassword,
        createdAt: firestore.FieldValue.serverTimestamp()
      };

      const docRef = await firestore().collection('users').add(userData);

      await AsyncStorage.setItem('user', JSON.stringify({ ...userData, id: docRef.id }));

      navigation.replace('Home');
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', "Une erreur est survenue lors de l'inscription.");
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
            <Text style={{ fontSize: 24, color: 'white', fontFamily: 'Rubik Medium' }}>Créer un compte</Text>
            <Text style={{ fontSize: 12, color: 'white', fontFamily: 'Poppins Medium' }}>
              Inscrivez-vous et commencez à utiliser l'application
            </Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#ffffff', padding: 32, alignItems: 'center', borderTopLeftRadius: 37, borderTopRightRadius: 37 }}>

            {/* Nom complet */}
            <View style={{ marginBottom: 24, width: '100%' }}>
              <Text style={{ fontSize: 12, color: 'black', fontFamily: 'Poppins Medium', marginBottom: 8 }}>Nom complet</Text>
              <TextInput
                placeholder="Mika MBA"
                value={name}
                onChangeText={setName}
                style={{ width: '100%', height: 45, backgroundColor: '#f3f3f3', color: 'black' }}
              />
            </View>

            {/* Numéro de téléphone */}
            <View style={{ marginBottom: 24, width: '100%' }}>
              <Text style={{ fontSize: 12, color: 'black', fontFamily: 'Poppins Medium', marginBottom: 8 }}>Numéro de téléphone</Text>
              <TextInput
                placeholder="Ex: +2370700000000"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={{ width: '100%', height: 45, backgroundColor: '#f3f3f3', color: 'black' }}
              />
            </View>

            {/* Email */}
            <View style={{ marginBottom: 24, width: '100%' }}>
              <Text style={{ fontSize: 12, color: 'black', fontFamily: 'Poppins Medium', marginBottom: 8 }}>Email</Text>
              <TextInput
                placeholder="example@gmail.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ width: '100%', height: 45, backgroundColor: '#f3f3f3', color: 'black' }}
              />
            </View>

            {/* Mot de passe */}
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

            {/* Bouton inscription */}
            <View style={{ width: '100%', marginTop: 12 }}>
              <TouchableOpacity
                onPress={handleSignup}
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
                  <Text style={{ color: 'white', fontSize: 18, fontFamily: 'Rubik Medium' }}>S'inscrire</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Lien vers connexion */}
            <View style={{ width: '100%', flex: 0.2, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
              <Text style={{ color: 'black', fontSize: 14, fontFamily: 'Rubik Medium' }}>Déjà inscrit ? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('login')}>
                <Text style={{ color: '#0bcb95', fontSize: 14, fontFamily: 'Rubik Medium', textDecorationLine: 'underline' }}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
