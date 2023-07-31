const https = require('https');

const defaultApiUrl = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.10813/dados/ultimos/1?formato=json';

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
    'Referer': 'https://www.example.com',
    'Accept-Language': 'en-US,en;q=0.9',
};

function makeHttpRequest(apiUrl = defaultApiUrl) {
    return new Promise((resolve, reject) => {
        https.get(apiUrl, { headers }, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                if (response.statusCode === 200) {
                    const jsonData = JSON.parse(data);
                    const message = data.replace(/\[|\]/g, '');
                    resolve(jsonData);
                } else {
                    reject('Erro ao consultar a API.');
                }
            });
        }).on('error', (error) => {
            reject('Erro na requisição: ' + error.message);
        });
    });
}

module.exports = makeHttpRequest;
