const http = require('http');
const Router = require('./router');
const Listener = require('./listener');
const config = require('./config');
const Sourc3 = require('./sourc3/creeping_sourc3');
const Demo = require('./sourc3-demo/source-demo');

async function main() {
    console.log("Starting IPFS cache service...")
    console.log("Mode is", config.Debug ? "Debug" : "Release")

    // initialize, order is important
    const store = require('./store')
    await store.init();

    const WalletApi = require('./wallet-api');

    const api = new WalletApi(config.WalletAPI.Address, config.WalletAPI.ReconnectInterval);


    const Status = require('./status');

    const status = new Status(api);

    await new Listener().connect(api, status, Sourc3, Demo);

    // setup routes
    const router = new Router();

    router.register("/repo", (...args) => status.getRepoStatus(...args));

    router.register("/status", (...args) => status.report(...args));

    router.register("/upload", (...args) => status.uploadImage(...args));

    router.register("/", (req, res) => {
        res.writeHead(200);
        res.end('Hi! This is the IPFS cache service.');
    })

    // Start everything
    console.log("Listening on port", config.Port)
    const server = http.createServer((...args) => router.route(...args))
    server.listen(config.Port)
}
// setTimeout(() => {
main().catch(err => {
    console.error("IPFS cache service critical failure. The following error has been reported:")
    console.error(err)
    process.exit(1)
});
// });

