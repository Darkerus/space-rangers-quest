import { Quest } from "./qmplayer/funcs";

export interface QmmMediaInfo {
  [mediaName: string]: string[];
}

function addSeenMedia(media: QmmMediaInfo, name: string | undefined, place: string) {
  if (!name) {
    return;
  }
  if (media[name]) {
    media[name].push(place);
  } else {
    media[name] = [place];
  }
}

/**
 * Returns a map of all media seen in the quest.
 */
export function getAllMediaFromQmm(qmmQuest: Quest) {
  const images: QmmMediaInfo = {};
  const tracks: QmmMediaInfo = {};
  const sounds: QmmMediaInfo = {};

  qmmQuest.params.forEach((p, pid) => {
    addSeenMedia(images, p.img, `Param p${pid}`);
    addSeenMedia(tracks, p.track, `Param p${pid}`);
    addSeenMedia(sounds, p.sound, `Param p${pid}`);
  });

  for (const l of qmmQuest.locations) {
    l.media.map((x) => x.img).forEach((x) => addSeenMedia(images, x, `Loc ${l.id}`));
    l.media.map((x) => x.track).forEach((x) => addSeenMedia(tracks, x, `Loc ${l.id}`));
    l.media.map((x) => x.sound).forEach((x) => addSeenMedia(sounds, x, `Loc ${l.id}`));

    l.paramsChanges.forEach((p, pid) => {
      l.media.map((x) => x.img).forEach((x) => addSeenMedia(images, x, `Loc ${l.id} p${pid + 1}`));
      l.media
        .map((x) => x.track)
        .forEach((x) => addSeenMedia(tracks, x, `Loc ${l.id} p${pid + 1}`));
      l.media
        .map((x) => x.sound)
        .forEach((x) => addSeenMedia(sounds, x, `Loc ${l.id} p${pid + 1}`));
    });
  }

  qmmQuest.jumps.forEach((j, jid) => {
    addSeenMedia(images, j.img, `Jump ${jid}`);
    addSeenMedia(tracks, j.track, `Jump ${jid}`);
    addSeenMedia(sounds, j.sound, `Jump ${jid}`);

    j.paramsChanges.forEach((p, pid) => {
      addSeenMedia(images, p.img, `Jump ${jid} p${pid}`);
      addSeenMedia(tracks, p.track, `Jump ${jid} p${pid}`);
      addSeenMedia(sounds, p.sound, `Jump ${jid} p${pid}`);
    });
  });

  return { images, tracks, sounds };
}
