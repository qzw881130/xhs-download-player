import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, TextInput, Button, ActivityIndicator, Checkbox, Snackbar } from 'react-native-paper';
import { useSupabase } from '../contexts/SupabaseContext';

export default function LoginRegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [agreeToPrivacy, setAgreeToPrivacy] = useState(true);
    const navigation = useNavigation();
    const { user, supabase } = useSupabase();
    const [visible, setVisible] = React.useState(false);
    const onToggleSnackBar = () => setVisible(!visible);
    const onDismissSnackBar = () => setVisible(false);
    const [error, setError] = useState('');

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
                setVisible(true);
                if (error.message == 'Invalid login credentials') setError('帐号密码错误或帐号不存在');
                else setError(error.message);
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
        if (!agreeToPrivacy) {
            setError('请同意隐私政策才能继续');
            setVisible(true);
            return;
        }
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

    const openPrivacyPolicy = () => {
        Linking.openURL('https://qzw881130.github.io/files/xhs-download-video/privacy-policy.html');
    };

    return (
        <>
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
                <View style={styles.checkboxContainer}>
                    <Checkbox
                        status={agreeToPrivacy ? 'checked' : 'unchecked'}
                        onPress={() => setAgreeToPrivacy(!agreeToPrivacy)}
                        style={{ borderWidth: 1, borderColor: 'black' }}
                    />
                    <Text
                        style={styles.label}
                        onPress={openPrivacyPolicy}
                    >
                        我同意 <Text style={styles.link}>隐私政策</Text>
                    </Text>
                </View>
                <Text style={styles.dataUsageInfo}>
                    （我们收集您的邮箱地址用于账户管理和通知目的。）
                </Text>
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
            <Snackbar
                visible={visible}
                onDismiss={onDismissSnackBar}
                action={{}}>
                {error}
            </Snackbar>
        </>
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
        marginBottom: 0,
        borderWidth: 0,
        borderColor: 'red'
    },
    label: {
        margin: 4,
        color: '#333',
        fontSize: 12,
        borderWidth: 0,
        borderColor: 'green'
    },
    button: {
        marginTop: 10,
    },
    link: {
        color: 'blue',
        textDecorationLine: 'underline',
    },
    dataUsageInfo: {
        fontSize: 10,
        color: 'gray',
        marginBottom: 0,
        marginLeft: 30,
        borderWidth: 0,
        borderColor: 'green'
    },
});