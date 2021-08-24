import { makeStyles } from '@material-ui/core/styles'
import { Link as GatsbyLink } from 'gatsby'
import isAbsoluteURL from 'is-absolute-url'
import React from 'react'
import LinkTooltip from './LinkTooltip'
import path from 'path'
import clsx from 'clsx'
import { GatsbyLinkProps } from 'gatsby-link'
import smoothScrollTo from '../../lib/smoothScroll'
import { useSetting } from '../../lib/useSetting'
import { useMediaQuery, useTheme } from '@material-ui/core'
import { OnClickHandler } from '../../types/common'

const MD_EXPR = /\.(md|markdown|mdtext|mdx)/g
const NO_SLASH_EXPR = /[^/]$/

/**
 * 修复相对路径的页面链接
 *
 * Example 1:
 * - link: `../a/b/c`, path: `/x/y/`, isIndex: `false`
 * - return: `/x/y/../../a/b/c` (`/a/b/c/`)
 *
 * Example 2:
 * - link: `../a/b/c`, path: `/x/y/`, isIndex: `true`
 * - return: `/x/y/../a/b/c` (`/x/a/b/c/`)
 *
 * 实际上不需要当前页面的 path
 */
const linkFix = (link: string, isIndex: boolean): string => {
  if (/^\//.test(link)) return link // absolute path

  let newLink = link.replace(MD_EXPR, '/').replace('index', '')
  if (!isIndex) newLink = '../' + newLink
  if (NO_SLASH_EXPR.test(newLink) && !/#/.test(newLink)) {
    newLink += '/' // append '/' for links, but excluding urls includes `#`.
  }
  return newLink
}

const getAPILink = (link: string, pathname: string, isIndex: boolean): string => {
  let newLink = link.replace(MD_EXPR, '/').replace(/#(.*?)$/, '')
  if (/^[^/]/.test(newLink)) {
    if (!isIndex) newLink = '../' + newLink
    if (NO_SLASH_EXPR.test(pathname)) pathname += '/'
    newLink = path.resolve(pathname, newLink)
  }
  return `https://api.mgt.moe/preview?path=${newLink}`
}

const isRef = (link: string): boolean => /^#/.test(link)

const useStyles = makeStyles((theme) => ({
  link: {
    color: theme.palette.secondary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'none',
      color: theme.palette.secondary.light,
    },
    transition: `color ${250}ms ease-in-out`,
  },
}))

export interface SmartLinkProps<T = any> extends Omit<GatsbyLinkProps<T>, 'to'> {
  /** 指向的链接 */
  to?: string;
  /** to 的别名，两者同时存在时优先使用 href */
  href?: string;
  /** 类名 */
  className?: string;
  /** 是否对站内链接启用 Tooltip 预览，如果为 true 则必须给出 pathname */
  tooltip?: boolean;
  /** 当前页面的 path，用于获取 Tooltip API URL */
  pathname?: string;
  /** 用于 markdown 内链的修复, 设置为 true 可以避免相关影响 */
  isIndex?: boolean;
}

/**
 * 智能链接
 *
 * - 如果是目录则使用原生 a 标签
 * - 如果是 URL 就设为外链
 * - 如果是 markdown 引用（纯哈希）则使用引用
 * - 如果是 path 则根据 tooltip 属性决定是否启用 Tooltip
 */
const SmartLink: React.FC<SmartLinkProps> = (props) => {
  const theme = useTheme()
  const classes = useStyles()
  
  // in case Link is constructed wrongly
  const href = typeof props?.to === 'string' ? props?.to : ''
  const { tooltip = false, isIndex = true, className, pathname, children, ...others } = props
  const classList = clsx(className, classes.link)
  const [settings] = useSetting()
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'))


  if (className && className.search('anchor') > -1) {
    return <a {...others} href={href}>{children}</a>
  } else if (isAbsoluteURL(href)) {
    return (
      <a {...others} href={href} className={classList} target="_blank" rel="noopener noreferrer nofollow">
        {children}
      </a>
    )
  } else if (isRef(href)) {
    const tabHeight = isMdDown ? 64 : 112
    const scrollPadding = 24

    const onClick: OnClickHandler = (e) => {
      e.preventDefault()

      const target = document.getElementById(href.substring(1, href.length))
      const yDis = (target?.getBoundingClientRect().top as number) + window?.pageYOffset - tabHeight - scrollPadding

      if (settings.animation.smoothScroll) {
        smoothScrollTo(yDis)
      } else {
        window?.scrollTo(0, yDis)
      }
    }

    return (
      <GatsbyLink {...others as any} to={href} className={classList} onClick={onClick}>
        {children}
      </GatsbyLink>
    )
  } else if (tooltip) {
    if (!pathname) throw new Error('tooltip 为 true 时必须给出 pathname')
    return (
      <LinkTooltip url={getAPILink(href, pathname, isIndex)} to={linkFix(href, isIndex)}>
        <GatsbyLink {...others as any} to={linkFix(href, isIndex)} className={classList}>
          {children}
        </GatsbyLink>
      </LinkTooltip>
    )
  } else {
    return (
      <GatsbyLink {...others as any} to={linkFix(href, isIndex)} className={classList}>
        {children}
      </GatsbyLink>
    )
  }
}

export { SmartLink }
