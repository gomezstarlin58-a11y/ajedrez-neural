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
          {/* 🔥 WRAPPER TÁCTICO: flex-col (apilado en móvil), md:flex-row (lado a lado en PC) */}
          <div className="flex flex-col md:flex-row h-screen w-full bg-[#020617] overflow-hidden">
            
            {/* Contenedor del Menú Lateral: 100% de ancho en móvil, se ajusta al contenido en PC */}
            <div className="w-full md:w-auto flex-shrink-0 z-50">
              <Sidebar /> 
            </div>
            
            {/* Área principal blindada: flex-1 toma el resto del espacio. overflow-x-hidden evita que la pantalla se mueva a los lados */}
            <main className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden">
              {children}
            </main>

          </div>
        </Centinela>
      </body>
    </html>
  )
}