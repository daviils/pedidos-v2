#!/bin/bash
git add .
opencode run "validar lint e testar se as alterações feitas"
opencode run --continue "criar commit resumido do que foi feito"
echo "commite criado"
git push
