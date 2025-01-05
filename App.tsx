import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from './screens/Home';
import ProfileScreen from './screens/Profile';
import { useEffect } from 'react';
import SplashScreen from 'react-native-splash-screen';
import OnBoard1Screen from './screens/OnBoard1';
import OnBoard2Screen from './screens/OnBoarding2';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Feather from 'react-native-vector-icons/Feather';
import ConsultationsScreen from './screens/Consultations';
import SpecialityDetailsScreen from './screens/SpecialityDetails';
import LoginScreen from './screens/Login';
import SignInScreen from './screens/SignIn';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();



const App = () => {
  useEffect(() => {
    // Masquer l'écran de chargement Splash après 1.5 seconde
    setTimeout(() => {
      SplashScreen.hide();
    }, 1500);
  }, []);

  function MyTabs() {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          animation:"fade",
          tabBarIcon: ({ color }) => {
            let iconName;

            if (route.name === 'Accueil') {
              iconName = 'home';
            } else if (route.name === 'consultations') {
              iconName = 'activity';
            } else if (route.name === 'profile') {
              iconName = 'user';
            }

            return (
              <View style={styles.iconContainer}>
                <Feather name={iconName} size={18} color={color} />
              </View>
            );
          },
          tabBarActiveTintColor: '#09d1a0',
          tabBarInactiveTintColor: '#000',
          tabBarStyle: { backgroundColor: '#fff',borderColor:"#fff" },
          tabBarHideOnKeyboard:true,
          tabBarButton: (props) => (
            <TouchableWithoutFeedback
              onPress={props.onPress}
              accessibilityRole="button"
              accessible
            >
              <View style={{ flex: 1,justifyContent:'center',alignItems:'center' }}>{props.children}</View>
            </TouchableWithoutFeedback>
          ),
          
        })}
        
      >
        <Tab.Screen  name="Accueil" component={HomeScreen} options={{ headerShown: false}} />
        <Tab.Screen name="consultations" component={ConsultationsScreen} options={{headerShown: false}}/>
        <Tab.Screen name="profile" component={ProfileScreen} options={{headerShown: false}}/>
        </Tab.Navigator>
    );
  }
  
  return (
    <NavigationContainer>
      <Stack.Navigator
      initialRouteName='onBoard1'>
        <Stack.Screen
          name="Home"
          component={MyTabs}
          options={{headerShown:false}}
        />
        <Stack.Screen name="onBoard1" component={OnBoard1Screen} options={{headerShown:false}} />
        <Stack.Screen name="onBoard2" component={OnBoard2Screen} options={{headerShown:false}} />
        <Stack.Screen name="speciality" component={SpecialityDetailsScreen} options={{headerShown:false}} />
        <Stack.Screen name="login" component={LoginScreen} options={{headerShown:false}} />
        <Stack.Screen name="signin" component={SignInScreen} options={{headerShown:false}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,   // Largeur pour l'icône
    height: 40,  // Hauteur pour l'icône
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadow: {
    shadowColor: '#0cc0df',
    shadowOffset: {
      width: 0,
      height: 10
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5
  }
});

export default App;