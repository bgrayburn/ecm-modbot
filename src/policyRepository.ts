import { Policy, PolicyFile, PolicyStatus, PolicyRepoConfig } from "./types";
import * as fs from 'node:fs/promises';
import { existsSync, mkdirSync } from "node:fs";
import * as path from 'node:path';

export default class PolicyRepo {
  basePath: string

  constructor(policyRepoConfig: PolicyRepoConfig) {
    this.basePath = policyRepoConfig.basePath
    const subdirectories = ['proposed', 'approved']
    subdirectories.forEach((dir: string) => {
      const dirPath = path.join(this.basePath, dir)
      if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true })
      }
    })
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

  private async addPolicy(policy: Policy, overwrite: boolean = true) {
    const writePath = path.join(this.basePath, policy.status, policy.name)
    if (!overwrite && existsSync(writePath)) {
      throw new Error(`Policy ${policy.name} already exists`)
    }    
    const policyFile = this.policyToPolicyFile(policy)
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

  async addProposedPolicy(
    policyName: string,
    policyContent: string,
    policyAuthor: string,
    overwrite: boolean = false
  ) {
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
    try{
      return this.addPolicy(policy, overwrite)
    } catch (e) {
      throw new Error(`Failed to add policy ${policyName}: ${e}`)
    }
  }
  
  async addVoteOnPolicy(policyName: string, author: string, vote: boolean) {
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

  async getPolicy(name: string): Promise<Policy[]> {
    const proposedPolicyPromise = this.getProposedPolicy(name)
    const approvedPolicyPromise = await this.getApprovedPolicy(name)
    const policies = (await Promise.all([proposedPolicyPromise, approvedPolicyPromise])).filter(p => p !== undefined)
    return policies
  }

  async getVotesForPolicy(policyName: string) {
    //use getPolicy to get a policy then tally up the votes for and against
    //return the result as an object with two properties: for and against
    const policy = await this.getProposedPolicy(policyName)
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

  async approvePolicy(policyName: string) {
    const proposedPolicyPath = path.join(this.basePath, 'proposed', policyName)
    const proposedPolicyFile = JSON.parse((await fs.readFile(proposedPolicyPath)).toString())
    console.log('proposedPolicyFile:')
    console.log(JSON.stringify(proposedPolicyFile, null, 2))
    const approvedPolicyFile = { ...proposedPolicyFile, approvedAt: new Date().toISOString() }
    this.removeProposedPolicy(policyName)
    const approvedPolicyPath = path.join(this.basePath, 'approved', policyName)
    return fs.writeFile(approvedPolicyPath, JSON.stringify(approvedPolicyFile))
  }

  async addProposedUpdatedPolicy(currentPolicy: Policy, policyContent: string, author: string) {
    const updatedPolicy: Policy = {
      ...currentPolicy,
      content: policyContent,
      author,
      status: PolicyStatus.Proposed,
      updatedAt: new Date().toISOString()
    }
    return this.addPolicy(updatedPolicy, true)
  }

  checkIfPolicyShouldBeApproved(policyNameToVoteOn: string) {
    console.error("Method not implemented.");
  }
}
