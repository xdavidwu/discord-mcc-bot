const fs = require('fs');
const Discord = require('discord.js');
const { spawn } = require('child_process');
const client = new Discord.Client();
const mcc = spawn('mono', ['MinecraftClient.exe', 'mcc', '-' ,
		fs.readFileSync('ip', 'utf8').trim(), 'BasicIO']);

var ready = false;
var block = false;
var filters = [];

client.on('ready', () => {
	console.log('ready');
	ready = true;
});

mcc.stdout.on('data', (data) => {
	str = data.toString('utf-8').replace(/§./g, '');
	console.log('mcc: ' + str);
	if (str.match(/^<.*> msgon\n$/)) {
		block = false;
		mcc.stdin.write('bot: msg on\n');
		return;
	}
	if (str.match(/^<.*> msgoff\n$/)) {
		block = true;
		mcc.stdin.write('bot: msg off\n');
		return;
	}
	if (str.match(/^<.*> logfilters /)) {
		let subcmd = str.replace(/^<.*> logfilters /,'').trimEnd();
		console.log('logfilters ' + subcmd);
		if (subcmd.match(/^list$/)) {
			let found = false;
			for (i in filters) {
				found = true;
				mcc.stdin.write(i + ': ' + filters[i] + '\n');
			}
			if (!found) {
				mcc.stdin.write('No filter regexes.\n');
			}
		} else if (subcmd.match(/^remove \d+$/)) {
			let idx = parseInt(subcmd.match(/^remove (\d+)$/)[1], 10);
			if (idx < filters.length) {
				filters.splice(idx, 1);
			} else {
				mcc.stdin.write('No such index.\n');
			}
		} else if (subcmd.match(/^add .*$/)){
			let exp = subcmd.match(/^add (.*)$/)[1];
			console.log('add ' + exp);
			try {
				new RegExp(exp);
			} catch(e) {
				mcc.stdin.write('Invalid regex.\n');
				return;
			}
			filters.push(exp);
		} else {
			mcc.stdin.write('Unrecognised subcommand\n');
		}
	}
	if (str.startsWith('mcc joined the game')) {
		mcc.stdin.write('/gamemode spectator\n');
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
	if (!block) {
		let matched = false;
		for (i in filters) {
			if (str.match(filters[i])) {
				matched = true;
				break;
			}
		}
		if (!matched) {
			channel.send(str);
		}
	}
});

client.on('message', message => {
	if (message.content.startsWith('.mcc /')) {
		if (message.content === '.mcc /list') {
			// use server /list. MCC /list is confusing and cannot indicate server status
			console.log('receive /list, override to server /list');
			mcc.stdin.write("/send /list\n");
		} else {
			console.log('receive: ' + message.content);
			mcc.stdin.write(message.content.substring(5) + '\n');
		}
	} else if (message.content.startsWith('.mcc ')) {
		console.log('receive chat: ' + message.content);
		mcc.stdin.write(`@${message.author.username}: ${message.content.substring(5)}\n`);
	}
});

mcc.on('exit', (code, signal) => {
	console.log('mcc exited with code: ' + code + ' signal:' + signal);
	process.exit(code);
});

client.login(fs.readFileSync('token', 'utf8').trim()).catch(console.err);
