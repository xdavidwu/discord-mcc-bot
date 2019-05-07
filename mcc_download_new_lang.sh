#!/bin/sh

if [ ! -n "$1" ];then
	echo "Usage: $0 LANG"
	echo "LANG is Minecraft lang in lowercase (like en_gb)"
	exit 1
fi

LANG_SUF=$(echo $1 | cut -d '_' -f 2 | tr -s '[:lower:]' '[:upper:]')

#wget https://s3.amazonaws.com/Minecraft.Download/indexes/1.13.json
wget https://launchermeta.mojang.com/v1/packages/280eebe96a3ca45fcbc85800552cea775bc5f73c/1.14.json

HASH=$(cat 1.14.json | tr '{' '\n' | grep minecraft -C 1 | grep "$1" -C 1 | tail -n 1 | cut -d '"' -f 4)

wget http://resources.download.minecraft.net/$(echo $HASH | head -c 2)/$HASH

cat $HASH | tail -n +2 | head -n -1 | cut -d '"' -f 2-4 | sed 's/": "/=/' > lang/$(echo $1 | cut -d '_' -f 1)_$LANG_SUF.lang
