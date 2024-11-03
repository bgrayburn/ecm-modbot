import { Policy, PolicyFile, PolicyStatus, PolicyRepoConfig } from "./types";
import * as fs from 'node:fs/promises';

export default class PolicyRepo {
  basePath: string

  constructor(policyRepoConfig: PolicyRepoConfig) {
    this.basePath = policyRepoConfig.basePath
  }

  private policyToPolicyFile(policy: Policy): PolicyFile {
    return {
       content: policy.content,
       createdAt: policy.createdAt,
       updatedAt: policy.updatedAt,
       approvedAt: policy.approvedAt,
       author: policy.author
     } as PolicyFile
  }

  private async addPolicy(policy: Policy) {
    const policyFile = this.policyToPolicyFile(policy)
    return await fs.writeFile(`${this.basePath}/${policy.status}/${policy.name}`, JSON.stringify(policyFile))
  }

  private removeProposedPolicy(policyName: string) {
    return fs.unlink(this.basePath + '/proposed/' + policyName)
  }

  private async getPolicyFileAtPath(policyPath: string, name: string): Promise<PolicyFile | undefined> {
    const file = await fs.readFile(policyPath + '/' + name)
    return file ? { ...JSON.parse(file.toString()) as PolicyFile } : undefined
  }

  async addProposedPolicy(policyName: string, policyContent: string, policyAuthor: string) {
    // TODO: check if we're going to have date timezone problems here
    const policy: Policy = {
      name: policyName,
      status: PolicyStatus.Proposed,
      content: policyContent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvedAt: '',
      votes: [],
      author: policyAuthor
    }
    return this.addPolicy(policy)
  }
  
  async addApprovedPolicy(policyName: string) {
    const policy = await this.getProposedPolicy(policyName)
    if (policy === undefined) {
      throw new Error('Policy not found')
    }
    await this.addPolicy({ ...policy, status: PolicyStatus.Approved, approvedAt: new Date().toISOString() })
    return this.removeProposedPolicy(policyName)
  }

  async addVoteOnPolicy(policyName, vote: boolean) {
    // TODO: check if policy exists
    const policyPath = this.basePath + '/proposed/' + policyName
    const file = await fs.readFile(policyPath)
    const policyFile = JSON.parse(file.toString()) as PolicyFile
    const votes = policyFile.votes.concat(vote)
    fs.writeFile(policyPath, JSON.stringify({ ...policyFile, votes }))
  }

  async getProposedPolicy(name: string): Promise<Policy | undefined> {
    const policyFile = await this.getPolicyFileAtPath(this.basePath + '/proposed', name)
    return policyFile ? { ...policyFile, status: PolicyStatus.Proposed, name } as Policy : undefined
  }

  async getApprovedPolicy(name: string): Promise<Policy | undefined> {
    const policyFile = await this.getPolicyFileAtPath(this.basePath + '/approved', name)
    return policyFile ? { ...policyFile, status: PolicyStatus.Approved, name } as Policy : undefined
  }

  async getPolicy(name: string): Promise<Policy | undefined> {
    const proposedPolicy = await this.getProposedPolicy(name)
    if (proposedPolicy !== undefined) {
      return proposedPolicy
    }
    return await this.getApprovedPolicy(name)
  }

  async getVotesForPolicy(policyName) {
    //use getPolicy to get a policy then tally up the votes for and against
    //return the result as an object with two properties: for and against
    const policy = await this.getPolicy(policyName)
    const votes = policy.votes.reduce((acc: {for: number, against: number}, vote: boolean) => {
      if (vote) {
        acc.for += 1
      } else {
        acc.against += 1
      }
      return acc
    }, { for: 0, against: 0 })
    return votes
  }

  getApprovedPolicies() {
    return fs.readdir(this.basePath + '/approved')
  }

  getProposedPolicies() {
    return fs.readdir(this.basePath + '/proposed')
  }

  async getAllPolicies(): Promise<string[]> {
    return (await this.getApprovedPolicies()).concat(await this.getProposedPolicies())
  }

  approvePolicy(policyName: string) {
    return fs.rename(this.basePath + '/proposed/' + policyName, this.basePath + '/approved/' + policyName)
  }
}
