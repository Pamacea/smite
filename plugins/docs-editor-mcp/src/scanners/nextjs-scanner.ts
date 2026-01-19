/**
 * Next.js Route Scanner
 * Scans Next.js App Router and Pages Router for API routes
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname, basename } from "path";
import glob from "fast-glob";
import { parse } from "@typescript-eslint/typescript-estree";
import { TSESTree } from "@typescript-eslint/types";
import type { Endpoint, RouteScanner, ScanConfig } from "../openapi-types.js";

export class NextJSRouteScanner implements RouteScanner {
  async scan(projectPath: string, config?: ScanConfig): Promise<Endpoint[]> {
    const endpoints: Endpoint[] = [];

    // Scan App Router (app directory)
    const appDir = join(projectPath, "app");
    if (existsSync(appDir)) {
      const appEndpoints = await this.scanAppRouter(appDir, projectPath);
      endpoints.push(...appEndpoints);
    }

    // Scan Pages Router (pages/api directory)
    const pagesApiDir = join(projectPath, "pages/api");
    if (existsSync(pagesApiDir)) {
      const pagesEndpoints = await this.scanPagesRouter(pagesApiDir, projectPath);
      endpoints.push(...pagesEndpoints);
    }

    return endpoints;
  }

  private async scanAppRouter(appDir: string, projectPath: string): Promise<Endpoint[]> {
    // Find all route.ts files in app directory
    const routeFiles = await glob("**/route.ts", {
      cwd: appDir,
      absolute: true,
    });

    const endpoints: Endpoint[] = [];

    for (const file of routeFiles) {
      const fileEndpoints = await this.scanAppRouteFile(file, appDir);
      endpoints.push(...fileEndpoints);
    }

    return endpoints;
  }

  private async scanAppRouteFile(filePath: string, appDir: string): Promise<Endpoint[]> {
    const content = readFileSync(filePath, "utf-8");
    const ast = parse(content, {
      loc: true,
      range: true,
      sourceType: "module",
    });

    const endpoints: Endpoint[] = [];

    // Extract route path from file path
    const relativePath = filePath.substring(appDir.length);
    const routePath = this.convertAppFilePathToRoute(relativePath);

    // Find exported HTTP method handlers
    const methodHandlers = this.extractMethodHandlers(ast);

    for (const [method, handler] of Object.entries(methodHandlers)) {
      const endpoint: Endpoint = {
        path: routePath,
        method: method.toLowerCase() as Endpoint["method"],
        file: filePath,
        line: handler.loc?.start.line || 0,
        description: this.extractHandlerDescription(handler),
        parameters: this.extractNextJSParameters(routePath, method),
        responses: this.extractNextJSResponses(handler),
      };

      endpoints.push(endpoint);
    }

    return endpoints;
  }

  private convertAppFilePathToRoute(filePath: string): string {
    // Remove /route.ts and convert to URL path
    const routePath = filePath
      .replace(/\/route\.ts$/, "")
      .replace(/\/route\.js$/, "")
      .replace(/\([^)]+\)/g, "") // Remove route groups
      .replace(/\/\[\.\.\.[^\]]+\]/g, "/*") // Catch-all segments
      .replace(/\/\[[^\]]+\]/g, "/:id"); // Dynamic segments

    return routePath || "/";
  }

  private extractMethodHandlers(ast: TSESTree.Program): Record<string, TSESTree.FunctionDeclaration | TSESTree.Identifier> {
    const handlers: Record<string, TSESTree.FunctionDeclaration | TSESTree.Identifier> = {};

    for (const node of ast.body) {
      if (
        node.type === "ExportNamedDeclaration" &&
        node.declaration &&
        (node.declaration.type === "FunctionDeclaration" ||
          node.declaration.type === "VariableDeclaration")
      ) {
        let name: string | undefined;
        let declaration: TSESTree.Node | undefined;

        if (node.declaration.type === "FunctionDeclaration") {
          name = node.declaration.id?.name;
          declaration = node.declaration;
        } else if (node.declaration.type === "VariableDeclaration") {
          const declarator = node.declaration.declarations[0];
          if (declarator.id.type === "Identifier") {
            name = declarator.id.name;
            declaration = declarator.init || undefined;
          }
        }

        if (name && ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].includes(name)) {
          handlers[name.toLowerCase()] = declaration as any;
        }
      }
    }

    return handlers;
  }

  private extractHandlerDescription(node: TSESTree.Node): string | undefined {
    // In a real implementation, extract JSDoc comments
    return undefined;
  }

  private extractNextJSParameters(routePath: string, method: string): Endpoint["parameters"] {
    const parameters: Endpoint["parameters"] = [];

    // Extract dynamic segments from route path
    const dynamicSegments = routePath.match(/:([a-zA-Z_][a-zA-Z0-9_]*)/g);

    if (dynamicSegments) {
      for (const segment of dynamicSegments) {
        const paramName = segment.substring(1);
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

    // Query parameters would be extracted from Request type in a real implementation

    return parameters.length > 0 ? parameters : undefined;
  }

  private extractNextJSResponses(handler: TSESTree.Node): Endpoint["responses"] {
    // Default responses
    return {
      "200": {
        description: "Successful response",
        content: {
          "application/json": {
            schema: {
              type: "object",
            },
          },
        },
      },
    };
  }

  private async scanPagesRouter(pagesApiDir: string, projectPath: string): Promise<Endpoint[]> {
    // Find all route files in pages/api directory
    const routeFiles = await glob("**/*.{ts,js}", {
      cwd: pagesApiDir,
      absolute: true,
    });

    const endpoints: Endpoint[] = [];

    for (const file of routeFiles) {
      const fileEndpoints = await this.scanPagesRouteFile(file, pagesApiDir);
      endpoints.push(...fileEndpoints);
    }

    return endpoints;
  }

  private async scanPagesRouteFile(filePath: string, pagesApiDir: string): Promise<Endpoint[]> {
    const content = readFileSync(filePath, "utf-8");
    const ast = parse(content, {
      loc: true,
      range: true,
      sourceType: "module",
    });

    const endpoints: Endpoint[] = [];

    // Extract route path from file path
    const relativePath = filePath.substring(pagesApiDir.length);
    const routePath = this.convertPagesFilePathToRoute(relativePath);

    // Find HTTP method handlers (export functions named after HTTP methods)
    const methodHandlers = this.extractMethodHandlers(ast);

    if (Object.keys(methodHandlers).length === 0) {
      // Default handler for all methods
      const endpoint: Endpoint = {
        path: routePath,
        method: "get",
        file: filePath,
        line: 0,
        responses: {
          "200": {
            description: "Successful response",
          },
        },
      };
      endpoints.push(endpoint);
    } else {
      for (const [method, handler] of Object.entries(methodHandlers)) {
        const endpoint: Endpoint = {
          path: routePath,
          method: method.toLowerCase() as Endpoint["method"],
          file: filePath,
          line: handler.loc?.start.line || 0,
          responses: {
            "200": {
              description: "Successful response",
            },
          },
        };
        endpoints.push(endpoint);
      }
    }

    return endpoints;
  }

  private convertPagesFilePathToRoute(filePath: string): string {
    // Remove file extension and convert to URL path
    const routePath = filePath
      .replace(/\.[^.]+$/, "")
      .replace(/\[?\.\.\.[^\]]+\]?/g, "*") // Catch-all routes
      .replace(/\[[^\]]+\]/g, (match) => `:${match.slice(1, -1)}`); // Dynamic routes

    return "/api" + routePath;
  }
}

// Placeholder implementations for other scanners
export class FastAPIRouteScanner implements RouteScanner {
  async scan(projectPath: string, config?: ScanConfig): Promise<Endpoint[]> {
    // Python FastAPI scanning would require Python AST parsing
    // This is a placeholder for future implementation
    console.warn("FastAPI scanner not yet implemented");
    return [];
  }
}

export class NestJSRouteScanner implements RouteScanner {
  async scan(projectPath: string, config?: ScanConfig): Promise<Endpoint[]> {
    // NestJS scanning would analyze controller decorators
    // This is a placeholder for future implementation
    console.warn("NestJS scanner not yet implemented");
    return [];
  }
}
