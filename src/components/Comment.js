import React from 'react'
import Comment from './commentSystem/index.tsx'

function CommentSystem ({ title }) {
  return (
    <Comment
      id={`${title} - OI Wiki`}
      owner="OI-wiki"
      repo="gitment"
      admin={ ['24OI-bot'] }
      clientID={process.env.GATSBY_GITHUB_CLIENT_ID}
      clientSecret={process.env.GATSBY_GITHUB_CLIENT_SECRET}
    />
  )
}

export default CommentSystem
