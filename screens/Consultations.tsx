import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  TextInput,
  Alert,
  Pressable,
  Animated,
  Dimensions,
  PanResponder,
  ScrollView
} from 'react-native';
import Mapbox, { Camera, LineLayer, MapView, MarkerView, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import 'moment/locale/fr';

moment.locale('fr');

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.6;

// Configuration Mapbox
Mapbox.setAccessToken('pk.eyJ1IjoibWlrYS1tYmEiLCJhIjoiY21heDI1ZjlpMDFmNjJrcHJmemI1cHl1bSJ9.X0S79u0BD7Xn2WIJypQWsg');

const HospitalListScreen = ({ navigation }) => {
  const [hospitals, setHospitals] = useState([]);
  const [sortedHospitals, setSortedHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [route, setRoute] = useState(null);
  const [distanceText, setDistanceText] = useState('');
  const [consultCount, setConsultCount] = useState(0);
  
  const cameraRef = useRef(null);
  const mapRef = useRef(null);
  
  // Animation pour le bottom sheet
  const bottomSheetAnim = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  // PanResponder pour gérer le glissement du bottom sheet
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 20;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          bottomSheetAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > BOTTOM_SHEET_HEIGHT * 0.3) {
          hideBottomSheet();
        } else {
          showBottomSheet();
        }
      },
    })
  ).current;

  // Récupérer la position et les hôpitaux
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get user location
        const position = await new Promise((resolve, reject) => {
          Geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000
          });
        });
        
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });

        // 2. Fetch hospitals from Firestore
        const unsubscribe = firestore()
          .collection('hospitals')
          .onSnapshot(snapshot => {
            const hospitalsData = snapshot.docs.map(doc => {
              const data = doc.data();
              const location = data.location 
                ? { latitude: data.location.latitude, longitude: data.location.longitude }
                : null;
              
              return {
                id: doc.id,
                ...data,
                location,
                distance: location 
                  ? haversineDistance(latitude, longitude, location.latitude, location.longitude)
                  : null
              };
            });

            // Sort by distance
            const sorted = [...hospitalsData].sort((a, b) => a.distance - b.distance);
            setHospitals(hospitalsData);
            setSortedHospitals(sorted);
            setLoading(false);

            // Set initial camera position with 3km zoom
            if (cameraRef.current) {
              cameraRef.current.setCamera({
                centerCoordinate: [longitude, latitude],
                zoomLevel: 13.5, // Approximativement 3km de rayon
                animationMode: 'flyTo',
                animationDuration: 2000,
              });
            }
          });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Consultations count effect
  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;
    const unsubscribe = firestore()
      .collection('consultations')
      .where('patientId', '==', user.uid)
      .onSnapshot(snap => {
        setConsultCount(snap.size);
      });
    return () => unsubscribe();
  }, []);

  // Calcul de distance haversine
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Afficher le bottom sheet
  const showBottomSheet = () => {
    Animated.parallel([
      Animated.timing(bottomSheetAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Masquer le bottom sheet
  const hideBottomSheet = () => {
    Animated.parallel([
      Animated.timing(bottomSheetAnim, {
        toValue: BOTTOM_SHEET_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSelectedHospital(null);
      setRoute(null);
      setDistanceText('');
    });
  };

  // Obtenir l'itinéraire réel
  const getRealRoute = async (start, end) => {
    try {
      const startCoords = `${start[0]},${start[1]}`;
      const endCoords = `${end[0]},${end[1]}`;
      
      const response = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${startCoords};${endCoords}?geometries=geojson&access_token=pk.eyJ1IjoibWlrYS1tYmEiLCJhIjoiY21heDI1ZjlpMDFmNjJrcHJmemI1cHl1bSJ9.X0S79u0BD7Xn2WIJypQWsg`
      );
      
      if (response.data?.routes?.[0]) {
        return {
          route: response.data.routes[0].geometry,
          distance: response.data.routes[0].distance / 1000,
          duration: Math.ceil(response.data.routes[0].duration / 60)
        };
      }
    } catch (err) {
      console.error('Error fetching route:', err);
    }
    return null;
  };

  // Gérer la sélection d'un hôpital
  const handleHospitalPress = async (hospital) => {
    setSelectedHospital(hospital);
    showBottomSheet();

    // Centrer la carte sur l'hôpital
    if (hospital.location && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [hospital.location.longitude, hospital.location.latitude],
        zoomLevel: 15,
        animationMode: 'flyTo',
        animationDuration: 1000,
      });
    }

    // Calculer l'itinéraire
    if (userLocation && hospital.location) {
      const routeData = await getRealRoute(
        [userLocation.longitude, userLocation.latitude],
        [hospital.location.longitude, hospital.location.latitude]
      );
      
      if (routeData) {
        setRoute({
          type: 'Feature',
          geometry: routeData.route
        });
        setDistanceText(`${routeData.distance.toFixed(1)} km (~${routeData.duration} min)`);
      } else {
        const distance = haversineDistance(
          userLocation.latitude,
          userLocation.longitude,
          hospital.location.latitude,
          hospital.location.longitude
        );
        setDistanceText(`${distance.toFixed(1)} km`);
      }
    }
  };

  // Recentrer sur la position utilisateur
  const centerOnUser = () => {
    if (!userLocation || !cameraRef.current) {
      Alert.alert('Position non disponible', 'Impossible de recentrer sur votre position.');
      return;
    }

    cameraRef.current.setCamera({
      centerCoordinate: [userLocation.longitude, userLocation.latitude],
      zoomLevel: 13.5,
      animationMode: 'flyTo',
      animationDuration: 1000,
    });
  };

  // Filtrer les hôpitaux selon la recherche
  const filteredHospitals = sortedHospitals.filter(hospital =>
    hospital.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hospital.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#09d1a0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map Container - Plein écran */}
      <MapView
        ref={mapRef}
        style={styles.map}
        styleURL={'mapbox://styles/mapbox/streets-v11'}
        rotateEnabled={false}
        pitchEnabled={false}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <Camera
          ref={cameraRef}
          zoomLevel={13.5}
          centerCoordinate={
            userLocation
              ? [userLocation.longitude, userLocation.latitude]
              : [0, 0]
          }
        />

        {/* User Location Marker */}
        {userLocation && (
          <MarkerView coordinate={[userLocation.longitude, userLocation.latitude]}>
            <View style={styles.userMarker}>
              <View style={styles.userMarkerInner} />
            </View>
          </MarkerView>
        )}

        {/* Hospitals Markers */}
        {filteredHospitals.map((hospital) =>
          hospital.location ? (
            <MarkerView
              key={hospital.id}
              coordinate={[hospital.location.longitude, hospital.location.latitude]}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <Pressable onPress={() => handleHospitalPress(hospital)}>
                <View
                  style={[
                    styles.hospitalMarker,
                    selectedHospital?.id === hospital.id && styles.selectedHospitalMarker,
                  ]}
                >
                  <Icon name="medical" size={16} color="white" />
                </View>
              </Pressable>
            </MarkerView>
          ) : null
        )}

        {/* Route Layer */}
        {route && (
          <ShapeSource id="routeSource" shape={route}>
            <LineLayer
              id="routeLayer"
              style={{
                lineColor: '#09d1a0',
                lineWidth: 3,
                lineOpacity: 0.7,
              }}
            />
          </ShapeSource>
        )}
      </MapView>

      {/* Search Bar - Au dessus de la carte */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un hôpital..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
      </View>

      {/* Map Controls */}
      <Pressable style={[styles.mapButton, styles.targetButton]} onPress={centerOnUser}>
        <Icon name="locate" size={20} color="#09d1a0" />
      </Pressable>

      {/* Floating Action Button for Consultation History */}
      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('HistoriqueConsultations')}
      >
        <Icon name="time-outline" size={28} color="#fff" />
        {consultCount > 0 && (
          <View style={styles.fabBadge}>
            <Text style={styles.fabBadgeText}>{consultCount}</Text>
          </View>
        )}
      </Pressable>

      {/* Backdrop */}
      {selectedHospital && (
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropAnim,
            },
          ]}
        >
          <Pressable style={styles.backdropPress} onPress={hideBottomSheet} />
        </Animated.View>
      )}

      {/* Bottom Sheet */}
      {selectedHospital && (
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY: bottomSheetAnim }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Handle */}
          <View style={styles.bottomSheetHandle} />

          {/* Hospital Content */}
          <View style={styles.bottomSheetContent}>
            {/* Hospital Header */}
            <View style={styles.hospitalHeader}>
              {selectedHospital.logo ? (
                <Image source={{ uri: selectedHospital.logo }} style={styles.hospitalLogo} />
              ) : (
                <View style={styles.hospitalLogoPlaceholder}>
                  <Icon name="medical" size={32} color="#fff" />
                </View>
              )}
              
              <View style={styles.hospitalInfo}>
                <Text style={styles.hospitalName}>
                  {selectedHospital.name || 'Nom inconnu'}
                </Text>
                <Text style={styles.hospitalAddress}>
                  <Icon name="location" size={14} color="#666" /> 
                  {selectedHospital.address || 'Adresse inconnue'}
                </Text>
                {distanceText && (
                  <Text style={styles.hospitalDistance}>
                    <Icon name="walk" size={14} color="#09d1a0" /> {distanceText}
                  </Text>
                )}
              </View>
            </View>

            {/* Hospital Details */}
            <View style={styles.hospitalDetails}>
              <Text style={styles.sectionTitle}>Informations</Text>

              {/* Téléphone */}
              {selectedHospital.phone && (
                <View style={styles.infoRow}>
                  <Icon name="call" size={16} color="#666" />
                  <Text style={styles.infoText}>{selectedHospital.phone}</Text>
                </View>
              )}

              {/* Email */}
              {selectedHospital.email && (
                <View style={styles.infoRow}>
                  <Icon name="mail" size={16} color="#666" />
                  <Text style={styles.infoText}>{selectedHospital.email}</Text>
                </View>
              )}

              {/* Spécialités */}
              {selectedHospital.specialties && selectedHospital.specialties.length > 0 && (
                <View style={styles.infoRow}>
                  <Icon name="medical" size={16} color="#666" />
                  <Text style={styles.infoText}>
                    {selectedHospital.specialties.join(', ')}
                  </Text>
                </View>
              )}

              {/* Horaires d'ouverture */}
              {selectedHospital.openingHours && (
                <View style={styles.openingHoursContainer}>
                  <Text style={styles.sectionTitle}>Horaires d'ouverture</Text>
                  <View style={styles.openingHoursScrollContainer}>
                    <ScrollView>
                      {Object.entries(selectedHospital.openingHours).map(([day, hours]) => (
                        <Text key={day} style={styles.openingHoursText}>
                          {`${day.charAt(0).toUpperCase() + day.slice(1)} : `}
                          {hours.closed ? 'Fermé' : `${hours.open} - ${hours.close}`}
                        </Text>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              )}
            </View>

            {/* Action Button */}
            <Pressable
              style={styles.appointmentButton}
              onPress={() => {
                hideBottomSheet();
                navigation.navigate('PrendreRendezVous', { hospital: selectedHospital });
              }}
            >
              <Icon name="calendar" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.appointmentButtonText}>Prendre Rendez-vous</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 1000,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'UbuntuMono-Bold',
  },
  searchIcon: {
    marginLeft: 10,
  },
  userMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#09d1a0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#09d1a0',
  },
  hospitalMarker: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#09d1a0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  selectedHospitalMarker: {
    backgroundColor: '#ff6b6b',
    transform: [{ scale: 1.2 }],
  },
  mapButton: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  targetButton: {
    bottom: 30,
    right: 30,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    backgroundColor: '#09d1a0',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  fabBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 1000,
  },
  backdropPress: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BOTTOM_SHEET_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    zIndex: 1001,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  hospitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  hospitalLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  hospitalLogoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#09d1a0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    fontFamily: 'UbuntuMono-Bold',
  },
  hospitalAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontFamily: 'UbuntuMono-Bold',
  },
  hospitalDistance: {
    fontSize: 14,
    color: '#09d1a0',
    fontWeight: '500',
    fontFamily: 'UbuntuMono-Bold',
  },
  hospitalDetails: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    fontFamily: 'UbuntuMono-Bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
    fontFamily: 'UbuntuMono-Bold',
  },
  openingHoursContainer: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  openingHoursScrollContainer: {
    maxHeight: 120,
  },
  openingHoursText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontFamily: 'UbuntuMono-Bold',
  },
  appointmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#09d1a0',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginTop: 10,
  },
  buttonIcon: {
    marginRight: 10,
  },
  appointmentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'UbuntuMono-Bold',
  },
});

export { HospitalListScreen };