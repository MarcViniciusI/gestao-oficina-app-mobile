import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { Eye, EyeOff, User, Lock, Wrench } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const validarCampos = () => {
    if (!usuario.trim()) {
      Alert.alert('Erro', 'Por favor, digite seu usuário');
      return false;
    }
    if (!senha.trim()) {
      Alert.alert('Erro', 'Por favor, digite sua senha');
      return false;
    }
    if (senha.length < 4) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 4 caracteres');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validarCampos()) return;

    setCarregando(true);
    
    try {
      // Simulação de autenticação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Para demonstração, vamos aceitar qualquer usuário/senha válidos
      if (usuario && senha) {
        Alert.alert('Sucesso', `Bem-vindo, ${usuario}!`, [
          { 
            text: 'OK', 
            onPress: () => {
              console.log('Login realizado com sucesso');
              // Navegar para a tela Home
              navigation.navigate('Home');
            }
          }
        ]);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha na autenticação. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const limparCampos = () => {
    setUsuario('');
    setSenha('');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header com Logo/Nome da Empresa */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Wrench size={50} color="#1a73e8" />
          </View>
          <Text style={styles.empresaNome}>TEC-MAQLI LTDA</Text>
          <Text style={styles.empresaSubtitulo}>Oficina Mecânica de Máquinas Industriais</Text>
        </View>

        {/* Formulário de Login */}
        <View style={styles.formContainer}>
          <Text style={styles.titulo}>Entrar no Sistema</Text>
          
          {/* Campo Usuário */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIconContainer}>
              <User size={20} color="#666" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Usuário"
              value={usuario}
              onChangeText={setUsuario}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!carregando}
            />
          </View>

          {/* Campo Senha */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIconContainer}>
              <Lock size={20} color="#666" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!mostrarSenha}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!carregando}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setMostrarSenha(!mostrarSenha)}
            >
              {mostrarSenha ? (
                <EyeOff size={20} color="#666" />
              ) : (
                <Eye size={20} color="#666" />
              )}
            </TouchableOpacity>
          </View>

          {/* Botões */}
          <TouchableOpacity
            style={[styles.loginButton, carregando && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={carregando}
          >
            <Text style={styles.loginButtonText}>
              {carregando ? 'Entrando...' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.clearButton}
            onPress={limparCampos}
            disabled={carregando}
          >
            <Text style={styles.clearButtonText}>Limpar Campos</Text>
          </TouchableOpacity>
        </View>

        {/* Rodapé */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Sistema de Gestão - TEC-MAQLI LTDA
          </Text>
          <Text style={styles.footerVersion}>Versão 1.0.0</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#e3f2fd',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  empresaNome: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a73e8',
    textAlign: 'center',
  },
  empresaSubtitulo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  inputIconContainer: {
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    padding: 12,
  },
  loginButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  clearButtonText: {
    color: '#666',
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  footerVersion: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
});

export default LoginScreen;