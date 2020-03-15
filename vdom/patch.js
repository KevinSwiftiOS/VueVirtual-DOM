function patch (oldVnode, vnode) {
  //新老虚拟dom节点的比较
  if (isUndef(vnode))
    return;
  if (oldVnode === vnode) //判断同一层树的结构有没有发生变化
    return;
  if (isSameVNode(oldVnode, vnode)) //只有在父元素 例如属性 节点名称一样的情况下再去比较子元素
    patchVnode(oldVnode, vnode);
  else {
    //不是相同节点 老的虚拟dom中的父元素节点找到，随后进行插入，将老的删除，新的添加
    const ParentElm = oldVnode.elm.parentNode;
    createElm(vnode, ParentElm, oldVnode.elm);
    removeVnodes(parentElm, [oldVnode], 0, 0);
  }
};
function isSameVNode (a, b) {
  return (
    a.key === b.key && a.tagName === b.tagName &&
    sameInputType(a, b)
  )
};
function sameInputType (a, b) {
  if (a.tag !== 'input')
    return true;
  return a.props.type == b.props.type;
}

function patchVnode (oldVnode, vnode) {
  //将孩子节点拿到
  var ch = vnode.children;
  var oldCh = oldVnode.children;
  //如果不是文本节点 首先判断父元素是否属性相同，属性相同的情况下再去判断是不是
  //文本元素，如果是文本元素就直接替换掉 否则再比较子元素
  if (isUndef(vnode.text)) {
    if (isDef(ch) && isDef(oldCh)) {
      //就进行新前 新后的一些遍历算法 //如果都有子元素 且子元素和新元素d
      updateChildren(oldVnode.elm, oldCh, ch);
    } else if (isDef(ch)) {
      if (isDef(ch.text)) {
        setTextContent(oldVnode.elm, '');
        addVnodes(oldVnode, ch, 0, ch.length - 1);
      } else if (isDef(oldCh)) {
        removeVnodes(oldVnode.elm, oldCh, 0, oldCh.length - 1);
      }
    }
  } else {
    setTextContent(oldVnode.elm, vnode.text);
  }
}
//进行新前与旧前 新后与旧后 新后与旧前 新前与旧后的比较
function updateChildren (parentElm, oldCh, newCh) {
  let oldStartIdx = 0
  let newStartIdx = 0
  let oldEndIdx = oldCh.length - 1
  let oldStartVnode = oldCh[0]
  let oldEndVnode = oldCh[oldEndIdx]
  let newEndIdx = newCh.length - 1
  let newStartVnode = newCh[0]
  let newEndVnode = newCh[newEndIdx];
  let oldKeyToIndex, idxInOld, vnodeToMove, refElm;
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (isUndef(oldStartVnode)) {
      oldStartVnode = oldCh[++oldStartIdx];
    } else if (isUndef(oldEndVnode)) {
      oldEndVnode = oldCh[--oldEndIdx];
    } else if (isSameVNode(oldStartVnode, newStartVnode)) {
      patchVnode(oldStartVnode, newStartVnode);
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartVnode];
    } else if (isSameVNode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode)
      oldEndVnode = oldCh[--oldEndIdx]
      newEndVnode = newCh[--newEndIdx]
    } else if (isSameVNode(oldStartVnode, newEndVnode)) {
      patchVnode(oldStartVnode, newEndVnode);
      //在老的虚拟节点最后插入
      insertBefore(parentElm, oldStartVnode.elm, oldEndVnode.elm.nextSibling);
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (isSameVNode(oldEndVnode, newStartVnode)) {
      patchVnode(oldEndVnode, newStartVnode)
      insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
      oldEndVnode = oldCh[--oldEndIdx]
      newStartVnode = newCh[++newStartIdx]
    } else {
      //如果上面4个判断都不成了i，如果新树的头有key的话，就直接找有老树的key的节点
      //没有key就将新树的头与现在老树的头与尾一一比较。如果有相同的，就把老树的这个节点移到
      //老树的头前面去，newStartIdx ++；如果没有相同的，就新建这个节点，插到老树的头前，newStartIdx ++。
      if (isUndef(oldKeyToIndex))
        oldKeyToIndex = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
      idxInOld = isDef(newStartVnode.key)
        ? oldKeyToIdx[newStartVnode.key]
        : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
      if (isUndef(idxInOld)) {
        createElm(newStartVnode, parentElm, oldStartVnode.elm)
      } else {
        vnodeToMove = oldCh[idxInOld]
        if (sameVnode(vnodeToMove, newStartVnode)) {
          patchVnode(vnodeToMove, newStartVnode)
          oldCh[idxInOld] = undefined
          insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
        } else {
          createElm(newStartVnode, parentElm, oldStartVnode.elm)
        }
      }
      newStartVnode = newCh[++newStartIdx]
    }
  }
  //说明老的遍历完了 要讲新的dom中剩余的节点都加进去
  if (oldStartIdx > oldEndIdx) {
    refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
    addVnodes(parentElm, newCh, newStartIdx, newEndIdx);

  } else if (newStartIdx > newEndIdx) {
    //说明新的遍历完了 老的节点要都删除
    removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
  }

}

function setTextContent (elm, content) {
  elm.textContent = content;
}
function addVnodes (parentElm, vnodes, startIdx, endIdx) {
  for (; startIdx <= endIdx; ++startIdx) {
    createElm(vnodes[startIdx], parentElm, null)
  }
}
function removeVnodes (parentElm, vnodes, startIdx, endIdx) {
  for (let i = startIdx; i <= endIdx; i++) {
    var ch = vnodes[i]
    if (ch) {
      parentElm.removeChild(vnodes[i].elm)
    }
  }
}

function createElm (vnode, parentElm, afterElm) {
  let element = vnode.render()
  vnode.elm = element;
  if (isDef(afterElm)) {
    insertBefore(parentElm, element, afterElm)
  } else {
    parentElm.appendChild(element)
  }
  return element;
}
function insertBefore (parentElm, element, afterElm) {
  parentElm.insertBefore(element, afterElm)
}


function isUndef (v) {
  return v === undefined || v === null || v === ''
}
function isDef (v) {
  return v !== undefined && v !== null && v !== '';
}