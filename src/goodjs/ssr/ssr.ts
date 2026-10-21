import { Fragment, isVNode } from '../ui/h.ts';
import type { ChildValue, ComponentFn, VNode, VNodeChild, VNodeProps } from '../ui/types.ts';

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

export function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return '';
  const s = String(str);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface RenderToStringOptions {
  ssrIdPrefix?: string;
}

export function renderToString(
  vnode: VNodeChild,
  options: RenderToStringOptions = {}
): string {
  let idCounter = 0;
  const prefix = options.ssrIdPrefix || 'g';

  function serialize(child: ChildValue): string {
    if (child === null || child === undefined || typeof child === 'boolean') {
      return '';
    }

    if (typeof child === 'string' || typeof child === 'number') {
      return escapeHtml(child);
    }

    if (typeof child === 'function') {
      const evaluated = (child as Function)();
      return serialize(evaluated);
    }

    if (Array.isArray(child)) {
      return child.map(serialize).join('');
    }

    if (isVNode(child)) {
      if (child.tag === Fragment) {
        return child.children.map(serialize).join('');
      }

      if (typeof child.tag === 'function') {
        const componentProps = { ...(child.props || {}), children: child.children };
        const subTree = (child.tag as ComponentFn)(componentProps);
        return serialize(subTree);
      }

      const tagName = String(child.tag).toLowerCase();
      const currentId = `${prefix}-${++idCounter}`;
      const propsString = serializeProps(child.props, currentId);

      if (VOID_ELEMENTS.has(tagName)) {
        return `<${tagName}${propsString} />`;
      }

      if (child.props.dangerouslySetInnerHTML && typeof child.props.dangerouslySetInnerHTML.__html === 'string') {
        return `<${tagName}${propsString}>${child.props.dangerouslySetInnerHTML.__html}</${tagName}>`;
      }

      const innerHtml = child.children.map(serialize).join('');
      return `<${tagName}${propsString}>${innerHtml}</${tagName}>`;
    }

    return escapeHtml(String(child));
  }

  return serialize(vnode);
}

function serializeProps(props: VNodeProps, ssrId: string): string {
  const parts: string[] = [`data-good-id="${ssrId}"`];

  for (const [key, rawVal] of Object.entries(props)) {
    if (key === 'ref' || key === 'key' || key === 'children' || key === 'dangerouslySetInnerHTML') {
      continue;
    }

    if (key.startsWith('on') && typeof rawVal === 'function') {
      continue;
    }

    const val = typeof rawVal === 'function' ? rawVal() : rawVal;

    if (val === false || val === null || val === undefined) {
      continue;
    }

    if (key === 'class' || key === 'className') {
      let classStr = '';
      if (typeof val === 'string') {
        classStr = val;
      } else if (Array.isArray(val)) {
        classStr = val.filter(Boolean).join(' ');
      } else if (typeof val === 'object' && val !== null) {
        classStr = Object.entries(val)
          .filter(([_, active]) => Boolean(active))
          .map(([cls]) => cls)
          .join(' ');
      }
      if (classStr) {
        parts.push(`class="${escapeHtml(classStr)}"`);
      }
      continue;
    }

    if (key === 'style') {
      if (typeof val === 'string' && val.trim()) {
        parts.push(`style="${escapeHtml(val)}"`);
      } else if (typeof val === 'object' && val !== null) {
        const styleStr = Object.entries(val)
          .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
          .join('; ');
        if (styleStr) {
          parts.push(`style="${escapeHtml(styleStr)}"`);
        }
      }
      continue;
    }

    if (val === true) {
      parts.push(escapeHtml(key));
    } else {
      parts.push(`${escapeHtml(key)}="${escapeHtml(val)}"`);
    }
  }

  return parts.length > 0 ? ' ' + parts.join(' ') : '';
}

export interface DocumentOptions {
  title?: string;
  meta?: Record<string, string>[];
  bodyHtml: string;
  initialState?: Record<string, any>;
  clientScriptUrl?: string;
}

export function renderToDocument(options: DocumentOptions): string {
  const title = options.title ? `<title>${escapeHtml(options.title)}</title>` : '';
  const metaTags = (options.meta || [])
    .map((m) => {
      const attrs = Object.entries(m)
        .map(([k, v]) => `${k}="${escapeHtml(v)}"`)
        .join(' ');
      return `<meta ${attrs} />`;
    })
    .join('\n    ');

  const stateScript = options.initialState
    ? `<script id="__GOODJS_STATE__" type="application/json">${JSON.stringify(options.initialState).replace(/</g, '\\u003c')}</script>`
    : '';

  const clientScript = options.clientScriptUrl
    ? `<script type="module" src="${escapeHtml(options.clientScriptUrl)}"></script>`
    : '';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${title}
    ${metaTags}
  </head>
  <body>
    <div id="root">${options.bodyHtml}</div>
    ${stateScript}
    ${clientScript}
  </body>
</html>`;
}
