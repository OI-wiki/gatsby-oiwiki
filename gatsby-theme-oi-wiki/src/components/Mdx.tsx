import React, { useCallback, useEffect } from 'react'
import Mark from 'mark.js'
import clsx from 'clsx'

import MDRenderer from '../lib/MDRenderer'
import Details from './Details'
import Summary from './Summary'
import SolutionCodes from './SolutionCodes'
import { SmartLink, SmartLinkProps } from './Link'
import SEO from './Seo'
import StyledLayout from './StyledLayout'
import { DeepRequiredNonNull, DeepWriteable, Nullable } from '../types/common'

export interface MdxProps {
  data: DeepWriteable<DeepRequiredNonNull<GatsbyTypes.DocQuery>>
  location: Location & { state: Nullable<{ searchKey: string }> };
}

const Mdx: React.FC<MdxProps> = ({ data: { mdx }, location }) => {
  const title = mdx.fields.slug === '/' ? '' : mdx.frontmatter.title
  const description = mdx.frontmatter.description || mdx.excerpt
  const authors = mdx.frontmatter.author || ''
  const tags = mdx.frontmatter.tags || []
  const noMeta = mdx.frontmatter.noMeta || false
  const noComment = mdx.frontmatter.noComment || false
  const noEdit = false
  const toc = mdx.toc || null
  const relativePath = mdx.parent.relativePath || ''
  const modifiedTime = mdx.parent.modifiedTime || ''
  const wordCount = mdx.wordCount.words || 0
  const datePublished = mdx.parent.birthTime || ''
  const dateModified = mdx.parent.changeTime || ''
  const isIndex = mdx.fields.isIndex

  const highlightNode = useCallback((tagName: string, isHighlight: boolean): void => {
    if (location.state?.searchKey) {
      const mainNodes = document.getElementsByTagName('main')
      const nodes = mainNodes[0].querySelectorAll(tagName)
      const instance = new Mark(nodes)
      instance[isHighlight ? 'mark' : 'unmark'](
        location.state.searchKey,
        {
          exclude: ['span'],
        })
    }
  }, [location.state?.searchKey])

  useEffect(() => {
    if (location.state?.searchKey) {
      highlightNode('h1', true)
      highlightNode('h2', true)
      highlightNode('h3', true)
      highlightNode('p', true)
      setTimeout(
        () => {
          highlightNode('h1', false)
          highlightNode('h2', false)
          highlightNode('h3', false)
          highlightNode('p', false)
        }, 5000)
    }
  }, [highlightNode, location.state?.searchKey])

  const LinkGetter: React.FC<SmartLinkProps> = (props) =>
    <SmartLink {...props} pathname={location.pathname} isIndex={isIndex} tooltip={true}/>

  const InlineCode: React.FC<{ className: string, [key: string]: any }> = (props) => {
    const { className, children, ...others } = props
    return <code {...others} className={clsx(className, 'inline-code')}>{children}</code>
  }

  const myComponents = {
    details: Details,
    summary: Summary,
    a: LinkGetter,
    inlinecode: InlineCode,
    'ow-codes': SolutionCodes,
  }

  const isWIP = wordCount === 0 || (tags?.findIndex((x: string) => x === 'WIP') >= 0)

  return (
    <StyledLayout
      location={location}
      authors={authors}
      title={title}
      description={description}
      tags={tags}
      toc={toc}
      relativePath={relativePath}
      modifiedTime={modifiedTime}
      noMeta={noMeta}
      noComment={noComment}
      noEdit={noEdit}
      isWIP={isWIP}
    >
      <SEO
        title={title}
        description={description}
        author={authors || 'OI Wiki'}
        tags={tags}
        dateModified={dateModified}
        datePublished={datePublished}
        article/>
      <MDRenderer components={myComponents} htmlAst={mdx.htmlAst}/>
    </StyledLayout>
  )
}

export default Mdx
