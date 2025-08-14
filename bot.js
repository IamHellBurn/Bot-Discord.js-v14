import { 
    Client, 
    Collection, 
    GatewayIntentBits, 
    Partials,
    ActivityType,
    EmbedBuilder
} from 'discord.js';
import { config } from 'dotenv';
import { readdir } from 'fs/promises';
import { pathToFileURL } from 'url';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Configurar variáveis de ambiente
config();

// Obter diretório atual para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Criar cliente Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
    ],
    allowedMentions: {
        parse: ['users', 'roles'],
        repliedUser: false
    }
});

// Collections para armazenar comandos
client.commands = new Collection();
client.slashCommands = new Collection();
client.events = new Collection();

// Configurações do bot
client.config = {
    prefix: process.env.PREFIX || '!',
    ownerIds: process.env.OWNER_ID ? process.env.OWNER_ID.split(',') : [],
    embedColor: '#5865f2',
    errorColor: '#ed4245',
    successColor: '#57f287'
};

// Sistema de tracking de comandos
client.commandStats = new Map();
client.errorLogs = [];

// Sistema de warnings (em memória - em produção usar banco de dados)
client.warnings = new Map();

// Função para carregar eventos
async function loadEvents() {
    try {
        const eventFiles = await readdir(join(__dirname, 'events'));
        
        for (const file of eventFiles) {
            if (!file.endsWith('.js')) continue;
            
            const filePath = pathToFileURL(join(__dirname, 'events', file));
            const event = await import(filePath);
            
            if (event.default?.name) {
                const eventFunction = event.default;
                
                if (eventFunction.once) {
                    client.once(eventFunction.name, (...args) => eventFunction.execute(...args, client));
                } else {
                    client.on(eventFunction.name, (...args) => eventFunction.execute(...args, client));
                }
                
                client.events.set(eventFunction.name, eventFunction);
                console.log(`✅ Evento carregado: ${eventFunction.name}`);
            }
        }
    } catch (error) {
        console.error('❌ Erro ao carregar eventos:', error);
    }
}

// Função para carregar comandos prefix
async function loadCommands() {
    try {
        const commandFolders = await readdir(join(__dirname, 'commands'));
        
        for (const folder of commandFolders) {
            const commandFiles = await readdir(join(__dirname, 'commands', folder));
            
            for (const file of commandFiles) {
                if (!file.endsWith('.js')) continue;
                
                const filePath = pathToFileURL(join(__dirname, 'commands', folder, file));
                const command = await import(filePath);
                
                if (command.default?.name) {
                    const cmd = command.default;
                    cmd.category = folder;
                    client.commands.set(cmd.name, cmd);
                    console.log(`✅ Comando carregado: ${cmd.name} (${folder})`);
                }
            }
        }
    } catch (error) {
        console.error('❌ Erro ao carregar comandos:', error);
    }
}

// Função para carregar slash commands
async function loadSlashCommands() {
    try {
        const slashFolders = await readdir(join(__dirname, 'slashCommands'));
        
        for (const folder of slashFolders) {
            const slashFiles = await readdir(join(__dirname, 'slashCommands', folder));
            
            for (const file of slashFiles) {
                if (!file.endsWith('.js')) continue;
                
                const filePath = pathToFileURL(join(__dirname, 'slashCommands', folder, file));
                const slashCommand = await import(filePath);
                
                if (slashCommand.default?.data) {
                    const cmd = slashCommand.default;
                    cmd.category = folder;
                    client.slashCommands.set(cmd.data.name, cmd);
                    console.log(`✅ Slash command carregado: ${cmd.data.name} (${folder})`);
                }
            }
        }
    } catch (error) {
        console.error('❌ Erro ao carregar slash commands:', error);
    }
}

