import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth'; // Importer Firebase Auth pour récupérer l'ID utilisateur
import AsyncStorage from '@react-native-async-storage/async-storage';

const ConsultationScreen = () => {
  const [position, setPosition] = useState(null);
  
  // Fonction pour obtenir la position de l'utilisateur
  const getPosition = async () => {
    const user = auth().currentUser; // Récupérer l'utilisateur connecté
    if (!user) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Mettre à jour l'état local avec la nouvelle position
        setPosition({ latitude, longitude });

        // Sauvegarder la position localement avec AsyncStorage
        await AsyncStorage.setItem('userPosition', JSON.stringify({ latitude, longitude }));

        // Mettre à jour la position dans Firestore
        await firestore().collection('users').doc(user.uid).update({
          position: new firestore.GeoPoint(latitude, longitude),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      },
      (error) => {
        console.warn(error);
        Alert.alert('Erreur', 'Impossible d\'obtenir la position de l\'utilisateur.');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  // Mettre à jour la position toutes les 30 secondes
  useEffect(() => {
    getPosition(); // Appeler immédiatement pour obtenir la première position

    const interval = setInterval(() => {
      getPosition();
    }, 30000); // Toutes les 30 secondes

    return () => clearInterval(interval); // Nettoyer l'intervalle quand le composant est démonté
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Position actuelle de l'utilisateur :</Text>
      {position ? (
        <Text>Latitude: {position.latitude} / Longitude: {position.longitude}</Text>
      ) : (
        <Text>Chargement de la position...</Text>
      )}
    </View>
  );
};

export default ConsultationScreen;
