import Arweave from "arweave/node";
import bodyParser from "body-parser";
import cors from "cors";
import errorhandler from "errorhandler";
import express, { Express, NextFunction, Request, Response } from "express";
import fs from "fs";
import morgan from "morgan";
import path from "path";
import "./env";
import { getHTMLParser, getHTMLParserIds } from "./parsers/html";
import { getTextParser } from "./parsers/text";

if (!process.env.WALLET_FILE) {
    console.log("⛔ ERROR: Please specify a wallet file to load using argument " +
        "'--wallet-file <PATH>'.");
    process.exit();
}

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

const dispatchTx = (tx: any) => {
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
};

const app: Express = express();
const port: number = 5000;

app.use(bodyParser());
app.use(morgan("combined"));
app.use(cors());

if (process.env.NODE_ENV === "development") {
    app.use(errorhandler());
}

app.post("/url/extract/preview", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { url, parserId } = req.body;
        const { contentType } = req.query;

        switch (contentType) {
            case "html":
                const htmlResult: any = await getHTMLParser(parserId).parseHTML(url);

                res.send({
                    html: htmlResult.content
                });
                return;
            case "text":
                const textResult: any = await getTextParser(parserId).parseText(url);

                res.send({
                    text: textResult.content
                });
                return;
            default:
                throw new Error("Unsupported format");
        }

    } catch (err) {
        next(err);
    }
});

app.post("/url/extract/submit", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { url, parserId } = req.body;
        const { contentType } = req.query;

        switch (contentType) {
            case "html":
                const data: any = await getHTMLParser(parserId).parseHTML(url);

                const tx = await arweave.createTransaction({ data: data.content }, wallet);
                tx.addTag("content", "article");

                await dispatchTx(tx);

                res.send({
                    txId: tx.id
                });
                return;
            case "text":
                const textResult: any = await getTextParser(parserId).parseText(url);

                res.send({
                    text: textResult.content
                });
            default:
                throw new Error("Unsupported format");
        }

    } catch (err) {
        next(err);
    }
});

app.get("/parsers", (req: Request, res: Response) => {
    res.send({
        htmlParsers: getHTMLParserIds()
    });
});

app.listen(port);
