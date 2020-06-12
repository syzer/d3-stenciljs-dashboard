import { Component, ComponentInterface, Host, h, Prop, State } from '@stencil/core'
import { ascend, descend, evolve, prop, sort, tap } from 'ramda'
import { find, propEq, pick, pickBy, pipe as _, keys, values } from 'ramda'

import { nonZero } from '../../utils/utils'

@Component({
  tag: 'table-chart-covid',
  styleUrl: 'table-chart-covid.css',
  shadow: true,
})
export class TableChartCovid implements ComponentInterface {

  @Prop()
  rowsPerPage: number

  @Prop()
  theme: { chartColors: string[] } = { chartColors: [] }

  @State()
  covidData: { Global: { NewConfirmed: number; TotalConfirmed: number; NewDeaths: number; TotalDeaths: number; NewRecovered: number; TotalRecovered: number }; Countries: { Country: string; CountryCode: string; Slug: string; NewConfirmed: number; TotalConfirmed: number; NewDeaths: number; TotalDeaths: number; NewRecovered: number; TotalRecovered: number; Date: string }[] } = {
    Global: {
      NewConfirmed: 118483,
      TotalConfirmed: 7458238,
      NewDeaths: 4838,
      TotalDeaths: 424227,
      NewRecovered: 79139,
      TotalRecovered: 3454156
    },
    Countries: [
      {
        Country: 'Afghanistan',
        CountryCode: 'AF',
        Slug: 'afghanistan',
        NewConfirmed: 683,
        TotalConfirmed: 22142,
        NewDeaths: 21,
        TotalDeaths: 405,
        NewRecovered: 362,
        TotalRecovered: 3013,
        Date: '2020-06-11T18:00:02Z'
      }]
  }

  @State()
  page: number = 1

  private totalPages: number

  @State()
  country: string = 'Global'

  @State()
  sortProp: string = 'TotalConfirmed'

  @State()
  sortOrder = 1

  private pieChartData: any

  componentWillLoad() {
    this.pieChartData = this.setChartData()
  }

  constructor() {
    fetch('https://api.covid19api.com/summary', {
      method: 'GET',
    }).then(e => e.json())
      .then(evolve({
        Countries: sort(descend(prop(this.sortProp)))
      }))
      .then(tap(console.log)) // TODO to global and props
      .then(covidData => this.covidData = covidData)
      .then(() =>
        this.totalPages = Math.floor(this.covidData.Countries.length / this.page))
  }

  onRowClick(event: UIEvent, country: string) {
    event.preventDefault()
    this.country = country
    this.pieChartData = this.setChartData()
  }

  onHeaderClick(headerName: string) {
    this.sortProp = headerName
    this.sortOrder = this.sortOrder * (-1)
  }

  getSortOrder() {
    return this.sortOrder === 1 ? descend : ascend
  }

  nextPage() {
    if (this.page <= this.totalPages) {
      this.page += 1
    }
  }

  previousPage() {
    if (this.page > 1) {
      this.page -= 1
    }
  }

  /* pie chart */
  getCountryPath(country: string) {
    return country === 'Global'
      ? prop('Global')
      : _(prop('Countries'), find(propEq('Country', country)))
  }

  getTitleFor(country: string): string {
    return country === 'Global'
      ? 'Overview'
      : country
  }

  onClearSelectedCountry() {
    this.pieChartData = {
      ...this.pieChartData,
      labels: _(
        pick(this.getImportantKeys()),
        keys
      )(this.covidData.Global),
      data: _(
        pick(this.getImportantKeys()),
        values
      )(this.covidData.Global)
    }
    this.country = 'Global'
  }

  getImportantKeys() {
    return ['TotalConfirmed', 'TotalDeaths', 'TotalRecovered']
  }

  setChartData() {
    return {
      pieChart: {
        labelFormat: 'ANY',
      },
      styles: {
        width: '100%',
        height: '300px',
        margin: '40px 0',
      },
      colors: this.theme.chartColors,
      labels: _(
        this.getCountryPath(this.country),
        pick(this.getImportantKeys()),
        pickBy(nonZero),
        keys,
      )(this.covidData),
      data: _(
        this.getCountryPath(this.country),
        pick(this.getImportantKeys()),
        pickBy(nonZero),
        values,
      )(this.covidData)
    }
  }

  render() {
    return (
      <Host>
        <div class='layout-wrapper'>
          <div class='row'>

            <div class='double-column'>
              <div class='left-column'>
                <div class='summary'>
                  <h1>COVID<sub>19</sub> Summary </h1>
                  <p> Over {/*this.totalConfirmed.toLocaleString()*/} cases confirmed.
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
                    et
                    dolore magna aliqua. Commodo elit at imperdiet dui accumsan sit amet.
                  </p>
                </div>
                <div id='table-wrapper'>
                  <table id='covid-table'>
                    <thead>
                    <tr>
                      <th
                        style={{ width: '30%' }}
                        onClick={() =>
                          this.onHeaderClick('Country')}>
                        Country
                      </th>
                      <th
                        onClick={() =>
                          this.onHeaderClick('TotalConfirmed')}>
                        Total Confirmed
                      </th>
                      <th
                        onClick={() =>
                          this.onHeaderClick('TotalDeaths')}>
                        Total Deaths
                      </th>
                      <th onClick={() =>
                        this.onHeaderClick('TotalRecovered')}>
                        Total Recovered
                      </th>
                    </tr>
                    </thead>

                    {this.covidData.Countries
                      .sort(this.getSortOrder()(prop(this.sortProp)))
                      .slice((this.page - 1) * this.rowsPerPage, this.rowsPerPage * this.page + this.rowsPerPage)
                      .map(row =>
                        <tr onClick={(event: UIEvent) => this.onRowClick(event, row.Country)} id={row.Country}>
                          <td>{row.Country}</td>
                          <td>{row.TotalConfirmed.toLocaleString()}</td>
                          <td>{row.TotalDeaths.toLocaleString()}</td>
                          <td>{row.TotalRecovered.toLocaleString()}</td>
                        </tr>)}
                  </table>
                </div>

                <div class='center'>
                  <div class='pagination'>
                    <a onClick={() => this.previousPage()}>Previous Page</a>
                    <a onClick={() => this.nextPage()}>Next Page</a>
                  </div>
                </div>

              </div>
            </div>

            <div class='column'>
              <div class='right-column'>
                <div id='chart-area'>
                  <h1>{this.getTitleFor(this.country)}</h1>
                  <pie-chart graphData={this.pieChartData}>
                    <tooltip-chart slot='tooltip'/>
                  </pie-chart>
                  <button
                    class='button'
                    onClick={() => this.onClearSelectedCountry()}>
                    Clean Selected Country
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class='row' id='footer'>
          <div class='card'>
            <div id='contact-us'>
              <span class='upper'>Contact us: + 41 123 123 123</span>
            </div>
          </div>
          <div class='copyright'>
            <span>© COVID19 Summary 2020</span>
          </div>
        </div>

      </Host>
    )
  }
}
