"use client";

import { useEffect, useState } from "react";
import { adminMe, isSecretary } from "../lib/admin";

/**
 * true cuando quien usa el panel es nutricionista o staff. Cerrado por
 * defecto: hasta confirmar el rol (o si falla la consulta) vale false, así
 * nunca se ofrece una acción que el servidor rechazaría.
 */
export function useFullAccess(): boolean {
  const [full, setFull] = useState(false);
  useEffect(() => {
    let cancelled = false;
    adminMe()
      .then((me) => {
        if (!cancelled) setFull(!isSecretary(me.admin.role));
      })
      .catch(() => {
        if (!cancelled) setFull(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return full;
}
