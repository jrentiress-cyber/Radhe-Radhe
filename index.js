const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const express = require('express');
const path = require('path');
const ffmpegPath = require('ffmpeg-static');
const cp = require('child_process');

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

client.once('clientReady', () => {
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
            }
        }
    }
});

client.on('voiceStateUpdate', (oldState, newState) => {
    if (!newState.member || newState.member.user.bot) return;

    const targetChannelId = process.env.CHANNEL_ID;

    if (newState.channelId === targetChannelId) {
        if (oldState.channelId !== targetChannelId) {
            if (globalConnection) {
                try {
                    const player = createAudioPlayer();
                    const audioPath = path.join(__dirname, 'radhe.mp3');
                    
                    // FFmpeg process ke zariye audio stream generate karna Render par 100% fail-proof hai
                    const ffmpegProcess = cp.spawn(ffmpegPath, [
                        '-i', audioPath,
                        '-acodec', 'libopus',
                        '-f', 'opus',
                        '-ar', '48000',
                        '-ac', '2',
                        'pipe:1'
                    ], { stdio: ['pipe', 'pipe', 'ignore'] });

                    const resource = createAudioResource(ffmpegProcess.stdout, {
                        inputType: StreamType.Opus
                    });

                    globalConnection.subscribe(player);
                    player.play(resource);
                    
                    console.log("Member joined, playing Radhe Radhe!");

                    player.on('error', (error) => {
                        console.error('Audio Player Error:', error.message);
                    });

                    ffmpegProcess.on('error', (err) => {
                        console.error('FFmpeg Process Error:', err);
                    });

                } catch (err) {
                    console.error("Error playing audio:", err);
                }
            }
        }
    }
});

client.login(process.env.TOKEN);
