# Setting up Authelia

PushMe supports the Duo protocol to perform push-based authentication. Authelia can be configured to use this push-service, either running self-hosted in Docker, or using the `pushme.tgxn.net` service.

## Authelia Docker-Compose Environemnt Variables

You need to enable development mode beccause Duo has cert-pinning by default.

```yaml
environment:
  - TZ=Australia/Perth
  - ENVIRONMENT=dev # support non-pinned Duo
```

## Autehlia Configuration

In your Authelia `configyuration.yml` you need to add the following:

```yaml
duo_api:
  disable: false
  hostname: pushme.tgxn.net
  integration_key: # TOPIC_KEY
  secret_key: # TOPIC_SECRET
  enable_self_enrollment: false
```

### Solution

https://github.com/tgxn/authelia/commit/f9bc4d1a788c2ed3fcced2ff7bcbf1331a787917

I have made changes to Authelia to support a `use_system_cas` option. This will allow you to use the system CA store instead of the pinned certs one.

For now, we must set `ENVIRONMENT=dev` so that Authelia will skip SSL verification:
https://github.com/authelia/authelia/blob/master/internal/server/handlers.go#L219
