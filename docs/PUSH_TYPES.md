# Push Types

## Notification Category Types Overview

| Category ID           | Description            |
| --------------------- | ---------------------- |
| `push.simple`         | Simple Push            |
| `button.approve_deny` | Approve / Deny Buttons |
| `button.yes_no`       | Yes/No Buttons         |
| `button.acknowledge`  | Acknowledge Button     |
| `button.open_link`    | Open Link Button       |
| `input.reply`         | Input Field: Reply     |
| `input.submit`        | Input Field: Submit    |

## Simple Push

Simple push just has a message and a title.
No action will be performed on click, though the response will be recorded if it is tapped.

Request:
POST `/push/{{webhookSecret}}`

```json
{
  "title": "Notification Title", // required
  "body": "Desc / Body", // required
  "callback_url": "https://example.pushme.tgxn.net/some_callback_url" // optional
}
```

Response:

```json
{
  "success": true,
  "push_ref": "000000000-00000-00000-0000000"
}
```

## Interactive Push

Interactive push requires a type pre-defined within the application, the following actions are inbuilt and provide an action for each of the options listed.

This can call an outbound web service to acknowledge or action noticiations.

**Webhook Payload**

```json
{
  "title": "Notification Title", // required
  "body": "Desc / Body", // optional
  "callback_url": "https://example.pushme.tgxn.net/some_callback_url", // optional
  "category_id": "categoryId" // required
}
```

### Category IDs `categoryId`

#### `button.yes_no` - Buttons: Yes / No

Callback Format

```json
{
  "pushId": "000000000-00000-00000-0000000",
  "categoryId": "button.yes_no",
  "userText": "uesrs text"
}
```

#### `button.approve_deny` - Buttons: Approve / Deny

#### `button.acknowledge` - Button: Acknowledge

Callback Format

```json
{
  "pushId": "000000000-00000-00000-0000000",
  "categoryId": "button.acknowledge",
  "clicked": true
}
```

#### `button.open_link` - Button: Open Link

Request:
POST `/webhook/push/{{webhookSecret}}`

```json
{
  "title": "Notification Title", // required
  "body": "Desc / Body", // optional
  "categoryId": "button.open_link", // required
  "linkUrl": "https://example.pushme.tgxn.net/" // required
}
```

Callback Format

```json
{
  "pushId": "000000000-00000-00000-0000000",
  "clicked": true
}
```

#### `input.submit` - Input Field: Submit

#### `input.reply` - Input Field: Reply

#### `input.approve_deny` - Input Field: Approve / Deny

Request:
POST `/webhook/push/{{webhookSecret}}`

```json
{
  "title": "Notification Title", // required
  "body": "Desc / Body", // optional
  "categoryId": "button.yes_no" // required
}
```

Response:

```json
{
  "pushId": "000000000-00000-00000-0000000",
  "success": true
}
```

### Callback Format

```json
{
  "pushId": "000000000-00000-00000-0000000",
  "userText": "uesrs text"
}
```
