const Discord=require('discord.js');
const { spawn } = require('child_process');
const client=new Discord.Client();
const mcc=spawn('mono',['../MinecraftClient.exe','test','-','<IP>','BasicIO']);

ready=false;

client.on('ready',()=>{
	console.log('ready');
	ready=true;
});

mcc.stdout.on('data', (data) => {
	str=data.toString('utf-8').replace(/§./g,'');
	console.log('mcc: '+str);
	if(!ready){
		console.log('not ready yet');
		return;
	}
	const channel=client.channels.find(ch=>ch.name==='mcc');
	if(!channel){
		console.log('#mcc not found');
		return;
	}
	channel.send(str);
});

client.on('message', message => {
	if (message.content.startsWith('.mcc ')) {
		console.log('receive: '+message.content);
		mcc.stdin.write(message.content.substring(5)+'\n');
	}
});

client.login('<TOKEN>');
