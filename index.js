import { ShardingManager } from 'discord.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configurar variáveis de ambiente
config();

// Obter diretório atual para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurar o Sharding Manager
const manager = new ShardingManager(join(__dirname, 'bot.js'), {
    token: process.env.DISCORD_TOKEN,
    totalShards: 'auto', // Discord.js calculará automaticamente
    shardList: 'auto',
    mode: 'process',
    respawn: true,
});

// Event listeners para o Sharding Manager
manager.on('shardCreate', (shard) => {
    console.log(`🚀 Shard ${shard.id} iniciada!`);
    
    // Listener para quando a shard estiver pronta
    shard.on('ready', () => {
        console.log(`✅ Shard ${shard.id} está pronta!`);
    });

    // Listener para desconexão da shard
    shard.on('disconnect', () => {
        console.log(`🔌 Shard ${shard.id} desconectada!`);
    });

    // Listener para reconexão da shard
    shard.on('reconnecting', () => {
        console.log(`🔄 Shard ${shard.id} reconectando...`);
    });

    // Listener para erros na shard
    shard.on('error', (error) => {
        console.error(`❌ Erro na Shard ${shard.id}:`, error);
    });

    // Listener para quando a shard morre
    shard.on('death', () => {
        console.log(`💀 Shard ${shard.id} morreu!`);
    });

    // Listener para spawn da shard
    shard.on('spawn', () => {
        console.log(`🐣 Shard ${shard.id} spawnou!`);
    });
});

// Função para obter estatísticas de todas as shards
async function getStats() {
    try {
        const promises = [
            manager.fetchClientValues('guilds.cache.size'),
            manager.fetchClientValues('channels.cache.size'),
            manager.fetchClientValues('users.cache.size'),
        ];

        const results = await Promise.all(promises);
        
        const guilds = results[0].reduce((prev, val) => prev + val, 0);
        const channels = results[1].reduce((prev, val) => prev + val, 0);
        const users = results[2].reduce((prev, val) => prev + val, 0);

        return { guilds, channels, users };
    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        return null;
    }
}

// Função para recarregar todas as shards
async function reloadAllShards() {
    try {
        console.log('🔄 Recarregando todas as shards...');
        await manager.respawnAll();
        console.log('✅ Todas as shards foram recarregadas!');
    } catch (error) {
        console.error('❌ Erro ao recarregar shards:', error);
    }
}

// Processo de inicialização
async function startBot() {
    try {
        console.log('🤖 Iniciando Bot Discord.js...');
        console.log('📊 Configurações:');
        console.log(`   • Token: ${process.env.DISCORD_TOKEN ? '✅ Definido' : '❌ Não definido'}`);
        console.log(`   • Prefix: ${process.env.PREFIX || '!'}`);
        console.log(`   • Ambiente: ${process.env.NODE_ENV || 'production'}`);
        console.log('');

        if (!process.env.DISCORD_TOKEN) {
            throw new Error('TOKEN do bot não foi definido no arquivo .env');
        }

        await manager.spawn();
        console.log('🎉 Bot iniciado com sucesso!');

        // Mostrar estatísticas após 5 segundos
        setTimeout(async () => {
            const stats = await getStats();
            if (stats) {
                console.log('📈 Estatísticas do Bot:');
                console.log(`   • Servidores: ${stats.guilds}`);
                console.log(`   • Canais: ${stats.channels}`);
                console.log(`   • Usuários: ${stats.users}`);
                console.log(`   • Shards: ${manager.totalShards}`);
            }
        }, 5000);

    } catch (error) {
        console.error('❌ Erro ao iniciar o bot:', error);
        process.exit(1);
    }
}

// Handlers para sinais do processo
process.on('SIGINT', () => {
    console.log('🛑 Recebido SIGINT, desligando bot...');
    manager.shards.forEach(shard => shard.kill());
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Recebido SIGTERM, desligando bot...');
    manager.shards.forEach(shard => shard.kill());
    process.exit(0);
});

// Handlers para erros não capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Exportar funções úteis para uso em outros módulos
export { manager, getStats, reloadAllShards };

// Iniciar o bot
startBot();