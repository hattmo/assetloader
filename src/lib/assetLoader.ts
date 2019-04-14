import https from 'https';
import { promises as fsp } from 'fs';
import fs from 'fs'

const workingDir = process.cwd();
export default (async () => {
    const data = await fsp.readFile(`${workingDir}/package.json`);
    const conf = JSON.parse(data.toString('utf-8'));
    if (conf.assets && conf.assets.constructor === Array) {
        try {
            createAssetDirectory()
        } catch (error) {
            console.error('Failed to create asset directory')
            return
        }
        (conf.assets as Array<string>).forEach((url) => {
            const fileName = getFileName(url)
            https.get(url, (res) => {
                const writeStream = fs.createWriteStream(`${workingDir}/assets/${fileName}`, { encoding: 'binary' })
                res.pipe(writeStream)
            })
        })
    } else {
        console.error('No assets field declared in package.json')
    }
})()

async function createAssetDirectory() {
    try {
        await fsp.access(`${workingDir}/assets/`, fs.constants.W_OK);
    } catch (error) {
        fsp.mkdir(`${workingDir}/assets/`)
    }
}

function getFileName(inurl: String): String {
    let url = inurl;
    url = url.substring(0, (url.indexOf('#') === -1) ? url.length : url.indexOf('#'));
    url = url.substring(0, (url.indexOf('?') === -1) ? url.length : url.indexOf('?'));
    url = url.substring(url.lastIndexOf('/') + 1, url.length);
    return url;
}