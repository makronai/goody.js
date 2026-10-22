import type { ChildValue, ComponentFn, VNode, VNodeProps } from './types.ts';

export const Fragment = Symbol('GoodyJS.Fragment');

export function h(
  tag: string | ComponentFn | symbol,
  props?: VNodeProps | null,
  ...children: ChildValue[]
): VNode {
  const normalizedProps: VNodeProps = { ...(props || {}) };
  const rawChildren = children.length > 0 ? children : normalizedProps.children || [];
  const flattenedChildren = flattenChildren(rawChildren);

  const key = normalizedProps.key;
  delete normalizedProps.key;
  delete normalizedProps.children;

  return {
    tag,
    props: normalizedProps,
    children: flattenedChildren,
    key,
    _isVNode: true,
  };
}

export function jsx(tag: string | ComponentFn | symbol, props: VNodeProps, key?: string | number): VNode {
  const { children, ...rest } = props || {};
  const childArray = children !== undefined ? (Array.isArray(children) ? children : [children]) : [];
  return {
    tag,
    props: rest,
    children: flattenChildren(childArray),
    key,
    _isVNode: true,
  };
}

export const jsxs = jsx;

export function isVNode(value: unknown): value is VNode {
  return typeof value === 'object' && value !== null && (value as any)._isVNode === true;
}

function flattenChildren(children: ChildValue[]): ChildValue[] {
  const result: ChildValue[] = [];

  for (const child of children) {
    if (child === null || child === undefined || typeof child === 'boolean') {
      continue;
    }
    if (Array.isArray(child)) {
      result.push(...flattenChildren(child));
    } else if (isVNode(child) && child.tag === Fragment) {
      result.push(...flattenChildren(child.children));
    } else {
      result.push(child);
    }
  }

  return result;
}
