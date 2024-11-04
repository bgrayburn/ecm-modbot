# Evolution Collective Moderation (ECM) Bot

## About
The ECM bot is a reference implemenation of the proposed design pattern found [here](https://github.com/bgrayburn/Evolutionary-Collective-Moderation-Design-Pattern/blob/main/DesignPattern.md). Its main purpose to is collect proposed natural language moderation policies from users in the channel, use a voting system to transition them to the `accepted` status, then apply them to the channel. The reference implementation uses Matrix as the communication layer, and Git to as a policy store.
For the reference implementation, a bot implementaiton only supports a single chat room.

## Design
```mermaid
  erDiagram
    ROOM {
      homeserver string
      accessToken string
      userId: string
      roomId: string
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
- [ ] add voting system
- [ ] add E2E support
- [ ] Add matrix server class?
- [ ] Human overrides for bot decisions?

## Open Questions
- Can GPT suggest when policies are ambiguous?
