## How to setup envionment:

```sh
cargo install espup ldproxy
espup install
```

## How to run debug environment:

```sh
cargo demo
cargo server

cd frontend
nvm use
npm ci
npm start mvp
```

> Read more in [Frotnend README.md](./frontend/README.md)

## How to compile server for production:

```sh
cargo build --release -p server
cd frontend
nvm use
npm ci
npm run build mvp
```

## How to restart service:

```sh
sudo systemctl restart evac-server.service
```

## Steps for FE development

1. Create config file `data/server.json` and insert following configuration:

   ```json
   {
     "base": {
       "configPath": "data/server.json",
       "dataPath": "data/database.json",
       "frontendPath": "./frontend/dist",
       "salt": "abcdef",
       "querySize": 16,
       "portWeb": "0.0.0.0:3030",
       "portScanner": "0.0.0.0:4242",
       "portBroadcast": "192.168.1.255:4242"
     },
     "setting": {
       "test": 0
     }
   }
   ```

1. Start backend server:

   ```sh
   cargo server
   ```

1. Navigate to `frontend` directory and follow instuctions from [Frotnend README.md](./frontend/README.md)


# Cli application

* `cargo run -p server --bin cli -- notification --uuid 51da4fe0-6670-404c-accf-b1ad3a8e86a7` - send notification to contact with this UUID
* `cargo run -p server --bin cli -- device-position --device 6626f452-6386-4e18-8f6c-9b1c3bdd7099 --scanner e958f834-cf43-4488-b5d7-e7fa5aae6875 --msg 7cc6b673d714` - send advertisement for device
