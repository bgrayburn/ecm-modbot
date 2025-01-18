import { RoomConfig, PolicyRepoConfig,  Policy, ActionOptions, Action, Message, MessageContext, BotCommand } from "./types";
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

  private async handleNewMessage(message: Message): Promise<void> {
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
    const messageContext: MessageContext = {
      roomTopic: this.room.getRoomTopic(),
      chatHistory: this.room.getChatHistory()
    }
    const policyCheckResponse = await this.checkMessageAgainstPolicies(message, approvedPolicies, messageContext)
    console.log('policyCheckResponse:')
    console.log(JSON.stringify(policyCheckResponse, null, 2))
    this.executeActions(policyCheckResponse.suggested_actions)
  }

  // TODO: redundant function name checkMessageAgainstPolicies
  private async checkMessageAgainstPolicies(
    message: Message,
    policies: Policy[],
    messageContext: MessageContext,
  ): Promise<PolicyCheckResponse> {
    const actionOptions = this.getListOfActionOptions()
    const response: PolicyCheckResponse = await checkMessageAgainstPolicies(message, policies, actionOptions, messageContext)
    return response
  }

  private getListOfActionOptions = (): string[] => {
    return getEnumValues<ActionOptions>(ActionOptions)
  }

  private executeActions(actions: Action[]): void {
    actions.forEach(action => {
      switch (action.type) {
        case ActionOptions.SendMessage:
          this.room.sendMessage(`${action.userId}: ${action.message}`)
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
      }
    })
  }

  private async handleCommand(messageContent: string, author: string): Promise<void> {
    // only people with powerlevel > 25 can give commands to the bot
    const authorPowerLevels = await this.room.getUserPowerLevel(author)
    if (authorPowerLevels <= 25) {
      this.room.sendMessage(`${author}: you must have power level > 25 to give me commands`)
      return
    }

    console.log(`handling command: ${messageContent} from user: ${author}`)
    const splitMessageContent = messageContent.split(' ')
    const command = splitMessageContent[1]
    const args = splitMessageContent.slice(2)
    if (!Object.values(BotCommand).includes(command as BotCommand)) {
      this.room.sendMessage(`Unknown command ${command}. Try using the 'help' command to learn more.`)
    }
    switch (command) {
      case BotCommand.Help:
        this.room.sendMessage(`Available commands:
           help,
           policies,
           policy <policy_name>,
           proposePolicy <policy_name> <policy_text>,
           proposePolicyUpdate <policy_name> <update_instructions>,
           approve <policy_name>
           vote <policy_name> <(y)es/(n)o>`)
        break;
      case BotCommand.ListPolicies:
        const proposedPolicies = await this.policyRepo.getProposedPolicyNames()
        const approvedPolicies = await this.policyRepo.getApprovedPolicyNames()
        const message = `Proposed policies: ${proposedPolicies.join(', ')}\nApproved policies: ${approvedPolicies.join(', ')}`
        this.room.sendMessage(message)
        break;
      case BotCommand.GetPolicy:
        const policy = await this.policyRepo.getPolicy(args[0])
        this.room.sendMessage(JSON.stringify(policy, null, 2))
        break
      case BotCommand.ProposePolicy:
        this.policyRepo.addProposedPolicy(args[0], args.slice(1).join(' '), author)
        this.room.sendMessage('Policy added to proposed policies')
        break;
      case BotCommand.ProposePolicyUpdate:
        const policyName = args[0]
        const updateInstructions = args.slice(1).join(' ')
        const currentPolicy = await this.policyRepo.getApprovedPolicy(policyName)
        const updatedPolicyText = (await getUpdatedPolicyText(updateInstructions, currentPolicy.content)).policy_text
        await this.policyRepo.addProposedUpdatedPolicy(currentPolicy, updatedPolicyText, author)
        this.room.sendMessage(`Proposed policy update for ${policyName}:\n${updatedPolicyText}`)
        break;
      case BotCommand.ApprovePolicy: // TODO: remove this after voting works
        this.policyRepo.approvePolicy(args[0])
        this.room.sendMessage(`Approved policy: ${args[0]}`)
        break;
      case BotCommand.Vote:
        const policyNameToVoteOn = args[0]
        const vote = args[1]
        if (['yes', 'y'].includes(vote.toLowerCase())) {
          await this.policyRepo.addVoteOnPolicy(policyNameToVoteOn, author, true)
          this.policyRepo.checkIfPolicyShouldBeApproved(policyNameToVoteOn)
        } else if (['no', 'n'].includes(vote.toLowerCase())) {
          await this.policyRepo.addVoteOnPolicy(policyNameToVoteOn, author, false)
          this.policyRepo.checkIfPolicyShouldBeApproved(policyNameToVoteOn)
        } else {
          this.room.sendMessage(`Invalid vote: ${vote}. Please vote 'yes' or 'no'.`)
        }
        break;
    }
  }
}
