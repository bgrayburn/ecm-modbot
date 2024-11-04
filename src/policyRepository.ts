import { Policy, PolicyFile, PolicyStatus, PolicyRepoConfig } from "./types";
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export default class PolicyRepo {
  basePath: string

  constructor(policyRepoConfig: PolicyRepoConfig) {
    this.basePath = policyRepoConfig.basePath
    // TODO: check that base path and child folder exist or create them
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
    const writePath = path.join(this.basePath, policy.status, policy.name)
    return await fs.writeFile(writePath, JSON.stringify(policyFile))
  }

  private removeProposedPolicy(policyName: string) {
    const removePath = path.join(this.basePath, 'proposed', policyName)
    return fs.unlink(removePath)
  }

  private async getPolicyFileAtPath(policyPath: string, name: string): Promise<PolicyFile | undefined> {
    try {
      const readPath = path.join(policyPath, name)
      const file = await fs.readFile(readPath)
      return { ...JSON.parse(file.toString()) as PolicyFile }
    } catch {
      return undefined
    }
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
    const policyPath = path.join(this.basePath, 'proposed', policyName)
    const file = await fs.readFile(policyPath)
    const policyFile = JSON.parse(file.toString()) as PolicyFile
    const votes = policyFile.votes.concat(vote)
    fs.writeFile(policyPath, JSON.stringify({ ...policyFile, votes }))
  }

  async getProposedPolicy(name: string): Promise<Policy | undefined> {
    const policyPath = path.join(this.basePath, 'proposed')
    const policyFile = await this.getPolicyFileAtPath(policyPath, name)
    return policyFile ? { ...policyFile, status: PolicyStatus.Proposed, name } as Policy : undefined
  }

  async getApprovedPolicy(name: string): Promise<Policy | undefined> {
    const policyPath = path.join(this.basePath, 'approved')
    const policyFile = await this.getPolicyFileAtPath(policyPath, name)
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

  getApprovedPolicyNames() {
    const approvedPath = path.join(this.basePath, 'approved')
    return fs.readdir(approvedPath)
  }

  getProposedPolicyNames() {
    const proposedPath = path.join(this.basePath, 'proposed')
    return fs.readdir(proposedPath)
  }

  getApprovedPolicies() {
    return this.getApprovedPolicyNames().then(files => {
       return Promise.all(files.map(file => {
         return this.getApprovedPolicy(file)
       }))
     })
  }

  async getAllPolicyNames(): Promise<string[]> {
    return (await this.getApprovedPolicyNames()).concat(await this.getProposedPolicyNames())
  }

  approvePolicy(policyName: string) {
    const proposedPolicyPath = path.join(this.basePath, 'proposed', policyName)
    const approvedPolicyPath = path.join(this.basePath, 'approved', policyName)
    return fs.rename(proposedPolicyPath, approvedPolicyPath)
  }
}
