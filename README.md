
How to setup envionment
```
cargo install espup ldproxy
espup install
```

How to run debug environment:
```
cargo demo
cargo server

cd frontend
nvm use
npm install
npm run dev
```

How to compile server for production:
```
cargo build --release -p server
cd frontend
nvm use
npm install
npm run dev
```

How to restart service:
`sudo systemctl restart evac-server.service`