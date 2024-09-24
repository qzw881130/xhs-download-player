import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import LoginRegisterScreen from './screens/LoginRegisterScreen';
import MainScreen from './screens/MainScreen';
import { SupabaseProvider } from './contexts/SupabaseContext';

const Stack = createStackNavigator();

export default function App() {
    const navigationRef = useRef();

    return (
        <SupabaseProvider>
            <PaperProvider>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator initialRouteName="LoginRegister">
                        <Stack.Screen name="LoginRegister" component={LoginRegisterScreen} />
                        <Stack.Screen name="MyLikes" component={MainScreen} />
                    </Stack.Navigator>
                </NavigationContainer>
            </PaperProvider>
        </SupabaseProvider>
    );
}