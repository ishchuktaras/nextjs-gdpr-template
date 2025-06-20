#!/usr/bin/env node

// scripts/gdpr-audit.js
// GDPR Compliance Audit Script

const fs = require('fs');
const path = require('path');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}🛡️ ${msg}${colors.reset}\n`),
  section: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}`),
};

class GDPRAudit {
  constructor() {
    this.score = 0;
    this.maxScore = 0;
    this.issues = [];
    this.recommendations = [];
    this.checkedItems = [];
  }

  // Přidání check pointu
  addCheck(name, weight = 1) {
    this.maxScore += weight;
    return {
      pass: () => {
        this.score += weight;
        this.checkedItems.push({ name, status: 'pass', weight });
        log.success(`${name}`);
      },
      fail: (reason, recommendation = null) => {
        this.checkedItems.push({ name, status: 'fail', weight, reason });
        this.issues.push({ name, reason, weight });
        if (recommendation) {
          this.recommendations.push(recommendation);
        }
        log.error(`${name}: ${reason}`);
      },
      warn: (reason, recommendation = null) => {
        this.score += weight * 0.5; // Partial credit for warnings
        this.checkedItems.push({ name, status: 'warn', weight, reason });
        if (recommendation) {
          this.recommendations.push(recommendation);
        }
        log.warn(`${name}: ${reason}`);
      }
    };
  }

  // Kontrola existence souboru
  checkFileExists(filePath, description, required = true) {
    const check = this.addCheck(description, required ? 2 : 1);
    const fullPath = path.resolve(filePath);
    
    if (fs.existsSync(fullPath)) {
      check.pass();
      return true;
    } else {
      if (required) {
        check.fail(
          `Soubor ${filePath} nenalezen`,
          `Vytvořte soubor ${filePath}`
        );
      } else {
        check.warn(
          `Volitelný soubor ${filePath} nenalezen`,
          `Zvažte vytvoření ${filePath} pro lepší funkcionalitet`
        );
      }
      return false;
    }
  }

  // Kontrola obsahu souboru
  checkFileContent(filePath, pattern, description, required = true) {
    const check = this.addCheck(description, required ? 2 : 1);
    
    try {
      const content = fs.readFileSync(path.resolve(filePath), 'utf8');
      
      if (typeof pattern === 'string') {
        if (content.includes(pattern)) {
          check.pass();
          return true;
        }
      } else if (pattern instanceof RegExp) {
        if (pattern.test(content)) {
          check.pass();
          return true;
        }
      }
      
      check.fail(
        `Pattern nenalezen v ${filePath}`,
        `Přidejte požadovaný obsah do ${filePath}`
      );
      return false;
    } catch (error) {
      check.fail(
        `Chyba čtení ${filePath}: ${error.message}`,
        `Zkontrolujte existenci a oprávnění souboru ${filePath}`
      );
      return false;
    }
  }

  // Kontrola environment variables
  checkEnvVariables() {
    log.section('🔐 Environment Variables');
    
    const requiredVars = [
      'GDPR_ENCRYPTION_KEY',
      'GDPR_JWT_SECRET',
      'GDPR_CONTROLLER_NAME',
      'GDPR_CONTROLLER_EMAIL'
    ];

    const optionalVars = [
      'NEXT_PUBLIC_GA_ID',
      'NEXT_PUBLIC_FB_PIXEL_ID',
      'BREVO_API_KEY',
      'SMTP_HOST',
      'SMTP_USER'
    ];

    // Načti .env.local pokud existuje
    const envPath = '.env.local';
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Kontrola povinných proměnných
    requiredVars.forEach(varName => {
      const check = this.addCheck(`Environment variable: ${varName}`, 2);
      
      if (process.env[varName] || envContent.includes(`${varName}=`)) {
        check.pass();
      } else {
        check.fail(
          `Chybí povinná proměnná ${varName}`,
          `Přidejte ${varName} do .env.local`
        );
      }
    });

    // Kontrola volitelných proměnných
    optionalVars.forEach(varName => {
      const check = this.addCheck(`Optional: ${varName}`, 1);
      
      if (process.env[varName] || envContent.includes(`${varName}=`)) {
        check.pass();
      } else {
        check.warn(
          `Volitelná proměnná ${varName} není nastavena`,
          `Zvažte nastavení ${varName} pro plnou funkcionaliteit`
        );
      }
    });
  }

