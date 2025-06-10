const {
  Client,
  GatewayIntentBits,
  Partials,
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

const categoryIDs = {
  boxcaby: '1297546178568654898',
  boxasaka: '1381247547783516291',
  ecosmp: '1381830897396879522'
};

client.once('ready', () => {
  console.log(`🤖 Bot online: ${client.user.tag}`);
});

client.on('messageCreate', async message => {
  if (message.content === '!ticket') {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('select-cluster')
      .setPlaceholder('🌐 Chọn cụm bạn cần hỗ trợ')
      .addOptions([
        { label: 'Box Caby', value: 'boxcaby', emoji: '💥' },
        { label: 'Box Asaka', value: 'boxasaka', emoji: '🌀' },
        { label: 'EcoSMP', value: 'ecosmp', emoji: '🌱' }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await message.channel.send({
      content: '🎟️ Vui lòng chọn cụm bạn cần hỗ trợ:',
      components: [row]
    });
  }
});

client.on('interactionCreate', async interaction => {
  if (interaction.isStringSelectMenu() && interaction.customId === 'select-cluster') {
    const selected = interaction.values[0];

    const modal = new ModalBuilder()
      .setCustomId(`modal-${selected}`)
      .setTitle('🎮 Thông tin hỗ trợ');

    const gameNameInput = new TextInputBuilder()
      .setCustomId('game-name')
      .setLabel('Tên game của bạn là gì?')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const reasonInput = new TextInputBuilder()
      .setCustomId('reason')
      .setLabel('Lý do cần hỗ trợ')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(gameNameInput),
      new ActionRowBuilder().addComponents(reasonInput)
    );

    await interaction.showModal(modal);
  }

  if (interaction.isModalSubmit()) {
    const cluster = interaction.customId.split('-')[1];
    const categoryId = categoryIDs[cluster];
    const gameName = interaction.fields.getTextInputValue('game-name');
    const reason = interaction.fields.getTextInputValue('reason');
    const username = interaction.user.username.toLowerCase().replace(/\s/g, '-');

    const channel = await interaction.guild.channels.create({
      name: `ticket-${username}`,
      type: ChannelType.GuildText,
      parent: categoryId,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        }
      ]
    });

    // Thêm nút đóng ticket
    const closeButton = new ButtonBuilder()
      .setCustomId('close-ticket')
      .setLabel('🔒 Đóng ticket')
      .setStyle(ButtonStyle.Danger);

    const buttonRow = new ActionRowBuilder().addComponents(closeButton);

    await channel.send({
      content: `👋 Xin chào <@${interaction.user.id}>, bạn cần hỗ trợ gì ạ?\n📌 **Tên game:** ${gameName}\n📌 **Lý do:** ${reason}`,
      components: [buttonRow]
    });

    await interaction.reply({ content: `✅ Đã tạo ticket: ${channel}`, ephemeral: true });
  }

  // Xử lý nút đóng ticket
  if (interaction.isButton() && interaction.customId === 'close-ticket') {
    await interaction.reply({ content: '🔒 Ticket sẽ bị đóng trong 5 giây...', ephemeral: true });
    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 5000);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN=MTM4MTg3MTIwOTE3NTg0Njk3NA.GJ47_b.z4fYiXV36grCD-R8u3vcB_rH6FXl9Afohdabw4);
