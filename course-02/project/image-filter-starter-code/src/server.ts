import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { isUri } from "valid-url";
import { filterImageFromURL, deleteLocalFiles } from "./util/util";

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req: Request, res: Response) => {
    try {
      return res.status(200).send(`welcome to the image filter service`);
    } catch (e) {
      console.log(e);
      return res.status(500);
    }
  });

  app.get("/filteredimage", async (req: Request, res: Response) => {
    try {
      const imageURL = req.query.image_url;
      if (!imageURL || !isUri(imageURL)) {
        return res.status(400).send(`a valid image url is required`);
      }
      const filteredPath = await filterImageFromURL(imageURL);
      if (!filteredPath) {
        return res.status(400).send(`an error`);
      }
      res.status(200).sendFile(filteredPath, () => {
        deleteLocalFiles([filteredPath]);
      });
    } catch (e) {
      console.log(e);
      return res.status(500);
    }
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
