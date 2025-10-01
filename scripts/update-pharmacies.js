const cron = require('node-cron');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const PYTHON_SCRIPT_PATH = path.join(__dirname, '..', 'find_pharma.py');
const OUTPUT_JSON_PATH = path.join(__dirname, '..', 'pharmacies_geo.json');
const LOG_FILE_PATH = path.join(__dirname, '..', 'logs', 'pharmacy-update.log');

// Créer le dossier logs s'il n'existe pas
const logsDir = path.dirname(LOG_FILE_PATH);
if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir, { recursive: true, mode: 0o755 });
  } catch (error) {
    console.error('Erreur lors de la création du dossier logs:', error.message);
  }
}

// Fonction pour logger les événements
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  console.log(logMessage.trim());
  
  // Écrire dans le fichier de log (avec gestion d'erreur)
  try {
    fs.appendFileSync(LOG_FILE_PATH, logMessage);
  } catch (error) {
    console.error('Erreur lors de l\'écriture du log:', error.message);
  }
}

// Fonction pour exécuter le script Python
function runPythonScript() {
  return new Promise((resolve, reject) => {
    log('Démarrage de la mise à jour des pharmacies...');
    
    // Détecter si on est dans Docker ou en local
    const isDocker = process.env.NODE_ENV === 'production' || fs.existsSync('/.dockerenv');
    const pythonCommand = isDocker ? 'python-venv' : 'python3';
    
    // Activer l'environnement virtuel et exécuter le script Python
    const pythonProcess = spawn(pythonCommand, [PYTHON_SCRIPT_PATH], {
      cwd: path.dirname(PYTHON_SCRIPT_PATH),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        log('Script Python exécuté avec succès');
        log(`Sortie: ${stdout}`);
        
        // Vérifier si le fichier JSON a été créé
        if (fs.existsSync(OUTPUT_JSON_PATH)) {
          const stats = fs.statSync(OUTPUT_JSON_PATH);
          log(`Fichier JSON créé/modifié: ${stats.size} bytes`);
          resolve();
        } else {
          log('ERREUR: Fichier JSON non trouvé après exécution');
          reject(new Error('Fichier JSON non créé'));
        }
      } else {
        log(`ERREUR: Script Python terminé avec le code ${code}`);
        log(`Erreur: ${stderr}`);
        reject(new Error(`Script Python échoué avec le code ${code}`));
      }
    });

    pythonProcess.on('error', (error) => {
      log(`ERREUR: Impossible d'exécuter le script Python: ${error.message}`);
      reject(error);
    });
  });
}

// Fonction pour exécuter la mise à jour avec gestion d'erreur
async function updatePharmacies() {
  try {
    await runPythonScript();
    log('Mise à jour des pharmacies terminée avec succès');
  } catch (error) {
    log(`ERREUR lors de la mise à jour: ${error.message}`);
  }
}

// Planifier l'exécution quotidienne à 00h00
const cronExpression = '0 0 * * *'; // Tous les jours à minuit

log('Démarrage du service de mise à jour des pharmacies');
log(`Planification: ${cronExpression} (tous les jours à 00h00)`);

// Programmer la tâche
const task = cron.schedule(cronExpression, updatePharmacies, {
  scheduled: false,
  timezone: "Africa/Lome" // Fuseau horaire du Togo
});

// Démarrer la tâche
task.start();

// Exécuter immédiatement au démarrage (optionnel)
log('Exécution immédiate de la mise à jour...');
updatePharmacies();

// Gestion des signaux pour arrêter proprement
process.on('SIGINT', () => {
  log('Arrêt du service de mise à jour...');
  task.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Arrêt du service de mise à jour...');
  task.stop();
  process.exit(0);
});

log('Service de mise à jour des pharmacies démarré');
