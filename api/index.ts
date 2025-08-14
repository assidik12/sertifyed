import { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../src/app";

export default (req: VercelRequest, res: VercelResponse) => {
  app(req, res);
};
