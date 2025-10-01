const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const PYTHON_SCRIPT_PATH = path.join(__dirname, '..', 'find_pharma.py');
const OUTPUT_JSON_PATH = path.join(__dirname, '..', 'pharmacies_geo.json');

console.log('🚀 Démarrage de l\'application Find Pharma...');

// Vérifier si le fichier de données existe
if (!fs.existsSync(OUTPUT_JSON_PATH)) {
  console.log('📊 Fichier de données non trouvé, exécution de la mise à jour initiale...');
  
  // Détecter si on est dans Docker ou en local
  const isDocker = process.env.NODE_ENV === 'production' || fs.existsSync('/.dockerenv');
  const pythonCommand = isDocker ? 'python-venv' : 'python3';
  
  // Exécuter le script Python
  const pythonProcess = spawn(pythonCommand, [PYTHON_SCRIPT_PATH], {
    cwd: path.dirname(PYTHON_SCRIPT_PATH),
    stdio: ['pipe', 'pipe', 'pipe']
  });

  pythonProcess.stdout.on('data', (data) => {
    process.stdout.write(data);
  });

  pythonProcess.stderr.on('data', (data) => {
    process.stderr.write(data);
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Mise à jour initiale terminée avec succès');
    } else {
      console.log('⚠️ Mise à jour initiale échouée, l\'application démarrera avec les données existantes');
    }
  });
} else {
  console.log('✅ Fichier de données trouvé, démarrage de l\'application...');
}

// Démarrer l'application Next.js
console.log('🌐 Démarrage du serveur web...');
const nextProcess = spawn('npm', ['start'], {
  stdio: 'inherit'
});

nextProcess.on('close', (code) => {
  console.log(`Serveur web fermé avec le code ${code}`);
  process.exit(code);
});
