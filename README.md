### Ar Content Archiver Server

A web service that parses content into a legible format and stores the content in the Arweave Permaweb. The web service is live [here](http://ec2-3-14-14-6.us-east-2.compute.amazonaws.com:5000). The content is archived at this [589g0kJU0vm2wXS-Fm9h-xjI07gFNn2cS7ILkwaWSNs](https://viewblock.io/arweave/address/589g0kJU0vm2wXS-Fm9h-xjI07gFNn2cS7ILkwaWSNs).

### Api
To archive a web page, you need to send a post request to `/url/extract/submit`  which contains a JSON body with the  `url` provided. It returns `txId` which is the transaction id for the transaction which can be used to build the URL to the resource. The content can be archived into two formats `text` or `html`, to choose a format when archiving content add the query param `contentType` with values `text` or `html` e.g `/url/extract/submit?contentType=html` for html.

### Archived Content
The archived content will contain the following tags:
 - Original URL - The url of the archived content
 - Sentiment Score - result of sentiment analysis
 - Title - Title of the archived content