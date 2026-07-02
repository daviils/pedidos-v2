#!/bin/bash
./opencode-shell/init.sh

echo "execultado prompt..."

opencode run "busque por vunerabilidades em app/api e coloque essa lista em memory/run-security.md na raiz do projeto"
opencode run --continue "ler memory/run-security.md escolher o mais facil de implementar e tentar resolver"

echo "execultado"

./opencode-shell/finish.sh

