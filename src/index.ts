import bodyParser from "body-parser";
import cors from "cors";
import errorhandler from "errorhandler";
import express, { Express, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { getHTMLParser, getHTMLParserIds } from "./parsers/html";

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
        const { url, parserType } = req.body;
        const { contentType } = req.query;

        if (contentType === "html") {
            const parser = getHTMLParser(parserType);
            const parsedContent: any = await parser.parseHTML(url);

            res.send({
                html: parsedContent.content
            });
        } else {
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
