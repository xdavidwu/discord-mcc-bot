const fs = require('fs');
const Discord = require('discord.js');
const { spawn } = require('child_process');
const client = new Discord.Client();
const mcc = spawn('mono', ['MinecraftClient.exe', 'mcc', '-' ,
		fs.readFileSync('ip', 'utf8').trim(), 'BasicIO']);

ready = false;
block = false;

client.on('ready', () => {
	console.log('ready');
	ready = true;
});

mcc.stdout.on('data', (data) => {
	str = data.toString('utf-8').replace(/§./g, '');
	console.log('mcc: ' + str);
	if (str.match('^<.*> msgon\n$')) {
		block = false;
		mcc.stdin.write('bot: msg on\n');
		return;
	}
	if (str.match('^<.*> msgoff\n$')) {
		block = true;
		mcc.stdin.write('bot: msg off\n');
		return;
	}
	if (!ready) {
		console.log('not ready yet');
		return;
	}
	const channel = client.channels.cache.find(ch => ch.name === 'mcc');
	if (!channel) {
		console.log('#mcc not found');
		return;
	}
	if (!block) channel.send(str);
});

client.on('message', message => {
	if (message.content.startsWith('.mcc ')) {
		console.log('receive: ' + message.content);
		mcc.stdin.write(message.content.substring(5) + '\n');
	}
});

client.login(fs.readFileSync('token', 'utf8').trim()).catch(console.err);
