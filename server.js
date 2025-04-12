const express = require('express');
const bodyParser = require('body-parser');
const { ESLint } = require('eslint');
const { PythonShell } = require('python-shell');
const { exec } = require('child_process');
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// API endpoint to review code
app.post('/api/review', (req, res) => {
  const { code, language } = req.body;

  switch(language) {
    case 'javascript':
      lintJavaScript(code, res);
      break;
    case 'python':
      runPython(code, res);
      break;
    case 'java':
      runJava(code, res);
      break;
    case 'c':
    case 'cpp':
      runCPlusPlus(code, language, res);
      break;
    case 'html':
      lintHTML(code, res);
      break;
    case 'css':
      lintCSS(code, res);
      break;
    default:
      res.status(400).json({ error: "Unsupported language." });
  }
});

// JavaScript Linter (ESLint)
function lintJavaScript(code, res) {
  const eslint = new ESLint();
  eslint.lintText(code).then(results => {
    if (results.length === 0) {
      return res.json({
        verdict: "approve",
        comments: "No issues found.",
      });
    }
    const issues = results[0].messages;
    const error = issues.length > 0 ? issues[0] : null;
    if (error) {
      return res.json({
        verdict: "request changes",
        comments: "Syntax or style error found in your code.",
        line: error.line,
        suggestedFix: error.message
      });
    }
  }).catch(err => {
    res.status(500).json({ error: "Error linting code: " + err.message });
  });
}

// Python Linter/Execution
function runPython(code, res) {
  const tempFile = 'temp.py';
  require('fs').writeFileSync(tempFile, code);

  PythonShell.run(tempFile, null, function (err, result) {
    if (err) {
      return res.json({
        verdict: "request changes",
        comments: "Python error found.",
        error: err.message,
      });
    }
    res.json({
      verdict: "approve",
      comments: "Python code runs successfully.",
      output: result.join('\n')
    });
  });
}

// Java Linter/Execution
function runJava(code, res) {
  const tempFile = 'temp.java';
  require('fs').writeFileSync(tempFile, code);

  exec('javac ' + tempFile, (err, stdout, stderr) => {
    if (stderr) {
      return res.json({
        verdict: "request changes",
        comments: "Java compilation error.",
        error: stderr
      });
    }
    exec('java temp', (err, stdout, stderr) => {
      if (stderr) {
        return res.json({
          verdict: "request changes",
          comments: "Java runtime error.",
          error: stderr
        });
      }
      res.json({
        verdict: "approve",
        comments: "Java code runs successfully.",
        output: stdout
      });
    });
  });
}

// C/C++ Linter/Execution
function runCPlusPlus(code, language, res) {
  const tempFile = 'temp.' + (language === 'c' ? 'c' : 'cpp');
  require('fs').writeFileSync(tempFile, code);

  exec(`gcc ${tempFile} -o temp.out`, (err, stdout, stderr) => {
    if (stderr) {
      return res.json({
        verdict: "request changes",
        comments: "C/C++ compilation error.",
        error: stderr
      });
    }
    exec('./temp.out', (err, stdout, stderr) => {
      if (stderr) {
        return res.json({
          verdict: "request changes",
          comments: "C/C++ runtime error.",
          error: stderr
        });
      }
      res.json({
        verdict: "approve",
        comments: "C/C++ code runs successfully.",
        output: stdout
      });
    });
  });
}

// HTML Linter
function lintHTML(code, res) {
  exec(`htmlhint -c .htmlhintrc`, (err, stdout, stderr) => {
    if (stderr) {
      return res.json({
        verdict: "request changes",
        comments: "HTML error found.",
        error: stderr
      });
    }
    res.json({
      verdict: "approve",
      comments: "HTML code is valid."
    });
  });
}

// CSS Linter
function lintCSS(code, res) {
  exec(`stylelint --syntax scss --fix`, (err, stdout, stderr) => {
    if (stderr) {
      return res.json({
        verdict: "request changes",
        comments: "CSS error found.",
        error: stderr
      });
    }
    res.json({
      verdict: "approve",
      comments: "CSS code is valid."
    });
  });
}

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
