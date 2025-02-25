import { spawn } from 'child_process';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { script: string } }
) {
  try {
    const data = await request.json();
    const scriptName = params.script;

    // スクリプト名のバリデーション
    const validScripts = [
      'summarizer',
      'tag_suggester',
      'priority_analyzer',
      'task_classifier',
      'task_suggester',
      'task_creator',
    ];

    if (!validScripts.includes(scriptName)) {
      return NextResponse.json(
        { message: '無効なスクリプト名です' },
        { status: 400 }
      );
    }

    // Pythonスクリプトの実行
    const result = await new Promise<Record<string, unknown>>(
      (resolve, reject) => {
        const pythonProcess = spawn('python3', [`python/ai/${scriptName}.py`]);
        let output = '';
        let error = '';

        pythonProcess.stdin.write(JSON.stringify(data));
        pythonProcess.stdin.end();

        pythonProcess.stdout.on('data', (chunk: Buffer) => {
          output += chunk.toString();
        });

        pythonProcess.stderr.on('data', (chunk: Buffer) => {
          error += chunk.toString();
        });

        pythonProcess.on('close', (code) => {
          if (code === 0) {
            try {
              const parsedResult = JSON.parse(output);
              resolve(parsedResult);
            } catch {
              reject(new Error('Pythonスクリプトの出力のパースに失敗しました'));
            }
          } else {
            reject(new Error(`Pythonスクリプトエラー: ${error}`));
          }
        });
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'エラーが発生しました',
      },
      { status: 500 }
    );
  }
}
