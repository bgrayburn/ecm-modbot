import { RoomConfig, PolicyRepoConfig, PolicyCheckResponse, Policy, BotAction, Message } from "./types";
import PolicyRepo from "./policyRepository";
import Room from "./room";
import PolicyChecker from "./policyChecker";

export default class Bot {
  policyRepo: PolicyRepo
  room: Room
  policyChecker: PolicyChecker

  constructor(roomConfig: RoomConfig, policyRepoConfig: PolicyRepoConfig){
    this.room = new Room(roomConfig, this.handleNewMessage.bind(this))
    // this.policyRepo = new PolicyRepo(policyRepoConfig)
    // this.policyChecker = new PolicyChecker()
  }

  handleNewMessage(message: Message): void {
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
    // const activePolicies = this.policyRepo.getActivePolicies()
    // const policyCheckResponses = this.checkMessageAgainstPolicies(message, activePolicies)
    // this.executeActions(policyCheckResponses.flatMap(response => response.actions))
  }

  checkMessageAgainstPolicies(message: Message, policies: Policy[]): PolicyCheckResponse[] {
    const responses: PolicyCheckResponse[] = this.policyChecker.checkMessageAgainstPolicies(message, policies)
    return responses
  }

  executeActions(actions: BotAction[]): void {
    actions.forEach(action => {
      switch (action.type) {
        case 'sendMessage':
          this.room.sendMessage(action.message)
          break;
        case 'redactMessage':
          this.room.redactMessage(action.eventId)
          break;
        case 'kickUser':
          this.room.kickUser(action.userId)
          break;
        case 'banUser':
          this.room.banUser(action.userId)
          break;
        default:
          console.error(`Unknown action type: ${action.type}`)
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
        this.room.sendMessage('Available commands: help, policies, policy, proposePolicy, approve')
        break;
      case 'policies':
        const allPolicies = await this.policyRepo.getAllPolicies()
        this.room.sendMessage(allPolicies.join(', '))
        break;
      case 'policy':
        this.room.sendMessage((await this.policyRepo.getPolicy(args[0])).content)
        break
      case 'proposePolicy':
        this.policyRepo.addProposedPolicy(args[0], args.slice(1).join(' '), author)
        break;
      case 'approve': // TODO: remove this after voting works
        this.policyRepo.approvePolicy(args[0])
        this.room.sendMessage(`Approved policy: ${args[0]}`)
        break;
      default:
        this.room.sendMessage(`Unknown command ${args.join(' ')}`)
    }
  }
}
