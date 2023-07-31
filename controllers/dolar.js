const https = require('https');
const fs = require('fs');
const path = require('path');

const defaultApiUrl = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.10813/dados/ultimos/1?formato=json';

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
    'Referer': 'https://www.example.com',
    'Accept-Language': 'en-US,en;q=0.9',
};

const cacheFilePath = path.join('./cache.json');

// Function to check if the cached response is still valid
function isCacheValid(cacheTimestamp) {
    const now = Date.now();
    const maxCacheAge = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
    return now - cacheTimestamp < maxCacheAge;
}

function makeHttpRequest(apiUrl = defaultApiUrl) {
    return new Promise((resolve, reject) => {
        // Check if the response is already cached and valid
        if (fs.existsSync(cacheFilePath)) {
            const cacheContent = fs.readFileSync(cacheFilePath, 'utf8');
            const cache = JSON.parse(cacheContent);

            if (cache[apiUrl] && isCacheValid(cache[apiUrl].timestamp)) {
                resolve(cache[apiUrl].data);
                return;
            }
        }

        https.get(apiUrl, { headers }, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                if (response.statusCode === 200) {
                    const jsonData = JSON.parse(data);
                    const message = data.replace(/\[|\]/g, '');

                    // Update the cache with the new response data and timestamp
                    const cache = fs.existsSync(cacheFilePath)
                        ? JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'))
                        : {};

                    cache[apiUrl] = {
                        data: jsonData,
                        timestamp: Date.now(),
                    };

                    fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2), 'utf8');

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

module.exports = makeHttpRequest;
