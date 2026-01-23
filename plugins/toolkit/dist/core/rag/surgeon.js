"use strict";
/**
 * Surgeon Extractor - AST-based code extraction
 *
 * Uses TypeScript Compiler API (via ts-morph) to extract specific code
 * patterns, achieving 70-85% token savings vs full file reads.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurgeonExtractor = exports.DEFAULT_SURGEON_CONFIG = exports.ExtractionMode = void 0;
const ts_morph_1 = require("ts-morph");
/**
 * Extraction modes
 */
var ExtractionMode;
(function (ExtractionMode) {
    ExtractionMode["SIGNATURES"] = "signatures";
    ExtractionMode["TYPES_ONLY"] = "types";
    ExtractionMode["IMPORTS_ONLY"] = "imports";
    ExtractionMode["EXPORTS_ONLY"] = "exports";
    ExtractionMode["FULL"] = "full";
})(ExtractionMode || (exports.ExtractionMode = ExtractionMode = {}));
/**
 * Default configuration
 */
exports.DEFAULT_SURGEON_CONFIG = {
    includeJSDoc: false,
    includeImports: true,
    includeExports: true,
};
/**
 * Surgeon Extractor class
 */
class SurgeonExtractor {
    constructor(config = {}) {
        this.config = { ...exports.DEFAULT_SURGEON_CONFIG, ...config };
        this.project = new ts_morph_1.Project({
            useInMemoryFileSystem: true,
            compilerOptions: {
                allowJs: true,
                checkJs: false,
            },
        });
    }
    /**
     * Extract code based on mode
     */
    async extract(content, mode) {
        try {
            // Create temporary source file
            const sourceFile = this.project.createSourceFile('temp.ts', content);
            let extracted = '';
            switch (mode) {
                case ExtractionMode.SIGNATURES:
                    extracted = this.extractSignatures(sourceFile);
                    break;
                case ExtractionMode.TYPES_ONLY:
                    extracted = this.extractTypes(sourceFile);
                    break;
                case ExtractionMode.IMPORTS_ONLY:
                    extracted = this.extractImports(sourceFile);
                    break;
                case ExtractionMode.EXPORTS_ONLY:
                    extracted = this.extractExports(sourceFile);
                    break;
                case ExtractionMode.FULL:
                default:
                    extracted = content;
                    break;
            }
            // Clean up
            this.project.removeSourceFile(sourceFile);
            return extracted.trim();
        }
        catch (error) {
            // If AST parsing fails, return original content
            console.warn(`AST parsing failed, returning original content: ${error}`);
            return content;
        }
    }
    /**
     * Extract function and class signatures
     */
    extractSignatures(sourceFile) {
        const lines = [];
        // Add imports if configured
        if (this.config.includeImports) {
            lines.push(...this.extractImportLines(sourceFile));
        }
        // Extract function signatures
        sourceFile.getFunctions().forEach(func => {
            const signature = this.buildFunctionSignature(func);
            if (signature) {
                lines.push(signature);
            }
        });
        // Extract class declarations (signatures only)
        sourceFile.getClasses().forEach(cls => {
            const signature = this.buildClassSignature(cls);
            if (signature) {
                lines.push(signature);
            }
            // Add class method signatures
            cls.getMethods().forEach(method => {
                const methodSig = this.buildMethodSignature(method, cls.getName());
                if (methodSig) {
                    lines.push(methodSig);
                }
            });
        });
        // Extract interface declarations
        sourceFile.getInterfaces().forEach(iface => {
            const signature = this.buildInterfaceSignature(iface);
            if (signature) {
                lines.push(signature);
            }
        });
        // Extract type aliases
        sourceFile.getTypeAliases().forEach(alias => {
            const signature = this.buildTypeAliasSignature(alias);
            if (signature) {
                lines.push(signature);
            }
        });
        // Add exports if configured
        if (this.config.includeExports) {
            lines.push(...this.extractExportLines(sourceFile));
        }
        return lines.join('\n\n');
    }
    /**
     * Extract only type definitions
     */
    extractTypes(sourceFile) {
        const lines = [];
        // Add imports if configured
        if (this.config.includeImports) {
            lines.push(...this.extractImportLines(sourceFile));
        }
        // Extract interfaces
        sourceFile.getInterfaces().forEach(iface => {
            const signature = this.buildInterfaceSignature(iface);
            if (signature) {
                lines.push(signature);
            }
        });
        // Extract type aliases
        sourceFile.getTypeAliases().forEach(alias => {
            const signature = this.buildTypeAliasSignature(alias);
            if (signature) {
                lines.push(signature);
            }
        });
        // Extract enum declarations
        sourceFile.getEnums().forEach(enumDecl => {
            const signature = this.buildEnumSignature(enumDecl);
            if (signature) {
                lines.push(signature);
            }
        });
        return lines.join('\n\n');
    }
    /**
     * Extract import statements
     */
    extractImports(sourceFile) {
        return this.extractImportLines(sourceFile).join('\n');
    }
    /**
     * Extract export statements
     */
    extractExports(sourceFile) {
        return this.extractExportLines(sourceFile).join('\n');
    }
    /**
     * Build function signature
     */
    buildFunctionSignature(func) {
        try {
            const name = func.getName();
            const params = func.getParameters().map((p) => {
                const type = p.getType().getText();
                return `${p.getName()}: ${type}`;
            }).join(', ');
            const returnType = func.getReturnType().getText();
            const isAsync = func.isAsync() ? 'async ' : '';
            const isExported = func.isExported() ? 'export ' : '';
            return `${isExported}${isAsync}function ${name}(${params}): ${returnType};`;
        }
        catch {
            return null;
        }
    }
    /**
     * Build class signature
     */
    buildClassSignature(cls) {
        try {
            const name = cls.getName();
            const isExported = cls.isExported() ? 'export ' : '';
            const isAbstract = cls.isAbstract() ? 'abstract ' : '';
            // Get extends clause
            const extendsClause = cls.getExtends();
            const extendsText = extendsClause ? ` extends ${extendsClause.getText()}` : '';
            // Get implements clauses
            const implementsClauses = cls.getImplements();
            const implementsText = implementsClauses.length > 0
                ? ` implements ${implementsClauses.map((i) => i.getText()).join(', ')}`
                : '';
            return `${isExported}${isAbstract}class ${name}${extendsText}${implementsText} {`;
        }
        catch {
            return null;
        }
    }
    /**
     * Build method signature
     */
    buildMethodSignature(method, className) {
        try {
            const name = method.getName();
            const params = method.getParameters().map((p) => {
                const type = p.getType().getText();
                return `${p.getName()}: ${type}`;
            }).join(', ');
            const returnType = method.getReturnType().getText();
            const isAsync = method.isAsync() ? 'async ' : '';
            const isStatic = method.isStatic() ? 'static ' : '';
            const scope = method.getScope() ? `${method.getScope()} ` : '';
            return `  ${scope}${isStatic}${isAsync}${name}(${params}): ${returnType};`;
        }
        catch {
            return null;
        }
    }
    /**
     * Build interface signature
     */
    buildInterfaceSignature(iface) {
        try {
            const name = iface.getName();
            const isExported = iface.isExported() ? 'export ' : '';
            // Get extends clauses
            const extendsClauses = iface.getExtends();
            const extendsText = extendsClauses.length > 0
                ? ` extends ${extendsClauses.map((e) => e.getText()).join(', ')}`
                : '';
            let signature = `${isExported}interface ${name}${extendsText} {`;
            // Add property signatures
            iface.getProperties().forEach((prop) => {
                const propName = prop.getName();
                const propType = prop.getType().getText();
                // Check if property has question mark (optional)
                const hasQuestionToken = prop.hasQuestionToken?.() ?? false;
                const isOptional = hasQuestionToken ? '?' : '';
                signature += `\n  ${propName}${isOptional}: ${propType};`;
            });
            // Add method signatures
            iface.getMethods().forEach((method) => {
                const methodName = method.getName();
                const params = method.getParameters().map((p) => {
                    const type = p.getType().getText();
                    return `${p.getName()}: ${type}`;
                }).join(', ');
                const returnType = method.getReturnType().getText();
                signature += `\n  ${methodName}(${params}): ${returnType};`;
            });
            signature += '\n}';
            return signature;
        }
        catch {
            return null;
        }
    }
    /**
     * Build type alias signature
     */
    buildTypeAliasSignature(alias) {
        try {
            const name = alias.getName();
            const isExported = alias.isExported() ? 'export ' : '';
            const type = alias.getType().getText();
            return `${isExported}type ${name} = ${type};`;
        }
        catch {
            return null;
        }
    }
    /**
     * Build enum signature
     */
    buildEnumSignature(enumDecl) {
        try {
            const name = enumDecl.getName();
            const isExported = enumDecl.isExported() ? 'export ' : '';
            let signature = `${isExported}enum ${name} {`;
            enumDecl.getMembers().forEach((member) => {
                const memberName = member.getName();
                const value = member.getValue();
                const valueText = value !== undefined ? ` = ${JSON.stringify(value)}` : '';
                signature += `\n  ${memberName}${valueText},`;
            });
            signature += '\n}';
            return signature;
        }
        catch {
            return null;
        }
    }
    /**
     * Extract import lines
     */
    extractImportLines(sourceFile) {
        const lines = [];
        sourceFile.getImportDeclarations().forEach(imp => {
            lines.push(imp.getText());
        });
        return lines;
    }
    /**
     * Extract export lines
     */
    extractExportLines(sourceFile) {
        const lines = [];
        sourceFile.getExportDeclarations().forEach(exp => {
            lines.push(exp.getText());
        });
        return lines;
    }
    /**
     * Analyze file structure
     */
    analyze(content) {
        try {
            const sourceFile = this.project.createSourceFile('temp.ts', content);
            const result = {
                content: '',
                lines: sourceFile.getFullText().split('\n').length,
                functions: sourceFile.getFunctions().length,
                classes: sourceFile.getClasses().length,
                types: sourceFile.getTypeAliases().length + sourceFile.getInterfaces().length,
                imports: sourceFile.getImportDeclarations().length,
            };
            this.project.removeSourceFile(sourceFile);
            return result;
        }
        catch {
            return {
                content: '',
                lines: content.split('\n').length,
                functions: 0,
                classes: 0,
                types: 0,
                imports: 0,
            };
        }
    }
}
exports.SurgeonExtractor = SurgeonExtractor;
//# sourceMappingURL=surgeon.js.map