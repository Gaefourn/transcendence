## Required environnement variables

### Backend
- `POSTGRES_HOST` should be `database` as specified in [docker-compose.yaml](./docker-compose.yaml)
- `POSTGRES_PORT` should be `5432` in most cases
- `POSTGRES_DB` value doesn't matter for uninitialized databases
- `POSTGRES_USER` value doesn't matter for uninitialized databases
- `POSTGRES_PASSWORD` value doesn't matter for uninitialized databases
- `BACK_PORT` should be `3000` in most cases
- `FRONT_PORT` should be `80` in most cases
- `FT_CLIENT_ID`
- `FT_CLIENT_SECRET`
- `FT_CALLBACK_URL` should be `http://localhost/auth` for local dev. Port should match `FRONT_PORT`
- `JWT_SECRET`
- `TWO_FACTOR_AUTHENTICATION_APP_NAME` should be transcendence.

### Clientside frontend
Must be prefixed with `REACT_APP_`, or they will only exist server-side

- `REACT_APP_CLIENT_ID` same as its `FT_` counterpart
- `REACT_APP_CALLBACK_URL` same as its `FT_` counterpart
- `REACT_APP_HOST` should be `http://localhost:3000` for local dev
