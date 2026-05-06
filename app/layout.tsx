import './globals.css';
import Centinela from './components/centinela';
import Sidebar from './components/Sidebar'; // 🔥 Traemos de vuelta el menú

export const metadata = {
  title: 'Chess & Academic',
  description: 'Entrena tu mente',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        {/* El guardia protege toda la base */}
        <Centinela>
          {/* Contenedor principal que divide la pantalla (Menú a la izquierda, contenido a la derecha) */}
          <div className="flex h-screen w-full bg-[#020617] overflow-hidden">
            
            {/* Aquí está tu menú de vuelta */}
            <Sidebar /> 
            
            {/* Área principal donde se carga el Hub, las Partidas Épicas, etc. */}
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>

          </div>
        </Centinela>
      </body>
    </html>
  )
}