// Função para recarregar um comando específico
client.reloadCommand = async function(commandName, type = 'prefix') {
    try {
        const collection = type === 'prefix' ? this.commands : this.slashCommands;
        const command = collection.get(commandName);
        
        if (!command) {
            return { success: false, message: `Comando ${commandName} não encontrado` };
        }
        
        const folder = command.category;
        const basePath = type === 'prefix' ? 'commands' : 'slashCommands';
        const filePath = pathToFileURL(join(__dirname, basePath, folder, `${commandName}.js`));
        
        // Remover do cache do require
        delete require.cache[filePath];
        
        // Recarregar o comando
        const newCommand = await import(`${filePath}?update=${Date.now()}`);
        
        if (newCommand.default) {
            newCommand.default.category = folder;
            collection.set(commandName, newCommand.default);
            return { success: true, message: `Comando ${commandName} recarregado com sucesso` };
        }
        
        return { success: false, message: `Erro ao recarregar comando ${commandName}` };
    } catch (error) {
        console.error(`Erro ao recarregar comando ${commandName}:`, error);
        return { success: false, message: `Erro: ${error.message}` };
    }
};

// Função para obter estatísticas do bot
client.getStats = function() {
    return {
        guilds: this.guilds.cache.size,
        users: this.users.cache.size,
        channels: this.channels.cache.size,
        commands: this.commands.size,
        slashCommands: this.slashCommands.size,
        uptime: this.uptime,
        shardId: this.shard?.ids?.[0] ?? 0,
        ping: this.ws.ping,
        memoryUsage: process.memoryUsage()
    };
};

// Função para log de erros
client.logError = function(error, context = 'Unknown') {
    const errorLog = {
        timestamp: new Date(),
        context,
        error: error.message,
        stack: error.stack
    };
    
    this.errorLogs.push(errorLog);
    
    // Manter apenas os últimos 100 erros
    if (this.errorLogs.length > 100) {
        this.errorLogs.shift();
    }
    
    console.error(`❌ [${context}] ${error.message}`);
};

// Função para tracking de comandos
client.trackCommand = function(commandName, userId) {
    const key = `${commandName}-${userId}`;
    const current = this.commandStats.get(key) || 0;
    this.commandStats.set(key, current + 1);
};

// Função para criar embeds padronizados
client.createEmbed = function(options = {}) {
    const embed = new EmbedBuilder()
        .setColor(options.color || this.config.embedColor)
        .setTimestamp();
    
    if (options.title) embed.setTitle(options.title);
    if (options.description) embed.setDescription(options.description);
    if (options.footer) embed.setFooter({ text: options.footer });
    if (options.author) embed.setAuthor(options.author);
    if (options.thumbnail) embed.setThumbnail(options.thumbnail);
    if (options.image) embed.setImage(options.image);
    if (options.fields) embed.addFields(options.fields);
    
    return embed;
};

// Função para verificar permissões
client.hasPermission = function(member, permission) {
    return member.permissions.has(permission) || this.config.ownerIds.includes(member.id);
};

// Função para verificar se é owner
client.isOwner = function(userId) {
    return this.config.ownerIds.includes(userId);
};

// Inicializar o bot
async function initialize() {
    console.log('🔧 Inicializando Bot Discord.js...');
    
    // Carregar todos os módulos
    await loadEvents();
    await loadCommands();
    await loadSlashCommands();
    
    console.log('📊 Resumo do carregamento:');
    console.log(`   • Eventos: ${client.events.size}`);
    console.log(`   • Comandos Prefix: ${client.commands.size}`);
    console.log(`   • Slash Commands: ${client.slashCommands.size}`);
    
    // Fazer login
    try {
        await client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
        console.error('❌ Erro ao fazer login:', error);
        process.exit(1);
    }
}

// Handler para erros não capturados
client.on('error', (error) => {
    client.logError(error, 'Client Error');
});

client.on('warn', (warning) => {
    console.warn('⚠️ Client Warning:', warning);
});

// Inicializar o bot
initialize();

export default client;