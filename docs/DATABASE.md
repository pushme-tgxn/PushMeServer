# DB Schema

## User
User registration, contains username, password hash and email

- user select default token for pushes from apps (or override per-app)

if no default, select earliest registered token


## Token
List of registered push tokens, contains userid, token and name


## Push
List of push messages sent to any users, used for history and auditing actions.

When pushing a message, the message is stored in the database, and the push is sent to the selected users.

- categoryIdent
- title
- description

## Application

- App Namespace (ie. `net.tgxn.pushme`)
- Catergories (register to app users)
- Users (registered with consent screen to send push)
- Push

## Categories

- Name
- CategoryKey
- CategoryData
