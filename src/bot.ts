import { RoomConfig, PolicyRepoConfig,  Policy, ActionOptions, Action, Message } from "./types";
import PolicyRepo from "./policyRepository";
import Room from "./room";
import { checkMessageAgainstPolicies, PolicyCheckResponse } from "./policyChecker";
import { getEnumValues } from "./util/typeUtil";
import { getUpdatedPolicyText } from "./policyUpdate";

export default class Bot {
  policyRepo: PolicyRepo
  room: Room

  constructor(roomConfig: RoomConfig, policyRepoConfig: PolicyRepoConfig){
    this.room = new Room(roomConfig, this.handleNewMessage.bind(this))
    this.policyRepo = new PolicyRepo(policyRepoConfig)
  }

  async handleNewMessage(message: Message): Promise<void> {
    // check if message is command to bot
    console.log(`handling message: ${JSON.stringify(message, null, 2)}`)
    if (message.content.startsWith(`${this.room.userId.slice(1).split(':')[0]}:`)) {
      this.handleCommand(message.content, message.author)
      return
    }
    //check if message is from bot
    if (message.author === this.room.userId) {
      return
    }
    // check message against policies
    const approvedPolicies = await this.policyRepo.getApprovedPolicies()
    const policyCheckResponse = await this.checkMessageAgainstPolicies(message, approvedPolicies, this.room.getRoomTopic())
    console.log('policyCheckResponse:')
    console.log(JSON.stringify(policyCheckResponse, null, 2))
    this.executeActions(policyCheckResponse.suggested_actions)
  }

  async checkMessageAgainstPolicies(message: Message, policies: Policy[], topic: string): Promise<PolicyCheckResponse> {
    const actionOptions = this.getListOfActionOptions()
    const promptTemplateVariables = {
      message: message.content,
      author: message.author,
      actionOptions: actionOptions.join(', '),
    }
    const response: PolicyCheckResponse = await checkMessageAgainstPolicies(message, policies, actionOptions, topic)
    return response
  }

  private getListOfActionOptions = (): string[] => {
    return getEnumValues<ActionOptions>(ActionOptions)
  }

  executeActions(actions: Action[]): void {
    actions.forEach(action => {
      switch (action.type) {
        case ActionOptions.SendMessage:
          this.room.sendMessage(action.message)
          break;
        case ActionOptions.RedactMessage:
          this.room.redactMessage(action.eventId)
          break;
        case ActionOptions.KickUser:
          this.room.kickUser(action.userId)
          break;
        case ActionOptions.BanUser:
          this.room.banUser(action.userId)
          break;
        default:
          if (action.type in ActionOptions) {
            throw new Error(`Action ${action.type} is not implemented`)
          } else {
            throw new Error(`Unknown action type: ${action.type}`)
          }
      }
    })
  }

  async handleCommand(messageContent: string, author: string): Promise<void> {
    console.log(`handling command: ${messageContent}`)
    const splitMessageContent = messageContent.split(' ')
    const command = splitMessageContent[1]
    const args = splitMessageContent.slice(2)
    switch (command) {
      case 'help':
        this.room.sendMessage(`Available commands:
           help,
           policies,
           policy <policy_name>,
           proposePolicy <policy_name> <policy_text>,
           proposedPolicyUpdate <policy_name> <update_instructions>,
           approve <policy_name>`)
        break;
      case 'policies':
        const proposedPolicies = await this.policyRepo.getProposedPolicyNames()
        const approvedPolicies = await this.policyRepo.getApprovedPolicyNames()
        const message = `Proposed policies: ${proposedPolicies.join(', ')}\nApproved policies: ${approvedPolicies.join(', ')}`
        this.room.sendMessage(message)
        break;
      case 'policy':
        const policy = await this.policyRepo.getPolicy(args[0])
        this.room.sendMessage(JSON.stringify(policy, null, 2))
        break
      case 'proposePolicy':
        this.policyRepo.addProposedPolicy(args[0], args.slice(1).join(' '), author)
        break;
      case 'proposePolicyUpdate':
        const policyName = args[0]
        const updateInstructions = args.slice(1).join(' ')
        const currentPolicy = await this.policyRepo.getApprovedPolicy(policyName)
        const updatedPolicyText = (await getUpdatedPolicyText(updateInstructions, currentPolicy.content)).policy_text
        await this.policyRepo.addProposedUpdatedPolicy(currentPolicy, updatedPolicyText, author)
        this.room.sendMessage(`Proposed policy update for ${policyName}:\n${updatedPolicyText}`)
        break;
      case 'approve': // TODO: remove this after voting works
        this.policyRepo.approvePolicy(args[0])
        this.room.sendMessage(`Approved policy: ${args[0]}`)
        break;
      default:
        this.room.sendMessage(`Unknown command ${args.join(' ')}. Try using the 'help' command to learn more.`)
    }
  }
}
