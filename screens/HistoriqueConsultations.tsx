import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';

export default function HistoriqueConsultationsScreen({ navigation }) {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) {
      setConsultations([]);
      setLoading(false);
      return;
    }
    const unsubscribe = firestore()
      .collection('consultations')
      .where('patientId', '==', user.uid)
      .onSnapshot(snap => {
        if (!snap || !snap.docs) {
          setConsultations([]);
          setLoading(false);
          return;
        }
        setConsultations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <ActivityIndicator color="#09d1a0" style={{ marginTop: 30 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique des Consultations</Text>
      <FlatList
        data={consultations}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ConsultationDetail', { consultation: item })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.doctor}>{item.doctorName}</Text>
              <Text style={styles.hospital}>{item.hospitalName}</Text>
              <Text style={styles.date}>{item.date} - {item.heureDebut} à {item.heureFin}</Text>
            </View>
            <View style={styles.statusContainer}>
              <Icon
                name={
                  item.status === 'confirmed'
                    ? 'checkmark-circle'
                    : item.status === 'pending'
                    ? 'time'
                    : 'close-circle'
                }
                size={22}
                color={
                  item.status === 'confirmed'
                    ? '#09d1a0'
                    : item.status === 'pending'
                    ? '#f1c40f'
                    : '#e74c3c'
                }
              />
              <Text style={[styles.status, { color:
                item.status === 'confirmed'
                  ? '#09d1a0'
                  : item.status === 'pending'
                  ? '#f1c40f'
                  : '#e74c3c'
              }]}>
                {item.status === 'confirmed'
                  ? 'Confirmé'
                  : item.status === 'pending'
                  ? 'En attente'
                  : 'Annulé'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 30, color: '#666' }}>Aucun rendez-vous</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#000', marginBottom: 20, marginTop: 40,fontFamily: 'UbuntuMono-Bold' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9f7',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  doctor: { fontWeight: 'bold', fontSize: 16, color: '#09d1a0' },
  hospital: { color: '#333', fontSize: 14 },
  date: { color: '#666', fontSize: 13, marginTop: 2 },
  statusContainer: { alignItems: 'center', marginLeft: 12 },
  status: { fontWeight: 'bold', fontSize: 13, marginTop: 2 },
});