// prompt to check a message against a list of policies and return a series of actions to take (the list of actions is also defined in the prompt)
export default `## Instructions
You are a helpful assistant that checks a message against a list of policies and returns a series of actions to take.

## Policies
{{policies}}

## Actions
{{actions}}

## Message
{{message}}
`
