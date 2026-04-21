#!/usr/bin/env node
/**
 * Claude Code 架构分析工具
 * 自动分析源码结构并生成报告
 */

import * as fs from 'fs';
import * as path from 'path';

interface AnalysisResult {
  projectName: string;
  timestamp: string;
  structure: {
    directories: string[];
    filesByType: Record<string, string[]>;
    totalFiles: number;
    totalLines: number;
  };
  keyFiles: Array<{
    path: string;
    size: number;
    lines: number;
    description: string;
  }>;
  recommendations: string[];
}

export class ArchitectureAnalyzer {
  private rootDir: string;
  private result: AnalysisResult;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
    this.result = {
      projectName: path.basename(rootDir),
      timestamp: new Date().toISOString(),
      structure: {
        directories: [],
        filesByType: {},
        totalFiles: 0,
        totalLines: 0,
      },
      keyFiles: [],
      recommendations: [],
    };
  }

  async analyze(): Promise<AnalysisResult> {
    console.log(`🔍 Analyzing architecture in: ${this.rootDir}`);
    
    await this.scanDirectory(this.rootDir);
    this.identifyKeyFiles();
    this.generateRecommendations();
    
    return this.result;
  }

  private async scanDirectory(dir: string, relativePath = ''): Promise<void> {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const entryRelativePath = path.join(relativePath, entry.name);

      if (entry.isDirectory()) {
        if (!this.shouldIgnore(entry.name)) {
          this.result.structure.directories.push(entryRelativePath);
          await this.scanDirectory(fullPath, entryRelativePath);
        }
      } else if (entry.isFile()) {
        this.analyzeFile(fullPath, entryRelativePath);
      }
    }
  }

  private shouldIgnore(name: string): boolean {
    const ignoreList = [
      'node_modules', '.git', 'dist', 'build', '.next',
      'coverage', '.DS_Store', 'thumbs.db',
    ];
    return ignoreList.includes(name) || name.startsWith('.');
  }

  private analyzeFile(fullPath: string, relativePath: string): void {
    const ext = path.extname(relativePath) || 'no-extension';
    const normalizedExt = ext.startsWith('.') ? ext.slice(1) : ext;

    if (!this.result.structure.filesByType[normalizedExt]) {
      this.result.structure.filesByType[normalizedExt] = [];
    }
    this.result.structure.filesByType[normalizedExt].push(relativePath);
    this.result.structure.totalFiles++;

    // 统计行数
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n').length;
      this.result.structure.totalLines += lines;
    } catch {
      // 忽略二进制文件
    }
  }

  private identifyKeyFiles(): void {
    const keyPatterns = [
      { pattern: /main\.(ts|tsx|js|jsx)$/, desc: '主程序入口' },
      { pattern: /index\.(ts|tsx|js|jsx)$/, desc: '模块入口' },
      { pattern: /cli\.(ts|tsx|js|jsx)$/, desc: 'CLI入口' },
      { pattern: /package\.json$/, desc: '项目配置' },
      { pattern: /tsconfig\.json$/, desc: 'TypeScript配置' },
      { pattern: /README/, desc: '项目文档' },
    ];

    const allFiles = Object.values(this.result.structure.filesByType).flat();

    for (const file of allFiles) {
      for (const { pattern, desc } of keyPatterns) {
        if (pattern.test(file)) {
          const fullPath = path.join(this.rootDir, file);
          try {
            const stats = fs.statSync(fullPath);
            const content = fs.readFileSync(fullPath, 'utf-8');
            this.result.keyFiles.push({
              path: file,
              size: stats.size,
              lines: content.split('\n').length,
              description: desc,
            });
          } catch {
            // 忽略
          }
          break;
        }
      }
    }

    // 按大小排序
    this.result.keyFiles.sort((a, b) => b.size - a.size);
  }

  private generateRecommendations(): void {
    const { structure, keyFiles } = this.result;

    if (structure.totalFiles > 1000) {
      this.result.recommendations.push(
        '⚠️ 项目文件较多，考虑模块化拆分'
      );
    }

    if (structure.totalLines > 100000) {
      this.result.recommendations.push(
        '⚠️ 代码量较大，建议添加架构文档'
      );
    }

    const tsFiles = structure.filesByType['ts'] || [];
    const tsxFiles = structure.filesByType['tsx'] || [];
    if (tsFiles.length + tsxFiles.length > 0) {
      this.result.recommendations.push(
        '✅ TypeScript 项目，类型安全良好'
      );
    }

    const hasTests = Object.keys(structure.filesByType).some(ext => 
      ext.includes('test') || ext.includes('spec')
    ) || structure.directories.some(d => d.includes('test'));

    if (!hasTests) {
      this.result.recommendations.push(
        '💡 建议添加测试目录和测试文件'
      );
    }

    if (this.result.recommendations.length === 0) {
      this.result.recommendations.push('✅ 项目结构良好');
    }
  }

  generateReport(outputPath?: string): string {
    const report = this.formatReport();
    
    if (outputPath) {
      fs.writeFileSync(outputPath, report, 'utf-8');
      console.log(`📄 Report saved to: ${outputPath}`);
    }

    return report;
  }

  private formatReport(): string {
    const { projectName, timestamp, structure, keyFiles, recommendations } = this.result;

    return `# ${projectName} - 架构分析报告

生成时间: ${new Date(timestamp).toLocaleString()}

---

## 📊 项目概览

| 指标 | 数值 |
|------|------|
| 总文件数 | ${structure.totalFiles} |
| 总代码行数 | ${structure.totalLines.toLocaleString()} |
| 目录数 | ${structure.directories.length} |

---

## 📁 文件类型分布

${Object.entries(structure.filesByType)
  .sort(([, a], [, b]) => b.length - a.length)
  .map(([type, files]) => `- **${type}**: ${files.length} 文件`)
  .join('\n')}

---

## 🔑 关键文件

${keyFiles.slice(0, 20).map(f => `
### ${f.path}
- 大小: ${(f.size / 1024).toFixed(1)} KB
- 行数: ${f.lines.toLocaleString()}
- 描述: ${f.description}
`).join('\n')}

---

## 💡 建议

${recommendations.map(r => `- ${r}`).join('\n')}

---

*此报告由 Claude Code 架构分析工具自动生成*
`;
  }
}

// CLI 入口
if (require.main === module) {
  const args = process.argv.slice(2);
  const targetDir = args[0] || process.cwd();
  const outputPath = args[1];

  const analyzer = new ArchitectureAnalyzer(targetDir);
  analyzer.analyze().then(() => {
    const report = analyzer.generateReport(outputPath);
    if (!outputPath) {
      console.log(report);
    }
  }).catch(err => {
    console.error('❌ Analysis failed:', err);
    process.exit(1);
  });
}

export { ArchitectureAnalyzer };
