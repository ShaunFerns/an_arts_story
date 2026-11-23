export const locationNames = {
  luas:'Broadstone–University', central:'Central Quad', east:'East Quad',
  library:'Academic Hub & Library', rathdown:'Rathdown House', lower:'Lower House',
  bradogue:'Bradogue', printmaking:'Printmaking Workshop', broadstoneTrail:'Broadstone Plaza',
  glass:'Glassmanogue', laurence:'St Laurence’s',
};

const aliases = {
  advisingform:'east', timetable:'central', exploration:'central',
  library2:'library', preparation:'library',
};

export function physicalPlace(place) {
  return aliases[place] ?? place;
}

export function scenePlace(id, scene, state) {
  if (id === 'ch0a' || id === 'ch0b') return 'luas';
  return physicalPlace(typeof scene.place === 'function' ? scene.place(state) : scene.place);
}
