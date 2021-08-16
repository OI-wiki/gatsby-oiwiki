'use strict'

const SNIPPET_TOKEN = '--8<-- '

function resolvePath (snip) {
    let str = snip.substring(SNIPPET_TOKEN.length)
    if((str.startsWith('"') && str.endsWith('"')) || 
       (str.startsWith('\'') && str.endsWith('\''))) {
        str = str.substring(1, str.length - 1)
    }
    return str.replace(/^docs\//, '')
}

module.exports = {}
module.exports.mutateSource = async function({ markdownNode, files, loadNodeContent, reporter }) {
    const contents = markdownNode.internal.content.split('\n')
    for (const i in contents) {
        const val = contents[i].trim()
        if (val.startsWith(SNIPPET_TOKEN)) {
            const path = resolvePath(val)
            const fileNode = files.filter(e => e.relativePath == path)[0]
            if (fileNode == undefined) {
                reporter.warn(`snippet: no such file ${path} to include`)
                continue
            }
            contents[i] = await loadNodeContent(fileNode)
        }
    }
    markdownNode.internal.content = contents.join('\n')
}
