/**
 * TypeScript Parser and AST Utilities
 * Parse TypeScript/JavaScript code and generate AST using TypeScript Compiler API
 *
 * References:
 * - Using the Compiler API: https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API
 * - TypeScript Compiler API 2025: https://javascript.plainenglish.io/7-hidden-typescript-compiler-apis-every-developer-should-know-for-custom-development-tools-0593a343f403
 */

import * as ts from 'typescript';
import { JudgeLogger } from './logger';
import { ASTAnalysisContext, FunctionInfo } from './types';

// Node kinds that represent control flow structures
const CONTROL_FLOW_KINDS = new Set([
  ts.SyntaxKind.IfStatement,
  ts.SyntaxKind.ForStatement,
  ts.SyntaxKind.ForInStatement,
  ts.SyntaxKind.ForOfStatement,
  ts.SyntaxKind.WhileStatement,
  ts.SyntaxKind.DoStatement,
  ts.SyntaxKind.CaseClause,
  ts.SyntaxKind.CatchClause,
]);

// Node kinds that add cyclomatic complexity
const COMPLEXITY_DECISION_KINDS = new Set([
  ...CONTROL_FLOW_KINDS,
  ts.SyntaxKind.ConditionalExpression, // ternary operator
]);

export class TypeScriptParser {
  private logger: JudgeLogger;

  constructor(logger: JudgeLogger) {
    this.logger = logger;
  }

  /**
   * Parse code string into TypeScript SourceFile
   */
  parseCode(filePath: string, code: string): ts.SourceFile | null {
    try {
      this.logger.debug('parser', `Parsing file: ${filePath}`);

      const sourceFile = ts.createSourceFile(
        filePath,
        code,
        ts.ScriptTarget.Latest,
        true // setParentNodes - important for traversal
      );

      const lineCount = sourceFile.getText().split('\n').length;
      this.logger.debug('parser', `Successfully parsed ${filePath}`, {
        lineCount,
        nodeCount: this.countNodes(sourceFile),
      });

      return sourceFile;
    } catch (error) {
      this.logger.error('parser', `Failed to parse ${filePath}`, error);
      return null;
    }
  }

  /**
   * Count total nodes in AST (for debugging)
   */
  private countNodes(node: ts.Node): number {
    let count = 1;
    ts.forEachChild(node, (child) => {
      count += this.countNodes(child);
    });
    return count;
  }

  /**
   * Extract code snippet by location
   */
  extractCodeSnippet(sourceFile: ts.SourceFile, start: number, end: number): string {
    const fullText = sourceFile.getFullText();
    return fullText.substring(start, end);
  }

  /**
   * Get line and column from position
   */
  getLineAndColumn(sourceFile: ts.SourceFile, position: number): { line: number; column: number } {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(position);
    return { line: line + 1, column: character + 1 };
  }

  /**
   * Traverse AST and visit all nodes
   */
  traverseAST(sourceFile: ts.SourceFile, visitor: (node: ts.Node) => void): void {
    function visit(node: ts.Node) {
      visitor(node);
      ts.forEachChild(node, visit);
    }
    visit(sourceFile);
  }

  /**
   * Extract all function declarations and expressions from source file
   */
  extractFunctions(sourceFile: ts.SourceFile): FunctionInfo[] {
    const functions: FunctionInfo[] = [];

    this.traverseAST(sourceFile, (node) => {
      if (
        ts.isFunctionDeclaration(node) ||
        ts.isFunctionExpression(node) ||
        ts.isArrowFunction(node) ||
        ts.isMethodDeclaration(node)
      ) {
        const info = this.analyzeFunction(sourceFile, node);
        if (info) {
          functions.push(info);
        }
      }
    });

    return functions;
  }

  /**
   * Analyze a function node and extract metrics
   */
  private analyzeFunction(sourceFile: ts.SourceFile, node: ts.Node): FunctionInfo | null {
    let name = 'anonymous';
    let parameters = 0;

    // Extract function name
    if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
      name = node.name?.getText() || 'anonymous';
      parameters = node.parameters.length;
    } else if (ts.isFunctionExpression(node)) {
      name = node.name?.getText() || 'anonymous';
      parameters = node.parameters.length;
    } else if (ts.isArrowFunction(node)) {
      name = 'arrow';
      parameters = node.parameters.length;
    }

    // Get location
    const start = node.getStart(sourceFile);
    const end = node.getEnd();
    const startPos = this.getLineAndColumn(sourceFile, start);
    const endPos = this.getLineAndColumn(sourceFile, end);

    // Calculate metrics
    const complexity = this.calculateCyclomaticComplexity(node);
    const cognitiveComplexity = this.calculateCognitiveComplexity(node);
    const nestingDepth = this.calculateNestingDepth(node);
    const length = endPos.line - startPos.line + 1;

