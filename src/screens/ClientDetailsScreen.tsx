import React, { useState, useEffect } from 'react';
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
import { 
  ChevronLeft, 
  User, 
  Phone, 
  MapPin, 
  Mail, 
  Edit, 
  Save, 
  X, 
  Trash2,
  HardDrive,
  Calendar
} from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ClienteService, Cliente } from '../services/ClienteService';

type ClientDetailsRouteProp = RouteProp<RootStackParamList, 'ClientDetails'>;
type ClientDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ClientDetails'>;

interface FormData {
  nome: string;
  telefone: string;
  endereco: string;
  email: string;
}

const ClientDetailsScreen = () => {
  const navigation = useNavigation<ClientDetailsScreenNavigationProp>();
  const route = useRoute<ClientDetailsRouteProp>();
  const { clienteId } = route.params;
  
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    telefone: '',
    endereco: '',
    email: ''
  });

  useEffect(() => {
    loadClientData();
  }, [clienteId]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      const clienteData = await ClienteService.obterClientePorId(clienteId);
      if (clienteData) {
        setCliente(clienteData);
        const data = {
          nome: clienteData.nome,
          telefone: clienteData.telefone,
          endereco: clienteData.endereco,
          email: clienteData.email || ''
        };
        setFormData(data);
        setOriginalData(data);
      } else {
        Alert.alert('Erro', 'Cliente não encontrado');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar dados do cliente');
      console.error('Erro ao carregar cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  // Adicionando as funções que estavam faltando
  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatPhone = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    
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
    
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    if (!phoneRegex.test(formData.telefone)) {
      Alert.alert('Erro', 'Formato de telefone inválido. Use: (00) 00000-0000');
      return false;
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        Alert.alert('Erro', 'Formato de email inválido');
        return false;
      }
    }

    return true;
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    if (originalData) {
      setFormData(originalData);
    }
    setEditing(false);
  };

  const handleSave = async () => {
    if (!validateForm() || !cliente) return;

    setLoading(true);
    try {
      const updatedCliente = {
        ...cliente,
        nome: formData.nome.trim(),
        telefone: formData.telefone.trim(),
        endereco: formData.endereco.trim(),
        email: formData.email.trim() || undefined,
      };

      const success = await ClienteService.atualizarCliente(updatedCliente);
      
      if (success) {
        setCliente(updatedCliente);
        setOriginalData({
          nome: formData.nome,
          telefone: formData.telefone,
          endereco: formData.endereco,
          email: formData.email
        });
        setEditing(false);
        Alert.alert('Sucesso', 'Cliente atualizado com sucesso!');
      } else {
        Alert.alert('Erro', 'Falha ao atualizar cliente. Tente novamente.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar cliente. Tente novamente.');
      console.error('Erro ao atualizar cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir Cliente',
      `Tem certeza que deseja excluir "${cliente?.nome}"?\n\nEsta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: confirmDelete
        }
      ]
    );
  };

  const confirmDelete = async () => {
    if (!cliente) return;
    
    setLoading(true);
    try {
      const success = await ClienteService.excluirCliente(cliente.id);
      if (success) {
        Alert.alert(
          'Sucesso', 
          'Cliente excluído com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Home')
            }
          ]
        );
      } else {
        Alert.alert('Erro', 'Falha ao excluir cliente. Tente novamente.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao excluir cliente. Tente novamente.');
      console.error('Erro ao excluir cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToMachines = () => {
    if (cliente) {
      navigation.navigate('MaquinasCliente', {
        clienteId: cliente.id,
        clienteNome: cliente.nome
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading && !cliente) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <ChevronLeft size={24} color="#1a73e8" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Detalhes do Cliente</Text>
            <Text style={styles.headerSubtitle}>{editing ? 'Editando' : 'Visualizando'}</Text>
          </View>
          <TouchableOpacity 
            onPress={editing ? handleCancelEdit : handleEdit} 
            style={styles.headerButton}
          >
            {editing ? (
              <X size={24} color="#f44336" />
            ) : (
              <Edit size={24} color="#1a73e8" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Informações Básicas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações do Cliente</Text>
            
            {/* Nome */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome da Empresa</Text>
              <View style={[styles.inputContainer, !editing && styles.readOnlyInput]}>
                <User size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.nome}
                  onChangeText={(text) => updateField('nome', text)}
                  editable={editing && !loading}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Telefone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefone</Text>
              <View style={[styles.inputContainer, !editing && styles.readOnlyInput]}>
                <Phone size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.telefone}
                  onChangeText={handlePhoneChange}
                  editable={editing && !loading}
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>
            </View>

            {/* Endereço */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Endereço</Text>
              <View style={[styles.inputContainer, !editing && styles.readOnlyInput]}>
                <MapPin size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.endereco}
                  onChangeText={(text) => updateField('endereco', text)}
                  editable={editing && !loading}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputContainer, !editing && styles.readOnlyInput]}>
                <Mail size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => updateField('email', text)}
                  editable={editing && !loading}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>
          </View>

          {/* Informações de Sistema */}
          {cliente && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informações do Sistema</Text>
              
              <View style={styles.infoRow}>
                <Calendar size={16} color="#666" />
                <Text style={styles.infoLabel}>Cadastrado em:</Text>
                <Text style={styles.infoValue}>
                  {formatDate(cliente.dataCadastro)}
                </Text>
              </View>
              
              {cliente.dataAtualizacao && (
                <View style={styles.infoRow}>
                  <Calendar size={16} color="#666" />
                  <Text style={styles.infoLabel}>Última atualização:</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(cliente.dataAtualizacao)}
                  </Text>
                </View>
              )}
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ID do Cliente:</Text>
                <Text style={styles.infoValue}>{cliente.id}</Text>
              </View>
            </View>
          )}

          {/* Ações Rápidas */}
          {!editing && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ações</Text>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={navigateToMachines}
              >
                <HardDrive size={20} color="#1a73e8" />
                <Text style={styles.actionButtonText}>Ver Máquinas</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Trash2 size={20} color="#f44336" />
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                  Excluir Cliente
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Botões de Ação */}
        {editing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.cancelButton, loading && styles.disabledButton]}
              onPress={handleCancelEdit}
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
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  section: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
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
  readOnlyInput: {
    backgroundColor: '#e9ecef',
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  deleteButton: {
    borderColor: '#f44336',
  },
  actionButtonText: {
    marginLeft: 12,
    fontSize: 16,
  },
  deleteButtonText: {
    color: '#f44336',
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

export default ClientDetailsScreen;