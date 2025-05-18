import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, ActivityIndicator, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import Geolocation from 'react-native-geolocation-service';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import firestore from '@react-native-firebase/firestore';
import axios from 'axios';
import RNFS from 'react-native-fs';
import auth from '@react-native-firebase/auth';

const daysOfWeek = [
  { label: 'Lundi', value: 'monday' },
  { label: 'Mardi', value: 'tuesday' },
  { label: 'Mercredi', value: 'wednesday' },
  { label: 'Jeudi', value: 'thursday' },
  { label: 'Vendredi', value: 'friday' },
  { label: 'Samedi', value: 'saturday' },
  { label: 'Dimanche', value: 'sunday' },
];

const consultationDurations = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '1 heure', value: 60 },
  { label: '1 heure 30', value: 90 },
];

const AddHospitalScreen = ({ navigation }) => {
  const [hospitalName, setHospitalName] = useState('');
  const [logoUri, setLogoUri] = useState(null);
  const [openingHours, setOpeningHours] = useState({});
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [consultationDuration, setConsultationDuration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Charger les heures d'ouverture par défaut
  useEffect(() => {
    const defaultHours = {};
    daysOfWeek.forEach(day => {
      defaultHours[day.value] = { open: '08:00', close: '18:00', closed: false };
    });
    setOpeningHours(defaultHours);
  }, []);

  const selectLogo = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (!response.didCancel && !response.error) {
        setLogoUri(response.assets[0].uri);
      }
    });
  };

  const confirmLocation = () => {
    Alert.alert(
      'Confirmation de position',
      'Voulez-vous utiliser votre position actuelle comme emplacement pour cet hôpital?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Confirmer',
          onPress: getCurrentLocation,
        },
      ],
    );
  };

  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      
      if (response.data && response.data.address) {
        const addr = response.data.address;
        // Construction de l'adresse à partir des composants disponibles
        let fullAddress = '';
        if (addr.road) fullAddress += addr.road + ', ';
        if (addr.neighbourhood) fullAddress += addr.neighbourhood + ', ';
        if (addr.suburb) fullAddress += addr.suburb + ', ';
        if (addr.city) fullAddress += addr.city + ', ';
        if (addr.country) fullAddress += addr.country;
        
        return fullAddress.trim().replace(/,$/, '');
      }
      return '';
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'adresse:', error);
      return '';
    }
  };

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const status = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      
      if (status === RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({
              latitude,
              longitude,
            });
            
            // Récupération de l'adresse
            const addr = await getAddressFromCoordinates(latitude, longitude);
            setAddress(addr);
            
            Alert.alert('Succès', 'Position et adresse enregistrées avec succès');
            setLocationLoading(false);
          },
          (error) => {
            Alert.alert('Erreur', 'Impossible de récupérer la position');
            setLocationLoading(false);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } else {
        Alert.alert('Erreur', 'Permission de localisation refusée');
        setLocationLoading(false);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Permission de localisation refusée');
      setLocationLoading(false);
    }
  };

  const handleTimeChange = (day, field, value) => {
    setOpeningHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const toggleDayClosed = (day) => {
    setOpeningHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        closed: !prev[day].closed
      }
    }));
  };

  const uploadImageToCloudinary = async (uri) => {
    try {
      const uploadPreset = 'hospital_logos';
      const cloudName = 'dfy1qwmte';
      const apiKey = 'gtCkBMkhgFMbNlImues9Uu-v7dU';

      const base64File = await RNFS.readFile(uri, 'base64');

      const formData = new FormData();
      formData.append('file', `data:image/jpeg;base64,${base64File}`);
      formData.append('upload_preset', uploadPreset);
      formData.append('cloud_name', cloudName);
      formData.append('api_key', apiKey);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.secure_url;
    } catch (error) {
      console.error('Erreur upload Cloudinary:', error);
      throw new Error("Échec de l'upload de l'image");
    }
  };

  const createHospital = async () => {
    if (!hospitalName || !consultationDuration) {
      Alert.alert('Erreur', 'Le nom et la durée de consultation sont obligatoires');
      return;
    }

    setLoading(true);

    try {
      // 1. Upload du logo
      let logoUrl = '';
      if (logoUri) {
        logoUrl = await uploadImageToCloudinary(logoUri);
      }

      const adminId = auth().currentUser?.uid;
      if (!adminId) {
        throw new Error("Admin non connecté");
      }
  
      // 3. Création de l'hôpital avec toutes les données
      await firestore().collection('hospitals').add({
        name: hospitalName,
        logo: logoUrl,
        address: address,
        location: location ? new firestore.GeoPoint(location.latitude, location.longitude) : null,
        openingHours: openingHours,
        consultationDuration: parseInt(consultationDuration),
        adminId: adminId,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
  

      Alert.alert('Succès', 'Hôpital créé avec succès');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Nouvel Hôpital</Text>

      {/* Nom de l'hôpital */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nom de l'hôpital *</Text>
        <TextInput
          style={styles.input}
          value={hospitalName}
          onChangeText={setHospitalName}
          placeholder="Entrez le nom de l'hôpital"
        />
      </View>

      {/* Logo */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Logo</Text>
        <Pressable style={styles.logoButton} onPress={selectLogo}>
          {logoUri ? (
            <Image source={{ uri: logoUri }} style={styles.logoPreview} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Icon name="camera" size={30} color="#09d1a0" />
              <Text style={styles.logoText}>Ajouter un logo</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Localisation */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Localisation</Text>
        <Pressable 
          style={styles.locationButton} 
          onPress={confirmLocation}
          disabled={locationLoading}
        >
          {locationLoading ? (
            <ActivityIndicator size="small" color="#09d1a0" />
          ) : (
            <>
              <Icon name="location" size={20} color="#09d1a0" />
              <Text style={styles.locationText}>
                {location ? 'Position enregistrée' : 'Obtenir ma position actuelle'}
              </Text>
            </>
          )}
        </Pressable>
        {location && (
          <>
            <Text style={styles.locationCoords}>
              Lat: {location.latitude.toFixed(4)}, Long: {location.longitude.toFixed(4)}
            </Text>
            {address ? (
              <Text style={styles.addressText}>
                Adresse: {address}
              </Text>
            ) : null}
          </>
        )}
      </View>

      {/* Durée de consultation */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Durée moyenne de consultation *</Text>
        <View style={styles.durationContainer}>
          {consultationDurations.map(duration => (
            <Pressable
              key={duration.value}
              style={[
                styles.durationButton,
                consultationDuration === duration.value && styles.durationButtonSelected
              ]}
              onPress={() => setConsultationDuration(duration.value)}
            >
              <Text style={[
                styles.durationText,
                consultationDuration === duration.value && styles.durationTextSelected
              ]}>
                {duration.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Horaires d'ouverture */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Horaires d'ouverture</Text>
        {daysOfWeek.map(day => (
          <View key={day.value} style={styles.dayContainer}>
            <Pressable 
              style={styles.dayCheckbox} 
              onPress={() => toggleDayClosed(day.value)}
            >
              <Icon 
                name={openingHours[day.value]?.closed ? 'square-outline' : 'checkbox'} 
                size={24} 
                color="#09d1a0" 
              />
              <Text style={styles.dayText}>{day.label}</Text>
            </Pressable>

            {!openingHours[day.value]?.closed && (
              <View style={styles.timeInputs}>
                <TextInput
                  style={styles.timeInput}
                  value={openingHours[day.value]?.open}
                  onChangeText={(text) => handleTimeChange(day.value, 'open', text)}
                  placeholder="08:00"
                />
                <Text style={styles.timeSeparator}>-</Text>
                <TextInput
                  style={styles.timeInput}
                  value={openingHours[day.value]?.close}
                  onChangeText={(text) => handleTimeChange(day.value, 'close', text)}
                  placeholder="18:00"
                />
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Bouton de soumission */}
      <Pressable 
        style={styles.submitButton} 
        onPress={createHospital}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Créer l'hôpital</Text>
        )}
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#09d1a0',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  logoButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoPlaceholder: {
    alignItems: 'center',
  },
  logoText: {
    color: '#09d1a0',
    marginTop: 8,
  },
  logoPreview: {
    width: '100%',
    height: '100%',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
  },
  locationText: {
    marginLeft: 10,
    color: '#09d1a0',
  },
  locationCoords: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  durationButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    width: '48%',
    alignItems: 'center',
  },
  durationButtonSelected: {
    backgroundColor: '#09d1a0',
    borderColor: '#09d1a0',
  },
  durationText: {
    color: '#333',
  },
  durationTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  dayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dayCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dayText: {
    marginLeft: 10,
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 6,
    width: 70,
    textAlign: 'center',
  },
  timeSeparator: {
    marginHorizontal: 5,
  },
  submitButton: {
    backgroundColor: '#09d1a0',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 40,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddHospitalScreen;