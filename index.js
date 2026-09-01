const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
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
let isPlaying = false; // Yeh track karega ki gaana chal raha hai ya nahi

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const channelId = process.env.CHANNEL_ID;
    const guildId = process.env.GUILD_ID;

    if (channelId && guildId) {
        const guild = client.guilds.cache.get(guildId);
        if (guild) {
            const channel = guild.channels.cache.get(channelId);
            if (channel) {
                // Bot ko 24/7 fixed channel me bitha do
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

// Jab bhi voice channel me koi halchal ho
client.on('voiceStateUpdate', (oldState, newState) => {
    // 1. Agar member nahi mila ya bot khud update ho raha hai, toh ignore karo
    if (!newState.member || newState.member.user.bot) return;

    const channelId = process.env.CHANNEL_ID;
    const guildId = process.env.GUILD_ID;

    // 2. Check karein ki user usi fixed channel me aaya hai
    if (newState.guild.id === guildId && newState.channelId === channelId) {
        
        // 3. Check karein ki user ne abhi sach me join kiya hai (pehle bahar tha)
        if (!oldState.channelId || oldState.channelId !== channelId) {
            
            // 4. Check karein ki bot connected hai aur gaana NAHI baj raha hai
            if (globalConnection && !isPlaying) {
                try {
                    const player = createAudioPlayer();
                    const resource = createAudioResource('./radhe.mp3');

                    globalConnection.subscribe(player);
                    player.play(resource);
                    isPlaying = true; // Lock laga diya taaki spam na ho
                    
                    console.log("Member joined the fixed channel, playing Radhe Radhe!");

                    // Jaise hi gaana khatam ho, lock khol do taaki agli baar baj sake
                    player.on(AudioPlayerStatus.Idle, () => {
                        isPlaying = false;
                    });

                    // Agar audio play hone me koi error aaye toh lock khol do aur bot crash hone se bachao
                    player.on('error', (error) => {
                        console.error('Audio Player Error:', error.message);
                        isPlaying = false;
                    });

                } catch (err) {
                    isPlaying = false;
                    console.error("Error playing audio:", err);
                }
            }
        }
    }
});

client.login(process.env.TOKEN);
