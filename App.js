import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import LoginRegisterScreen from './screens/LoginRegisterScreen';
import MainScreen from './screens/MainScreen';
import { SupabaseProvider } from './contexts/SupabaseContext';

const Stack = createStackNavigator();

// 创建自定义主题
const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#63519f', // 主色调
        accent: '#f1c40f', // 强调色
        background: '#f5f5f5', // 背景色
        text: '#333333', // 文本颜色
        // 可以根据需要添加更多颜色
    },
    // 可以在这里添加自定义字体、字体大小等
};

export default function App() {
    const navigationRef = useRef();

    return (
        <SupabaseProvider>
            <PaperProvider theme={theme}>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator initialRouteName="LoginRegister">
                        <Stack.Screen
                            name="LoginRegister"
                            component={LoginRegisterScreen}
                            options={{
                                title: '小红书播放器',
                                headerStyle: {
                                    backgroundColor: theme.colors.primary,
                                },
                                headerTintColor: '#fff',
                                headerTitleStyle: {
                                    fontWeight: 'bold',
                                },
                            }}
                        />
                        <Stack.Screen
                            name="MyLikes"
                            component={MainScreen}
                            options={{ headerShown: false }}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PaperProvider>
        </SupabaseProvider>
    );
}