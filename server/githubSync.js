import Bounties from '../imports/collections.js'
const Octokit = require('@octokit/rest')
const octokit = new Octokit({

})
export function listForRepo(){
    //https://octokit.github.io/rest.js/#api-Issues-listForRepo
    octokit.issues.listForRepo({
        repo: 'dapp',
        owner: 'doichain',
        state: 'open',
        labels: 'bounty'
    }).then(({ data, status, headers }) => {
        // handle data
        console.log(data.length+ " GitHub issue synced with local db");
        data.forEach(function (element, index) {
        Bounties.upsert({
            github_id: element.number,
        }, {
            $set: {
                created_at: element.created_at,
                updated_at: element.updated_at,
                title: element.title,
                body: element.body,
                labels: _.map(element.labels, function(this_element){ return _.pick(this_element, 'name', 'color'); }),
                github_state: element.state,
                html_url: element.html_url
            }
        });
        })
    })
}