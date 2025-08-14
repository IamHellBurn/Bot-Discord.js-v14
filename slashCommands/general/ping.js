import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Mostra a latência do bot e da API'),
    category: 'general',
    cooldown: 3,
    
    async execute(interaction, client) {
        // Defer reply para dar tempo de calcular
        await interaction.deferReply();
        
        const sent = Date.now();
        const apiPing = Math.round(client.ws.ping);
        const botPing = sent - interaction.createdTimestamp;
        
        // Determinar emoji e cor baseado na latência
        let pingEmoji, pingColor, pingStatus;
        
        if (apiPing < 100) {
            pingEmoji = '🟢';
            pingColor = client.config.successColor;
            pingStatus = 'Excelente';
        } else if (apiPing < 200) {
            pingEmoji = '🟡';
            pingColor = '#ffd700';
            pingStatus = 'Bom';
        } else if (apiPing < 300) {
            pingEmoji = '🟠';
            pingColor = '#ff8c00';
            pingStatus = 'Regular';
        } else {
            pingEmoji = '🔴';
            pingColor = client.config.errorColor;
            pingStatus = 'Ruim';
        }
        
        const embed = client.createEmbed({
            title: '🏓 Pong!',
            description: `**Latências do Bot:**`,
            color: pingColor,
            fields: [
                {
                    name: '📡 API Discord',
                    value: `${pingEmoji} \`${apiPing}ms\``,
                    inline: true
                },
                {
                    name: '🤖 Bot',
                    value: `${pingEmoji} \`${botPing}ms\``,
                    inline: true
                },
                {
                    name: '📊 Status',
                    value: `\`${pingStatus}\``,
                    inline: true
                }
            ],
            footer: `Shard ${client.shard?.ids?.[0] ?? 0} | Uptime: ${formatUptime(