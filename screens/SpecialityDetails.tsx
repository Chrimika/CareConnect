// import React from 'react';
// import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
// import { NativeStackScreenProps } from '@react-navigation/native-stack';

// // Définir le type de la pile de navigation
// type RootStackParamList = {
//   SpecialityDetails: {
//     id: number;
//     nom: string;
//     couleur: string;
//     imageRepresentatif: string;
//   };
//   Home: undefined;
// };

// // Définir les props de la screen
// type Props = NativeStackScreenProps<RootStackParamList, 'SpecialityDetails'>;

// const SpecialityDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
//   const { id, nom, couleur, imageRepresentatif } = route.params;
//   const imagePath = require('../assets/images/' + imageRepresentatif);

//   return (
//     <View style={[styles.container, { backgroundColor: couleur }]}>
//       {/* Image en arrière-plan */}
//       <ImageBackground
//         source={imagePath}        
//         style={styles.imageBackground}
//       >
//         {/* Nom de la spécialité */}
//         <View style={styles.textContainer}>
//           <Text style={styles.title}>{nom}</Text>
//         </View>
//       </ImageBackground>

//       {/* Contenu supplémentaire */}
//       <View style={styles.detailsContainer}>
//         <Text style={styles.subtitle}>Détails sur la spécialité</Text>
//         <Text style={styles.description}>
//           Vous avez sélectionné la spécialité {nom}. Ici, vous pouvez trouver des informations sur les médecins, les traitements,
//           et les services proposés pour cette spécialité.
//         </Text>
//         <TouchableOpacity
//           style={styles.button}
//           onPress={() => navigation.navigate('Home')}
//         >
//           <Text style={styles.buttonText}>Retour à l'accueil</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default SpecialityDetailsScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   imageBackground: {
//     flex: 3,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   textContainer: {
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     padding: 10,
//     borderRadius: 10,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#fff',
//     textAlign: 'center',
//   },
//   detailsContainer: {
//     flex: 2,
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: 20,
//   },
//   subtitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   description: {
//     fontSize: 16,
//     color: 'gray',
//     marginBottom: 20,
//   },
//   button: {
//     backgroundColor: '#0EBE7F',
//     paddingVertical: 10,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
// });
