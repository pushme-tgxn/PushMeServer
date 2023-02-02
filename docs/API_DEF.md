# New Plan

User

- Device (Registration/Token)
- Topic
  - Target Device
  - Integrations

Push

- Metadata
- Channel
  - Target Device
- Integration Type
- Callback URL
  - Callback Response
- Service Request Reply
- User Response(s)

Application

- User
  - Device Linked to Application

# API Definition

## User

> Register (Anyone)
> POST `/user/register`

> Login (Anyone)
> POST `/user/login`

> Logout (Only Self)
> GET `/user`

> Validate a user jwt token (Only Self)
> GET `/user/verify`

> List all push messages to me (Logged in User)
> GET `/user/history` (move to this)

## Device (Only Self)

Track devices a user has registered to their account.

> List Own Devices
> GET `/device`

> Register Device
> POST `/device`

> Delete Device
> DELETE `/device/:token_id`

## Topic Management (Owner, Admin)

Topics can be created to receive notifications on one or more devices.

> Create Topic
> POST `/topic`

> Update Topic
> POST `/topic/:topic_id`

> Delete Topic
> DELETE `/topic/:topic_id`

## Push (Anyone with secret)

Webhook secrets can be used to send push notifications to a user.

> Push to a webhook _(see PUSH_TYPES.md)_
> POST `/push/:webhook_secret`

POST `/push/:webhook_secret/uptimekuma`

## Push Status

> Push Status
> GET `/push/status/:push_uid`

## Application

???
