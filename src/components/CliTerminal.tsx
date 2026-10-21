import React, { useState, useRef, useEffect } from 'react';
import { GoodCli } from '../goodjs/cli/cli.ts';
import { TEMPLATES } from '../goodjs/cli/templates.ts';
import { Terminal, Play, FolderTree, FileCode, CheckCircle2, Copy, Check } from 'lucide-react';

export const CliTerminal: React.FC = () => {
  const [inputVal, setInputVal] = useState('good doctor');
  const [terminalHistory, setTerminalHistory] = useState<
    { command: string; output: string[]; code: number }[]
  >([
    {
      command: 'good doctor',
      output: [
        '🩺 GoodJS System Doctor Audit',
        '----------------------------------------------------',
        '  ✔ Node.js runtime:       v22.23.3 (Compatible >=18.0)',
        '  ✔ Core Dependencies:     0 runtime external dependencies',
        '  ✔ Native Web APIs:       fetch, Request, Response, URL',
        '  ✔ Reactive Core Engine:  Verified (0 memory leaks)',
        '  ✔ Port 3000 Binding:     Ready',
        '  ✔ TypeScript Support:    Strict mode enabled',
        '  ✔ Security Posture:      HTML Auto-Escaping, Onion Middleware',
        '----------------------------------------------------',
        '✨ GoodJS system health: EXCELLENT (All checks passed)',
      ],
      code: 0,
    },
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<'frontend' | 'backend' | 'fullstack'>('fullstack');
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  const executeCommand = async (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    let args = trimmed.split(' ').filter(Boolean);
    if (args[0] === 'good') {
      args = args.slice(1);
    }

    const cli = new GoodCli();
    const result = await cli.run(args);

    setTerminalHistory((prev) => [
      ...prev,
      {
        command: trimmed,
        output: result.stdout.length > 0 ? result.stdout : result.stderr,
        code: result.code,
      },
    ]);

    setInputVal('');
  };

  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  const currentTemplate = TEMPLATES[selectedTemplate];
  const activeFile = currentTemplate.files[selectedFileIndex] || currentTemplate.files[0];

  const quickCommands = [
    'good doctor',
    'good create my-saas --template fullstack',
    'good routes',
    'good build',
    'good check',
    'good help',
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">GoodJS CLI & Scaffolding Engine</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            The official <code className="text-indigo-400 font-mono">good</code> command line interface.
            Zero-overhead project scaffolding, build generation, route discovery, and health diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-mono font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg">
            npx goodjs create
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Terminal */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl min-h-[460px]">
          {/* Terminal Window Header */}
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 text-xs font-mono text-slate-400">bash - goodjs v0.1.0</span>
            </div>
            <button
              onClick={() => setTerminalHistory([])}
              className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              Clear Terminal
            </button>
          </div>

          {/* Terminal Output Area */}
          <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-3 scrollbar-thin">
            {terminalHistory.map((entry, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-emerald-400 font-bold">$</span>
                  <span className="text-white font-semibold">{entry.command}</span>
                </div>
                <div className="pl-4 text-slate-300 space-y-0.5 whitespace-pre-wrap leading-relaxed">
                  {entry.output.map((line, lIdx) => (
                    <div
                      key={lIdx}
                      className={
                        line.includes('✔') || line.includes('✨') || line.includes('🎉')
                          ? 'text-emerald-400'
                          : line.includes('📦') || line.includes('🔍')
                          ? 'text-cyan-300'
                          : line.includes('----------------')
                          ? 'text-slate-600'
                          : 'text-slate-300'
                      }
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div ref={terminalBottomRef} />
          </div>

          {/* Terminal Input Bar */}
          <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
            <span className="text-emerald-400 font-bold font-mono text-sm pl-1">$</span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  executeCommand(inputVal);
                }
              }}
              placeholder="type a command, e.g. good doctor"
              className="flex-1 bg-transparent border-none text-white font-mono text-xs focus:outline-none"
            />
            <button
              onClick={() => executeCommand(inputVal)}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold cursor-pointer"
            >
              Run
            </button>
          </div>

          {/* Quick Command Pills */}
          <div className="p-2.5 bg-slate-950 border-t border-slate-900 flex flex-wrap gap-1.5">
            <span className="text-[10px] text-slate-500 font-mono py-1 pr-1">Try:</span>
            {quickCommands.map((cmd) => (
              <button
                key={cmd}
                onClick={() => {
                  setInputVal(cmd);
                  executeCommand(cmd);
                }}
                className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono text-[10px] transition cursor-pointer"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Scaffolding Template Explorer */}
        <div className="lg:col-span-5 flex flex-col rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200">Official Starter Templates</span>
            </div>
            <div className="flex gap-1 text-[11px]">
              {(['frontend', 'backend', 'fullstack'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setSelectedTemplate(t);
                    setSelectedFileIndex(0);
                  }}
                  className={`px-2 py-0.5 rounded capitalize transition cursor-pointer ${
                    selectedTemplate === t
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-b border-slate-800 bg-slate-900/60">
            <h4 className="text-xs font-bold text-white">{currentTemplate.name}</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">{currentTemplate.description}</p>

            {/* Template File Tabs */}
            <div className="flex gap-1.5 mt-3 overflow-x-auto scrollbar-none">
              {currentTemplate.files.map((file, fIdx) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFileIndex(fIdx)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition cursor-pointer ${
                    selectedFileIndex === fIdx
                      ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  {file.path}
                </button>
              ))}
            </div>
          </div>

          {/* File Content Preview */}
          <div className="p-4 bg-slate-950 flex-1 overflow-x-auto relative">
            <button
              onClick={() => {
                navigator.clipboard.writeText(activeFile.content);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="absolute top-3 right-3 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <pre className="font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
              <code>{activeFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
