const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Bot is Alive 24/7!'));
app.listen(3000, () => console.log('Server is running on port 3000!'));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

let globalConnection = null;

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const channelId = process.env.CHANNEL_ID;
    const guildId = process.env.GUILD_ID;

    if (channelId && guildId) {
        const guild = client.guilds.cache.get(guildId);
        if (guild) {
            const channel = guild.channels.cache.get(channelId);
            if (channel) {
                globalConnection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: guild.id,
                    adapterCreator: guild.voiceAdapterCreator,
                    selfDeaf: false,
                    selfMute: false,
                });
                console.log("Bot successfully connected to the fixed voice channel and staying stable!");
            } else {
                console.log("Could not find the Voice Channel ID!");
            }
        } else {
            console.log("Could not find the Guild ID!");
        }
    }
});

client.on('voiceStateUpdate', (oldState, newState) => {
    const channelId = process.env.CHANNEL_ID;
    const guildId = process.env.GUILD_ID;

    if (newState.guild.id === guildId && newState.channelId === channelId) {
        if (!oldState.channelId || oldState.channelId !== channelId) {
            if (globalConnection) {
                try {
                    const player = createAudioPlayer();
                    const resource = createAudioResource('./radhe.mp3');

                    globalConnection.subscribe(player);
                    player.play(resource);
                    console.log("Member joined the fixed channel, playing Radhe Radhe!");
                } catch (err) {
                    console.error("Error playing audio:", err);
                }
            }
        }
    }
});

client.login(process.env.TOKEN);
