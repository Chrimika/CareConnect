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
<<<<<<< HEAD
=======
import { useEffect, useState } from 'react';
import SplashScreen from 'react-native-splash-screen';
import OnBoard1Screen from './screens/OnBoard1';
import OnBoard2Screen from './screens/OnBoarding2';
import { StatusBar, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Feather from 'react-native-vector-icons/Feather';
>>>>>>> Dev
import ConsultationsScreen from './screens/Consultations';
import SpecialityDetailsScreen from './screens/SpecialityDetails';
import LoginScreen from './screens/Login';
import SignUpScreen from './screens/SignUp';
import MessagesScreen from './screens/Messages';
<<<<<<< HEAD
import OnBoard1Screen from './screens/OnBoard1';
import OnBoard2Screen from './screens/OnBoarding2';
import LoginHopitalScreen from './screens/LoginHopital'

// Screens hôpitaux
import HospitalHomeScreen from './screens/hospital/Home';
import GlobalSettingsScreen from './screens/hospital/GlobalSettings';
import DoctorsManagementScreen from './screens/hospital/DoctorsManagement';
// import ScheduleManagementScreen from './screens/hospital/ScheduleManagement';
=======
import AsyncStorage from '@react-native-async-storage/async-storage';
import HospitalAdminScreen from './screens/HospitalAdmin';
import DoctorsManagementScreen from './screens/DoctorsManagement';
import ScheduleScreen from './screens/Schedule';
import AdminProfileScreen from './screens/AdminProfile';
import SignUpHospitalAdminScreen from './screens/SignUpAdmin'
import AddHospitalScreen from './screens/AddHospital'
import AddMedecinScreen from './screens/AddMedecins';
import MedecinScreen from './screens/MedecinScreen';
import HospitalDetailsScreen from './screens/HopitalDetails';
>>>>>>> Dev

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

<<<<<<< HEAD
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
=======
const App = () => {
  const [initialRoute, setInitialRoute] = useState('onBoard1');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setInitialRoute('Home');
        }
        SplashScreen.hide();
      } catch (error) {
        console.error('Auth check error:', error);
        SplashScreen.hide();
      }
    };

    checkAuth();
  }, []);

  function MyTabs() {
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
      const checkUserRole = async () => {
        try {
          const userData = await AsyncStorage.getItem('user');
          if (userData) {
            const parsedData = JSON.parse(userData);
            setUserRole(parsedData.role);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      };

      checkUserRole();
    }, []);

    if (userRole == 'admin') {
      return (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            animation: "fade",
            tabBarIcon: ({ color }) => {
              let iconName;

              if (route.name === 'Hôpital') {
                iconName = 'home';
              } else if (route.name === 'Médecins') {
                iconName = 'users';
              } else if (route.name === 'Planning') {
                iconName = 'calendar';
              } else if (route.name === 'Profil') {
                iconName = 'user';
              }

              return (
                <View style={styles.iconContainer}>
                  <Feather name={iconName} size={20} color={color} />
                </View>
              );
            },
            tabBarActiveTintColor: '#09d1a0',
            tabBarInactiveTintColor: '#6e6e6e',
            tabBarHideOnKeyboard: true,
            tabBarButton: (props) => (
            <TouchableWithoutFeedback
              onPress={props.onPress}
              accessibilityRole="button"
              accessible
            >
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>{props.children}</View>
            </TouchableWithoutFeedback>
          ),
            tabBarStyle: { 
              backgroundColor: '#fff', 
              borderTopWidth: 0,
              elevation: 10,
              shadowOpacity: 0.1,
              shadowRadius: 10,
              height: 60,
              paddingBottom: 5
            },
            tabBarLabelStyle: {
              fontSize: 12,
              marginBottom: 5
            },
          })}
        >
          <Tab.Screen 
            name="Hôpital" 
            component={HospitalAdminScreen} 
            options={{ headerShown: false }} 
          />
          <Tab.Screen 
            name="Médecins" 
            component={MedecinScreen} 
            options={{ headerShown: false }} 
          />
          <Tab.Screen 
            name="Planning" 
            component={ScheduleScreen} 
            options={{ headerShown: false }} 
          />
          <Tab.Screen 
            name="Profil" 
            component={ProfileScreen} 
            options={{ headerShown: false }} 
          />
        </Tab.Navigator>
      );
    }

    // Interface standard
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          animation: "fade",
          tabBarIcon: ({ color }) => {
            let iconName;

            if (route.name === 'Accueil') {
              iconName = 'home';
            } else if (route.name === 'Consultations') {
              iconName = 'activity';
            } else if (route.name === 'Messages') {
              iconName = 'mail';
            } else if (route.name === 'Profil') {
              iconName = 'user';
            }

            return (
              <View style={styles.iconContainer}>
                <Feather name={iconName} size={20} color={color} />
              </View>
            );
          },
          tabBarActiveTintColor: '#09d1a0',
          tabBarInactiveTintColor: '#6e6e6e',
          tabBarStyle: { 
            backgroundColor: '#fff', 
            borderTopWidth: 0,
            elevation: 10,
            shadowOpacity: 0.1,
            shadowRadius: 10,
            height: 60,
            paddingBottom: 5
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 5
          },
          tabBarHideOnKeyboard: true,
          tabBarButton: (props) => (
            <TouchableWithoutFeedback
              onPress={props.onPress}
              accessibilityRole="button"
              accessible
            >
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>{props.children}</View>
            </TouchableWithoutFeedback>
          ),
        })}
      >
        <Tab.Screen 
          name="Accueil" 
          component={HomeScreen} 
          options={{ headerShown: false }} 
        />
        <Tab.Screen 
          name="Consultations" 
          component={ConsultationsScreen} 
          options={{ headerShown: false }} 
        />
        <Tab.Screen 
          name="Messages" 
          component={MessagesScreen} 
          options={{ headerShown: false }} 
        />
        <Tab.Screen 
          name="Profil" 
          component={ProfileScreen} 
          options={{ headerShown: false }} 
        />
      </Tab.Navigator>
>>>>>>> Dev
    );
  }

  return (
    <NavigationContainer>
<<<<<<< HEAD
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
=======
      <StatusBar translucent backgroundColor={'transparent'} barStyle={'dark-content'} />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          animation: 'slide_from_right'
        }}
      >
        <Stack.Screen
          name="Home"
          component={MyTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="onBoard1" 
          component={OnBoard1Screen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="onBoard2" 
          component={OnBoard2Screen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="speciality" 
          component={SpecialityDetailsScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="signup" 
          component={SignUpScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="signup-admin" 
          component={SignUpHospitalAdminScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="AdminDashboard" 
          component={MyTabs} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="add-hospital" 
          component={AddHospitalScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="add-medecins" 
          component={AddMedecinScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="HospitalDetails" 
          component={HospitalDetailsScreen} 
          options={{ headerShown: false }} 
        />
        
        
>>>>>>> Dev
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
<<<<<<< HEAD
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  tabButton: {
    flex: 1,
=======
    width: 40,
    height: 40,
>>>>>>> Dev
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
