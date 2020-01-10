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
import { contentTypeSupported, extractMeta, generateMetatags, getMetatags, getRequest, getTitle, getTitleTag } from "./util";

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

        if (!contentTypeSupported(contentType)) {
            return res.send({
                data: "Content type not supported."
            });
        }

        const data: any = {};

        const { body: rawHtml } = await getRequest(url);

        if (contentType === "html") {
            const html: any = await getHTMLParser(parserId).parseHTML(rawHtml, url);
            data.content = html.content;
        } else if (contentType === "text") {
            const text: any = await getTextParser(parserId).parseText(rawHtml);
            data.content = text.content;
        }

        res.send(data);
    } catch (err) {
        next(err);
    }
});

app.post("/url/extract/submit", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { url, parserId } = req.body;
        const { contentType } = req.query;

        if (!contentTypeSupported(contentType)) {
            return res.send({
                data: "Content type not supported."
            });
        }

        const data: any = {};

        const { body: rawHtml } = await getRequest(url);

        const html: any = await getHTMLParser(parserId).parseHTML(rawHtml, url);

        const textParserId = contentType === "html" ? "1" : parserId;
        const text: any = await getTextParser(textParserId).parseText(rawHtml);

        if (contentType === "html") {
            data.content = html.content;
        } else if (contentType === "text") {
            data.content = text.content;
        }

        const metadata = await extractMeta(rawHtml, url);
        data.title = metadata.title ? metadata.title : await getTitle(rawHtml);
        data.metaTags = generateMetatags(metadata);
        data.titleTag = getTitleTag(rawHtml);

        const finalContent = data.titleTag + data.metaTags + data.content;
        const tx = await arweave.createTransaction({ data: finalContent }, wallet);

        if (data.title) { tx.addTag("Title", data.title); }

        tx.addTag("Original URL", url);

        await dispatchTx(tx);

        res.send({
            txId: tx.id
        });

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
