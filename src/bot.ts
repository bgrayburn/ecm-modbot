import { RoomConfig, PolicyRepoConfig, PolicyCheckResponse, Policy, BotAction, Message } from "./types";
import PolicyRepo from "./policyRepository";
import Room from "./room";
import PolicyChecker from "./policyChecker";

export default class Bot {
  policyRepo: PolicyRepo
  room: Room
  policyChecker: PolicyChecker

  constructor(roomConfig: RoomConfig, policyRepoConfig: PolicyRepoConfig){
    this.room = new Room(roomConfig, this.handleNewMessage)
    this.policyRepo = new PolicyRepo(policyRepoConfig)
    this.policyChecker = new PolicyChecker()
  }

  handleNewMessage(message: Message): void {
    // check if message is command to bot
    if (message.content.startsWith(`@${this.room.userId}`)) {
      this.handleCommand(message.content)
      return
    }
    //check if message is from bot
    if (message.author === this.room.userId) {
      return
    }
    // check message against policies
    const activePolicies = this.policyRepo.getActivePolicies()
    const policyCheckResponses = this.checkMessageAgainstPolicies(message, activePolicies)
    this.executeActions(policyCheckResponses.flatMap(response => response.actions))
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

  handleCommand(message: string): void {
    // remove the 1st word (the bot's username)
    const splitMessage = message.split(' ')
    const command = splitMessage[1]
    const args = splitMessage.slice(2)
    switch (command) {
      case 'help':
        this.room.sendMessage('Available commands: help, policies, activate, deactivate')
        break;
      case 'policies':
        this.room.sendMessage(this.policyRepo.getAllPolicies().map(policy => policy.name).join(', '))
        break;
      case 'policy':
        this.room.sendMessage(this.policyRepo.getPolicy(args[0]).content)
      case 'activate': // TODO: remove this after voting works
        this.policyRepo.activatePolicy(args[0])
        this.room.sendMessage(`Activated policy: ${args[0]}`)
        break;
      case 'deactivate': // TODO: remove this after voting works
        this.policyRepo.deactivatePolicy(args[0])
        this.room.sendMessage(`Deactivated policy: ${args[0]}`)
        break;
      default:
        this.room.sendMessage('Unknown command')
    }
  }
}
