import { Policy, PolicyRepoConfig } from "./types";
import * as fs from 'node:fs/promises';

export default class PolicyRepo {
  constructor(policyRepoConfig: PolicyRepoConfig) {
  }

  addProposedPolicy(policy: Policy) {
    // TODO: implement this
  }

  addVoteOnPolicy(policyName, vote: boolean) {
    // TODO: implement this
  }

  getPolicy(policyName: string): Policy {
    // TODO: implement this
    return { } as Policy
  }

  getActivePolicies() {
    // TODO: implement this
    return []
  }

  getProposedPolicies() {
    // TODO: implement this
    return []
  }

  getAllPolicies() {
    return this.getActivePolicies().concat(this.getProposedPolicies())
  }

  activatePolicy(policyId) {
    // TODO: implement this
  }

  deactivatePolicy(policyId) {
    // TODO: implement this
  }
}
