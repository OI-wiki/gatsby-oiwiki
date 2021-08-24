import { Typography } from '@material-ui/core'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Slug from 'github-slugger'

import { useStyles } from './styles'
import { useSetting } from '../../lib/useSetting'
import TocList, { Node, TocListProps } from './Toc'
import { Nullable } from '../../types/common'
import smoothScrollTo from '../../lib/smoothScroll'
import useThrottledOnScroll from '../../lib/useThrottledOnScroll'

export interface TocItem {
  value: string;
  depth: number;
}
export interface TocProps {
  pathname: string;
  toc: TocItem[];
}

const getIDFromHash = (url: string): string => url.substring(1, url.length)

const TocConverter = (items: TocItem[]): Node[] => {
  const minLevel = items.reduce((v, i) => Math.min(v, i.depth), 5)
  const curNode: Nullable<Node>[] = Array.from({ length: 6 }, () => null)
  const data: Node[] = []
  const REF_EXPR = /ref\d+$/
  let index: number

  const slugs = new Slug()
  slugs.reset()

  items.forEach((item) => {
    const level = item.depth - minLevel
    const title = item.value.replace(/<[^>]*>?/gm, '')
    index = level > 0 ? (curNode[level - 1]?.children.length || 0) : data.length
    const newNode: Node = {
      url: `#${slugs.slug(title)}`.replace(REF_EXPR, ''),
      title: title.replace(REF_EXPR, ''),
      level,
      index,
      children: [],
      status: 'collapse',
      element: null,
      parent: null,
      selfElement: null,
    }
    curNode[level] = newNode

    if (level === 0) {
      data.push(newNode)
    } else {
      if (curNode[level - 1]) curNode[level - 1]?.children.push(newNode)
      newNode.parent = curNode[level - 1]
    }
  })
  return data
}

const bindHTMLElement = (toc: Node[]): void => {
  toc.forEach((i, idx, arr) => {
    if (i.element === null) arr[idx].element = document.getElementById(getIDFromHash(i.url))
    if (i.selfElement === null) arr[idx].selfElement = document.getElementById(`toc-${i.url}`)
    if (i.children) bindHTMLElement(i.children)
  })
}

const TocEl: React.FC<TocProps> = (props) => {
  const { toc } = props
  const items = toc
  const classes = useStyles()
  const [settings] = useSetting()

  const newItems = useRef(TocConverter(items))
  const clickedRef = useRef(false)
  const unsetClickedRef = useRef<ReturnType<typeof setTimeout>>()
  const [activeState, setActiveState] = useState<Nullable<Node>>(null)
  const lstScrollTopRef = useRef(0)
  const navRef = useRef<HTMLElement>(null)
  const behavior = settings.animation.smoothScroll ? 'smooth' : 'auto'

  useEffect(() => {
    bindHTMLElement(newItems.current)
  }, [items])

  const nodeSetActive = (node: Nullable<Node>, val: boolean): void => {
    for (let u = node; u !== null; u = u.parent) u.status = val ? 'expanded' : 'collapse'
    if (val && node) node.status = 'active'
  }

  const updateActive = useCallback((state: Nullable<Node>): void => {
    if (activeState?.url === state?.url) return

    nodeSetActive(activeState, false)
    nodeSetActive(state, true)
    setActiveState(state)
  }, [activeState])

  const getNextItem = useCallback((node: Node): Nullable<Node> => {
    const parent = node.parent
    const nextIdx = node.index + 1
    if (parent === null) return newItems.current.length > nextIdx ? newItems.current[nextIdx] : null
    else return parent.children.length > nextIdx ? parent.children[nextIdx] : getNextItem(parent)
  }, [])

  const getLstChild = useCallback((node: Nullable<Node>): Nullable<Node> =>
    (node && node.children.length > 0) ? getLstChild(node.children[node.children.length - 1]) : node, [])

  const getPrevItem = useCallback((node: Node): Nullable<Node> => {
    const parent = node.parent
    const prevIdx = node.index - 1
    return prevIdx >= 0
      ? getLstChild((parent === null ? newItems.current : parent.children)[prevIdx])
      : parent
  }, [getLstChild])

  const activeTocOnScroll = useCallback((): void => {
    if (clickedRef.current) return

    const TO_TOP_DIS = 20
    const pageScrollTop = window?.pageYOffset || document.documentElement.scrollTop
    let node: Nullable<Node> = activeState || newItems.current[0]

    // down dir
    if (pageScrollTop > lstScrollTopRef.current) {
      let minDisNode = node
      while (node) {
        if (node.element && (node.element.getBoundingClientRect().top > TO_TOP_DIS + 20)) {
          break
        } else {
          if (node !== minDisNode) minDisNode = node
          node = node.children.length > 0 ? node.children[0] : getNextItem(node)
        }
      }
      node = minDisNode
    } else {
      while (node) {
        // node may have no ele which caused by error id
        if (!node.element || node.element.getBoundingClientRect().top <= TO_TOP_DIS) {
          break
        } else {
          node = getPrevItem(node)
        }
      }
    }

    if (activeState !== node) {
      updateActive(node)

      // scroll the toc
      if (node?.selfElement) node.selfElement.scrollIntoView({ behavior })
      else navRef.current?.scrollTo({ top: 0, behavior })

      //  change hash
      window.history.replaceState(null, '', node?.url)
    }

    lstScrollTopRef.current = pageScrollTop
  }, [activeState, behavior, getNextItem, getPrevItem, updateActive])

  useThrottledOnScroll(activeTocOnScroll, 100)

  const handleClick: TocListProps['onClick'] = (item) => (event) => {
    event.preventDefault()

    const hash = item.url
    const yDis = (item.element?.getBoundingClientRect().top || 0) + window?.pageYOffset

    if (settings.animation.smoothScroll) {
      smoothScrollTo(yDis)
    } else {
      window?.scrollTo(0, yDis)
    }

    window?.history.pushState(null, '', hash)
    clickedRef.current = true

    // clear last unfinished timeout
    if (unsetClickedRef.current) clearTimeout(unsetClickedRef.current)
    unsetClickedRef.current = setTimeout(() => {
      clickedRef.current = false
    }, 100)

    if (activeState?.url !== hash) {
      updateActive(item)
    }
  }

  useEffect(
    () => {
      return () => {
        clearTimeout(unsetClickedRef.current as never as number)
      }
    },
    [],
  )

  return (
    <nav ref={navRef} className={classes.main} aria-label="pageTOC">
      {newItems.current.length > 0 &&
      <>
        <Typography gutterBottom className={classes.contents}>
          目录
        </Typography>
        <TocList data={newItems.current} onClick={handleClick}/>
      </>
      }
    </nav>
  )
}

const Toc = React.memo(TocEl, (prev, next) => prev.pathname === next.pathname)

export default Toc
