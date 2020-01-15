import "./env";
import bodyParser from "body-parser";
import cors from "cors";
import errorhandler from "errorhandler";
import express, { Express, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import ar from "./ar";
import { getHTMLParser, getHTMLParserIds } from "./parsers/html";
import { getTextParser } from "./parsers/text";
import {
    contentTypeSupported,
    extractMeta,
    generateMetatags,
    getRequest,
    getTitle,
    getTitleTag,
    replaceImages,
    sentimentAnalysis,
    walletCheck
} from "./util";

walletCheck();

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
            const text: any = await getTextParser(parserId).parseText(rawHtml, url);
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
        const text: any = await getTextParser(textParserId).parseText(rawHtml, url);

        if (contentType === "html") {
            data.content = html.content;
        } else if (contentType === "text") {
            data.content = text.content;
        }

        const metadata = await extractMeta(rawHtml, url);
        data.title = metadata.title ? metadata.title : await getTitle(rawHtml);
        data.metaTags = await generateMetatags(metadata);
        data.titleTag = getTitleTag(rawHtml);

        let finalContent = data.titleTag + data.metaTags + data.content;
        finalContent = await replaceImages(finalContent);
        const sentimentScore = sentimentAnalysis(text.content);

        const tx = await ar.createTransaction(finalContent);

        if (data.title) { tx.addTag("Title", data.title); }

        tx.addTag("Original URL", url);
        tx.addTag("Sentiment Score", sentimentScore);

        await ar.dispatchTx(tx);

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
