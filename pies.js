const axios = require('axios');
const { write } = require('fs');
const XLSX = require('xlsx');
//kot
async function getGitHubPushes(username, repository) {
    try {
        const response = await axios.get(`https://api.github.com/repos/${username}/${repository}/events`);
        return response.data.filter(event => event.type === 'PushEvent');
    } catch (error) {
        throw new Error(`Błąd pobierania danych z API GitHuba: ${error.message}`);
    }
}

function writeToXLSX(data) {
    const workbook = XLSX.utils.book_new();
    const worksheetData = Array.isArray(data) ? data : [data]; 
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pushes');
    XLSX.writeFile(workbook, 'github_pushes.xlsx');
}

function countRepositoryStats(pushes) {
    let whoPushed;
    let pullRequestsCount = 0;
    let reviewCommentsCount = 0;
    let masterCommitsCount = 0;
    let changedFilesCount = 0;

    for (let i = 0; i < pushes.length; i++) {
        const push = pushes[i];
        whoPushed = push.actor.login
        if (push.type === 'PushEvent' && push.payload && push.payload.ref === 'refs/heads/main') {
            masterCommitsCount++;
            if (push.payload && push.payload.commits) {
                for (let j = 0; j < push.payload.commits.length; j++) {
                    const commit = push.payload.commits[j];
                    changedFilesCount += (commit.additions || 0) + (commit.deletions || 0);
                }
            }
        } else if (push.type === 'PullRequestEvent') {
            pullRequestsCount++;
        } else if (push.type === 'PullRequestReviewCommentEvent') {
            reviewCommentsCount++;
        }
    }

    return {
        who: whoPushed,
        pullRequests: pullRequestsCount,
        reviewComments: reviewCommentsCount,
        masterCommits: masterCommitsCount,
        changedFiles: changedFilesCount
    };
}

const githubUsername = 'kubabed772';
const githubRepository = 'test';
const githubToken = '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'; 

getGitHubPushes(githubUsername, githubRepository, githubToken)
    .then(pushes => {
        const stats = countRepositoryStats(pushes);
        console.log('Statystyki repozytorium:');
        console.log('Kto zpushował: ', stats.who);
        console.log('Liczba PRów:', stats.pullRequests);
        console.log('Liczba komentarzy od reviewera:', stats.reviewComments);
        console.log('Liczba commitów do mastera:', stats.masterCommits);
        console.log('Liczba zmienionych plików:', stats.changedFiles);
        writeToXLSX(stats)
    })
    .catch(error => {
        console.error(error.message);
    });
