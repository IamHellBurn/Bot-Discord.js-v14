export default {
    name: 'ping',
    description: 'Mostra a latência do bot e da API',
    category: 'general',
    aliases: ['latencia', 'ms'],
    cooldown: 3,
    
    async execute(message, args, client) {
        const sent = await message.reply('🏓 Calculando ping...');
        
        const timeTaken = sent.createdTimestamp - message.createdTimestamp;
        const apiPing = Math.round(client.ws.ping);
        
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
                    value: `${pingEmoji} \`${timeTaken}ms\``,
                    inline: true
                },
                {
                    name: '📊 Status',
                    value: `\`${pingStatus}\``,
                    inline: true
                }
            ],
            footer: `Shard ${client.shard?.ids?.[0] ?? 0} | Uptime: ${formatUptime(client.uptime)}`
        });
        
        await sent.edit({ content: null, embeds: [embed] });
    }
};

function formatUptime(ms) {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
}