module.exports = {
  apps: [
    {
      name: 'my-app', // Nome da aplicação
      script: 'npm', // Comando que será executado
      args: 'vadia', // Argumentos do comando (npm start)
      autorestart: true, // Reiniciar automaticamente em caso de falha
      watch: false, // Monitorar alterações nos arquivos (true/false)
      max_memory_restart: '1G', // Limite máximo de memória para reiniciar o processo
    },
  ],
};
