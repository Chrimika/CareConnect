import * as React from 'react';
import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from 'react-native-splash-screen';
import Feather from 'react-native-vector-icons/Feather';
import {
  StatusBar,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator
} from 'react-native';

// Screens patients
import HomeScreen from './screens/Home';
import ProfileScreen from './screens/Profile';
import ConsultationsScreen from './screens/Consultations';
import SpecialityDetailsScreen from './screens/SpecialityDetails';
import LoginScreen from './screens/Login';
import SignUpScreen from './screens/SignUp';
import MessagesScreen from './screens/Messages';
import OnBoard1Screen from './screens/OnBoard1';
import OnBoard2Screen from './screens/OnBoarding2';
import LoginHopitalScreen from './screens/LoginHopital'

// Screens hôpitaux
import HospitalHomeScreen from './screens/hospital/Home';
import GlobalSettingsScreen from './screens/hospital/GlobalSettings';
import DoctorsManagementScreen from './screens/hospital/DoctorsManagement';
// import ScheduleManagementScreen from './screens/hospital/ScheduleManagement';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          let iconName;
          if (route.name === 'Accueil') iconName = 'home';
          else if (route.name === 'consultations') iconName = 'activity';
          else if (route.name === 'profile') iconName = 'user';
          else if (route.name === 'message') iconName = 'mail';

          return (
            <View style={styles.iconContainer}>
              <Feather name={iconName} size={18} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: '#09d1a0',
        tabBarInactiveTintColor: '#000',
        tabBarStyle: { backgroundColor: '#fff', borderColor: '#fff' },
        tabBarHideOnKeyboard: true,
        tabBarButton: (props) => (
          <TouchableWithoutFeedback onPress={props.onPress}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              {props.children}
            </View>
          </TouchableWithoutFeedback>
        ),
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="consultations" component={ConsultationsScreen} options={{ headerShown: false }} />
      <Tab.Screen name="message" component={MessagesScreen} options={{ headerShown: false }} />
      <Tab.Screen name="profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

function HospitalTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          let iconName;
          if (route.name === 'Accueil') iconName = 'home';
          else if (route.name === 'Paramètres') iconName = 'settings';
          else if (route.name === 'Médecins') iconName = 'users';
          else if (route.name === 'Planning') iconName = 'calendar';

          return (
            <View style={styles.iconContainer}>
              <Feather name={iconName} size={20} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: '#0EBE7F',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: { backgroundColor: '#fff' },
        tabBarButton: (props) => (
          <TouchableWithoutFeedback onPress={props.onPress}>
            <View style={styles.tabButton}>{props.children}</View>
          </TouchableWithoutFeedback>
        ),
      })}
    >
      <Tab.Screen name="Accueil" component={HospitalHomeScreen} />
      <Tab.Screen name="Médecins" component={DoctorsManagementScreen} />
      {/* <Tab.Screen name="Planning" component={ScheduleManagementScreen} /> */}
      <Tab.Screen name="Paramètres" component={GlobalSettingsScreen} />
    </Tab.Navigator>
  );
}

const App = () => {
  const [space, setSpace] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSpace = async () => {
      try {
        const value = await AsyncStorage.getItem('Space');
        setSpace(value);
      } catch (e) {
        console.log('Erreur de lecture AsyncStorage', e);
      } finally {
        setTimeout(() => {
          SplashScreen.hide();
          setLoading(false);
        }, 1500);
      }
    };

    checkSpace();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#09d1a0" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Stack.Navigator initialRouteName={space === 'Hospital' ? 'HospitalHome' : 'onBoard1'}>
        {space === 'Hospital' ? (
          <Stack.Screen name="HospitalHome" component={HospitalTabs} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Home" component={MyTabs} options={{ headerShown: false }} />
            <Stack.Screen name="onBoard1" component={OnBoard1Screen} options={{ headerShown: false }} />
            <Stack.Screen name="onBoard2" component={OnBoard2Screen} options={{ headerShown: false }} />
            <Stack.Screen name="speciality" component={SpecialityDetailsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="signup" component={SignUpScreen} options={{ headerShown: false }} />
            <Stack.Screen name="login-hosto" component={LoginHopitalScreen} options={{ headerShown: false }} />
            <Stack.Screen name="consultations" component={ConsultationsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="HomeHopital" component={HospitalHomeScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
