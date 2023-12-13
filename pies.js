const axios = require('axios');
const XLSX = require('xlsx');

// Funkcja pobierająca informacje o pushach z GitHub API
async function getGitHubPushes(username, repository) {
    try {
        const response = await axios.get(`https://api.github.com/repos/${username}/${repository}/events`);
        return response.data.filter(event => event.type === 'PushEvent');
    } catch (error) {
        throw new Error(`Błąd pobierania danych z API GitHuba: ${error.message}`);
    }
}

// Funkcja zapisująca informacje do pliku XLSX
function writeToXLSX(data) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pushes');
    XLSX.writeFile(workbook, 'github_pushes.xlsx');
}

// Użycie funkcji do pobrania informacji o pushach i zapisania ich do pliku XLSX
const githubUsername = 'kubabed772';
const githubRepository = 'test';

getGitHubPushes(githubUsername, githubRepository)
    .then(pushes => {
        // Przetwarzanie informacji o pushach, jeśli to konieczne
        console.log('Pobrano informacje o pushach:', pushes);
        writeToXLSX(pushes);
        console.log('Informacje zapisano do pliku github_pushes.xlsx');
    })
    .catch(error => {
        console.error(error.message);
    });
