import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MainScreen from './screens/MainScreen';

export default function App() {
    return (
        <SafeAreaProvider>
            <PaperProvider>
                <StatusBar style="auto" />
                <MainScreen />
            </PaperProvider>
        </SafeAreaProvider>
    );
}