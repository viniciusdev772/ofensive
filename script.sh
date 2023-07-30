#!/bin/bash

# Caminho para o diretório do repositório local
repo_dir="/home/viniciusdev/htdocs/viniciusdev.online/chat/"

# Acessa o diretório do repositório
cd "$repo_dir" || exit

# Faz o pull das atualizações do repositório remoto
git pull

# Caso você queira ver uma mensagem indicando que as atualizações foram baixadas com sucesso
echo "Atualizações baixadas com sucesso!"

echo "verificando atualização de apis"

repo_dir="/home/viniciusdev/htdocs/viniciusdev.online/api/"

cd "$repo_dir" || exit

# Faz o pull das atualizações do repositório remoto
git pull

echo "atualizados"
