import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
    try {
        await fixPrBase()
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message)
    }
}

const parsePullRequestId = (githubRef:string) => {
    const result = /refs\/pull\/(\d+)\/merge/g.exec(githubRef);
    if (!result) throw new Error("Reference not found.");
    const [, pullRequestId] = result;
    return pullRequestId;
};

async function fixPrBase(){
    const githubToken = core.getInput("githubToken")
    const wrongbranch = core.getInput("wrongbranch")
    const targetbranch = core.getInput("targetbranch")
    const octokit = github.getOctokit(githubToken)

    const pullRequestId = parsePullRequestId(github.context.ref);
    const { data: pullRequest } = await octokit.rest.pulls.get({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        pull_number: parseInt(pullRequestId),
    });

    if(pullRequest.base.ref == wrongbranch) {
        octokit.rest.pulls.update({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            pull_number: parseInt(pullRequestId),
            base: targetbranch
        })
    }
}

run()
