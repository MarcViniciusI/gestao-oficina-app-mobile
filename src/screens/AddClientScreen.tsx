import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { ChevronLeft, User, Phone, MapPin, Mail, Save, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ClienteService } from '../services/ClienteService';

type AddClientScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddClient'>;

interface FormData {
  nome: string;
  telefone: string;
  endereco: string;
  email: string;
}

const AddClientScreen = () => {
  const navigation = useNavigation<AddClientScreenNavigationProp>();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    telefone: '',
    endereco: '',
    email: ''
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Adicione esta função de validação
  const validateForm = (): boolean => {
    if (!formData.nome.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return false;
    }
    if (!formData.telefone.trim()) {
      Alert.alert('Erro', 'Telefone é obrigatório');
      return false;
    }
    if (!formData.endereco.trim()) {
      Alert.alert('Erro', 'Endereço é obrigatório');
      return false;
    }
    
    // Validação básica de telefone
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    if (!phoneRegex.test(formData.telefone)) {
      Alert.alert('Erro', 'Formato de telefone inválido. Use: (00) 00000-0000');
      return false;
    }

    // Validação básica de email (se preenchido)
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        Alert.alert('Erro', 'Formato de email inválido');
        return false;
      }
    }

    return true;
  };

  const formatPhone = (text: string) => {
    // Remove tudo que não é número
    const numbers = text.replace(/\D/g, '');
    
    // Aplica a máscara
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhone(text);
    updateField('telefone', formatted);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const novoCliente = {
        id: Date.now().toString(),
        nome: formData.nome.trim(),
        telefone: formData.telefone.trim(),
        endereco: formData.endereco.trim(),
        email: formData.email.trim() || undefined,
      };

      const success = await ClienteService.adicionarCliente(novoCliente);
      
      if (success) {
        Alert.alert(
          'Sucesso', 
          'Cliente cadastrado com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Erro', 'Falha ao cadastrar cliente. Tente novamente.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao cadastrar cliente. Tente novamente.');
      console.error('Erro ao salvar cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancelar',
      'Deseja realmente cancelar? Os dados não salvos serão perdidos.',
      [
        { text: 'Continuar Editando', style: 'cancel' },
        { text: 'Cancelar', style: 'destructive', onPress: () => navigation.goBack() }
      ]
    );
  };

  const clearForm = () => {
    setFormData({
      nome: '',
      telefone: '',
      endereco: '',
      email: ''
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <ChevronLeft size={24} color="#1a73e8" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Novo Cliente</Text>
            <Text style={styles.headerSubtitle}>Preencha os dados</Text>
          </View>
          <TouchableOpacity onPress={clearForm} style={styles.headerButton}>
            <X size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Formulário */}
          <View style={styles.form}>
            {/* Nome */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome da Empresa *</Text>
              <View style={styles.inputContainer}>
                <User size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Hospital São Lucas"
                  value={formData.nome}
                  onChangeText={(text) => updateField('nome', text)}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Telefone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefone *</Text>
              <View style={styles.inputContainer}>
                <Phone size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="(81) 99999-9999"
                  value={formData.telefone}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  maxLength={15}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Endereço */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Endereço *</Text>
              <View style={styles.inputContainer}>
                <MapPin size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Rua das Flores, 123"
                  value={formData.endereco}
                  onChangeText={(text) => updateField('endereco', text)}
                  editable={!loading}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="contato@empresa.com"
                  value={formData.email}
                  onChangeText={(text) => updateField('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </View>

            <Text style={styles.requiredNote}>* Campos obrigatórios</Text>
          </View>
        </ScrollView>

        {/* Botões de Ação */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.cancelButton, loading && styles.disabledButton]}
            onPress={handleCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSave}
            disabled={loading}
          >
            <Save size={20} color="#fff" />
            <Text style={styles.saveButtonText}>
              {loading ? 'Salvando...' : 'Salvar Cliente'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 25,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  form: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
  },
  requiredNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default AddClientScreen;