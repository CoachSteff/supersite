/**
 * Custom remark plugin that transforms remark-directive AST nodes
 * into HTML elements with data-directive attributes, so react-markdown
 * can route them to the correct React component.
 */
export default function remarkDirectives() {
  return (tree: any) => {
    visitDirectives(tree);
  };
}

function visitDirectives(node: any) {
  if (
    node.type === 'containerDirective' ||
    node.type === 'leafDirective' ||
    node.type === 'textDirective'
  ) {
    const data = node.data || (node.data = {});
    data.hName = node.type === 'textDirective' ? 'span' : 'div';
    data.hProperties = {
      'data-directive': node.name,
      ...(node.attributes || {}),
    };
  }

  if (node.children) {
    for (const child of node.children) {
      visitDirectives(child);
    }
  }
}
