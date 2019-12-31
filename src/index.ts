import bodyParser from "body-parser";
import cors from "cors";
import errorhandler from "errorhandler";
import express, { Express, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { getHTMLParser, getHTMLParserIds } from "./parsers/html";
import { getTextParser } from "./parsers/text";

const app: Express = express();
const port: number = 5000;

app.use(bodyParser());
app.use(morgan("combined"));
app.use(cors());

if (process.env.NODE_ENV === "development") {
    app.use(errorhandler());
}

app.post("/url/extract", async (req: Request, res: Response, next: NextFunction) => {
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

app.get("/parsers", (req: Request, res: Response) => {
    res.send({
        htmlParsers: getHTMLParserIds()
    });
});

app.listen(port);
