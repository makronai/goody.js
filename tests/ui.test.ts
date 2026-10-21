import test from 'node:test';
import assert from 'node:assert/strict';
import { h, Fragment, isVNode } from '../src/goodyjs/ui/h.ts';
import { component } from '../src/goodyjs/ui/component.ts';

test('UI: h() creates valid VNode with props and children', () => {
  const node = h('div', { id: 'test', class: 'container' }, 'Hello', 'World');

  assert.equal(isVNode(node), true);
  assert.equal(node.tag, 'div');
  assert.equal(node.props.id, 'test');
  assert.equal(node.props.class, 'container');
  assert.deepEqual(node.children, ['Hello', 'World']);
});

test('UI: h() flattens nested children and skips booleans/null', () => {
  const node = h('ul', null, [
    h('li', null, '1'),
    null,
    false,
    undefined,
    [h('li', null, '2'), [h('li', null, '3')]],
  ]);

  assert.equal(node.children.length, 3);
  assert.equal((node.children[0] as any).tag, 'li');
  assert.equal((node.children[1] as any).tag, 'li');
  assert.equal((node.children[2] as any).tag, 'li');
});

test('UI: Fragment unwraps child nodes', () => {
  const node = h('div', null, h(Fragment, null, 'A', 'B'), 'C');
  assert.deepEqual(node.children, ['A', 'B', 'C']);
});

test('UI: component() produces a callable component with props', () => {
  interface GreetingProps {
    name: string;
  }
  const Greeting = component<GreetingProps>((props) => {
    return h('h1', null, `Welcome, ${props.name}!`);
  });

  const vnode = h(Greeting, { name: 'Ada' });
  assert.equal(typeof vnode.tag, 'function');
  assert.equal(vnode.props.name, 'Ada');
});
