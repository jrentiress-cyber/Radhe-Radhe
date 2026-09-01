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

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (guild) {
        const channel = guild.channels.cache.get(process.env.CHANNEL_ID);
        if (channel) {
            joinVoiceChannel({
                channelId: channel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false
            });
            console.log("Successfully joined the target Voice Channel!");
        }
    }
});

client.on('voiceStateUpdate', (oldState, newState) => {
    try {
        if (newState.channelId && newState.member && !newState.member.user.bot) {
            if (oldState.channelId !== newState.channelId) {
                const connection = joinVoiceChannel({
                    channelId: newState.channelId,
                    guildId: newState.guild.id,
                    adapterCreator: newState.guild.voiceAdapterCreator,
                    selfDeaf: false,
                    selfMute: false
                });

                const player = createAudioPlayer();
                const resource = createAudioResource('./radhe.mp3');

                connection.subscribe(player);
                player.play(resource);
            }
        }
    } catch (error) {
        console.error("Error playing audio:", error);
    }
});

client.login(process.env.TOKEN);
