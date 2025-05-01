import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function MessagesScreen() {
  return (
    <View style={styles.container}>
      <Icon name="hourglass-empty" size={60} color="#999" />
      <Text style={styles.title}>Messagerie</Text>
      <Text style={styles.message}>
        La fonctionnalité de messagerie est en cours de développement
      </Text>
      <Text style={styles.subMessage}>
        Elle sera disponible dans une prochaine mise à jour
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 5,
  },
  subMessage: {
    fontSize: 14,
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
});