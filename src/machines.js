const MACHINES = /place des machines/i;
// Lieu qui ne dit pas où, dans le bâtiment, se tient l'événement.
const GENERIC = /^((les )?ateliers des capucins)?$/i;

export const onMachines = (e) => MACHINES.test(e.place ?? '');
export const needsDescription = (e) => GENERIC.test(e.place ?? '');

// Événements sur la Place des Machines : par leur lieu, ou, si le lieu est générique,
// par leur description (récupérée via `describe(url)`).
export async function filterMachines(events, describe) {
  const kept = [];
  for (const e of events) {
    if (onMachines(e) || (needsDescription(e) && MACHINES.test(await describe(e.url)))) kept.push(e);
  }
  return kept;
}
