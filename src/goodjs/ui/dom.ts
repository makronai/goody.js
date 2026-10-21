import { effect, createRoot } from '../reactivity/signal.ts';
import type { CleanupFn } from '../reactivity/types.ts';
import { Fragment, isVNode } from './h.ts';
import { runWithLifecycle } from './component.ts';
import type { ChildValue, ComponentFn, LifecycleHooks, RenderResult, VNode, VNodeChild, VNodeProps } from './types.ts';

const SVG_NS = 'http://www.w3.org/2000/svg';
const SVG_TAGS = new Set([
  'svg', 'animate', 'circle', 'clipPath', 'defs', 'desc', 'ellipse',
  'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite',
  'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap',
  'feDistantLight', 'feDropShadow', 'feFlood', 'feFuncA', 'feFuncB',
  'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge',
  'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight',
  'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence',
  'filter', 'foreignObject', 'g', 'image', 'line', 'linearGradient',
  'marker', 'mask', 'metadata', 'path', 'pattern', 'polygon',
  'polyline', 'radialGradient', 'rect', 'stop', 'switch', 'symbol',
  'text', 'textPath', 'tspan', 'use', 'view'
]);

export function render(vnode: VNodeChild, container: HTMLElement | DocumentFragment): () => void {
  const cleanups: CleanupFn[] = [];
  const mounts: (() => void)[] = [];

  const disposeRoot = createRoot((dispose) => {
    cleanups.push(dispose);

    const { node, unmount } = mountChild(vnode, cleanups, mounts);
    container.appendChild(node);
    cleanups.push(unmount);

    for (const mountFn of mounts) {
      try {
        mountFn();
      } catch (err) {
        console.error('[GoodJS UI] Error in onMount hook:', err);
      }
    }

    return () => {
      dispose();
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    };
  });

  return () => {
    for (const c of cleanups.reverse()) {
      try {
        c();
      } catch (e) {
        console.error('[GoodJS UI] Error during unmount:', e);
      }
    }
  };
}

export function hydrate(vnode: VNodeChild, container: HTMLElement): () => void {
  container.innerHTML = '';
  return render(vnode, container);
}

function mountChild(
  child: ChildValue,
  cleanups: CleanupFn[],
  mounts: (() => void)[],
  isSvg = false
): RenderResult {
  if (child === null || child === undefined || typeof child === 'boolean') {
    const comment = document.createComment('goodjs-empty');
    return {
      node: comment,
      unmount: () => {
        if (comment.parentNode) comment.parentNode.removeChild(comment);
      },
    };
  }

  if (typeof child === 'string' || typeof child === 'number') {
    const textNode = document.createTextNode(String(child));
    return {
      node: textNode,
      unmount: () => {
        if (textNode.parentNode) textNode.parentNode.removeChild(textNode);
      },
    };
  }

  if (typeof child === 'function') {
    const marker = document.createComment('goodjs-reactive');
    let currentNode: Node = marker;
    let childUnmount: (() => void) | null = null;

    const disposeEffect = effect(() => {
      const val = (child as Function)();
      if (childUnmount) {
        childUnmount();
        childUnmount = null;
      }

      if (val === null || val === undefined || typeof val === 'boolean') {
        const nextNode = document.createComment('goodjs-empty');
        if (currentNode.parentNode) {
          currentNode.parentNode.replaceChild(nextNode, currentNode);
        }
        currentNode = nextNode;
      } else if (typeof val === 'string' || typeof val === 'number') {
        const nextNode = document.createTextNode(String(val));
        if (currentNode.parentNode) {
          currentNode.parentNode.replaceChild(nextNode, currentNode);
        }
        currentNode = nextNode;
      } else if (isVNode(val)) {
        const rendered = mountChild(val, cleanups, mounts, isSvg);
        childUnmount = rendered.unmount;
        if (currentNode.parentNode) {
          currentNode.parentNode.replaceChild(rendered.node, currentNode);
        }
        currentNode = rendered.node;
      } else if (Array.isArray(val)) {
        const frag = document.createDocumentFragment();
        const unmounts: (() => void)[] = [];
        for (const item of val) {
          const res = mountChild(item, cleanups, mounts, isSvg);
          frag.appendChild(res.node);
          unmounts.push(res.unmount);
        }
        childUnmount = () => {
          for (const u of unmounts) u();
        };
        if (currentNode.parentNode) {
          const parent = currentNode.parentNode;
          parent.replaceChild(frag, currentNode);
          currentNode = marker;
          parent.appendChild(marker);
        }
      }
    });

    cleanups.push(disposeEffect);

    return {
      node: currentNode,
      unmount: () => {
        disposeEffect();
        if (childUnmount) childUnmount();
        if (currentNode.parentNode) {
          currentNode.parentNode.removeChild(currentNode);
        }
      },
    };
  }

  if (Array.isArray(child)) {
    const fragment = document.createDocumentFragment();
    const itemUnmounts: (() => void)[] = [];

    for (const item of child) {
      const { node, unmount } = mountChild(item, cleanups, mounts, isSvg);
      fragment.appendChild(node);
      itemUnmounts.push(unmount);
    }

    return {
      node: fragment,
      unmount: () => {
        for (const u of itemUnmounts) u();
      },
    };
  }

  if (isVNode(child)) {
    if (child.tag === Fragment) {
      const fragment = document.createDocumentFragment();
      const childUnmounts: (() => void)[] = [];
      for (const c of child.children) {
        const res = mountChild(c, cleanups, mounts, isSvg);
        fragment.appendChild(res.node);
        childUnmounts.push(res.unmount);
      }
      return {
        node: fragment,
        unmount: () => {
          for (const u of childUnmounts) u();
        },
      };
    }

    if (typeof child.tag === 'function') {
      const hooks: LifecycleHooks = { mounts: [], cleanups: [] };
      const componentProps = { ...(child.props || {}), children: child.children };

      const subVNode = runWithLifecycle(hooks, () => {
        return (child.tag as ComponentFn)(componentProps);
      });

      mounts.push(...hooks.mounts);
      cleanups.push(...hooks.cleanups);

      const rendered = mountChild(subVNode, cleanups, mounts, isSvg);
      return {
        node: rendered.node,
        unmount: () => {
          for (const c of hooks.cleanups) {
            try {
              c();
            } catch (err) {
              console.error('[GoodJS Component] Cleanup error:', err);
            }
          }
          rendered.unmount();
        },
      };
    }

    const tagName = String(child.tag);
    const elementIsSvg = isSvg || SVG_TAGS.has(tagName);

    const el = elementIsSvg
      ? document.createElementNS(SVG_NS, tagName)
      : document.createElement(tagName);

    const elementCleanups: CleanupFn[] = [];
    applyProps(el, child.props, elementCleanups);

    for (const childItem of child.children) {
      const childResult = mountChild(childItem, cleanups, mounts, elementIsSvg);
      el.appendChild(childResult.node);
      elementCleanups.push(childResult.unmount);
    }

    if (typeof child.props.ref === 'function') {
      child.props.ref(el as any);
    }

    return {
      node: el,
      unmount: () => {
        for (const u of elementCleanups) u();
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      },
    };
  }

  const fallback = document.createTextNode(String(child));
  return {
    node: fallback,
    unmount: () => {
      if (fallback.parentNode) fallback.parentNode.removeChild(fallback);
    },
  };
}

