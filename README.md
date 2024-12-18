# Evolution Collective Moderation (ECM) Bot
**IMPORTANT:** This repository contains a work in progress. Expect nothing to work.
## About
The ECM bot is a reference implemenation of the proposed design pattern found [here](https://github.com/bgrayburn/Evolutionary-Collective-Moderation-Design-Pattern/blob/main/DesignPattern.md). Its main purpose to is collect proposed natural language moderation policies from users in the channel, use a voting system to transition them to the `accepted` status, then apply them to the channel. The reference implementation uses Matrix as the communication layer, and Git to as a policy store.
For the reference implementation, a bot implementaiton only supports a single chat room.

## Design
```mermaid
  erDiagram
    ROOM {
      homeserver string
      accessToken string
      userId string
      roomId string
    }
    POLICY_REPOSITORY {
      string git_url
    }
    POLICY {
      string name
      string content
      string status
      string author
      string created_at
      string updated_at
      string applied_at
    }
    MESSAGE {
      string id
      string sender
      string content
    }
    BOT {
      string userId
    }
    ROOM ||--o{ POLICY : contains
    POLICY_REPOSITORY ||--o{ POLICY : contains
    POLICY_REPOSITORY ||--|| ROOM : manages
    ROOM ||--o{ MESSAGE : contains
    BOT ||--|| ROOM : moderates
    BOT ||--|| POLICY_REPOSITORY : manages
```

## Setup

## Usage

## Todos
- [X] add the ability to update the policies using natural language
- [ ] add voting system
- [ ] add chat history to prompt context
- [ ] add help for specific commands
- [ ] add the ability to direct chat users to instruct them why actions were taken against them
- [ ] add tests
- [ ] add E2E support
- [ ] Add spaces support (multiple rooms)?
- [ ] Add matrix server class?
- [ ] Human overrides for bot decisions?
- [ ] Add the ability for the bot to manage room state (ex. topic)?

## Open Questions
- Can GPT suggest when policies are ambiguous?
- Currently updates reset the clock on a currently proposed policy. Should it?
- Currently only 1 proposed update on a policy can exists, meaning that new proposals overwrite old ones. Should it?
- Should the bot be given access to the chat history when making decisions? This would allow for more complicated policies like.
- What about policies like (no speaking ill of people in the chat room?). This would require the bot to have a way to identify people in the chat room.

