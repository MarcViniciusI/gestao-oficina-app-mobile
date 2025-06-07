import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { Search, Plus, User, Phone, MapPin, Settings, LogOut } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ClienteService, Cliente } from '../services/ClienteService';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClientes = async () => {
      try {
        // Inicializa dados de teste se necessário
        await ClienteService.inicializarDadosTeste();
        
        // Carrega clientes
        const clientesData = await ClienteService.obterClientes();
        setClientes(clientesData);
      } catch (error) {
        Alert.alert('Erro', 'Falha ao carregar clientes');
        console.error('Erro ao carregar clientes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClientes();
  }, []);

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
    cliente.telefone.includes(termoPesquisa) ||
    cliente.endereco.toLowerCase().includes(termoPesquisa.toLowerCase())
  );

  const handleAdicionarCliente = () => {
    navigation.navigate('AddClient');
  };

  const handleSelecionarCliente = (cliente: Cliente) => {
    navigation.navigate('ClientDetails', { clienteId: cliente.id });
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair do sistema?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: () => navigation.navigate('Login') }
      ]
    );
  };

  const renderCliente = ({ item }: { item: Cliente }) => (
    <TouchableOpacity 
      style={styles.clienteCard}
      onPress={() => handleSelecionarCliente(item)}
    >
      <View style={styles.clienteInfo}>
        <View style={styles.clienteIconContainer}>
          <User size={24} color="#1a73e8" />
        </View>
        <View style={styles.clienteTexto}>
          <Text style={styles.clienteNome}>{item.nome}</Text>
          <View style={styles.clienteDetalhes}>
            <Phone size={14} color="#666" />
            <Text style={styles.clienteDetalheTexto}>{item.telefone}</Text>
          </View>
          <View style={styles.clienteDetalhes}>
            <MapPin size={14} color="#666" />
            <Text style={styles.clienteDetalheTexto}>{item.endereco}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text>Carregando clientes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
  <SafeAreaView style={styles.container}>
    {/* Header */}
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>Clientes</Text>
        <Text style={styles.headerSubtitle}>Total: {clientesFiltrados.length}</Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleLogout}
        >
          <LogOut size={24} color="#1a73e8" />
        </TouchableOpacity>
        {/* 
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.navigate({ name: 'Settings' })}
        >
          <Settings size={24} color="#1a73e8" />
        </TouchableOpacity>
        */}
      </View>
    </View>

    {/* Search */}
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Search size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar clientes..."
          value={termoPesquisa}
          onChangeText={setTermoPesquisa}
        />
      </View>
    </View>

    {/* Add Button */}
    <View style={styles.actionContainer}>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAdicionarCliente}
      >
        <Plus size={20} color="#fff" />
        <Text style={styles.addButtonText}>Adicionar Cliente</Text>
      </TouchableOpacity>
    </View>

    {/* List */}
    <View style={styles.listContainer}>
      <FlatList
        data={clientesFiltrados}
        renderItem={renderCliente}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={styles.listTitle}>Lista de Clientes</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <User size={48} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum cliente encontrado</Text>
            <Text style={styles.emptySubtext}>
              Você pode adicionar um novo cliente clicando no botão acima
            </Text>
          </View>
        }
      />
    </View>
  </SafeAreaView>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a73e8',
    marginTop: 35
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  actionContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  addButton: {
    backgroundColor: '#1a73e8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listContent: {
    paddingBottom: 20,
  },
  clienteCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  clienteInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  clienteIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#e3f2fd',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clienteTexto: {
    flex: 1,
  },
  clienteNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  clienteDetalhes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  clienteDetalheTexto: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HomeScreen;