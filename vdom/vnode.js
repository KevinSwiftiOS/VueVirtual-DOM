class VNode {
  constructor(tagName, props = {}, children = [], text = '') {
    //主要记录一个虚拟元素节点的标签名称，属性，子节点，文本内容，对应
    //的真实虚拟dom中的element元素,render函数是将这个虚拟的元素节点
    //渲染成真正的一个真实dom节点的过程
    this.tagName = tagName;
    this.props = props;
    this.children = children;
    this.text = text;
    this.key = props && props.key;
    var count = 0;
    children.forEach(child => {
      if (child instanceof VNode)
        count += child.count;
      count++;
    });
    this.count = count;
  };
  render () {
    //将虚拟dom生成真实的dom
    let element = document.createElement(this.tagName);
    for (let key in this.props) {
      //设置属性
      element.setAttribute(key, this.props[key]);
    }
    //添加子元素
    for (let child of this.children) {
      if (child instanceof VNode) {
        //递归调用自己 将子元素一个个添加进父元素中
        element.appendChild(child.render());
      }
    }
    if (this.text) {
      element.appendChild(document.createTextNode(this.text));
    }
    this.elm = element;
    console.log(element);
    return element;
  }
}