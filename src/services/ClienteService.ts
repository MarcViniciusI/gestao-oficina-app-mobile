import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  endereco: string;
  email?: string;
  dataCadastro: string;
  dataAtualizacao?: string;
}

export interface Maquina {
  id: string;
  clienteId: string;
  nome: string;
  modelo: string;
  ultimaManutencao: string;
  dataCadastro: string;
  dataAtualizacao?: string;
  pecas?: Peca[];
}
export interface Peca {
  id: string;
  maquinaId: string;
  nome: string;
  modelo: string;
  quantidade: number;
  dataCadastro: string;
  dataAtualizacao?: string;
}

const CLIENTES_KEY = '@clientes';
const MAQUINAS_KEY = '@maquinas';
const PECAS_KEY = '@pecas';

export const ClienteService = {
  // Clientes
  async obterClientes(): Promise<Cliente[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(CLIENTES_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Erro ao obter clientes:', e);
      return [];
    }
  },

  async obterClientePorId(id: string): Promise<Cliente | null> {
    try {
      const clientes = await this.obterClientes();
      return clientes.find(cliente => cliente.id === id) || null;
    } catch (e) {
      console.error('Erro ao obter cliente:', e);
      return null;
    }
  },

  async adicionarCliente(cliente: Omit<Cliente, 'dataCadastro'>): Promise<boolean> {
    try {
      const clientes = await this.obterClientes();
      const novoCliente = {
        ...cliente,
        dataCadastro: new Date().toISOString()
      };
      await AsyncStorage.setItem(
        CLIENTES_KEY,
        JSON.stringify([...clientes, novoCliente])
      );
      return true;
    } catch (e) {
      console.error('Erro ao adicionar cliente:', e);
      return false;
    }
  },

  async atualizarCliente(clienteAtualizado: Cliente): Promise<boolean> {
    try {
      const clientes = await this.obterClientes();
      const index = clientes.findIndex(c => c.id === clienteAtualizado.id);
      
      if (index === -1) return false;
      
      const updatedClientes = [...clientes];
      updatedClientes[index] = {
        ...clienteAtualizado,
        dataAtualizacao: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(CLIENTES_KEY, JSON.stringify(updatedClientes));
      return true;
    } catch (e) {
      console.error('Erro ao atualizar cliente:', e);
      return false;
    }
  },

  async excluirCliente(id: string): Promise<boolean> {
    try {
      const clientes = await this.obterClientes();
      const updatedClientes = clientes.filter(c => c.id !== id);
      await AsyncStorage.setItem(CLIENTES_KEY, JSON.stringify(updatedClientes));
      
      // Remove também as máquinas associadas
      const maquinas = await this.obterMaquinas();
      const updatedMaquinas = maquinas.filter(m => m.clienteId !== id);
      await AsyncStorage.setItem(MAQUINAS_KEY, JSON.stringify(updatedMaquinas));
      
      return true;
    } catch (e) {
      console.error('Erro ao excluir cliente:', e);
      return false;
    }
  },

  // Máquinas
  async obterMaquinas(): Promise<Maquina[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(MAQUINAS_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Erro ao obter máquinas:', e);
      return [];
    }
  },

  async obterMaquinasPorCliente(clienteId: string): Promise<Maquina[]> {
    try {
      const maquinas = await this.obterMaquinas();
      return maquinas.filter(maquina => maquina.clienteId === clienteId);
    } catch (e) {
      console.error('Erro ao obter máquinas do cliente:', e);
      return [];
    }
  },

  async adicionarMaquina(maquina: Omit<Maquina, 'id' | 'dataCadastro'>): Promise<boolean> {
    try {
      const maquinas = await this.obterMaquinas();
      const novaMaquina = {
        ...maquina,
        id: Date.now().toString(),
        dataCadastro: new Date().toISOString()
      };
      await AsyncStorage.setItem(
        MAQUINAS_KEY,
        JSON.stringify([...maquinas, novaMaquina])
      );
      return true;
    } catch (e) {
      console.error('Erro ao adicionar máquina:', e);
      return false;
    }
  },

  async atualizarMaquina(maquinaAtualizada: Maquina): Promise<boolean> {
    try {
      const maquinas = await this.obterMaquinas();
      const index = maquinas.findIndex(m => m.id === maquinaAtualizada.id);
      
      if (index === -1) return false;
      
      const updatedMaquinas = [...maquinas];
      updatedMaquinas[index] = {
        ...maquinaAtualizada,
        dataAtualizacao: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(MAQUINAS_KEY, JSON.stringify(updatedMaquinas));
      return true;
    } catch (e) {
      console.error('Erro ao atualizar máquina:', e);
      return false;
    }
  },

  async excluirMaquina(id: string): Promise<boolean> {
    try {
      const maquinas = await this.obterMaquinas();
      const updatedMaquinas = maquinas.filter(m => m.id !== id);
      await AsyncStorage.setItem(MAQUINAS_KEY, JSON.stringify(updatedMaquinas));
      
      // Remove também as peças associadas
      const pecas = await this.obterPecas();
      const updatedPecas = pecas.filter(p => p.maquinaId !== id);
      await AsyncStorage.setItem(PECAS_KEY, JSON.stringify(updatedPecas));
      
      return true;
    } catch (e) {
      console.error('Erro ao excluir máquina:', e);
      return false;
    }
  },
  // Peças
  async obterPecas(): Promise<Peca[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(PECAS_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Erro ao obter peças:', e);
      return [];
    }
  },

  async obterPecasPorMaquina(maquinaId: string): Promise<Peca[]> {
    try {
      const pecas = await this.obterPecas();
      return pecas.filter(peca => peca.maquinaId === maquinaId);
    } catch (e) {
      console.error('Erro ao obter peças da máquina:', e);
      return [];
    }
  },

  async adicionarPeca(peca: Omit<Peca, 'id' | 'dataCadastro'>): Promise<boolean> {
    try {
      const pecas = await this.obterPecas();
      const novaPeca = {
        ...peca,
        id: Date.now().toString(),
        dataCadastro: new Date().toISOString()
      };
      await AsyncStorage.setItem(
        PECAS_KEY,
        JSON.stringify([...pecas, novaPeca])
      );
      return true;
    } catch (e) {
      console.error('Erro ao adicionar peça:', e);
      return false;
    }
  },

  async atualizarPeca(pecaAtualizada: Peca): Promise<boolean> {
    try {
      const pecas = await this.obterPecas();
      const index = pecas.findIndex(p => p.id === pecaAtualizada.id);
      
      if (index === -1) return false;
      
      const updatedPecas = [...pecas];
      updatedPecas[index] = {
        ...pecaAtualizada,
        dataAtualizacao: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(PECAS_KEY, JSON.stringify(updatedPecas));
      return true;
    } catch (e) {
      console.error('Erro ao atualizar peça:', e);
      return false;
    }
  },

  async excluirPeca(id: string): Promise<boolean> {
    try {
      const pecas = await this.obterPecas();
      const updatedPecas = pecas.filter(p => p.id !== id);
      await AsyncStorage.setItem(PECAS_KEY, JSON.stringify(updatedPecas));
      return true;
    } catch (e) {
      console.error('Erro ao excluir peça:', e);
      return false;
    }
  },

  // Inicialização (para dados de teste)
  async inicializarDadosTeste(): Promise<void> {
    try {
      const clientes = await this.obterClientes();
      if (clientes.length === 0) {
        const dadosTeste: Cliente[] = [
          {
            id: '1',
            nome: 'Hospital São Lucas',
            telefone: '(81) 99999-9999',
            endereco: 'Rua testando, 123',
            email: 'hospitalsaolucas@gmail.com',
            dataCadastro: new Date().toISOString()
          },
          {
            id: '2',
            nome: 'Indústria Metalúrgica',
            telefone: '(81) 98888-8888',
            endereco: 'Av. Industrial, 456',
            dataCadastro: new Date().toISOString()
          }
        ];
        await AsyncStorage.setItem(CLIENTES_KEY, JSON.stringify(dadosTeste));
      }

      const maquinas = await this.obterMaquinas();
      if (maquinas.length === 0) {
        const dadosTeste: Maquina[] = [
          {
            id: '1',
            clienteId: '1',
            nome: 'Máquina de Lavar',
            modelo: 'ML-2023',
            ultimaManutencao: '15/03/2023',
            dataCadastro: new Date().toISOString()
          }
        ];
        await AsyncStorage.setItem(MAQUINAS_KEY, JSON.stringify(dadosTeste));
      }
    } catch (e) {
      console.error('Erro ao inicializar dados de teste:', e);
    }
  }
};