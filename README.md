# SISTEMA DE GESTÃO TEC-MAQLI LTDA

Aplicativo Android desenvolvido em React Native para a empresa **Tec-Maqli Ltda**, uma oficina especializada em manutenção de máquinas industriais.

## 📱 Sobre o Projeto

Este aplicativo foi desenvolvido como parte de um projeto de extensão acadêmico com o objetivo de digitalizar os processos da oficina, como:

- Cadastro e gerenciamento de clientes
- Registro e visualização de máquinas associadas a cada cliente
- Controle de peças utilizadas em manutenções
- Armazenamento local de dados simulados (mock service)
- Interface simples, moderna e intuitiva

## 🎯 Objetivos

- Melhorar a organização e o atendimento da oficina
- Substituir processos manuais por controle digital eficiente
- Aplicar conhecimentos práticos de desenvolvimento mobile

## 🛠️ Tecnologias Utilizadas

- [React Native](https://reactnative.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [React Navigation](https://reactnavigation.org/)
- [Lucide Icons](https://lucide.dev/)
- Simulação de dados com `ClienteService.ts`
  
## Estrutura do Projeto
src/

├── navigation/

│   └── AppNavigator.tsx

├── screens/

│   ├── LoginScreen.tsx

│   ├── HomeScreen.tsx

│   ├── AddClientScreen.tsx

│   ├── ClientDetailsScreen.tsx

│   ├── MaquinasClienteScreen.tsx

│   └── MachineDetailsScreen.tsx

├── services/

│   └── ClienteService.ts

└── App.tsx

## 🧩 Funcionalidades

- Tela de Login (simulada)
- Home com busca de clientes
- Cadastro, edição e exclusão de clientes
- Visualização de máquinas por cliente
- Detalhamento e controle de peças por máquina

## 📂 Estrutura de Pastas
/screens         

Telas da aplicação (Login, Home, Clientes, Máquinas)

/services        

Lógica de dados simulados (ClienteService)

/navigation      

Navegação entre telas


## 🧪 Como Rodar o Projeto

```bash
# Clone este repositório
git clone [https://github.com/MarcViniciusI/gestao-oficina-app-mobile.git]

# Acesse a pasta do projeto
cd tecmqli-app

# Instale as dependências
npm install

# Inicie o projeto no emulador Android
npx react-native run-android
```

## 📚 Licença
Este projeto foi desenvolvido para fins acadêmicos e não possui licença comercial. Uso livre com créditos.


