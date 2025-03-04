import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">Pharmacy Locator</h3>
            <p className="text-sm text-gray-400">Find nearby pharmacies on duty</p>
          </div>
          <div className="flex space-x-6">
            
            <Link href="https://portfolio-serge-zotchi.vercel.app/" className="text-gray-400 hover:text-white transition duration-300">
              My Portfolio
            </Link>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-6 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} CimeIT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}