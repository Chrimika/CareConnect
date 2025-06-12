import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import QRCode from 'react-native-qrcode-svg';

export default function ConsultationDetailScreen({ route }) {
  const { consultation } = route.params;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header facture style */}
      <View style={styles.invoiceHeader}>
        <View style={styles.headerTop}>
          <Text style={styles.invoiceTitle}>CONSULTATION MÉDICALE</Text>
          <View style={styles.invoiceNumber}>
            <Text style={styles.invoiceNumberText}>N° {consultation.id}</Text>
          </View>
        </View>
        <View style={styles.headerLine} />
      </View>

      {/* Section patient/consultation en 2 colonnes */}
      <View style={styles.invoiceBody}>
        <View style={styles.twoColumnSection}>
          <View style={styles.leftColumn}>
            <Text style={styles.sectionTitle}>DÉTAILS PATIENT</Text>
            <View style={styles.detailItem}>
              <Icon name="person" size={16} color="#09d1a0" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Médecin traitant</Text>
                <Text style={styles.detailValue}>{consultation.doctorName}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Icon name="business" size={16} color="#09d1a0" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Établissement</Text>
                <Text style={styles.detailValue}>{consultation.hospitalName}</Text>
              </View>
            </View>
          </View>

          <View style={styles.rightColumn}>
            <Text style={styles.sectionTitle}>RENDEZ-VOUS</Text>
            <View style={styles.detailItem}>
              <Icon name="calendar" size={16} color="#09d1a0" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Date prévue</Text>
                <Text style={styles.detailValue}>{consultation.date}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Icon name="time" size={16} color="#09d1a0" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Créneaux</Text>
                <Text style={styles.detailValue}>{consultation.heureDebut} - {consultation.heureFin}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Ligne de séparation */}
        <View style={styles.separatorLine} />

        {/* Section statut avec style facture */}
        <View style={styles.statusSection}>
          <Text style={styles.statusLabel}>STATUT DE LA CONSULTATION</Text>
          <View style={styles.statusBox}>
            <Icon
              name={
                consultation.status === 'confirmed'
                  ? 'checkmark-circle'
                  : consultation.status === 'pending'
                  ? 'time'
                  : 'close-circle'
              }
              size={24}
              color={
                consultation.status === 'confirmed'
                  ? '#09d1a0'
                  : consultation.status === 'pending'
                  ? '#f1c40f'
                  : '#e74c3c'
              }
            />
            <Text style={[
              styles.statusValue,
              { color: consultation.status === 'confirmed' ? '#09d1a0' : consultation.status === 'pending' ? '#f1c40f' : '#e74c3c' }
            ]}>
              {consultation.status === 'confirmed'
                ? 'CONFIRMÉE'
                : consultation.status === 'pending'
                ? 'EN ATTENTE'
                : 'ANNULÉE'}
            </Text>
          </View>
        </View>

        {/* Section QR Code comme tampon officiel */}
        <View style={styles.qrSection}>
          <View style={styles.qrHeader}>
            <Text style={styles.qrTitle}>AUTHENTIFICATION OFFICIELLE</Text>
            <Text style={styles.qrSubtitle}>Code de vérification numérique</Text>
          </View>

          <View style={styles.qrStampContainer}>
            <View style={styles.qrStamp}>
              <QRCode
                value={consultation.id}
                size={160}
                backgroundColor="#ffffff"
                color="#2c3e50"
              />
            </View>
            <View style={styles.stampBorder} />
          </View>

          <View style={styles.qrFooter}>
            <Text style={styles.qrReference}>RÉF: {consultation.id}</Text>
            <Text style={styles.qrInstruction}>
              À présenter obligatoirement lors du rendez-vous
            </Text>
          </View>
        </View>

        {/* Footer facture */}
        <View style={styles.invoiceFooter}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>
            Document généré automatiquement • Système de gestion médicale
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  invoiceHeader: {
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2c3e50',
    fontFamily: 'UbuntuMono-Bold',
    letterSpacing: 1,
  },
  invoiceNumber: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  invoiceNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7f8c8d',
    fontFamily: 'UbuntuMono-Bold',
  },
  headerLine: {
    height: 2,
    backgroundColor: '#09d1a0',
    width: '100%',
  },
  invoiceBody: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  twoColumnSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  leftColumn: {
    flex: 0.48,
  },
  rightColumn: {
    flex: 0.48,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7f8c8d',
    fontFamily: 'UbuntuMono-Bold',
    marginBottom: 16,
    letterSpacing: 1,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailText: {
    flex: 1,
    marginLeft: 10,
  },
  detailLabel: {
    fontSize: 11,
    color: '#95a5a6',
    fontFamily: 'UbuntuMono-Bold',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
    fontFamily: 'UbuntuMono-Bold',
    lineHeight: 18,
  },
  separatorLine: {
    height: 1,
    backgroundColor: '#ecf0f1',
    marginVertical: 20,
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7f8c8d',
    fontFamily: 'UbuntuMono-Bold',
    marginBottom: 12,
    letterSpacing: 1,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'UbuntuMono-Bold',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  qrSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  qrHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2c3e50',
    fontFamily: 'UbuntuMono-Bold',
    letterSpacing: 1,
  },
  qrSubtitle: {
    fontSize: 11,
    color: '#7f8c8d',
    fontFamily: 'UbuntuMono-Bold',
    marginTop: 4,
  },
  qrStampContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  qrStamp: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  stampBorder: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderWidth: 2,
    borderColor: '#09d1a0',
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  qrFooter: {
    alignItems: 'center',
  },
  qrReference: {
    fontSize: 12,
    color: '#7f8c8d',
    fontFamily: 'UbuntuMono-Bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  qrInstruction: {
    fontSize: 11,
    color: '#95a5a6',
    fontFamily: 'UbuntuMono-Bold',
    textAlign: 'center',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  invoiceFooter: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerLine: {
    height: 1,
    backgroundColor: '#ecf0f1',
    width: '100%',
    marginBottom: 12,
  },
  footerText: {
    fontSize: 10,
    color: '#bdc3c7',
    fontFamily: 'UbuntuMono-Bold',
    textAlign: 'center',
  },
});