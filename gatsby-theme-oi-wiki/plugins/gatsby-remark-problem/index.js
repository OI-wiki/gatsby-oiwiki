'use strict'

const visit = require('unist-util-visit')
const YAML = require('yaml')

module.exports = async function({ markdownAST, files, loadNodeContent, reporter }) {
    const tasks = []

    async function mutate(node, decl) {
        if (typeof decl.solution === 'string') {
            decl.solution = { cpp: decl.solution }
        }

        const ret = []
        const langs = []
        for(const [lang, path] of Object.entries(decl.solution)) {
            const fileNode = files.filter(e => e.relativePath == path)[0]
            if(fileNode === undefined) {
                reporter.warn('no such file ' + path)
                continue
            }
            const value = await loadNodeContent(fileNode)
            ret.push({
                type: 'code',
                lang,
                value,
            })
            langs.push(lang)
        }

        delete node.value
        delete node.lang
        node.type = 'solutioncodes'
        node.children = ret
        node.data = {
            hName: 'ow-codes',
            hProperties: { 'tab-labels': langs.join(',') },
        }
    }

    async function withFile(node, fileNode) {
        const content = await loadNodeContent(fileNode)
        const decl = YAML.parse(content)
        await mutate(node, decl)
    }

    visit(markdownAST, 'code', (node) => {
        if (node?.lang !== 'managed') return

        let decl
        try {
            decl = YAML.parse(node.value)

            if (typeof decl.include === 'string') {
                const fileNode = files.filter(e => e.relativePath == decl.include)[0]
                if (fileNode == undefined) {
                    reporter.warn(`no such file ${decl.include} to include`)
                    return
                }
                tasks.push(withFile(node, fileNode))
                return
            }
            tasks.push(mutate(node, decl))
        } catch(e) {
            reporter.warn(e)
            return
        }
    })
    await Promise.all(tasks)
}
