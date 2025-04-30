import React, { useEffect, useRef, useState } from 'react';
import { View, Alert, StatusBar, ActivityIndicator, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Mapbox, { MapView, Camera, MarkerView } from "@rnmapbox/maps";

Mapbox.setAccessToken("pk.eyJ1Ijoiam9yZWwtdGlvbWVsYSIsImEiOiJjbTdxbjhpNHgxMnFwMmpvanVwMm1odWh5In0.Sg7UkR0--3rsBywJvy3pIQ");

const ConsultationScreen = () => {
  const [position, setPosition] = useState(null);
  const cameraRef = useRef(null);

  const getPosition = async () => {
    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        setPosition({ latitude, longitude });
        await AsyncStorage.setItem('userPosition', JSON.stringify({ latitude, longitude }));
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

  useEffect(() => {
    getPosition();
    const interval = setInterval(() => {
      getPosition();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const centerOnUser = () => {
    if (position && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [position.longitude, position.latitude],
        zoomLevel: 15,
        animationMode: 'flyTo',
        animationDuration: 1000,
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5FCFF' }}>
      <StatusBar translucent backgroundColor={'transparent'} barStyle={'dark-content'} />
  
      {position ? (
        <View style={{ flex: 1 }}>
          {/* Carte + bouton dans un conteneur relatif */}
          <View style={{ flex: 0.7, position: 'relative',borderBottomLeftRadius:25 }}>
            <MapView
              style={{ flex: 1, borderBottomLeftRadius:15}}
              styleURL={'mapbox://styles/mapbox/outdoors-v12'}
              projection='globe'
              zoomEnabled
              rotateEnabled
              pitchEnabled
              logoEnabled={false}
              scaleBarEnabled={false}

            >
              <Camera
                ref={cameraRef}
                zoomLevel={15}
                centerCoordinate={[position.longitude, position.latitude]}
                animationMode='flyTo'
                animationDuration={2000}
              />
              <MarkerView coordinate={[position.longitude, position.latitude]}>
                <View style={{
                  height: 20,
                  width: 20,
                  backgroundColor: 'blue',
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: '#fff'
                }} />
              </MarkerView>
            </MapView>
  
            {/* Cible placée en absolu par rapport à la carte */}
            <TouchableOpacity style={styles.targetButton} onPress={centerOnUser}>
              <Image source={require('../assets/images/target.png')} style={{ width: 24, height: 24 }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.hospitalButton} onPress={() => console.log('Chercher hôpital')}>
              <Image source={require('../assets/images/hosto.png')} style={{ width: 24, height: 24 }} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1, justifyContent: 'center' }} />
      )}
    </View>
  );
  
};

const styles = StyleSheet.create({
  targetButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  hospitalButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  
});

export default ConsultationScreen;
