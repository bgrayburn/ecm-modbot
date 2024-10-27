# Evolution Collective Moderation (ECM) Bot

## About
The ECM bot is a reference implemenation of the proposed design pattern found [here](https://github.com/bgrayburn/Evolutionary-Collective-Moderation-Design-Pattern/blob/main/DesignPattern.md). Its main purpose to is collect proposed natural language moderation policies from users in the channel, use a voting system to transition them to the `accepted` status, then apply them to the channel. The reference implementation uses Matrix as the communication layer, and Git to as a policy store.
For the reference implementation, a bot implementaiton only supports a single chat room.

## Setup


## Usage

## Todos
- [ ] Add ability to propose policies
- [ ] Add ability to vote on policies
- [ ] Add ability to apply policies
- [ ] Add ability to (propose) update policies
- [ ] Add ability to enforce policies
- [ ] Add DM support for administration
- [ ] Add support for multiple chat rooms
- [ ] Manage invites when already in a room
- [ ] Check E2E support and implement
- [ ] Human overrides?