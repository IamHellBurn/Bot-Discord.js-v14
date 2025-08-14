export default {
    name: 'guildCreate',
    
    async execute(guild, client) {
        console.log(`🎉 Novo servidor! ${guild.name} (${guild.id}) - ${guild.memberCount} membros`);
        
        // Tentar encontrar um canal para enviar mensagem de boas-vindas
        const welcomeChannel = guild.channels.cache.find(channel => 
            channel.name.includes('geral') || 
            channel.name.includes('general') || 
            channel.name.includes('chat') ||
            channel.name.includes('welcome') ||
            channel.name.includes('bem-vindo')
        ) || guild.systemChannel || guild.channels.cache.filter(c => c.type === 0).first();
        
        if (welcomeChannel && welcomeChannel.permissionsFor(guild.members.me).has(['ViewChannel', 'SendMessages'])) {
            try {
                const embed = client.createEmbed({
                    title: '👋 Olá! Obrigado por me adicionar!',
                    description: `Sou um bot Discord.js completo com muitas funcionalidades!\n\n` +
                                `**🔧 Configuração Inicial:**\n` +
                                `• Prefix atual: \`${client.config.prefix}\`\n` +
                                `• Use \`${client.config.prefix}help\` para ver todos os comandos\n` +
                                `• Use \`/help\` para ver os slash commands\n\n` +
                                `**📋 Principais funcionalidades:**\n` +
                                `• Sistema de moderação completo\n` +
                                `• Comandos de utilidade\n` +
                                `• Sistema de warnings\n` +
                                `• Estatísticas detalhadas\n` +
                                `• Suporte a comandos prefix e slash\n\n` +
                                `**🛡️ Permissões recomendadas:**\n` +
                                `Para o melhor funcionamento, me dê as seguintes permissões:\n` +
                                `• Gerenciar mensagens\n` +
                                `• Banir membros\n` +
                                `• Expulsar membros\n` +
                                `• Ver histórico de mensagens\n` +
                                `• Usar comandos de barra`,
                    color: client.config.successColor,
                    thumbnail: client.user.displayAvatarURL(),
                    footer: `Bot adicionado em ${guild.memberCount} membros`
                });
                
                await welcomeChannel.send({ embeds: [embed] });
                console.log(`✅ Mensagem de boas-vindas enviada no servidor ${guild.name}`);
                
            } catch (error) {
                console.error(`❌ Erro ao enviar mensagem de boas-vindas no servidor ${guild.name}:`, error);
                client.logError(error, `Guild Welcome: ${guild.name}`);
            }
        }
        
        // Tentar registrar slash commands no servidor (se configurado)
        if (process.env.AUTO_REGISTER_SLASH === 'true') {
            try {
                const commands = Array.from(client.slashCommands.values()).map(cmd => cmd.data.toJSON());
                await guild.commands.set(commands);
                console.log(`✅ Slash commands registrados no servidor ${guild.name}`);
            } catch (error) {
                console.error(`❌ Erro ao registrar slash commands no servidor ${guild.name}:`, error);
            }
        }
        
        // Log detalhado do servidor
        console.log('📊 Informações do servidor:');
        console.log(`   • Nome: ${guild.name}`);
        console.log(`   • ID: ${guild.id}`);
        console.log(`   • Membros: ${guild.memberCount}`);
        console.log(`   • Criado em: ${guild.createdAt.toLocaleDateString('pt-BR')}`);
        console.log(`   • Owner: ${guild.ownerId}`);
        console.log(`   • Nível de verificação: ${guild.verificationLevel}`);
        console.log(`   • Canais: ${guild.channels.cache.size}`);
        console.log(`   • Cargos: ${guild.roles.cache.size}`);
        console.log(`   • Boost level: ${guild.premiumTier}`);
        console.log(`   • Total de servidores: ${client.guilds.cache.size}`);
        
        // Notificar owners sobre novo servidor (se configurado)
        if (client.config.ownerIds.length > 0 && guild.memberCount > 100) {
            for (const ownerId of client.config.ownerIds) {
                try {
                    const owner = await client.users.fetch(ownerId);
                    
                    const embed = client.createEmbed({
                        title: '🎉 Novo servidor adicionado!',
                        description: `**${guild.name}**\n` +
                                    `ID: \`${guild.id}\`\n` +
                                    `Membros: \`${guild.memberCount}\`\n` +
                                    `Owner: <@${guild.ownerId}>\n` +
                                    `Total de servidores: \`${client.guilds.cache.size}\``,
                        color: client.config.successColor,
                        thumbnail: guild.iconURL() || client.user.displayAvatarURL(),
                        timestamp: true
                    });
                    
                    await owner.send({ embeds: [embed] });
                } catch (error) {
                    console.error(`❌ Erro ao notificar owner ${ownerId}:`, error);
                }
            }
        }
    }
};