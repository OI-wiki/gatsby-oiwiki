import { graphql } from 'gatsby'
import React from 'react'
import Mdx from '../components/Mdx'

export default function MdxDoc({ data, location }) {
  return <Mdx data={data} location={location}/>
}

export const query = graphql`
  query Doc($id: String!) {
    mdx: markdownRemark(id: { eq: $id }) {
      id
      wordCount {
        words
      }
      fields {
        slug
        isIndex
      }
      excerpt
      htmlAst
      headings {
        value
      }
      frontmatter {
        author
        tags
        title
        noMeta
        noComment
        description
      }
      headings {
        depth
        id
        value
      }
      parent {
        ... on File {
          relativePath
          modifiedTime(formatString: "YYYY/MM/DD")
          birthTime(formatString: "")
          changeTime(formatString: "")
        }
      }
    }
  }
`
