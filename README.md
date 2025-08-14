# 🤖 Bot Discord.js Completo

Bot Discord.js v14 completo com sistema de sharding, comandos prefix e slash, moderação avançada e muito mais!

## ✨ Características

### 🚀 Core Features
- **Sharding automático** com gerenciamento completo
- **Dual command support** - Comandos prefix e slash commands
- **Sistema de permissões robusto** com verificação de hierarquia
- **Error logging** completo com sistema de logs

### 📊 Analytics & Monitoring
- **Estatísticas detalhadas** do bot e servidor
- **Monitoramento de performance** em tempo real
- **Métricas de uso** de comandos
- **Sistema de erro** com tracking completo

## 📁 Estrutura do Projeto

```
bot-discord/
├── 📄 index.js                 # Shard Manager
├── 📄 bot.js                   # Cliente principal
├── 📄 deploy.js                # Deploy de slash commands
├── 📄 package.json             # Dependências
├── 📄 .env                     # Variáveis de ambiente
├── 📄 README.md                # Documentação
├── 📁 events/                  # Eventos do Discord
│   ├── ready.js
│   ├── messageCreate.js
│   ├── interactionCreate.js
│   └── guildCreate.js
├── 📁 commands/                # Comandos prefix
│   ├── 📁 general/
│   │   └── ping.js
└── 📁 slashCommands/           # Slash commands
    ├── 📁 general/
        └── ping.js

```

## 🚀 Instalação e Configuração

### 1. Pré-requisitos
- Node.js 16.11.0 ou superior
- NPM ou Yarn
- Bot Discord criado no Discord Developer Portal

### 2. Instalação
```bash
# Clone o repositório
git clone https://github.com/IamHellBurn/Bot-Discord.js-v14.git
cd Bot-Discord

# Instale as dependências
npm install

# Copie o arquivo de configuração
cp .env.example .env
```

### 3. Configuração do .env
```env
# Discord Bot Configuration
DISCORD_TOKEN=seu_token_aqui
CLIENT_ID=id_do_seu_bot
GUILD_ID=id_do_servidor_teste  # Opcional

# Bot Settings
PREFIX=!
OWNER_ID=seu_id_discord

# Development
NODE_ENV=development
```

### 4. Obter Token e IDs

#### Token do Bot:
1. Acesse https://discord.com/developers/applications
2. Selecione sua aplicação
3. Vá em "Bot" → "Token" → "Copy"

#### Client ID:
1. Na mesma página da aplicação
2. Vá em "General Information" → "Application ID" → "Copy"

#### Guild ID (Opcional):
1. No Discord, ative o Modo Desenvolvedor
2. Clique com botão direito no servidor
3. "Copiar ID do servidor"

### 5. Deploy dos Slash Commands
```bash
# Registrar comandos no servidor de teste (recomendado)
node deploy.js

# Registrar comandos globalmente (pode levar 1 hora)
# Remova GUILD_ID do .env e execute:
node deploy.js

# Limpar todos os comandos
node deploy.js --clear
```

### 6. Executar o Bot
```bash
# Modo produção
npm start

# Modo desenvolvimento (com auto-reload)
npm run dev
```

## 📋 Comandos Disponíveis

### 🔧 Comandos Gerais
| Comando | Slash | Descrição |
|---------|--------|-----------|
| `!ping` | `/ping` | Mostra latência do bot |


## 🔧 Configuração Avançada

### Permissões Recomendadas:
O bot precisa das seguintes permissões para funcionar corretamente:

```
✅ Ver Canais
✅ Enviar Mensagens
✅ Gerenciar Mensagens
✅ Usar Comandos de Barra
✅ Ver Histórico de Mensagens
✅ Banir Membros
✅ Expulsar Membros
✅ Moderar Membros (Timeout)
✅ Adicionar Reações
```

### Variáveis de Ambiente Opcionais:
```env
# Auto-registro de slash commands em novos servidores
AUTO_REGISTER_SLASH=true

# Múltiplos owners (separados por vírgula)
OWNER_ID=123456789,987654321

# Configurações de embed
EMBED_COLOR=#5865f2
ERROR_COLOR=#ed4245
SUCCESS_COLOR=#57f287
```

## 🐛 Solução de Problemas

### Bot não responde a comandos:
1. Verifique se o token está correto
2. Confirme se o bot está online
3. Verifique as permissões do bot no servidor

### Slash commands não aparecem:
1. Execute `node deploy.js` novamente
2. Se registrado globalmente, aguarde até 1 hora
3. Verifique se o CLIENT_ID está correto

### Erros de permissão:
1. Verifique se o bot tem as permissões necessárias
2. Confirme a hierarquia de cargos
3. Use `!ping` para verificar permissões

## 📊 Monitoramento

### Logs importantes:
```bash
# Inicialização
✅ Bot inicializado com sucesso!
🎉 Bot está online!

# Comandos
📋 Comando executado: ping | Usuário: User#1234
⚡ Slash command executado: /ping | Usuário: User#1234

# Erros
❌ Erro ao executar comando ping: Error message
```

## 📈 Performance

### Otimizações implementadas:
- Cache eficiente de usuários e servidores
- Lazy loading de comandos
- Garbage collection otimizada
- Sharding automático para bots grandes

### Monitoramento de recursos:
```bash
# Informações detalhadas
node --inspect index.js
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Changelog

### v1.0.0 (14-08-2025)
- ✅ Comandos prefix e slash
- ✅ Analytics e logging

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🔗 Links Úteis

- [Discord.js Documentação](https://discord.js.org/#/docs)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Node.js Download](https://nodejs.org/)

---

<div align="center">
  <strong>⭐ Se este projeto foi útil, considere dar uma estrela!</strong>
</div>
