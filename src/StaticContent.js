import japaneseTranslations from './Translations/japanese'
import englishTranslations from './Translations/english'

export const animals = {

}

const animalNames = {
  English: englishTranslations,
  Japanese: japaneseTranslations
}
function requireAll(r) {
  r.keys().forEach( a => {    
    const file = r(a)
    let rex = /\.\/Animals\/(?<animal>\w+)\/(?<arr>\w+)\//;
    const {animal, arr} = rex.exec(a).groups
    if (animals[animal] === undefined) {
      animals[animal] = { 
        id: animal.toLowerCase(), 
        thumbnails: [], 
        sounds: [],
        name(lang) { return animalNames[lang][this.id]?.reading ?? this.id}
      }
    }
    animals[animal][arr].push(file)
  }); 
  console.log(animals)
}

requireAll(require.context('./Animals/', true, /\.\/.*/));