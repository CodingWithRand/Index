import React from 'react';
import { useColorScheme, SafeAreaView, StatusBar } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Credit from './asset/components/intro/credit';
import NoteDashboard from './asset/components/index/note-dashboard';
import RegistrationPage from './asset/components/intro/registration';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1
  };

  return(
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />

      <NavigationContainer theme={{ ...DefaultTheme, colors: { ...DefaultTheme.colors, background: "transparent" } }}>
        <Stack.Navigator screenOptions={{ presentation: "transparentModal" }}>
          <Stack.Screen name="Credit" component={Credit} options={{ headerShown: false }}/>
          <Stack.Screen name="Registration" component={RegistrationPage} options={{ headerShown: false }}/>
          <Stack.Screen name="NoteDashboard" component={NoteDashboard} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  )
}

export default App;