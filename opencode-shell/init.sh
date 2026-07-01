#!/bin/bash
git checkout develop
git pull
git branch IA/auto
git checkout IA/auto
git pull
git merge develop
echo "hello word"
