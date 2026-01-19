/**
 * Express Route Scanner
 * Scans Express.js route definitions and extracts endpoint metadata
 */

import { parse } from "@typescript-eslint/typescript-estree";
import { TSESTree } from "@typescript-eslint/types";
import { readFileSync } from "fs";
import { join } from "path";
import glob from "fast-glob";
import type { Endpoint, RouteScanner, ScanConfig } from "../openapi-types.js";

export class ExpressRouteScanner implements RouteScanner {
  async scan(projectPath: string, config?: ScanConfig): Promise<Endpoint[]> {
    const patterns = config?.includePatterns || [
      "**/*.ts",
      "**/*.js",
      "**/routes/**/*.ts",
      "**/api/**/*.ts",
    ];

    const files = await glob(patterns, {
      cwd: projectPath,
      ignore: config?.excludePatterns || [
        "**/node_modules/**",
        "**/dist/**",
        "**/build/**",
        "**/*.test.ts",
        "**/*.spec.ts",
        "**/*.d.ts",
      ],
      absolute: true,
    });

    const endpoints: Endpoint[] = [];

    for (const file of files) {
      try {
        const fileEndpoints = await this.scanFile(file);
        endpoints.push(...fileEndpoints);
      } catch (error) {
        console.warn(`Failed to scan file ${file}:`, error);
      }
    }

    return endpoints;
  }

  private async scanFile(filePath: string): Promise<Endpoint[]> {
    const content = readFileSync(filePath, "utf-8");
    const ast = parse(content, {
      loc: true,
      range: true,
      sourceType: "module",
    });

    const endpoints: Endpoint[] = [];

    this.traverseAST(ast, (node) => {
      if (this.isExpressRouteCall(node)) {
        const endpoint = this.extractEndpoint(node, filePath);
        if (endpoint) {
          endpoints.push(endpoint);
        }
      }
    });

    return endpoints;
  }

  private traverseAST(
    node: TSESTree.Node,
    callback: (node: TSESTree.Node) => void
  ): void {
    callback(node);

    // Traverse child nodes
    for (const key in node) {
      if (Object.prototype.hasOwnProperty.call(node, key)) {
        const child = (node as any)[key];
        if (Array.isArray(child)) {
          child.forEach((item) => {
            if (item && typeof item === "object" && item.type) {
              this.traverseAST(item, callback);
            }
          });
        } else if (child && typeof child === "object" && child.type) {
          this.traverseAST(child, callback);
        }
      }
    }
  }

  private isExpressRouteCall(node: TSESTree.Node): node is TSESTree.CallExpression {
    if (node.type !== "CallExpression") {
      return false;
    }

    const { callee } = node;

    // Check for: router.get(), app.post(), etc.
    if (
      callee.type === "MemberExpression" &&
      callee.property.type === "Identifier"
    ) {
      const method = callee.property.name.toLowerCase();
      const validMethods = [
        "get",
        "post",
        "put",
        "patch",
        "delete",
        "head",
        "options",
        "trace",
      ];

      return validMethods.includes(method);
    }

    return false;
  }

  private extractEndpoint(
    node: TSESTree.CallExpression,
    filePath: string
  ): Endpoint | null {
    const callee = node.callee as TSESTree.MemberExpression;
    const method = (callee.property as TSESTree.Identifier).name.toLowerCase() as Endpoint["method"];

    // Extract path from first argument
    const pathArg = node.arguments[0];
    let path = "/";

    if (pathArg) {
      if (pathArg.type === "Literal") {
        path = String(pathArg.value);
      } else if (pathArg.type === "TemplateLiteral") {
        path = this.extractTemplateLiteralValue(pathArg);
      }
    }

    // Extract JSDoc comments
    const leadingComments = this.extractJSDoc(node, filePath);

    // Extract parameters from function signature
    const parameters = this.extractParameters(node);

    // Extract response types
    const responses = this.extractResponses(node);

    const endpoint: Endpoint = {
      path,
      method,
      file: filePath,
      line: node.loc?.start.line || 0,
      description: leadingComments.description,
      summary: leadingComments.summary,
      tags: leadingComments.tags,
      parameters,
      responses,
    };

    return endpoint;
  }

  private extractTemplateLiteralValue(node: TSESTree.TemplateLiteral): string {
    const quasis = node.quasis;
    if (quasis.length === 1 && !quasis[0].value.cooked) {
      return quasis[0].value.raw || "";
    }

    let result = "";
    for (const quasi of quasis) {
      result += quasi.value.cooked || quasi.value.raw || "";
    }

    return result;
  }

  private extractJSDoc(
    node: TSESTree.Node,
    filePath: string
  ): {
    description?: string;
    summary?: string;
    tags: string[];
  } {
    // In a real implementation, we'd extract JSDoc comments from the AST
    // For now, return empty object
    return {
      tags: [],
    };
  }

  private extractParameters(node: TSESTree.CallExpression): Endpoint["parameters"] {
    const parameters: Endpoint["parameters"] = [];

    // Analyze path for parameters (e.g., /users/:id)
    const pathArg = node.arguments[0];
    if (pathArg && pathArg.type === "Literal") {
      const path = String(pathArg.value);
      const pathParamMatches = path.match(/:([a-zA-Z_][a-zA-Z0-9_]*)/g);

      if (pathParamMatches) {
        for (const match of pathParamMatches) {
          const paramName = match.substring(1);
          parameters.push({
            name: paramName,
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          });
        }
      }
    }

    // Extract parameters from handler function
    const handler = node.arguments[node.arguments.length - 1];
    if (handler && (handler.type === "FunctionExpression" || handler.type === "ArrowFunctionExpression")) {
      const params = handler.params;

      // Second parameter is usually (req, res) -> req
      if (params.length >= 1 && params[0].type === "Identifier") {
        const reqParam = params[0];

        // In a real implementation, we'd analyze the Request object type
        // to extract query, body, and header parameters
      }
    }

    return parameters.length > 0 ? parameters : undefined;
  }

  private extractResponses(node: TSESTree.CallExpression): Endpoint["responses"] {
    // Default responses
    return {
      "200": {
        description: "Successful response",
      },
      "400": {
        description: "Bad request",
      },
      "500": {
        description: "Internal server error",
      },
    };
  }
}
