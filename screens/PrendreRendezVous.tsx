import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView,StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, Pressable } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Calendar } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';

export default function PrendreRendezVousScreen({ navigation, route }) {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [loading, setLoading] = useState(false);

  const [selectedSpecialite, setSelectedSpecialite] = useState('');
  const [specialites, setSpecialites] = useState([]);

  // Charger les hôpitaux
  useEffect(() => {
    const fetchHospitals = async () => {
      setLoading(true);
      const snap = await firestore().collection('hospitals').get();
      setHospitals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchHospitals();
  }, []);

  // Charger les médecins de l'hôpital sélectionné
  useEffect(() => {
    if (!selectedHospital) return;
    setSelectedDoctor(null);
    setDoctors([]);
    setSelectedDate(null);
    setSlots([]);
    const fetchDoctors = async () => {
      setLoading(true);
      const hosp = await firestore().collection('hospitals').doc(selectedHospital.id).get();
      const medecinsIds = hosp.data()?.medecins || [];
      if (medecinsIds.length === 0) {
        setDoctors([]);
        setLoading(false);
        return;
      }
      const snap = await firestore()
        .collection('medecins')
        .where(firestore.FieldPath.documentId(), 'in', medecinsIds)
        .get();
      setDoctors(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchDoctors();
  }, [selectedHospital]);

  // Met à jour la liste des spécialités quand les médecins changent
  useEffect(() => {
    if (!doctors.length) {
      setSpecialites([]);
      setSelectedSpecialite('');
      return;
    }
    const specs = Array.from(new Set(doctors.map(d => d.specialite).filter(Boolean)));
    setSpecialites(specs);
    setSelectedSpecialite('');
  }, [doctors]);

  // Charger les créneaux pour le médecin et la date sélectionnés
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) return;
    setSlots([]);
    const fetchSlots = async () => {
      setLoading(true);
      try {
        // 1. Trouver le jour de la semaine (fr)
        const jours = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
        const dayName = jours[new Date(selectedDate).getDay()];

        // 2. Récupérer le document "jour"
        const jourSnap = await firestore()
          .collection('jours')
          .where('nom', '==', dayName)
          .limit(1)
          .get();
        if (jourSnap.empty) {
          setSlots([]);
          setLoading(false);
          return;
        }
        const jourDoc = jourSnap.docs[0];
        const jourId = jourDoc.id;

        // 3. Récupérer les plages horaires de ce jour
        const plagesSnap = await firestore()
          .collection('plageHoraires')
          .where('id_jour', '==', jourId)
          .get();
        const plages = plagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 4. Vérifier les consultations déjà prises pour ce médecin, ce jour, cette date
        const consultSnap = await firestore()
          .collection('consultations')
          .where('doctorId', '==', selectedDoctor.id)
          .where('date', '==', selectedDate)
          .get();
        const plagesReservees = consultSnap.docs.map(doc => doc.data().plageId);

        // 5. Formater les slots pour l'affichage
        const slots = plages.map(pl => ({
          id: pl.id,
          heureDebut: pl.heureDebut,
          heureFin: pl.heureFin,
          time: `${pl.heureDebut} - ${pl.heureFin}`,
          status: plagesReservees.includes(pl.id) ? 'reserved' : 'available',
        }));

        setSlots(slots);
      } catch (e) {
        setSlots([]);
      }
      setLoading(false);
    };
    fetchSlots();
  }, [selectedDoctor, selectedDate]);

  // Prendre rendez-vous
  const handleBookConsultation = async (plage) => {
    try {
      setLoading(true);
      const user = auth().currentUser;
      if (!user) {
        Alert.alert('Erreur', 'Vous devez être connecté');
        setLoading(false);
        return;
      }

      // Vérifie si la plage est déjà réservée (optionnel)
      const plageDoc = await firestore().collection('plageHoraires').doc(plage.id).get();
      if (plageDoc.data()?.reserved) {
        Alert.alert('Ce créneau vient d\'être réservé');
        setLoading(false);
        return;
      }

      // Crée la consultation
      const consultationRef = await firestore().collection('consultations').add({
        patientId: user.uid,
        patientName: user.displayName || '',
        doctorId: selectedDoctor.id,
        doctorName: `${selectedDoctor.prenom} ${selectedDoctor.nom}`,
        hospitalId: selectedHospital.id,
        hospitalName: selectedHospital.name,
        date: selectedDate,
        heureDebut: plage.heureDebut,
        heureFin: plage.heureFin,
        plageId: plage.id,
        status: 'confirmed',
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // Marque la plage comme réservée (optionnel)
      await firestore().collection('plageHoraires').doc(plage.id).update({
        reserved: true,
        consultationId: consultationRef.id,
      });

      Alert.alert('Succès', 'Votre rendez-vous est confirmé !', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de réserver ce créneau');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (route?.params?.hospital) {
      setSelectedHospital(route.params.hospital);
    }
  }, [route?.params?.hospital]);

  // Filtre les médecins selon la spécialité choisie
  const filteredDoctors = selectedSpecialite
    ? doctors.filter(d => d.specialite === selectedSpecialite)
    : doctors;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Prendre rendez-vous</Text>
      {/* 1. Choix de l'hôpital */}
      <View>
        <Text style={styles.label}>Choisissez un hôpital</Text>
        <FlatList
          data={hospitals}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={[
          styles.chip,
          selectedHospital?.id === item.id && styles.chipSelected
              ]}
              onPress={() => setSelectedHospital(item)}
            >
              <Text style={{ color: selectedHospital?.id === item.id ? '#fff' : '#09d1a0' }}>
          {item.name}
              </Text>
            </Pressable>
          )}
          contentContainerStyle={{ marginBottom: 2 }} // Réduit l'espacement ici
        />
      </View>
      

      {/* 2. Choix du médecin */}
      {selectedHospital && (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5, marginTop: 10 }}>
            <Text style={styles.label}>Choisissez un médecin</Text>
            {specialites.length > 1 && (
              <Picker
                selectedValue={selectedSpecialite}
                onValueChange={setSelectedSpecialite}
                style={{ height: 30, width: 160, marginLeft: 10 }}
                mode="dropdown"
                dropdownIconColor="#09d1a0"
              >
                <Picker.Item label="Toutes spécialités" value="" />
                {specialites.map(s => (
                  <Picker.Item key={s} label={s} value={s} />
                ))}
              </Picker>
            )}
          </View>
          <FlatList
            data={filteredDoctors}
            horizontal
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.chip,
                  selectedDoctor?.id === item.id && styles.chipSelected,
                  !selectedHospital && { opacity: 0.5 }
                ]}
                onPress={() => selectedHospital && setSelectedDoctor(item)}
                disabled={!selectedHospital}
              >
                <Text style={{ color: selectedDoctor?.id === item.id ? '#fff' : '#09d1a0' }}>
                  Dr {item.prenom} {item.nom}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ marginBottom: 10 }}
          />
        </>
      )}

      {/* 3. Choix de la date */}
      {selectedDoctor && (
        <>
          <Text style={styles.label}>Choisissez une date</Text>
          <Calendar
            onDayPress={day => setSelectedDate(day.dateString)}
            markedDates={selectedDate ? { [selectedDate]: { selected: true, selectedColor: '#09d1a0' } } : {}}
            minDate={new Date().toISOString().split('T')[0]}
            style={{ marginBottom: 10 }}
          />
        </>
      )}

      {/* 4. Choix du créneau */}
      {selectedDate && (
        <>
          <Text style={styles.label}>Choisissez un créneau</Text>
          {loading ? (
            <ActivityIndicator color="#09d1a0" />
          ) : slots.length === 0 ? (
            <Text style={{ color: 'gray', marginBottom: 10 }}>Aucun créneau ce jour</Text>
          ) : (
            <FlatList
              style={{ marginBottom: 15 }}
              data={slots}
              numColumns={2}
              keyExtractor={item => item.id}
              renderItem={({ item }) => {
                const isAvailable = item.status === 'available';
                const isSelected = selectedSlot?.id === item.id;
                return (
                  <Pressable
                    style={[
                      styles.slot,
                      isSelected && styles.slotSelected,
                      !isAvailable && styles.slotDisabled
                    ]}
                    onPress={() => isAvailable && setSelectedSlot(item)}
                    disabled={!isAvailable}
                  >
                    <Text style={{
                      color: isAvailable ? (isSelected ? '#fff' : '#09d1a0') : '#aaa',
                      fontWeight: 'bold',
                      fontSize: 16,
                    }}>
                      {item.time}
                    </Text>
                    <Text style={{
                      color: isAvailable ? (isSelected ? '#fff' : '#09d1a0') : '#aaa',
                      fontSize: 12,
                      marginTop: 4,
                    }}>
                      {isAvailable ? 'Disponible' : 'Réservé'}
                    </Text>
                  </Pressable>
                );
              }}
              contentContainerStyle={{ marginBottom: 10 }}
            />
          )}
        </>
      )}

      {/* 5. Résumé du rendez-vous */}
      {selectedSlot && (
        <View style={{
          backgroundColor: '#f0f9f7',
          borderRadius: 8,
          padding: 12,
          marginVertical: 10,
          borderWidth: 1,
          borderColor: '#09d1a0'
        }}>
          <Text style={{ fontWeight: 'bold', color: '#09d1a0', marginBottom: 4 }}>Résumé du rendez-vous :</Text>
          <Text>Médecin : Dr {selectedDoctor.prenom} {selectedDoctor.nom}</Text>
          <Text>Date : {selectedDate}</Text>
          <Text>Créneau : {selectedSlot.time}</Text>
        </View>
      )}

      {/* 6. Bouton de confirmation */}
      {selectedSlot && (
        <Pressable
          style={styles.bookBtn}
          onPress={() => handleBookConsultation(selectedSlot)}
          disabled={loading}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
            Confirmer le rendez-vous
          </Text>
        </Pressable>
      )}

      {loading && <ActivityIndicator color="#09d1a0" style={{ marginTop: 10 }} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff',paddingBottom:40 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#000', marginBottom: 20,marginTop:20 },
  label: { fontWeight: 'bold', color: '#333', marginBottom: 5, marginTop: 10 },
  chip: {
    borderWidth: 1,
    borderColor: '#09d1a0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    backgroundColor: '#fff',
    maxHeight: 40,
  },
  chipSelected: {
    backgroundColor: '#09d1a0',
    borderColor: '#09d1a0',
  },
  slot: {
    flex: 1,
    margin: 5,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#09d1a0',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom:10
  },
  slotSelected: {
    backgroundColor: '#09d1a0',
  },
  slotDisabled: {
    backgroundColor: '#eee',
    borderColor: '#ccc',
  },
  bookBtn: {
    backgroundColor: '#09d1a0',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom:30
  },
});