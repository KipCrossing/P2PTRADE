import dotenv from "dotenv";

import { Web3Storage, getFilesFromPath } from "web3.storage";
import * as fs from "fs";

dotenv.config();

const key = process.env.WEB3_IPFS_KEY?.toString();
const storage = new Web3Storage({ token: key ?? "" });

async function storeFilesFromPath(path) {
  const file = await getFilesFromPath(path);
  const cid = await storage.put(file);
  return cid.toString();
}

async function main() {
  const cid = await storeFilesFromPath("./compiled/index.html");
  console.log(cid);
  console.log(`https://${cid}.ipfs.w3s.link/`);

  // write cid to cid.txt file
  fs.writeFileSync("./compiled/cid.txt", cid);
}

main();
