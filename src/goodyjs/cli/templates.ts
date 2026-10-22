export interface TemplateFile {
  path: string;
  content: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  files: TemplateFile[];
}

export const TEMPLATES: Record<string, ProjectTemplate> = {
  frontend: {
    id: 'frontend',
    name: 'Frontend Reactive App',
    description: 'Ultra-lightweight reactive client application with GoodyJS signals and native DOM rendering.',
    files: [
      {
        path: 'package.json',
        content: JSON.stringify(
          {
            name: 'my-goodyjs-frontend',
            version: '0.1.0',
            type: 'module',
            scripts: {
              dev: 'good dev',
              build: 'good build',
              preview: 'good preview',
            },
            dependencies: {
              goodyjs: '^0.1.0',
            },
          },
          null,
          2
        ),
      },
      {
        path: 'src/main.ts',
        content: `import { render, component, signal, h } from 'goodyjs';

const Counter = component(() => {
  const count = signal(0);
  return h('div', { class: 'counter-card' },
    h('h1', null, 'GoodyJS Reactive Counter'),
    h('p', null, () => \`Count: \${count()}\`),
    h('button', { onClick: () => count.update(n => n + 1) }, 'Increment')
  );
});

render(h(Counter, null), document.getElementById('root')!);
`,
      },
      {
        path: 'index.html',
        content: `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>GoodyJS App</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>`,
      },
    ],
  },

  backend: {
    id: 'backend',
    name: 'Native Backend Service',
    description: 'High-performance API server with native HTTP primitives and composable middleware (no Express).',
    files: [
      {
        path: 'package.json',
        content: JSON.stringify(
          {
            name: 'my-goodyjs-api',
            version: '0.1.0',
            type: 'module',
            scripts: {
              start: 'good start',
              dev: 'good dev',
            },
            dependencies: {
              goodyjs: '^0.1.0',
            },
          },
          null,
          2
        ),
      },
      {
        path: 'src/server.ts',
        content: `import { createServer, securityHeaders, requestLogger, cors } from 'goodyjs';

const app = createServer();

app.use(securityHeaders());
app.use(requestLogger());
app.use(cors());

app.get('/api/health', (ctx) => ({
  status: 'healthy',
  timestamp: Date.now(),
  uptime: process.uptime(),
}));

app.get('/api/users/:id', (ctx) => ({
  userId: ctx.req.params.id,
  role: 'developer',
}));

await app.listen({ port: 3000 });
console.log('GoodyJS API listening on http://localhost:3000');
`,
      },
    ],
  },

  fullstack: {
    id: 'fullstack',
    name: 'Full-Stack SSR Application',
    description: 'Unified application featuring server-side rendering, hydration, and integrated API endpoints.',
    files: [
      {
        path: 'package.json',
        content: JSON.stringify(
          {
            name: 'my-goodyjs-fullstack',
            version: '0.1.0',
            type: 'module',
            scripts: {
              dev: 'good dev',
              build: 'good build',
              start: 'good start',
            },
            dependencies: {
              goodyjs: '^0.1.0',
            },
          },
          null,
          2
        ),
      },
      {
        path: 'src/app.tsx',
        content: `import { component, signal, h } from 'goodyjs';

export const App = component<{ initialCount?: number }>((props) => {
  const count = signal(props.initialCount || 0);
  return h('main', null,
    h('h1', null, 'GoodyJS Full-Stack'),
    h('p', null, () => \`Active Count: \${count()}\`),
    h('button', { onClick: () => count.update(n => n + 1) }, 'Step Up')
  );
});
`,
      },
      {
        path: 'src/server.ts',
        content: `import { createServer, renderToString, renderToDocument, h } from 'goodyjs';
import { App } from './app.tsx';

const server = createServer();

server.get('/', (ctx) => {
  const bodyHtml = renderToString(h(App, { initialCount: 42 }));
  const fullHtml = renderToDocument({
    title: 'GoodyJS Full-Stack App',
    bodyHtml,
    initialState: { initialCount: 42 },
  });
  ctx.res.html(fullHtml);
});

server.get('/api/data', () => ({ message: 'Hello from GoodyJS Full-Stack' }));

await server.listen({ port: 3000 });
`,
      },
    ],
  },
};
