import { ActivityType } from 'discord.js';

export default {
    name: 'ready',
    once: true,
    
    async execute(client) {
        console.log('🎉 Bot está online!');
        console.log(`📝 Logado como: ${client.user.tag}`);
        console.log(`🆔 ID: ${client.user.id}`);
        console.log(`🌐 Servidores: ${client.guilds.cache.size}`);
        console.log(`👥 Usuários: ${client.users.cache.size}`);
        console.log(`💾 Shard ID: ${client.shard?.ids?.[0] ?? 'N/A'}`);
        console.log('');
        
        // Definir status do bot
        const activities = [
            { name: `${client.config.prefix}help | ${client.guilds.cache.size} servidores`, type: ActivityType.Playing },
            { name: 'Discord.js v14', type: ActivityType.Playing },
            { name: 'comandos sendo executados', type: ActivityType.Watching },
            { name: `${client.users.cache.size} usuários`, type: ActivityType.Watching }
        ];
        
        let currentActivity = 0;
        
        // Função para atualizar o status
        const updateStatus = () => {
            const activity = activities[currentActivity];
            client.user.setActivity(activity.name, { type: activity.type });
            currentActivity = (currentActivity + 1) % activities.length;
        };
        
        // Definir status inicial
        updateStatus();
        
        // Atualizar status a cada 30 segundos
        setInterval(updateStatus, 30000);
        
        // Log de inicialização completa
        console.log('✅ Bot inicializado com sucesso!');
        console.log(`⚡ Latência: ${client.ws.ping}ms`);
        console.log(`🕐 Online desde: ${new Date().toLocaleString('pt-BR')}`);
        
        // Registrar slash commands se estiver em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
            try {
                console.log('🔄 Registrando slash commands...');
                
                const commands = Array.from(client.slashCommands.values()).map(cmd => cmd.data.toJSON());
                
                if (process.env.GUILD_ID) {
                    // Registrar apenas no servidor de teste
                    const guild = client.guilds.cache.get(process.env.GUILD_ID);
                    if (guild) {
                        await guild.commands.set(commands);
                        console.log(`✅ ${commands.length} slash commands registrados no servidor de teste`);
                    }
                } else {
                    // Registrar globalmente
                    await client.application.commands.set(commands);
                    console.log(`✅ ${commands.length} slash commands registrados globalmente`);
                }
            } catch (error) {
                console.error('❌ Erro ao registrar slash commands:', error);
                client.logError(error, 'Slash Commands Registration');
            }
        }
        
        // Estatísticas detalhadas
        const stats = client.getStats();
        console.log('📊 Estatísticas detalhadas:');
        console.log(`   • RAM: ${Math.round(stats.memoryUsage.used / 1024 / 1024)} MB`);
        console.log(`   • Comandos Prefix: ${stats.commands}`);
        console.log(`   • Slash Commands: ${stats.slashCommands}`);
        console.log(`   • Canais: ${stats.channels}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
};