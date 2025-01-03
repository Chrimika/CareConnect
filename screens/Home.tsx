import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Specialites } from './../datas/specialities'; // Assurez-vous de remplacer par le chemin correct
import { useNavigation } from '@react-navigation/native';

export default function SpecialitiesScreen() {
  const navigation = useNavigation();

  // Vérifie si l'image ou le nom est manquant, si oui, ne pas afficher l'élément
  const renderItem = ({ item }) => {
    if (!item.imageRepresentatif || !item.nom) {
      return null; // Ignore les éléments invalides
    }

    return (
      <TouchableOpacity
        style={[styles.block, { backgroundColor: 'white', borderWidth: 0.7, borderColor:'gray' }]}
        onPress={() => navigation.navigate('speciality', { id: item.id, nom: item.nom })}
      >
        <Image
          source={{ uri: item.imageRepresentatif }}
          resizeMode="contain"
          style={styles.image}
        />
        <Text style={styles.blockText}>{item.nom}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>

      <FlatList
        data={Specialites}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()} // Assure une clé unique pour chaque élément
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-evenly', // Également espacé entre les items
    paddingVertical: 20,
  },
  block: {
    margin: 8,
    padding: 8,
    height: 120,
    width: 120,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40, // Rendre l'image circulaire
    overflow: 'hidden',
  },
  blockText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