    return {
      name,
      startLine: startPos.line,
      startColumn: startPos.column,
      endLine: endPos.line,
      endColumn: endPos.column,
      complexity,
      cognitiveComplexity,
      nestingDepth,
      parameterCount: parameters,
      length,
    };
  }

  /**
   * Calculate cyclomatic complexity of a function
   * Based on decision points: if, for, while, case, catch, conditional expressions
   *
   * Reference: https://en.wikipedia.org/wiki/Cyclomatic_complexity
   */
  private calculateCyclomaticComplexity(functionNode: ts.Node): number {
    let complexity = 1; // Base complexity

    const visitor = (node: ts.Node) => {
      if (COMPLEXITY_DECISION_KINDS.has(node.kind)) {
        complexity++;
      }

      // Logical operators && and || also add complexity
      if (ts.isBinaryExpression(node)) {
        if (
          node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
          node.operatorToken.kind === ts.SyntaxKind.BarBarToken
        ) {
          complexity++;
        }
      }
    };

    this.traverseFunctionBody(functionNode, visitor);

    return complexity;
  }

  /**
   * Calculate cognitive complexity
   * Measures how difficult code is to understand for humans
   *
   * Reference: https://www.sonarsource.com/resources/cognitive-complexity.html
   */
  private calculateCognitiveComplexity(functionNode: ts.Node): number {
    let complexity = 0;
    let nestingLevel = 0;

    const visitor = (node: ts.Node) => {
      // Increment for nesting structures
      if (CONTROL_FLOW_KINDS.has(node.kind)) {
        complexity += 1 + nestingLevel;
        nestingLevel++;
      }

      // Binary logical operators
      if (ts.isBinaryExpression(node)) {
        if (
          node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
          node.operatorToken.kind === ts.SyntaxKind.BarBarToken
        ) {
          complexity++;
        }
      }
    };

    this.traverseFunctionBodyWithNesting(functionNode, visitor, () => nestingLevel);

    return complexity;
  }

  /**
   * Calculate maximum nesting depth of a function
   */
  private calculateNestingDepth(functionNode: ts.Node): number {
    let maxDepth = 0;
    let currentDepth = 0;

    const visitor = (node: ts.Node) => {
      const isNesting = this.isNestingStructure(node.kind);

      if (isNesting && node.kind !== ts.SyntaxKind.Block) {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      }
    };

    const onExit = (node: ts.Node) => {
      const isNesting = this.isNestingStructure(node.kind);
      if (isNesting && node.kind !== ts.SyntaxKind.Block) {
        currentDepth--;
      }
    };

    this.traverseFunctionBodyWithExit(functionNode, visitor, onExit);

    return maxDepth;
  }

  /**
   * Check if a node kind represents a nesting structure
   */
  private isNestingStructure(kind: ts.SyntaxKind): boolean {
    return kind === ts.SyntaxKind.Block || CONTROL_FLOW_KINDS.has(kind);
  }

  /**
   * Traverse function body with a visitor
   * Handles different function types (declaration, expression, arrow, method)
   */
  private traverseFunctionBody(functionNode: ts.Node, visitor: (node: ts.Node) => void): void {
    const body = this.getFunctionBody(functionNode);
    if (body) {
      if (ts.isBlock(body)) {
        ts.forEachChild(body, visitor);
      } else {
        visitor(body);
      }
    }
  }

  /**
   * Traverse function body with nesting level tracking
   */
  private traverseFunctionBodyWithNesting(
    functionNode: ts.Node,
    visitor: (node: ts.Node) => void,
    getNestingLevel: () => number
  ): void {
    const body = this.getFunctionBody(functionNode);
    if (!body) return;

    const visit = (node: ts.Node) => {
      visitor(node);

      const prevLevel = getNestingLevel();
      ts.forEachChild(node, visit);
    };

    if (ts.isBlock(body)) {
      ts.forEachChild(body, visit);
    } else {
      visit(body);
    }
  }

  /**
   * Traverse function body with enter/exit callbacks
   */
  private traverseFunctionBodyWithExit(
    functionNode: ts.Node,
    onEnter: (node: ts.Node) => void,
    onExit: (node: ts.Node) => void
  ): void {
    const body = this.getFunctionBody(functionNode);
    if (!body) return;

    const visit = (node: ts.Node) => {
      onEnter(node);
      ts.forEachChild(node, visit);
      onExit(node);
    };

    if (ts.isBlock(body)) {
      ts.forEachChild(body, visit);
    } else {
      visit(body);
    }
  }

  /**
   * Get the body node from a function declaration/expression/arrow/method
   */
  private getFunctionBody(functionNode: ts.Node): ts.Node | null {
    if (
      ts.isFunctionDeclaration(functionNode) ||
      ts.isFunctionExpression(functionNode) ||
      ts.isMethodDeclaration(functionNode)
    ) {
      return functionNode.body || null;
    } else if (ts.isArrowFunction(functionNode)) {
      return functionNode.body || null;
    }
    return null;
  }
}
