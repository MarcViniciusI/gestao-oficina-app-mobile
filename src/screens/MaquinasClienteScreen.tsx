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
import { Search, Plus, Settings, ChevronLeft, HardDrive, Wrench, Calendar } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ClienteService, Maquina } from '../services/ClienteService';

type MaquinasClienteRouteProp = RouteProp<RootStackParamList, 'MaquinasCliente'>;
type MaquinasClienteScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MaquinasCliente'>;

const MaquinasClienteScreen = () => {
  const navigation = useNavigation<MaquinasClienteScreenNavigationProp>();
  const route = useRoute<MaquinasClienteRouteProp>();
  const { clienteId, clienteNome } = route.params;
  
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMaquinas = async () => {
      try {
        const maquinasData = await ClienteService.obterMaquinasPorCliente(clienteId);
        setMaquinas(maquinasData);
      } catch (error) {
        Alert.alert('Erro', 'Falha ao carregar máquinas');
        console.error('Erro ao carregar máquinas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMaquinas();
  }, [clienteId]);

  const maquinasFiltradas = maquinas.filter(maquina =>
    maquina.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
    maquina.modelo.toLowerCase().includes(termoPesquisa.toLowerCase())
  );

  const handleAdicionarMaquina = async () => {
    try {
      const novaMaquina = {
        clienteId,
        nome: `Nova Máquina ${maquinas.length + 1}`,
        modelo: 'Novo Modelo',
        ultimaManutencao: new Date().toLocaleDateString('pt-BR'),
      };

      const success = await ClienteService.adicionarMaquina(novaMaquina);
      if (success) {
        const updatedMaquinas = await ClienteService.obterMaquinasPorCliente(clienteId);
        setMaquinas(updatedMaquinas);
      } else {
        Alert.alert('Erro', 'Não foi possível adicionar a máquina');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao adicionar máquina');
      console.error('Erro ao adicionar máquina:', error);
    }
  };

  const renderMaquina = ({ item }: { item: Maquina }) => (
  <TouchableOpacity 
    style={styles.maquinaCard}
    onPress={() => navigation.navigate('MachineDetails', { 
      maquinaId: item.id, 
      clienteNome: clienteNome 
    })}
    >
      <View style={styles.maquinaInfo}>
        <View style={styles.maquinaIconContainer}>
          <HardDrive size={24} color="#1a73e8" />
        </View>
        <View style={styles.maquinaTexto}>
          <Text style={styles.maquinaNome}>{item.nome}</Text>
          <Text style={styles.maquinaModelo}>{item.modelo}</Text>
          <View style={styles.maquinaDetalhes}>
            <Wrench size={14} color="#666" />
            <Text style={styles.maquinaDetalheTexto}>
              Última manutenção: {item.ultimaManutencao}
            </Text>
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
          <Text>Carregando máquinas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <ChevronLeft size={24} color="#1a73e8" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Máquinas do Cliente</Text>
          <Text style={styles.headerSubtitle}>{clienteNome}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar máquinas..."
            value={termoPesquisa}
            onChangeText={setTermoPesquisa}
          />
        </View>
      </View>

      {/* Add Button */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAdicionarMaquina}
        >
          <Plus size={20} color="#fff" />
          <Text style={styles.addButtonText}>Adicionar Máquina</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <View style={styles.listContainer}>
        <FlatList
          data={maquinasFiltradas}
          renderItem={renderMaquina}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <Text style={styles.listTitle}>Lista de Máquinas</Text>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <HardDrive size={48} color="#ccc" />
              <Text style={styles.emptyText}>Nenhuma máquina encontrada</Text>
              <Text style={styles.emptyText}>
                Você pode adicionar uma nova máquina clicando no botão acima
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 25,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 5,
    margin: 10,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
  },
  actionContainer: {
    marginBottom: 0,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#1a73e8',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
  },
  maquinaCard: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 16,
    borderRadius: 8,
  },
  maquinaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  maquinaIconContainer: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 24,
    marginRight: 16,
  },
  maquinaTexto: {
    flex: 1,
  },
  maquinaNome: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  maquinaModelo: {
    color: '#666',
    marginVertical: 4,
  },
  maquinaDetalhes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  maquinaDetalheTexto: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 32,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    margin: 16,
    color: '#1a73e8',
  },
});

export default MaquinasClienteScreen;