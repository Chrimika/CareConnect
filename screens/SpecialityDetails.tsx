import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';

// Définir le type de la pile de navigation
type RootStackParamList = {
  SpecialityDetails: {
    id: number;
    nom: string;
    couleur: string;
    imageRepresentatif: string;
  };
  Home: undefined;
};

// Définir les props de la screen
type Props = NativeStackScreenProps<RootStackParamList, 'SpecialityDetails'>;

const SpecialityDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { id, nom, couleur, imageRepresentatif } = route.params;
  

  return (
    <View style={[styles.container]}>
      <View style={{backgroundColor:'#fff',flexDirection:'row',width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:8}}>
        <View style={{flexDirection:'row', alignItems:'center',justifyContent:'space-between'}}>
            <TouchableOpacity onPress={()=>navigation.navigate('Home')}>
                <Feather name='arrow-left' size={35}/>
            </TouchableOpacity>
            
            <View style={{marginLeft:8}}>
            <Text 
            style={{ fontSize: 23, width: 200, textAlign: 'center' }}
            numberOfLines={1}
            ellipsizeMode="tail"
            >
            {nom}
            </Text>
            </View>
        </View>
        
        <View>
        <Feather name='info' size={35}/>
        </View>
      </View>

      {/* Contenu supplémentaire */}
      <View style={styles.detailsContainer}>
        <Text style={styles.subtitle}>Détails sur la spécialité</Text>
        <Text style={styles.description}>
          Vous avez sélectionné la spécialité {nom}. Ici, vous pouvez trouver des informations sur les médecins, les traitements,
          et les services proposés pour cette spécialité.
        </Text>
        
      </View>
    </View>
  );
};

export default SpecialityDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth:1,
    borderColor:'transparent'
  },
  imageBackground: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  detailsContainer: {
    flex: 2,
    backgroundColor: '#fff',
    padding: 20,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#0EBE7F',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
