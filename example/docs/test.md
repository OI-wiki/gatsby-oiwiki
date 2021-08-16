---
title: "测试页"
tags: ["animals", "Chicago", "zoos", "中文", "Chinese", "TEST", "WIP"]
---

[index.md](./index.md)

[https://oi-wiki.org](https://oi-wiki.org)

## H2


```latex
接下来的 $m$ 行中的第 $i$ 行包含两个正整数 $l_i$ 和 $r_i$ ($1\le l_i\le r_i\le n$)，表示第 $i$ 次操作在区间 $[l_i,r_i]$ 上进行。
```


## 中文标题

<h2 id = "index"> 附B：文章检索 </h2>

如果手写了 h2 将不会出现在 toc 里。

content

### H3

content

#### H4

content

##### H5

content

###### H6

**bold** *italic* `inlineCode`

inline math: $a^2+b^2=c^2$

math block:

$$
x=\frac{-b\pm \sqrt{b^2-4ac}}{2a}
$$

```cpp
//Code block
#include <cstdio>

void func(){ }
int main() {
    int a,b;
    func();
    cin>>a>>b;
    cout<<a+b;
    return 0;
}
```

```pseudo
% This quicksort algorithm is extracted from Chapter 7, Introduction 
      % to Algorithms (3rd edition) 
      \begin{algorithm}
      \caption{Quicksort}
      \begin{algorithmic}
      \PROCEDURE{Quicksort}{$A, p, r$}
          \IF{$p < r$} 
              \STATE $q = $ \CALL{Partition}{$A, p, r$}
              \STATE \CALL{Quicksort}{$A, p, q - 1$}
              \STATE \CALL{Quicksort}{$A, q + 1, r$}
          \ENDIF
      \ENDPROCEDURE
      \PROCEDURE{Partition}{$A, p, r$}
          \STATE $x = A[r]$
          \STATE $i = p - 1$
          \FOR{$j = p$ \TO $r - 1$}
              \IF{$A[j] < x$}
                  \STATE $i = i + 1$
                  \STATE exchange
                  $A[i]$ with $A[j]$
              \ENDIF
              \STATE exchange $A[i]$ with $A[r]$
              \STATE $x=\frac{-b\pm \sqrt{b^2-4ac}}{2a}$
          \ENDFOR
      \ENDPROCEDURE
      \end{algorithmic}
      \end{algorithm}
```

!!! warning
    我们平常写的除法是向 0 取整，而这里的右移是向下取整（注意这里的区别），即当数大于等于 0 时两种方法等价，当数小于 0 时会有区别，如： $-1 \div 2 = 0$ , 而 $-1 >> 1 = -1$
 `num * 10 = (num<<1) + (num<<3)`

???+note 题目
    interactor 随机选择一个 $[1,10^9]$ 范围内的整数，你要写一个程序来猜它，你最多可以询问 $50$ 次一个 $[1,10^9]$ 范围内的整数。
    interactor 将返回：
     `1` ：询问与答案相同，你的程序应当停止询问。
     `0` ：询问比答案小。
     `2` ：询问比答案大。

??? a
    ```cpp
    #include <cstdio>
    ```
!!! warning "注"
    注意区分 **基数排序** 与 **桶排序**

!!! note "特别长的标题啊啊啊啊啊啊啊啊啊啊例题[luogu P4322\[JSOI2016\]最佳团体](https://www.luogu.org/problemnew/show/P4322)"
    题目大意：有一棵 $n+1$ 个结点的树，根为 $0$ 号结点。每个结点 $i$ 有一个价值 $p_i$ 和费用 $s_i$ 。你需要选择 $k$ 个结点 $a_1,a_2,\ldots,a_k$ （不包括 $0$ 号结点），使得

    $$
    \frac{\sum_{i=1}^k p_{a_i}}{\sum_{i=1}^k s_{a_i}}
    $$

    最大。你需要保证对于你选择的一个树上结点，它的父亲一定被选中。求出这个最大的比值。

!!! warning `random_shuffle` 已于 C++14 标准中被弃用，于 C++17 标准中被移除。

> Blockquote
>
> Blockquote

1. item 1
2. item 2
3. item 3
4. item 4


- A
- B
- C
- D

### Snippets

--8<-- "docs/test_md.md" 

```cpp
/* clang-format whatever */
--8<-- "docs/test_code.cpp"

/* snip #2 */
--8<-- "docs/test_code.cpp"
```

### problem
**reference**
```managed
include: code/dnd.problem
```

**inline**
```managed
solution:
    cpp: test_code.cpp
```