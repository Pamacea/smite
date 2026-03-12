#!/usr/bin/env node
/**
 * SMITE Core - Template Renderer
 *
 * Renders templates with variable substitution.
 * Supports all SMITE Core templates.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import template loader
async function getTemplateLoader() {
  const { TemplateLoader } = await import('../skills/template-loader.js');
  return TemplateLoader;
}

/**
 * Render template with variables
 */
async function renderTemplate(templateName, variables) {
  const TemplateLoader = await getTemplateLoader();
  return await TemplateLoader.render(templateName, variables);
}

/**
 * List available templates
 */
async function listTemplates() {
  const TemplateLoader = await getTemplateLoader();
  const templates = TemplateLoader.listTemplates();
  return templates.map(t => t.name);
}

/**
 * Show template info
 */
async function showTemplateInfo(templateName) {
  const TemplateLoader = await getTemplateLoader();
  const metadata = TemplateLoader.getMetadata(templateName);
  return metadata || null;
}

// CLI interface
const modulePath = new URL(import.meta.url).pathname;
const scriptPath = process.argv[1].replace(/\\/g, '/');
if (modulePath === scriptPath || modulePath === scriptPath.replace(/^./, '')) {
  const args = process.argv.slice(2);

  if (args[0] === 'list' || args[0] === '--help' || args[0] === '-h') {
    if (args[0] === '--help' || args[0] === '-h') {
      console.log(`
Usage: node template-renderer.js <command> [args]

Commands:
  list                          List all available templates
  render <name> <vars>         Render template with variables
  info <name>                   Show template metadata

Arguments:
  name                          Template name (e.g., command-header)
  vars                          JSON string of variables

Examples:
  node template-renderer.js list
  node template-renderer.js info command-header
  node template-renderer.js render command-header '{"DESCRIPTION":"My Command","VERSION":"1.0.0"}'
      `);
    } else {
      listTemplates().then(templates => {
        console.log('\n📋 Available Templates:\n');
        templates.forEach(t => {
          console.log(`  - ${t}`);
        });
      });
    }
  } else if (args[0] === 'info') {
    const name = args[1];
    if (!name) {
      console.error('❌ Error: Template name required');
      process.exit(1);
    }

    showTemplateInfo(name).then(info => {
      if (info) {
        console.log('\n📄 Template Info:\n');
        console.log(JSON.stringify(info, null, 2));
      } else {
        console.error(`❌ Template not found: ${name}`);
        process.exit(1);
      }
    });
  } else if (args[0] === 'render') {
    const name = args[1];
    const varsStr = args[2];

    if (!name) {
      console.error('❌ Error: Template name required');
      process.exit(1);
    }

    let variables = {};
    if (varsStr) {
      try {
        variables = JSON.parse(varsStr);
      } catch (error) {
        console.error('❌ Error: Invalid JSON variables');
        process.exit(1);
      }
    }

    renderTemplate(name, variables).then(rendered => {
      if (rendered) {
        console.log(rendered);
      } else {
        console.error(`❌ Template not found: ${name}`);
        process.exit(1);
      }
    });
  } else {
    console.error('❌ Error: Unknown command. Use --help for usage.');
    process.exit(1);
  }
}

export { renderTemplate, listTemplates, showTemplateInfo };
