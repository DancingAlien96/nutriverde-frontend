"use client";

/**
 * Contenido que se despliega hacia abajo con animación de altura. Usa el
 * truco de grid (0fr -> 1fr) para animar sin medir el contenido. Cerrado,
 * el contenido queda inerte: no recibe foco ni lo leen los lectores de
 * pantalla. Con "reducir movimiento" activado cambia sin animación.
 */
export function Collapse({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
    >
      <div className="min-h-0 overflow-hidden" inert={!open}>
        {children}
      </div>
    </div>
  );
}