  // Kontrola komponent
  checkComponents() {
    log.section('🧩 GDPR Komponenty');
    
    const components = [
      'components/gdpr/CookieConsent.jsx',
      'components/gdpr/GDPRSettings.jsx',
      'components/gdpr/index.js'
    ];

    components.forEach(component => {
      this.checkFileExists(component, `Komponenta: ${path.basename(component)}`);
    });

    // Kontrola hooks
    this.checkFileExists('hooks/useCookieConsent.js', 'Hook: useCookieConsent');

    // Kontrola utility funkcí
    this.checkFileExists('lib/gdpr/utils.js', 'GDPR Utilities');
  }

  // Kontrola API endpoints
  checkAPIEndpoints() {
    log.section('🔌 API Endpoints');
    
    const endpoints = [
      'pages/api/gdpr/export.js',
      'pages/api/gdpr/delete-request.js'
    ];

    endpoints.forEach(endpoint => {
      const exists = this.checkFileExists(endpoint, `API: ${path.basename(endpoint)}`);
      
      if (exists) {
        // Kontrola, zda endpoint není jen placeholder
        this.checkFileContent(
          endpoint,
          /export default.*function|export.*handler/,
          `API Implementation: ${path.basename(endpoint)}`
        );
      }
    });
  }

  // Kontrola TypeScript typů
  checkTypeScript() {
    log.section('📝 TypeScript Support');
    
    const tsConfigExists = this.checkFileExists('tsconfig.json', 'TypeScript config', false);
    
    if (tsConfigExists) {
      this.checkFileExists('types/gdpr.ts', 'GDPR TypeScript types', false);
    }
  }

