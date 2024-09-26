import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, TextInput, Button, ActivityIndicator, Checkbox } from 'react-native-paper';
import { useSupabase } from '../contexts/SupabaseContext';

export default function LoginRegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const navigation = useNavigation();
    const { user, supabase } = useSupabase();

    useEffect(() => {
        const checkAuthStatus = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error('Error checking auth status:', error);
                return;
            }
            if (session) {
                navigation.navigate('MyLikes');
            }
        };

        checkAuthStatus();
    }, [navigation, supabase.auth]);


    useEffect(() => {
        const loadCredentials = async () => {
            try {
                const savedEmail = await AsyncStorage.getItem('email');
                const savedPassword = await AsyncStorage.getItem('password');
                const savedRememberMe = await AsyncStorage.getItem('rememberMe');
                if (savedEmail && savedPassword && savedRememberMe === 'true') {
                    setEmail(savedEmail);
                    setPassword(savedPassword);
                    setRememberMe(true);
                }
            } catch (error) {
                console.log('Failed to load credentials', error);
            }
        };

        loadCredentials();
    }, []);

    const handleLogin = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                alert(error.message);
            } else {
                if (rememberMe) {
                    await AsyncStorage.setItem('email', email);
                    await AsyncStorage.setItem('password', password);
                    await AsyncStorage.setItem('rememberMe', 'true');
                } else {
                    await AsyncStorage.removeItem('email');
                    await AsyncStorage.removeItem('password');
                    await AsyncStorage.setItem('rememberMe', 'false');
                }
                navigation.navigate('MyLikes');
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) {
                alert(error.message);
            } else {
                if (rememberMe) {
                    await AsyncStorage.setItem('email', email);
                    await AsyncStorage.setItem('password', password);
                    await AsyncStorage.setItem('rememberMe', 'true');
                } else {
                    await AsyncStorage.removeItem('email');
                    await AsyncStorage.removeItem('password');
                    await AsyncStorage.setItem('rememberMe', 'false');
                }
                navigation.navigate('MyLikes');
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>登陆&注册</Text>
            <TextInput
                label="邮箱"
                value={email}
                onChangeText={(text) => setEmail(text.toLowerCase())}
                style={styles.input}
            />
            <TextInput
                label="密码"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.input}
            />
            <View style={styles.checkboxContainer}>
                <Checkbox
                    status={rememberMe ? 'checked' : 'unchecked'}
                    onPress={() => setRememberMe(!rememberMe)}
                    style={{ borderWidth: 1, borderColor: 'black' }}
                />
                <Text
                    style={styles.label}
                    onPress={() => setRememberMe(!rememberMe)}
                >
                    记住我
                </Text>
            </View>
            {loading ? (
                <ActivityIndicator size="large" animating={true} color="#0000ff" />
            ) : (
                <>
                    <Button mode="contained" onPress={handleLogin} style={styles.button}>
                        登陆
                    </Button>
                    <Button mode="contained" onPress={handleRegister} style={styles.button}>
                        注册
                    </Button>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
        textAlign: 'center',
        color: '#333'
    },
    input: {
        marginBottom: 12,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        margin: 8,
        color: '#333'
    },
    button: {
        marginTop: 10,
    },
});