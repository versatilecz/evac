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
