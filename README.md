# Capucins – Place des Machines

Flux iCal des événements du week-end aux [Ateliers des Capucins](https://www.ateliersdescapucins.fr/fr/programmation) (Brest) : événements d'un samedi ou d'un dimanche, et plages de 4 jours maximum qui touchent un week-end, **uniquement sur la Place des Machines** (la nef du rez-de-chaussée). Le lieu vient de la liste ; s'il est générique (« Les Ateliers des Capucins »), on lit la description de la page de l'événement. Événements « journée entière », avec le lien vers la page de l'événement.

Régénéré chaque vendredi par GitHub Actions.

## S'abonner

```
webcal://nicolas-marien.github.io/capucins-calendar/capucins.ics
```

Sur Mac : Calendrier → Fichier → Nouvel abonnement au calendrier → coller l'URL → Emplacement : **iCloud** (pour la synchro sur tous les appareils), Actualisation automatique : chaque jour.

## Développement

```
npm ci
npm test
npm run build   # écrit docs/capucins.ics
```