  // Kontrola testů
  checkTests() {
    log.section('🧪 Testing Setup');
    
    this.checkFileExists('jest.config.js', 'Jest configuration', false);
    this.checkFileExists('jest.setup.js', 'Jest setup', false);
    this.checkFileExists('playwright.config.js', 'Playwright configuration', false);
    
    // Kontrola test složek
    const testDirs = ['tests', '__tests__', 'test'];
    let hasTests = false;
    
    testDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        hasTests = true;
      }
    });

    const check = this.addCheck('Test files', 1);
    if (hasTests) {
      check.pass();
    } else {
      check.warn(
        'Žádné test soubory nenalezeny',
        'Vytvořte testy pro ověření GDPR funkcionality'
      );
    }
  }

  // Kontrola dokumentace
  checkDocumentation() {
    log.section('📚 Dokumentace');
    
    this.checkFileExists('README.md', 'README soubor');
    this.checkFileExists('docs/installation.md', 'Installation guide', false);
    this.checkFileExists('docs/legal-templates/privacy-policy-cz.md', 'Privacy policy template', false);
    
    // Kontrola obsahu README
    if (fs.existsSync('README.md')) {
      this.checkFileContent(
        'README.md',
        /GDPR|cookie|consent|privacy/i,
        'README obsahuje GDPR informace'
      );
    }
  }

  // Kontrola package.json
  checkPackageJson() {
    log.section('📦 Package Configuration');
    
    const exists = this.checkFileExists('package.json', 'Package.json');
    
    if (exists) {
      try {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        // Kontrola dependencies
        const requiredDeps = ['next', 'react', 'lucide-react'];
        requiredDeps.forEach(dep => {
          const check = this.addCheck(`Dependency: ${dep}`, 1);
          
          if (pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]) {
            check.pass();
          } else {
            check.fail(
              `Chybí dependency: ${dep}`,
              `Přidejte ${dep} do dependencies`
            );
          }
        });

        // Kontrola scripts
        const recommendedScripts = ['test', 'test:compliance', 'lint'];
        recommendedScripts.forEach(script => {
          const check = this.addCheck(`Script: ${script}`, 1);
          
          if (pkg.scripts?.[script]) {
            check.pass();
          } else {
            check.warn(
              `Chybí npm script: ${script}`,
              `Přidejte "${script}" do package.json scripts`
            );
          }
        });

      } catch (error) {
        const check = this.addCheck('Package.json parsing', 2);
        check.fail(
          `Chyba parsování package.json: ${error.message}`,
          'Opravte syntax v package.json'
        );
      }
    }
  }

  // Kontrola Git konfigurace
  checkGitSetup() {
    log.section('🔧 Git Setup');
    
    this.checkFileExists('.gitignore', 'Git ignore soubor');
    
    if (fs.existsSync('.gitignore')) {
      this.checkFileContent(
        '.gitignore',
        '.env.local',
        'Gitignore obsahuje .env.local'
      );
    }

    this.checkFileExists('.github/workflows', 'GitHub Actions', false);
  }

  // Spuštění kompletního auditu
  async runAudit() {
    log.header('GDPR Compliance Audit');
    
    console.log('Spouštím kontrolu GDPR compliance...\n');
    
    // Spusť všechny kontroly
    this.checkEnvVariables();
    this.checkComponents();
    this.checkAPIEndpoints();
    this.checkTypeScript();
    this.checkTests();
    this.checkDocumentation();
    this.checkPackageJson();
    this.checkGitSetup();
    
    // Vypočítej final score
    const percentage = Math.round((this.score / this.maxScore) * 100);
    
    // Zobraz výsledky
    this.displayResults(percentage);
    
    return {
      score: this.score,
      maxScore: this.maxScore,
      percentage,
      issues: this.issues,
      recommendations: this.recommendations,
      checkedItems: this.checkedItems
    };
  }

  // Zobrazení výsledků
  displayResults(percentage) {
    log.header('Výsledky Auditu');
    
    console.log(`📊 Celkové skóre: ${this.score}/${this.maxScore} (${percentage}%)\n`);
    
    // Color-coded score
    if (percentage >= 90) {
      log.success(`Výborné! Vaše GDPR implementace je téměř perfektní. 🌟`);
    } else if (percentage >= 75) {
      log.success(`Dobré! Vaše implementace je solidní s několika drobnými problémy. 👍`);
    } else if (percentage >= 50) {
      log.warn(`Střední. Implementace potřebuje několik vylepšení. 🔧`);
    } else {
      log.error(`Kritické! Implementace vyžaduje zásadní práci. 🚨`);
    }

    // Zobraz issues
    if (this.issues.length > 0) {
      log.section('🔴 Kritické problémy:');
      this.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.name}: ${issue.reason}`);
      });
    }

    // Zobraz recommendations
    if (this.recommendations.length > 0) {
      log.section('💡 Doporučení:');
      this.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    // Next steps
    log.section('🎯 Další kroky:');
    if (percentage < 90) {
      console.log('1. Opravte kritické problémy uvedené výše');
      console.log('2. Implementujte chybějící komponenty');
      console.log('3. Spusťte audit znovu: npm run test:compliance');
    } else {
      console.log('1. Otestujte implementaci s npm run test');
      console.log('2. Proveďte E2E testy s npm run test:e2e');
      console.log('3. Připravte produkční nasazení');
    }

    console.log('\n📞 Potřebujete pomoc?');
    console.log('   📧 tech-podpora@webnamiru.site');
    console.log('   🐛 https://github.com/webnamiru/nextjs-gdpr-template/issues');
  }
}

// Spuštění auditu
async function main() {
  const audit = new GDPRAudit();
  
  try {
    const results = await audit.runAudit();
    
    // Export results do JSON pokud je požadováno
    if (process.argv.includes('--json')) {
      const outputPath = 'gdpr-audit-results.json';
      fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
      log.info(`Výsledky exportovány do ${outputPath}`);
    }
    
    // Exit code based on score
    const exitCode = results.percentage >= 75 ? 0 : 1;
    process.exit(exitCode);
    
  } catch (error) {
    log.error(`Audit failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = GDPRAudit;