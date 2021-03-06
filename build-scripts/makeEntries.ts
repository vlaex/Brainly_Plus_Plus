import { glob } from "glob";

/**
 * Search for files by pattern and make entries for ESBuild build
 * @param {string} src 
 * @param {string} bundleDir 
 * @param {boolean} withSubfolders 
 * @returns {{[x: string]: string[]}} An object of entries
 */
export default (
  src: string,
  bundleDir: string, 
  withSubfolders = false
) => {
  let sourcePath = `./src/${src}`;
  let foundFiles: string[] = glob.sync(sourcePath);

  let entries = {};

  for (let file of foundFiles) {
    let bundlePath = `${bundleDir}`;

    if (withSubfolders) {
      bundlePath += `/${file.match(/(?<=src\/\w+\/)[\w/]+(?=\/\w+\.)/)}`;
    }

    let outFileName = file.match(/(?<=\/)\w+(?=\.)/);
    bundlePath += `/${outFileName}`;

    let entryFiles: string[] = (entries[bundlePath] || []).concat(file);

    entries[bundlePath] = entryFiles;
  }

  return entries;
};