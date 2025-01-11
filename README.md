# CondoIndica

![CondoIndica Logo](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/condoIndica%20(2)-TDwwOBaMkYwt4TtbyCzDM3T1yTwrOH.png)

## 📱 Sobre o Projeto

CondoIndica é uma plataforma inovadora que conecta moradores de condomínios com prestadores de serviços confiáveis. O aplicativo permite que os moradores compartilhem e acessem recomendações de serviços, criando uma comunidade colaborativa e confiável.

## ✨ Funcionalidades Principais

- 👥 Sistema de cadastro e autenticação de usuários
- 🏢 Perfis de condomínios e moradores
- 📝 Sistema de indicações de serviços
- ⭐ Avaliações e comentários
- 💰 Sistema de pontos por participação
- 🎫 Resgate de cupons de desconto
- 📱 Interface responsiva para mobile e desktop

## 🚀 Tecnologias Utilizadas

- Next.js 13 (App Router)
- React
- TypeScript
- Firebase (Auth, Firestore, Storage)
- Tailwind CSS
- shadcn/ui
- Lucide Icons

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn
- Conta no Firebase
- Git

## 🛠️ Instalação

Vou explicar passo a passo como fazer o projeto funcionar após clonar o repositório:

1. **Instalação das Dependências**


```shellscript
# Entre na pasta do projeto
cd condoindica

# Instale todas as dependências necessárias
npm install
# ou
yarn install
```

2. **Configuração do Firebase**
Crie um arquivo `.env.local` na raiz do projeto e adicione as seguintes variáveis com suas credenciais do Firebase:


```plaintext
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

Para obter essas credenciais:

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá em Configurações do Projeto > Geral
4. Role até "Seus aplicativos" e clique em Web (`</>`)
5. Registre o app e copie as credenciais
6. **Configuração do Firebase Console**


No Firebase Console, você precisa:

a) **Ativar a Autenticação**:

- Vá para Authentication > Sign-in method
- Ative o provedor "E-mail/senha"


b) **Configurar o Firestore**:

- Vá para Firestore Database
- Crie um banco de dados
- Inicie em modo de teste


c) **Configurar o Storage**:

- Vá para Storage
- Configure as regras iniciais


4. **Estrutura Inicial do Banco de Dados**


O Firestore precisa ter as seguintes coleções:

```plaintext
- users (para dados dos usuários)
- condominios (para dados dos condomínios)
- indicacoes (para as indicações de serviços)
- tipos (para tipos de serviços)
- coupons (para cupons de desconto)
```

5. **Iniciando o Projeto**


```shellscript
# Inicie o servidor de desenvolvimento
npm run dev
# ou
yarn dev
```

6. **Primeiro Acesso**
7. Acesse [http://localhost:3000](http://localhost:3000)
8. Crie uma conta de usuário através do formulário de cadastro
9. Complete seu perfil com as informações necessárias
10. **Configurando um SuperAdmin**


Para criar um superadmin, você precisa:

1. Fazer login com uma conta
2. No Firestore, encontre o documento do usuário
3. Adicione o campo `role: "superadmin"`
4. **Verificação de Funcionamento**


Verifique se as seguintes funcionalidades estão operando:

- Cadastro de usuário
- Login
- Preenchimento de perfil
- Upload de imagens
- Criação de indicações
- Sistema de pontos
- Cupons


9. **Solução de Problemas Comuns**


Se encontrar problemas:

1. **Erro de Firebase não inicializado**

1. Verifique se as variáveis de ambiente estão corretas
2. Confirme se o arquivo `.env.local` está na raiz



2. **Erro de permissões no Firestore**

1. Verifique as regras de segurança no Firebase Console



3. **Problemas com imagens**

1. Confirme se o Storage está configurado corretamente
2. Verifique as permissões de upload



4. **Erro de rotas**

1. Certifique-se de que está usando o Next.js 13+ com App Router



5. **Desenvolvimento**


Para desenvolver novas features:

```shellscript
# Crie uma nova branch
git checkout -b feature/nova-funcionalidade

# Faça suas alterações e teste localmente

# Commit suas mudanças
git add .
git commit -m "Descrição da nova funcionalidade"

# Push para o repositório
git push origin feature/nova-funcionalidade
```

11. **Comandos Úteis**


```shellscript
# Limpar cache do Next.js
npm run clean

# Verificar código
npm run lint

# Construir versão de produção
npm run build

# Testar build de produção localmente
npm run start
```

