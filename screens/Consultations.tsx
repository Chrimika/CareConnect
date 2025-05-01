import React, { useEffect, useRef, useState } from 'react';
import { View, Alert, StatusBar, ActivityIndicator, TouchableOpacity, StyleSheet, Image, FlatList, Text } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Mapbox, { MapView, Camera, MarkerView } from "@rnmapbox/maps";

Mapbox.setAccessToken("pk.eyJ1Ijoiam9yZWwtdGlvbWVsYSIsImEiOiJjbTdxbjhpNHgxMnFwMmpvanVwMm1odWh5In0.Sg7UkR0--3rsBywJvy3pIQ");

const hospitals = [
  {
    id: '1',
    name: 'Clinique Saint-Luc',
    latitude: 5.3489,
    longitude: -3.9894,
    price: 5000,
    rating: 4.5,
    comments: ['Service rapide', 'Médecin à l’écoute'],
    openingHours: { start: 8, end: 18 } // en heures
  },
  {
    id: '2',
    name: 'Hôpital Général de Cocody',
    latitude: 5.3550,
    longitude: -3.9900,
    price: 3000,
    rating: 4.2,
    comments: ['Un peu d’attente', 'Bon équipement'],
    openingHours: { start: 7, end: 17 }
  },
  // Ajoute-en d'autres si tu veux
];


const ConsultationScreen = () => {
  const [position, setPosition] = useState(null);
  const [currentHospitalIndex, setCurrentHospitalIndex] = useState(0);
  const [sortedHospitals, setSortedHospitals] = useState([]);
  const [route, setRoute] = useState(null);
  const [distanceText, setDistanceText] = useState('');

  const cameraRef = useRef(null);

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const goToNextHospital = () => {
    if (!sortedHospitals.length || !position) return;
    const hospital = sortedHospitals[currentHospitalIndex % sortedHospitals.length];
    setCurrentHospitalIndex(prev => prev + 1);
  
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [hospital.longitude, hospital.latitude],
        zoomLevel: 14,
        animationMode: 'flyTo',
        animationDuration: 1000,
      });
    }
  
    // tracer la ligne
    const coords = [
      [position.longitude, position.latitude],
      [hospital.longitude, hospital.latitude]
    ];
    setRoute(coords);
  
    const distanceKm = haversineDistance(position.latitude, position.longitude, hospital.latitude, hospital.longitude);
    const estimatedTimeMin = Math.ceil((distanceKm / 5) * 60); // vitesse moyenne 5km/h à pied
    setDistanceText(`${distanceKm.toFixed(2)} km (~${estimatedTimeMin} min à pied)`);
  };
  
  

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

        const sorted = hospitals
          .map(h => ({
            ...h,
            distance: haversineDistance(latitude, longitude, h.latitude, h.longitude)
          }))
          .sort((a, b) => a.distance - b.distance);
        setSortedHospitals(sorted);


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
              styleURL={'mapbox://styles/mapbox/streets-v12'}
              projection='globe'
              zoomEnabled
              rotateEnabled
              pitchEnabled
              logoEnabled={false}
              scaleBarEnabled={false}

            >
              <Camera
                ref={cameraRef}
                zoomLevel={16}
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

              {route && (
                <Mapbox.ShapeSource id="routeLine" shape={{
                  type: 'Feature',
                  geometry: {
                    type: 'LineString',
                    coordinates: route,
                  }
                }}>
                  <Mapbox.LineLayer
                    id="routeLineLayer"
                    style={{ lineColor: '#007AFF', lineWidth: 4 }}
                  />
                </Mapbox.ShapeSource>
              )}


              {hospitals.map((hospital) => (
                <MarkerView key={hospital.id} coordinate={[hospital.longitude, hospital.latitude]}>
                  <View style={{
                    height: 20,
                    width: 20,
                    backgroundColor: 'red',
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: '#fff'
                  }} />
                </MarkerView>
              ))}
              
            </MapView>

            

  
            {/* Cible placée en absolu par rapport à la carte */}
            <TouchableOpacity style={styles.targetButton} onPress={centerOnUser}>
              <Image source={require('../assets/images/target.png')} style={{ width: 24, height: 24 }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.hospitalButton} onPress={goToNextHospital}>
              <Image source={require('../assets/images/hosto.png')} style={{ width: 24, height: 24 }} />
            </TouchableOpacity>

          </View>

          <View style={{ flex: 0.3, backgroundColor: '#fff', padding: 10 }}>
          <FlatList
            data={hospitals}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={{ marginBottom: 10, padding: 10, borderRadius: 10, backgroundColor: '#f1f1f1' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.name}</Text>
                <Text>💵 Prix: {item.price} FCFA</Text>
                <Text>⭐ Note: {item.rating}/5</Text>
                <Text>🕒 Horaire: {item.openingHours.start}h - {item.openingHours.end}h</Text>
                <Text style={{ marginTop: 5 }}>💬 Commentaires:</Text>
                {item.comments.map((comment, index) => (
                  <Text key={index} style={{ fontSize: 12, marginLeft: 10 }}>• {comment}</Text>
                ))}
              </View>
            )}
          />
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
