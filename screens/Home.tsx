import React from 'react';
import { View, Text, ImageBackground, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Specialites } from './../datas/specialities'; // Assurez-vous de remplacer par le chemin correct
import { useNavigation } from '@react-navigation/native';

export default function SpecialitiesScreen() {
  const navigation = useNavigation();

  const renderItem = ({ item }) => {
    console.log(item.imageRepresentatif)
    if (!item.imageRepresentatif || !item.nom) {
      return null; // S'assure que l'élément ne s'affiche pas si des informations essentielles sont manquantes.
    }

    return (
      <TouchableOpacity
        style={[styles.block, { backgroundColor: item.couleur || '#ffffff'}]} // Ajout d'une valeur par défaut si la couleur est manquante
        onPress={() => navigation.navigate('speciality', { id: item.id, nom: item.nom })}
      >
        <ImageBackground
          source={require({item.imageRepresentatif})}
          style={styles.imageBackground}
        >
          <Text style={styles.blockText}>{item.nom}</Text>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground source={require('../assets/images/HomeBg.png')} style={styles.container}>
      <FlatList
        data={Specialites}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        numColumns={2}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e7faf2',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  block: {
    flex: 1,
    margin: 8,
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 5,
    paddingVertical: 2, // Ajuste le padding pour le rendre plus adapté
    borderRadius: 5,
    width: '100%', // Pour s'assurer que le texte ne dépasse pas
  },
});
