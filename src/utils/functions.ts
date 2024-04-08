export function replaceNullWithEmptyString(obj: any) {
  const newObj = { ...obj }
  for (const key in newObj) {
    if (newObj[key] === null)
      newObj[key] = ''
  }
  return newObj
}
