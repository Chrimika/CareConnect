import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  Alert, 
  Pressable, 
  Image,
  Dimensions 
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Calendar } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

export default function PrendreRendezVousScreen({ navigation, route }) {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSpecialite, setSelectedSpecialite] = useState('');
  const [specialites, setSpecialites] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);

  // Refs pour le scroll automatique
  const scrollViewRef = useRef(null);
  const stepRefs = useRef({});

  const hospital = route?.params?.hospital;

  // Charger les médecins de l'hôpital sélectionné
  useEffect(() => {
    if (!hospital) return;
    setSelectedDoctor(null);
    setDoctors([]);
    setSelectedDate(null);
    setSlots([]);
    setCurrentStep(1);
    
    const fetchDoctors = async () => {
      setLoading(true);
      const hosp = await firestore().collection('hospitals').doc(hospital.id).get();
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
  }, [hospital]);

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

  // Charger les plages réservées pour le médecin et la date sélectionnés
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) return;
    setSlots([]);
    const fetchReservedPlages = async () => {
      setLoading(true);
      try {
        const plagesSnap = await firestore()
          .collection('plannings')
          .where('doctorId', '==', selectedDoctor.id)
          .where('date', '==', selectedDate)
          .where('status', '==', 'reserved')
          .get();

        const plages = plagesSnap.docs.map(doc => ({
          id: doc.id,
          heureDebut: doc.data().time,
          heureFin: null,
          time: doc.data().time,
          status: 'reserved',
        }));

        setSlots(plages);
      } catch (e) {
        setSlots([]);
      }
      setLoading(false);
    };
    fetchReservedPlages();
  }, [selectedDoctor, selectedDate]);

  const handleBookConsultation = async (plage) => {
    try {
      setLoading(true);
      const user = auth().currentUser;
      if (!user) {
        Alert.alert('Erreur', 'Vous devez être connecté');
        setLoading(false);
        return;
      }

      const existing = await firestore()
        .collection('consultations')
        .where('doctorId', '==', selectedDoctor.id)
        .where('date', '==', selectedDate)
        .where('heureDebut', '==', plage.time)
        .get();

      if (!existing.empty) {
        Alert.alert('Ce créneau vient d\'être réservé');
        setLoading(false);
        return;
      }

      const duration = hospital?.consultationDuration || 30;
      const [h, m] = plage.time.split(':').map(Number);
      const startDate = new Date(0, 0, 0, h, m);
      const endDate = new Date(startDate.getTime() + duration * 60000);
      const endHour = endDate.getHours().toString().padStart(2, '0');
      const endMin = endDate.getMinutes().toString().padStart(2, '0');
      const heureFin = `${endHour}:${endMin}`;

      await firestore().collection('consultations').add({
        patientId: user.uid,
        patientName: user.displayName || '',
        doctorId: selectedDoctor.id,
        doctorName: `${selectedDoctor.prenom} ${selectedDoctor.nom}`,
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        date: selectedDate,
        heureDebut: plage.time,
        heureFin: heureFin,
        plageId: plage.id,
        status: 'confirmed',
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Succès', 'Votre rendez-vous est confirmé !', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de réserver ce créneau');
    }
    setLoading(false);
  };

  const filteredDoctors = selectedSpecialite
    ? doctors.filter(d => d.specialite === selectedSpecialite)
    : doctors;

  // Fonction pour scroller automatiquement vers la prochaine étape
  const scrollToStep = (step) => {
    const stepKey = `step${step}`;
    if (stepRefs.current[stepKey] && scrollViewRef.current) {
      setTimeout(() => {
        stepRefs.current[stepKey].measureLayout(
          scrollViewRef.current,
          (x, y) => {
            scrollViewRef.current.scrollTo({ 
              y: y - 60, // Offset pour laisser de l'espace en haut
              animated: true 
            });
          },
          () => {} // Error callback
        );
      }, 300); // Petit délai pour laisser le temps au render
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate(null);
    setSlots([]);
    setSelectedSlot(null);
    setCurrentStep(2);
    scrollToStep(2);
  };

  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
    setSelectedSlot(null);
    setCurrentStep(3);
    scrollToStep(3);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setCurrentStep(4);
    scrollToStep(4);
  };

  const ProgressIndicator = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressStep, currentStep >= 1 && styles.progressStepActive]}>
          <Text style={[styles.progressText, currentStep >= 1 && styles.progressTextActive]}>1</Text>
        </View>
        <View style={[styles.progressLine, currentStep >= 2 && styles.progressLineActive]} />
        <View style={[styles.progressStep, currentStep >= 2 && styles.progressStepActive]}>
          <Text style={[styles.progressText, currentStep >= 2 && styles.progressTextActive]}>2</Text>
        </View>
        <View style={[styles.progressLine, currentStep >= 3 && styles.progressLineActive]} />
        <View style={[styles.progressStep, currentStep >= 3 && styles.progressStepActive]}>
          <Text style={[styles.progressText, currentStep >= 3 && styles.progressTextActive]}>3</Text>
        </View>
        <View style={[styles.progressLine, currentStep >= 4 && styles.progressLineActive]} />
        <View style={[styles.progressStep, currentStep >= 4 && styles.progressStepActive]}>
          <Text style={[styles.progressText, currentStep >= 4 && styles.progressTextActive]}>4</Text>
        </View>
      </View>
      <View style={styles.progressLabels}>
        <Text style={styles.progressLabel}>Médecin</Text>
        <Text style={styles.progressLabel}>Date</Text>
        <Text style={styles.progressLabel}>Créneau</Text>
        <Text style={styles.progressLabel}>Confirmer</Text>
      </View>
    </View>
  );

  const HospitalCard = () => (
    <View style={styles.hospitalCard}>
      <View style={styles.hospitalHeader}>
        {hospital?.logo && (
          <Image
            source={{ uri: hospital.logo }}
            style={styles.hospitalLogo}
            resizeMode="contain"
          />
        )}
        <View style={styles.hospitalInfo}>
          <Text style={styles.hospitalName}>{hospital?.name}</Text>
          {hospital?.address && (
            <Text style={styles.hospitalAddress}>📍 {hospital.address}</Text>
          )}
        </View>
      </View>
    </View>
  );

  const DoctorSelection = () => (
    <View 
      style={styles.stepContainer}
      ref={ref => stepRefs.current.step1 = ref}
    >
      <Text style={styles.stepTitle}>👨‍⚕️ Choisissez votre médecin</Text>
      
      {specialites.length > 1 && (
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filtrer par spécialité :</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedSpecialite}
              onValueChange={setSelectedSpecialite}
              style={styles.picker}
              dropdownIconColor="#09d1a0"
            >
              <Picker.Item label="Toutes les spécialités" value="" />
              {specialites.map(s => (
                <Picker.Item key={s} label={s} value={s} />
              ))}
            </Picker>
          </View>
        </View>
      )}

      <FlatList
        data={filteredDoctors}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.doctorCard,
              selectedDoctor?.id === item.id && styles.doctorCardSelected,
            ]}
            onPress={() => handleDoctorSelect(item)}
          >
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>Dr {item.prenom} {item.nom}</Text>
              <Text style={styles.doctorSpecialty}>{item.specialite}</Text>
            </View>
            <View style={styles.doctorIcon}>
              <Text style={styles.doctorIconText}>👨‍⚕️</Text>
            </View>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const DateSelection = () => (
    selectedDoctor && (
      <View 
        style={styles.stepContainer}
        ref={ref => stepRefs.current.step2 = ref}
      >
        <Text style={styles.stepTitle}>📅 Choisissez une date</Text>
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={handleDateSelect}
            markedDates={selectedDate ? { [selectedDate]: { selected: true, selectedColor: '#09d1a0' } } : {}}
            minDate={new Date().toISOString().split('T')[0]}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#09d1a0',
              selectedDayBackgroundColor: '#09d1a0',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#09d1a0',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              arrowColor: '#09d1a0',
              monthTextColor: '#09d1a0',
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14
            }}
          />
        </View>
      </View>
    )
  );

  const SlotSelection = () => (
    selectedDate && (
      <View 
        style={styles.stepContainer}
        ref={ref => stepRefs.current.step3 = ref}
      >
        <Text style={styles.stepTitle}>⏰ Créneaux disponibles</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#09d1a0" />
            <Text style={styles.loadingText}>Chargement des créneaux...</Text>
          </View>
        ) : slots.length === 0 ? (
          <View style={styles.noSlotsContainer}>
            <Text style={styles.noSlotsText}>😔 Aucun créneau disponible ce jour</Text>
            <Text style={styles.noSlotsSubtext}>Veuillez choisir une autre date</Text>
          </View>
        ) : (
          <FlatList
            data={slots}
            keyExtractor={item => item.id}
            numColumns={2}
            renderItem={({ item }) => {
              const duration = hospital?.consultationDuration || 30;
              const [h, m] = item.time.split(':').map(Number);
              const startDate = new Date(0, 0, 0, h, m);
              const endDate = new Date(startDate.getTime() + duration * 60000);
              const endHour = endDate.getHours().toString().padStart(2, '0');
              const endMin = endDate.getMinutes().toString().padStart(2, '0');
              const plageText = `${item.time} - ${endHour}:${endMin}`;

              return (
                <TouchableOpacity
                  style={[
                    styles.slotCard,
                    selectedSlot?.id === item.id && styles.slotCardSelected,
                  ]}
                  onPress={() => handleSlotSelect(item)}
                >
                  <Text style={[
                    styles.slotTime,
                    selectedSlot?.id === item.id && styles.slotTimeSelected
                  ]}>
                    {plageText}
                  </Text>
                  <Text style={[
                    styles.slotStatus,
                    selectedSlot?.id === item.id && styles.slotStatusSelected
                  ]}>
                    {selectedSlot?.id === item.id ? '✓ Sélectionné' : '🕐 Disponible'}
                  </Text>
                </TouchableOpacity>
              );
            }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    )
  );

  const Summary = () => (
    selectedSlot && (
      <View 
        style={styles.stepContainer}
        ref={ref => stepRefs.current.step4 = ref}
      >
        <Text style={styles.stepTitle}>📋 Résumé de votre rendez-vous</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>👨‍⚕️ Médecin</Text>
            <Text style={styles.summaryValue}>Dr {selectedDoctor.prenom} {selectedDoctor.nom}</Text>
            <Text style={styles.summarySubValue}>{selectedDoctor.specialite}</Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>📅 Date</Text>
            <Text style={styles.summaryValue}>{selectedDate}</Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>⏰ Créneau</Text>
            <Text style={styles.summaryValue}>{selectedSlot.time}</Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>🏥 Hôpital</Text>
            <Text style={styles.summaryValue}>{hospital.name}</Text>
          </View>
        </View>

        <Pressable
          style={styles.confirmButton}
          onPress={() => handleBookConsultation(selectedSlot)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>✓ Confirmer le rendez-vous</Text>
          )}
        </Pressable>
      </View>
    )
  );

  return (
    <View style={styles.container}>
      {/* Header fixe avec le stepper */}
      <View style={styles.fixedHeader}>
        <Text style={styles.title}>Prendre rendez-vous</Text>
        <ProgressIndicator />
      </View>

      {/* Contenu scrollable */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <HospitalCard />
        <DoctorSelection />
        <DateSelection />
        <SlotSelection />
        <Summary />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafa',
  },
  
  // Header fixe
  fixedHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e8f1ef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  
  // Contenu scrollable
  scrollContent: {
    flex: 1,
  },
  
  scrollContentContainer: {
    paddingBottom: 30,
  },
  
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e8f1ef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#09d1a0',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  // Progress Indicator
  progressContainer: {
    marginBottom: 10,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressStep: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e8f1ef',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e8f1ef',
  },
  progressStepActive: {
    backgroundColor: '#09d1a0',
    borderColor: '#09d1a0',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#999',
  },
  progressTextActive: {
    color: '#fff',
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#e8f1ef',
  },
  progressLineActive: {
    backgroundColor: '#09d1a0',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  // Hospital Card
  hospitalCard: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hospitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#09d1a0',
    marginBottom: 5,
  },
  hospitalAddress: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  // Step Container
  stepContainer: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 10,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },

  // Filter
  filterContainer: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  pickerContainer: {
    backgroundColor: '#f8fafa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e8f1ef',
  },
  picker: {
    height: 50,
  },

  // Doctor Cards
  doctorCard: {
    backgroundColor: '#f8fafa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e8f1ef',
  },
  doctorCardSelected: {
    backgroundColor: '#e8f5f1',
    borderColor: '#09d1a0',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#666',
  },
  doctorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#09d1a0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorIconText: {
    fontSize: 20,
  },

  // Calendar
  calendarContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e8f1ef',
  },

  // Slots
  slotCard: {
    flex: 1,
    backgroundColor: '#f8fafa',
    borderRadius: 12,
    padding: 15,
    margin: 5,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e8f1ef',
    minHeight: 80,
    justifyContent: 'center',
  },
  slotCardSelected: {
    backgroundColor: '#e8f5f1',
    borderColor: '#09d1a0',
  },
  slotTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  slotTimeSelected: {
    color: '#09d1a0',
  },
  slotStatus: {
    fontSize: 12,
    color: '#666',
  },
  slotStatusSelected: {
    color: '#09d1a0',
  },

  // Loading and No Slots
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  noSlotsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noSlotsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  noSlotsSubtext: {
    fontSize: 14,
    color: '#999',
  },

  // Summary
  summaryCard: {
    backgroundColor: '#f8fafa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e8f1ef',
  },
  summaryItem: {
    paddingVertical: 10,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  summarySubValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e8f1ef',
    marginVertical: 5,
  },

  // Confirm Button
  confirmButton: {
    backgroundColor: '#09d1a0',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#09d1a0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});