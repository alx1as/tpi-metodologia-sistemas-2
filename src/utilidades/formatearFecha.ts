export function formatearFecha(fecha: string) {
  const [anio, mes, dia] = fecha
    .split("-")
    .map(Number);

  const fechaLocal = new Date(
    anio,
    mes - 1,
    dia
  );

  return fechaLocal.toLocaleDateString(
    "es-AR",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}
