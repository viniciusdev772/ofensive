const https = require('https');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const defaultApiUrl = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.10813/dados/ultimos/1?formato=json';

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
    'Referer': 'https://www.example.com',
    'Accept-Language': 'en-US,en;q=0.9',
};

const cacheFilePath = path.join(__dirname, 'cache.json');

function makeHttpRequest(apiUrl = defaultApiUrl) {
    if (fs.existsSync(cacheFilePath)) {
        const cacheContent = fs.readFileSync(cacheFilePath, 'utf8');
        const cache = JSON.parse(cacheContent);

        if (cache[apiUrl]) {
            return Promise.resolve(cache[apiUrl]);
        }
    }

    return new Promise((resolve, reject) => {
        https.get(apiUrl, { headers }, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                if (response.statusCode === 200) {
                    const jsonData = JSON.parse(data);

                    // Save the new data from the API as the cache
                    const cache = {
                        [apiUrl]: jsonData,
                    };

                    fs.writeFileSync(cacheFilePath, JSON.stringify(cache), 'utf8');

                    resolve(jsonData);
                } else {
                    reject('Error querying the API.');
                }
            });
        }).on('error', (error) => {
            reject('Request error: ' + error.message);
        });
    });
}

// Schedule the cron job to run once a day at 00:00 (midnight)
cron.schedule('* * * * *', () => {
    console.log('Running cron job...');
    makeHttpRequest().catch((error) => {
        console.error('Error in cron job:', error);
    });
});

module.exports = makeHttpRequest;