function applyProps(
  el: Element,
  props: VNodeProps,
  cleanups: CleanupFn[]
): void {
  for (const [key, value] of Object.entries(props)) {
    if (key === 'ref' || key === 'key' || key === 'children') {
      continue;
    }

    if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, value as EventListener);
      cleanups.push(() => {
        el.removeEventListener(eventName, value as EventListener);
      });
      continue;
    }

    if (key === 'dangerouslySetInnerHTML' && value && typeof value.__html === 'string') {
      el.innerHTML = value.__html;
      continue;
    }

    if (key === 'class' || key === 'className') {
      if (typeof value === 'function') {
        const dispose = effect(() => {
          const evaluated = (value as Function)();
          setElementClass(el, evaluated);
        });
        cleanups.push(dispose);
      } else {
        setElementClass(el, value);
      }
      continue;
    }

    if (key === 'style') {
      if (typeof value === 'function') {
        const dispose = effect(() => {
          const evaluated = (value as Function)();
          setElementStyle(el as HTMLElement, evaluated);
        });
        cleanups.push(dispose);
      } else {
        setElementStyle(el as HTMLElement, value);
      }
      continue;
    }

    if (key === 'value' || key === 'checked') {
      if (typeof value === 'function') {
        const dispose = effect(() => {
          const evaluated = (value as Function)();
          (el as any)[key] = evaluated ?? '';
        });
        cleanups.push(dispose);
      } else {
        (el as any)[key] = value ?? '';
      }
      continue;
    }

    if (typeof value === 'function') {
      const dispose = effect(() => {
        const evaluated = (value as Function)();
        setElementAttribute(el, key, evaluated);
      });
      cleanups.push(dispose);
    } else {
      setElementAttribute(el, key, value);
    }
  }
}

function setElementClass(el: Element, val: any): void {
  if (typeof val === 'string') {
    el.className = val;
  } else if (Array.isArray(val)) {
    el.className = val.filter(Boolean).join(' ');
  } else if (typeof val === 'object' && val !== null) {
    el.className = Object.entries(val)
      .filter(([_, active]) => Boolean(active))
      .map(([cls]) => cls)
      .join(' ');
  } else {
    el.className = '';
  }
}

function setElementStyle(el: HTMLElement, val: any): void {
  if (!el.style) return;
  if (typeof val === 'string') {
    el.style.cssText = val;
  } else if (typeof val === 'object' && val !== null) {
    for (const [k, v] of Object.entries(val)) {
      (el.style as any)[k] = v ?? '';
    }
  }
}

function setElementAttribute(el: Element, name: string, val: any): void {
  if (val === false || val === null || val === undefined) {
    el.removeAttribute(name);
  } else if (val === true) {
    el.setAttribute(name, '');
  } else {
    el.setAttribute(name, String(val));
  }
}
