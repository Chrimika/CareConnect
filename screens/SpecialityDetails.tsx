import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';

type SpecialityItem = {
  id: number;
  nom: string;
  imageRepresentatif: string;
  couleur: string;
  sousTitre?: string;
  details?: string;
  prixConsultation?: number;
  services?: {
    nom: string;
    prix: number;
    details: string;
  }[];
};

type RootStackParamList = {
  SpecialityDetails: {
    item: SpecialityItem;
  };
  Home: undefined;
  ServiceDetails?: {
    service: {
      nom: string;
      prix: number;
      details: string;
    };
    specialityName: string;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'SpecialityDetails'>;

const SpecialityDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { item } = route.params;
  const [selectedService, setSelectedService] = useState(null);

  const handleServicePress = (service) => {
    setSelectedService(service);
    
    // Show action options when service is tapped
    Alert.alert(
      `${service.nom}`,
      `${service.details}\nPrix: ${service.prix} FCFA`,
      [
        {
          text: 'Consulter',
          onPress: () => {
            // Message indiquant que la fonctionnalité est en cours de développement
            Alert.alert(
              'Fonctionnalité à venir',
              'La consultation en ligne sera bientôt disponible. Cette fonctionnalité est actuellement en cours de développement.',
              [{ text: 'Compris', style: 'default' }]
            );
          }
        },
        {
          text: 'Appeler',
          onPress: () => {
            // Message indiquant que la fonctionnalité est en cours de développement
            Alert.alert(
              'Fonctionnalité à venir',
              'La fonctionnalité d\'appel sera bientôt disponible. Cette fonctionnalité est actuellement en cours de développement.',
              [{ text: 'Compris', style: 'default' }]
            );
          }
        },
        {
          text: 'Annuler',
          style: 'cancel'
        }
      ]
    );
  };

  const handleBackPress = () => {
    navigation.navigate('Home');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={{flexDirection:'row', justifyContent:'space-between', width:'100%', backgroundColor:'#0bcb95', height:200}}>
        <View>
          <TouchableOpacity 
            style={{margin:22, width:35}} 
            onPress={handleBackPress}
            accessibilityLabel="Retour à l'accueil"
            accessibilityRole="button"
          >
            <Feather color={'white'} name='chevron-left' size={35}/>
          </TouchableOpacity>
          <View style={{marginHorizontal:22, width:250}}>
            <Text style={{color:'white', fontSize:28, fontFamily:'Roboto Thin', fontWeight:'200', marginHorizontal:8}}>{item.nom}</Text>
            <Text style={{color:'white', fontSize:11, fontFamily:'Poppins Light', fontWeight:'300', marginHorizontal:8, marginTop:8}}>{item.sousTitre}</Text>
          </View>
        </View>
        
        <View>
          <Image
            source={require('../assets/images/sideImage.png')}
            style={{width:100, height:100}}
            accessibilityLabel="Image représentative"
          />
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={{flexDirection:'row', paddingTop:32, paddingLeft:32, alignItems:'center', marginTop:16}}>
          <View style={{backgroundColor:'#0bcb95', width:5, height:20}} />
          <Text style={{marginLeft:6, fontFamily:'Poppins Light', fontSize:18, fontWeight:"600", color:'#000'}}>Détails</Text>
        </View>
        
        <View style={{paddingHorizontal:32, paddingVertical:8}}>
          <Text>{item.details}</Text>
        </View>
        
        <View style={{flexDirection:'row', paddingTop:32, paddingLeft:32, alignItems:'center', marginTop:16}}>
          <View style={{backgroundColor:'#0bcb95', width:5, height:20}} />
          <Text style={{marginLeft:6, fontFamily:'Poppins Light', fontSize:18, fontWeight:"600", color:'#000'}}>Services</Text>
        </View>

        {/* Liste des services avec interactivité */}
        <View style={{paddingHorizontal:32, paddingTop:16, paddingBottom:32}}>
          {item.services && item.services.map((service, index) => (
            <TouchableOpacity 
              key={index} 
              style={{
                marginBottom:16, 
                borderWidth:1, 
                padding:12, 
                borderRadius:10, 
                borderStyle:'dashed', 
                borderColor:'#0bcb95', 
                flexDirection:'row', 
                justifyContent:'space-between',
                backgroundColor: selectedService === service ? '#e6fff9' : 'transparent'
              }}
              onPress={() => handleServicePress(service)}
              accessibilityLabel={`Service: ${service.nom}`}
              accessibilityRole="button"
              accessibilityHint={`Appuyez pour consulter les détails de ${service.nom}`}
            >
              <View style={{flex:0.8}}>
                <Text style={{fontSize:18, fontWeight:'bold', color:'#000', fontFamily:'Rubik Medium'}}>{service.nom}</Text>
                <Text style={{fontSize:12, color:'#000', marginTop:4, fontFamily:'Poppins Light', fontWeight:'300'}}>{service.details}</Text>
              </View>
              <View style={{flex:0.2, flexDirection:'row', alignItems:'flex-end'}}>
                <Text style={{fontSize:18, fontWeight:'bold', color:'#0bcb95', fontFamily:'Rubik Medium'}}>{service.prix}</Text>
                <Text style={{fontSize:10, fontFamily:'Poppins Light', fontWeight:'300', color:'#0bcb95'}}>FCFA</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#0bcb95',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    borderTopLeftRadius: 80,
    minHeight: 500  // Pour assurer que la zone blanche couvre assez d'espace
  }
});

export default SpecialityDetailsScreen;