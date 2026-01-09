# 📚 DOC-MAINTAINER

**Automatically synchronize documentation with code changes**

---

## MISSION

Maintain **zero documentation debt** by keeping technical documentation (README, JSDoc, API docs) in sync with codebase changes.

---

## INVOCATION

```bash
*start-doc-maintainer --mode=[sync|audit|generate]
```

### Modes

- **`sync`**: Update existing docs based on code changes
- **`audit`**: Check documentation completeness without modifying
- **`generate`**: Generate missing documentation from code

---

## PROTOCOL (SYNC)

### 1. DETECT

**Identify documentation impact:**
- Scan changed files since last sync
- Categorize by documentation impact:
  - **Component changes** → Props, hooks, usage examples
  - **API changes** → Endpoints, parameters, responses
  - **Module changes** → Exports, types, utilities
  - **Configuration changes** → Environment variables, options

**Code patterns to watch:**
- New component/function added
- Props/signature changed
- JSDoc missing or outdated
- Export added/removed
- Types/interfaces modified

### 2. ANALYZE

**Extract code information:**
```typescript
// For components
- Component name and purpose
- Props interface with types
- Hook usage patterns
- Dependencies

// For functions
- Function signature
- Parameters with types
- Return type
- Usage examples
- Edge cases

// For APIs
- Endpoint path and method
- Request/response types
- Authentication requirements
- Error responses
```

**Compare with existing docs:**
- Check if JSDoc exists and is accurate
- Verify examples match current API
- Identify missing parameter descriptions
- Check for outdated information

### 3. UPDATE

**Apply documentation updates:**

#### JSDoc Updates
```typescript
/**
 * Retrieves user data from the API
 *
 * @param userId - The unique identifier of the user
 * @param options - Optional configuration for the request
 * @param options.includeProfile - Whether to include profile data
 * @returns Promise resolving to user data object
 * @throws {ValidationError} When userId is invalid
 * @throws {NetworkError} When API request fails
 *
 * @example
 * ```ts
 * const user = await fetchUser('123', { includeProfile: true });
 * console.log(user.name);
 * ```
 */
async function fetchUser(
  userId: string,
  options?: { includeProfile?: boolean }
): Promise<UserData>
```

#### README Updates
- Update feature descriptions
- Add new API documentation
- Update installation instructions
- Refresh examples
- Maintain CHANGELOG

#### API Documentation
- Update endpoint descriptions
- Document new parameters
- Add response examples
- Document error codes

### 4. VALIDATE

**Quality checks:**
- ✅ All public APIs have JSDoc
- ✅ All parameters are documented
- ✅ Return types are documented
- ✅ Examples are provided and accurate
- ✅ No broken references
- ✅ Consistent formatting

**Completeness score:**
```
📊 Documentation Coverage: 94%
   - Components: 100% ✅
   - Functions: 92% ⚠️ (3 missing)
   - Types: 95% ✅
   - APIs: 90% ⚠️ (1 endpoint missing)
```

---

## CONFIGURATION

See `agent/configs/doc-maintainer.json`

**Key settings:**
- `sync.watchPatterns`: Files to monitor for changes
- `sync.docPatterns`: Documentation files to update
- `templates`: Template files for different doc types
- `coverage.minimumCoverage`: Minimum required documentation coverage

---

## EXAMPLE USAGE

### Sync Mode (Update Docs)
```bash
*start-doc-maintainer --mode=sync
```
Updates all documentation based on recent code changes.

### Audit Mode (Check Completeness)
```bash
*start-doc-maintainer --mode=audit
```
Reports documentation coverage and gaps without modifying files.

### Generate Mode (Create Missing Docs)
```bash
*start-doc-maintainer --mode=generate
```
Generates missing JSDoc and documentation from code analysis.

---

## TEMPLATES

Documentation templates are stored in `agent/templates/`:

- **`jsdoc.template.md`**: JSDoc comment structure
- **`component-docs.template.md`**: Component documentation structure
- **`api-docs.template.md`**: API endpoint documentation
- **`readme.template.md`**: README sections and structure

---

## OUTPUT

### Success Case
```
✅ DOC-MAINTAINER: Documentation synchronized
   - Updated 12 JSDoc comments
   - Added 3 missing examples
   - Updated 2 API docs
   - Refreshed README features section

📊 Documentation coverage: 96% (+4%)
🎯 Zero documentation debt maintained
```

### Audit Results
```
📋 DOC-MAINTAINER: Audit Report

Documentation Coverage: 87%

Missing Documentation:
- src/components/Header.tsx:42 - JSDoc missing
- src/utils/api.ts:156 - Parameter descriptions incomplete
- src/types/User.ts:23 - Interface documentation needed

Recommendations:
- Add JSDoc to 3 public functions
- Complete parameter descriptions
- Add usage examples for API methods

📝 Full report: .doc-audit-report.md
```

---

## INTEGRATION

**Automatic triggers:**
- After component/function creation
- After API changes
- Before git commits (pre-commit hook)
- Manual invocation via command
- Periodic scheduled syncs

**Works with:**
- Linter-Sentinel (ensure docs are linted)
- Code review workflows
- CI/CD documentation generation
