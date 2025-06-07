import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
  FlatList,
  Modal,
} from "react-native";
import {
  ChevronLeft,
  HardDrive,
  Wrench,
  Calendar,
  Edit,
  Save,
  X,
  Trash2,
  Package,
  Plus,
} from "lucide-react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { ClienteService, Maquina, Peca } from "../services/ClienteService";

type MachineDetailsRouteProp = RouteProp<RootStackParamList, "MachineDetails">;
type MachineDetailsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "MachineDetails"
>;

interface FormData {
  nome: string;
  modelo: string;
  ultimaManutencao: string;
}

const MachineDetailsScreen = () => {
  const navigation = useNavigation<MachineDetailsScreenNavigationProp>();
  const route = useRoute<MachineDetailsRouteProp>();
  const { maquinaId, clienteNome } = route.params;

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [maquina, setMaquina] = useState<Maquina | null>(null);
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    modelo: "",
    ultimaManutencao: "",
  });
  const [editingPeca, setEditingPeca] = useState<Peca | null>(null);
  const [pecaEditData, setPecaEditData] = useState({
    nome: "",
    modelo: "",
    quantidade: 1,
  });

  useEffect(() => {
    loadMachineData();
  }, [maquinaId]);

  const loadMachineData = async () => {
    try {
      setLoading(true);
      const maquinas = await ClienteService.obterMaquinas();
      const maquinaData = maquinas.find((m) => m.id === maquinaId);

      if (maquinaData) {
        setMaquina(maquinaData);
        const data = {
          nome: maquinaData.nome,
          modelo: maquinaData.modelo,
          ultimaManutencao: maquinaData.ultimaManutencao,
        };
        setFormData(data);
        setOriginalData(data);

        const pecasData = await ClienteService.obterPecasPorMaquina(maquinaId);
        setPecas(pecasData);
      } else {
        Alert.alert("Erro", "Máquina não encontrada");
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao carregar dados da máquina");
      console.error("Erro ao carregar máquina:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.nome.trim()) {
      Alert.alert("Erro", "Nome é obrigatório");
      return false;
    }
    if (!formData.modelo.trim()) {
      Alert.alert("Erro", "Modelo é obrigatório");
      return false;
    }
    if (!formData.ultimaManutencao.trim()) {
      Alert.alert("Erro", "Data da última manutenção é obrigatória");
      return false;
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
    if (!validateForm() || !maquina) return;

    setLoading(true);
    try {
      const updatedMaquina = {
        ...maquina,
        nome: formData.nome.trim(),
        modelo: formData.modelo.trim(),
        ultimaManutencao: formData.ultimaManutencao.trim(),
      };

      const success = await ClienteService.atualizarMaquina(updatedMaquina);

      if (success) {
        setMaquina(updatedMaquina);
        setOriginalData({
          nome: formData.nome,
          modelo: formData.modelo,
          ultimaManutencao: formData.ultimaManutencao,
        });
        setEditing(false);
        Alert.alert("Sucesso", "Máquina atualizada com sucesso!");
      } else {
        Alert.alert("Erro", "Falha ao atualizar máquina. Tente novamente.");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao atualizar máquina. Tente novamente.");
      console.error("Erro ao atualizar máquina:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Excluir Máquina",
      `Tem certeza que deseja excluir "${maquina?.nome}"?\n\nEsta ação não pode ser desfeita e excluirá também todas as peças associadas.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    if (!maquina) return;

    setLoading(true);
    try {
      const success = await ClienteService.excluirMaquina(maquina.id);
      if (success) {
        Alert.alert("Sucesso", "Máquina excluída com sucesso!", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert("Erro", "Falha ao excluir máquina. Tente novamente.");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao excluir máquina. Tente novamente.");
      console.error("Erro ao excluir máquina:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPeca = (peca: Peca) => {
    setEditingPeca(peca);
    setPecaEditData({
      nome: peca.nome,
      modelo: peca.modelo,
      quantidade: peca.quantidade,
    });
  };

  const handleSavePeca = async () => {
    if (!editingPeca) return;

    try {
      const updatedPeca = {
        ...editingPeca,
        nome: pecaEditData.nome.trim(),
        modelo: pecaEditData.modelo.trim(),
        quantidade: Number(pecaEditData.quantidade) || 1,
        dataAtualizacao: new Date().toISOString(),
      };

      const success = await ClienteService.atualizarPeca(updatedPeca);

      if (success) {
        const updatedPecas = await ClienteService.obterPecasPorMaquina(
          maquinaId
        );
        setPecas(updatedPecas);
        setEditingPeca(null);
        Alert.alert("Sucesso", "Peça atualizada com sucesso!");
      } else {
        Alert.alert("Erro", "Falha ao atualizar peça. Tente novamente.");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao atualizar peça. Tente novamente.");
      console.error("Erro ao atualizar peça:", error);
    }
  };

  const handleAddPeca = () => {
    setEditingPeca({
      id: "",
      maquinaId: maquinaId,
      nome: "",
      modelo: "",
      quantidade: 1,
      dataCadastro: new Date().toISOString(),
    });
    setPecaEditData({
      nome: "",
      modelo: "",
      quantidade: 1,
    });
  };

  const handleAddNewPeca = async () => {
    try {
      const novaPeca = {
        maquinaId: maquinaId,
        nome: pecaEditData.nome.trim(),
        modelo: pecaEditData.modelo.trim(),
        quantidade: Number(pecaEditData.quantidade) || 1,
      };

      const success = await ClienteService.adicionarPeca(novaPeca);

      if (success) {
        const updatedPecas = await ClienteService.obterPecasPorMaquina(
          maquinaId
        );
        setPecas(updatedPecas);
        setEditingPeca(null);
        Alert.alert("Sucesso", "Peça adicionada com sucesso!");
      } else {
        Alert.alert("Erro", "Falha ao adicionar peça. Tente novamente.");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao adicionar peça. Tente novamente.");
      console.error("Erro ao adicionar peça:", error);
    }
  };

  const handleDeletePeca = (pecaId: string) => {
    Alert.alert("Excluir Peça", "Tem certeza que deseja excluir esta peça?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            const success = await ClienteService.excluirPeca(pecaId);
            if (success) {
              const updatedPecas = await ClienteService.obterPecasPorMaquina(
                maquinaId
              );
              setPecas(updatedPecas);
            }
          } catch (error) {
            Alert.alert("Erro", "Falha ao excluir peça. Tente novamente.");
            console.error("Erro ao excluir peça:", error);
          }
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const renderPeca = ({ item }: { item: Peca }) => (
    <View style={styles.pecaCard}>
      <View style={styles.pecaInfo}>
        <View style={styles.pecaIconContainer}>
          <Package size={20} color="#1a73e8" />
        </View>
        <View style={styles.pecaTexto}>
          <Text style={styles.pecaNome}>{item.nome}</Text>
          <Text style={styles.pecaModelo}>{item.modelo}</Text>
          <Text style={styles.pecaQuantidade}>
            Quantidade: {item.quantidade}
          </Text>
        </View>
      </View>
      <View style={styles.pecaActions}>
        <TouchableOpacity
          style={styles.pecaActionButton}
          onPress={() => handleEditPeca(item)}
        >
          <Edit size={16} color="#1a73e8" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.pecaActionButton}
          onPress={() => handleDeletePeca(item.id)}
        >
          <Trash2 size={16} color="#f44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !maquina) {
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
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
          >
            <ChevronLeft size={24} color="#1a73e8" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Detalhes da Máquina</Text>
            <Text style={styles.headerSubtitle}>{clienteNome}</Text>
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
            <Text style={styles.sectionTitle}>Informações da Máquina</Text>

            {/* Nome */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome da Máquina</Text>
              <View
                style={[
                  styles.inputContainer,
                  !editing && styles.readOnlyInput,
                ]}
              >
                <HardDrive size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.nome}
                  onChangeText={(text) => updateField("nome", text)}
                  editable={editing && !loading}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Modelo */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Modelo</Text>
              <View
                style={[
                  styles.inputContainer,
                  !editing && styles.readOnlyInput,
                ]}
              >
                <Wrench size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.modelo}
                  onChangeText={(text) => updateField("modelo", text)}
                  editable={editing && !loading}
                />
              </View>
            </View>

            {/* Última Manutenção */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Última Manutenção</Text>
              <View
                style={[
                  styles.inputContainer,
                  !editing && styles.readOnlyInput,
                ]}
              >
                <Calendar size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.ultimaManutencao}
                  onChangeText={(text) => updateField("ultimaManutencao", text)}
                  editable={editing && !loading}
                />
              </View>
            </View>
          </View>

          {/* Lista de Peças */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Peças da Máquina</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddPeca}
                disabled={editing}
              >
                <Plus size={16} color="#1a73e8" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={pecas}
              renderItem={renderPeca}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={styles.emptyPecas}>
                  <Package size={32} color="#ccc" />
                  <Text style={styles.emptyPecasText}>
                    Nenhuma peça cadastrada
                  </Text>
                </View>
              }
            />
          </View>

          {/* Informações de Sistema */}
          {maquina && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informações do Sistema</Text>

              <View style={styles.infoRow}>
                <Calendar size={16} color="#666" />
                <Text style={styles.infoLabel}>Cadastrado em:</Text>
                <Text style={styles.infoValue}>
                  {formatDate(maquina.dataCadastro)}
                </Text>
              </View>

              {maquina.dataAtualizacao && (
                <View style={styles.infoRow}>
                  <Calendar size={16} color="#666" />
                  <Text style={styles.infoLabel}>Última atualização:</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(maquina.dataAtualizacao)}
                  </Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ID da Máquina:</Text>
                <Text style={styles.infoValue}>{maquina.id}</Text>
              </View>
            </View>
          )}

          {/* Ações Rápidas */}
          {!editing && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ações</Text>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Trash2 size={20} color="#f44336" />
                <Text
                  style={[styles.actionButtonText, styles.deleteButtonText]}
                >
                  Excluir Máquina
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
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Modal de Edição de Peça */}
        <Modal
          visible={editingPeca !== null}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setEditingPeca(null)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                {editingPeca?.id ? "Editar Peça" : "Adicionar Peça"}
              </Text>

              <ScrollView
                style={styles.modalScroll}
                keyboardShouldPersistTaps="handled"
              >
                {/* Nome da Peça */}
                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>Nome da Peça*</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={pecaEditData.nome}
                    onChangeText={(text) =>
                      setPecaEditData({ ...pecaEditData, nome: text })
                    }
                    placeholder="Digite o nome da peça"
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                </View>

                {/* Modelo */}
                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>Modelo*</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={pecaEditData.modelo}
                    onChangeText={(text) =>
                      setPecaEditData({ ...pecaEditData, modelo: text })
                    }
                    placeholder="Digite o modelo da peça"
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                </View>

                {/* Quantidade */}
                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>Quantidade*</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={pecaEditData.quantidade.toString()}
                    onChangeText={(text) =>
                      setPecaEditData({
                        ...pecaEditData,
                        quantidade: Number(text) || 0,
                      })
                    }
                    placeholder="Digite a quantidade"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    returnKeyType="done"
                  />
                </View>
              </ScrollView>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => setEditingPeca(null)}
                >
                  <Text style={styles.modalCancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.modalSaveButton]}
                  onPress={async () => {
                    if (editingPeca?.id) {
                      await handleSavePeca();
                    } else {
                      await handleAddNewPeca();
                    }
                  }}
                  disabled={!pecaEditData.nome || !pecaEditData.modelo}
                >
                  <Text style={styles.modalSaveButtonText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  modalScroll: {
    maxHeight: 300,
  },
  keyboardAvoid: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 25,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
  },
  readOnlyInput: {
    backgroundColor: "#e9ecef",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#333",
  },
  pecaCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  pecaInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  pecaIconContainer: {
    backgroundColor: "#e3f2fd",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  pecaTexto: {
    flex: 1,
  },
  pecaNome: {
    fontSize: 16,
    fontWeight: "bold",
  },
  pecaModelo: {
    fontSize: 14,
    color: "#666",
  },
  pecaQuantidade: {
    fontSize: 12,
    color: "#666",
  },
  pecaActions: {
    flexDirection: "row",
  },
  pecaActionButton: {
    marginLeft: 12,
  },
  emptyPecas: {
    alignItems: "center",
    padding: 16,
  },
  emptyPecasText: {
    marginTop: 8,
    color: "#666",
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1a73e8",
    justifyContent: "center",
    alignItems: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    fontWeight: "bold",
  },
  infoValue: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 8,
  },
  deleteButton: {
    borderColor: "#f44336",
  },
  actionButtonText: {
    marginLeft: 12,
    fontSize: 16,
  },
  deleteButtonText: {
    color: "#f44336",
  },
  actionButtons: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  saveButton: {
    flex: 2,
    flexDirection: "row",
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a73e8",
    borderRadius: 8,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCancelButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
  },
  modalSaveButton: {
    backgroundColor: "#1a73e8",
    marginLeft: 10,
  },
  modalCancelButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  modalSaveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#f8f9fa",
    marginBottom: 2,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  modalInputGroup: {
    marginBottom: 16,
  },
});

export default MachineDetailsScreen;
