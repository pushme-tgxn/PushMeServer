Welcome to PushMe
=================

### setup db
`docker-compose exec pushme npx sequelize-cli db:migrate`

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

# Optional `docker-compose.override.yml` for User ID and Traefik
```yaml
version: "3.5"

networks:
  traefik-net:
    external: true

services:
  mariadb:
    environment:
      - PUID=1000
      - PGID=100
    container_name: app_pushme_mariadb
  pushme:
    container_name: app_pushme
    networks:
      - traefik-net
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=traefik-net"

      - "traefik.http.services.pushme.loadbalancer.server.port=3000"

      - "traefik.http.routers.pushme.rule=Host(`pushme.example.org`)"
      - "traefik.http.routers.pushme.entrypoints=http"
```