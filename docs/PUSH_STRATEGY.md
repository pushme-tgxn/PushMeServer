# Push Strategy

## Introduction

When we send push notifications, they are either delivered via the Expo Push Service or via Firebase Cloud Messaging.

## Saved Push Data

Push Request Data is saved in the database. This is done to be able to resend push notifications in case of failure.

pushPayload - the raw push payload for the request - including forced pushIdent and pushId
serviceType - the service that sent the push
serviceRequest - the response from the service that sent the push
