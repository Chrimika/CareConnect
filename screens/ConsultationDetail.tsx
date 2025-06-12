import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
//import QRCode from 'react-native-qrcode-svg';

export default function ConsultationDetailScreen({ route }) {
  const { consultation } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Détail du rendez-vous</Text>
      <View style={styles.row}>
        <Icon name="person" size={20} color="#09d1a0" />
        <Text style={styles.label}>Médecin :</Text>
        <Text style={styles.value}>{consultation.doctorName}</Text>
      </View>
      <View style={styles.row}>
        <Icon name="business" size={20} color="#09d1a0" />
        <Text style={styles.label}>Hôpital :</Text>
        <Text style={styles.value}>{consultation.hospitalName}</Text>
      </View>
      <View style={styles.row}>
        <Icon name="calendar" size={20} color="#09d1a0" />
        <Text style={styles.label}>Date :</Text>
        <Text style={styles.value}>{consultation.date}</Text>
      </View>
      <View style={styles.row}>
        <Icon name="time" size={20} color="#09d1a0" />
        <Text style={styles.label}>Heure :</Text>
        <Text style={styles.value}>{consultation.heureDebut} - {consultation.heureFin}</Text>
      </View>
      <View style={styles.row}>
        <Icon
          name={
            consultation.status === 'confirmed'
              ? 'checkmark-circle'
              : consultation.status === 'pending'
              ? 'time'
              : 'close-circle'
          }
          size={20}
          color={
            consultation.status === 'confirmed'
              ? '#09d1a0'
              : consultation.status === 'pending'
              ? '#f1c40f'
              : '#e74c3c'
          }
        />
        <Text style={styles.label}>Statut :</Text>
        <Text style={[
          styles.value,
          { color: consultation.status === 'confirmed' ? '#09d1a0' : consultation.status === 'pending' ? '#f1c40f' : '#e74c3c' }
        ]}>
          {consultation.status === 'confirmed'
            ? 'Confirmé'
            : consultation.status === 'pending'
            ? 'En attente'
            : 'Annulé'}
        </Text>
      </View>
      {/* QR Code pour authentifier la consultation */}
      <View style={{ alignItems: 'center', marginTop: 32 }}>
        <Text style={{ fontFamily: 'UbuntuMono-Bold', marginBottom: 8, color: '#333' }}>
          QR Code de la consultation
        </Text>
        {/* <QRCode
          value={consultation.id}
          size={160}
          backgroundColor="#fff"
          color="#09d1a0"
        /> */}
        <Text style={{ fontSize: 12, color: '#888', marginTop: 8, fontFamily: 'UbuntuMono-Bold' }}>
          ID: {consultation.id}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 22, color: '#000', marginBottom: 24, marginTop: 20, fontFamily: 'UbuntuMono-Bold' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  label: { fontWeight: 'bold', color: '#333', marginLeft: 8, marginRight: 4, fontFamily: 'UbuntuMono-Bold' },
  value: { color: '#333', fontSize: 16, fontFamily: 'UbuntuMono-Bold' },
});