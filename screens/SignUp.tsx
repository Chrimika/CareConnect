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
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      // Créer l'utilisateur avec Firebase Auth
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      
      // Stocker les infos supplémentaires dans Firestore
      await firestore()
        .collection('users')
        .doc(userCredential.user.uid)
        .set({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          createdAt: firestore.FieldValue.serverTimestamp()
        });

      // Stocker les données minimales en local
      await AsyncStorage.setItem('user', JSON.stringify({
        uid: userCredential.user.uid,
        name: name.trim(),
        email: email.trim().toLowerCase()
      }));

      navigation.replace('Home');
    } catch (error) {
      console.error(error);
      let errorMessage = "Une erreur est survenue lors de l'inscription.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Un compte avec cet email existe déjà.';
      }
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <StatusBar translucent backgroundColor={'transparent'} barStyle={'light-content'} />
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

            {/* Champs du formulaire */}
            <View style={{ marginBottom: 24, width: '100%' }}>
              <Text style={{ fontSize: 12, color: 'black', fontFamily: 'Poppins Medium', marginBottom: 8 }}>Nom complet</Text>
              <TextInput
                placeholder="Mika MBA"
                value={name}
                onChangeText={setName}
                style={{ width: '100%', height: 45, backgroundColor: '#f3f3f3', color: 'black' }}
              />
            </View>

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

            {/* Bouton d'inscription */}
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
            <View style={{ borderWidth:1,borderColor:'transparent',width: '100%', flex: 0.5, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
              <Text style={{ color: 'black', fontSize: 14, fontFamily: 'Rubik Medium' }}>J'ai un hopital ? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('signup-admin')}>
                <Text style={{ color: '#0bcb95', fontSize: 14, fontFamily: 'Rubik Medium', textDecorationLine: 'underline' }}>inscriription admin</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}