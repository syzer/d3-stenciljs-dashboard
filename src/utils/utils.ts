import { applySpec, prop } from 'ramda'

export const nonZero = val =>
  val !== 0

export const renameLabels = applySpec({ // totalconfirmed to active cases
  'Active Cases': prop('TotalConfirmed'),
  'Total Deaths': prop('TotalDeaths'),
  'Total Recovered': prop('TotalRecovered')
})
