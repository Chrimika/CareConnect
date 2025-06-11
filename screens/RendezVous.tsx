import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
import 'moment/locale/fr';

moment.locale('fr');

const ConsultationsScreen = ({ route, navigation }) => {
  const hospital = route.params?.hospital || {};
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [availableSlots, setAvailableSlots] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Charger les médecins et les créneaux
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!hospital.id) return;

        // 1. Charger les médecins de l'hôpital
        const hospitalDoc = await firestore()
          .collection('hospitals')
          .doc(hospital.id)
          .get();
        
        const doctorsIds = hospitalDoc.data()?.medecins || [];
        
        if (doctorsIds.length > 0) {
          const snapshot = await firestore()
            .collection('medecins')
            .where(firestore.FieldPath.documentId(), 'in', doctorsIds)
            .get();
          
          setDoctors(snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            specialite: doc.data().specialite || 'Généraliste'
          })));
        }

        // 2. Charger les créneaux disponibles
        await fetchSlotsForDate(selectedDate);
        
      } catch (error) {
        console.error("Erreur:", error);
        Alert.alert("Erreur", "Impossible de charger les données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hospital.id]);

  // Charger les créneaux pour une date spécifique
  const fetchSlotsForDate = async (date) => {
    setLoading(true);
    try {
      const snapshot = await firestore()
        .collection('plannings')
        .where('hospitalId', '==', hospital.id)
        .where('date', '==', date)
        .where('status', '==', 'available')
        .get();

      const slots = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setAvailableSlots(slots);
      updateCalendarMarkings(date, slots);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour les marquages du calendrier
  const updateCalendarMarkings = (selectedDate, slots) => {
    const markings = {};
    const startDate = moment();
    const endDate = moment().add(60, 'days');

    // Trouver toutes les dates avec créneaux disponibles
    const availableDates = {};
    slots.forEach(slot => {
      availableDates[slot.date] = true;
    });

    for (let day = moment(startDate); day.isBefore(endDate); day.add(1, 'days')) {
      const dateStr = day.format('YYYY-MM-DD');
      markings[dateStr] = {
        disabled: !availableDates[dateStr],
        marked: availableDates[dateStr],
        dotColor: '#09d1a0'
      };
    }

    // Mettre en évidence la date sélectionnée
    if (markings[selectedDate]) {
      markings[selectedDate] = {
        ...markings[selectedDate],
        selected: true,
        selectedColor: '#09d1a0'
      };
    }

    setMarkedDates(markings);
  };

  // Gérer le changement de date
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    fetchSlotsForDate(date);
  };

  // Filtrer les créneaux par médecin
  const filteredSlots = selectedDoctor
    ? availableSlots.filter(slot => slot.doctorId === selectedDoctor.id)
    : availableSlots;

  // Confirmer le rendez-vous
  const confirmAppointment = async () => {
    if (!selectedSlot) return;
    
    try {
      const user = auth().currentUser;
      if (!user) {
        navigation.navigate('Auth');
        return;
      }

      // 1. Créer le rendez-vous
      await firestore().collection('appointments').add({
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        userId: user.uid,
        userName: user.displayName || 'Patient',
        doctorId: selectedSlot.doctorId,
        doctorName: doctors.find(d => d.id === selectedSlot.doctorId)?.prenom + ' ' + 
                   doctors.find(d => d.id === selectedSlot.doctorId)?.nom,
        date: selectedSlot.date,
        time: selectedSlot.time,
        status: 'confirmed',
        createdAt: firestore.FieldValue.serverTimestamp()
      });

      // 2. Mettre à jour le créneau
      await firestore()
        .collection('plannings')
        .doc(selectedSlot.id)
        .update({
          status: 'booked',
          bookedBy: user.uid
        });

      Alert.alert(
        'Rendez-vous confirmé',
        `Votre consultation est confirmée pour le ${moment(selectedSlot.date).format('dddd D MMMM')} à ${selectedSlot.time}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Erreur', "Impossible de confirmer le rendez-vous");
    }
  };

  // Afficher un créneau horaire
  const renderTimeSlot = ({ item }) => {
    const doctor = doctors.find(d => d.id === item.doctorId);
    return (
      <TouchableOpacity
        style={[
          styles.timeSlot,
          selectedSlot?.id === item.id && styles.selectedTimeSlot
        ]}
        onPress={() => setSelectedSlot(item)}
      >
        <Text style={styles.timeSlotTime}>{item.time}</Text>
        {doctor && (
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>Dr. {doctor.prenom}</Text>
            <Text style={styles.doctorSpecialty}>{doctor.specialite}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#09d1a0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#09d1a0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prendre rendez-vous</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Informations hôpital */}
      <View style={styles.hospitalCard}>
        {hospital.logo && (
          <Image source={{ uri: hospital.logo }} style={styles.hospitalLogo} />
        )}
        <View style={styles.hospitalInfo}>
          <Text style={styles.hospitalName}>{hospital.name}</Text>
          <Text style={styles.hospitalAddress}>
            <Icon name="location-outline" size={14} color="#666" /> {hospital.address}
          </Text>
        </View>
      </View>

      {/* Filtres médecins */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.doctorsScroll}
        contentContainerStyle={styles.doctorsContainer}
      >
        <TouchableOpacity
          style={[
            styles.doctorFilter,
            !selectedDoctor && styles.selectedDoctorFilter
          ]}
          onPress={() => setSelectedDoctor(null)}
        >
          <Text style={[
            styles.doctorFilterText,
            !selectedDoctor && styles.selectedDoctorFilterText
          ]}>
            Tous les médecins
          </Text>
        </TouchableOpacity>
        
        {doctors.map(doctor => (
          <TouchableOpacity
            key={doctor.id}
            style={[
              styles.doctorFilter,
              selectedDoctor?.id === doctor.id && styles.selectedDoctorFilter
            ]}
            onPress={() => setSelectedDoctor(doctor)}
          >
            <Text style={[
              styles.doctorFilterText,
              selectedDoctor?.id === doctor.id && styles.selectedDoctorFilterText
            ]}>
              Dr. {doctor.prenom}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Calendrier */}
      <View style={styles.calendarContainer}>
        <Calendar
          current={selectedDate}
          minDate={moment().format('YYYY-MM-DD')}
          maxDate={moment().add(60, 'days').format('YYYY-MM-DD')}
          onDayPress={(day) => handleDateSelect(day.dateString)}
          markedDates={markedDates}
          theme={{
            calendarBackground: '#fff',
            selectedDayBackgroundColor: '#09d1a0',
            selectedDayTextColor: '#fff',
            todayTextColor: '#09d1a0',
            dayTextColor: '#333',
            textDisabledColor: '#ddd',
            monthTextColor: '#333',
            arrowColor: '#09d1a0',
            dotColor: '#09d1a0'
          }}
        />
      </View>

      {/* Créneaux disponibles */}
      <View style={styles.slotsContainer}>
        <Text style={styles.sectionTitle}>
          Disponibilités - {moment(selectedDate).format('dddd D MMMM')}
        </Text>
        
        {filteredSlots.length > 0 ? (
          <FlatList
            data={filteredSlots}
            renderItem={renderTimeSlot}
            keyExtractor={item => item.id}
            numColumns={2}
            columnWrapperStyle={styles.slotsGrid}
            contentContainerStyle={styles.slotsList}
          />
        ) : (
          <View style={styles.noSlots}>
            <Icon name="calendar-outline" size={40} color="#ccc" />
            <Text style={styles.noSlotsText}>
              {selectedDoctor 
                ? "Aucun créneau disponible pour ce médecin" 
                : "Aucun créneau disponible pour cette date"}
            </Text>
          </View>
        )}
      </View>

      {/* Bouton de confirmation */}
      {selectedSlot && (
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={confirmAppointment}
        >
          <Text style={styles.confirmButtonText}>
            Confirmer à {selectedSlot.time}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  hospitalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    margin: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  hospitalLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  hospitalAddress: {
    fontSize: 14,
    color: '#666',
  },
  doctorsScroll: {
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  doctorsContainer: {
    paddingHorizontal: 15,
  },
  doctorFilter: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
  },
  selectedDoctorFilter: {
    backgroundColor: '#09d1a0',
    borderColor: '#09d1a0',
  },
  doctorFilterText: {
    fontSize: 14,
    color: '#666',
  },
  selectedDoctorFilterText: {
    color: '#fff',
  },
  calendarContainer: {
    margin: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  slotsContainer: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  slotsList: {
    paddingBottom: 20,
  },
  slotsGrid: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeSlot: {
    width: '48%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
  },
  selectedTimeSlot: {
    borderColor: '#09d1a0',
    backgroundColor: '#f0f9f7',
  },
  timeSlotTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  doctorInfo: {
    marginTop: 5,
  },
  doctorName: {
    fontSize: 14,
    color: '#333',
  },
  doctorSpecialty: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  noSlots: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noSlotsText: {
    marginTop: 15,
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
  },
  confirmButton: {
    margin: 15,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#09d1a0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export {ConsultationsScreen};

