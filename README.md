Welcome to PushMe Server!
=================

## setup `.env` file
copy .evn.example

### bring up
`docker-compose up --build -d`

### setup db
`docker-compose exec pushme npx sequelize-cli db:migrate`

## TODO
- bug where error handelr sometimes doesn't send any response?
- nice dark theme / clean light theme



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