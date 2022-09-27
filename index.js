import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url';
import { load } from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fetchWeb = async (url) => {
    try {
        const response = await fetch(url);
        const body = await response.text();
        return body
    }
    catch (err) {
        console.log(err)
    }
}

const crearProfundidadCero = (webName, file) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(__dirname + `/profundidad_0/${webName}`)) {
            fs.mkdirSync(path.join(__dirname + `/profundidad_0/${webName}`)), { recursive: true }
        }

        if (!fs.existsSync(__dirname + `/profundidad_0/${webName}/profundidad_1`)) {
            fs.mkdirSync(path.join(__dirname + `/profundidad_0/${webName}/profundidad_1`)), { recursive: true }
        }

        fs.writeFileSync(path.join(__dirname + `/profundidad_0/${webName}/` + `${webName}.html`), file, (err) => {
            if (err) throw err
            console.log('File created')
        })

        const $ = load(file)
        const links = []

        $('a').each((index, element) => {
            const linkNode = $(element);
            const linkHref = linkNode.attr('href')
            links.push(linkHref)
        })

        links.forEach(async (element, index) => {
            try {
                if (element && element.startsWith('http')) {
                    const file = await fetchWeb(element)

                    // Directory creation
                    fs.mkdirSync(path.join(__dirname + `/profundidad_0/${webName}/profundidad_1/${index}`)), { recursive: true }

                    //  File creation
                    fs.writeFileSync(path.join(__dirname + `/profundidad_0/${webName}/profundidad_1/` + `${index}.html`), file, (err) => {
                        if (err) throw err
                        console.log('File created')
                    })
                }
                resolve(true)
            }
            catch (err) {
                console.log(err)
                reject(false)
            }
        })


    })
}

const crearProfundidadDos = async (webName) => {
    return new Promise((resolve, reject) => {
        try {
            fs.readdirSync(__dirname + `/profundidad_0/${webName}/profundidad_1/`).forEach((el) => {

                if (!el.endsWith('.html')) return

                const htmlFile = fs.readFileSync(path.resolve(`profundidad_0/${webName}/profundidad_1/${el}`), 'utf-8')

                const $ = load(htmlFile)
                const links = []

                $('a').each((index, element) => {
                    const linkNode = $(element);
                    const linkHref = linkNode.attr('href')

                    if (linkHref && linkHref.startsWith('http')) links.push(linkHref)
                })

                links.forEach(async (element, index) => {
                    if (element) {
                        const file = await fetchWeb(element)
                        // File creation
                        fs.writeFileSync(path.join(__dirname + `/profundidad_0/${webName}/profundidad_1/${el.split('.')[0]}/` + `${index}.html`), file, (err) => {
                            if (err) throw err
                            console.log('File created')
                        })
                    }
                })
            })

            resolve(true)
        }
        catch (err) {
            console.log(err)
            reject(false)
        }
    })
}

fetchWeb('https://boodywear.com').then((response) => {
    if (!fs.existsSync('profundidad_0')) {
        fs.mkdirSync('profundidad_0', { recursive: true })
    }

    fs.mkdirSync(path.join(__dirname + '/profundidad_0/boodywear'), { recursive: true })

    crearProfundidadCero('boodywear', response).then(() => {
        crearProfundidadDos('boodywear')
    })

})