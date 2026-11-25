import { planSolar, SOLAR_SAMPLE } from './solarPlanner.js'

const draftKey = 'solar'

export function solarDraftInputs(input) {
  planSolar(input)
  return Object.fromEntries(Object.keys(SOLAR_SAMPLE).map(key => [
    key, key === 'exportMode' ? input[key] : Number(input[key]),
  ]))
}

function openDraftDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('rafiqy-local-drafts', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('drafts')
    request.onerror = () => reject(request.error)
    request.onblocked = () => reject(new Error('Draft storage is blocked.'))
    request.onsuccess = () => {
      const database = request.result
      database.onversionchange = () => database.close()
      resolve(database)
    }
  })
}

async function withDraftStore(mode, action) {
  const database = await openDraftDatabase()
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction('drafts', mode)
      transaction.onabort = () => reject(transaction.error ?? new Error('Draft operation aborted.'))
      const request = action(transaction.objectStore('drafts'))
      transaction.oncomplete = () => resolve(request.result)
    })
  } finally {
    database.close()
  }
}

export function saveSolarDraft(input) {
  const inputs = solarDraftInputs(input)
  return withDraftStore('readwrite', store => store.put(inputs, draftKey))
}

export async function loadSolarDraft() {
  const inputs = await withDraftStore('readonly', store => store.get(draftKey))
  return inputs === undefined ? null : solarDraftInputs(inputs)
}

export function deleteSolarDraft() {
  return withDraftStore('readwrite', store => store.delete(draftKey))
}
