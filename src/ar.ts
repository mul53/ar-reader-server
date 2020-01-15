import Arweave from "arweave/node";
import fs from "fs";
import path from "path";

const arweavePort = process.env.ARWEAVE_PORT ? process.env.ARWEAVE_PORT : 443;
const arweaveHost = process.env.ARWEAVE_HOST ? process.env.ARWEAVE_HOST : "arweave.net";
const arweaveProtocol = process.env.ARWEAVE_PROTOCOL ? process.env.ARWEAVE_PROTOCOL : "https";

const rawWallet = fs.readFileSync(path.join(__dirname, process.env.WALLET_FILE), { encoding: "utf-8" });
const wallet = JSON.parse(rawWallet);

const arweave = Arweave.init({
    host: arweaveHost,
    port: arweavePort,
    protocol: arweaveProtocol
});

export default {
  buildResourceUrl(id: any) {
    const BASE_URL = "https://arweave.net";
    return `${BASE_URL}/${id}`;
  },

  dispatchTx(tx: any) {
    return new Promise(async (resolve, reject) => {
        try {
            const anchorId = await arweave.api.get("/tx_anchor").then((x: any) => x.data);
            tx.last_tx = anchorId;

            await arweave.transactions.sign(tx, wallet);
            const res = await arweave.transactions.post(tx);

            resolve(res);
        } catch (err) {
            reject(err);
        }
    });
  },

  createTransaction(data: string | Uint8Array): any {
    return new Promise(async (resolve, reject) => {
      try {
        const tx = await arweave.createTransaction({ data }, wallet);
        resolve(tx);
      } catch (err) {
        reject(err);
      }
    });
  }
};
