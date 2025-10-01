const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const PYTHON_SCRIPT_PATH = path.join(__dirname, '..', 'find_pharma.py');
const OUTPUT_JSON_PATH = path.join(__dirname, '..', 'pharmacies_geo.json');

console.log('Exécution unique de la mise à jour des pharmacies...');

// Fonction pour exécuter le script Python
function runPythonScript() {
  return new Promise((resolve, reject) => {
    console.log('Démarrage de la mise à jour des pharmacies...');
    
    // Exécuter le script Python
    const pythonProcess = spawn('python3', [PYTHON_SCRIPT_PATH], {
      cwd: path.dirname(PYTHON_SCRIPT_PATH),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
      process.stdout.write(data);
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      process.stderr.write(data);
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n✓ Script Python exécuté avec succès');
        
        // Vérifier si le fichier JSON a été créé
        if (fs.existsSync(OUTPUT_JSON_PATH)) {
          const stats = fs.statSync(OUTPUT_JSON_PATH);
          console.log(`✓ Fichier JSON créé/modifié: ${stats.size} bytes`);
          resolve();
        } else {
          console.error('✗ ERREUR: Fichier JSON non trouvé après exécution');
          reject(new Error('Fichier JSON non créé'));
        }
      } else {
        console.error(`✗ ERREUR: Script Python terminé avec le code ${code}`);
        reject(new Error(`Script Python échoué avec le code ${code}`));
      }
    });

    pythonProcess.on('error', (error) => {
      console.error(`✗ ERREUR: Impossible d'exécuter le script Python: ${error.message}`);
      reject(error);
    });
  });
}

// Exécuter la mise à jour
runPythonScript()
  .then(() => {
    console.log('✓ Mise à jour des pharmacies terminée avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error(`✗ ERREUR lors de la mise à jour: ${error.message}`);
    process.exit(1);
  });
