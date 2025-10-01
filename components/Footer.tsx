import Link from 'next/link';
import { MapPin, Phone, Clock, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold mb-3 gradient-text">CimeIT Pharmacy Locator</h3>
            <p className="text-gray-300 mb-4">
              Trouvez les pharmacies de garde près de vous au Togo. 
              Service de géolocalisation intelligent pour votre santé.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-400">
              <Heart className="h-4 w-4 text-red-500" />
              <span>Fait avec amour pour la santé des Togolais</span>
            </div>
          </div>
          
          <div className="text-center">
            <h4 className="text-lg font-semibold mb-4">Fonctionnalités</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center justify-center gap-2">
                <MapPin className="h-4 w-4 text-blue-400" />
                Géolocalisation précise
              </li>
              <li className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4 text-green-400" />
                Mise à jour quotidienne
              </li>
              <li className="flex items-center justify-center gap-2">
                <Phone className="h-4 w-4 text-orange-400" />
                Contact direct
              </li>
            </ul>
          </div>
          
          <div className="text-center md:text-right">
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p>Service disponible 24h/24</p>
              <p>Mise à jour automatique</p>
              <p>Données officielles INAM</p>
            </div>
            <div className="mt-4">
              <Link 
                href="https://portfolio-serge-zotchi.vercel.app/" 
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition duration-300 text-sm font-medium"
              >
                <span>Développé par Serge Zotchi</span>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} CimeIT. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}