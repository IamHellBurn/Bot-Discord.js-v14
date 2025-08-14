export default {
    name: 'messageCreate',
    
    async execute(message, client) {
        // Ignorar mensagens de bots e DMs (opcional)
        if (message.author.bot) return;
        
        // Verificar se a mensagem começa com o prefix
        if (!message.content.startsWith(client.config.prefix)) return;
        
        // Extrair comando e argumentos
        const args = message.content.slice(client.config.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        // Buscar comando
        const command = client.commands.get(commandName) || 
                       client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        
        if (!command) return;
        
        try {
            // Log do comando
            console.log(`📋 Comando executado: ${commandName} | Usuário: ${message.author.tag} | Servidor: ${message.guild?.name || 'DM'}`);
            
            // Verificar cooldown
            if (command.cooldown) {
                const cooldowns = client.cooldowns || (client.cooldowns = new Map());
                const now = Date.now();
                const timestamps = cooldowns.get(command.name) || cooldowns.set(command.name, new Map()).get(command.name);
                const cooldownAmount = (command.cooldown || 3) * 1000;
                
                if (timestamps.has(message.author.id)) {
                    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
                    
                    if (now < expirationTime) {
                        const timeLeft = (expirationTime - now) / 1000;
                        const embed = client.createEmbed({
                            title: '⏰ Cooldown',
                            description: `Você precisa esperar ${timeLeft.toFixed(1)} segundos antes de usar este comando novamente.`,
                            color: client.config.errorColor
                        });
                        
                        const reply = await message.reply({ embeds: [embed] });
                        setTimeout(() => reply.delete().catch(() => {}), 5000);
                        return;
                    }
                }
                
                timestamps.set(message.author.id, now);
                setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
            }
            
            // Verificar se o comando é apenas para DM
            if (command.dmOnly && message.guild) {
                const embed = client.createEmbed({
                    title: '📧 Comando apenas por DM',
                    description: 'Este comando só pode ser usado em mensagem direta.',
                    color: client.config.errorColor
                });
                return message.reply({ embeds: [embed] });
            }
            
            // Verificar se o comando é apenas para servidores
            if (command.guildOnly && !message.guild) {
                const embed = client.createEmbed({
                    title: '🏰 Comando apenas em servidores',
                    description: 'Este comando só pode ser usado em servidores.',
                    color: client.config.errorColor
                });
                return message.reply({ embeds: [embed] });
            }
            
            // Verificar permissões do usuário
            if (command.permissions && message.guild) {
                if (!client.hasPermission(message.member, command.permissions)) {
                    const embed = client.createEmbed({
                        title: '🚫 Sem permissão',
                        description: `Você precisa da permissão \`${command.permissions}\` para usar este comando.`,
                        color: client.config.errorColor
                    });
                    return message.reply({ embeds: [embed] });
                }
            }
            
            // Verificar permissões do bot
            if (command.botPermissions && message.guild) {
                const botMember = message.guild.members.cache.get(client.user.id);
                if (!botMember.permissions.has(command.botPermissions)) {
                    const embed = client.createEmbed({
                        title: '🤖 Bot sem permissão',
                        description: `Eu preciso da permissão \`${command.botPermissions}\` para executar este comando.`,
                        color: client.config.errorColor
                    });
                    return message.reply({ embeds: [embed] });
                }
            }
            
            // Verificar se é comando apenas para owners
            if (command.ownerOnly && !client.isOwner(message.author.id)) {
                const embed = client.createEmbed({
                    title: '👑 Comando restrito',
                    description: 'Este comando é apenas para desenvolvedores do bot.',
                    color: client.config.errorColor
                });
                return message.reply({ embeds: [embed] });
            }
            
            // Verificar argumentos obrigatórios
            if (command.args && !args.length) {
                let reply = `❌ Você não forneceu argumentos suficientes!`;
                
                if (command.usage) {
                    reply += `\n**Uso:** \`${client.config.prefix}${command.name} ${command.usage}\``;
                }
                
                const embed = client.createEmbed({
                    title: '📝 Argumentos obrigatórios',
                    description: reply,
                    color: client.config.errorColor
                });
                
                return message.reply({ embeds: [embed] });
            }
            
            // Executar comando
            await command.execute(message, args, client);
            
            // Tracking de uso
            client.trackCommand(command.name, message.author.id);
            
        } catch (error) {
            console.error(`❌ Erro ao executar comando ${commandName}:`, error);
            client.logError(error, `Command: ${commandName}`);
            
            const embed = client.createEmbed({
                title: '❌ Erro interno',
                description: 'Houve um erro ao executar este comando. Os desenvolvedores foram notificados.',
                color: client.config.errorColor,
                footer: `Comando: ${commandName} | Erro ID: ${Date.now()}`
            });
            
            try {
                await message.reply({ embeds: [embed] });
            } catch (replyError) {
                console.error('❌ Erro ao enviar mensagem de erro:', replyError);
            }
        }
    }
};