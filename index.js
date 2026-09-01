const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Bot is Alive 24/7!'));
app.listen(3000, () => console.log('Server is running!'));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Auto Join Voice Channel
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (guild) {
        joinVoiceChannel({
            channelId: process.env.CHANNEL_ID,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
        });
        console.log("Joined VC successfully!");
    }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    // Check: Agar user (bot nahi) VC me aaya hai
    if (newState.channelId && !newState.member.user.bot) {
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
});

client.login(process.env.TOKEN);
