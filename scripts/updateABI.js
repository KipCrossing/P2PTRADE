import * as fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const abiPath = process.env.ABI_PATH?.toString();

fs.readFile(abiPath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  const abiRegExp = /const _abi = (\[.*?\]) as const;/gs;
  const match = abiRegExp.exec(data);

  if (match && match[1]) {
    const abiString = "export const abi = " + match[1] + " as const;";

    fs.writeFile("src/types/abi.ts", abiString, "utf8", (err) => {
      if (err) {
        console.error("Error writing file:", err);
        return;
      }

      console.log("Successfully written to file.");
    });
  } else {
    console.error("No ABI found in file.");
  }
});
