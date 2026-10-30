export function formatearFecha(fecha: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return "Fecha inválida";
  } //comprueba que la fecha tenga el formato AAAA-MM-DD
  const [anio, mes, dia] = fecha
    .split("-")
    .map(Number);


  const fechaLocal = new Date(
    anio,
    mes - 1,
    dia
  );
    if (
    fechaLocal.getFullYear() !== anio ||
    fechaLocal.getMonth() !== mes - 1 ||
    fechaLocal.getDate() !== dia
  ) {
    return "Fecha inválida";
  }//comprueba que la fecha generada coincida con la solicitada. Así detectamos días y meses inexistentes.

  return fechaLocal.toLocaleDateString(
    "es-AR",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}
