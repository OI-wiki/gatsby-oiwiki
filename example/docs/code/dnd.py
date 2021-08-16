#不使用递归的归并排序算法
def merge_sort(a):
  n = len(a)
  seg, start = 1, 0
  while seg < n:
      while start < n - seg:
          merge(a, start, start + seg - 1, min(start + seg + seg - 1, n - 1))
          start = start + seg + seg
      seg = seg + seg

#使用递归的归并排序算法
def merge_sort(a, front, end):
  if front >= end:
      return
  mid = front + (end - front) / 2
  merge_sort(a, front, mid)
  merge_sort(a, mid + 1, end)
  merge(a, front, mid, end)
